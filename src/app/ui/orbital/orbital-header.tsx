"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { destinations } from "./destinations";
import s from "./orbital.module.css";

export default function OrbitalHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const chapter = destinations.find(item => pathname.startsWith(item.href));
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const element = dialog.current;
    const returnFocus = trigger.current;
    const previousOverflow = document.body.style.overflow;
    const previousRootOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    element?.showModal();
    return () => { element?.close(); document.body.style.overflow = previousOverflow; document.documentElement.style.overflow = previousRootOverflow; returnFocus?.focus({ preventScroll: true }); };
  }, [open]);
  return <>
    <header className={`${s.theme} ${s.header}`}>
      <Link href="/" className={s.brand} aria-label="Orbital home"><Image src="/orbital-icon.svg" alt="" width={58} height={48} priority /><span>Orbital<small>An independent NASA explorer</small></span></Link>
      <nav className={s.nav} aria-label="Expedition navigation"><span className={s.chapter}>{chapter?.title ?? (pathname === "/" ? "Follow your curiosity" : "NASA archive")}</span><button className={`${s.button} ${s.quiet}`} ref={trigger} type="button" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)}>Expedition map <span aria-hidden="true">↗</span></button></nav>
    </header>
    <dialog ref={dialog} className={`${s.theme} ${s.map}`} aria-modal="true" aria-labelledby="expedition-map-title" onCancel={() => setOpen(false)} onClose={() => setOpen(false)} onKeyDown={event => {
      if (event.key !== "Tab") return;
      const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'));
      const first = items[0], last = items[items.length - 1];
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    }}>
      <div className={s.mapTop}><Link href="/" onClick={() => setOpen(false)}>Orbital / Home</Link><button type="button" className={`${s.button} ${s.quiet}`} onClick={() => setOpen(false)} autoFocus>Close map ×</button></div>
      <h2 id="expedition-map-title">Where curiosity<br />takes you.</h2><p>Six chapters of one expedition. A map of what you can explore, not a map of physical orbits.</p>
      <nav aria-label="All expedition chapters" className={s.mapGrid}>{destinations.map(item => <Link className={s.destination} href={item.href} key={item.href} aria-current={chapter?.href === item.href ? "page" : undefined} onClick={() => setOpen(false)}><h3>{item.title} <span aria-hidden="true">↗</span></h3><p>{item.description}</p></Link>)}</nav>
      <nav className={s.mapExtras} aria-label="More observations"><Link href="/library" onClick={() => setOpen(false)}>Observation journal</Link><Link href="/epic" onClick={() => setOpen(false)}>Earth from deep space / EPIC</Link><Link href="/birthday" onClick={() => setOpen(false)}>Universe on your birthday</Link></nav>
    </dialog>
  </>;
}
