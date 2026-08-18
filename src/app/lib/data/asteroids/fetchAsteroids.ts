import { fetchNasaJson } from "../../nasa/api";
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
