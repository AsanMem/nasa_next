import { unstable_noStore } from "next/cache";

const ITEMS_PER_PAGE = 12;
export async function fetchFilteredVideos(query: string, currentPage: number) {
    const offset = (currentPage - 1) * ITEMS_PER_PAGE;

    try {
        const response = await fetch(
            `https://images-api.nasa.gov/search?q=${query}&page=${1}&media_type=video`
        );

        if (!response.ok) {
            throw new Error('Network response was not ok');
          }
        const previews = await response.json();
        const galleryVideos = previews.collection.items;

        const totalPages = Math.ceil(
            Number(galleryVideos.length) / ITEMS_PER_PAGE
        );
        const result = {
            videos: galleryVideos.slice(offset, offset + ITEMS_PER_PAGE) || [],
            totalPages: totalPages || 0,
        };

        return result;
    } catch (error) {
        console.error("Response Error:", error);
    }
}
