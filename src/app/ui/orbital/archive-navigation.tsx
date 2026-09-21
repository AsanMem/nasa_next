"use client";
import { usePathname } from "next/navigation";
import OrbitalHeader from "./orbital-header";

// These existing archive pages have no header of their own. Their content stays intact.
export default function ArchiveNavigation() {
  const pathname = usePathname();
  const routes = ["/eonet", "/space-weather", "/library", "/epic", "/techport", "/techtransfer", "/publics"];
  return routes.some(route => pathname === route || pathname.startsWith(`${route}/`)) ? <OrbitalHeader /> : null;
}
