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

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
      next: {
        revalidate: MEDIA_REVALIDATE_SECONDS,
      },
    });

    if (!response.ok) {
      console.error(`NASA media error (${response.status}): ${url}`);
      return [];
    }

    const json = (await response.json()) as NasaMediaResponse;
    const items = json.collection?.items ?? [];
    return items.slice(0, limit);
  } catch (error) {
    console.error(`NASA media request failed for ${url}`, error);
    return [];
  }
}

export async function fetchNasaImages(query = "nebula", limit = 6) {
  return fetchMedia(query, ["image"], limit);
}

export async function fetchNasaVideos(query = "space", limit = 6) {
  return fetchMedia(query, ["video"], limit);
}

