import Link from "next/link";
import type { ReactNode } from "react";
import orbital from "./orbital.module.css";
import s from "./chapters.module.css";

export function Chapter({ children }: { children: ReactNode }) {
  return <main id="chapter-content" className={`${orbital.theme} ${s.chapter}`}>
    <div className={s.content}>{children}</div>
    <footer className={s.footer}><Link href="/">Orbital / Home</Link><p>An independent exploration of NASA&apos;s public data.</p><Link href="/library">Explore the archive</Link></footer>
  </main>;
}
export function ChapterHeading({ label, title, description, children }: { label: string; title: string; description?: string; children?: ReactNode }) {
  return <header className={s.heading}><p className={s.eyebrow}>{label}</p><h1>{title}</h1>{description && <p className={s.lead}>{description}</p>}{children}</header>;
}
export function EmptyState({ title, children }: { title: string; children: ReactNode }) {
  return <div className={s.empty}><h2>{title}</h2><div>{children}</div></div>;
}
export function ChapterLoading({ title = "Opening the next chapter" }: { title?: string }) {
  return <Chapter><div className={s.loading} role="status"><p className={s.eyebrow}>Orbital</p><h1>{title}</h1><p>Retrieving the available observations from NASA.</p><div className={s.loadingLine} aria-hidden="true" /></div></Chapter>;
}
