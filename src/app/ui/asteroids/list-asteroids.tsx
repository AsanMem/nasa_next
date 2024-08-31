import React from 'react'
import Pagination from '../shared/pagination'
import Link from 'next/link'
import { getAsteroidData } from '@/app/lib/utils/getAsteroidsSpeedDiametr'
import { calculateSize } from '@/app/lib/utils/calculateSize'
import { calculateSpeed } from '@/app/lib/utils/calculateSpeed'

export default function ListAsteroids({ asteroidsObjects }: any) {
    const asteroidData = getAsteroidData(asteroidsObjects);
    const asteroidSizes = asteroidData.map((obj) => obj.averageDiameter);
    const asteroidSpeeds = asteroidData.map((obj) => Number(obj.velocityKmph));
    console.log({ asteroidSizes, asteroidSpeeds })



    return (
        <div>
            {asteroidsObjects && asteroidsObjects.length > 0 ?
                <div className={"mt-35 flex flex-wrap content-around justify-evenly items-stretch"}>


                    <div className="flex flex-col w-[calc(80vw)]">
                        <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
                            <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
                                <div className="overflow-hidden">
                                    <table
                                        className="min-w-full text-center text-sm font-light text-surface dark:text-white">
                                        <thead
                                            className="border-b border-b-neutral-700  font-bold text-3xl text-blue-600 dark:border-white/10">
                                            <tr>
                                                <th scope="col" className="px-6 py-2">#</th>
                                                <th scope="col" className="px-6 py-2">Name</th>
                                                <th scope="col" className="px-6 py-3">
                                                    <span className="relative">
                                                        Speed  <div className="text-sm absolute -right-10 -top-3">KM / sec</div>
                                                    </span>
                                                </th>
                                                <th scope="col" className="px-6 py-3">
                                                    <span className="relative">
                                                        Diameter  <div className="text-sm absolute -right-10 -top-3">Meters</div>
                                                    </span>
                                                </th>
                                            </tr>
                                        </thead>


                                        {asteroidsObjects.map(async (asteroid, i) => {
                                            const name = asteroid.name
                                            const relative_velocity = asteroid.close_approach_data[0].relative_velocity
                                            const estimated_diameterMin = asteroid.estimated_diameter.meters.estimated_diameter_min
                                            const estimated_diameterMax = asteroid.estimated_diameter.meters.estimated_diameter_max
                                            const currentSpeed = Math.round(relative_velocity.kilometers_per_second)
                                            const averageDiameter = (Math.round(estimated_diameterMin) + Math.round(estimated_diameterMax)) / 2

                                            const scaleAsteroidSize = calculateSize(asteroidSizes, averageDiameter)
                                            const scaleAsteroidSpeed = calculateSpeed(asteroidSpeeds, currentSpeed)

                                            const numberOfImages = 21
                                            const asteroidIndex = i + 1;

                                            const textureIndex = asteroidIndex % numberOfImages;



                                            return (
                                                <tbody >
                                                    <tr className="border-b border-b-neutral-700 dark:border-white text-base text-slate-200">
                                                        <td className="whitespace-nowrap px-6 py-2 font-medium">
                                                            <span className="inline-flex items-center justify-center w-10 h-10 ms-2 text-xs sm:text-xs md:text-sm lg:text-base xl:text-base font-semibold text-blue-800 bg-blue-200 rounded-full shadow-lg shadow-blue-500/50 dark:shadow-lg dark:shadow-blue-800/80">
                                                                {asteroidIndex}
                                                            </span>



                                                        </td>
                                                        <td className="whitespace-nowrap px-6 py-2">
                                                            <span className=" items-center justify-center h-10 w-full py-2 px-4  ms-2 text-xs sm:text-xs md:text-sm lg:text-base xl:text-base font-semibold text-blue-800 bg-blue-200 rounded-full shadow-lg shadow-blue-500/50 dark:shadow-lg dark:shadow-blue-800/80">
                                                                {name}
                                                            </span>

                                                        </td>
                                                        <td className="whitespace-nowrap px-6 py-2">
                                                            <span className="inline-flex items-center justify-center w-10 h-10 ms-2 text-xs sm:text-xs md:text-sm lg:text-base xl:text-base font-semibold text-blue-800 bg-blue-200 rounded-full shadow-lg shadow-blue-500/50 dark:shadow-lg dark:shadow-blue-800/80">
                                                                {currentSpeed}
                                                            </span>

                                                        </td>
                                                        <td className="whitespace-nowrap px-6 py-2">
                                                            <span className="inline-flex items-center justify-center w-14 h-10 ms-2 text-xs sm:text-xs md:text-sm lg:text-base xl:text-base font-semibold text-blue-800 bg-blue-200 rounded-full
                                                            shadow-lg shadow-blue-500/50 dark:shadow-lg dark:shadow-blue-800/80
                                                            ">
                                                                {averageDiameter}
                                                            </span>
                                                        </td>
                                                        <td className="whitespace-nowrap px-6 py-2">
                                                            <div className="mb-2 md:mb-0">
                                                                <Link
                                                                    key={"asteroid_id"}

                                                                    href={`/asteroids/${asteroid.id}/${scaleAsteroidSize}-${scaleAsteroidSpeed}-${textureIndex}`}
                                                                    aria-current="page"
                                                                    className="inline-block"
                                                                >
                                                                    <button type="button" className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 shadow-lg shadow-blue-500/50 dark:shadow-lg dark:shadow-blue-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 ">
                                                                        OPEN
                                                                    </button>



                                                                </Link>
                                                            </div>

                                                        </td>
                                                    </tr>
                                                </tbody>)
                                        })}
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 flex w-full justify-center">
                        <Pagination totalPages={4} />
                    </div>
                </div>

                : null
            }
        </div>
    )
}
