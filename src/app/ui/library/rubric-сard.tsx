import Link from "next/link";
import { sanitizePlainText } from "@/app/lib/utils/text";
import s from "../orbital/chapters.module.css";

export type RubricCardItem = { title: string; detail?: string; meta?: string; imageUrl?: string };
export function RubricCard({ title, description, href, items }: { title: string; description: string; href: string; items: RubricCardItem[] }) {
  return <div><div className={s.sectionHeading}><div><h2>{title}</h2><p>{description}</p></div><Link href={href} className={s.textLink}>Explore collection</Link></div><div className={s.recordGrid}>{items.length ? items.slice(0, 4).map((item, i) => <article className={s.record} key={`${item.title}-${i}`}><h3>{sanitizePlainText(item.title)}</h3>{item.detail && <p>{sanitizePlainText(item.detail)}</p>}{item.meta && <p className={s.caption}>{item.meta}</p>}</article>) : <p className={s.caption}>No entries are available in this snapshot. Open the full collection to explore further.</p>}</div></div>;
}
