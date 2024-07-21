

import { unstable_noStore } from "next/cache";
import { env } from "process";

const ITEMS_PER_PAGE = 10
export async function fetchImageOfTheDay() {
  
  try {
   
    const res = await fetch(
        `https://api.nasa.gov/planetary/apod?api_key=${env.APP_NASA_API_KEY}`
      );
      const result = await res.json();
   // console.log(result,"result")
    return result
  } catch (error) {
    console.error('Response Error:', error);
  //  throw new Error('Failed to fetch images.');
  }
}