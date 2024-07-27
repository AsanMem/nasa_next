// src/app/asteroids/[id]/page.tsx
import React from 'react';
import ThreeScene from '@/app/ui/treejs/scene/ThreeScene';
import BackgroundImage from '@/app/ui/shared/background-image';

interface Asteroid {
  id: string;
  name: string;
  estimated_diameter: {
    meters: {
      estimated_diameter_min: number;
      estimated_diameter_max: number;
    };
  };
  close_approach_data: {
    relative_velocity: {
      kilometers_per_second: number;
    };
  }[];
}

async function getAsteroid(id: string): Promise<Asteroid> {
  const res = await fetch(`https://api.nasa.gov/neo/rest/v1/neo/${id}?api_key=${process.env.APP_NASA_API_KEY}`);
  const data = await res.json();
  return data;
}

export async function generateStaticParams() {
  // Получите список всех возможных ID астероидов
  const ids = ['some-id', 'another-id']; // Здесь вы должны получить ID из вашего источника данных
  return ids.map(id => ({ id }));
}

export default async function Page({ params }: { params: { id: string } }) {
  const asteroid = await getAsteroid(params.id);
  // console.log(asteroid, "asteroid") public\media\bg\earth_back.jpg

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
  // return (
  //     <tbody >
  //         <tr className="border-b border-b-neutral-700 dark:border-white text-base text-slate-200">
  //             <td className="whitespace-nowrap px-6 py-2 font-medium">{i + 1}</td>
  //             <td className="whitespace-nowrap px-6 py-2">{name}</td>
  //             <td className="whitespace-nowrap px-6 py-2">{Math.round(relative_velocity.kilometers_per_second)}</td>
  //             <td className="whitespace-nowrap px-6 py-2">{Math.round(estimated_diameterMin)} / {Math.round(estimated_diameterMax)}</td>
  //             <td className="whitespace-nowrap px-6 py-2">
  //                 <div className="mb-2 md:mb-0">


  return (
    <div className="relative min-h-screen">
      <BackgroundImage src="/media/bg/earth_back.jpg" className="fixed w-full h-full left-0 top-0 z-0 blur-sm" />
      <main className="relative z-10 grid grid-cols-5 gap-4 p-4">
        <div className="col-span-2">
          <h1 className="text-4xl font-bold mb-4">Asteroid : {name}</h1>
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
            </div>
          </section>
        </div>
        <div className="col-span-3">
          <ThreeScene asteroid={params.id} />
        </div>
      </main>
    </div>
  );
}
