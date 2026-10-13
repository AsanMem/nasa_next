import Link from "next/link";
import Pagination from "../shared/pagination";
import CardTopic, { type ImageTopic } from "./card-topic";
import { EmptyState } from "../orbital/chapter";
import s from "../orbital/chapters.module.css";

export default function ListImages({ gallery, totalPages }: { gallery: ImageTopic[]; totalPages: number }) {
  if (!gallery?.length) return <EmptyState title="No images to show"><p>No results were returned. Try another subject or return later if NASA is unavailable.</p><Link href="/gallery">Clear the search</Link></EmptyState>;
  return <><div className={s.contactSheet}>{gallery.map((item, index) => <CardTopic topic={item} key={`${item.data?.[0]?.nasa_id || item.data?.[0]?.title}-${index}`} />)}</div>{totalPages > 1 && <Pagination totalPages={totalPages} />}</>;
}
