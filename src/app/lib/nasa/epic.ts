import { fetchNasaJson } from "./api";

const EPIC_ENDPOINT = "https://epic.gsfc.nasa.gov/api/natural";
const EPIC_REVALIDATE_SECONDS = 60 * 60 * 6; // 6 hours

export type EpicImage = {
  identifier?: string;
  caption?: string;
  image?: string;
  version?: string;
  date?: string;
  coords?: {
    centroid_coordinates?: { lat: number; lon: number };
    dscovr_j2000_position?: Record<string, unknown>;
    lunar_j2000_position?: Record<string, unknown>;
    sun_j2000_position?: Record<string, unknown>;
  };
  imageUrl?: string;
};

const EPIC_FALLBACK_IMAGE: EpicImage = {
  identifier: "local-epic-fallback",
  caption: "EPIC Earth image temporarily unavailable",
  image: "local-epic-fallback",
  date: "2024-01-01 00:00:00",
  imageUrl: "/media/main/1.jpg",
};

function buildEpicEndpoint(date?: string) {
  return date ? `${EPIC_ENDPOINT}/date/${date}` : EPIC_ENDPOINT;
}

function buildEpicImageUrl(image: string, date: string) {
  // date: "2025-07-15 03:48:07"
  const d = new Date(date.replace(" ", "T") + "Z"); // безопасно в UTC

  if (Number.isNaN(d.getTime())) {
    return undefined;
  }

  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");

  return `https://epic.gsfc.nasa.gov/archive/natural/${year}/${month}/${day}/jpg/${image}.jpg`;
}

export async function fetchEpicImages(limit = 4, date?: string): Promise<EpicImage[]> {
  const response = await fetchNasaJson<EpicImage[]>(buildEpicEndpoint(date), {
    revalidate: EPIC_REVALIDATE_SECONDS,
    includeApiKey: false,
    init: {
      headers: {
        Accept: "application/json",
      },
    },
  });

  if (!Array.isArray(response) || response.length === 0) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[EPIC] Metadata fetch failed or returned no images; using static fallback.");
    }
    return [EPIC_FALLBACK_IMAGE];
  }

  const images = response
    .slice(0, limit)
    .map((item) => ({
      ...item,
      imageUrl: item.image && item.date ? buildEpicImageUrl(item.image, item.date) : undefined,
    }))
    .filter((item) => item.imageUrl);

  return images.length ? images : [EPIC_FALLBACK_IMAGE];
}
