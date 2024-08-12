import React from 'react'
import Pagination from '../shared/pagination'
import CardAsteroid from './card-asteroid'
import Link from 'next/link'
import { getAsteroidData } from '@/app/lib/utils/getAsteroidsSpeedDiametr'
import { calculateSize } from '@/app/lib/utils/calculateSize'

export default function ListAsteroids({ asteroidsObjects }: any) {
    const asteroidData = getAsteroidData(asteroidsObjects);
    const asteroidSizes = asteroidData.map((obj) => obj.averageDiameter);

    return (
        <div>
            {asteroidsObjects && asteroidsObjects.length > 0 ?
                <div className={"mt-35 flex flex-wrap content-around justify-evenly items-stretch"}>


                    <div className="flex flex-col w-full">
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
                                                <th scope="col" className="px-6 py-2">Speed -  KM / sec </th>
                                                <th scope="col" className="px-6 py-2">Diameter - Meters</th>
                                            </tr>
                                        </thead>


                                        {asteroidsObjects.map(async (asteroid, i) => {
                                            // console.log(img.data[0]?.keywords, "img")
                                            const name = asteroid.name
                                            const relative_velocity = asteroid.close_approach_data[0].relative_velocity
                                            const estimated_diameterMin = asteroid.estimated_diameter.meters.estimated_diameter_min
                                            const estimated_diameterMax = asteroid.estimated_diameter.meters.estimated_diameter_max
                                            const averageDiameter = (Math.round(estimated_diameterMin) + Math.round(estimated_diameterMax)) / 2

                                            const scaleAsteroidSize = calculateSize(asteroidSizes, averageDiameter)

                                            return (
                                                <tbody >
                                                    <tr className="border-b border-b-neutral-700 dark:border-white text-base text-slate-200">
                                                        <td className="whitespace-nowrap px-6 py-2 font-medium">{i + 1}</td>
                                                        <td className="whitespace-nowrap px-6 py-2">{name}</td>
                                                        <td className="whitespace-nowrap px-6 py-2">{Math.round(relative_velocity.kilometers_per_second)}</td>
                                                        <td className="whitespace-nowrap px-6 py-2">{averageDiameter}</td>
                                                        <td className="whitespace-nowrap px-6 py-2">
                                                            <div className="mb-2 md:mb-0">
                                                                <Link
                                                                    key={"asteroid_id"}
                                                                    href={`/asteroids/${asteroid.id}/${scaleAsteroidSize}`}
                                                                    aria-current="page"
                                                                    className="inline-block"
                                                                >
                                                                    OPEN
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
