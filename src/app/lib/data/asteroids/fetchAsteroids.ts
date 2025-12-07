'use server'
import { retryFetch } from "../fetchWithRetry";


import { formatDate } from "../../utils";

export async function fetchAsteroids({
  START_DATE = formatDate(),
  END_DATE = formatDate(),
} = {}) {
  try {
    const response = await retryFetch(
      `https://api.nasa.gov/neo/rest/v1/feed?start_date=${START_DATE}&end_date=${END_DATE}&api_key=${process.env.APP_NASA_API_KEY}`
    );
    return await response.json();
  } catch (error) {
    console.error("Response Error:", error);
    return null;
  }
}
