import { buildNasaUrl, fetchNasaJson } from "./api";

const EPIC_ENDPOINT = "https://api.nasa.gov/EPIC/api/natural/images";
const EPIC_ARCHIVE_BASE = "https://api.nasa.gov/EPIC/archive/natural";
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

export function getEpicImageUrl(image: string, date: string) {
  const dateObj = new Date(date);
  const year = dateObj.getUTCFullYear();
  const month = String(dateObj.getUTCMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getUTCDate()).padStart(2, "0");
  const path = `${EPIC_ARCHIVE_BASE}/${year}/${month}/${day}/jpg/${image}.jpg`;
  return buildNasaUrl(path);
}

export async function fetchEpicImages(limit = 4): Promise<EpicImage[]> {
  const response = await fetchNasaJson<EpicImage[]>(EPIC_ENDPOINT, {
    revalidate: EPIC_REVALIDATE_SECONDS,
  });

  if (!response) {
    return [];
  }

  return response.slice(0, limit).map((item) => ({
    ...item,
    imageUrl: item.image && item.date ? getEpicImageUrl(item.image, item.date) : undefined,
  }));
}

