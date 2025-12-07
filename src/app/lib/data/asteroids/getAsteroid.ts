'use server'

import { retryFetch } from "../fetchWithRetry";




export async function getAsteroid(id: string): Promise<any> {
  try {
    const response = await retryFetch(
      `https://api.nasa.gov/neo/rest/v1/neo/${id}?api_key=${process.env.APP_NASA_API_KEY}`
    );
    return await response.json();
  } catch (error) {
    console.error("Response Error:", error);
    return null;
  }
}
