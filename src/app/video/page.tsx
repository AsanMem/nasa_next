import { pageMetadata } from "@/app/lib/site";
import { Suspense } from "react";
import SearchData from "../ui/gallery/search-images";
import ListVideos from "../ui/videos/list-videos";
import { fetchFilteredVideos } from "@/app/lib/data/fetchFilteredVideos";
import { fetchWikipediaArticles } from "@/app/lib/wiki";
import WikiSidebar from "../ui/wiki/wiki-sidebar";
import { ArchiveSkeleton, Chapter, ChapterHeading } from "../ui/orbital/chapter";
import s from "../ui/orbital/chapters.module.css";

export const revalidate = 43200;
export const metadata=pageMetadata("/video","NASA space videos | Orbital","Search films of NASA missions, launches and discoveries, with source descriptions and original media.");
async function Results({query,page}:{query:string;page:number}) {
  const effective=query.trim()||"space";
  const [{videos,totalPages},articles]=await Promise.all([fetchFilteredVideos(effective,page).then(value=>value||{videos:[],totalPages:0}),fetchWikipediaArticles(effective,8)]);
  return <div className={s.archiveLayout}><section aria-label="NASA video results"><ListVideos videos={videos} totalPages={totalPages} query={query}/></section><WikiSidebar articles={articles}/></div>;
}
export default function Page({searchParams}:{searchParams?:{query?:string;page?:string}}) {
  const query=searchParams?.query||"",page=Math.max(1,Number(searchParams?.page)||1);
  return <Chapter><ChapterHeading compact title="Videos"/><SearchData kind="video"/>
    <Suspense key={`${query}:${page}`} fallback={<ArchiveSkeleton/>}><Results query={query} page={page}/></Suspense>
  </Chapter>;
}
