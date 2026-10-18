"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import type { ApodItem } from "../../lib/nasa/apod";
import { Chapter, ChapterHeading } from "../orbital/chapter";
import DayClient from "./day-client";
import s from "../orbital/chapters.module.css";
import orbital from "../orbital/orbital.module.css";

export default function BirthdaySearch({embedded=false,onChooseHubble}:{embedded?:boolean;onChooseHubble?:(date:{month:string;day:string;year:string})=>void}) {
  const Container=embedded?"div":Chapter;
  const [day,setDay]=useState(""),[month,setMonth]=useState(""),[year,setYear]=useState("");
  const date=month&&day&&year.length===4?`${year}-${month.padStart(2,"0")}-${day.padStart(2,"0")}`:"";
  const [item, setItem] = useState<ApodItem | null>(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const request = useRef<AbortController>();
  const result = useRef<HTMLDivElement>(null);
  const today = new Date().toISOString().slice(0, 10);
  useEffect(() => () => request.current?.abort(), []);
  async function search(event: FormEvent) {
    event.preventDefault(); request.current?.abort();
    const parsedDate=new Date(`${date}T00:00:00Z`);
    if(!date||!Number.isFinite(parsedDate.getTime())||parsedDate.toISOString().slice(0,10)!==date){setStatus("Enter a valid day, month and year.");return;}
    if(date<"1995-06-16"){setStatus("The daily NASA picture archive begins on June 16, 1995. Choose My birth sky for a calculated sky map, or explore Hubble photographs taken on your day and month in other years.");return;}
    if(date>today){setStatus("Choose a date up to today.");return;}
    const controller = new AbortController(); request.current = controller;
    setBusy(true); setItem(null); setStatus("Finding your birthday picture…");
    try {
      const response = await fetch("/api/apod", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ date }), signal: controller.signal });
      const data = await response.json();
      if (controller.signal.aborted) return;
      setItem(data.data || null);
      setStatus(data.data ? "Your picture is ready." : data.outcome === "empty" ? "No picture was found for this date. Try another day." : data.outcome === "invalid-data" ? "This picture could not be verified. Check your date or try another day." : "NASA could not be reached. Please try again.");
      result.current?.focus();
    } catch { if (!controller.signal.aborted) setStatus("The request failed. Please try again."); }
    finally { if (!controller.signal.aborted) setBusy(false); }
  }
  const months=Array.from({length:12},(_,i)=>new Intl.DateTimeFormat("en",{month:"short",timeZone:"UTC"}).format(new Date(Date.UTC(2000,i,1))));
  const clear=()=>{request.current?.abort();setBusy(false);setStatus("");setItem(null);};
  return <Container>{!embedded&&<ChapterHeading compact title="Space on your birth date"/>}<p className={s.birthdayNote}>Find the astronomy picture or video NASA published on an exact date. Its publication date can differ from the date the photograph was taken.</p>
    <form className={s.dateSearch} onSubmit={search} autoComplete="off">
      <fieldset className={s.birthDateFields}><legend>Your date of birth</legend><label>Day<input type="number" inputMode="numeric" required min="1" max={month?new Date(Date.UTC(Number(year)||2000,Number(month),0)).getUTCDate():31} placeholder="DD" value={day} onChange={event=>{clear();setDay(event.target.value);}}/></label><label>Month<select required value={month} onChange={event=>{clear();setMonth(event.target.value);}}><option value="">Month</option>{months.map((name,i)=><option key={name} value={i+1}>{name}</option>)}</select></label><label>Year<input type="number" inputMode="numeric" required min="1" max={Number(today.slice(0,4))} placeholder="YYYY" value={year} onChange={event=>{clear();setYear(event.target.value);}}/></label></fieldset>
      <button className={orbital.button} disabled={busy}>{busy?"Finding your picture…":"Find NASA’s picture"}</button>
      <p id="date-note" className={s.caption}>Available from June 16, 1995. For a map of your birthplace’s sky, choose My birth sky. Your date is not saved.</p>
      {onChooseHubble&&year.length===4&&date&&date<"1995-06-16"&&<button type="button" className={s.textLink} onClick={()=>onChooseHubble({month,day,year})}>Explore Hubble photographs</button>}
    </form>
    <div ref={result} tabIndex={-1} aria-busy={busy}><p role="status">{status}</p>{item && <DayClient key={item.date} photoData={item} embedded build={{ time: new Date().toISOString() }} />}</div>
  </Container>;
}
