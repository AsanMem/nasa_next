import { fetchNasaJson, getNasaUtcDate } from "../../nasa/api";
import { formatUtcDate } from "../../utils";

export const ASTEROIDS_REVALIDATE_SECONDS = 60 * 60;

export type AsteroidsFeed = {
  element_count?: number;
  near_earth_objects?: Record<string, any[]>;
};

export async function fetchAsteroids({
  START_DATE = formatUtcDate(),
  END_DATE = formatUtcDate(),
} = {}): Promise<AsteroidsFeed | null> {
  return fetchNasaJson<AsteroidsFeed>("https://api.nasa.gov/neo/rest/v1/feed", {
    revalidate: ASTEROIDS_REVALIDATE_SECONDS,
    query: { start_date: START_DATE, end_date: END_DATE },
  });
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
