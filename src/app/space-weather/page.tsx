import BulletinTimeline from "../ui/space-weather/bulletin-timeline";
import SolarInfluence from "../ui/space-weather/solar-influence";
import Link from "next/link";
import { fetchDonkiNotifications } from "@/app/lib/nasa/donki";
import { Chapter, ChapterHeading } from "../ui/orbital/chapter";
import s from "../ui/orbital/chapters.module.css";

export const metadata = { title: "Space weather · Orbital", description: "Read the latest available NASA DONKI reports of solar activity and geomagnetic events." };
export const revalidate = 43200;
export default async function SpaceWeatherPage() {
  const notifications = await fetchDonkiNotifications({ limit: 100 });
  const reports = notifications.filter(item => !item.isFallback);
  const fallback = notifications.some(item => item.isFallback);
  return <Chapter><ChapterHeading label="The Sun's influence" title="Beyond the visible Sun." description="Solar eruptions send energy and material through our neighborhood. Learn how solar activity can affect auroras, satellites, radio and navigation, then explore NASA bulletins." />
    <SolarInfluence />
    <div className={s.split}><aside className={s.context}><h2>Reading the solar environment</h2><p>DONKI is NASA&apos;s Database Of Notifications, Knowledge, Information. These reports describe observed activity and scientific analysis; they are not a live safety forecast.</p><p>A solar flare is a burst of radiation. A coronal mass ejection carries plasma and magnetic fields into space. Geomagnetic storms describe disturbances near Earth.</p><Link href="/library" className={s.textLink}>Continue through the NASA archive</Link></aside>
      <BulletinTimeline reports={reports} fallback={fallback} />
    </div>
  </Chapter>;
}
