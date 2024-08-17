
export async function fetchNaturalImagesByDate(date: string) {
    try {
        const response = await fetch(
            `https://api.nasa.gov/EPIC/api/natural/date/${date}?api_key=${process.env.APP_NASA_API_KEY}`
        );
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Response Error:", error);
    }
}