import { fetchJsonSafe } from "./api";

const MEDIA_ENDPOINT = "https://images-api.nasa.gov/search";
const MEDIA_REVALIDATE_SECONDS = 60 * 60 * 6; // 6 hours

type NasaMediaAsset = {
  href?: string;
  data?: Array<{
    nasa_id?: string;
    title?: string;
    description?: string;
    media_type?: string;
    date_created?: string;
    keywords?: string[];
  }>;
  links?: Array<{
    href?: string;
    rel?: string;
    render?: string;
  }>;
};

type NasaMediaResponse = {
  collection?: {
    items?: NasaMediaAsset[];
  };
};

type MediaType = "image" | "video";

async function fetchMedia(
  query: string,
  mediaType: MediaType[],
  limit = 6,
): Promise<NasaMediaAsset[]> {
  const searchParams = new URLSearchParams({
    q: query,
    media_type: mediaType.join(","),
    page: "1",
  });

  const url = `${MEDIA_ENDPOINT}?${searchParams.toString()}`;

  const response = await fetchJsonSafe<NasaMediaResponse>(url, MEDIA_REVALIDATE_SECONDS);
  const items = response?.collection?.items ?? [];
  return items.slice(0, limit);
}

export async function fetchNasaImages(query = "nebula", limit = 6) {
  return fetchMedia(query, ["image"], limit);
}

export async function fetchNasaVideos(query = "space", limit = 6) {
  return fetchMedia(query, ["video"], limit);
}
