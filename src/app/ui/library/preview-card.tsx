import Link from "next/link";
import { observationDate } from "@/app/lib/observations/dates";
import { PREVIEW_SECTIONS, type PreviewContent } from "./constants";
import MediaImage from "../orbital/media-image";
import s from "../orbital/chapters.module.css";

export function PreviewCard({ section, content, query }: { section: (typeof PREVIEW_SECTIONS)[number]; content: PreviewContent | null; query?: string }) {
  const href = query && (section.key === "images" || section.key === "videos") ? `${section.href}?page=1&query=${encodeURIComponent(query)}` : section.href;
  const media = content?.media || content?.gallery?.[0] || content?.slideshow?.[0];
  const illustration = section.key === "neos" ? "/media/main/1.optimized.webp" : section.key === "eonet" ? "/media/eonet/1.jpg" : undefined;
  const title = section.key === "neos" ? "Near-Earth objects" : section.title;
  const illustrative = Boolean(illustration && !media || media?.url.startsWith("/"));
  const unavailableObservation = section.key === "apod" && media?.url.startsWith("/");
  return <article className={s.archiveTile}><Link href={href}><div className={s.mediaPreview}><MediaImage src={media?.url || illustration} alt={media?.alt || title} loading="lazy" />{illustrative && <span className={s.mediaType}>Illustrative view</span>}</div><h3>{title}</h3></Link><p>{unavailableObservation ? "The daily NASA observation is unavailable. Open the chapter for more options." : content?.title || section.description}</p>{content?.metadata && !unavailableObservation && <small>{(section.key === 'epic' ? 'Archived observation: ' : section.key === 'neos' ? 'Encounter: ' : 'Published: ') + observationDate(content.metadata)}</small>}</article>;
}
