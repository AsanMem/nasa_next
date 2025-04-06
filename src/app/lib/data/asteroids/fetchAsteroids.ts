


import { formatDate } from "../../utils";

export async function fetchAsteroids({
    START_DATE = formatDate(),
    END_DATE = formatDate(),
} = {}) {
    try {
        const results = await fetch(
            `https://api.nasa.gov/neo/rest/v1/feed?start_date=${START_DATE}&end_date=${END_DATE}&api_key=${process.env.NEXT_PUBLIC_NASA_API_KEY}`
        );


        if (!results.ok) {
            throw new Error('Network response was not ok');
          }
        const asteroidsJSON = await results.json();

        return asteroidsJSON;
    } catch (error) {
        console.error("Response Error:", error);
    }
}
