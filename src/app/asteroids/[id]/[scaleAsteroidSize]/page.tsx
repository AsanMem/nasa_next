
"use server";

import React from "react";
import ThreeScene from "@/app/ui/treejs/scene/AsteroidScene";
import BackgroundImage from "@/app/ui/shared/background-image";
import Timeline from "@/app/ui/asteroids/timeline";
import { getAsteroid } from "@/app/lib/data/asteroids/getAsteroid";
import { getTextureUrls } from "@/app/lib/utils/getTextureUrls";
import Header from "@/app/ui/header/Header";
import Link from "next/link";
import { ROUTES } from "@/app/lib/constants/routes";

export default async function Page({
  params,
}: {
  params: { id: string; scaleAsteroidSize: string };
}) {
  const { id, scaleAsteroidSize } = params;

  const asteroid = await getAsteroid(id);

  const [sizeStr, speedStr, textureIndexStr] = scaleAsteroidSize.split("-");
  const diameterSphere = parseFloat(sizeStr);
  const speedSphere = parseFloat(speedStr);
  const textureIndex = parseInt(textureIndexStr, 10);


  const name = asteroid?.name ?? "Not named";
  const isHazardous = asteroid?.is_potentially_hazardous_asteroid ?? false;
  const relativeVelocity =
    asteroid?.close_approach_data?.[0]?.relative_velocity;
  const missDistance =
    asteroid?.close_approach_data?.[0]?.miss_distance?.kilometers;

  const estimated_diameterMin =
    asteroid?.estimated_diameter?.meters?.estimated_diameter_min;
  const estimated_diameterMax =
    asteroid?.estimated_diameter?.meters?.estimated_diameter_max;
  const averageDiameter =
    estimated_diameterMin && estimated_diameterMax
      ? (estimated_diameterMin + estimated_diameterMax) / 2
      : undefined;

  const designation = asteroid?.designation;
  const nasa_jpl_url = asteroid?.nasa_jpl_url;
  const absolute_magnitude_h = asteroid?.absolute_magnitude_h;
  const orbital_data = asteroid?.orbital_data;
  const eccentricity = orbital_data?.eccentricity;
  const semi_major_axis = orbital_data?.semi_major_axis;
  const inclination = orbital_data?.inclination;
  const orbital_period = orbital_data?.orbital_period;
  const is_sentry_object = asteroid?.is_sentry_object;
  const closeApproachData = asteroid?.close_approach_data ?? [];

  const textures = await getTextureUrls();
  const textureUrl = textures[textureIndex];

  return (
    <>
      <Header />
      <BackgroundImage
        src="/media/starfield/2.png"
        className="fixed left-0 top-0 z-0 h-full w-full opacity-80"
      />

      <main className="relative min-h-screen overflow-hidden text-white">

        <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-black/35 via-black/55 to-slate-950/85" />

        <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 lg:grid lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">

          <section className="order-1 lg:order-none">
            <div className="mb-4 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/50">
              <span>Hazardous NEO</span>
              {designation && (
                <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] tracking-[0.25em] text-white/70">
                  {designation}
                </span>
              )}
            </div>

            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              {name}
            </h1>

            <p className="text-readable mt-3 max-w-2xl text-sm text-white/70 sm:text-base">
              A 3D view of this near-Earth object based on NASA’s orbital data.
              Rotate and explore its surface, then scroll through its close
              approaches in the timeline.

            </p>
            <Link
              href={ROUTES.neos}
              className="mt-4 inline-flex items-center justify-center self-start rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:border-white/40 hover:bg-white/20"
            >
              Back to Asteroids
            </Link>
            <div
              className="
    mt-6
    h-[55vh] sm:h-[60vh] lg:h-[70vh]
    rounded-3xl ring-1 ring-white/10
    overflow-hidden
    bg-black/10      
  "
            >

              <ThreeScene
                asteroidIndex={textureIndex}
                asteroid={params.id}
                diameterSphere={diameterSphere}
                speedSphere={speedSphere}
                urlTexture={textureUrl}
              />
            </div>

          </section>


          <aside className="order-2 flex flex-col gap-4 lg:order-none">
            <div className="rounded-3xl bg-black/50 p-5 ring-1 ring-white/10 backdrop-blur-lg">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-white/70">
                  Asteroid profile
                </span>
                <span
                  className={
                    isHazardous
                      ? "inline-flex items-center gap-1 rounded-full bg-red-500/15 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-red-200"
                      : "inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-emerald-200"
                  }
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {isHazardous ? "Potentially hazardous" : "Not hazardous"}
                </span>
                {is_sentry_object && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-amber-200">
                    Sentry monitored
                  </span>
                )}
              </div>

              <div className="mb-4 flex flex-wrap gap-2">
                {averageDiameter && (
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
                    Avg. diameter:{" "}
                    <span className="font-semibold text-white">
                      {Math.round(averageDiameter).toLocaleString("en-US")} m
                    </span>
                  </span>
                )}
                {relativeVelocity?.kilometers_per_second && (
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
                    Speed:{" "}
                    <span className="font-semibold text-white">
                      {Math.round(
                        Number(relativeVelocity.kilometers_per_second),
                      ).toLocaleString("en-US")}{" "}
                      km/s
                    </span>
                  </span>
                )}
                {missDistance && (
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
                    Closest miss:{" "}
                    <span className="font-semibold text-white">
                      {Number(missDistance).toFixed(0)} km
                    </span>
                  </span>
                )}
              </div>


              <dl className="text-readable space-y-2 text-sm text-white/70">
                {absolute_magnitude_h && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-white/50">Absolute magnitude (H)</dt>
                    <dd className="text-white">
                      {Number(absolute_magnitude_h).toFixed(2)}
                    </dd>
                  </div>
                )}
                {eccentricity && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-white/50">Eccentricity</dt>
                    <dd className="text-white">
                      {Number(eccentricity).toFixed(4)}
                    </dd>
                  </div>
                )}
                {semi_major_axis && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-white/50">Semi-major axis (AU)</dt>
                    <dd className="text-white">
                      {Number(semi_major_axis).toFixed(3)}
                    </dd>
                  </div>
                )}
                {inclination && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-white/50">Inclination (°)</dt>
                    <dd className="text-white">
                      {Number(inclination).toFixed(2)}
                    </dd>
                  </div>
                )}
                {orbital_period && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-white/50">Orbital period (days)</dt>
                    <dd className="text-white">
                      {Number(orbital_period).toFixed(1)}
                    </dd>
                  </div>
                )}
              </dl>

              {nasa_jpl_url && (
                <div className="mt-4">
                  <a
                    href={nasa_jpl_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-white/60 hover:text-white"
                  >
                    Open full NASA JPL orbit data
                    <span aria-hidden="true">↗</span>
                  </a>
                </div>
              )}
            </div>


            {closeApproachData.length > 0 && (
              <div className="rounded-3xl bg-black/50 p-5 ring-1 ring-white/10 backdrop-blur-lg">
                <p className="mb-3 text-xs uppercase tracking-[0.3em] text-white/50">
                  Timeline across our solar system
                </p>
                <Timeline closeApproachData={closeApproachData} />
              </div>
            )}
          </aside>
        </div>
      </main>
    </>
  );
}
