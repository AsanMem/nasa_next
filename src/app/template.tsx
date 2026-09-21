import type { ReactNode } from "react";
import ArchiveNavigation from "./ui/orbital/archive-navigation";
import RouteEntry from "./ui/orbital/route-entry";

export default function Template({ children }: { children: ReactNode }) {
  return <RouteEntry><ArchiveNavigation />{children}</RouteEntry>;
}
