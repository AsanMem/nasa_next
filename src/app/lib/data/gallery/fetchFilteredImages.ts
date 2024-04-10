import { unstable_noStore } from "next/cache";

const ITEMS_PER_PAGE = 10
export async function fetchFilteredImages(
  query: string,
  currentPage: number,
) {
  
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const results = await fetch(`https://images-api.nasa.gov/search?media_type=image&q=${query}`);

    const previews = await results.json();
    console.log(previews.collection,"previews.collection")
    const gallery = previews.collection.items
    console.log(gallery.length)
  //  console.log({ITEMS_PER_PAGE,offset})
  // console.log(previews.collection)

    const totalPages = Math.ceil(Number(gallery.length) / ITEMS_PER_PAGE);
    const result =  { gallery : gallery.slice(offset , offset + ITEMS_PER_PAGE) ,totalPages : totalPages };
    console.log(result,"result")
    return result
  } catch (error) {
    console.error('Response Error:', error);
  //  throw new Error('Failed to fetch images.');
  }
}