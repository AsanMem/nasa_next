"use server";
export async function getAsteroid(id: string): Promise<any> {


  
  try {
    const response = await fetch(`https://api.nasa.gov/neo/rest/v1/neo/${id}?api_key=${process.env.APP_NASA_API_KEY}`);

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Response Error:", error);

}
  }
  