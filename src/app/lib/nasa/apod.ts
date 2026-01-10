import { fetchNasaJson } from "./api";

const APOD_ENDPOINT = "https://api.nasa.gov/planetary/apod";
const APOD_REVALIDATE_SECONDS = 60 * 60 * 6; // 6 hours

export type ApodItem = {
  date?: string;
  title?: string;
  explanation?: string;
  url?: string;
  hdurl?: string;
  media_type?: "image" | "video";
  thumbnail_url?: string;
};

export async function fetchApod(): Promise<ApodItem | null> {
  return fetchNasaJson<ApodItem>(APOD_ENDPOINT, {
    revalidate: APOD_REVALIDATE_SECONDS,
    query: {
      thumbs: "true",
    },
  });
}




