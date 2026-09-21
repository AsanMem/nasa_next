"use client";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import s from "./orbital.module.css";

export default function RouteEntry({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  // Nested catalog/profile navigation also enters a new scene. Query-only
  // changes (search and selected events) keep their existing component state.
  const orbitalScene = pathname === "/" || pathname === "/asteroids" || /^\/asteroids\/[^/]+\/[^/]+$/.test(pathname);
  return <div key={pathname} className={orbitalScene ? undefined : s.entry}>{children}</div>;
}
