const DEFAULT_REVALIDATE_SECONDS = 43200;
const DUBAI_TIME_ZONE = "Asia/Dubai";

let warnedAboutMissingNasaKey = false;

export type NasaApiKeySource = "NASA_API_KEY" | "DEMO_KEY";

export function getNasaApiKeySource(): NasaApiKeySource | undefined {
  if (process.env.NASA_API_KEY?.trim()) {
    return "NASA_API_KEY";
  }

  if (!warnedAboutMissingNasaKey) {
    warnedAboutMissingNasaKey = true;
    console.warn(
      "NASA API key is not configured. Set NASA_API_KEY for server-side NASA API requests.",
    );
  }

  if (process.env.NODE_ENV !== "production") {
    return "DEMO_KEY";
  }

  return undefined;
}

export function getNasaApiKey() {
  const source = getNasaApiKeySource();

  if (!source) {
    return undefined;
  }

  if (source === "DEMO_KEY") {
    return "DEMO_KEY";
  }

  return process.env[source]?.trim();
}

export function buildNasaUrl(
  base: string,
  query: Record<string, string | number | undefined> = {},
  { includeApiKey = true }: { includeApiKey?: boolean } = {},
) {
  const url = new URL(base);

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }
    url.searchParams.set(key, String(value));
  });

  const apiKey = includeApiKey ? getNasaApiKey() : undefined;
  if (apiKey && !url.searchParams.has("api_key")) {
    url.searchParams.set("api_key", apiKey);
  }

  return url.toString();
}

export type NasaOutcome = "ok" | "empty" | "authorization" | "rate-limit" | "unavailable" | "invalid-data";
export type NasaResult<T> = { data: T | null; outcome: NasaOutcome; status?: number };

function serviceName(url: string) {
  try {
    const { hostname, pathname } = new URL(url);
    if (hostname === "api.nasa.gov" && pathname.startsWith("/planetary/apod")) return "APOD";
    if (hostname === "science.nasa.gov" && pathname.startsWith("/wp-json/wp/v2/image-article")) return "APOD";
    if (hostname === "api.nasa.gov" && pathname.startsWith("/neo/")) return "NeoWs";
    if (hostname === "ccmc.gsfc.nasa.gov" || pathname.startsWith("/DONKI/")) return "DONKI";
    if (hostname === "epic.gsfc.nasa.gov") return "EPIC";
    if (hostname === "eonet.gsfc.nasa.gov") return "EONET";
  } catch { /* Never log untrusted URLs. */ }
  return "NASA";
}

export async function fetchJsonResult<T>(
  url: string,
  revalidateSeconds = DEFAULT_REVALIDATE_SECONDS,
  init?: RequestInit,
  validate?: (value: unknown) => boolean,
): Promise<NasaResult<T>> {
  const controller = new AbortController();
  const abort = () => controller.abort();
  const timer = setTimeout(abort, 15000);
  init?.signal?.addEventListener("abort", abort, { once: true });
  if (init?.signal?.aborted) abort();
  const result = (outcome: NasaOutcome, data: T | null = null, status?: number): NasaResult<T> => {
    // Allowlisted labels only: no URLs, response bodies or raw Error objects.
    if (outcome !== "ok") console.warn("[NASA]", { service: serviceName(url), outcome, status });
    return { data, outcome, status };
  };
  try {
    const headers = new Headers(init?.headers);
    if (!headers.has("Accept")) headers.set("Accept", "application/json");
    const response = await fetch(url, {
      ...(init ?? {}),
      headers,
      signal: controller.signal,
      next: {
        revalidate: revalidateSeconds,
      },
    });

    if (!response.ok) {
      return result(response.status === 401 || response.status === 403 ? "authorization" : response.status === 429 ? "rate-limit" : "unavailable", null, response.status);
    }

    const rawText = await response.text();
    if (!rawText.trim()) return result("empty", null, response.status);
    try {
      const json: unknown = JSON.parse(rawText);
      if (json === null) return result("empty", null, response.status);
      if (typeof json !== "object" || (validate && !validate(json))) return result("invalid-data", null, response.status);
      return result(Array.isArray(json) && !json.length ? "empty" : "ok", json as T, response.status);
    } catch {
      return result("invalid-data", null, response.status);
    }
  } catch {
    return result("unavailable");
  } finally {
    clearTimeout(timer);
    init?.signal?.removeEventListener("abort", abort);
  }
}

export async function fetchJsonSafe<T>(url: string, revalidateSeconds = DEFAULT_REVALIDATE_SECONDS, init?: RequestInit, validate?: (value: unknown) => boolean): Promise<T | null> {
  return (await fetchJsonResult<T>(url, revalidateSeconds, init, validate)).data;
}

export function getNasaUtcDate(daysFromToday = 0) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + daysFromToday);

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


type FetchNasaOptions = {
  validate?: (value: unknown) => boolean;
  revalidate?: number;
  init?: RequestInit;
  signal?: AbortSignal; 
  includeApiKey?: boolean;
  query?: Record<string, string | number | undefined>;
};

export async function fetchNasaJson<T>(
  baseUrl: string,
  { revalidate, init, signal, includeApiKey = true, query, validate }: FetchNasaOptions = {},
): Promise<T | null> {
  const url = buildNasaUrl(baseUrl, query, { includeApiKey });


  const mergedInit: RequestInit | undefined =
    signal ? { ...(init ?? {}), signal } : init;

  return fetchJsonSafe<T>(url, revalidate ?? DEFAULT_REVALIDATE_SECONDS, mergedInit, validate);
}

export function formatDubaiDateTime(
  dateInput: string | number | Date,
  options: Intl.DateTimeFormatOptions = {},
) {
  const date = new Date(dateInput);
  
  if (isNaN(date.getTime())) {
    return undefined;
  }
  
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: DUBAI_TIME_ZONE,
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    ...options,
  });

  return formatter.format(date);
}

export function formatDubaiDate(
  dateInput: string | number | Date,
  options: Intl.DateTimeFormatOptions = {},
) {
  const date = new Date(dateInput);

    if (isNaN(date.getTime())) {
    return undefined;
  }
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: DUBAI_TIME_ZONE,
    year: "numeric",
    month: "long",
    day: "2-digit",
    ...options,
  });

  return formatter.format(date);
}

export function formatDubaiTime(
  dateInput: string | number | Date,
  options: Intl.DateTimeFormatOptions = {},
) {
  const date = new Date(dateInput);
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: DUBAI_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    ...options,
  });

  return formatter.format(date);
}
