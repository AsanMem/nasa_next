/** Geometric heliocentric vectors. One AU = 149597870.7 km; velocities use AU/day. */
export const AU_KM = 149597870.7;
export const DAY_MS = 86400000;
export type TrajectorySample = { utcMs: number; x: number; y: number; z: number; vx: number; vy: number; vz: number };
export type TrajectoryTrack = { id: string; name: string; samples: TrajectorySample[] };
export type TrajectoryWindow = { startUtcMs: number; endUtcMs: number; asteroid: TrajectoryTrack; target: TrajectoryTrack };
export type TrajectoryReady = {
  status: "ready"; version: 1; eventKey: string; body: string; encounterUtcMs: number;
  center: "Sun"; frame: "ECLIPJ2000"; unit: "AU"; velocityUnit: "AU/day";
  target: { neoId: string; spkId: string; name: string; solutionId: string | null; orbitEpochJd: number | null };
  overview: TrajectoryWindow; close: TrajectoryWindow;
  source: { name: "NASA/JPL Horizons"; url: string; retrievedAt: string; solutionId: string | null; apiVersion: string; timeConvention: string; neoWsSolutionId: string | null; neoWsOrbitEpochJd: number | null; warning?: string };
  validation: { method: "cubic-hermite-quarterpoints"; overviewToleranceKm: number; closeToleranceKm: number; overviewMaxErrorKm: number; closeMaxErrorKm: number; testedPoints: number };
};
export type TrajectoryPending = { status: "pending"; retryAfterMs: number; message: string };
export type TrajectoryUnavailable = { status: "unavailable"; reason: string; message: string; retryAfterMs?: number };
export type TrajectoryResponse = TrajectoryReady | TrajectoryPending | TrajectoryUnavailable;
export type VectorOutput = { x: number; y: number; z: number };

/** No extrapolation, allocation or WebGL dependency. The velocity derivative is in AU/day. */
export function sampleTrajectoryTrack(track: TrajectoryTrack, utcMs: number, position: VectorOutput, velocity?: VectorOutput): boolean {
  const samples = track.samples;
  if (!Number.isFinite(utcMs) || !samples.length || utcMs < samples[0].utcMs || utcMs > samples[samples.length - 1].utcMs) return false;
  let low = 0, high = samples.length - 1;
  while (low < high) { const middle = Math.ceil((low + high) / 2); if (samples[middle].utcMs <= utcMs) low = middle; else high = middle - 1; }
  const a = samples[low], b = samples[low + 1];
  if (a.utcMs === utcMs || !b) {
    position.x = a.x; position.y = a.y; position.z = a.z;
    if (velocity) { velocity.x = a.vx; velocity.y = a.vy; velocity.z = a.vz; }
    return true;
  }
  const duration = (b.utcMs - a.utcMs) / DAY_MS;
  if (!(duration > 0)) return false;
  const t = (utcMs - a.utcMs) / (b.utcMs - a.utcMs), t2 = t * t, t3 = t2 * t;
  const h00 = 2 * t3 - 3 * t2 + 1, h10 = t3 - 2 * t2 + t, h01 = -2 * t3 + 3 * t2, h11 = t3 - t2;
  position.x = h00 * a.x + h10 * duration * a.vx + h01 * b.x + h11 * duration * b.vx;
  position.y = h00 * a.y + h10 * duration * a.vy + h01 * b.y + h11 * duration * b.vy;
  position.z = h00 * a.z + h10 * duration * a.vz + h01 * b.z + h11 * duration * b.vz;
  if (velocity) {
    const d00 = (6 * t2 - 6 * t) / duration, d10 = 3 * t2 - 4 * t + 1, d01 = (-6 * t2 + 6 * t) / duration, d11 = 3 * t2 - 2 * t;
    velocity.x = d00 * a.x + d10 * a.vx + d01 * b.x + d11 * b.vx;
    velocity.y = d00 * a.y + d10 * a.vy + d01 * b.y + d11 * b.vy;
    velocity.z = d00 * a.z + d10 * a.vz + d01 * b.z + d11 * b.vz;
  }
  return true;
}

export function isTrajectoryReady(value: unknown): value is TrajectoryReady {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<TrajectoryReady>;
  const windowValid = (window: TrajectoryWindow | undefined) => {
    if (!window || !Number.isFinite(window.startUtcMs) || !Number.isFinite(window.endUtcMs) || window.endUtcMs <= window.startUtcMs) return false;
    if (!(typeof item.encounterUtcMs === "number" && item.encounterUtcMs >= window.startUtcMs && item.encounterUtcMs <= window.endUtcMs)) return false;
    if (!window.asteroid || !window.target || window.asteroid.samples?.length !== window.target.samples?.length || window.asteroid.id !== item.target?.spkId || window.asteroid.name !== item.target?.name || window.target.name !== item.body) return false;
    const ids: Record<string, string> = { Sun: "10", Mercury: "199", Venus: "299", Earth: "399", Moon: "301", Mars: "499", Jupiter: "599", Saturn: "699", Uranus: "799", Neptune: "899", Pluto: "999" };
    if (window.target.id !== ids[item.body ?? ""]) return false;
    return [window.asteroid, window.target].every(track => track && typeof track.id === "string" && typeof track.name === "string" && Array.isArray(track.samples) && track.samples.length >= 2 && track.samples.length <= 1025 && track.samples.some(sample => sample && sample.utcMs === item.encounterUtcMs) && track.samples.every((sample, index, rows) => sample && [sample.utcMs, sample.x, sample.y, sample.z, sample.vx, sample.vy, sample.vz].every(Number.isFinite) && (!index || sample.utcMs > rows[index - 1].utcMs) && sample.utcMs === window.asteroid.samples[index].utcMs) && track.samples[0].utcMs === window.startUtcMs && track.samples[track.samples.length - 1].utcMs === window.endUtcMs);
  };
  const proof = item.validation;
  return item.status === "ready" && item.version === 1 && item.frame === "ECLIPJ2000" && item.center === "Sun" && item.unit === "AU" && item.velocityUnit === "AU/day" && typeof item.eventKey === "string" && typeof item.body === "string" && Number.isFinite(item.encounterUtcMs) && Boolean(item.target && /^\d+$/.test(item.target.neoId) && /^\d+$/.test(item.target.spkId) && typeof item.target.solutionId === "string" && /^\d+$/.test(item.target.solutionId) && typeof item.target.orbitEpochJd === "number" && Number.isFinite(item.target.orbitEpochJd)) && windowValid(item.overview) && windowValid(item.close) && Boolean(item.source && item.source.name === "NASA/JPL Horizons" && item.source.url === "https://ssd.jpl.nasa.gov/horizons/" && Number.isFinite(Date.parse(item.source.retrievedAt)) && item.source.solutionId === item.target?.solutionId && ["1.0", "1.2", "1.3"].includes(item.source.apiVersion) && typeof item.source.timeConvention === "string") && Boolean(proof && proof.method === "cubic-hermite-quarterpoints" && proof.closeToleranceKm === 1 && proof.overviewToleranceKm === 1000 && [proof.closeMaxErrorKm, proof.overviewMaxErrorKm].every(value => Number.isFinite(value) && value >= 0) && proof.closeMaxErrorKm <= proof.closeToleranceKm && proof.overviewMaxErrorKm <= proof.overviewToleranceKm && Number.isInteger(proof.testedPoints) && proof.testedPoints >= 6);
}

