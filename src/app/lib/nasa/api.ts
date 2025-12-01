const DEFAULT_REVALIDATE_SECONDS = 60 * 60; // 1 hour fallback
const DUBAI_TIME_ZONE = "Asia/Dubai";

const NASA_KEY_ENV_VARS = [
  "NASA_API_KEY",
  "APP_NASA_API_KEY",
  "NEXT_PUBLIC_NASA_API_KEY",
];

export function getNasaApiKey() {
  for (const key of NASA_KEY_ENV_VARS) {
    const value = process.env[key];
    if (value && value.trim().length > 0) {
      return value.trim();
    }
  }
  return "DEMO_KEY";
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

  if (includeApiKey && !url.searchParams.has("api_key")) {
    url.searchParams.set("api_key", getNasaApiKey());
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
      console.error(`JSON fetch failed (${response.status}): ${url}`);
      return null;
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.toLowerCase().includes("application/json")) {
      console.error(`Unexpected content-type "${contentType}" for ${url}`);
      return null;
    }

    try {
      const json =  (await response.json()) as T;
  //    console.log(url , json,"json")
      return json
    } catch (parseError) {
      console.error(`Failed to parse JSON from ${url}`, parseError);
      return null;
    }
  } catch (error) {
    console.error(`Request failed for ${url}`, error);
    return null;
  }
}

type FetchNasaOptions = {
  revalidate?: number;
  init?: RequestInit;
  includeApiKey?: boolean;
  query?: Record<string, string | number | undefined>;
};

export async function fetchNasaJson<T>(
  baseUrl: string,
  { revalidate, init, includeApiKey = true, query }: FetchNasaOptions = {},
): Promise<T | null> {
  const url = buildNasaUrl(baseUrl, query, { includeApiKey });
  return fetchJsonSafe<T>(url, revalidate ?? DEFAULT_REVALIDATE_SECONDS, init);
}

export function formatDubaiDateTime(
  dateInput: string | number | Date,
  options: Intl.DateTimeFormatOptions = {},
) {
  const date = new Date(dateInput);
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
