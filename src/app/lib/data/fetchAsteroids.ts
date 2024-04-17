import { formatDate } from "../utils";


export async function fetchAsteroids({ START_DATE = formatDate() , END_DATE = formatDate() } = {}
    ) {
    
      try {
        const results = await fetch(
            `https://api.nasa.gov/neo/rest/v1/feed?start_date=${START_DATE}&end_date=${END_DATE}&api_key=${process.env.APP_NASA_API_KEY}`
        );
        const pictureOfTheDay = await results.json();
    
        return pictureOfTheDay
      } catch (error) {
        console.error('Response Error:', error);
      //  throw new Error('Failed to fetch images.');
      }
    }