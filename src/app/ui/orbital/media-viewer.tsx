"use client";
import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import MediaImage from "./media-image";
import orbital from "./orbital.module.css";
import s from "./chapters.module.css";

export type MediaViewerProps = {
  title: string; description?: string; keywords?: string[]; src?: string;
  preview?: string; source?: string; kind: "image" | "video"; onClose: () => void;
};
export default function MediaViewer({ title, description, keywords, src, preview, source, kind, onClose }: MediaViewerProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const headingId = useId();
  useEffect(() => {
    const element = dialog.current;
    const previousFocus = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    const rootOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    element?.showModal();
    return () => {
      element?.querySelector("video")?.pause();
      element?.close();
      document.body.style.overflow = overflow;
      document.documentElement.style.overflow = rootOverflow;
      previousFocus?.focus({ preventScroll: true });
    };
  }, []);
  return createPortal(<dialog ref={dialog} className={`${orbital.theme} ${s.viewer}`} aria-labelledby={headingId}
    onCancel={event => { event.preventDefault(); onClose(); }}
    onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className={s.viewerTop}><p>NASA {kind === "image" ? "image archive" : "film archive"}</p><button autoFocus type="button" className={`${orbital.button} ${orbital.quiet}`} onClick={onClose}>Close viewer ×</button></div>
    <div className={s.viewerBody}>
      <div className={s.viewerMedia}>
        {kind === "image" ? <MediaImage src={src} fallbackSrc={preview} alt={title} /> : src ? <video controls playsInline preload="metadata" poster={preview || undefined} src={src}>Your browser cannot play this video. Use the original media link.</video> : <p>Video playback is unavailable.</p>}
      </div>
      <div className={s.viewerText}><h2 id={headingId}>{title}</h2>{description && <p>{description}</p>}
        {keywords?.length ? <div className={s.keywords}>{keywords.map((keyword, index) => <span key={`${keyword}-${index}`}>{keyword}</span>)}</div> : null}
        {source && <a className={s.textLink} href={source} target="_blank" rel="noopener noreferrer">Open original {kind}</a>}
      </div>
    </div>
  </dialog>, document.body);
}
