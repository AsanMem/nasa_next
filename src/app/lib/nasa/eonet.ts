import { fetchNasaJson, formatDubaiDate } from "./api";

const EONET_ENDPOINT = "https://eonet.gsfc.nasa.gov/api/v3/events";
const EONET_REVALIDATE_SECONDS = 43200;

export type EonetEventCategory = {
  id: number;
  title: string;
};

export type EonetGeometry = {
  date: string;
  type: string;
  coordinates: unknown;
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
    init: {
      headers: {
        Accept: "application/json",
      },
    },
    query: {
      status: "open",
      limit,
      sort: "date",
      order: "desc",
    },
  });

  if (!response || !Array.isArray(response.events)) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[EONET] JSON events response was unavailable or invalid; returning an empty event list.");
    }
    return [];
  }

  return response.events.map((event) => ({
    ...event,
    formattedDate: event.geometry?.[0]?.date
      ? formatDubaiDate(event.geometry[0].date)
      : undefined,
  }));
}
