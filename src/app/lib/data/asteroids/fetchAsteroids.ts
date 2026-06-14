import { retryFetch } from "../fetchWithRetry";
import { buildNasaUrl, getNasaUtcDate } from "../../nasa/api";


export async function fetchAsteroids({
  START_DATE = getNasaUtcDate(-1),
  END_DATE = getNasaUtcDate(1),
} = {}) {
  try {
    const url = buildNasaUrl("https://api.nasa.gov/neo/rest/v1/feed", {
      start_date: START_DATE,
      end_date: END_DATE,
    });

    const response = await retryFetch(
      url,
      {
        debugLabel: "asteroids-feed",
        fetchInit: {
          headers: {
            Accept: "application/json",
          },
          next: {
            revalidate: 3600,
          },
        },
      },
    );
    return await response.json();
  } catch (error) {
    console.error("Response Error:", error);
    return null;
  }
}

export function resolveAsteroidFeedSelection(
  feed: Record<string, unknown[] | undefined> | undefined,
  preferredDate = getNasaUtcDate(),
) {
  if (!feed) {
    return {
      resolvedDate: preferredDate,
      objects: [],
      fallbackUsed: false,
      sourceDateAvailable: false,
    };
  }

  if (Object.prototype.hasOwnProperty.call(feed, preferredDate)) {
    return {
      resolvedDate: preferredDate,
      objects: feed[preferredDate] ?? [],
      fallbackUsed: false,
      sourceDateAvailable: true,
    };
  }

  const fallbackDate =
    Object.keys(feed ?? {})
      .sort()
      .reverse()
      .find((date) => Array.isArray(feed[date])) ?? preferredDate;

  return {
    resolvedDate: fallbackDate,
    objects: feed[fallbackDate] ?? [],
    fallbackUsed: fallbackDate !== preferredDate,
    sourceDateAvailable: false,
  };
}
