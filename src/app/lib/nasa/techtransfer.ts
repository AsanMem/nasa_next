import { fetchJsonSafe, formatDubaiDate } from "./api";
import { sanitizePlainText } from "../utils/text";

const TECHTRANSFER_PATENT_ENDPOINT = "https://technology.nasa.gov/api/api/patent/rocket";
const TECHTRANSFER_SOFTWARE_ENDPOINT =
  "https://technology.nasa.gov/api/api/software/visualization";
const TECHTRANSFER_REVALIDATE_SECONDS = 86400;

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
    title: sanitizePlainText(title),
    description: sanitizePlainText(description),
    application: sanitizePlainText(application),
    center: sanitizePlainText(center),
    reference,
    patentNumber,
    url,
    imageUrl,
    releaseDate,
    releaseDateFormatted: releaseDate ? formatDubaiDate(releaseDate) : undefined,
    raw: item,
  };
}

async function fetchTechTransferCollection(endpoint: string, limit: number) {
  const response = await fetchJsonSafe<TechTransferResponse>(
    endpoint,
    TECHTRANSFER_REVALIDATE_SECONDS,
  );

  const items = Array.isArray(response?.results) ? response.results : [];

  return items.slice(0, limit).map(mapTechTransferItem);
}

export async function fetchTechTransferPatents(limit = 6) {
  if (limit <= 0) {
    return [];
  }
  return fetchTechTransferCollection(TECHTRANSFER_PATENT_ENDPOINT, limit);
}

export async function fetchTechTransferSoftware(limit = 6) {
  if (limit <= 0) {
    return [];
  }
  return fetchTechTransferCollection(TECHTRANSFER_SOFTWARE_ENDPOINT, limit);
}
