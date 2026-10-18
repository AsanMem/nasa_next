"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRef } from "react";
import { AsteroidPortrait, SpeedComparison } from "./comparisons";
import { asteroidHref, CatalogEntry, classification, dateLabel, numberLabel, SortField, sortCatalog } from "@/app/lib/asteroids/view-model";
import AsteroidScene from "./asteroid-scene";
import s from "./asteroids.module.css";
import orbital from "../orbital/orbital.module.css";

const compactNumber=new Intl.NumberFormat("en-US",{notation:"compact",maximumFractionDigits:1});
export default function AsteroidCatalog({ entries, sourceDate, unavailable, fallback }: { entries: CatalogEntry[]; sourceDate: string; unavailable: boolean; fallback: boolean }) {
  const params = useSearchParams();
  const preview = useRef<HTMLElement>(null);
  const showPreview=()=>{preview.current?.focus({preventScroll:true});preview.current?.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth",block:"start"});};
  const query = params.get("q") ?? "";
  const sort = (["distance", "diameter", "speed"].includes(params.get("sort") ?? "") ? params.get("sort") : "distance") as SortField;
  const ordered = sortCatalog(entries, sort);
  if(sort!=="distance")ordered.sort((a,b)=>{
    const left=sort==="diameter"?a.asteroid.diameter:a.event?.speed;
    const right=sort==="diameter"?b.asteroid.diameter:b.event?.speed;
    return left==null?(right==null?0:1):right==null?-1:right-left||a.asteroid.name.localeCompare(b.asteroid.name);
  });
  const filtered = ordered.filter(item => item.asteroid.name.toLowerCase().includes(query.toLowerCase().trim()));
  const selectionPool=query?filtered:entries;
  const selected = selectionPool.find(item => item.asteroid.id === params.get("object")) ?? (query?filtered[0]:sortCatalog(entries, "distance")[0]);
  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value); else next.delete(key);
    window.history.replaceState(null, "", `${window.location.pathname}${next.size ? `?${next}` : ""}`);
  }
  return <main className={`${orbital.theme} ${s.page}`}>
    <section ref={preview} tabIndex={-1} aria-label="Selected asteroid preview" className={s.catalogHero}>
      <div className={s.mobileCatalogHeading}><h1>Asteroids</h1><p>{dateLabel(sourceDate)}</p></div>
      <div className={s.catalogIntro}><p className={s.eyebrow}>Our celestial neighborhood</p><p className={s.catalogDisplay}>Passing<br />through.</p><p className={s.lead}>Small worlds. Extraordinary journeys.<br />Meet the asteroids passing near Earth.</p><a className={s.textLink} href="#asteroid-catalog">Find your object <span aria-hidden="true">↓</span></a>{selected && <SpeedComparison speed={selected.event?.speed}/>}</div>
      <div className={s.catalogScene}>{selected ? <AsteroidScene id={selected.asteroid.id} speed={selected.event?.speed} diameter={selected.asteroid.diameter} compact /> : <div className={s.emptyScene} aria-hidden="true" />}</div>
      {selected && <div className={s.selectedSummary} aria-live="polite"><div className={s.selectedIdentity}><p className={s.eyebrow}>Selected object · {dateLabel(selected.event?.date)}</p><h2>{selected.asteroid.name}</h2><p>{classification(selected.asteroid.hazardous)}</p></div><div className={s.summaryMetric}><span>Distance from {selected.event?.body ?? "Earth"}</span><strong>{numberLabel(selected.event?.distance,0)} <small>{selected.event?.distance != null ? "km" : ""}</small></strong></div><Link className={`${orbital.button} ${s.exploreAction}`} prefetch={true} href={asteroidHref(selected.asteroid.id, selected.event?.date)}><span><strong>Explore this asteroid</strong><small>3D view, size & future flybys</small></span><span aria-hidden="true">↗</span></Link></div>}
    </section>
    <section id="asteroid-catalog" className={s.catalog} aria-labelledby="catalog-title">
      <div className={s.sectionHeading}><div><p className={s.eyebrow}>NASA close approaches · {dateLabel(sourceDate)}</p><h1 id="catalog-title">Asteroids</h1></div><p>{unavailable ? "NASA data is temporarily unavailable. Please try again shortly." : "Select an asteroid to see its shape, size and next close approach."}{fallback && " Showing the latest available feed date."}</p></div>
      <div className={s.catalogTools}><span role="status">{filtered.length} {filtered.length === 1 ? "asteroid" : "asteroids"}</span><details className={s.designationSearch} open={query?true:undefined}><summary aria-label="Find by designation" title="Find by designation"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="6" stroke="currentColor" strokeWidth="1.4"/><path d="m15 15 5 5" stroke="currentColor" strokeWidth="1.4"/></svg></summary><div className={s.designationPanel}><label>Asteroid name or number<input type="search" placeholder="Name or number" value={query} onChange={event => update("q",event.target.value)} /></label>{query&&<button type="button" className={s.textLink} onClick={()=>update("q","")}>Clear search</button>}</div></details><label>Sort<select aria-label="Sort asteroids" value={sort} onChange={event => update("sort",event.target.value)}><option value="distance">Closest</option><option value="diameter">Largest</option><option value="speed">Fastest</option></select></label></div>
      {filtered.length ? <div className={s.catalogRows} role="group" aria-label="Select an asteroid"><div className={s.columnLabels} aria-hidden="true"><span>Object</span><span>Diameter midpoint</span><span>Speed</span><span>Miss distance</span><span /></div>{filtered.map(({asteroid, event}) => {
        const fullLabel=`${asteroid.name}. Distance from ${event?.body??"unknown body"}: ${numberLabel(event?.distance,0)} km. Estimated diameter: ${numberLabel(asteroid.diameter)} m. Speed: ${numberLabel(event?.speed)} km/s.`;
        return <div key={asteroid.id} className={s.catalogRowShell}>
          <button type="button" className={`${s.catalogRow} ${s.desktopCatalogRow}`} aria-label={fullLabel} aria-pressed={selected?.asteroid.id === asteroid.id} onClick={() => update("object",asteroid.id)} onDoubleClick={() => { update("object",asteroid.id); showPreview(); }}><span className={s.rowName}>{asteroid.name}{asteroid.hazardous===true&&<small>Potentially hazardous</small>}</span><span>{numberLabel(asteroid.diameter)}{asteroid.diameter !== null && " m"}</span><span>{numberLabel(event?.speed)}{event?.speed != null && " km/s"}</span><span>{numberLabel(event?.distance,0)}{event?.distance != null && " km"}</span><span className={s.rowArrow} aria-hidden="true">{selected?.asteroid.id === asteroid.id ? "●" : "↗"}</span></button>
          <Link className={s.mobileAsteroidRow} href={asteroidHref(asteroid.id,event?.date)} aria-label={`Open asteroid. ${fullLabel}`}><span className={s.rowPortrait} aria-hidden="true"><AsteroidPortrait id={asteroid.id} diameter={asteroid.diameter} thumbnail /></span><span className={s.rowFacts}><strong>{event?.distance==null?"Distance unknown":compactNumber.format(event.distance)+" km"}<small>{event?.body?`from ${event.body}`:"Body unknown"}</small></strong><span>Size {numberLabel(asteroid.diameter)}{asteroid.diameter!=null&&" m"}<span aria-hidden="true"> · </span>{numberLabel(event?.speed)}{event?.speed!=null&&" km/s"}</span><small>{asteroid.name}</small></span><span className={s.rowOpen} aria-hidden="true">↗</span></Link>
        </div>;
      })}</div> : <div className={s.empty}><h3>{unavailable ? "Asteroids unavailable" : query ? "No matching asteroids" : "No approaches in this snapshot"}</h3><p>{query ? "Try another designation or clear your search." : "No objects have been invented to fill this view."}</p>{query ? <button className={`${orbital.button} ${orbital.quiet}`} onClick={() => update("q", "")}>Clear search</button> : <a className={`${orbital.button} ${orbital.quiet}`} href="/asteroids">Refresh NASA snapshot</a>}</div>}
      {selected && <div className={s.catalogContinue}><span>Continue with {selected.asteroid.name}</span><button type="button" className={s.textLink} onClick={showPreview}>Show selected object ↑</button><Link href={asteroidHref(selected.asteroid.id, selected.event?.date)} className={s.textLink}>Explore this asteroid ↗</Link></div>}
      <p className={s.sourceNote}>Source: NASA NeoWs. Distances in the compact list are rounded; open an asteroid for the full measurement. Diameter is an estimate. Shapes and surfaces are artistic reconstructions. “Potentially hazardous” is a catalog classification, not a prediction of impact.</p>
    </section>
  </main>;
}
