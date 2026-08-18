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

export async function fetchJsonSafe<T>(
  url: string,
  revalidateSeconds = DEFAULT_REVALIDATE_SECONDS,
  init?: RequestInit,
): Promise<T | null> {
  try {
    const response = await fetch(url, {
      ...(init ?? {}),
      headers: {
        Accept: "application/json",
        ...(init?.headers ?? {}),
      },
      next: {
        revalidate: revalidateSeconds,
      },
    });

    if (!response.ok) {
      console.error(`NASA JSON fetch failed (${response.status}).`);
      return null;
    }

    const contentType = response.headers.get("content-type") ?? "";
   
   
    const rawText = await response.text();
    const looksLikeJson = /^[\s]*[\[{]/.test(rawText);

    if (!contentType.toLowerCase().includes("json") && !looksLikeJson) {
      console.error(`Unexpected content-type "${contentType}" for ${url}`);
   
  
      return null;
    }

    try {
      const json = JSON.parse(rawText) as T;
      return json
    } catch (parseError) {
      console.error("Failed to parse NASA JSON response.", parseError);
      return null;
    }
  } catch (error) {
    console.error("NASA JSON request failed.", error);
    return null;
  }
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
  revalidate?: number;
  init?: RequestInit;
  signal?: AbortSignal; 
  includeApiKey?: boolean;
  query?: Record<string, string | number | undefined>;
};

export async function fetchNasaJson<T>(
  baseUrl: string,
  { revalidate, init, signal, includeApiKey = true, query }: FetchNasaOptions = {},
): Promise<T | null> {
  const url = buildNasaUrl(baseUrl, query, { includeApiKey });


  const mergedInit: RequestInit | undefined =
    signal ? { ...(init ?? {}), signal } : init;

  return fetchJsonSafe<T>(url, revalidate ?? DEFAULT_REVALIDATE_SECONDS, mergedInit);
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
