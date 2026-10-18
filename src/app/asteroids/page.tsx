import { pageMetadata } from "@/app/lib/site";
import { Suspense } from "react";
import { fetchAsteroids, resolveAsteroidFeedSelection } from "../lib/data/asteroids/fetchAsteroids";
import { getNasaUtcDate } from "../lib/nasa/api";
import { CatalogEntry, selectApproach, toAsteroid } from "../lib/asteroids/view-model";
import Header from "../ui/header/Header";
import AsteroidCatalog from "../ui/asteroids/asteroid-catalog";
import orbital from "../ui/orbital/orbital.module.css";

export const revalidate = 3600;
export const metadata=pageMetadata("/asteroids","Asteroids passing Earth | Orbital","Explore NASA close approaches, estimated asteroid sizes, speeds and an illustrated journey through past and future encounters.");
export default async function Asteroids() {
  const today = getNasaUtcDate();
  const data = await fetchAsteroids();
  const selection = resolveAsteroidFeedSelection(data?.near_earth_objects,today);
  const entries = selection.objects.flatMap((raw): CatalogEntry[] => {
    const asteroid = toAsteroid(raw);
    return asteroid ? [{ asteroid, event: selectApproach(asteroid.approaches, selection.resolvedDate, today) }] : [];
  });
  return <><Header/><Suspense fallback={<main className={orbital.theme} style={{padding:"64px 5.4%",minHeight:"75vh"}} aria-busy="true"><p role="status">Opening the NASA snapshot…</p></main>}><AsteroidCatalog entries={entries} sourceDate={selection.resolvedDate} unavailable={!data} fallback={selection.fallbackUsed}/></Suspense></>;
}
