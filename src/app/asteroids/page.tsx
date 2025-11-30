'use server'
import { fetchAsteroids } from "../lib/data/asteroids/fetchAsteroids";
import HelloTittle from "../ui/shared/hello-title";
import { formatDate } from "../lib/utils";
import ListAsteroids from "../ui/asteroids/list-asteroids";
import BackgroundVideo from "../ui/shared/background-video";
import Header from "../ui/header/Header";

export default async function Asteroids() {
  // export default async function Page({ params }: { params: { id: string; scaleAsteroidSize: string } }) {
  //   const { id, scaleAsteroidSize } = params;

  const asteroidsData = await fetchAsteroids()
  const asteroidsObjects = asteroidsData?.near_earth_objects[formatDate()] ?? []





  return (
    <>
      <Header />
      <BackgroundVideo src={'https://firebasestorage.googleapis.com/v0/b/nasa-odisey.appspot.com/o/media%2Fvideos%2F127578-738829608_medium.mp4?alt=media&token=7a66201a-19c5-4b84-a3a0-37b2db6b7da7'} />
      <HelloTittle mainText={<>
        Today is {formatDate()}, Noticed near earth{' '}
        <span className="text-3xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl px-2 text-red-800">{asteroidsData?.element_count}</span> objects
      </>}
        supportiveText={"Attention Earthlings!"} />


      <HelloTittle
        mainText={
          <>
            <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight drop-shadow">
              Today is {formatDate()}
            </span>
            <span className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm sm:text-base backdrop-blur border border-white/20">
              Noticed near Earth
              <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-red-400 tabular-nums">
                {new Intl.NumberFormat('en-US').format(asteroidsData?.element_count ?? 0)}
              </span>
              objects
            </span>
          </>
        }
        supportiveText="Attention Earthlings!"
      />

      <div className=" my-8 ">
        <ListAsteroids asteroidsObjects={asteroidsObjects} />
      </div>

    </>)
}