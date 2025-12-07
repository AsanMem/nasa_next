import React from "react";
import Link from "next/link";
import { getAsteroidData } from "@/app/lib/utils/getAsteroidsSpeedDiametr";
import { calculateSize } from "@/app/lib/utils/calculateSize";
import { calculateSpeed } from "@/app/lib/utils/calculateSpeed";
import { getTextureUrls } from "@/app/lib/utils/getTextureUrls";

export default async function ListAsteroids({ asteroidsObjects }: any) {
    const asteroidData = getAsteroidData(asteroidsObjects);
    const asteroidSizes = asteroidData.map((obj: any) => obj.averageDiameter);
    const asteroidSpeeds = asteroidData.map((obj: any) =>
        Number(obj.velocityKmph),
    );

    const textures = await getTextureUrls();
    const numberOfImages = textures.length;

    if (!asteroidsObjects || asteroidsObjects.length === 0) {
        return null;
    }

    return (
        <div className="mt-6">
            <div className="rounded-3xl bg-white/5 ring-1 ring-white/10 backdrop-blur-lg">

                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-xs uppercase tracking-[0.25em] text-white/50">
                    <span>Today&apos;s near-Earth objects</span>
                    <span className="text-white/60">
                        {asteroidsObjects.length} items
                    </span>
                </div>

                <ul className="divide-y divide-white/10">
                    {asteroidsObjects.map((asteroid: any, i: number) => {
                        const name = asteroid.name;
                        const relative_velocity = asteroid.close_approach_data[0]
                            ?.relative_velocity;
                        const estimated_diameterMin =
                            asteroid.estimated_diameter.meters.estimated_diameter_min;
                        const estimated_diameterMax =
                            asteroid.estimated_diameter.meters.estimated_diameter_max;

                        const currentSpeed = Math.round(
                            relative_velocity.kilometers_per_second,
                        );
                        const averageDiameter =
                            (Math.round(estimated_diameterMin) +
                                Math.round(estimated_diameterMax)) /
                            2;

                        const scaleAsteroidSize = calculateSize(
                            asteroidSizes,
                            averageDiameter,
                        );
                        const scaleAsteroidSpeed = calculateSpeed(
                            asteroidSpeeds,
                            currentSpeed,
                        );

                        const asteroidIndex = i + 1;
                        const textureIndex = asteroidIndex % numberOfImages;
                        const isHazardous = asteroid.is_potentially_hazardous_asteroid;

                        console.log({ textureIndex, name, asteroidIndex });

                        const displaySpeed = `${currentSpeed} km/s`;
                        const displayDiameter = `${Math.round(averageDiameter)} m`;

                        return (
                            <li
                                key={asteroidIndex + name}
                                className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                            >

                                <div className="flex flex-1 items-start gap-3">
                                    <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/20 text-xs font-semibold text-blue-200 ring-1 ring-blue-400/40">
                                        {asteroidIndex}
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="rounded-full bg-white/10 px-3 py-1 text-xs sm:text-sm font-semibold text-white shadow-[0_0_20px_rgba(15,23,42,0.7)]">
                                                {name}
                                            </span>
                                            {isHazardous && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-red-200">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                                                    Hazardous
                                                </span>
                                            )}
                                        </div>


                                        <p className="text-xs sm:text-sm text-white/70">
                                            <span className="text-white/60">Speed:</span>{" "}
                                            <span className="text-white">{displaySpeed}</span>
                                            <span className="mx-2 text-white/30">•</span>
                                            <span className="text-white/60">Diameter:</span>{" "}
                                            <span className="text-white">{displayDiameter}</span>
                                        </p>
                                    </div>
                                </div>


                                <div className="flex justify-end sm:justify-center">
                                    <Link
                                        key={"asteroid_id"}
                                        href={`/asteroids/${asteroid.id}/${scaleAsteroidSize}-${scaleAsteroidSpeed}-${textureIndex}`}
                                        aria-current="page"
                                        className="inline-block"
                                    >
                                        <button
                                            type="button"
                                            className="mt-1 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 px-5 py-2 text-xs sm:text-sm font-medium text-white shadow-lg shadow-blue-500/50 transition hover:shadow-blue-400/80 focus:outline-none focus:ring-2 focus:ring-blue-300/70"
                                        >
                                            Open 3D view
                                        </button>
                                    </Link>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}
