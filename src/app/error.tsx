"use client";
import Link from "next/link";
import { Chapter, ChapterHeading } from "./ui/orbital/chapter";
import s from "./ui/orbital/chapters.module.css";
import orbital from "./ui/orbital/orbital.module.css";
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <Chapter><ChapterHeading label="This chapter is unavailable" title="Let’s try that again." description="Something prevented this page from opening. Try reloading the chapter, or return to the expedition." /><div className={s.actions}><button type="button" className={orbital.button} onClick={reset}>Try again</button><Link className={s.textLink} href="/">Back to Orbital</Link></div></Chapter>;
}
