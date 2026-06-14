import { fetchAsteroids, resolveAsteroidFeedSelection } from "../lib/data/asteroids/fetchAsteroids";
import { getNasaUtcDate } from "../lib/nasa/api";
import { getBuildMarker } from "../lib/build-marker";
import BackgroundVideo from "../ui/shared/background-video";
import Header from "../ui/header/Header";
import ListAsteroids from "../ui/asteroids/list-asteroids";
import AsteroidsLayout from "../ui/asteroids/asteroids-layout";
import { formatFriendlyDate } from "../lib/utils/formatFriendlyDate";

export const revalidate = 3600;

export default async function Asteroids() {
  const sourceDate = getNasaUtcDate();
  const asteroidsData = await fetchAsteroids();
  const feed = asteroidsData?.near_earth_objects;
  const selection = resolveAsteroidFeedSelection(feed, sourceDate);
  const asteroidsObjects = selection.objects as any[];
  const count = asteroidsObjects.length;
  const marker = getBuildMarker();

  const hazardousCount = asteroidsObjects.filter(
    (a: any) => a.is_potentially_hazardous_asteroid
  ).length;

  return (
    <>
      <Header />
      <BackgroundVideo
        src="/media/stack_videos/127578-738829608_medium.optimized.mp4"
        poster="/media/stack_videos/127578-738829608_medium.poster.jpg"
        loop={false}
      />

      <main className="relative min-h-screen text-white overflow-hidden">
        <AsteroidsLayout>
          <section className="flex flex-col gap-4 max-w-3xl">
            <p className="text-sm uppercase tracking-[0.6em] text-white/50">
              Hazardous NEOs
            </p>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Near-Earth Objects Passing Near Earth
            </h1>
            <p className="text-readable max-w-2xl text-base text-white/70 sm:text-lg">
              NASA close approaches for{" "}
              <span className="font-semibold text-white/90">
                {formatFriendlyDate(sourceDate)}
              </span>
              . Explore their size, speed, and potential risk before taking a closer look in 3D.
            </p>

            <p className="text-readable max-w-2xl text-sm sm:text-base text-white/70">
              {selection.fallbackUsed ? (
                <>
                  Latest available NeoWS data:{" "}
                  <span className="font-semibold text-white/90">
                    {formatFriendlyDate(selection.resolvedDate)}
                  </span>
                  .{" "}
                </>
              ) : null}
              <span className="font-semibold text-red-300">
                {new Intl.NumberFormat("en-US").format(count)} objects
              </span>{" "}
              listed by NASA
              {selection.fallbackUsed ? " for the fallback date" : " for the source date"}.
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
              NASA close approaches for {formatFriendlyDate(selection.resolvedDate)}
            </h2>
            <p className="text-readable mb-4 text-sm text-white/60">
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
