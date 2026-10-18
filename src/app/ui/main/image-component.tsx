"use client";
import { useEffect, useMemo, useRef, useState } from "react";
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
  const [previous,setPrevious]=useState<EpicImage>();
  const [reduced,setReduced]=useState(false);
  const region=useRef<HTMLDivElement>(null),displayed=useRef<EpicImage>(),wantsPlayback=useRef(true),visible=useRef(true);
  const currentIndex = Math.min(index, Math.max(0, frames.length - 1));
  const current = frames[currentIndex];
  displayed.current=current;
  useEffect(() => {
    const frame = frames[Math.min(requested, frames.length - 1)];
    if (!frame?.imageUrl) return;
    setLoading(true); setError(false);
    void loader.show(frame.imageUrl, () => { if(displayed.current?.imageUrl!==frame.imageUrl)setPrevious(displayed.current);setIndex(Math.min(requested, frames.length - 1)); setLoading(false); }, () => { setError(true); setPlaying(false); setLoading(false); });
    return () => loader.cancel();
  }, [requested, frames, loader]);
  useEffect(() => {
    const next = frames[(currentIndex + 1) % frames.length]?.imageUrl;
    if (next) void loader.preload(next).catch(() => { /* Report failure only when requested. */ });
  }, [currentIndex, frames, loader]);
  useEffect(()=>{
    const preference=window.matchMedia("(prefers-reduced-motion: reduce)");
    const update=()=>{setReduced(preference.matches);setPlaying(!preference.matches&&wantsPlayback.current&&visible.current&&!document.hidden&&frames.length>1);};
    update();preference.addEventListener("change",update);
    const observer=new IntersectionObserver(([entry])=>{visible.current=entry.isIntersecting;update();},{threshold:.12});
    if(region.current)observer.observe(region.current);
    return()=>{observer.disconnect();preference.removeEventListener("change",update);};
  },[frames.length]);
  useEffect(() => {
    const stop = () => { if (document.hidden) { wantsPlayback.current=false;setPlaying(false); loader.cancel(); setRequested(currentIndex); setLoading(false); } };
    document.addEventListener('visibilitychange', stop);
    return () => { loader.cancel(); document.removeEventListener('visibilitychange', stop); };
  }, [loader, currentIndex]);
  useEffect(() => {
    if (!playing || loading || frames.length < 2) return;
    const timer = setTimeout(() => { if (!document.hidden) setRequested((currentIndex + 1) % frames.length); }, 1500);
    return () => clearTimeout(timer);
  }, [playing, loading, currentIndex, frames.length]);
  if (!current) return <p>No Earth observations are available.</p>;
  const choose = (value: number) => { wantsPlayback.current=false;setPlaying(false); setRequested(value); };
  const togglePlayback = () => {
    if (playing) { loader.cancel(); setRequested(currentIndex); setLoading(false); }
    wantsPlayback.current=!playing;setPlaying(value => !value && !document.hidden);
  };
  const step = (amount: number) => choose((currentIndex + amount + frames.length) % frames.length);
  return <><div className={s.epicLayout} ref={region}>
    <figure className={s.epicArtwork}>{previous&&<MediaImage className={s.epicPrevious} src={previous.imageUrl} alt="" aria-hidden="true"/>}<div className={s.epicFrame} key={current.imageUrl}><MediaImage src={current.imageUrl} alt={current.caption || "Earth observed by NASA EPIC"} loading="eager" /></div></figure>
    <div><p className={s.caption}>Real Earth photographs, played as a sequence. Pause or choose a frame to look closer.</p>
      <div className={s.epicControls}><label htmlFor="epic-frame">Frame {currentIndex + 1} of {frames.length}</label><input id="epic-frame" type="range" min={0} max={frames.length - 1} value={currentIndex} onChange={event => { choose(Number(event.target.value)); }} disabled={frames.length === 1} /><p className={s.meta} aria-live={playing?"off":"polite"}>{current.identifier==='local-epic-fallback'?'Illustrative local image: NASA sequence unavailable': 'Observed '+observationDate(current.date)}</p><p className={s.caption}>{current.caption}</p><p className={s.caption} role="status">{error ? "This frame could not be loaded. The previous observation is retained. Choose another frame to continue." : loading && !playing ? "Loading observation..." : ""}</p><div className={s.actions}><button type="button" className={orbital.button} disabled={frames.length<2||reduced} aria-pressed={playing} onClick={togglePlayback}>{playing?'Pause playback':'Play sequence'}</button><button type="button" className={`${orbital.button} ${orbital.quiet}`} onClick={() => step(-1)} disabled={frames.length === 1}>Previous</button><button type="button" className={`${orbital.button} ${orbital.quiet}`} onClick={() => step(1)} disabled={frames.length === 1}>Next</button></div><div className={s.actions}><a className={s.textLink} href={current.imageUrl} target="_blank" rel="noopener noreferrer">Original observation</a></div></div>
    </div>
  </div><div className={s.filmstrip} aria-label="Earth observation frames">{frames.map((frame, i) => <button key={frame.imageUrl || i} type="button" aria-label={`Show frame ${i + 1}${frame.date && frame.identifier !== "local-epic-fallback" ? `, ${observationDate(frame.date)}` : ""}`} aria-pressed={i === currentIndex} onClick={() => { choose(i); }}><MediaImage src={frame.imageUrl} alt="" loading="lazy" /></button>)}</div></>;
}
