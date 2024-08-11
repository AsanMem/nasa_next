import Header from "@/app/ui/header/Header";
import { fetchAsteroids } from "../lib/data/fetchAsteroids";
import HelloTittle from "../ui/shared/hello-title";
import { formatDate } from "../lib/utils";
import ListAsteroids from "../ui/asteroids/list-asteroids";
import { getAsteroidData } from "../lib/utils/getAsteroidsSpeedDiametr";

export default async function Asteroids() {
  const asteroidsData = await fetchAsteroids()
  const asteroidsObjects = asteroidsData?.near_earth_objects[formatDate()] ?? []

  console.log(getAsteroidData(asteroidsObjects), "asteroidsObjects")
  return (
    <div className="">
      <HelloTittle mainText={<>
        Today is {formatDate()}, Noticed near earth{' '}
        <span className="text-3xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl px-2 text-red-800">{asteroidsData?.element_count}</span> objects
      </>}
        supportiveText={"Attention Earthlings!"} />
      <div className=" my-8 ">
        <ListAsteroids asteroidsObjects={asteroidsObjects} />
      </div>

    </div>)
}