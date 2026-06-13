'use server'

import { retryFetch } from "../fetchWithRetry";
import { buildNasaUrl } from "../../nasa/api";




export async function getAsteroid(id: string): Promise<any> {
  try {
    const url = buildNasaUrl(`https://api.nasa.gov/neo/rest/v1/neo/${id}`);

    const response = await retryFetch(
      url,
      {
        debugLabel: "asteroid-detail",
        fetchInit: {
          headers: {
            Accept: "application/json",
          },
          next: {
            revalidate: 43200,
          },
        },
      },
    );
    return await response.json();
  } catch (error) {
    console.error("Response Error:", error);
    return null;
  }
}
