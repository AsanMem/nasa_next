import ListImages from "../ui/gallery/list-images";
import SearchData from "../ui/gallery/search-images";
import { fetchFilteredImages } from "@/app/lib/data/fetchFilteredImages";
import { fetchWikipediaArticles } from "@/app/lib/wiki";
import WikiSidebar from "../ui/wiki/wiki-sidebar";
import { Chapter, ChapterHeading } from "../ui/orbital/chapter";
import s from "../ui/orbital/chapters.module.css";

export const revalidate = 43200;
export const metadata = { title: "Image gallery · Orbital", description: "Explore NASA's photographic archive of missions, people, planets and discoveries." };
export default async function Page({ searchParams }: { searchParams?: { query?: string; page?: string } }) {
  const query = searchParams?.query || "";
  const currentPage = Number(searchParams?.page) || 1;
  const [{ gallery, totalPages }, wikiArticles] = await Promise.all([
    (async () => (await fetchFilteredImages(query, currentPage)) || { gallery: [], totalPages: 0 })(),
    fetchWikipediaArticles(query, 8),
  ]);
  return <Chapter><ChapterHeading label="The photographic archive" title="A universe of perspectives." description="From a first step on the Moon to the faintest distant galaxy. Explore the places, people and discoveries in NASA's image archive." />
    <SearchData /><div className={s.archiveLayout}><section aria-label="NASA image results"><ListImages gallery={gallery} totalPages={totalPages} /></section><WikiSidebar articles={wikiArticles} /></div>
  </Chapter>;
}
