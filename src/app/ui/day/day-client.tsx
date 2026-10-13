"use client";
import Link from "next/link";
import { apodExhibit } from '../../lib/observations/apod';
import { useState } from "react";
import type { ApodItem } from "@/app/lib/nasa/apod";
import { sanitizePlainText } from "@/app/lib/utils/text";
import { Chapter, ChapterHeading, EmptyState } from "../orbital/chapter";
import MediaImage from "../orbital/media-image";
import MediaViewer from "../orbital/media-viewer";
import orbital from "../orbital/orbital.module.css";
import s from "../orbital/chapters.module.css";

function embedUrl(raw?: string) {
  if (!raw) return undefined;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") return undefined;
    if (url.hostname === "youtu.be") return `https://www.youtube.com/embed/${encodeURIComponent(url.pathname.slice(1))}`;
    if (["youtube.com", "www.youtube.com", "www.youtube-nocookie.com"].includes(url.hostname)) {
      const id = url.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${encodeURIComponent(id)}` : url.pathname.startsWith("/embed/") ? url.href : undefined;
    }
    if (url.hostname === "player.vimeo.com" && url.pathname.startsWith("/video/")) return url.href;
  } catch { return undefined; }
}
export default function DayClient({ photoData, build }: { photoData: ApodItem | null; build: { time: string; commit?: string } }) {
  const [open, setOpen] = useState(false);
  photoData = apodExhibit(photoData);
  const title = sanitizePlainText(photoData?.title) || "A new perspective awaits.";
  const explanation = sanitizePlainText(photoData?.explanation);
  const fallback = Boolean(photoData?.url?.startsWith("/"));
  const source = photoData?.media_type === "image" ? photoData.hdurl || photoData.url : photoData?.url;
  const external = /^https?:\/\//i.test(source || "") ? source : undefined;
  const video = embedUrl(photoData?.url);
  const image = photoData?.media_type === "image";
  return <Chapter>
    <ChapterHeading label="Media of the day" title={fallback ? "Our universe, one discovery at a time." : title}>
      <div className={s.meta}>{!fallback && photoData?.date && <span>NASA publication · <time dateTime={photoData.date}>{photoData.date}</time></span>}<span>{fallback ? "NASA feed unavailable · Illustrative archive image" : photoData?.media_type === "video" ? "Astronomy video" : "Astronomy Picture of the Day"}</span></div>
    </ChapterHeading>
    {!photoData ? <EmptyState title="The daily observation is unavailable"><p>NASA did not return this observation. You can try again or explore the image archive.</p><div className={s.actions}><button className={orbital.button} onClick={() => window.location.reload()}>Try again</button><Link className={s.textLink} href="/gallery">Explore images</Link></div></EmptyState> : <>
      <figure>
        <div className={s.artwork}>{image ? <MediaImage src={photoData.url} fallbackSrc={photoData.hdurl} alt={title} loading="eager" /> : video ? <iframe src={video} title={title} allow="fullscreen; picture-in-picture" allowFullScreen /> : <EmptyState title="Watch at the original source"><p>This media cannot be embedded here.</p>{external && <a href={external} target="_blank" rel="noopener noreferrer">Open NASA&apos;s selected video</a>}</EmptyState>}</div>
        <figcaption className={s.caption}>{fallback ? "Illustrative image from the local archive; not today's NASA observation." : photoData.copyright ? `Image credit: ${photoData.copyright}` : "NASA Astronomy Picture of the Day"}</figcaption>
      </figure>
      <div className={s.story}><div><h2>{fallback ? "While we reconnect" : "Behind the observation"}</h2><div className={s.actions}>
        {image && !fallback && <button className={orbital.button} onClick={() => setOpen(true)}>View full image</button>}
        {external && <a className={s.textLink} href={external} target="_blank" rel="noopener noreferrer">Original media</a>}
      </div></div><div><p>{fallback ? "The daily NASA feed is temporarily unavailable. Explore the photographic archive while the next observation becomes available." : explanation || "NASA has not supplied an explanation for this observation."}</p><div className={s.actions}><Link className={s.textLink} href="/gallery">Continue into the image archive</Link></div></div></div>
    </>}
    <p className={s.caption}>Page generated {new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(new Date(build.time))} UTC. {fallback ? "The daily source is unavailable." : "The NASA publication date is shown separately."}</p>
    {open && <MediaViewer kind="image" src={source} preview={photoData?.url} source={external} title={title} description={explanation} onClose={() => setOpen(false)} />}
  </Chapter>;
}
