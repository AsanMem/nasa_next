export const getAsteroidData = (asteroids: any) => {
    return asteroids.map((asteroid:any )=> {
      // Получаем диаметры в метрах
      const minDiameterMeters = Math.round(asteroid.estimated_diameter.meters.estimated_diameter_min);
      const maxDiameterMeters = Math.round(asteroid.estimated_diameter.meters.estimated_diameter_max);
  
      // Получаем скорость в км/с
      const velocity = Math.round(asteroid.close_approach_data[0]?.relative_velocity.kilometers_per_second) || 0;
  
      return {
        id: asteroid.id,
        name: asteroid.name,
        diameterMinMeters: minDiameterMeters,
        diameterMaxMeters: maxDiameterMeters,
        averageDiameter : (minDiameterMeters + maxDiameterMeters) / 2 , 
        velocityKmph: velocity, 
      };
    });
  };