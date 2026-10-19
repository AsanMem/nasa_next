import { AU_KM, DAY_MS, isTrajectoryReady, sampleTrajectoryTrack, type TrajectoryReady, type TrajectoryResponse, type TrajectorySample, type TrajectoryTrack, type TrajectoryWindow } from "../trajectory";
import type { Approach, Asteroid } from "../view-model";
import { JplBusyError, TrajectoryStoreError, readTrajectoryCache, writeTrajectoryCache, withJplLease } from "./trajectory-cache";
import { randomUUID } from "node:crypto";

const VERSION = "trajectory-v2";
const JPL_ROOT = "https://ssd.jpl.nasa.gov/api/";
const USER_AGENT = "Orbital/0.1 (+https://nasa-odisey.web.app/privacy)";
const EARLIEST = Date.UTC(1600, 0, 1), LATEST = Date.UTC(2500, 0, 1) - 1;
const MAX_SAMPLES = 1025, REQUEST_SAMPLES = 48;
type JsonObject = Record<string, unknown>;
type LookupTarget = { spkId: string; name: string };
type VectorBlock = { samples: TrajectorySample[]; solutionId: string | null; orbitEpochJd: number | null; apiVersion: string };
type Deadline = { deadlineUtcMs?: number };
type Dependencies = {
  read: (key: string, options?: Deadline) => Promise<unknown | null>; write: (key: string, value: unknown, options?: Deadline) => Promise<void>;
  lease: <T>(work: () => Promise<T>, options?: Deadline) => Promise<T>; fetch?: typeof fetch; now?: () => number;
};
const object = (value: unknown): JsonObject => value && typeof value === "object" ? value as JsonObject : {};
const canonical = (value: string) => value.replace(/\s+/g, " ").trim();
export class JplTrajectoryError extends Error {
  constructor(public reason: string, public retryAfterSeconds = 60) { super("JPL trajectory data is temporarily unavailable."); this.name = "JplTrajectoryError"; }
}
class BudgetPending extends Error { constructor() { super("Continue preparing the ephemeris."); } }

export function parseLookup(value: unknown, neoId: string): LookupTarget {
  const raw = object(value), signature = object(raw.signature);
  if (signature.version !== "1.1" || signature.source !== "NASA/JPL Horizons Lookup API" || Number(raw.count) !== 1 || !Array.isArray(raw.result) || raw.result.length !== 1) throw new JplTrajectoryError("lookup-unresolved");
  const result = object(raw.result[0]);
  if (typeof result.spkid !== "string" || !/^\d{1,12}$/.test(result.spkid) || typeof result.name !== "string" || !result.name.trim() || typeof result.type !== "string" || !/^asteroid\b/i.test(result.type)) throw new JplTrajectoryError("lookup-invalid");
  const aliases = Array.isArray(result.alias) ? result.alias : [];
  if (result.spkid !== neoId && !aliases.includes(neoId)) throw new JplTrajectoryError("lookup-identity-mismatch");
  return { spkId: result.spkid, name: canonical(result.name) };
}

export function horizonsUrl(command: string, times: number[]) {
  if (!/^(?:DES=\d{1,12};|\d{1,4})$/.test(command) || !times.length || times.length > REQUEST_SAMPLES || times.some((time, index) => !Number.isFinite(time) || time < EARLIEST || time > LATEST || (index > 0 && time <= times[index - 1]))) throw new JplTrajectoryError("invalid-request", 0);
  const url = new URL(`${JPL_ROOT}horizons.api`);
  url.searchParams.set("format", "json");
  for (const [key, value] of Object.entries({ COMMAND: command, OBJ_DATA: "YES", MAKE_EPHEM: "YES", EPHEM_TYPE: "VECTORS", CENTER: "500@10", REF_PLANE: "ECLIPTIC", REF_SYSTEM: "ICRF", VEC_CORR: "NONE", OUT_UNITS: "AU-D", VEC_TABLE: "2", CSV_FORMAT: "YES", TIME_TYPE: "UT", TIME_DIGITS: "FRACSEC", CAL_TYPE: "GREGORIAN", TLIST_TYPE: "JD" })) url.searchParams.set(key, `'${value}'`);
  url.searchParams.set("TLIST", times.map(time => `'${(time / DAY_MS + 2440587.5).toFixed(10)}'`).join(" "));
  // Use the documented %20 spelling, and stay below conservative URL limits.
  const encoded = url.href.replace(/\+/g, "%20");
  if (encoded.length > 1800) throw new JplTrajectoryError("oversize-request", 0);
  return encoded;
}

export function horizonsUniformUrl(command: string, start: number, end: number, intervals = 256) {
  if (!Number.isInteger(intervals) || intervals < 1 || intervals > 1024 || (end - start) / intervals < 500) throw new JplTrajectoryError("invalid-request", 0);
  const url = new URL(horizonsUrl(command, [start, end]));
  url.searchParams.delete("TLIST"); url.searchParams.delete("TLIST_TYPE");
  url.searchParams.set("START_TIME", `'JD${(start / DAY_MS + 2440587.5).toFixed(10)}'`);
  url.searchParams.set("STOP_TIME", `'JD${(end / DAY_MS + 2440587.5).toFixed(10)}'`);
  url.searchParams.set("STEP_SIZE", `'${intervals}'`);
  return url.href.replace(/\+/g, "%20");
}

export function parseHorizons(value: unknown, times: number[], expectedName: string): VectorBlock {
  const raw = object(value), signature = object(raw.signature);
  if (!["1.0", "1.2", "1.3"].includes(String(signature.version)) || signature.source !== "NASA/JPL Horizons API" || raw.error || typeof raw.result !== "string" || raw.result.length > 4_000_000) throw new JplTrajectoryError("invalid-ephemeris");
  const text = raw.result;
  if (!/Center body name:\s*Sun\s*\(10\)/.test(text) || !/Reference frame\s*:\s*Ecliptic of J2000\.0/.test(text) || !/Output units\s*:\s*AU-D/.test(text) || !/Output type\s*:\s*GEOMETRIC/.test(text) || !/^\s*JDUT\s*,/m.test(text)) throw new JplTrajectoryError("incompatible-frame");
  const name = canonical(text.match(/Target body name:\s*([^\n{]+)/)?.[1] ?? "");
  if (name !== expectedName && !name.startsWith(`${expectedName} (`)) throw new JplTrajectoryError("target-mismatch");
  const start = text.indexOf("$$SOE"), end = text.indexOf("$$EOE", start + 5);
  if (start < 0 || end < 0) throw new JplTrajectoryError("missing-vectors");
  const rows = text.slice(start + 5, end).trim().split(/\r?\n/).filter(row => row.trim());
  if (rows.length !== times.length) throw new JplTrajectoryError("incomplete-vectors");
  const samples = rows.map((row, index): TrajectorySample => {
    const columns = row.split(",").map(column => column.trim());
    const number = (field: string | undefined) => field && /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[EeDd][+-]?\d+)?$/.test(field) ? Number(field.replace(/[Dd]/g, "E")) : NaN;
    const jd = number(columns[0]), values = columns.slice(2, 8).map(number);
    if (columns.length < 8 || values.length !== 6 || !values.every(Number.isFinite) || !Number.isFinite(jd) || Math.abs((jd - 2440587.5) * DAY_MS - times[index]) > 2 || values.slice(0, 3).some(value => Math.abs(value) > 10000) || values.slice(3).some(value => Math.abs(value) > 100)) throw new JplTrajectoryError("invalid-vectors");
    return { utcMs: times[index], x: values[0], y: values[1], z: values[2], vx: values[3], vy: values[4], vz: values[5] };
  });
  const epoch = Number(text.match(/\bEPOCH=\s*([\d.]+)/)?.[1]);
  return { samples, solutionId: text.match(/Target body name:[^\n]*\{source:\s*JPL#([^}\s]+)/)?.[1] ?? null, orbitEpochJd: Number.isFinite(epoch) ? epoch : null, apiVersion: String(signature.version) };
}

const BODY_IDS: Record<string, { id: string; name: string }> = {
  sun: { id: "10", name: "Sun" }, mercury: { id: "199", name: "Mercury" }, venus: { id: "299", name: "Venus" }, earth: { id: "399", name: "Earth" }, moon: { id: "301", name: "Moon" }, mars: { id: "499", name: "Mars" }, jupiter: { id: "599", name: "Jupiter" }, saturn: { id: "699", name: "Saturn" }, uranus: { id: "799", name: "Uranus" }, neptune: { id: "899", name: "Neptune" }, pluto: { id: "999", name: "Pluto" },
};
export const trajectoryBody = (name: string) => BODY_IDS[name.trim().toLowerCase()] ?? null;
const sampleValid = (value: unknown): value is TrajectorySample => {
  const row = object(value);
  return [row.utcMs, row.x, row.y, row.z, row.vx, row.vy, row.vz].every(value => typeof value === "number" && Number.isFinite(value));
};
const sameSamples = (value: unknown, times: number[]): value is VectorBlock => {
  const raw = object(value);
  return ["1.0", "1.2", "1.3"].includes(String(raw.apiVersion)) && (raw.orbitEpochJd === null || typeof raw.orbitEpochJd === "number" && Number.isFinite(raw.orbitEpochJd)) && Array.isArray(raw.samples) && raw.samples.length === times.length && raw.samples.every((sample, index) => sampleValid(sample) && sample.utcMs === times[index]);
};

export function trajectoryRanges(encounterUtcMs: number, periodDays: number | null | undefined, distanceKm?: number | null, speedKmPerSec?: number | null) {
  const durationDays = Number.isFinite(periodDays) && (periodDays ?? 0) > 0 ? Math.min(3652.5, periodDays!) : 730;
  const measured = typeof distanceKm === "number" && Number.isFinite(distanceKm) && distanceKm >= 0 && typeof speedKmPerSec === "number" && Number.isFinite(speedKmPerSec) && speedKmPerSec > 0;
  const halfClose = measured ? Math.max(6 * 3600000, Math.min(30 * DAY_MS, 2 * distanceKm! / speedKmPerSec! * 1000)) : 7 * DAY_MS;
  return {
    overview: { start: Math.max(EARLIEST, Math.round(encounterUtcMs - durationDays * DAY_MS / 2)), end: Math.min(LATEST, Math.round(encounterUtcMs + durationDays * DAY_MS / 2)) },
    close: { start: Math.max(EARLIEST, Math.round(encounterUtcMs - halfClose)), end: Math.min(LATEST, Math.round(encounterUtcMs + halfClose)) },
  };
}

export function createTrajectoryService(dependencies: Dependencies) {
  const request = dependencies.fetch ?? fetch, clock = dependencies.now ?? Date.now;
  async function get(asteroid: Asteroid, event: Approach, options: { deadlineUtcMs?: number } = {}): Promise<TrajectoryResponse> {
    if (!/^\d{1,12}$/.test(asteroid.id) || event.utcMs == null || !Number.isFinite(event.utcMs)) return { status: "unavailable", reason: "missing-time", message: "This record has no exact encounter time. Its date and NASA figures remain available below." };
    const instant = event.utcMs, body = trajectoryBody(event.body);
    if (!body) return { status: "unavailable", reason: "unsupported-body", message: "A verified trajectory for this encounter body is not available. The NASA record remains available below." };
    if (instant < EARLIEST || instant > LATEST) return { status: "unavailable", reason: "unsupported-date", message: "This date is outside the supported JPL trajectory interval (1600–2499)." };
    const ranges = trajectoryRanges(instant, asteroid.orbitSolution?.periodDays, event.distance, event.speed);
    const solution = asteroid.orbitSolution;
    const identity = `${VERSION}:${asteroid.id}:${solution?.id ?? "unknown"}:${solution?.epochJd ?? "unknown"}`;
    const key = `${identity}:${body.id}:${instant}:${ranges.overview.start}:${ranges.overview.end}:${ranges.close.start}:${ranges.close.end}`;
    const began = clock(), hardDeadline = Math.min(began + 55_000, Number.isFinite(options.deadlineUtcMs) ? options.deadlineUtcMs! : Infinity);
    const softDeadline = Math.min(began + 30_000, hardDeadline), storeOptions = { deadlineUtcMs: hardDeadline };
    const read = (cacheKey: string) => dependencies.read(cacheKey, storeOptions);
    const write = (cacheKey: string, value: unknown) => dependencies.write(cacheKey, value, storeOptions);
    let horizonSolution: string | null = null, horizonEpoch: number | null = null, apiVersion = "", testedPoints = 0, generation = "initial";
    const budget = () => { if (clock() >= softDeadline || hardDeadline - clock() < 13_000) throw new BudgetPending(); };
    try {
      const savedGeneration = object(await read(`${key}:generation`));
      if (typeof savedGeneration.token === "string" && /^[a-z0-9-]{1,40}$/.test(savedGeneration.token)) generation = savedGeneration.token;
      const manifest = object(await read(`${key}:manifest`));
      const ready = typeof manifest.trajectoryKey === "string" && manifest.trajectoryKey.startsWith(`${key}:horizons:${generation}:`) ? await read(manifest.trajectoryKey) : null;
      if (isTrajectoryReady(ready) && ready.eventKey === event.key && ready.target.neoId === asteroid.id && ready.encounterUtcMs === instant && ready.body === body.name && manifest.trajectoryKey === `${key}:horizons:${generation}:${ready.target.solutionId}:${ready.target.orbitEpochJd}`) return ready;

      const json = async <T>(cacheKey: string, valid: (raw: unknown) => raw is T, url: string, parse: (raw: unknown) => T): Promise<T> => {
        const cached = await read(cacheKey);
        if (valid(cached)) return cached;
        budget();
        const execute = () => dependencies.lease(async () => {
          // Recheck after acquisition: another instance may have filled the cache.
          const shared = await read(cacheKey);
          if (valid(shared)) return shared;
          budget();
          const timeout = Math.min(18_000, hardDeadline - clock() - 12_000);
          if (timeout < 1000) throw new BudgetPending();
          const controller = new AbortController(), timer = setTimeout(() => controller.abort(), timeout);
          let parsed: T;
          try {
            const response = await request(url, { headers: { "User-Agent": USER_AGENT, Accept: "application/json" }, signal: controller.signal, cache: "no-store", redirect: "error" });
            if (!response.ok) {
              const retry = Number(response.headers.get("retry-after"));
              throw new JplTrajectoryError(response.status === 429 ? "upstream-rate-limit" : "upstream-unavailable", Number.isFinite(retry) && retry > 0 ? Math.min(300, retry) : 60);
            }
            if (Number(response.headers.get("content-length")) > 4_000_000) throw new JplTrajectoryError("oversize-response");
            const text = await response.text();
            if (text.length > 4_000_000) throw new JplTrajectoryError("oversize-response");
            let value: unknown;
            try { value = JSON.parse(text); } catch { throw new JplTrajectoryError("invalid-json"); }
            parsed = parse(value);
          } catch (error) {
            if (error instanceof JplTrajectoryError || error instanceof BudgetPending) throw error;
            throw new JplTrajectoryError("upstream-timeout-or-network");
          } finally { clearTimeout(timer); }
          // Keep the lease until persistence completes, so waiters cannot duplicate a call.
          await write(cacheKey, parsed);
          return parsed;
        }, storeOptions);
        try { return await execute(); }
        catch (error) {
          if (!(error instanceof JplBusyError) || error.retryAfterSeconds > 1) throw error;
          budget();
          await new Promise(resolve => setTimeout(resolve, 700));
          budget();
          return execute();
        }
      };

      const lookupKey = `${identity}:lookup`;
      const lookupUrl = new URL(`${JPL_ROOT}horizons_lookup.api`);
      lookupUrl.searchParams.set("sstr", asteroid.id); lookupUrl.searchParams.set("group", "ast");
      const target = await json(lookupKey, (value): value is LookupTarget => { const row = object(value); return typeof row.spkId === "string" && /^\d{1,12}$/.test(row.spkId) && typeof row.name === "string" && Boolean(row.name); }, lookupUrl.href, raw => parseLookup(raw, asteroid.id));

      const known = new Map<string, Map<number, TrajectorySample>>();
      const uniformTimes = new Set<number>();
      const gridTime = (value: number) => {
        const rounded = Math.round(value);
        if (rounded === instant || uniformTimes.has(rounded)) return rounded;
        // Keep the actual uniform sample instant when nested rounding differs
        // by a millisecond; never relabel a vector or shift the exact encounter.
        for (const offset of [-1, 1]) if (uniformTimes.has(rounded + offset)) return rounded + offset;
        return rounded;
      };
      const remember = (command: string, validated: VectorBlock) => {
        if (command.startsWith("DES=")) {
          if (!validated.solutionId || validated.orbitEpochJd === null || !Number.isFinite(validated.orbitEpochJd)) throw new JplTrajectoryError("missing-orbit-solution");
          if (horizonSolution && horizonSolution !== validated.solutionId || horizonEpoch !== null && horizonEpoch !== validated.orbitEpochJd) throw new JplTrajectoryError("orbit-solution-changed");
          horizonSolution = validated.solutionId; horizonEpoch = validated.orbitEpochJd; apiVersion = validated.apiVersion;
        }
        let memory = known.get(command);
        if (!memory) { memory = new Map(); known.set(command, memory); }
        for (const row of validated.samples) memory.set(row.utcMs, row);
      };
      const uniformSeed = async (command: string, name: string, start: number, end: number) => {
        if (command === "10" || (end - start) / 256 < 500) return;
        const times = Array.from({ length: 257 }, (_, index) => Math.round(start + (end - start) * index / 256));
        const seedKey = `${identity}:uniform:${generation}:${command}:${start}:${end}:256`;
        const block = await json(seedKey, (value): value is VectorBlock => sameSamples(value, times), horizonsUniformUrl(command, start, end), raw => parseHorizons(raw, times, name));
        remember(command, block);
        for (const time of times) uniformTimes.add(time);
      };
      const samples = async (command: string, name: string, times: number[]): Promise<TrajectorySample[]> => {
        if (command === "10") return times.map(utcMs => ({ utcMs, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 }));
        let memory = known.get(command);
        if (!memory) { memory = new Map(); known.set(command, memory); }
        const missing = times.filter(time => !memory!.has(time));
        for (let offset = 0; offset < missing.length; offset += REQUEST_SAMPLES) {
          const batch = missing.slice(offset, offset + REQUEST_SAMPLES), blockKey = `${identity}:vectors:${generation}:${command}:${batch.join(",")}`;
          const validated = await json(blockKey, (value): value is VectorBlock => sameSamples(value, batch), horizonsUrl(command, batch), raw => parseHorizons(raw, batch, name));
          remember(command, validated);
        }
        return times.map(time => memory!.get(time)!);
      };

      const initialNodes = (start: number, end: number, intervals: number) => Array.from(new Set([...Array.from({ length: intervals + 1 }, (_, index) => gridTime(start + (end - start) * index / intervals)), instant])).sort((a, b) => a - b);
      const checkedTimes = (nodes: number[]) => [...nodes, ...nodes.slice(0, -1).flatMap((time, index) => [.25, .5, .75].map(fraction => gridTime(time + (nodes[index + 1] - time) * fraction)))];
      // Short uniform queries carry full grids without long URL time lists. All
      // later checks still use real independent quarter points and exact time.
      for (const [command, name] of [[`DES=${target.spkId};`, target.name], [body.id, body.name]]) {
        await uniformSeed(command, name, ranges.close.start, ranges.close.end);
        await uniformSeed(command, name, ranges.overview.start, ranges.overview.end);
      }
      const initialTimes = Array.from(new Set([...checkedTimes(initialNodes(ranges.close.start, ranges.close.end, 16)), ...checkedTimes(initialNodes(ranges.overview.start, ranges.overview.end, 64))])).sort((a, b) => a - b);
      await samples(`DES=${target.spkId};`, target.name, initialTimes);
      await samples(body.id, body.name, initialTimes);

      const window = async (start: number, end: number, toleranceKm: number, intervals: number): Promise<{ window: TrajectoryWindow; maxErrorKm: number }> => {
        let nodes = initialNodes(start, end, intervals);
        for (let round = 0; round < 7; round++) {
          budget();
          const checks = nodes.slice(0, -1).flatMap((time, index) => [.25, .5, .75].map(fraction => gridTime(time + (nodes[index + 1] - time) * fraction)));
          const times = Array.from(new Set([...nodes, ...checks])).sort((a, b) => a - b);
          const asteroidRows = await samples(`DES=${target.spkId};`, target.name, times);
          const targetRows = await samples(body!.id, body!.name, times);
          const asteroidMap = new Map(asteroidRows.map(row => [row.utcMs, row])), targetMap = new Map(targetRows.map(row => [row.utcMs, row]));
          const rock: TrajectoryTrack = { id: target.spkId, name: target.name, samples: nodes.map(time => asteroidMap.get(time)!) };
          const planet: TrajectoryTrack = { id: body!.id, name: body!.name, samples: nodes.map(time => targetMap.get(time)!) };
          const additions: number[] = [], p = { x: 0, y: 0, z: 0 }, v = { x: 0, y: 0, z: 0 };
          let maxErrorKm = 0;
          for (let index = 0; index < nodes.length - 1; index++) {
            let failed = false;
            for (const fraction of [.25, .5, .75]) {
              const time = gridTime(nodes[index] + (nodes[index + 1] - nodes[index]) * fraction);
              for (const pair of [[rock, asteroidMap], [planet, targetMap]] as const) {
                const actual = pair[1].get(time)!;
                if (!sampleTrajectoryTrack(pair[0], time, p, v)) throw new JplTrajectoryError("interpolation-failed");
                const errorKm = Math.hypot(p.x - actual.x, p.y - actual.y, p.z - actual.z) * AU_KM;
                const velocityError = Math.hypot(v.x - actual.vx, v.y - actual.vy, v.z - actual.vz) * AU_KM / 86400;
                maxErrorKm = Math.max(maxErrorKm, errorKm); testedPoints++;
                if (errorKm > toleranceKm || velocityError > (toleranceKm === 1 ? .001 : .01)) failed = true;
              }
            }
            if (failed) additions.push(gridTime((nodes[index] + nodes[index + 1]) / 2));
          }
          if (!additions.length) return { window: { startUtcMs: start, endUtcMs: end, asteroid: rock, target: planet }, maxErrorKm };
          const next = Array.from(new Set([...nodes, ...additions])).sort((a, b) => a - b);
          if (next.length > MAX_SAMPLES || next.length === nodes.length) throw new JplTrajectoryError("resolution-limit");
          nodes = next;
        }
        throw new JplTrajectoryError("resolution-limit");
      };

      const close = await window(ranges.close.start, ranges.close.end, 1, 16);
      const overview = await window(ranges.overview.start, ranges.overview.end, 1000, 64);
      const warning = solution?.id && horizonSolution && solution.id !== horizonSolution ? "JPL's orbit solution differs from this NASA snapshot. Their predictions may differ." : undefined;
      const response: TrajectoryReady = {
        status: "ready", version: 1, eventKey: event.key, body: body.name, encounterUtcMs: instant,
        center: "Sun", frame: "ECLIPJ2000", unit: "AU", velocityUnit: "AU/day",
        target: { neoId: asteroid.id, spkId: target.spkId, name: target.name, solutionId: horizonSolution, orbitEpochJd: horizonEpoch },
        close: close.window, overview: overview.window,
        source: { name: "NASA/JPL Horizons", url: "https://ssd.jpl.nasa.gov/horizons/", retrievedAt: new Date(clock()).toISOString(), solutionId: horizonSolution, neoWsSolutionId: solution?.id ?? null, neoWsOrbitEpochJd: solution?.epochJd ?? null, apiVersion, timeConvention: "UT: UTC from 1962, UT1 before 1962; future UTC follows JPL's leap-second assumptions.", ...(warning ? { warning } : {}) },
        validation: { method: "cubic-hermite-quarterpoints", overviewToleranceKm: 1000, closeToleranceKm: 1, overviewMaxErrorKm: overview.maxErrorKm, closeMaxErrorKm: close.maxErrorKm, testedPoints },
      };
      if (!isTrajectoryReady(response)) throw new JplTrajectoryError("incomplete-validation");
      const actualKey = `${key}:horizons:${generation}:${horizonSolution}:${horizonEpoch}`;
      await write(actualKey, response);
      await write(`${key}:manifest`, { trajectoryKey: actualKey });
      return response;
    } catch (error) {
      if (error instanceof JplTrajectoryError && error.reason === "orbit-solution-changed") {
        // A live JPL update can otherwise leave incompatible partial blocks cached for 24h.
        // Advance this request's namespace; orphaned public blocks expire normally.
        try { await write(`${key}:generation`, { token: randomUUID() }); }
        catch (storeError) { if (storeError instanceof JplBusyError) return { status: "pending", retryAfterMs: 3000, message: "Preparing verified JPL positions…" }; return { status: "unavailable", reason: "shared-cache-unavailable", message: "Calculated flybys are unavailable right now. You can still read the encounter records.", retryAfterMs: 30000 }; }
        return { status: "pending", retryAfterMs: 3000, message: "JPL updated the orbit solution. Preparing a consistent trajectory…" };
      }
      if (error instanceof JplBusyError || error instanceof BudgetPending) return { status: "pending", retryAfterMs: error instanceof JplBusyError ? Math.max(1000, error.retryAfterSeconds * 1000) : 3000, message: "Preparing verified JPL positions…" };
      if (error instanceof TrajectoryStoreError) return { status: "unavailable", reason: "shared-cache-unavailable", message: "Calculated flybys are unavailable right now. You can still read the encounter records.", retryAfterMs: 30000 };
      console.warn("[JPL]", { outcome: error instanceof JplTrajectoryError ? error.reason : "unavailable" });
      return { status: "unavailable", reason: error instanceof JplTrajectoryError ? error.reason : "unavailable", message: "Calculated flybys are unavailable right now. You can still read the encounter records.", retryAfterMs: error instanceof JplTrajectoryError ? error.retryAfterSeconds * 1000 : 60000 };
    }
  }
  return { get };
}

export const getVerifiedTrajectory = createTrajectoryService({ read: readTrajectoryCache, write: writeTrajectoryCache, lease: withJplLease }).get;
