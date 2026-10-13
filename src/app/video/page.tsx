import SearchData from "../ui/gallery/search-images";
import ListVideos from "../ui/videos/list-videos";
import { fetchFilteredVideos } from "@/app/lib/data/fetchFilteredVideos";
import { fetchWikipediaArticles } from "@/app/lib/wiki";
import WikiSidebar from "../ui/wiki/wiki-sidebar";
import { Chapter, ChapterHeading } from "../ui/orbital/chapter";
import s from "../ui/orbital/chapters.module.css";

export const revalidate = 43200;
export const metadata = { title: "Films from space · Orbital", description: "Watch NASA missions, launches and discoveries from the video archive." };
export default async function PageVideos({ searchParams }: { searchParams?: { query?: string; page?: string } }) {
  const query = searchParams?.query || "";
  const currentPage = Number(searchParams?.page) || 1;
  const effectiveQuery = query.trim() || "space";
  const [{ videos, totalPages }, wikiArticles] = await Promise.all([
    (async () => (await fetchFilteredVideos(effectiveQuery, currentPage)) || { videos: [], totalPages: 0 })(),
    fetchWikipediaArticles(effectiveQuery, 8),
  ]);
  return <Chapter><ChapterHeading centered label="Missions in motion" title="See exploration unfold." description="Launches, life in orbit and stories from deep space. Find a film and take a closer look at the work of exploration." />
    <SearchData /><div className={s.archiveLayout}><section aria-label="NASA video results"><ListVideos videos={videos} totalPages={totalPages} query={query} /></section><WikiSidebar articles={wikiArticles} /></div>
  </Chapter>;
}
