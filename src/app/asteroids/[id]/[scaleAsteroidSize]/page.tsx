
import React from 'react';
import ThreeScene from '@/app/ui/treejs/scene/ThreeScene';
import BackgroundImage from '@/app/ui/shared/background-image';
import Timeline from '@/app/ui/asteroids/timeline';
import { getAsteroid } from '@/app/lib/data/asteroids/getAsteroid';



export default async function Page({ params }: { params: { id: string; scaleAsteroidSize: string } }) {
  const { id, scaleAsteroidSize } = params;

  const asteroid = await getAsteroid(id);
  console.log(asteroid, "asteroid")
  const diameterSphere = parseFloat(scaleAsteroidSize.split("-")[0]);
  const speedSphere = parseFloat(scaleAsteroidSize.split("-")[1]);
  const asteroidIndex = scaleAsteroidSize.split("-")[2]



  // Название астероида
  const name = asteroid?.name ?? 'Not named';
  const isDanger = asteroid?.is_potentially_hazardous_asteroid
  const relative_velocity = asteroid?.close_approach_data?.[0]?.relative_velocity

  // Оценочный диаметр астероида в метрах
  const estimated_diameterMin = asteroid.estimated_diameter.meters.estimated_diameter_min;
  const estimated_diameterMax = asteroid.estimated_diameter.meters.estimated_diameter_max;

  // Десигнация астероида
  const designation = asteroid?.designation;

  // // URL на сайт JPL для дополнительной информации
  const nasa_jpl_url = asteroid?.nasa_jpl_url;

  // // Абсолютная величина яркости астероида
  const absolute_magnitude_h = asteroid?.absolute_magnitude_h;

  // Является ли астероид потенциально опасным
  const is_potentially_hazardous_asteroid = asteroid.is_potentially_hazardous_asteroid;

  // Данные о ближайших подходах
  const closeApproachData = asteroid.close_approach_data;


  // Орбитальные данные
  const orbital_data = asteroid.orbital_data;
  // Пример: эксцентриситет орбиты
  const eccentricity = orbital_data.eccentricity;
  // Пример: полуось орбиты
  const semi_major_axis = orbital_data.semi_major_axis;
  // Пример: наклонение орбиты
  const inclination = orbital_data.inclination;
  // Пример: орбитальный период
  const orbital_period = orbital_data.orbital_period;
  // Является ли объект частью системы мониторинга Sentry
  const is_sentry_object = asteroid?.is_sentry_object;

  const averageDiameter = (estimated_diameterMin + estimated_diameterMax) / 2;
  // `https://firebasestorage.googleapis.com/v0/b/nasa-odisey.appspot.com/o/media%2Fbg%2Fearth_back.jpg?alt=media&token=be33b27e-78ef-492e-8c2a-b0cd504c8fa6`
  return (
    <div className="relative w-full h-[calc(  h-screen - 15vh)]">

      <BackgroundImage src={"https://firebasestorage.googleapis.com/v0/b/nasa-odisey.appspot.com/o/media%2Fbg%2F5.jpg?alt=media&token=41e8c6f8-4527-4215-adf0-0258a76924a6"} className="fixed w-full h-full left-0 top-0 z-0 blur-0" />


      {/* Контейнер для сцены */}
      <div className="absolute inset-0 z-10">
        <ThreeScene
          asteroidIndex={asteroidIndex}
          asteroid={params.id}
          diameterSphere={diameterSphere}
          speedSphere={speedSphere}

        />
      </div>

      {/* Контейнер для описания */}
      <div className="absolute top-0 left-0 w-full md:w-1/3 h-[calc(80vh-2rem)] text-slate-100 bg-opacity-70 z-20 p-4">
        <h1 className="text-xl sm:text-xl md:text-2xl lg:text-2xl xl:text-3xl font-bold mb-4">
          Asteroid : {name}
        </h1>
        <div
          id="content"
          className="message-body max-h-[35vh] min-h-[35vh] overflow-x-auto overflow-y-auto"
        >
          <h2 className="text-xs sm:text-xs md:text-xl lg:text-1xl xl:text-2xl">
            Average Diameter : {Math.round(averageDiameter)} meters
          </h2>
          {relative_velocity?.kilometers_per_second &&
            <h2 className="text-xs sm:text-xs md:text-xl lg:text-1xl xl:text-2xl">
              {Math.round(relative_velocity?.kilometers_per_second)} <strong>KM / sec</strong>
            </h2>}
        </div>
        {closeApproachData && closeApproachData.length > 0 &&
          <div>
            <p className='sm:text-xs md:text-xs lg:text-xl xl:text-1xl mb-4'>Timeline across our solar system</p>
            <div className="h-[calc(100%-48rem)] overflow-y-auto  text-sm " style={{
              scrollbarWidth: "none",  // Firefox
              msOverflowStyle: "none"  // Edge
            }}>
              <section className="my-4">
                <Timeline closeApproachData={closeApproachData} />
              </section>
            </div>
          </div>
        }
      </div>
    </div>
  );
}
