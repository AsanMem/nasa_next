import { pageMetadata } from "@/app/lib/site";
import { fetchTechTransferPatents, fetchTechTransferSoftware } from "@/app/lib/nasa/techtransfer";
import { sanitizePlainText } from "@/app/lib/utils/text";
import { Chapter, ChapterHeading, EmptyState } from "../ui/orbital/chapter";
import s from "../ui/orbital/chapters.module.css";

export const metadata=pageMetadata("/techtransfer","NASA patents and software | Orbital","Explore public NASA technology transfer patents and software records.");
export const revalidate = 86400;
function AssetList({ items, label }: { items: Awaited<ReturnType<typeof fetchTechTransferPatents>>; label: string }) {
  if (!items.length) return <EmptyState title={`${label} are unavailable`}><p>No entries were returned in this snapshot. Check again later.</p></EmptyState>;
  return <div>{items.map((item, index) => <article className={s.record} key={`${item.reference || item.title}-${index}`}><h3>{sanitizePlainText(item.title) || "Untitled technology"}</h3>{item.description && <p>{sanitizePlainText(item.description)}</p>}<div className={s.meta}>{item.center && item.center.length <= 80 && <span>{item.center}</span>}{item.releaseDateFormatted && <span>Released {item.releaseDateFormatted}</span>}{item.patentNumber && <span>Patent {item.patentNumber}</span>}</div>{item.center && item.center.length > 80 && <p>{sanitizePlainText(item.center)}</p>}{item.url && <a className={s.textLink} href={item.url} target="_blank" rel="noopener noreferrer">View NASA record</a>}</article>)}</div>;
}
export default async function TechTransferPage() {
  const [patents, software] = await Promise.all([fetchTechTransferPatents(12), fetchTechTransferSoftware(12)]);
  return <Chapter><ChapterHeading label="NASA technology transfer" title="Space research. Earthly possibilities." description="Explore NASA inventions available for licensing and software developed through the work of space exploration." /><nav className={s.actions} aria-label="Technology collections"><a className={s.textLink} href="#patents">Patents</a><a className={s.textLink} href="#software">Software</a></nav>
    <section className={s.split} id="patents" style={{ marginTop: 64 }}><div className={s.context}><h2>Patents</h2><p>Inventions with applications beyond the mission. Original records explain availability and licensing.</p></div><AssetList items={patents} label="Patent listings" /></section>
    <section className={s.split} id="software" style={{ marginTop: 80 }}><div className={s.context}><h2>Software</h2><p>Tools built through NASA research. Review the original record for access requirements and terms.</p></div><AssetList items={software} label="Software listings" /></section>
  </Chapter>;
}
