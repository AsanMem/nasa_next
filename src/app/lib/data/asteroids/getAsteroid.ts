
export async function getAsteroid(id: string): Promise<any> {
    const res = await fetch(`https://api.nasa.gov/neo/rest/v1/neo/${id}?api_key=${process.env.APP_NASA_API_KEY}`);
    const data = await res.json();
    return data;
  }
  