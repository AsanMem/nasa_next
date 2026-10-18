"use client";
import { useState } from "react";
import { Chapter, ChapterHeading } from "../orbital/chapter";
import BirthdaySearch from "./birthday-search";
import HubbleSearch from "./hubble-search";
import BirthSkyBuilder from "./birth-sky";
import s from "../orbital/chapters.module.css";
import skyStyle from './birth-sky.module.css';
export default function BirthdayHub(){
  const [mode,setMode]=useState<"sky"|"hubble"|"apod">("sky");
  const [seed,setSeed]=useState<{month:string;day:string;year:string}>({month:"",day:"",year:""});
  const modes=["sky","hubble","apod"] as const;
  return <Chapter><ChapterHeading compact title="Your birth sky"/><div className={`${s.modeTabs} ${skyStyle.tabs}`} role="tablist" aria-label="Choose your birthday view">{modes.map(value=><button role="tab" type="button" id={`tab-${value}`} aria-selected={mode===value} aria-controls={`panel-${value}`} key={value} onClick={()=>setMode(value)} onKeyDown={event=>{if(["ArrowLeft","ArrowRight","Home","End"].includes(event.key)){event.preventDefault();const next=event.key==="Home"?"sky":event.key==="End"?"apod":modes[(modes.indexOf(mode)+(event.key==="ArrowLeft"?2:1))%3];setMode(next);document.getElementById(`tab-${next}`)?.focus();}}} tabIndex={mode===value?0:-1}>{value==="sky"?"My birth sky":value==="apod"?"NASA by date":"Hubble photos"}</button>)}</div><section id={`panel-${mode}`} role="tabpanel" aria-labelledby={`tab-${mode}`}>{mode==="sky"?<BirthSkyBuilder/>:mode==="hubble"?<HubbleSearch initialMonth={seed.month} initialDay={seed.day} initialYear={seed.year}/>:<BirthdaySearch embedded onChooseHubble={value=>{setSeed(value);setMode("hubble");}}/>}</section></Chapter>;
}
