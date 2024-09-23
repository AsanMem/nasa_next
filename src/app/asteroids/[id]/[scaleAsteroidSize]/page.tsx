// src/app/asteroids/[id]/page.tsx
import React from 'react';
import ThreeScene from '@/app/ui/treejs/scene/ThreeScene';
import BackgroundImage from '@/app/ui/shared/background-image';
import Timeline from '@/app/ui/asteroids/timeline';



async function getAsteroid(id: string): Promise<any> {
  const res = await fetch(`https://api.nasa.gov/neo/rest/v1/neo/${id}?api_key=${process.env.APP_NASA_API_KEY}`);
  const data = await res.json();
  return data;
}

export async function generateStaticParams() {
  const ids = ['some-id', 'another-id'];
  return ids.map(id => ({ id }));
}

export default async function Page({ params }: { params: { id: string; scaleAsteroidSize: string } }) {
  const { id, scaleAsteroidSize } = params;

  const asteroid = await getAsteroid(id);
  const diameterSphere = parseFloat(scaleAsteroidSize.split("-")[0]);
  const speedSphere = parseFloat(scaleAsteroidSize.split("-")[1]);
  const asteroidIndex = scaleAsteroidSize.split("-")[2]



  // Название астероида
  const name = asteroid.name;
  const isDanger = asteroid.is_potentially_hazardous_asteroid
  const relative_velocity = asteroid.close_approach_data[0].relative_velocity

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

  // Пример: относительная скорость первого ближайшего подхода
  const relative_velocity_first_approach = closeApproachData[0].relative_velocity.kilometers_per_second;

  // Расстояние до Земли в момент первого ближайшего подхода
  const miss_distance_first_approach = closeApproachData[0].miss_distance.kilometers;

  // Дата первого ближайшего подхода
  const close_approach_date_first_approach = closeApproachData[0].close_approach_date;

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

  return (
    <div className="relative w-full h-[calc(  h-screen - 15vh)]">
      <BackgroundImage src="https://firebasestorage.googleapis.com/v0/b/nasa-odisey.appspot.com/o/media%2Fbg%2Fearth_back.jpg?alt=media&token=be33b27e-78ef-492e-8c2a-b0cd504c8fa6s" className="fixed w-full h-full left-0 top-0 z-0 blur-sm" />

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
      <div className="absolute top-0 left-0 w-full md:w-1/3 max-h-[70hv] text-slate-100 bg-opacity-70 z-20 p-4">
        <h1 className="text-4xl font-bold mb-4">Asteroid : {name}</h1>
        <h2>Average Diameter : {Math.round(averageDiameter)} meters</h2>
        <section className="mb-4">
          <div id="result-container" className="mb-4">
            <article className="message is-dark">
              <div className="message-header">
                <p>{name}</p>
                <button className="delete" aria-label="delete"></button>
              </div>
              <div id="content" className="message-body max-h-[35vh] min-h-[35vh] overflow-x-auto overflow-y-auto">
                {Math.round(relative_velocity.kilometers_per_second)} <strong>KM / sec</strong>
                {Math.round(estimated_diameterMin)} / {Math.round(estimated_diameterMax)}
              </div>
            </article>
            <Timeline closeApproachData={closeApproachData} />
          </div>
        </section>
      </div>
    </div>
  );
}
