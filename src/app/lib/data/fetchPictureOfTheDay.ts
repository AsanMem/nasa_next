"use server";

import { unstable_noStore } from "next/cache";
import { formatDate } from "../utils";

export async function fetchPictureOfTheDay() {
   
    try {
        const response = await fetch(
            `https://api.nasa.gov/planetary/apod?api_key=${
                process.env.APP_NASA_API_KEY
            }&date=${formatDate()}`,
            {
                headers: {
                    'Cache-Control': 'no-store',
                }
            }
        );
        if (!response.ok) {
            throw new Error('Network response was not ok');
          }


        const pictureOfTheDay = await response.json();
        return pictureOfTheDay;
    } catch (error) {
        console.error("Response Error:", error);
    }
}
