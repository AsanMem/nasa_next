"use client";
import { useState } from "react";
import { sanitizePlainText } from "@/app/lib/utils/text";
import MediaImage from "../orbital/media-image";
import MediaViewer from "../orbital/media-viewer";
import s from "../orbital/chapters.module.css";

export default function CardVideo({ videoPreview, videoPlay, title, description, keywords }: { videoPreview: string; videoPlay: string; title: string; description: string; keywords?: string[] }) {
  const [open, setOpen] = useState(false);
  const cleanTitle = sanitizePlainText(title) || "NASA film";
  const cleanDescription = sanitizePlainText(description);
  return <article className={s.mediaCard}>
    <button type="button" className={s.mediaTrigger} onClick={() => setOpen(true)} aria-haspopup="dialog">
      <span className={s.mediaPreview}><MediaImage src={videoPreview} alt={cleanTitle} loading="lazy" /><span className={s.mediaType}>Watch film</span></span><h2>{cleanTitle}</h2>
    </button>
    {cleanDescription && <p>{cleanDescription}</p>}
    {videoPlay && <a className={s.mediaSource} href={videoPlay} target="_blank" rel="noopener noreferrer">Original video</a>}
    {open && <MediaViewer kind="video" src={videoPlay} preview={videoPreview} source={videoPlay} title={cleanTitle} description={cleanDescription} keywords={keywords} onClose={() => setOpen(false)} />}
  </article>;
}
