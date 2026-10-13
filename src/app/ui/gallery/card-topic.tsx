"use client";
import { useState } from "react";
import { sanitizePlainText } from "@/app/lib/utils/text";
import MediaImage from "../orbital/media-image";
import MediaViewer from "../orbital/media-viewer";
import s from "../orbital/chapters.module.css";

export type ImageTopic = {
  links?: { href?: string }[];
  originalAssetUrl?: string;
  data?: { title?: string; description?: string; keywords?: string[]; nasa_id?: string }[];
};
export default function CardTopic({ topic }: { topic: ImageTopic }) {
  const [open, setOpen] = useState(false);
  const preview = topic.links?.[0]?.href;
  const original = topic.originalAssetUrl || preview;
  const title = sanitizePlainText(topic.data?.[0]?.title) || "NASA image";
  const description = sanitizePlainText(topic.data?.[0]?.description);
  return <article className={s.mediaCard}>
    <button type="button" className={s.mediaTrigger} onClick={() => setOpen(true)} aria-haspopup="dialog">
      <span className={s.mediaPreview}><MediaImage src={preview} alt={title} loading="lazy" /><span className={s.mediaType}>View image</span></span><h2>{title}</h2>
    </button>
    {description && <p>{description}</p>}
    {original && <a className={s.mediaSource} href={original} target="_blank" rel="noopener noreferrer">Original image</a>}
    {open && <MediaViewer kind="image" title={title} description={description} keywords={topic.data?.[0]?.keywords} src={original} preview={preview} source={original} onClose={() => setOpen(false)} />}
  </article>;
}
