'use server'
import { retryFetch } from "../fetchWithRetry";
// import { unstable_noStore } from "next/cache";
 import { formatDate } from "../../utils";


export async function fetchPictureOfTheDay() {
  try {
    const response = await retryFetch(
      `https://api.nasa.gov/planetary/apod?api_key=${process.env.APP_NASA_API_KEY}&date=${formatDate()}`,
    //   {
    //     headers: {
    //       "Cache-Control": "no-store",
    //     },
    //   }
    );
    console.log(response,"response")
    return await response.json();
  } catch (error) {
    console.error("Response Error:", error);
    return null;
  }
}
