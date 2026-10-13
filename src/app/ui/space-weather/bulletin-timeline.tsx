"use client";
import { useState } from "react";
import type { DonkiNotificationItem } from "../../lib/nasa/donki";
import { observationDate } from "../../lib/observations/dates";
import { sanitizePlainText } from "../../lib/utils/text";
import { extractImageUrlsFromText, extractSourceUrlsFromText, formatNasaSummaryText } from "../library/helpers";
import { EmptyState } from "../orbital/chapter";
import MediaImage from "../orbital/media-image";
import s from "../orbital/chapters.module.css";
const names: Record<string,string> = { CME:"Coronal mass ejections", FLR:"Solar flares", GST:"Geomagnetic storms", IPS:"Interplanetary shocks", RBE:"Radiation belt enhancements", MPC:"Magnetopause crossings", SEP:"Energetic particles", HSS:"High-speed streams", Report:"Reports" };
export default function BulletinTimeline({reports,fallback}:{reports:DonkiNotificationItem[];fallback:boolean}) {
 const [category,setCategory]=useState("All");
 const categories=["All",...Array.from(new Set(reports.map(item=>item.messageType||"Other")))];
 const filtered=reports.filter(item=>category==="All"||(item.messageType||"Other")===category);
 return <div><div className={s.filters} aria-label="Bulletin categories">{categories.map(value=><button className={s.chip} key={value} aria-pressed={category===value} onClick={()=>setCategory(value)}>{names[value]||value}</button>)}</div><p className={s.caption} role="status">{filtered.length} bulletins, newest first. Dates are publication times.</p>      <section aria-label="Space weather bulletin timeline" className={s.bulletinTimeline}>
        {!reports.length ? <EmptyState title={fallback ? "NASA reports are temporarily unavailable" : "No bulletins in this snapshot"}><p>{fallback ? "The upstream feed could not be loaded. Check again later for observations." : "No notifications were returned for the requested period. This is not a measurement of current solar conditions."}</p></EmptyState> : filtered.map((item, index) => {
          const title = sanitizePlainText(item.messageTitle) || `${item.messageType || "Space weather"} bulletin ${item.messageID || ""}`;
          const summary = formatNasaSummaryText(item.messageBody, 520);
          const sources = extractSourceUrlsFromText(item.messageBody).slice(0, 4);
          const images = extractImageUrlsFromText(item.messageBody).slice(0, 2);
          return <article className={s.bulletinRecord} key={item.messageID || `${title}-${index}`}>
            <div className={s.meta}><span>{names[item.messageType || ""] || item.messageType || "NASA notification"}</span><time dateTime={item.messageIssueTime}>Published {observationDate(item.messageIssueTime)}</time></div>
            <h2>{title}</h2><p>{summary || "The notification API returned an empty text field. This does not establish whether the full report is available elsewhere; try the original NASA bulletin."}</p>
            <details><summary>Read bulletin details</summary><p style={{ whiteSpace: "pre-line" }}>{sanitizePlainText(item.messageBody) || "Details are unavailable."}</p>
              {images.length > 0 && <div className={s.recordGrid} style={{ marginTop: 24 }}>{images.map(url => <a href={url} key={url} target="_blank" rel="noopener noreferrer" className={s.artwork}><MediaImage src={url} alt={`Supporting visualization for ${title}`} loading="lazy" /></a>)}</div>}
              <div className={s.actions}>{sources.map((url, i) => <a key={url} className={s.textLink} href={url} target="_blank" rel="noopener noreferrer">Supporting source {i + 1}</a>)}</div>
            </details>
            {item.messageURL && <a href={item.messageURL} className={s.textLink} target="_blank" rel="noopener noreferrer">Original NASA bulletin</a>}
          </article>;
        })}
      </section>
</div>;
}
