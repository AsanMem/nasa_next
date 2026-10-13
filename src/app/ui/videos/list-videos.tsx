import Link from "next/link";
import Pagination from "../shared/pagination";
import CardVideo from "./card-video";
import { EmptyState } from "../orbital/chapter";
import s from "../orbital/chapters.module.css";

type VideoItem = { data?: { title?: string; description?: string; keywords?: string[] }[]; links?: { href?: string }[]; videoUrl?: string | null };
export default function ListVideos({ videos, totalPages }: { videos: VideoItem[]; totalPages: number; query: string }) {
  if (!videos?.length) return <EmptyState title="No films to show"><p>No results were returned. Try a different subject or check again later.</p><Link href="/video">Clear the search</Link></EmptyState>;
  return <><div className={s.contactSheet}>{videos.map((video, index) => <CardVideo key={`${video.data?.[0]?.title}-${index}`} videoPreview={video.links?.[0]?.href || ""} videoPlay={video.videoUrl || ""} title={video.data?.[0]?.title || "NASA film"} description={video.data?.[0]?.description || ""} keywords={video.data?.[0]?.keywords} />)}</div>{totalPages > 1 && <Pagination totalPages={totalPages} />}</>;
}
