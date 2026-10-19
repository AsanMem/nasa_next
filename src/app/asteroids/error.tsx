"use client";
import Link from "next/link";
import Header from "../ui/header/Header";
import { SceneUnavailable } from "../ui/orbital/scene-provider";
import s from "../ui/asteroids/asteroids.module.css";
import orbital from "../ui/orbital/orbital.module.css";

export default function AsteroidError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <><Header/><main className={`${orbital.theme} ${s.empty}`}><SceneUnavailable/><h1>We couldn’t open this view.</h1><p>Try again, or choose another asteroid from the catalog.</p><div style={{display:"flex",flexWrap:"wrap",gap:12}}><button type="button" className={orbital.button} onClick={reset}>Try again</button><Link href="/asteroids" className={`${orbital.button} ${orbital.quiet}`}>Return to the asteroid catalog</Link></div></main></>;
}
