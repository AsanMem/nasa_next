"use client";
import { useState } from "react";
import type { ImgHTMLAttributes } from "react";

type Props = ImgHTMLAttributes<HTMLImageElement> & { fallbackSrc?: string };
function ImageAttempt({ src, fallbackSrc, alt, ...props }: Props) {
  const [fallback, setFallback] = useState(false);
  const [failed, setFailed] = useState(false);
  if ((!src && !fallbackSrc) || failed) return <span role="img" aria-label={alt || "Image unavailable"} style={{ padding: 24, color: "#a8b3bf", textAlign: "center", fontSize: 14 }}>Image preview unavailable</span>;
  // NASA asset hosts vary; retain the upstream image without proxying it.
  // eslint-disable-next-line @next/next/no-img-element
  return <img {...props} src={fallback ? fallbackSrc : src || fallbackSrc} alt={alt || ""} decoding="async" onError={() => {
    if (!fallback && fallbackSrc && fallbackSrc !== src) setFallback(true);
    else setFailed(true);
  }} />;
}
export default function MediaImage(props: Props) {
  return <ImageAttempt key={`${props.src}|${props.fallbackSrc}`} {...props} />;
}
