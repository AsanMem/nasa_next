import React from 'react'
import Pagination from '../shared/pagination'
import CardAsteroid from './card-asteroid'

export default function ListAsteroids({ asteroidsObjects }: any) {

    // const linksSelf = asteroid.links.self
    // const resultSelf = await fetch(linksSelf)
    // const resultSelfJSON = resultSelf.json();
    // console.log(resultSelfJSON, "resultSelfJSON")

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
                                            className="border-b border-b-neutral-700  font-bold text-xl text-rose-950 dark:border-white/10">
                                            <tr>
                                                <th scope="col" className="px-6 py-2">#</th>
                                                <th scope="col" className="px-6 py-2">Name</th>
                                                <th scope="col" className="px-6 py-2">Speed -  KM / sec </th>
                                                <th scope="col" className="px-6 py-2">Diameter -  Min / Max meters</th>
                                            </tr>
                                        </thead>


                                        {asteroidsObjects.map(async (asteroid, i) => {
                                            // console.log(img.data[0]?.keywords, "img")
                                            const name = asteroid.name
                                            const relative_velocity = asteroid.close_approach_data[0].relative_velocity
                                            const estimated_diameterMin = asteroid.estimated_diameter.meters.estimated_diameter_min
                                            const estimated_diameterMax = asteroid.estimated_diameter.meters.estimated_diameter_max

                                            //   console.log(relative_velocity, "relative_velocity")
                                            // {
                                            //     links: {
                                            //       self: 'http://api.nasa.gov/neo/rest/v1/neo/54434076?api_key=VauDsiHPdow83sG05SNp04z8eTKDnUACx9I5mCoa'
                                            //     },
                                            //     id: '54434076',
                                            //     neo_reference_id: '54434076',
                                            //     name: '(2024 GF5)',
                                            //     nasa_jpl_url: 'https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=54434076',
                                            //     absolute_magnitude_h: 27.29,
                                            //     estimated_diameter: {
                                            //       kilometers: {
                                            //         estimated_diameter_min: 0.0092588058,
                                            //         estimated_diameter_max: 0.0207033192
                                            //       },
                                            //       meters: {
                                            //         estimated_diameter_min: 9.2588058337,
                                            //         estimated_diameter_max: 20.7033192345
                                            //       },
                                            //       miles: {
                                            //         estimated_diameter_min: 0.0057531534,
                                            //         estimated_diameter_max: 0.0128644422
                                            //       },
                                            //       feet: {
                                            //         estimated_diameter_min: 30.3766605313,
                                            //         estimated_diameter_max: 67.9242778774
                                            //       }
                                            //     },
                                            //     is_potentially_hazardous_asteroid: false,
                                            //     close_approach_data: [
                                            //       {
                                            //         close_approach_date: '2024-04-17',
                                            //         close_approach_date_full: '2024-Apr-17 14:47',
                                            //         epoch_date_close_approach: 1713365220000,
                                            //         relative_velocity: [Object],
                                            //         miss_distance: [Object],
                                            //         orbiting_body: 'Earth'
                                            //       }
                                            //     ],
                                            //     is_sentry_object: false
                                            //   } asteroid
                                            return (
                                                <tbody >
                                                    <tr className="border-b border-b-neutral-700 dark:border-white/10">
                                                        <td className="whitespace-nowrap px-6 py-2 font-medium">{i + 1}</td>
                                                        <td className="whitespace-nowrap px-6 py-2">{name}</td>
                                                        <td className="whitespace-nowrap px-6 py-2">{Math.round(relative_velocity.kilometers_per_second)}</td>
                                                        <td className="whitespace-nowrap px-6 py-2">{Math.round(estimated_diameterMin)} / {Math.round(estimated_diameterMax)}</td>
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
{/* <CardAsteroid
                             asteroid={asteroid}
                            /> */}