export type Approach = {
  key: string; date: string; body: string; speed: number | null;
  distance: number | null; lunar: number | null;
  /** Exact NASA epoch milliseconds; null when only a calendar day is available. */
  utcMs?: number | null;
  timePrecision?: "epoch" | "minute" | "date";
};
export type OrbitSolution = { id: string | null; epochJd: number | null; periodDays: number | null; uncertainty: string | null; determinedAt: string | null; designation: string | null;
  elements: { semiMajorAxisAu: number | null; eccentricity: number | null; inclinationDeg: number | null; ascendingNodeDeg: number | null; perihelionArgumentDeg: number | null; meanAnomalyDeg: number | null; meanMotionDegPerDay: number | null; equinox: string | null } };
export type Asteroid = {
  id: string; name: string; minDiameter: number | null; maxDiameter: number | null;
  diameter: number | null; hazardous: boolean | null; sentry: boolean | null;
  approaches: Approach[]; orbit: [string, string][]; jplUrl: string | null;
  orbitSolution?: OrbitSolution;
};
type RecordValue = Record<string, unknown>;
const record = (value: unknown): RecordValue => value && typeof value === "object" ? value as RecordValue : {};
export function measurement(value: unknown): number | null {
  if (typeof value !== "number" && typeof value !== "string") return null;
  if (typeof value === "string" && !value.trim()) return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}
export function validDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const time = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value;
}
/** NeoWs' full timestamp is English-month text in UTC, never a browser-local Date parse. */
export function approachMoment(event: RecordValue): { utcMs: number | null; timePrecision: "epoch" | "minute" | "date" } {
  const epoch = typeof event.epoch_date_close_approach === "number" || (typeof event.epoch_date_close_approach === "string" && event.epoch_date_close_approach.trim()) ? Number(event.epoch_date_close_approach) : NaN;
  if (Number.isFinite(epoch) && Number.isFinite(new Date(epoch).getTime()) && new Date(epoch).toISOString().slice(0, 10) === event.close_approach_date) return { utcMs: epoch, timePrecision: "epoch" };
  const full = typeof event.close_approach_date_full === "string" ? /^(\d{4})-([A-Za-z]{3})-(\d{2}) (\d{2}):(\d{2})$/.exec(event.close_approach_date_full) : null;
  if (full) {
    const month = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"].indexOf(full[2].toLowerCase());
    const year = Number(full[1]), day = Number(full[3]), hour = Number(full[4]), minute = Number(full[5]);
    const utcMs = Date.UTC(year, month, day, hour, minute), parsed = new Date(utcMs);
    if (month >= 0 && hour < 24 && minute < 60 && parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month && parsed.getUTCDate() === day && parsed.toISOString().slice(0, 10) === event.close_approach_date) return { utcMs, timePrecision: "minute" };
  }
  return { utcMs: null, timePrecision: "date" };
}
export function toAsteroid(raw: unknown): Asteroid | null {
  const item = record(raw);
  if (typeof item.id !== "string" || !/^\d+$/.test(item.id)) return null;
  const meters = record(record(item.estimated_diameter).meters);
  const low = measurement(meters.estimated_diameter_min);
  const high = measurement(meters.estimated_diameter_max);
  const rangeValid = low !== null && high !== null && low > 0 && high >= low;
  const approaches = (Array.isArray(item.close_approach_data) ? item.close_approach_data : []).flatMap((rawEvent, index): Approach[] => {
    const event = record(rawEvent);
    if (!validDate(event.close_approach_date)) return [];
    const miss = record(event.miss_distance);
    const distance = measurement(miss.kilometers);
    const body = typeof event.orbiting_body === "string" ? event.orbiting_body : "Unknown body";
    const moment = approachMoment(event);
    return [{ key: `${event.close_approach_date}-${body}-${index}`, date: event.close_approach_date, body,
      ...moment,
      speed: measurement(record(event.relative_velocity).kilometers_per_second), distance,
      lunar: measurement(miss.lunar) ?? (distance === null ? null : distance / 384400) }];
  }).sort((a, b) => a.date.localeCompare(b.date));
  const orbital = record(item.orbital_data);
  const fieldText = (value: unknown) => typeof value === "string" && value.trim() ? value.trim() : typeof value === "number" && Number.isFinite(value) ? String(value) : null;
  const signed = (value: unknown) => (typeof value === "number" || typeof value === "string" && value.trim()) && Number.isFinite(Number(value)) ? Number(value) : null;
  const orbitSolution: OrbitSolution = { id: fieldText(orbital.orbit_id), epochJd: measurement(orbital.epoch_osculation), periodDays: measurement(orbital.orbital_period), uncertainty: fieldText(orbital.orbit_uncertainty), determinedAt: fieldText(orbital.orbit_determination_date), designation: fieldText(item.designation), elements: { semiMajorAxisAu: signed(orbital.semi_major_axis), eccentricity: measurement(orbital.eccentricity), inclinationDeg: signed(orbital.inclination), ascendingNodeDeg: signed(orbital.ascending_node_longitude), perihelionArgumentDeg: signed(orbital.perihelion_argument), meanAnomalyDeg: signed(orbital.mean_anomaly), meanMotionDegPerDay: signed(orbital.mean_motion), equinox: fieldText(orbital.equinox) } };
  const orbit: [string, string][] = Object.entries(orbital).flatMap(([key, value]) => {
    if (value === null || value === undefined) return [];
    if (typeof value === "object") return Object.entries(record(value)).map(([child, text]): [string, string] => [child.replace(/_/g, " "), String(text)]);
    return [[key.replace(/_/g, " "), String(value)] as [string, string]];
  });
  orbit.unshift(["Absolute magnitude (H)", measurement(item.absolute_magnitude_h)?.toString() ?? "Unknown"]);
  let jplUrl: string | null = null;
  try { const url = new URL(String(item.nasa_jpl_url)); if (url.hostname === "ssd.jpl.nasa.gov" && ["http:", "https:"].includes(url.protocol)) { url.protocol = "https:"; jplUrl = url.href; } } catch { /* Missing source link. */ }
  return { id: item.id, name: typeof item.name === "string" ? item.name : `Asteroid ${item.id}`,
    minDiameter: rangeValid ? low : null, maxDiameter: rangeValid ? high : null,
    diameter: rangeValid ? (low + high) / 2 : null,
    hazardous: typeof item.is_potentially_hazardous_asteroid === "boolean" ? item.is_potentially_hazardous_asteroid : null,
    sentry: typeof item.is_sentry_object === "boolean" ? item.is_sentry_object : null,
    approaches, orbit, orbitSolution, jplUrl };
}
export function selectApproach(events: Approach[], requested: unknown, today: string): Approach | null {
  const earth = events.filter(event => event.body.toLowerCase() === "earth").sort((a, b) => a.date.localeCompare(b.date));
  if (validDate(requested)) {
    const exact = earth.find(event => event.date === requested) ?? events.find(event => event.date === requested);
    if (exact) return exact;
  }
  return earth.find(event => event.date >= today) ?? earth[earth.length - 1] ?? null;
}
export type CatalogEntry = { asteroid: Asteroid; event: Approach | null };
export function nextEarthEncounter(events: Approach[], selected: Approach | null): Approach | null {
  if (!selected) return null;
  return [...events].filter(event => event.body.toLowerCase() === "earth" && event.date > selected.date)
    .sort((a,b) => a.date.localeCompare(b.date))[0] ?? null;
}
export type HistoryFilter = "all" | "past" | "upcoming";
export function filterEncounters(events: Approach[], filter: HistoryFilter, today: string) {
  return events.filter(event => filter === "all" || (filter === "past" ? event.date < today : event.date >= today));
}
export type SortField = "distance" | "diameter" | "speed";
export function sortCatalog(entries: CatalogEntry[], field: SortField): CatalogEntry[] {
  const value = (entry: CatalogEntry) => field === "diameter" ? entry.asteroid.diameter : entry.event?.[field];
  return [...entries].sort((a, b) => (value(a) ?? Infinity) - (value(b) ?? Infinity) || a.asteroid.name.localeCompare(b.asteroid.name));
}
export const asteroidHref = (id: string, date?: string) => `/asteroids/${encodeURIComponent(id)}/view${validDate(date) ? `?date=${date}` : ""}`;
export const numberLabel = (value: number | null | undefined, digits = 1) => value == null ? "Unknown" : new Intl.NumberFormat("en-US", { maximumFractionDigits: digits }).format(value);
export const dateLabel = (date?: string) => validDate(date) ? new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`)) : "Unknown date";
export const classification = (value: boolean | null) => value === null ? "Classification unknown" : value ? "Potentially hazardous · NASA classification" : "Not classified as potentially hazardous";
