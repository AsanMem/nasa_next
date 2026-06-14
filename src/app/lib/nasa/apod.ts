import { fetchNasaJson, getNasaApiKeySource } from "./api";

const APOD_ENDPOINT = "https://api.nasa.gov/planetary/apod";
const APOD_REVALIDATE_SECONDS = 3600;

export type ApodItem = {
  date?: string;
  title?: string;
  explanation?: string;
  url?: string;
  hdurl?: string;
  media_type?: "image" | "video";
  thumbnail_url?: string;
  copyright?: string;
};

const APOD_FALLBACK: ApodItem = {
  date: "2024-01-01",
  title: "Astronomy Picture of the Day",
  explanation:
    "NASA's live Astronomy Picture of the Day feed is temporarily unavailable. This local fallback keeps the page available while the API key or upstream service is restored.",
  media_type: "image",
  url: "/media/main/1.optimized.webp",
};

function logApod(message: string) {
  if (process.env.NODE_ENV !== "production") {
    console.info(`[APOD] ${message}`);
  }
}

function isValidApodItem(item: ApodItem | null): item is ApodItem {
  return Boolean(item?.title && item?.media_type && (item?.url || item?.thumbnail_url));
}

export async function fetchApod(revalidate = APOD_REVALIDATE_SECONDS): Promise<ApodItem | null> {
  const keySource = getNasaApiKeySource();

  if (!keySource) {
    logApod("NASA_API_KEY is missing in production; using static fallback.");
    return APOD_FALLBACK;
  }

  const response = await fetchNasaJson<ApodItem>(APOD_ENDPOINT, {
    revalidate,
    query: {
      thumbs: "true",
    },
  });

  if (isValidApodItem(response)) {
    logApod(
      keySource === "DEMO_KEY"
        ? "Using NASA APOD data fetched with local development DEMO_KEY fallback."
        : `Using NASA APOD data fetched with ${keySource}.`,
    );
    return response;
  }

  logApod("NASA APOD fetch failed or returned invalid data; using static fallback.");
  return APOD_FALLBACK;
}
