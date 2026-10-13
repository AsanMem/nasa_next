import Link from "next/link";
import { Chapter, ChapterHeading } from "./ui/orbital/chapter";
import orbital from "./ui/orbital/orbital.module.css";
import s from "./ui/orbital/chapters.module.css";
export default function NotFound() {
  return <Chapter><ChapterHeading label="Page not found" title="A little off course." description="This destination could not be found. Return home or explore the NASA archive." /><div className={s.actions}><Link href="/" className={orbital.button}>Return to Orbital</Link><Link href="/library" className={s.textLink}>NASA archive</Link></div></Chapter>;
}
