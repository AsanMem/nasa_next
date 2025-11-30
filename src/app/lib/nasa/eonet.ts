import { fetchNasaJson, formatDubaiDate } from "./api";

const EONET_ENDPOINT = "https://eonet.gsfc.nasa.gov/api/v3/events";
const EONET_REVALIDATE_SECONDS = 60 * 30; // 30 minutes

export type EonetEventCategory = {
  id: number;
  title: string;
};

export type EonetGeometry = {
  date: string;
  type: string;
  coordinates: number[];
};

export type EonetEvent = {
  id: string;
  title: string;
  description?: string;
  link?: string;
  closed?: string | null;
  categories?: EonetEventCategory[];
  geometry?: EonetGeometry[];
  sources?: { id: string; url: string }[];
  formattedDate?: string;
};

type EonetApiResponse = {
  events: EonetEvent[];
};

export async function fetchOngoingEonetEvents(limit = 6): Promise<EonetEvent[]> {
  const response = await fetchNasaJson<EonetApiResponse>(EONET_ENDPOINT, {
    revalidate: EONET_REVALIDATE_SECONDS,
    includeApiKey: false,
    query: {
      status: "ongoing",
      limit,
      sort: "date",
      order: "desc",
    },
  });

  if (!response || !Array.isArray(response.events)) {
    return [];
  }

  return response.events.map((event) => ({
    ...event,
    formattedDate: event.geometry?.[0]?.date
      ? formatDubaiDate(event.geometry[0].date)
      : undefined,
  }));
}

