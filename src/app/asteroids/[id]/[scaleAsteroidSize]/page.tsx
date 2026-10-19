import { pageMetadata } from "@/app/lib/site";
import { Suspense } from "react";
import Link from "next/link";
import { getAsteroid } from "@/app/lib/data/asteroids/getAsteroid";
import { getNasaUtcDate } from "@/app/lib/nasa/api";
import { toAsteroid } from "@/app/lib/asteroids/view-model";
import Header from "@/app/ui/header/Header";
import AsteroidJourney from "@/app/ui/asteroids/asteroid-journey";
import { SceneUnavailable } from "@/app/ui/orbital/scene-provider";
import s from "@/app/ui/asteroids/asteroids.module.css";
import orbital from "@/app/ui/orbital/orbital.module.css";

export const revalidate = 3600;
export function generateMetadata({params}:{params:{id:string}}){return pageMetadata(`/asteroids/${encodeURIComponent(params.id)}/view`,`Asteroid ${params.id}: encounters and size | Orbital`,"Explore NASA encounter dates, distance, speed and estimated size, with an illustrative journey through years.");}
export default async function Page({params}: {params: {id: string; scaleAsteroidSize: string}}) {
  // The legacy path remains valid. Its scale/speed segment is intentionally ignored.
  const asteroid = /^\d+$/.test(params.id) ? toAsteroid(await getAsteroid(params.id)) : null;
  return <><Header/>{asteroid ? <Suspense fallback={<p style={{padding:40}}>Opening the encounter…</p>}><AsteroidJourney asteroid={asteroid} today={getNasaUtcDate()}/></Suspense> : <main className={`${orbital.theme} ${s.empty}`}><SceneUnavailable/><p>NASA object data is unavailable</p><h1>This encounter can’t be opened yet.</h1><p>The object may not exist, or NASA may be temporarily unavailable.</p><Link href="/asteroids" className={orbital.button}>Return to the asteroid catalog</Link></main>}</>;
}
