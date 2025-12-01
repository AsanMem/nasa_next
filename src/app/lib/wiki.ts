const WIKIPEDIA_ENDPOINT = "https://en.wikipedia.org/w/api.php";
const WIKIPEDIA_REVALIDATE_SECONDS = 60 * 60; // 1 hour

export type WikiArticle = {
  id: number;
  title: string;
  extract: string;
  thumbnailUrl?: string;
  url: string;
};

type WikipediaPage = {
  pageid: number;
  title: string;
  extract?: string;
  thumbnail?: {
    source?: string;
  };
};

type WikipediaResponse = {
  query?: {
    pages?: Record<string, WikipediaPage>;
  };
};

export async function fetchWikipediaArticles(
  query: string,
  limit = 6,
): Promise<WikiArticle[]> {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) {
    return [];
  }

  const params = new URLSearchParams({
    action: "query",
    format: "json",
    origin: "*",
    prop: "pageimages|extracts",
    generator: "search",
    gsrsearch: normalizedQuery,
    gsrlimit: String(limit),
    exintro: "1",
    explaintext: "1",
    exsentences: "2",
    pithumbsize: "320",
  });

  const url = `${WIKIPEDIA_ENDPOINT}?${params.toString()}`;

  try {
    const response = await fetch(url, {
      next: {
        revalidate: WIKIPEDIA_REVALIDATE_SECONDS,
      },
    });

    if (!response.ok) {
      console.error(`Wikipedia API error (${response.status}): ${url}`);
      return [];
    }

    const json = (await response.json()) as WikipediaResponse;
    const pages = json.query?.pages;
    if (!pages) {
      return [];
    }

    return Object.values(pages)
      .filter((page): page is WikipediaPage => Boolean(page?.pageid && page?.title))
      .map((page) => ({
        id: page.pageid,
        title: page.title,
        extract: page.extract ?? "",
        thumbnailUrl: page.thumbnail?.source,
        url: `https://en.wikipedia.org/?curid=${page.pageid}`,
      }));
  } catch (error) {
    console.error(`Wikipedia request failed for ${url}`, error);
    return [];
  }
}

