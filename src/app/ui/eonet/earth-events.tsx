"use client";
import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import type { EonetEvent } from '@/app/lib/nasa/eonet';
import { eventObservations, latestObservation, type MapPoint } from '@/app/lib/observations/geography';
import { observationDate } from '@/app/lib/observations/dates';
import { sanitizePlainText } from '@/app/lib/utils/text';
import { EmptyState } from '../orbital/chapter';
import EventMap, { CategoryIcon } from './event-map';
import orbital from '../orbital/orbital.module.css';
import s from '../orbital/chapters.module.css';
function reportUrl(event:EonetEvent) { return event.sources?.find(source=>/^https?:\/\//i.test(source.url))?.url || event.link; }
export default function EarthEvents({events}:{events:EonetEvent[]}) {
 const [category,setCategory]=useState('All events'),[selectedId,setSelectedId]=useState(events[0]?.id);
 const [observations,setObservations]=useState<Record<string,number>>({});
 const overview=useRef<HTMLDivElement>(null);
 const categories=['All events',...Array.from(new Set(events.flatMap(event=>event.categories?.map(item=>item.title)||[])))];
 const filtered=useMemo(()=>category==='All events'?events:events.filter(event=>event.categories?.some(item=>item.title===category)),[events,category]);
 const selected=filtered.find(event=>event.id===selectedId)||filtered[0];
 const observationFor=(event:EonetEvent)=>eventObservations(event).find(item=>item.index===observations[event.id])||latestObservation(event);
 const selectedObservation=selected?observationFor(selected):undefined;
 const location=selectedObservation?.location;
 const points:MapPoint[]=filtered.flatMap(event=>{const point=observationFor(event)?.location;return point?[{id:event.id,title:event.title,category:event.categories?.[0]?.title||'Natural event',latitude:point.latitude,longitude:point.longitude}]:[];});
 if(!events.length)return <EmptyState title="No observations are available"><p>The EONET feed returned no events. This does not indicate an absence of natural activity.</p><Link href="/epic">See Earth from deep space</Link></EmptyState>;
 return <>
 <div className={s.filters} aria-label="Filter event categories">{categories.map(item=><button key={item} className={s.chip} aria-pressed={category===item} onClick={()=>setCategory(item)}>{item}</button>)}</div>
 <p className={s.caption} role="status">{filtered.length} events in this NASA snapshot.</p>
 <div className={s.mapLayout} ref={overview} style={{marginTop:28}}>
 <div><EventMap points={points} selectedId={selected?.id} onSelect={setSelectedId}/></div>
 {selected&&<div className={s.selectedEvent}><span className={s.eventLabel}><CategoryIcon category={selected.categories?.[0]?.title||''}/>{selected.categories?.map(item=>item.title).join(', ')||'Natural event'}</span><h2>{selected.title}</h2><p>Observed: {observationDate(selectedObservation?.geometry.date)}</p><p>{location?location.latitude.toFixed(2)+'\u00b0, '+location.longitude.toFixed(2)+'\u00b0':'Location unavailable'}</p>
 {selected.geometry?.length ? <div className={s.observationControl}><label htmlFor="event-observation">Available observations</label><select id="event-observation" value={selectedObservation?.index??0} onChange={event=>setObservations(previous=>({...previous,[selected.id]:Number(event.target.value)}))}>{eventObservations(selected).map(item=><option key={item.index} value={item.index}>{observationDate(item.geometry.date)}{item.location?'':' - no coordinates'}</option>)}</select></div>:null}
 <div className={s.actions}>{reportUrl(selected)&&<a className={orbital.button} href={reportUrl(selected)} target="_blank" rel="noopener noreferrer">Read source report</a>}<a className={s.textLink} href={'#event-'+selected.id}>Find in event list</a></div></div>}
 </div>
 <section className={s.eventList} aria-label="Ongoing events">{filtered.map(event=>{const observation=observationFor(event),point=observation?.location,source=reportUrl(event);return <article key={event.id} id={'event-'+event.id} className={s.eventRow} data-selected={event.id===selected?.id}><div><span className={s.eventLabel}><CategoryIcon category={event.categories?.[0]?.title||''}/>{event.categories?.map(item=>item.title).join(', ')||'Natural event'}</span><p>Observed {observationDate(observation?.geometry.date)}</p></div><div><h2>{event.title}</h2>{event.description&&<p>{sanitizePlainText(event.description)}</p>}<p>{point?point.latitude.toFixed(2)+'\u00b0, '+point.longitude.toFixed(2)+'\u00b0':'Coordinates not supplied'}</p></div><div className={s.actions}><button className={orbital.button+' '+orbital.quiet} aria-pressed={event.id===selected?.id} onClick={()=>{setSelectedId(event.id);overview.current?.scrollIntoView({block:'center',behavior:'auto'});}}>Inspect event</button>{source&&<a className={s.textLink} href={source} target="_blank" rel="noopener noreferrer">Source report</a>}{point&&<a className={s.textLink} href={point.mapsUrl} target="_blank" rel="noopener noreferrer">Open in Maps</a>}</div></article>;})}</section>
 </>;
}
