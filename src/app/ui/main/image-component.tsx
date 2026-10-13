"use client";
import { useEffect, useMemo, useState } from "react";
import { observationDate, sourceTime } from '../../lib/observations/dates';
import { createFrameLoader, decodeFrame } from "../../lib/observations/frames";
import MediaImage from "../orbital/media-image";
import orbital from "../orbital/orbital.module.css";
import s from "../orbital/chapters.module.css";

type EpicImage = { identifier?: string; imageUrl?: string; caption?: string; date?: string };
export default function ImageSlideshow({ images }: { images: EpicImage[] }) {
  const frames = useMemo(() => [...images].filter(image => image.imageUrl).sort((a,b)=>(sourceTime(a.date)??Infinity)-(sourceTime(b.date)??Infinity)), [images]);
  const loader = useMemo(() => createFrameLoader(decodeFrame), []);
  const [index, setIndex] = useState(0);
  const [requested, setRequested] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const currentIndex = Math.min(index, Math.max(0, frames.length - 1));
  const current = frames[currentIndex];
  useEffect(() => {
    const frame = frames[Math.min(requested, frames.length - 1)];
    if (!frame?.imageUrl) return;
    setLoading(true); setError(false);
    void loader.show(frame.imageUrl, () => { setIndex(Math.min(requested, frames.length - 1)); setLoading(false); }, () => { setError(true); setPlaying(false); setLoading(false); });
    return () => loader.cancel();
  }, [requested, frames, loader]);
  useEffect(() => {
    const next = frames[(currentIndex + 1) % frames.length]?.imageUrl;
    if (next) void loader.preload(next).catch(() => { /* Report failure only when requested. */ });
  }, [currentIndex, frames, loader]);
  useEffect(() => {
    const stop = () => { if (document.hidden) { setPlaying(false); loader.cancel(); setRequested(currentIndex); setLoading(false); } };
    document.addEventListener('visibilitychange', stop);
    return () => { loader.cancel(); document.removeEventListener('visibilitychange', stop); };
  }, [loader, currentIndex]);
  useEffect(() => {
    if (!playing || loading || frames.length < 2) return;
    const timer = setTimeout(() => { if (!document.hidden) setRequested((currentIndex + 1) % frames.length); }, 1500);
    return () => clearTimeout(timer);
  }, [playing, loading, currentIndex, frames.length]);
  if (!current) return <p>No Earth observations are available.</p>;
  const choose = (value: number) => { setPlaying(false); setRequested(value); };
  const togglePlayback = () => {
    if (playing) { loader.cancel(); setRequested(currentIndex); setLoading(false); }
    setPlaying(value => !value && !document.hidden);
  };
  const step = (amount: number) => choose((currentIndex + amount + frames.length) % frames.length);
  return <><div className={s.epicLayout}>
    <figure className={s.epicArtwork}><MediaImage src={current.imageUrl} alt={current.caption || "Earth observed by NASA EPIC"} loading="eager" /></figure>
    <div><p className={s.eyebrow}>Our home, seen from afar</p><h2 style={{ fontSize: 32, lineHeight: 1.2, letterSpacing: "-.04em" }}>One planet.<br />An ever-changing view.</h2><p className={s.caption}>The dates below belong to the available NASA images. This is an observation sequence, not a live video.</p>
      <div className={s.epicControls}><label htmlFor="epic-frame">Frame {currentIndex + 1} of {frames.length}</label><input id="epic-frame" type="range" min={0} max={frames.length - 1} value={currentIndex} onChange={event => { choose(Number(event.target.value)); }} disabled={frames.length === 1} /><p className={s.meta} aria-live="polite">{current.identifier==='local-epic-fallback'?'Illustrative local image: NASA sequence unavailable': 'Observed '+observationDate(current.date)}</p><p className={s.caption}>{current.caption}</p><p className={s.caption} role="status">{error ? "This frame could not be loaded. The previous observation is retained. Choose another frame to continue." : loading ? "Loading observation..." : ""}</p><div className={s.actions}><button type="button" className={orbital.button} disabled={frames.length<2} aria-pressed={playing} onClick={togglePlayback}>{playing?'Pause playback':'Play sequence'}</button><button type="button" className={`${orbital.button} ${orbital.quiet}`} onClick={() => step(-1)} disabled={frames.length === 1}>Previous</button><button type="button" className={`${orbital.button} ${orbital.quiet}`} onClick={() => step(1)} disabled={frames.length === 1}>Next</button></div><div className={s.actions}><a className={s.textLink} href={current.imageUrl} target="_blank" rel="noopener noreferrer">Original observation</a></div></div>
    </div>
  </div><div className={s.filmstrip} aria-label="Earth observation frames">{frames.map((frame, i) => <button key={frame.imageUrl || i} type="button" aria-label={`Show frame ${i + 1}${frame.date && frame.identifier !== "local-epic-fallback" ? `, ${observationDate(frame.date)}` : ""}`} aria-pressed={i === currentIndex} onClick={() => { choose(i); }}><MediaImage src={frame.imageUrl} alt="" loading="lazy" /></button>)}</div></>;
}
