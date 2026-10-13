"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import type { ApodItem } from "../../lib/nasa/apod";
import { Chapter, ChapterHeading } from "../orbital/chapter";
import DayClient from "./day-client";
import s from "../orbital/chapters.module.css";
import orbital from "../orbital/orbital.module.css";

export default function BirthdaySearch() {
  const [date, setDate] = useState("");
  const [item, setItem] = useState<ApodItem | null>(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const request = useRef<AbortController>();
  const result = useRef<HTMLDivElement>(null);
  const today = new Date().toISOString().slice(0, 10);
  useEffect(() => () => request.current?.abort(), []);
  async function search(event: FormEvent) {
    event.preventDefault(); request.current?.abort();
    const controller = new AbortController(); request.current = controller;
    setBusy(true); setItem(null); setStatus("Finding the NASA publication...");
    try {
      const response = await fetch("/api/apod", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ date }), signal: controller.signal });
      const data = await response.json();
      if (controller.signal.aborted) return;
      setItem(data.data || null);
      setStatus(data.data ? "Publication found." : data.outcome === "empty" ? "No publication was found for this date. Try another day." : data.outcome === "invalid-data" ? "This date or publication could not be verified. Check the date or try another day." : "NASA could not be reached. Please try again.");
      result.current?.focus();
    } catch { if (!controller.signal.aborted) setStatus("The request failed. Please try again."); }
    finally { if (!controller.signal.aborted) setBusy(false); }
  }
  return <Chapter><ChapterHeading label="The APOD date archive" title="Universe on your birthday." description="Discover the image or video NASA published on a day in your life. It is a publication from that date, not necessarily an observation made that day." />
    <form className={s.dateSearch} onSubmit={search}>
      <label htmlFor="apod-date">Choose a date</label>
      <div className={s.actions}><input id="apod-date" type="date" required min="1995-06-16" max={today} value={date} autoComplete="off" aria-describedby="date-note" onChange={event => { request.current?.abort(); setBusy(false); setStatus(""); setItem(null); setDate(event.target.value); }} /><button className={orbital.button} disabled={busy}>Find publication</button></div>
      <p id="date-note" className={s.caption}>Archive: 16 June 1995 through today (UTC). The date is sent to NASA to find a public article; it is not saved in your profile, localStorage or application diagnostics.</p>
    </form>
    <div ref={result} tabIndex={-1} aria-busy={busy}><p role="status">{status}</p>{item && <DayClient key={item.date} photoData={item} embedded build={{ time: new Date().toISOString() }} />}</div>
  </Chapter>;
}
