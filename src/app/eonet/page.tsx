import { fetchOngoingEonetEvents } from "@/app/lib/nasa/eonet";
import { Chapter, ChapterHeading } from "../ui/orbital/chapter";
import EarthEvents from "../ui/eonet/earth-events";
export const metadata = { title: "Earth events · Orbital", description: "Explore ongoing natural events reported by NASA EONET and its partners." };
export const revalidate = 43200;
export default async function EonetPage() {
  const events = await fetchOngoingEonetEvents(24);
  return <Chapter><ChapterHeading label="A changing planet" title="The world is never still." description="Fires, storms, ice and volcanic activity. Follow the ongoing natural events reported by NASA's Earth Observatory and its partners." /><EarthEvents events={events} /></Chapter>;
}
