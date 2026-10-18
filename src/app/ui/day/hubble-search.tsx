"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import type { HubbleBirthdayItem } from "../../lib/observations/hubble";
import { validCalendarDay } from "../../lib/observations/hubble";
import MediaImage from "../orbital/media-image";
import MediaViewer from "../orbital/media-viewer";
import s from "../orbital/chapters.module.css";
import orbital from "../orbital/orbital.module.css";
import skyStyle from './birth-sky.module.css';
const months=Array.from({length:12},(_,i)=>new Intl.DateTimeFormat("en",{month:"long",timeZone:"UTC"}).format(new Date(Date.UTC(2000,i,1))));
export default function HubbleSearch({initialMonth="",initialDay=""}:{initialMonth?:string;initialDay?:string;initialYear?:string}){
  const [month,setMonth]=useState(initialMonth),[day,setDay]=useState(initialDay);
  const [items,setItems]=useState<HubbleBirthdayItem[]>([]),[busy,setBusy]=useState(false),[status,setStatus]=useState("");
  const [selected,setSelected]=useState<HubbleBirthdayItem|null>(null);
  const [foundDate,setFoundDate]=useState<{month:number;day:number}|null>(null);
  const request=useRef<AbortController>(),result=useRef<HTMLDivElement>(null);
  const maxDay=month?new Date(Date.UTC(2000,Number(month),0)).getUTCDate():31;
  useEffect(()=>()=>request.current?.abort(),[]);
  function clear(){request.current?.abort();setBusy(false);setItems([]);setStatus("");setFoundDate(null);}
  async function submit(event:FormEvent){
    event.preventDefault();
    const chosen={month:Number(month),day:Number(day)};
    if(!validCalendarDay(chosen.month,chosen.day)){setStatus("Choose a valid day and month.");return;}
    request.current?.abort();const controller=new AbortController();request.current=controller;setBusy(true);setItems([]);setStatus("Collecting your Hubble photographs…");
    try{
      const response=await fetch("/api/hubble-birthday",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(chosen),signal:controller.signal});
      const data=await response.json();if(controller.signal.aborted)return;
      const found=Array.isArray(data.data)?data.data:[];setItems(found);setFoundDate(chosen);setStatus(found.length?`${found.length} photographs for this day and month. Each shows its actual observation year.`:data.outcome==="empty"?"No Hubble photographs are listed for this day. Try another date.":data.outcome==="invalid-data"?"Choose a valid day and month.":"NASA could not be reached. Please try again.");result.current?.focus({preventScroll:true});
    }catch{if(!controller.signal.aborted)setStatus("The request failed. Please try again.");}
    finally{if(!controller.signal.aborted)setBusy(false);}
  }
  return <>
    <p className={s.birthdayNote}>Hubble photographs taken on this day and month, in different years. These are telescope observations, not the sky above your birthplace.</p>
    <form className={s.hubbleForm} onSubmit={submit} autoComplete="off"><label>Month<select required value={month} onChange={event=>{clear();setMonth(event.target.value);setDay("");}}><option value="">Choose month</option>{months.map((name,i)=><option value={i+1} key={name}>{name}</option>)}</select></label><label>Day<select required value={day} onChange={event=>{clear();setDay(event.target.value);}}><option value="">Day</option>{Array.from({length:maxDay},(_,i)=><option key={i} value={i+1}>{i+1}</option>)}</select></label><button className={orbital.button} disabled={busy||!month||!day}>{busy?"Collecting…":"Find photographs"}</button></form>
    <p className={s.caption}>Each image shows its actual observation year. This collection is not a map of the sky at your birth. Your date is not saved.</p>
    <div ref={result} tabIndex={-1} aria-busy={busy}><p role="status" className={s.caption}>{status}</p>{!!items.length&&foundDate&&<div className={`${s.contactSheet} ${skyStyle.archive}`}>{items.map(item=><article key={item.id}><button type="button" aria-label={`Enlarge ${item.title}`} onClick={()=>setSelected(item)}><MediaImage src={item.imageUrl} alt={item.title}/></button><h2>{item.title}</h2><p>Observed {item.year}</p><a href={item.sourceUrl} target="_blank" rel="noopener noreferrer">NASA story & credits</a></article>)}</div>}</div>
    {selected&&<MediaViewer kind="image" title={selected.title} description={selected.description} src={selected.imageUrl} source={selected.imageUrl} sourceRecord={selected.sourceUrl} onClose={()=>setSelected(null)}/> }
  </>;
}
