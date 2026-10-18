import { pageMetadata } from "@/app/lib/site";
import { fetchOngoingEonetEvents } from "@/app/lib/nasa/eonet";
import { Chapter, ChapterHeading } from "../ui/orbital/chapter";
import EarthEvents from "../ui/eonet/earth-events";
export const metadata=pageMetadata("/eonet","Earth events on a globe | Orbital","Explore NASA EONET reports of wildfires, storms and ice events on an interactive Earth, with dated source observations.");
export const revalidate = 43200;
export default async function EonetPage() {
  const events = await fetchOngoingEonetEvents(24);
  return <Chapter><ChapterHeading compact title="Earth events" description="Choose a fire, storm or other event to see where NASA reported it." /><EarthEvents events={events} /></Chapter>;
}
