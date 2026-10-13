"use client";
import { useState } from "react";
import { useOrbitalScene } from "../orbital/scene-provider";
import s from "../orbital/chapters.module.css";

export default function SolarScene() {
  const [paused, setPaused] = useState(false);
  const { host, status, reduced } = useOrbitalScene({ kind: "solar", paused });
  return <>
    <div className={s.solarViewport} role="img" aria-label="Illustrative three-dimensional Sun and Earth, with animated plasma loops and particles bending around Earth's magnetic environment. Not to scale or a current event.">
      <div ref={host} className={s.solarCanvas} data-ready={status === "ready"} aria-hidden="true" />
      {status === "loading" && <p className={s.solarStatus} role="status">Preparing the solar environment...</p>}
      {status === "failed" && <div className={s.solarStatic}><span className={s.staticSun} /><span className={s.staticStream} /><span className={s.staticSolarEarth} /><p>3D is unavailable. Static illustrative view.</p></div>}
    </div>
    <div className={s.solarSceneFooter}><div className={s.solarLabels}><span>Sun / plasma loops</span><span>Earth / magnetic environment</span></div><button type="button" className={s.chip} disabled={reduced || status !== "ready"} aria-pressed={paused || reduced} onClick={() => setPaused(value => !value)}>{reduced ? "Reduced motion: static view" : paused ? "Play solar animation" : "Pause solar animation"}</button></div>
  </>;
}
