"use client";

import OrbitalHeader from "../orbital/orbital-header";
import { destinations } from "../orbital/destinations";
import orbital from "../orbital/orbital.module.css";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ROUTES } from "@/app/lib/constants/routes";
import { ArrowIcon, MissionButton, MissionCard } from "./primitives";
import PlanetScene from "./planet-scene";
import styles from "./home-console.module.css";

export default function HomeConsole() {
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  return (
    <main className={`${orbital.theme} ${styles.console}`}>
      <a className={styles.skipLink} href="#destinations">Skip to destinations</a>
      <OrbitalHeader />

      <section className={styles.hero} aria-labelledby="console-title">
        <div className={styles.starfield} aria-hidden="true" />
        <div className={styles.sceneComposition}>
          <PlanetScene paused={paused || reducedMotion} />
          <span className={styles.earthCaption} aria-hidden="true"><span /> Our home planet</span>
        </div>
        <div className={styles.heroCopy}>
          <p className={styles.intro}>A little curiosity. An entire universe.</p>
          <h1 id="console-title">Our world.<br />And beyond.</h1>
          <p className={styles.description}>Our planet. Passing asteroids. A universe to explore.</p>
          <div className={styles.heroActions}>
            <Link href={ROUTES.neos} className={styles.asteroidCta}><span><strong>Explore asteroids</strong><small>How close do they pass Earth?</small></span><span className={styles.ctaArrow} aria-hidden="true"><ArrowIcon /></span></Link>
            <MissionButton href={ROUTES.apod} variant="quiet">Discover today&apos;s image</MissionButton>
          </div>
        </div>
        <div className={styles.heroBottom}>
          <a href="#destinations" className={styles.scrollLink}><span className={styles.downArrow}><ArrowIcon /></span> There&apos;s more to explore</a>
          <div className={styles.sceneControls}>
            <span>Earth &amp; Moon <span className={styles.sceneNote}> / Illustrative view</span></span>
            <button type="button" disabled={reducedMotion} aria-pressed={paused || reducedMotion} onClick={() => setPaused(value => !value)} aria-label={reducedMotion ? "Motion disabled by your preference" : paused ? "Resume orbital motion" : "Pause orbital motion"}>
              {paused || reducedMotion ? <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m5 3 7 5-7 5Z" fill="currentColor" /></svg> : <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3v10M11 3v10" stroke="currentColor" strokeWidth="2" /></svg>}
            </button>
          </div>
        </div>
      </section>

      <section id="destinations" className={styles.expedition} aria-labelledby="destinations-title" tabIndex={-1}>
        <div className={styles.expeditionIntro}>
          <p className={styles.sectionLabel}>The expedition continues</p>
          <h2 id="destinations-title">Follow your<br />curiosity.</h2>
          <p>Start close to home.<br />See where it takes you.</p>
          <div className={styles.orbitDiagram} aria-hidden="true"><div /><span /><i /></div>
          <p className={styles.sourceNote}>Six ways into NASA&apos;s open data<br />and extraordinary image archives.</p>
        </div>
        <div className={styles.destinationList}>
          {destinations.map(destination => <MissionCard key={destination.href} {...destination} />)}
        </div>
      </section>

      <section className={styles.observationEntrances} aria-label="More ways to observe">
        <Link href="/epic"><span className={styles.entranceImage} style={{backgroundImage:"url(/media/orbital/earth.jpg)"}} aria-hidden="true"/><span><h2>EPIC observations</h2><p>Earth, frame by frame.</p></span><span aria-hidden="true">↗</span></Link>
        <Link href="/library"><span className={styles.entranceImage} style={{backgroundImage:"url(/media/main/3.optimized.webp)"}} aria-hidden="true"/><span><h2>Observation journal</h2><p>Recent discoveries and reports.</p></span><span aria-hidden="true">↗</span></Link>
        <Link href="/birthday"><span className={styles.entranceImage} style={{backgroundImage:"url(/media/sky/birth-sky-preview.webp)"}} aria-hidden="true"/><span><h2>Your birth sky</h2><p>See your first sky. Make it a poster.</p></span><span aria-hidden="true">↗</span></Link>
        <Link href="/learn"><span className={styles.entranceImage} style={{backgroundImage:"url(/orbital-lessons.svg)"}} aria-hidden="true"/><span><h2>For teachers</h2><p>Five ready-to-use lesson collections.</p></span><span aria-hidden="true">↗</span></Link>
      </section>
      <footer className={styles.footer}>
        <div><Link href="/" className={styles.footerBrand}>Orbital</Link><p>Space is closer than you think.</p></div>
        <Link href="/privacy">Privacy & sources</Link><p>By Asan Memetov.<br />Powered by NASA&apos;s public data.</p>
        <a href="#console-title">Back to the beginning <span className={styles.upArrow}><ArrowIcon /></span></a>
      </footer>
    </main>
  );
}
