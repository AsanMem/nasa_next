import { pageMetadata } from "@/app/lib/site";
import Link from "next/link";
import { Chapter, ChapterHeading } from "../ui/orbital/chapter";
import s from "../ui/orbital/chapters.module.css";
export const metadata=pageMetadata("/publics","Sources and methods | Orbital","Learn where Orbital’s NASA observations come from and how illustrative scenes differ from measured data.");
export default function Publics() {
  return <Chapter><ChapterHeading label="Sources & methods" title="Curiosity, with context." description="Orbital is an independent way to explore NASA's public observations. Here is how to read what you see." />
    <div className={s.split}><aside className={s.context}><h2>Observations and illustrations</h2><p>Publication dates belong to the source. An available snapshot may be older than today, and an empty feed does not mean nothing is happening.</p><p>The Earth, Moon and asteroid scenes are illustrations. Reconstructed asteroid shapes are not measurements of their actual surfaces.</p><Link href="/library" className={s.textLink}>Return to the archive</Link></aside><div>
      {[["Astronomy Picture of the Day", "NASA's selected image or video and the explanation behind it.", "/day"], ["Near-Earth objects", "NASA encounter data, estimated dimensions and approach histories.", "/asteroids"], ["Earth events", "Natural events reported by EONET and its partner organizations.", "/eonet"], ["Space weather", "NASA DONKI notifications and their original source bulletins.", "/space-weather"], ["Images and films", "NASA's media archive. Original assets and descriptions accompany each item.", "/gallery"], ["Earth from deep space", "Natural-color Earth imagery captured by the EPIC camera aboard DSCOVR.", "/epic"]].map(([title, text, href]) => <article className={s.record} key={href}><h2>{title}</h2><p>{text}</p><div className={s.actions}><Link href={href} className={s.textLink}>Explore this source</Link></div></article>)}
    </div></div>
  </Chapter>;
}
