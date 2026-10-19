"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Asteroid, nextEarthEncounter, classification, dateLabel, numberLabel, selectApproach, validDate } from "@/app/lib/asteroids/view-model";
import AsteroidScene from "./asteroid-scene";
import EncounterStory from "./encounter-story";
import { DistanceComparison, SizeComparison, SpeedComparison } from "./comparisons";
import { defaultSizeReference, sizeReference, SIZE_REFERENCES, validComparisonDiameter, type SizeReferenceId } from "@/app/lib/asteroids/size-reference";
import s from "./asteroids.module.css";
import orbital from "../orbital/orbital.module.css";

export default function AsteroidJourney({ asteroid, today }: { asteroid: Asteroid; today: string }) {
  const params = useSearchParams();
  const requested = params.get("date");
  const selectedKey = params.get("event");
  const selected = asteroid.approaches.find(event => event.key === selectedKey && event.date === requested) ?? selectApproach(asteroid.approaches, requested, today);
  const [stage, setStage] = useState("object");
  const [historyActive,setHistoryActive]=useState(false);
  const [referenceChoice, setReferenceChoice] = useState<"auto" | SizeReferenceId>("auto");
  const automaticReference = defaultSizeReference(asteroid.diameter);
  const reference = sizeReference(referenceChoice === "auto" ? automaticReference : referenceChoice);
  useEffect(() => { setReferenceChoice("auto"); }, [asteroid.id]);
  const nextEncounter = nextEarthEncounter(asteroid.approaches, selected);
  const progress = useRef(0);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};
    void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([{gsap}, {ScrollTrigger}]) => {
      if (disposed) return;
      gsap.registerPlugin(ScrollTrigger);
      const media = gsap.matchMedia();
      media.add("(min-width: 1000px) and (prefers-reduced-motion: no-preference)", () => {
        const sections = root.current?.querySelectorAll<HTMLElement>("[data-chapter]") ?? [];
        sections.forEach((section, index) => {
          ScrollTrigger.create({ trigger: section, start: "top 55%", end: "bottom 55%", onToggle: self => { if (self.isActive) setStage(section.dataset.chapter ?? "object"); } });
          if (index === 1) ScrollTrigger.create({ trigger: section, start: "top bottom", end: "top 30%", scrub: true, onUpdate: self => { progress.current = self.progress; } });
        });
        return () => { progress.current = 0; setStage("object"); };
      });
      cleanup = () => media.revert();
    });
    return () => { disposed = true; cleanup(); };
  }, []);
  function selectEvent(key: string, date: string) {
    const next = new URLSearchParams(params.toString()); next.set("date", date); next.set("event", key);
    window.history.replaceState(null, "", `${window.location.pathname}?${next}${window.location.hash}`);
  }
  return <main className={`${orbital.theme} ${s.page}`}>
    <div className={s.breadcrumb}><Link href="/asteroids">← All near-Earth objects</Link><span>One small world. A different perspective.</span></div>
    <div className={s.journey} ref={root}>
      <div className={s.journeyVisual} data-stage={stage}>
        <AsteroidScene id={asteroid.id} enabled={!historyActive} speed={selected?.speed} progress={progress} diameter={asteroid.diameter} sizeReference={reference.id} sizeMode={stage === "size"} active={stage !== "distance"} />
        <div className={s.stageFigure} data-visible={stage === "distance"} aria-hidden={stage !== "distance"}><DistanceComparison id={asteroid.id} event={selected} /></div>
      </div>
      <div className={s.chapters}>
        <section data-chapter="object" className={s.chapterSection}>
          <p className={s.eyebrow}>An encounter with</p><h1 className={s.objectTitle}>{asteroid.name}</h1><p className={s.lead}>A fragment of our solar system.<br />A world with a story of its own.</p>
          <p className={s.classification}>{classification(asteroid.hazardous)}</p>
          <div className={s.eventHeading}><span>Selected approach to {selected?.body ?? "unknown body"}</span><strong>{dateLabel(selected?.date)}</strong></div>
          {requested && (!validDate(requested) || selected?.date !== requested) && <p className={s.notice} role="status">{validDate(requested) ? "The requested encounter is not present in NASA’s response." : "The date in this link is invalid."} Showing {selected ? "the next upcoming or latest known Earth encounter instead" : "no event; no Earth encounters are available"}.</p>}
          <dl className={s.metrics}><div><dt>Miss distance</dt><dd>{numberLabel(selected?.distance,0)} <small>{selected?.distance != null && "km"}</small></dd></div><div><dt>Relative speed</dt><dd>{numberLabel(selected?.speed,2)} <small>{selected?.speed != null && "km/s"}</small></dd></div></dl>
          <nav className={s.storyLinks} aria-label="Explore this asteroid"><Link className={s.textLink} href="#size-story">Size & distance ↓</Link><Link className={s.textLink} href="#encounters">Past & future encounters ↓</Link></nav>
          <div className={s.nextEncounter}><span>Next Earth encounter after {dateLabel(selected?.date)}</span>{nextEncounter ? <button type="button" onClick={() => { selectEvent(nextEncounter.key,nextEncounter.date); document.getElementById("encounters")?.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth"}); }}><strong>{nextEncounter.date.slice(0,4)}</strong><span>{dateLabel(nextEncounter.date)}<small>Explore this encounter ↗</small></span></button> : <p>No later Earth encounter is listed in NASA’s response.</p>}</div>
        </section>
        <section id="size-story" data-chapter="size" className={s.chapterSection}>
          <p className={s.eyebrow}>A familiar sense of scale</p><h2>Small is<br />relative.</h2><p className={s.lead}>Compare this small world with something you know.</p>
          <dl className={s.metrics}><div><dt>NASA estimated diameter</dt><dd>{asteroid.diameter ? <>{numberLabel(asteroid.minDiameter,2)}–{numberLabel(asteroid.maxDiameter,2)} <small>m</small></> : "Unknown"}</dd></div></dl>
          <label className={s.sizeReferenceControl}>Compare with
            <select aria-label="Compare with" value={referenceChoice} disabled={!validComparisonDiameter(asteroid.diameter)} onChange={event=>setReferenceChoice(event.target.value as "auto" | SizeReferenceId)}>
              <option value="auto">Automatic · {sizeReference(automaticReference).label}</option>
              {SIZE_REFERENCES.map(item=><option key={item.id} value={item.id}>{item.label} · {item.metres} m {item.dimension}</option>)}
            </select>
          </label>
          <p>{validComparisonDiameter(asteroid.diameter) ? <>We use the range midpoint, {numberLabel(asteroid.diameter,2)} m. Its representative diameter is about {numberLabel(asteroid.diameter/reference.metres,2)} times {reference.label === "Person" ? "the person’s" : `${reference.label}’s`} {reference.dimension}.</> : "NASA has not supplied a valid diameter range, so a scale comparison is unavailable."}</p>
          <div className={s.mobileFigure}><SizeComparison asteroid={asteroid} referenceId={reference.id}/></div>
          <p className={s.sourceNote}>{reference.note} {reference.source && <a href={reference.source.url} target="_blank" rel="noreferrer">{reference.source.label} ↗</a>}</p>
          <p className={s.sourceNote}>Shape and surface are artistic reconstructions, not a spacecraft observation of this asteroid.</p>
        </section>
        <section data-chapter="distance" className={s.chapterSection}>
          <p className={s.eyebrow}>The space between</p><h2>Near, on a<br />cosmic scale.</h2><p className={s.lead}>“Close” has a different meaning out here. Use the Earth–Moon distance as a familiar reference.</p>
          <dl className={s.metrics}><div><dt>{dateLabel(selected?.date)} · distance from {selected?.body ?? "unknown body"}</dt><dd>{numberLabel(selected?.distance,0)} <small>{selected?.distance != null && "km"}</small></dd></div><div><dt>In lunar distances</dt><dd>{numberLabel(selected?.lunar,2)} <small>{selected?.lunar != null && "LD"}</small></dd></div></dl>
          <SpeedComparison speed={selected?.speed}/><div className={s.mobileFigure}><DistanceComparison id={asteroid.id} event={selected}/></div>
          <p className={s.sourceNote}>One lunar distance is approximately 384,400 km. This diagram explains distance; it does not plot an orbit or predict a collision.</p>
        </section>
      </div>
    </div>
    <section id="encounters" className={s.history} aria-labelledby="history-title"><div className={s.sectionHeading}><div><p className={s.eyebrow}>Encounters across time</p><h2 id="history-title">Past & future encounters.</h2></div><p>Follow the years. Explore the close approaches NASA has recorded and predicted.</p></div>
      <EncounterStory key={asteroid.id} id={asteroid.id} diameter={asteroid.diameter} events={asteroid.approaches} selected={selected} today={today} onSelect={event=>selectEvent(event.key,event.date)} onActiveChange={setHistoryActive}/>
      <details className={s.orbitDetails}><summary>Behind the observations · full orbital data <span aria-hidden="true">+</span></summary><p>Original NASA field names and values. Distances in orbital fields use AU, angles use degrees and the orbital period uses days; these describe the orbit, not the selected encounter.</p><dl>{asteroid.orbit.map(([key,value],index) => <div key={`${key}-${index}`}><dt>{key}</dt><dd>{value}</dd></div>)}<div><dt>Sentry monitored</dt><dd>{asteroid.sentry === null ? "Unknown" : asteroid.sentry ? "Yes" : "No"}</dd></div></dl>{asteroid.jplUrl && <a className={s.textLink} href={asteroid.jplUrl} target="_blank" rel="noreferrer">Open NASA / JPL source ↗</a>}</details>
    </section>
    <footer className={s.journeyEnd}><p className={s.eyebrow}>Keep looking up</p><h2>There’s more<br />beyond this world.</h2><div><Link className={orbital.button} href="/asteroids">Choose another asteroid ↗</Link><Link className={s.textLink} href="/day">Discover today’s media ↗</Link></div></footer>
  </main>;
}
