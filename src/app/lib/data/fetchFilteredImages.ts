
const ITEMS_PER_PAGE = 12;
export async function fetchFilteredImages(query: string, currentPage: number) {
    const offset = (currentPage - 1) * ITEMS_PER_PAGE;
    const searchParams = new URLSearchParams({
        media_type: "image",
        q: query,
    });

    try {
        const response =  await fetch(
            `https://images-api.nasa.gov/search?${searchParams.toString()}`,
            {
                next: {
                    revalidate: 43200,
                },
            },
        );
        if (!response.ok) {
            throw new Error('Network response was not ok');
          }

        const previews = await response.json();
        
        const gallery = previews.collection.items;

        const totalPages = Math.ceil(Number(gallery.length) / ITEMS_PER_PAGE);
        const result = {
            gallery: gallery.slice(offset, offset + ITEMS_PER_PAGE)  || [],
            totalPages: totalPages  || 0 ,
        };

        return result;
    } catch (error) {
        console.error("Response Error:", error);
    }
}
