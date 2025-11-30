import { fetchNasaJson, formatDubaiDate } from "./api";

const TECHTRANSFER_BASE = "https://api.nasa.gov/techtransfer";
const TECHTRANSFER_REVALIDATE_SECONDS = 60 * 60 * 24; // 24 hours

export type TechTransferRawItem = Array<string | null>;

type TechTransferResponse = {
  count?: number;
  total?: number;
  results?: TechTransferRawItem[];
};

export type TechTransferItem = {
  title?: string | null;
  description?: string | null;
  application?: string | null;
  center?: string | null;
  reference?: string | null;
  patentNumber?: string | null;
  url?: string | null;
  imageUrl?: string | null;
  releaseDate?: string | null;
  releaseDateFormatted?: string;
  raw?: TechTransferRawItem;
};

function mapTechTransferItem(item: TechTransferRawItem): TechTransferItem {
  const [
    title,
    description,
    application,
    center,
    reference,
    patentNumber,
    url,
    imageUrl,
    releaseDate,
  ] = item;

  return {
    title,
    description,
    application,
    center,
    reference,
    patentNumber,
    url,
    imageUrl,
    releaseDate,
    releaseDateFormatted: releaseDate ? formatDubaiDate(releaseDate) : undefined,
    raw: item,
  };
}

async function fetchTechTransferCollection(path: string, limit: number) {
  const response = await fetchNasaJson<TechTransferResponse>(`${TECHTRANSFER_BASE}/${path}`, {
    revalidate: TECHTRANSFER_REVALIDATE_SECONDS,
    query: {
      engine: "",
    },
  });

  const items = response?.results ?? [];

  return items.slice(0, limit).map(mapTechTransferItem);
}

export async function fetchTechTransferPatents(limit = 6) {
  return fetchTechTransferCollection("patent/", limit);
}

export async function fetchTechTransferSoftware(limit = 6) {
  return fetchTechTransferCollection("software/", limit);
}

