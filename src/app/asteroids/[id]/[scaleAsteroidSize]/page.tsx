import { Suspense } from "react";
import Link from "next/link";
import { getAsteroid } from "@/app/lib/data/asteroids/getAsteroid";
import { getNasaUtcDate } from "@/app/lib/nasa/api";
import { toAsteroid } from "@/app/lib/asteroids/view-model";
import Header from "@/app/ui/header/Header";
import AsteroidJourney from "@/app/ui/asteroids/asteroid-journey";
import s from "@/app/ui/asteroids/asteroids.module.css";
import orbital from "@/app/ui/orbital/orbital.module.css";

export const revalidate = 3600;
export const metadata = { title: "An asteroid encounter · Orbital" };
export default async function Page({params}: {params: {id: string; scaleAsteroidSize: string}}) {
  // The legacy path remains valid. Its scale/speed segment is intentionally ignored.
  const asteroid = /^\d+$/.test(params.id) ? toAsteroid(await getAsteroid(params.id)) : null;
  return <><Header/>{asteroid ? <Suspense fallback={<p style={{padding:40}}>Opening the encounter…</p>}><AsteroidJourney asteroid={asteroid} today={getNasaUtcDate()}/></Suspense> : <main className={`${orbital.theme} ${s.empty}`}><p>NASA object data is unavailable</p><h1>This encounter can’t be opened yet.</h1><p>The object may not exist, or NASA may be temporarily unavailable.</p><Link href="/asteroids" className={orbital.button}>Return to the asteroid catalog</Link></main>}</>;
}
