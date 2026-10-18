"use client";
import { usePathname } from "next/navigation";
import OrbitalHeader from "./orbital-header";

// Home and asteroid scenes own their header; all archive chapters share this one.
export default function ArchiveNavigation() {
  const pathname = usePathname();
  const routes = ["/day", "/gallery", "/video", "/eonet", "/space-weather", "/library", "/epic", "/techport", "/techtransfer", "/publics", "/privacy", "/birthday", "/learn"];
  return routes.some(route => pathname === route || pathname.startsWith(`${route}/`)) ? <OrbitalHeader /> : null;
}
