"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRef } from "react";
import { SpeedComparison } from "./comparisons";
import { asteroidHref, CatalogEntry, classification, dateLabel, numberLabel, SortField, sortCatalog } from "@/app/lib/asteroids/view-model";
import AsteroidScene from "./asteroid-scene";
import s from "./asteroids.module.css";
import orbital from "../orbital/orbital.module.css";

export default function AsteroidCatalog({ entries, sourceDate, unavailable, fallback }: { entries: CatalogEntry[]; sourceDate: string; unavailable: boolean; fallback: boolean }) {
  const params = useSearchParams();
  const preview = useRef<HTMLElement>(null);
  function showPreview() {
    preview.current?.focus({ preventScroll: true });
    preview.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
  }
  const query = params.get("q") ?? "";
  const sort = (["distance", "diameter", "speed"].includes(params.get("sort") ?? "") ? params.get("sort") : "distance") as SortField;
  const ordered = sortCatalog(entries, sort);
  const filtered = ordered.filter(item => item.asteroid.name.toLowerCase().includes(query.toLowerCase().trim()));
  const selected = entries.find(item => item.asteroid.id === params.get("object")) ?? sortCatalog(entries, "distance")[0];
  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value); else next.delete(key);
    window.history.replaceState(null, "", `${window.location.pathname}${next.size ? `?${next}` : ""}`);
  }
  return <main className={`${orbital.theme} ${s.page}`}>
    <section ref={preview} tabIndex={-1} aria-label="Selected asteroid preview" className={s.catalogHero}>
      <div className={s.catalogIntro}><p className={s.eyebrow}>Our celestial neighborhood</p><h1>Passing<br />through.</h1><p className={s.lead}>Small worlds. Extraordinary journeys.<br />Meet the asteroids passing near Earth.</p><a className={s.textLink} href="#asteroid-catalog">Find your object <span aria-hidden="true">↓</span></a>{selected && <SpeedComparison speed={selected.event?.speed}/>}</div>
      <div className={s.catalogScene}>{selected ? <AsteroidScene id={selected.asteroid.id} speed={selected.event?.speed} compact /> : <div className={s.emptyScene} aria-hidden="true" />}</div>
      {selected && <div className={s.selectedSummary} aria-live="polite"><div><p className={s.eyebrow}>Selected object · {dateLabel(selected.event?.date)}</p><h2>{selected.asteroid.name}</h2><p>{classification(selected.asteroid.hazardous)}</p></div><div className={s.summaryMetric}><span>Distance from {selected.event?.body ?? "Earth"}</span><strong>{numberLabel(selected.event?.distance,0)} <small>{selected.event?.distance != null ? "km" : ""}</small></strong></div><Link className={orbital.button} href={asteroidHref(selected.asteroid.id, selected.event?.date)}>Explore this object <span aria-hidden="true">↗</span></Link></div>}
    </section>
    <section id="asteroid-catalog" className={s.catalog} aria-labelledby="catalog-title">
      <div className={s.sectionHeading}><div><p className={s.eyebrow}>NASA close approaches · {dateLabel(sourceDate)}</p><h2 id="catalog-title">Choose a world.</h2></div><p>{unavailable ? "NASA data is temporarily unavailable. Please try again shortly." : `${entries.length} objects in this snapshot. Select a row to preview. Double-click to return to the object above, or explore its story.`}{fallback && " Showing the latest available feed date."}</p></div>
      <div className={s.filters}><label>Search by name<input type="search" placeholder="Try an asteroid designation…" value={query} onChange={event => update("q",event.target.value)} /></label><label>Sort by<select value={sort} onChange={event => update("sort",event.target.value)}><option value="distance">Distance · nearest first</option><option value="diameter">Size · smallest first</option><option value="speed">Speed · slowest first</option></select></label><span role="status">{filtered.length} {filtered.length === 1 ? "object" : "objects"}</span></div>
      {filtered.length ? <div className={s.catalogRows} role="group" aria-label="Select an asteroid"><div className={s.columnLabels} aria-hidden="true"><span>Object</span><span>Diameter midpoint</span><span>Speed</span><span>Miss distance</span><span /></div>{filtered.map(({asteroid, event}) => <button key={asteroid.id} type="button" className={s.catalogRow} aria-pressed={selected?.asteroid.id === asteroid.id} onClick={() => update("object",asteroid.id)} onDoubleClick={() => { update("object",asteroid.id); showPreview(); }}><span className={s.rowName}>{asteroid.name}<small>{asteroid.hazardous === true ? "Potentially hazardous" : asteroid.hazardous === false ? "Near-Earth asteroid" : "Classification unknown"}</small></span><span><small className={s.mobileLabel}>Diameter midpoint</small>{numberLabel(asteroid.diameter)}{asteroid.diameter !== null && " m"}</span><span><small className={s.mobileLabel}>Speed</small>{numberLabel(event?.speed)}{event?.speed != null && " km/s"}</span><span><small className={s.mobileLabel}>Miss distance</small>{numberLabel(event?.distance,0)}{event?.distance != null && " km"}</span><span className={s.rowArrow} aria-hidden="true">{selected?.asteroid.id === asteroid.id ? "●" : "↗"}</span></button>)}</div> : <div className={s.empty}><h3>{unavailable ? "The sky can wait a moment." : query ? "No matching objects." : "No approaches in this snapshot."}</h3><p>{query ? "Try a shorter name or clear your search." : "No objects have been invented to fill this view."}</p>{query ? <button className={`${orbital.button} ${orbital.quiet}`} onClick={() => update("q", "")}>Clear search</button> : <a className={`${orbital.button} ${orbital.quiet}`} href="/asteroids">Refresh NASA snapshot</a>}</div>}
      {selected && <div className={s.catalogContinue}><span>Continue with {selected.asteroid.name}</span><button type="button" className={s.textLink} onClick={showPreview}>Show selected object ↑</button><Link href={asteroidHref(selected.asteroid.id, selected.event?.date)} className={s.textLink}>Get closer ↗</Link></div>}
      <p className={s.sourceNote}>Source: NASA NeoWs. Diameter is an estimate, not a measured shape. “Potentially hazardous” is a catalog classification, not a prediction of impact.</p>
    </section>
  </main>;
}
