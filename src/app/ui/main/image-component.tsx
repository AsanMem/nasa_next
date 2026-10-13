"use client";
import { useEffect, useMemo, useState } from "react";
import { observationDate, sourceTime } from '../../lib/observations/dates';
import MediaImage from "../orbital/media-image";
import orbital from "../orbital/orbital.module.css";
import s from "../orbital/chapters.module.css";

type EpicImage = { identifier?: string; imageUrl?: string; caption?: string; date?: string };
export default function ImageSlideshow({ images }: { images: EpicImage[] }) {
  const frames = useMemo(() => [...images].filter(image => image.imageUrl).sort((a,b)=>(sourceTime(a.date)??Infinity)-(sourceTime(b.date)??Infinity)), [images]);
  const [index, setIndex] = useState(0);
  const [playing,setPlaying]=useState(false);
  useEffect(()=>{if(!playing)return;const timer=setInterval(()=>{if(!document.hidden)setIndex(value=>(value+1)%Math.max(1,frames.length));},1500);const stop=()=>{if(document.hidden)setPlaying(false);};document.addEventListener('visibilitychange',stop);return()=>{clearInterval(timer);document.removeEventListener('visibilitychange',stop);};},[playing,frames.length]);
  const currentIndex = Math.min(index, Math.max(0, frames.length - 1));
  const current = frames[currentIndex];
  if (!current) return <p>No Earth observations are available.</p>;
  const step = (amount: number) => { setPlaying(false); setIndex((currentIndex + amount + frames.length) % frames.length); };
  return <><div className={s.epicLayout}>
    <figure className={s.artwork}><MediaImage src={current.imageUrl} alt={current.caption || "Earth observed by NASA EPIC"} loading="eager" /></figure>
    <div><p className={s.eyebrow}>Our home, seen from afar</p><h2 style={{ fontSize: 32, lineHeight: 1.2, letterSpacing: "-.04em" }}>One planet.<br />An ever-changing view.</h2><p className={s.caption}>The dates below belong to the available NASA images. This is an observation sequence, not a live video.</p>
      <div className={s.epicControls}><label htmlFor="epic-frame">Frame {currentIndex + 1} of {frames.length}</label><input id="epic-frame" type="range" min={0} max={frames.length - 1} value={currentIndex} onChange={event => { setPlaying(false); setIndex(Number(event.target.value)); }} disabled={frames.length === 1} /><p className={s.meta} aria-live="polite">{current.identifier==='local-epic-fallback'?'Illustrative local image: NASA sequence unavailable': 'Observed '+observationDate(current.date)}</p><p className={s.caption}>{current.caption}</p><div className={s.actions}><button type="button" className={orbital.button} disabled={frames.length<2} aria-pressed={playing} onClick={()=>setPlaying(value=>!value)}>{playing?'Pause playback':'Play sequence'}</button><button type="button" className={`${orbital.button} ${orbital.quiet}`} onClick={() => step(-1)} disabled={frames.length === 1}>Previous</button><button type="button" className={`${orbital.button} ${orbital.quiet}`} onClick={() => step(1)} disabled={frames.length === 1}>Next</button></div><div className={s.actions}><a className={s.textLink} href={current.imageUrl} target="_blank" rel="noopener noreferrer">Original observation</a></div></div>
    </div>
  </div><div className={s.filmstrip} aria-label="Earth observation frames">{frames.map((frame, i) => <button key={frame.imageUrl || i} type="button" aria-label={`Show frame ${i + 1}${frame.date && frame.identifier !== "local-epic-fallback" ? `, ${observationDate(frame.date)}` : ""}`} aria-pressed={i === currentIndex} onClick={() => { setPlaying(false); setIndex(i); }}><MediaImage src={frame.imageUrl} alt="" loading="lazy" /></button>)}</div></>;
}
