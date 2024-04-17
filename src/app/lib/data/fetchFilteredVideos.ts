import { unstable_noStore } from "next/cache";

const ITEMS_PER_PAGE = 12
export async function fetchFilteredVideos(
  query: string,
  currentPage: number,
) {
  
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {

   const results = await fetch(`https://images-api.nasa.gov/search?q=${query}&page=${1}&media_type=video`);
    const previews = await results.json();
   // console.log(previews,"previews")
    const galleryVideos = previews.collection.items
  // console.log(galleryVideos.length)
  //  console.log( previews.collection.metadata?.total_hits," previews?.metadata?.total_hits")
    const totalPages = Math.ceil(Number(galleryVideos.length ) / ITEMS_PER_PAGE ); //previews.collection.metadata?.total_hits  ITEMS_PER_PAGE 
    const result =  { videos : galleryVideos.slice(offset , offset + ITEMS_PER_PAGE) ?? [] ,totalPages : totalPages }; // totalPages

    return result
  } catch (error) {
    console.error('Response Error:', error);
  //  throw new Error('Failed to fetch images.');
  }
}