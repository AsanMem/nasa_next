import { unstable_noStore } from "next/cache";

export async function fetchPictureOfTheDay(
) {
  try {
    const results = await fetch(
      `https://api.nasa.gov/planetary/apod?api_key=${process.env.APP_NASA_API_KEY}`
    );
    const pictureOfTheDay = await results.json();
  
    return pictureOfTheDay
  } catch (error) {
    console.error('Response Error:', error);
  //  throw new Error('Failed to fetch images.');
  }
}