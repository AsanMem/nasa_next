"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./home-console.module.css";

/** An artistic Earth/Moon composition, not an ephemeris or scale model. */
export default function PlanetScene({ paused }: { paused: boolean }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const pauseRef = useRef(paused);
  const redrawRef = useRef<(() => void) | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    pauseRef.current = paused;
    redrawRef.current?.();
  }, [paused]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    let cleanup: (() => void) | undefined;

    async function initialize() {
      const THREE = await import("three");
      if (disposed || !host) return;
      let renderer: import("three").WebGLRenderer;
      try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" }); }
      catch { return; }

      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.setClearColor(0x000000, 0);
      renderer.domElement.setAttribute("aria-hidden", "true");
      host.appendChild(renderer.domElement);
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(36, 1, .1, 50);
      camera.position.set(0, .35, 7.6);
      camera.lookAt(0, 0, 0);
      const system = new THREE.Group();
      scene.add(system);
      scene.add(new THREE.AmbientLight(0xc3d8f2, .42));
      const sun = new THREE.DirectionalLight(0xfff3df, 3.1);
      sun.position.set(-3, 4, 5);
      scene.add(sun);

      const geometry = new THREE.SphereGeometry(1.38, 64, 48);
      const earthMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, shininess: 6, specular: 0x27333b });
      const earth = new THREE.Mesh(geometry, earthMaterial);
      earth.rotation.set(.12, 3.9, -.12);
      system.add(earth);

      const atmosphereGeometry = new THREE.SphereGeometry(1.414, 48, 32);
      const atmosphereMaterial = new THREE.ShaderMaterial({
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.BackSide,
        vertexShader: `varying vec3 vNormal; varying vec3 vView; void main(){ vec4 p = modelViewMatrix * vec4(position,1.0); vNormal = normalize(normalMatrix * normal); vView = normalize(-p.xyz); gl_Position = projectionMatrix * p; }`,
        fragmentShader: `varying vec3 vNormal; varying vec3 vView; void main(){ float rim = pow(1.0-abs(dot(normalize(vNormal), normalize(vView))),3.0); gl_FragColor = vec4(0.22,0.49,0.82,rim*0.48); }`,
      });
      system.add(new THREE.Mesh(atmosphereGeometry, atmosphereMaterial));
      const orbitalPlane = new THREE.Group();
      orbitalPlane.rotation.set(.05, -.18, -.40);
      system.add(orbitalPlane);
      const points = Array.from({ length: 181 }, (_, index) => {
        const angle = index / 180 * Math.PI * 2;
        return new THREE.Vector3(Math.cos(angle) * 2.35, Math.sin(angle) * .9, Math.sin(angle) * 2.17198);
      });
      const orbitGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xcfb799, transparent: true, opacity: .45 });
      orbitalPlane.add(new THREE.Line(orbitGeometry, orbitMaterial));
      const moonGeometry = new THREE.SphereGeometry(.23, 32, 24);
      const moonMaterial = new THREE.MeshPhongMaterial({ color: 0xd7d4ce, shininess: 0 });
      const moon = new THREE.Mesh(moonGeometry, moonMaterial);
      orbitalPlane.add(moon);
      let orbitTime = .68;
      let frame = 0;
      let lastTime = 0;
      let visible = true;
      let texturesReady = false;
      let failed = false;
      const textures: import("three").Texture[] = [];
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

      const draw = (time: number) => {
        frame = 0;
        if (disposed || failed || !texturesReady || !visible || document.hidden) { lastTime = 0; return; }
        const moving = !pauseRef.current && !reduced.matches;
        const delta = lastTime ? Math.min((time - lastTime) / 1000, .05) : 0;
        lastTime = moving ? time : 0;
        if (moving) { earth.rotation.y += delta * .023; orbitTime += delta * .025; }
        moon.position.set(Math.cos(orbitTime) * 2.35, Math.sin(orbitTime) * .9, Math.sin(orbitTime) * 2.17198);
        moon.rotation.y = -orbitTime;
        renderer.render(scene, camera);
        if (moving) frame = requestAnimationFrame(draw);
      };
      const wake = () => { cancelAnimationFrame(frame); lastTime = 0; frame = requestAnimationFrame(draw); };
      redrawRef.current = wake;
      const resize = () => {
        const width = host.clientWidth, height = host.clientHeight;
        if (!width || !height) return;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.position.z = camera.aspect < 1.1 ? 8.6 : 7.6;
        camera.updateProjectionMatrix();
        wake();
      };
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(host);
      const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; wake(); });
      intersection.observe(host);
      document.addEventListener("visibilitychange", wake);
      reduced.addEventListener("change", wake);
      const onLost = (event: Event) => { event.preventDefault(); failed = true; cancelAnimationFrame(frame); setReady(false); };
      renderer.domElement.addEventListener("webglcontextlost", onLost);

      cleanup = () => {
        cancelAnimationFrame(frame);
        redrawRef.current = null;
        resizeObserver.disconnect(); intersection.disconnect();
        document.removeEventListener("visibilitychange", wake);
        reduced.removeEventListener("change", wake);
        renderer.domElement.removeEventListener("webglcontextlost", onLost);
        geometry.dispose(); atmosphereGeometry.dispose(); orbitGeometry.dispose(); moonGeometry.dispose();
        earthMaterial.dispose(); atmosphereMaterial.dispose(); orbitMaterial.dispose(); moonMaterial.dispose();
        textures.forEach(texture => texture.dispose());
        renderer.dispose(); renderer.domElement.remove();
      };
      resize();
      const loader = new THREE.TextureLoader();
      const load = (url: string) => new Promise<import("three").Texture>((resolve, reject) => {
        loader.load(url, texture => {
          if (disposed) { texture.dispose(); reject(new Error("Disposed")); return; }
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4);
          textures.push(texture);
          resolve(texture);
        }, undefined, reject);
      });
      try {
        const [earthMap, moonMap] = await Promise.all([load("/media/orbital/earth.jpg"), load("/media/orbital/moon.jpg")]);
        if (disposed || failed) return;
        earthMaterial.map = earthMap; earthMaterial.needsUpdate = true;
        moonMaterial.map = moonMap; moonMaterial.needsUpdate = true;
        texturesReady = true;
        draw(performance.now());
        setReady(true);
      } catch { if (!disposed) { failed = true; setReady(false); } }
    }
    initialize().catch(() => { if (!disposed) setReady(false); });
    return () => { disposed = true; cleanup?.(); };
  }, []);

  return <div className={styles.planetScene} role="img" aria-label="Illustration of Earth with the Moon on an orbital path; distances and positions are not to scale.">
    <div className={styles.planetFallback} data-hidden={ready} aria-hidden="true"><div className={styles.fallbackOrbit} /><div className={styles.fallbackEarth} /><div className={styles.fallbackMoon} /></div>
    <div ref={hostRef} className={styles.canvasHost} data-ready={ready} aria-hidden="true" />
  </div>;
}
