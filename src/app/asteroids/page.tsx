
"use server";

import { fetchAsteroids } from "../lib/data/asteroids/fetchAsteroids";
import { formatDate } from "../lib/utils";
import BackgroundVideo from "../ui/shared/background-video";
import Header from "../ui/header/Header";
import ListAsteroids from "../ui/asteroids/list-asteroids";
import AsteroidsLayout from "../ui/asteroids/asteroids-layout";
import { formatFriendlyDate } from "../lib/utils/formatFriendlyDate";

export default async function Asteroids() {
  const today = formatDate();
  const asteroidsData = await fetchAsteroids();
  const asteroidsObjects = asteroidsData?.near_earth_objects?.[today] ?? [];
  const count = asteroidsData?.element_count ?? 0;

  const hazardousCount = asteroidsObjects.filter(
    (a: any) => a.is_potentially_hazardous_asteroid
  ).length;

  return (
    <>
      <Header />
      <BackgroundVideo
        src="https://firebasestorage.googleapis.com/v0/b/nasa-odisey.appspot.com/o/media%2Fvideos%2F127578-738829608_medium.mp4?alt=media&token=7a66201a-19c5-4b84-a3a0-37b2db6b7da7"
        loop={false}
      />

      <main className="relative min-h-screen text-white overflow-hidden">
        <AsteroidsLayout>
          <section className="flex flex-col gap-4 max-w-3xl">
            <p className="text-sm uppercase tracking-[0.6em] text-white/50">
              Hazardous NEOs
            </p>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Near-Earth Objects passing by today
            </h1>
            <p className="max-w-2xl text-base text-white/70 sm:text-lg">
              A live snapshot of asteroids passing near our planet today. Explore
              their size, speed, and potential risk before taking a closer look in 3D.
            </p>

            <p className="max-w-2xl text-sm sm:text-base text-white/70">
              Today,{" "}
              <span className="font-semibold text-white/90">
                {formatFriendlyDate(today)}
              </span>{" "}
              our scanners picked up{" "}
              <span className="font-semibold text-red-300">
                {new Intl.NumberFormat("en-US").format(count)} objects
              </span>{" "}
              flying past Earth.
              {hazardousCount > 0 && (
                <>
                  {" "}
                  Of them,{" "}
                  <span className="font-semibold text-red-300">
                    {hazardousCount}
                  </span>{" "}
                  are classified as potentially hazardous.
                </>
              )}
            </p>
          </section>

          {/* Блок со списком астероидов */}
          <section className="mt-10 rounded-3xl bg-white/5 p-4 sm:p-6 ring-1 ring-white/10 backdrop-blur">
            <h2 className="mb-4 text-lg sm:text-xl font-semibold tracking-tight">
              Today&apos;s close approaches
            </h2>
            <p className="mb-4 text-sm text-white/60">
              Each object is sized and ranked by its average diameter and relative
              speed. Open any row to see a 3D asteroid view and full NASA orbital data.
            </p>


            <ListAsteroids asteroidsObjects={asteroidsObjects} />
          </section>
        </AsteroidsLayout>
      </main>
    </>
  );
}
