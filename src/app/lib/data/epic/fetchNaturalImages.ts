

export async function fetchNaturalImages() {
    
    try {
        const response = await fetch(
            `https://api.nasa.gov/EPIC/api/natural/images?api_key=${process.env.NEXT_PUBLIC_NASA_API_KEY}`
        );
       
        if (!response.ok) {
            throw new Error('Network response was not ok');
          }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Response Error:", error);
    
    }
  


}
