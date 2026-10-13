import { buildNasaUrl, fetchJsonResult, type NasaResult } from "./api";
import { sanitizePlainText } from "../utils/text";

// APOD moved to NASA Science. The legacy API scrapes the redirected landing page.
const APOD_ENDPOINT = "https://science.nasa.gov/wp-json/wp/v2/image-article";
export const APOD_REVALIDATE_SECONDS = 3600;
export const APOD_ARCHIVE_START = "1995-06-16";
export type ApodItem = { date?: string; title?: string; explanation?: string; url?: string; hdurl?: string; media_type?: "image" | "video"; thumbnail_url?: string; copyright?: string; sourceUrl?: string };
type SciencePost = { slug?: string; link?: string; title?: { rendered?: string }; content?: { rendered?: string }; featured_image_url?: string };
const months = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
export function validApodDate(date: string, today = new Date().toISOString().slice(0, 10)) {
  const time = Date.parse(date);
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isFinite(time) && date >= APOD_ARCHIVE_START && date <= today && new Date(time).toISOString().slice(0, 10) === date;
}
function safeUrl(raw?: string) {
  try { const url = new URL(sanitizePlainText(raw) || ""); return url.protocol === "https:" ? url.href : undefined; } catch { return undefined; }
}
/** Read only the APOD article's exhibit, never navigation, logos or related media. */
export function scienceApod(post: SciencePost): ApodItem | null {
  const match = post.slug?.match(/^apod-(\d{4})-([a-z]+)-(\d{1,2})-/);
  if (!match || !months.includes(match[2])) return null;
  const date = match[1] + "-" + String(months.indexOf(match[2]) + 1).padStart(2, "0") + "-" + match[3].padStart(2, "0");
  if (!validApodDate(date)) return null;
  const html = post.content?.rendered || "";
  const exhibit = html.split('media-detail-hero__media')[1]?.split('media-detail-hero__description')[0] || "";
  const video = safeUrl(exhibit.match(/<iframe\b[^>]*\bsrc=["']([^"']+)/i)?.[1] || exhibit.match(/<(?:video|source)\b[^>]*\bsrc=["']([^"']+)/i)?.[1]);
  const image = safeUrl(exhibit.match(/<img\b[^>]*\bsrc=["']([^"']+)/i)?.[1] || post.featured_image_url);
  const explanation = sanitizePlainText(html.match(/<p\b[^>]*class=["'][^"']*media-detail-hero__description[^"']*["'][^>]*>([\s\S]*?)<\/p>/i)?.[1])?.replace(/^Explanation:\s*/i, "");
  const title = sanitizePlainText(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1]);
  const credit = sanitizePlainText(html.match(/<th\b[^>]*>\s*(?:Image\s+)?Credit[\s\S]*?<\/th>\s*<td\b[^>]*>([\s\S]*?)<\/td>/i)?.[1]);
  if (!title || !explanation || !(video || image) || /nasa[-_]logo/i.test(video || image || "")) return null;
  return { date, title, explanation, media_type: video ? "video" : "image", url: video || image, hdurl: video ? undefined : image, thumbnail_url: video ? image : undefined, copyright: credit, sourceUrl: safeUrl(post.link) };
}
export async function fetchApodResult(date?: string, revalidate = APOD_REVALIDATE_SECONDS): Promise<NasaResult<ApodItem>> {
  if (date !== undefined && !validApodDate(date)) return { data: null, outcome: "invalid-data" };
  const previous = date ? new Date(Date.parse(date) - 1000).toISOString().slice(0, 19) : undefined;
  const next = date ? new Date(Date.parse(date) + 86400000).toISOString().slice(0, 19) : undefined;
  const url = buildNasaUrl(APOD_ENDPOINT, { categories: 22766, per_page: date ? 10 : 1, after: previous, before: next }, { includeApiKey: false });
  const result = await fetchJsonResult<SciencePost[]>(url, revalidate, undefined, value => Array.isArray(value) && value.every(item => item && typeof item.slug === "string" && typeof item.content?.rendered === "string"));
  if (!result.data) return { ...result, data: null };
  if (!result.data.length) return { ...result, data: null, outcome: "empty" };
  const data = result.data.map(scienceApod).find(item => item && (!date || item.date === date)) || null;
  return { ...result, data, outcome: data ? "ok" : "invalid-data" };
}
export async function fetchApod(revalidate = APOD_REVALIDATE_SECONDS): Promise<ApodItem | null> {
  return (await fetchApodResult(undefined, revalidate)).data;
}
