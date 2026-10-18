import { pageMetadata } from "@/app/lib/site";
import { fetchApod } from "../lib/nasa/apod";
import DayClient from "../ui/day/day-client";
export const revalidate = 3600;
export const metadata=pageMetadata("/day","NASA media of the day | Orbital","Discover NASA’s astronomy picture or video of the day, with source dates and credits.");
export default async function Day() {
  const photoData = await fetchApod();
  return <DayClient photoData={photoData} build={{ time: new Date().toISOString(), commit: process.env.GITHUB_SHA?.slice(0, 7) }} />;
}
