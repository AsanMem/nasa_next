"use client";
import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import MediaImage from "./media-image";
import orbital from "./orbital.module.css";
import s from "./chapters.module.css";
import { useScrollLock } from "./use-scroll-lock";

export type MediaViewerProps = {
  title: string; description?: string; keywords?: string[]; src?: string;
  preview?: string; source?: string; credit?: string; sourceRecord?: string; kind: "image" | "video"; onClose: () => void;
};
export default function MediaViewer({ title, description, keywords, src, preview, source, credit, sourceRecord, kind, onClose }: MediaViewerProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const headingId = useId();
  useScrollLock(true);
  useEffect(() => {
    const element = dialog.current;
    const previousFocus = document.activeElement as HTMLElement | null;
    element?.showModal();
    return () => {
      element?.querySelector("video")?.pause();
      element?.close();
      previousFocus?.focus({ preventScroll: true });
    };
  }, []);
  return createPortal(<dialog ref={dialog} className={`${orbital.theme} ${s.viewer}`} aria-labelledby={headingId}
    onCancel={event => { event.preventDefault(); onClose(); }}
    onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className={s.viewerTop}><p>{kind === "image" ? "Image viewer" : "Video viewer"}</p><button autoFocus type="button" className={`${orbital.button} ${orbital.quiet}`} onClick={onClose}>← Back to page</button></div>
    <div className={s.viewerBody}>
      <div className={s.viewerMedia}>
        {kind === "image" ? <MediaImage src={src} fallbackSrc={preview} alt={title} /> : src ? <video controls playsInline preload="metadata" poster={preview || undefined} src={src}>Your browser cannot play this video. Use the original media link.</video> : <p>Video playback is unavailable.</p>}
      </div>
      <div className={s.viewerText}><h2 id={headingId}>{title}</h2>{credit && <p className={s.caption}>Credit: {credit}</p>}{(description||!!keywords?.length) && <details><summary>About this image or film</summary>{description&&<p>{description}</p>}{keywords?.length ? <div className={s.keywords}>{keywords.map((keyword, index) => <span key={`${keyword}-${index}`}>{keyword}</span>)}</div> : null}</details>}
        {source && <a className={s.textLink} href={source} target="_blank" rel="noopener noreferrer">Original {kind} · new tab ↗</a>}
        {sourceRecord && <p><a className={s.textLink} href={sourceRecord} target="_blank" rel="noopener noreferrer">NASA source record and credits</a></p>}
      </div>
    </div>
  </dialog>, document.body);
}
