"use client";
import { useEffect } from "react";

let owners = 0;
let restore: (() => void) | undefined;
/** A shared lock prevents nested dialogs from restoring the page prematurely. */
export function lockDocumentScroll() {
  if (owners++ === 0) {
    const root = document.documentElement, body = document.body, y = window.scrollY;
    const rootOverflow = root.style.overflow;
    const old = { overflow: body.style.overflow, position: body.style.position, top: body.style.top, width: body.style.width, paddingRight: body.style.paddingRight };
    const gutter = Math.max(0, window.innerWidth - root.clientWidth);
    root.style.overflow = "hidden";
    Object.assign(body.style, { overflow: "hidden", position: "fixed", top: `${-y}px`, width: "100%" });
    if (gutter) body.style.paddingRight = `${parseFloat(getComputedStyle(body).paddingRight || "0") + gutter}px`;
    restore = () => { root.style.overflow = rootOverflow; Object.assign(body.style, old); window.scrollTo({ top: y, behavior: "instant" }); };
  }
  let released = false;
  return () => { if (released) return; released = true; if (--owners === 0) { restore?.(); restore = undefined; } };
}
export function useScrollLock(locked: boolean) {
  useEffect(() => { if (locked) return lockDocumentScroll(); }, [locked]);
}
