"use client";
import { useOrbitalScene } from "../orbital/scene-provider";
import styles from "./home-console.module.css";
export default function PlanetScene({ paused }: { paused: boolean }) {
  const { host, status } = useOrbitalScene({ kind: "home", paused });
  const ready = status === "ready";
  return <div className={styles.planetScene} role="img" aria-label="Illustration of Earth with the Moon on an orbital path; distances and positions are not to scale.">
    <div className={styles.planetFallback} data-hidden={ready} aria-hidden="true"><div className={styles.fallbackOrbit} /><div className={styles.fallbackEarth} /><div className={styles.fallbackMoon} /></div>
    <div ref={host} className={styles.canvasHost} data-ready={ready} aria-hidden="true" />
  </div>;
}
