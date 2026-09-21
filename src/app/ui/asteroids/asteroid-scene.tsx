"use client";
import { MutableRefObject, useState } from "react";
import { useOrbitalScene } from "../orbital/scene-provider";
import s from "./asteroids.module.css";
import { AsteroidPortrait, SizeComparison } from "./comparisons";
export default function AsteroidScene({ id, progress, compact = false, active = true, diameter = null, sizeMode = false, speed = null }: {
  id: string; progress?: MutableRefObject<number>; compact?: boolean; active?: boolean;
  diameter?: number | null; sizeMode?: boolean; speed?: number | null;
}) {
  const [paused, setPaused] = useState(false);
  const { host, status, reduced, rotate, reset } = useOrbitalScene({ kind: compact ? "catalog" : "profile", id, progress, paused, diameter, speed, mode: !active ? "distance" : sizeMode ? "size" : "object" });
  const ready = status === "ready";
  return <div className={s.scene} data-visual-id={id} data-visual-version="2">
    <div className={s.stars} aria-hidden="true" />
    {!sizeMode && <div className={s.portraitFallback} data-hidden={ready} aria-hidden={ready}><AsteroidPortrait id={id} /></div>}
    <div ref={host} className={s.canvas} data-ready={ready} aria-hidden={!ready} role="img" aria-label="Interactive artistic asteroid reconstruction. Drag to rotate, or use the rotation buttons." />
    {sizeMode && (!ready || !diameter) && <div className={s.stageFigure} data-visible="true"><SizeComparison asteroid={{ id, diameter }} /></div>}
    <div className={s.sceneFooter}>
      <p>{sizeMode ? `Diameter reference: ${diameter?.toLocaleString("en-US", {maximumFractionDigits:2}) ?? "Unknown"} m · Person: 1.8 m` : "Artistic surface reconstruction"}<br /><span>{status === "failed" ? "Static view · 3D unavailable" : sizeMode ? "Proportions preserved · representative dimension" : reduced ? "Reduced motion · manual rotation available" : "Drag to explore · illustrative motion"}</span></p>
      {!sizeMode && <div className={s.sceneControls} aria-label="Asteroid view controls">
        <button type="button" disabled={!ready} aria-label="Rotate left" onClick={() => rotate(-1)}>←</button>
        <button type="button" disabled={!ready} aria-label="Rotate right" onClick={() => rotate(1)}>→</button>
        <button type="button" disabled={!ready || reduced} aria-pressed={paused || reduced} onClick={() => setPaused(value => !value)}>{reduced ? "Motion off" : paused ? "Resume" : "Pause"}</button>
        <button type="button" disabled={!ready} onClick={reset}>Reset</button>
      </div>}
    </div>
  </div>;
}
