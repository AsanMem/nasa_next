"use client";
import { useState } from "react";
import { sanitizePlainText } from "@/app/lib/utils/text";
import MediaImage from "../orbital/media-image";
import MediaViewer from "../orbital/media-viewer";
import s from "../orbital/chapters.module.css";

export type ImageTopic = {
  links?: { href?: string }[];
  originalAssetUrl?: string;
  data?: { title?: string; description?: string; keywords?: string[]; nasa_id?: string; photographer?: string; secondary_creator?: string; center?: string }[];
};
export default function CardTopic({ topic }: { topic: ImageTopic }) {
  const [open, setOpen] = useState(false);
  const preview = topic.links?.[0]?.href;
  const original = topic.originalAssetUrl || preview;
  const title = sanitizePlainText(topic.data?.[0]?.title) || "NASA image";
  const description = sanitizePlainText(topic.data?.[0]?.description);
  const item = topic.data?.[0];
  const credit = [item?.photographer, item?.secondary_creator, item?.center].map(value => sanitizePlainText(value)).filter(Boolean).join(' / ');
  const sourceRecord = item?.nasa_id ? `https://images.nasa.gov/details/${encodeURIComponent(item.nasa_id)}` : undefined;
  return <article className={s.mediaCard}>
    <button type="button" className={s.mediaTrigger} onClick={() => setOpen(true)} aria-haspopup="dialog">
      <span className={s.mediaPreview}><MediaImage src={preview} alt={title} loading="lazy" /></span><h2>{title}</h2>
    </button>
    {description && <p>{description}</p>}
    {credit && <p className={s.caption}>Credit: {credit}</p>}
    {original && <a className={s.mediaSource} href={original} target="_blank" rel="noopener noreferrer">Original image</a>}
    {open && <MediaViewer kind="image" title={title} description={description} credit={credit} sourceRecord={sourceRecord} keywords={topic.data?.[0]?.keywords} src={original} preview={preview} source={original} onClose={() => setOpen(false)} />}
  </article>;
}
