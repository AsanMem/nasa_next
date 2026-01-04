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

function buildEpicImageUrl(image: string, date: string) {
  // date: "2025-07-15 03:48:07"
  const d = new Date(date.replace(" ", "T") + "Z"); // безопасно в UTC

  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");

  return `https://epic.gsfc.nasa.gov/archive/natural/${year}/${month}/${day}/jpg/${image}.jpg`;
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
    imageUrl: item.image && item.date ? buildEpicImageUrl(item.image, item.date) : undefined,
  }));
}

