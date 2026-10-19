import { createHash, randomUUID } from "node:crypto";

// Public ephemerides only. This module must never be imported by a client component.
const DAY = 86_400_000;
const LEASE_MS = 90_000; // Every upstream HTTP call has a separate, shorter hard timeout.
const MAX_BYTES = 800_000;
type JsonRecord = Record<string, unknown>;
export type StoreDeadline = { deadlineUtcMs?: number };
type FirestoreDocument = { fields?: Record<string, { stringValue?: string; timestampValue?: string }>; updateTime?: string };
type Options = {
  projectId: string; fetch?: typeof fetch; token: () => Promise<string>; now?: () => number;
  uuid?: () => string; endpoint?: string;
};
export class TrajectoryStoreError extends Error {
  constructor(message = "The shared ephemeris cache is unavailable.") { super(message); this.name = "TrajectoryStoreError"; }
}
export class JplBusyError extends Error {
  constructor(public retryAfterSeconds = 4) { super("Another ephemeris request is in progress."); this.name = "JplBusyError"; }
}
function object(value: unknown): JsonRecord { return value && typeof value === "object" ? value as JsonRecord : {}; }
function timestamp(value?: { timestampValue?: string }): number { return value?.timestampValue ? Date.parse(value.timestampValue) : 0; }
const stamp = (value: number) => ({ timestampValue: new Date(value).toISOString() });

/** Exported factory lets protocol tests exercise independent instances with one shared REST store. */
export function createTrajectoryStore(options: Options) {
  if (!/^[a-z][a-z0-9-]{4,62}$/.test(options.projectId)) throw new TrajectoryStoreError("Invalid Firestore project.");
  const request = options.fetch ?? fetch, clock = options.now ?? Date.now;
  const root = `${options.endpoint ?? "https://firestore.googleapis.com"}/v1/projects/${options.projectId}/databases/(default)/documents`;
  let serverOffset = 0;
  const now = () => clock() + serverOffset;
  async function rest(path: string, init: RequestInit = {}, deadlineUtcMs?: number) {
    const remaining = () => deadlineUtcMs == null ? 6000 : Math.min(6000, deadlineUtcMs - clock());
    if (remaining() < 2100) throw new JplBusyError(3);
    try {
      const token = await options.token();
      if (remaining() <= 0) throw new JplBusyError(3);
      const response = await request(`${root}/${path}`, { ...init, cache: "no-store", signal: AbortSignal.timeout(Math.max(1, Math.floor(remaining()))),
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...init.headers } });
      const date = response.headers.get("date");
      if (date && Number.isFinite(Date.parse(date))) serverOffset = Date.parse(date) - clock();
      if (![200, 201, 404, 409, 412].includes(response.status)) throw new TrajectoryStoreError();
      return response;
    } catch (error) { if (error instanceof JplBusyError || error instanceof TrajectoryStoreError) throw error; if (deadlineUtcMs != null && clock() >= deadlineUtcMs) throw new JplBusyError(3); throw new TrajectoryStoreError(); }
  }
  const cachePath = (key: string) => `orbital_ephemerides/${createHash("sha256").update(key).digest("hex")}`;
  async function read(key: string, requestOptions: StoreDeadline = {}): Promise<unknown | null> {
    const response = await rest(cachePath(key), {}, requestOptions.deadlineUtcMs);
    if (response.status === 404) return null;
    if (!response.ok) throw new TrajectoryStoreError();
    const doc = await response.json() as FirestoreDocument, fields = doc.fields;
    const created = timestamp(fields?.createdAt), expires = timestamp(fields?.expiresAt);
    if (!created || created > now() + 60_000 || expires <= now() || expires - created > DAY + 1000) return null;
    try { return JSON.parse(fields?.payload?.stringValue ?? ""); } catch { return null; }
  }
  async function write(key: string, value: unknown, requestOptions: StoreDeadline = {}) {
    const payload = JSON.stringify(value);
    if (!payload || Buffer.byteLength(payload, "utf8") > MAX_BYTES) throw new TrajectoryStoreError("Ephemeris cache entry is too large.");
    const current = now();
    const response = await rest(cachePath(key), { method: "PATCH", body: JSON.stringify({ fields: {
      payload: { stringValue: payload }, createdAt: stamp(current), expiresAt: stamp(current + DAY),
    } }) }, requestOptions.deadlineUtcMs);
    if (!response.ok) throw new TrajectoryStoreError();
  }
  async function withLease<T>(work: () => Promise<T>, requestOptions: StoreDeadline = {}): Promise<T> {
    const path = "orbital_ephemeris_control/jpl", response = await rest(path, {}, requestOptions.deadlineUtcMs);
    if (response.status !== 404 && !response.ok) throw new TrajectoryStoreError();
    const doc = response.status === 404 ? null : await response.json() as FirestoreDocument;
    const blockedUntil = Math.max(timestamp(doc?.fields?.expiresAt), timestamp(doc?.fields?.nextRequestAt));
    if (blockedUntil > now()) throw new JplBusyError(Math.max(1, Math.min(4, Math.ceil((blockedUntil - now()) / 1000))));
    const owner = (options.uuid ?? randomUUID)();
    const precondition = doc?.updateTime ? `currentDocument.updateTime=${encodeURIComponent(doc.updateTime)}` : "currentDocument.exists=false";
    const acquired = await rest(`${path}?${precondition}`, { method: "PATCH", body: JSON.stringify({ fields: {
      owner: { stringValue: owner }, expiresAt: stamp(now() + LEASE_MS), nextRequestAt: stamp(now()),
    } }) }, requestOptions.deadlineUtcMs);
    if (acquired.status === 409 || acquired.status === 412) throw new JplBusyError();
    if (!acquired.ok) throw new TrajectoryStoreError();
    const lease = await acquired.json() as FirestoreDocument;
    if (!lease.updateTime) throw new TrajectoryStoreError();
    let backoff = 0;
    try {
      if (requestOptions.deadlineUtcMs != null && clock() >= requestOptions.deadlineUtcMs) throw new JplBusyError(3);
      return await work();
    }
    catch (error) {
      // Upstream adapters can request a shared cooldown for 429/503/timeouts.
      const seconds = object(error).retryAfterSeconds;
      backoff = typeof seconds === "number" && Number.isFinite(seconds) ? Math.min(300, Math.max(0, seconds)) * 1000 : 1000;
      throw error;
    } finally {
      // CAS prevents an expired worker from unlocking a lease acquired by another instance.
      try {
        await rest(`${path}?currentDocument.updateTime=${encodeURIComponent(lease.updateTime)}`, { method: "PATCH", body: JSON.stringify({ fields: {
          owner: { stringValue: "" }, expiresAt: stamp(0), nextRequestAt: stamp(now() + Math.max(550, backoff)),
        } }) }, requestOptions.deadlineUtcMs);
      } catch { /* Failed release stays leased until expiry; never proceed without the lock. */ }
    }
  }
  async function check() {
    const key = `health:${(options.uuid ?? randomUUID)()}`, value = { publicEphemerisCache: true };
    // A read alone does not establish create/update IAM permission.
    await write(key, value);
    await write(key, { ...value, updated: true });
    const result = await read(key);
    if (object(result).publicEphemerisCache !== true || object(result).updated !== true) throw new TrajectoryStoreError();
    return { project: options.projectId, cache: "read-write", clientRulesRequired: false };
  }
  return { read, write, withLease, check };
}

let token: { value: string; expires: number } | undefined;
let tokenRequest: Promise<string> | undefined;
async function workloadToken(): Promise<string> {
  if (token && token.expires > Date.now() + 60_000) return token.value;
  if (tokenRequest) return tokenRequest;
  tokenRequest = (async () => {
    try {
      const response = await fetch("http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token", {
        headers: { "Metadata-Flavor": "Google" }, cache: "no-store", signal: AbortSignal.timeout(2000),
      });
      if (!response.ok || response.headers.get("metadata-flavor")?.toLowerCase() !== "google") throw new TrajectoryStoreError();
      const data = object(await response.json());
      if (typeof data.access_token !== "string" || typeof data.expires_in !== "number" || data.expires_in <= 0) throw new TrajectoryStoreError();
      token = { value: data.access_token, expires: Date.now() + Math.min(data.expires_in, 3600) * 1000 };
      return token.value;
    } catch { throw new TrajectoryStoreError("Server identity for the shared ephemeris cache is unavailable."); }
  })();
  try { return await tokenRequest; } finally { tokenRequest = undefined; }
}
function configuration() {
  if (typeof window !== "undefined") throw new TrajectoryStoreError();
  const projectId = process.env.GOOGLE_CLOUD_PROJECT ?? process.env.GCLOUD_PROJECT ?? "nasa-odisey";
  const emulator = process.env.FIRESTORE_EMULATOR_HOST;
  if (emulator) {
    // Explicit local QA only. Never accept an emulator override on a deployed Firebase runtime.
    if (process.env.K_SERVICE || process.env.FUNCTION_TARGET || !/^(127\.0\.0\.1|localhost):\d{2,5}$/.test(emulator)) throw new TrajectoryStoreError();
    return createTrajectoryStore({ projectId, endpoint: `http://${emulator}`, token: async () => "owner" });
  }
  return createTrajectoryStore({ projectId, token: workloadToken });
}
let store: ReturnType<typeof createTrajectoryStore> | undefined;
const shared = () => store ?? (store = configuration());
export const readTrajectoryCache = (key: string, options?: StoreDeadline) => shared().read(key, options);
export const writeTrajectoryCache = (key: string, value: unknown, options?: StoreDeadline) => shared().write(key, value, options);
export const withJplLease = <T>(work: () => Promise<T>, options?: StoreDeadline): Promise<T> => shared().withLease(work, options);
export const checkTrajectoryStore = () => shared().check();
