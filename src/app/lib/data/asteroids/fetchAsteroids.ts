'use server'
import { retryFetch } from "../fetchWithRetry";
import { buildNasaUrl } from "../../nasa/api";


import { formatDate } from "../../utils";

export async function fetchAsteroids({
  START_DATE = formatDate(),
  END_DATE = formatDate(),
} = {}) {
  try {
    const url = buildNasaUrl("https://api.nasa.gov/neo/rest/v1/feed", {
      start_date: START_DATE,
      end_date: END_DATE,
    });

    const response = await retryFetch(
      url,
      { debugLabel: "asteroids-feed" },
    );
    return await response.json();
  } catch (error) {
    console.error("Response Error:", error);
    return null;
  }
}
