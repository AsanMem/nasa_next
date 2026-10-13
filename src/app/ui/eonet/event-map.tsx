"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { clusterPoints, type MapPoint } from "../../lib/observations/geography";
import { useOrbitalScene } from "../orbital/scene-provider";
import s from "../orbital/chapters.module.css";

export function CategoryIcon({ category }: { category: string }) {
  const paths = /fire/i.test(category) ? "M12 2C16 8 21 10 18 17C15 24 4 21 5 14C5 10 9 8 9 5C12 8 12 11 12 12C15 9 12 5 12 2Z" : /storm/i.test(category) ? "M4 14C0 7 10 4 13 7C20 3 25 14 18 15M13 12L8 18H13L10 23" : /volcan/i.test(category) ? "M2 21L9 9H15L22 21ZM10 5L8 2M14 5L17 2" : /ice|snow/i.test(category) ? "M12 2V22M3 7L21 17M3 17L21 7M8 4L12 8L16 4" : /flood|water/i.test(category) ? "M2 8Q5 4 8 8T14 8T22 8M2 14Q5 10 8 14T14 14T22 14M2 20Q5 16 8 20T14 20T22 20" : "M12 3L22 12L12 21L2 12Z";
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d={paths} /></svg>;
}
function Globe({ points, focus, paused, onFailure, children }: { points: MapPoint[]; focus?: MapPoint; paused: boolean; onFailure: () => void; children: React.ReactNode }) {
  const container = useRef<HTMLDivElement>(null);
  const projectMarkers = useCallback((projections: { id: string; x: number; y: number; visible: boolean }[]) => {
    for (const point of projections) {
      const element = container.current?.querySelector<HTMLElement>(`[data-marker="${CSS.escape(point.id)}"]`);
      if (element) { element.style.left = `${point.x}%`; element.style.top = `${point.y}%`; element.hidden = !point.visible; }
    }
  }, []);
  const config = useMemo(() => ({ kind: "events" as const, paused, focus, markers: points, projectMarkers }), [paused, focus, points, projectMarkers]);
  const { host, status } = useOrbitalScene(config);
  useEffect(() => { if (status === "failed") onFailure(); }, [status, onFailure]);
  return <div className={s.globeMap} ref={container}><div ref={host} className={s.globeHost} />{status !== "ready" && <p className={s.mapStatus} role="status">Preparing Earth reference…</p>}{children}</div>;
}
export default function EventMap({ points, selectedId, onSelect }: { points: MapPoint[]; selectedId?: string; onSelect: (id: string) => void }) {
  const [desktop, setDesktop] = useState(false), [failed, setFailed] = useState(false), [flat, setFlat] = useState(false), [paused, setPaused] = useState(true);
  const [reduced, setReduced] = useState(false);
  useEffect(() => { const media = matchMedia("(prefers-reduced-motion: reduce)"); const update = () => setReduced(media.matches); update(); media.addEventListener("change", update); return () => media.removeEventListener("change", update); }, []);
  const [expanded, setExpanded] = useState<string | null>(null);
  useEffect(() => { const media = matchMedia("(min-width: 761px)"); const update = () => setDesktop(media.matches); update(); media.addEventListener("change", update); return () => media.removeEventListener("change", update); }, []);
  useEffect(() => setPaused(true), [selectedId]);
  const fail = useCallback(() => setFailed(true), []);
  const groups = useMemo(() => clusterPoints(points, desktop ? 12 : 32), [points, desktop]);
  const anchors = useMemo(() => groups.map(group => group[0]), [groups]);
  const focus = points.find(point => point.id === selectedId);
  const globe = desktop && !failed && !flat;
  const pins = groups.map(group => <button key={group[0].id} data-marker={group[0].id} type="button" className={s.eventPin} style={{ left: `${(group[0].longitude + 180) / 3.6}%`, top: `${(90 - group[0].latitude) / 1.8}%` }} aria-label={group.length > 1 ? `Show ${group.length} nearby events` : `Select ${group[0].title}`} aria-pressed={group.some(point => point.id === selectedId)} onClick={() => { if (group.length > 1) setExpanded(group[0].id); else { setExpanded(null); onSelect(group[0].id); } }}><CategoryIcon category={group[0].category} />{group.length > 1 && <span>{group.length}</span>}</button>);
  const expandedGroup = groups.find(group => group[0].id === expanded);
  return <><div className={s.actions}><button className={s.chip} onClick={() => setFlat(value => !value)} disabled={!desktop || failed}>{globe ? "Use flat map" : "Flat map"}</button>{globe && <button className={s.chip} disabled={reduced} onClick={() => setPaused(value => !value)} aria-pressed={paused || reduced}>{reduced ? "Reduced motion" : paused ? "Rotate Earth" : "Pause rotation"}</button>}</div>
    {globe ? <Globe points={anchors} focus={focus} paused={paused} onFailure={fail}>{pins}</Globe> : <div className={s.worldMap} aria-label="Event locations on a reference map">{pins}</div>}
    {expandedGroup && <div className={s.clusterList} aria-label="Nearby events"><p>Nearby observations</p>{expandedGroup.map(point => <button className={s.chip} key={point.id} aria-pressed={selectedId === point.id} onClick={() => onSelect(point.id)}>{point.title}</button>)}<button className={s.chip} onClick={() => setExpanded(null)}>Close list</button></div>}
    <p className={s.caption}>{failed ? "3D is unavailable. " : ""}Reference imagery. Marks show reported locations, not affected areas or trajectories. Nearby marks are grouped. Every event is available in the list below.</p>
  </>;
}
