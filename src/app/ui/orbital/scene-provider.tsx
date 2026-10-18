"use client";
import { createContext, ReactNode, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import type { SceneBinding, SceneConfig, SceneEngine, SceneStatus } from "./scene-types";

type SceneAPI = { register(binding: SceneBinding): () => void; update(host: HTMLElement, config: SceneConfig): void; rotate(direction: number): void; reset(): void };
const SceneContext = createContext<SceneAPI | null>(null);
export default function OrbitalSceneProvider({ children }: { children: ReactNode }) {
  const layer = useRef<HTMLDivElement>(null), engine = useRef<SceneEngine | null>(null), current = useRef<SceneBinding | null>(null);
  const cleanupTimer = useRef<ReturnType<typeof setTimeout>>();
  const alive = useRef(true);
  const pathname = usePathname();
  const api = useMemo<SceneAPI>(() => ({
    register(binding) {
      clearTimeout(cleanupTimer.current); current.current = binding;
      let cancelled = false;
      const observer = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        void import("./scene-engine").then(({ createSceneEngine }) => {
          if (cancelled || !alive.current || current.current !== binding || !layer.current) return;
          engine.current ??= createSceneEngine(layer.current);
          engine.current.attach(binding);
        }).catch((error) => { console.warn("[Orbital scene]", error); if (!cancelled && current.current === binding) binding.status("failed"); });
      }, { rootMargin: "100px" });
      observer.observe(binding.host);
      return () => {
        cancelled = true; observer.disconnect();
        if (current.current !== binding) return;
        current.current = null; engine.current?.detach(binding.host);
        cleanupTimer.current = setTimeout(() => { if (!current.current) { engine.current?.dispose(); engine.current = null; } }, 8000);
      };
    },
    update(host, config) { if (current.current?.host === host) { engine.current?.update(config); current.current.config = config; } },
    rotate(direction) { engine.current?.rotate(direction); }, reset() { engine.current?.reset(); },
  }), []);
  useEffect(() => {
    alive.current = true;
    const click = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element)?.closest<HTMLAnchorElement>("a[href]");
      if (!link || link.target && link.target !== "_self" || link.hasAttribute("download")) return;
      const destination = new URL(link.href, window.location.href);
      if (destination.origin !== window.location.origin || destination.pathname === window.location.pathname) return;
      engine.current?.depart(destination.pathname);
    };
    const pop = () => engine.current?.cancelFlight();
    document.addEventListener("click", click, true); window.addEventListener("popstate", pop);
    return () => { alive.current = false; document.removeEventListener("click", click, true); window.removeEventListener("popstate", pop); clearTimeout(cleanupTimer.current); engine.current?.dispose(); engine.current = null; };
  }, []);
  useEffect(() => {
    if (pathname === "/birthday" || pathname === "/space-weather" || pathname === "/eonet" || pathname === "/" || pathname === "/asteroids" || /^\/asteroids\/[^/]+\/[^/]+$/.test(pathname)) return;
    engine.current?.dispose(); engine.current = null;
  }, [pathname]);
  return <SceneContext.Provider value={api}>{children}<div ref={layer} data-orbital-flight="true" aria-hidden="true" style={{ display: "none", position: "fixed", pointerEvents: "none", zIndex: 30, overflow: "hidden" }} /></SceneContext.Provider>;
}
export function useOrbitalScene(config: SceneConfig, enabled = true) {
  const api = useContext(SceneContext);
  if (!api) throw new Error("OrbitalSceneProvider is required");
  const host = useRef<HTMLDivElement>(null), latest = useRef(config);
  latest.current = config;
  const [status, setStatus] = useState<SceneStatus>("loading");
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (!host.current || !enabled) return;
    setStatus("loading");
    return api.register({ host: host.current, config: latest.current, status: setStatus });
  }, [api,enabled]);
  useEffect(() => { if (host.current && enabled) api.update(host.current, config); }, [api, config,enabled]);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches); update(); media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return { host, status:enabled?status:"loading" as SceneStatus, reduced, rotate: api.rotate, reset: api.reset };
}
