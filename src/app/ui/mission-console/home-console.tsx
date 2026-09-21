"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ROUTES } from "@/app/lib/constants/routes";
import { ArrowIcon, MissionButton, MissionCard } from "./primitives";
import PlanetScene from "./planet-scene";
import styles from "./home-console.module.css";

const destinations = [
  { title: "Near-Earth objects", description: "Meet the asteroids passing through our corner of space.", href: ROUTES.neos, category: "Our neighborhood", image: "/media/main/1.optimized.webp" },
  { title: "Image of the day", description: "A new perspective on the universe, selected by NASA.", href: ROUTES.apod, category: "A daily discovery", image: "/media/main/3.optimized.webp" },
  { title: "Earth events", description: "Follow the fires, storms and natural events shaping our planet.", href: ROUTES.eonet, category: "A changing planet", image: "/media/eonet/1.jpg" },
  { title: "Space weather", description: "Explore solar activity and its effects beyond the Sun.", href: ROUTES.spaceWeather, category: "The Sun's influence" },
  { title: "Image gallery", description: "Look closer at the places, people and missions of NASA.", href: ROUTES.images, category: "The photographic archive", image: "/media/main/4.optimized.webp" },
  { title: "Films from space", description: "Watch exploration unfold, from launchpad to deep space.", href: ROUTES.videos, category: "Missions in motion", image: "/media/stack_videos/ISS071-E-226528-227449-20240625-Night.poster.jpg" },
];

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
    <main className={styles.console}>
      <a className={styles.skipLink} href="#destinations">Skip to destinations</a>
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="Orbital home">
          <Image src="/media/logo/NASA_logo.png" alt="NASA" width={58} height={48} priority />
          <span>Orbital<span className={styles.brandSubtitle}>An independent NASA explorer</span></span>
        </Link>
        <nav aria-label="Main navigation" className={styles.navigation}>
          <a href="#destinations">Explore</a>
          <Link href={ROUTES.apod}>Image of the day</Link>
          <Link href={ROUTES.library} className={styles.archiveLink}>NASA archive <ArrowIcon /></Link>
        </nav>
      </header>

      <section className={styles.hero} aria-labelledby="console-title">
        <div className={styles.starfield} aria-hidden="true" />
        <div className={styles.sceneComposition}>
          <PlanetScene paused={paused || reducedMotion} />
          <span className={styles.earthCaption} aria-hidden="true"><span /> Our home planet</span>
        </div>
        <div className={styles.heroCopy}>
          <p className={styles.intro}>A little curiosity. An entire universe.</p>
          <h1 id="console-title">Our world.<br />And beyond.</h1>
          <p className={styles.description}>From the Earth beneath us to the objects passing by. Explore our universe through NASA&apos;s observations, images and discoveries.</p>
          <div className={styles.heroActions}>
            <MissionButton href={ROUTES.neos}>Explore near-Earth objects</MissionButton>
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

      <footer className={styles.footer}>
        <div><Link href="/" className={styles.footerBrand}>Orbital</Link><p>Space is closer than you think.</p></div>
        <p>An independent exploration project.<br />Powered by NASA&apos;s public data.</p>
        <a href="#console-title">Back to the beginning <span className={styles.upArrow}><ArrowIcon /></span></a>
      </footer>
    </main>
  );
}
