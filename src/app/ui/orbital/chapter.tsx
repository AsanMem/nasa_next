import Link from "next/link";
import type { ReactNode } from "react";
import orbital from "./orbital.module.css";
import s from "./chapters.module.css";
import { site } from "../../lib/site";

export function Chapter({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <main id="chapter-content" className={`${orbital.theme} ${s.chapter} ${className}`}>
    <div className={s.content}>{children}</div>
    <footer className={s.footer}><Link href="/">Orbital / Home</Link><p>By {site.author}. Exploring NASA&apos;s public data.</p><Link href="/library">Explore the archive</Link><Link className={s.privacyLink} href="/privacy">Privacy & sources</Link></footer>
  </main>;
}
export function ChapterHeading({ label, title, description, children, centered = false, compact = false }: { compact?: boolean; centered?: boolean; label?: string; title: string; description?: string; children?: ReactNode }) {
  return <header className={`${s.heading} ${centered ? s.centeredHeading : ""} ${compact ? s.compactHeading : ""}`}>{label && <p className={s.eyebrow}>{label}</p>}<h1>{title}</h1>{description && <p className={s.lead}>{description}</p>}{children}</header>;
}
export function EmptyState({ title, children }: { title: string; children: ReactNode }) {
  return <div className={s.empty}><h2>{title}</h2><div>{children}</div></div>;
}
export function ChapterLoading({ title = "Loading your view" }: { title?: string }) {
  return <Chapter><div className={s.compactLoading} role="status"><span className={s.orbitLoader} aria-hidden="true"><i/></span><p>{title}…</p><span className={s.caption}>Preparing the available observations.</span></div></Chapter>;
}
export function ArchiveSkeleton() {
  return <div aria-busy="true" className={s.archiveSkeleton}><p role="status">Loading NASA results…</p><div aria-hidden="true"/><div aria-hidden="true"/></div>;
}
