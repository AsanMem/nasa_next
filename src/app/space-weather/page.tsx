import Link from "next/link";
import { observationDate } from '../lib/observations/dates';
import { fetchDonkiNotifications } from "@/app/lib/nasa/donki";
import { sanitizePlainText } from "@/app/lib/utils/text";
import { extractImageUrlsFromText, extractSourceUrlsFromText, formatNasaSummaryText } from "../ui/library/helpers";
import { Chapter, ChapterHeading, EmptyState } from "../ui/orbital/chapter";
import MediaImage from "../ui/orbital/media-image";
import s from "../ui/orbital/chapters.module.css";

export const metadata = { title: "Space weather · Orbital", description: "Read the latest available NASA DONKI reports of solar activity and geomagnetic events." };
export const revalidate = 43200;
export default async function SpaceWeatherPage() {
  const notifications = await fetchDonkiNotifications({ limit: 20 });
  const reports = notifications.filter(item => !item.isFallback);
  const fallback = notifications.some(item => item.isFallback);
  return <Chapter><ChapterHeading label="The Sun's influence" title="Beyond the visible Sun." description="Solar eruptions send energy and material through our neighborhood. Read the latest available NASA reports and the observations behind them." />
    <div className={s.split}><aside className={s.context}><h2>Reading the solar environment</h2><p>DONKI is NASA&apos;s Database Of Notifications, Knowledge, Information. These reports describe observed activity and scientific analysis; they are not a live safety forecast.</p><p>A solar flare is a burst of radiation. A coronal mass ejection carries plasma and magnetic fields into space. Geomagnetic storms describe disturbances near Earth.</p><Link href="/library" className={s.textLink}>Continue through the NASA archive</Link></aside>
      <section aria-label="Space weather bulletins">
        {!reports.length ? <EmptyState title={fallback ? "NASA reports are temporarily unavailable" : "No bulletins in this snapshot"}><p>{fallback ? "The upstream feed could not be loaded. Check again later for observations." : "No notifications were returned for the requested period. This is not a measurement of current solar conditions."}</p></EmptyState> : reports.map((item, index) => {
          const title = sanitizePlainText(item.messageTitle) || "Space weather bulletin";
          const summary = formatNasaSummaryText(item.messageBody, 520);
          const sources = extractSourceUrlsFromText(item.messageBody).slice(0, 4);
          const images = extractImageUrlsFromText(item.messageBody).slice(0, 2);
          return <article className={s.record} key={item.messageID || `${title}-${index}`}>
            <div className={s.meta}><span>{item.messageType || "NASA notification"}</span><time dateTime={item.messageIssueTime}>Published {observationDate(item.messageIssueTime)}</time></div>
            <h2>{title}</h2><p>{summary || "No summary was supplied."}</p>
            <details><summary>Read bulletin details</summary><p style={{ whiteSpace: "pre-line" }}>{sanitizePlainText(item.messageBody) || "Details are unavailable."}</p>
              {images.length > 0 && <div className={s.recordGrid} style={{ marginTop: 24 }}>{images.map(url => <a href={url} key={url} target="_blank" rel="noopener noreferrer" className={s.artwork}><MediaImage src={url} alt={`Supporting visualization for ${title}`} loading="lazy" /></a>)}</div>}
              <div className={s.actions}>{sources.map((url, i) => <a key={url} className={s.textLink} href={url} target="_blank" rel="noopener noreferrer">Supporting source {i + 1}</a>)}</div>
            </details>
            {item.messageURL && <a href={item.messageURL} className={s.textLink} target="_blank" rel="noopener noreferrer">Original NASA bulletin</a>}
          </article>;
        })}
      </section>
    </div>
  </Chapter>;
}
