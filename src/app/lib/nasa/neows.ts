import { fetchNasaJson, formatDubaiDateTime, getNasaUtcDate } from "./api";

const NEOWS_ENDPOINT = "https://api.nasa.gov/neo/rest/v1/feed";
const NEOWS_REVALIDATE_SECONDS = 43200;

export type NeoCloseApproachData = {
  close_approach_date: string;
  close_approach_date_full?: string;
  relative_velocity?: {
    kilometers_per_second?: string;
  };
  miss_distance?: {
    kilometers?: string;
  };
  orbiting_body?: string;
};

export type NeoObject = {
  id: string;
  name: string;
  nasa_jpl_url?: string;
  absolute_magnitude_h?: number;
  estimated_diameter?: {
    kilometers?: {
      estimated_diameter_min?: number;
      estimated_diameter_max?: number;
    };
  };
  is_potentially_hazardous_asteroid?: boolean;
  close_approach_data?: NeoCloseApproachData[];
};

type NeoFeedResponse = {
  near_earth_objects: Record<string, NeoObject[]>;
};

export type NeoFeedItem = {
  id: string;
  name: string;
  hazard: boolean;
  closeApproachTime?: string;
  velocityKmPerSec?: string;
  missDistanceKm?: string;
  url?: string;
  summary?: string;
  dataDate?: string;
};

export async function fetchTodayNeoFeed(): Promise<NeoFeedItem[]> {
  const today = getNasaUtcDate();
  const yesterday = getNasaUtcDate(-1);

  const response = await fetchNasaJson<NeoFeedResponse>(NEOWS_ENDPOINT, {
    revalidate: NEOWS_REVALIDATE_SECONDS,
    query: {
      start_date: yesterday,
      end_date: today,
    },
  });

  if (!response) {
    return [];
  }

  const feed = response.near_earth_objects ?? {};
  const dataDate =
    feed[today]?.length ? today : Object.keys(feed).sort().reverse().find((date) => feed[date]?.length) ?? today;
  const objects = feed[dataDate] ?? [];

  return objects
    .filter((object) => object.is_potentially_hazardous_asteroid)
    .map((object) => {
      const closeApproach = object.close_approach_data?.[0];
      const closeDate =
        closeApproach?.close_approach_date_full ?? closeApproach?.close_approach_date;
      const velocity = closeApproach?.relative_velocity?.kilometers_per_second;
      const missDistance = closeApproach?.miss_distance?.kilometers;
      const missDistanceRounded = missDistance ? missDistance.split(".")[0] : undefined;

      let summary: string | undefined;
      if (velocity && missDistanceRounded) {
        summary = `Velocity ${parseFloat(velocity).toFixed(2)} km/s · Miss ${missDistanceRounded} km`;
      } else if (velocity) {
        summary = `Velocity ${parseFloat(velocity).toFixed(2)} km/s`;
      } else if (missDistanceRounded) {
        summary = `Miss distance ${missDistanceRounded} km`;
      }

      return {
        id: object.id,
        name: object.name,
        hazard: Boolean(object.is_potentially_hazardous_asteroid),
        closeApproachTime: closeDate
          ? formatDubaiDateTime(closeDate, {
              hour: "2-digit",
              minute: "2-digit",
            })
          : undefined,
        velocityKmPerSec: closeApproach?.relative_velocity?.kilometers_per_second,
        missDistanceKm: closeApproach?.miss_distance?.kilometers,
        url: object.nasa_jpl_url,
        summary,
        dataDate,
      };
    });
}
