import { pageMetadata } from "@/app/lib/site";
import { Suspense } from "react";
import ListImages from "../ui/gallery/list-images";
import SearchData from "../ui/gallery/search-images";
import { fetchFilteredImages } from "@/app/lib/data/fetchFilteredImages";
import { fetchWikipediaArticles } from "@/app/lib/wiki";
import WikiSidebar from "../ui/wiki/wiki-sidebar";
import { ArchiveSkeleton, Chapter, ChapterHeading } from "../ui/orbital/chapter";
import s from "../ui/orbital/chapters.module.css";

export const revalidate = 43200;
export const metadata=pageMetadata("/gallery","NASA image gallery | Orbital","Search NASA photographs of missions, planets, galaxies and discoveries. Open full images and explore their source records.");
async function Results({query,page}:{query:string;page:number}) {
  const [{gallery,totalPages},articles] = await Promise.all([fetchFilteredImages(query,page).then(value=>value||{gallery:[],totalPages:0}),fetchWikipediaArticles(query,8)]);
  return <div className={s.archiveLayout}><section aria-label="NASA image results"><ListImages gallery={gallery} totalPages={totalPages}/></section><WikiSidebar articles={articles}/></div>;
}
export default function Page({searchParams}:{searchParams?:{query?:string;page?:string}}) {
  const query=searchParams?.query||"",page=Math.max(1,Number(searchParams?.page)||1);
  return <Chapter><ChapterHeading compact title="Image gallery"/><SearchData kind="image"/>
    <Suspense key={`${query}:${page}`} fallback={<ArchiveSkeleton/>}><Results query={query} page={page}/></Suspense>
  </Chapter>;
}
