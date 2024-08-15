import { unstable_noStore } from "next/cache";
import { formatDate } from "../utils";

export async function fetchPictureOfTheDay() {
    try {
        const results = await fetch(
            `https://api.nasa.gov/planetary/apod?api_key=${
                process.env.APP_NASA_API_KEY
            }&date=${formatDate()}`
        );
        const pictureOfTheDay = await results.json();
        return pictureOfTheDay;
    } catch (error) {
        console.error("Response Error:", error);
    }
}
