// src/app/asteroids/[id]/page.tsx
import React from 'react';
import ThreeScene from '@/app/ui/treejs/scene/ThreeScene';

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



export default async function Page({ params }: { params: { id: string } }) {
  const asteroid = await getAsteroid(params.id);
  console.log(asteroid, "asteroid")
  return (
    <div>
      <h1>Asteroid ID: {params.id}</h1>
      <ThreeScene asteroid={asteroid} />
    </div>
  );
}
