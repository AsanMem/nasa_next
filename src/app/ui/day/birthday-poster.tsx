"use client";
import { useEffect,useState } from "react";
import type { HubbleBirthdayItem } from "../../lib/observations/hubble";
import MediaImage from "../orbital/media-image";
import MediaViewer from "../orbital/media-viewer";
import s from "./birthday-poster.module.css";
import orbital from "../orbital/orbital.module.css";

type Props={items:HubbleBirthdayItem[];month:number;day:number;birthYear?:string};
export default function BirthdayPoster({items,month,day,birthYear=""}:Props){
  const [selected,setSelected]=useState<HubbleBirthdayItem|null>(null);
  const date=new Intl.DateTimeFormat("en",{month:"long",day:"numeric",timeZone:"UTC"}).format(new Date(Date.UTC(2000,month-1,day)));
  useEffect(()=>{const clear=()=>{delete document.documentElement.dataset.printView;};window.addEventListener("afterprint",clear);return()=>{window.removeEventListener("afterprint",clear);clear();};},[]);
  function print(){document.documentElement.dataset.printView="birthday";window.print();}
  return <>
    <div className={s.printBar}><p>Your date. A collection to keep.</p><button type="button" className={orbital.button} onClick={print}>Print poster</button></div>
    <article className={s.poster} data-birthday-poster="true" aria-label={`Space birthday poster for ${date}`}>
      <header><span className={s.wordmark}>Orbital</span><p>A day among the stars</p><h2>{date}{birthYear&&<> <small>Born {birthYear}</small></>}</h2><p>Hubble observations made on this day and month, across different years.</p></header>
      <div className={s.collage} data-count={items.length}>{items.map((item,index)=><figure key={item.id}>
        <button type="button" aria-haspopup="dialog" aria-label={`Enlarge ${item.title}`} onClick={()=>setSelected(item)}><MediaImage src={item.imageUrl} alt={item.title} loading="eager"/></button>
        <figcaption><h3>{item.title}</h3><p><span>{index+1} / </span>Observed {new Intl.DateTimeFormat("en",{month:"short",day:"numeric",year:"numeric",timeZone:"UTC"}).format(new Date(Date.UTC(item.year,item.month-1,item.day)))}</p></figcaption>
      </figure>)}</div>
      <footer><p>A collection of telescope photographs, not a reconstruction of the sky at your birth. The year beside each image is its actual observation year.</p><ol>{items.map(item=><li key={item.id}><a href={item.sourceUrl} target="_blank" rel="noopener noreferrer">{item.title} — NASA source & credits</a><span className={s.printUrl}>{item.sourceUrl}</span></li>)}</ol><p className={s.signature}>Collected with Orbital · Hubble birthday archive</p></footer>
    </article>
    <details className={s.about}><summary>About these observations</summary>{items.map(item=><section key={item.id}><h3>{item.title} <span>· {item.year}</span></h3><p>{item.description}</p><a href={item.sourceUrl} target="_blank" rel="noopener noreferrer">Read the NASA story & credits ↗</a></section>)}</details>
    {selected&&<MediaViewer kind="image" title={selected.title} description={selected.description} src={selected.imageUrl} source={selected.imageUrl} sourceRecord={selected.sourceUrl} onClose={()=>setSelected(null)}/>}
  </>;
}
