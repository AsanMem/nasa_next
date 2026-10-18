import { pageMetadata } from "@/app/lib/site";
export const metadata=pageMetadata("/library","Space observation journal | Orbital","Explore source-dated NASA observations, recent discoveries, Earth imagery and asteroid encounters in one journal.");
import { Chapter, ChapterHeading, EmptyState } from "../ui/orbital/chapter";
import s from "../ui/orbital/chapters.module.css";
import Link from "next/link";
import { apodExhibit } from '../lib/observations/apod';
import MediaImage from '../ui/orbital/media-image';
import { buildJournal, type JournalEntry } from '../lib/observations/journal';
import { observationDate, sourceTime } from '../lib/observations/dates';
import { sanitizePlainText, truncatePlainText } from '../lib/utils/text';
import { ROUTES } from "@/app/lib/constants/routes";
import { fetchDonkiNotifications } from "@/app/lib/nasa/donki";
import { fetchOngoingEonetEvents } from "@/app/lib/nasa/eonet";
import { fetchTodayNeoFeed } from "@/app/lib/nasa/neows";
import { fetchApod } from "@/app/lib/nasa/apod";
import { fetchNasaImages, fetchNasaVideos } from "@/app/lib/nasa/media";
import { fetchEpicImages } from "@/app/lib/nasa/epic";
import {
  fetchTechTransferPatents,
  fetchTechTransferSoftware,
} from "@/app/lib/nasa/techtransfer";
import type { DonkiNotificationItem } from "@/app/lib/nasa/donki";
import type { EonetEvent } from "@/app/lib/nasa/eonet";
import type { NeoFeedItem } from "@/app/lib/nasa/neows";
import type { ApodItem } from "@/app/lib/nasa/apod";
import type { EpicImage } from "@/app/lib/nasa/epic";
import type { TechTransferItem } from "@/app/lib/nasa/techtransfer";

import { PREVIEW_SECTIONS, PreviewContent } from "../ui/library/constants";
import { RubricCard, RubricCardItem } from "../ui/library/rubric-сard";
import { getApodPreview, getDailyKeyword, getEpicPreview, getFirstAssetPreview, getNeoPreview, mapTechTransferItemToRubricItem } from "../ui/library/helpers";
import { PreviewCard } from "../ui/library/preview-card";

export const revalidate = 43200;

export default async function LibraryPage() {

  const imageKeyword = getDailyKeyword(0);
  const videoKeyword = getDailyKeyword(5);

  const [
    donkiResult,
    eonetResult,
    neosResult,
    apodResult,
    imagesResult,
    videosResult,
    epicResult,
    // techportResult,
    patentsResult,
    softwareResult,
  ] = await Promise.allSettled([
    fetchDonkiNotifications(),
    fetchOngoingEonetEvents(6),
    fetchTodayNeoFeed(),
    fetchApod(43200),
    fetchNasaImages(imageKeyword, 6),
    fetchNasaVideos(videoKeyword, 6),
    fetchEpicImages(6),
    // fetchTechportProjects(6),
    fetchTechTransferPatents(6),
    fetchTechTransferSoftware(6),
  ] as const);
  const donki: DonkiNotificationItem[] =
    donkiResult.status === "fulfilled" ? donkiResult.value : [];
  const liveDonki = donki.filter((item) => !item.isFallback);
  const eonet: EonetEvent[] = eonetResult.status === "fulfilled" ? eonetResult.value : [];
  const neos: NeoFeedItem[] = neosResult.status === "fulfilled" ? neosResult.value : [];
  const apod: ApodItem | null = apodExhibit(apodResult.status === "fulfilled" ? apodResult.value : null);
  const images = imagesResult.status === "fulfilled" ? imagesResult.value : [];
  const videos = videosResult.status === "fulfilled" ? videosResult.value : [];

  const epic: EpicImage[] = epicResult.status === "fulfilled" ? epicResult.value : [];
  //  const techport: TechportProjectSummary[] = techportResult.status === "fulfilled" ? techportResult.value : [];
  const patents: TechTransferItem[] =
    patentsResult.status === "fulfilled" ? patentsResult.value : [];
  const software: TechTransferItem[] =
    softwareResult.status === "fulfilled" ? softwareResult.value : [];

  const latestEpic = [...epic].sort((a,b)=>(sourceTime(b.date)??-Infinity)-(sourceTime(a.date)??-Infinity))[0];
  const generatedAt = new Date().toISOString();
  const journal = buildJournal(liveDonki,eonet,neos);
  const apodFallback = !apod || Boolean(apod.url?.startsWith('/'));
  const archiveImage = getFirstAssetPreview(images, 'NASA archive image');
  const issueImage = apodFallback ? archiveImage?.media?.url || apod?.url : apod?.media_type === 'image' ? apod.url : apod?.thumbnail_url;
  const renderEntries = (items: JournalEntry[]) => <div className={s.recordGrid}>{items.map(item=><article key={item.source+item.id+item.sourceDate} className={s.record}><div className={s.meta}><span>{item.source}</span><span>{item.kind==='publication'?'Published':item.kind==='encounter'?'Encounter date':'Observed'}: {observationDate(item.sourceDate)}</span></div><h3>{sanitizePlainText(item.title)}</h3>{item.summary&&<p>{truncatePlainText(item.summary,320)}</p>}<div className={s.actions}><Link className={s.textLink} href={item.href}>Explore this section</Link>{item.sourceUrl&&/^https?:\/\//.test(item.sourceUrl)&&<a className={s.textLink} href={item.sourceUrl} target="_blank" rel="noopener noreferrer">Original source</a>}</div></article>)}</div>;


  const techTransferRubricItems: RubricCardItem[] = [
    ...patents.slice(0, 1),
    ...software.slice(0, 1),
    ...patents.slice(1, 2),
    ...software.slice(1, 2),
  ].map(mapTechTransferItemToRubricItem);

  const previewContentBySection: Record<string, PreviewContent | null> = {
    apod: getApodPreview(apod),
    images: getFirstAssetPreview(images, "NASA Image"),
    videos: getFirstAssetPreview(videos, "NASA Video"),
    epic: getEpicPreview(epic),
    neos: getNeoPreview(neos),
  };

  return <Chapter>
    <ChapterHeading label="Orbital journal" title="Observation journal." description="A dated issue of available NASA reports, Earth observations and mission imagery." />
    <section className={s.issue} aria-label="This issue">
      <figure><MediaImage src={issueImage} alt={(apodFallback?archiveImage?.title:apod?.title)||'Issue image unavailable'} loading="eager"/><figcaption className={s.caption}>{apodFallback?(archiveImage?.media?'Archive selection: '+archiveImage.title+'. Published '+observationDate(archiveImage.metadata):'Illustrative local archive image; NASA media unavailable.'):'Issue image: '+(apod?.title||'NASA APOD')+'. Published '+observationDate(apod?.date)}{apod?.copyright?' / '+apod.copyright:''}</figcaption></figure>
      <div><h2>{apodFallback?'Available in this issue':sanitizePlainText(apod?.title)}</h2><p>{apodFallback?'The daily image source is unavailable. Other source reports are listed below.':truncatePlainText(apod?.explanation,360)}</p><p>{journal.news.length} published bulletins and {journal.observations.length} Earth events are available in this snapshot.</p><Link className={s.textLink} href="/day">Read the image story</Link></div>
    </section>
    <p className={s.caption}>Page generated {observationDate(generatedAt)}. This records page generation, not a successful NASA update. Source dates appear with each item.</p>
    <section aria-labelledby="observation-feed"><div className={s.sectionHeading}><div><h2 id="observation-feed">Published reports</h2><p>Newest source publication first. Unknown dates remain unknown.</p></div></div>{journal.news.length?renderEntries(journal.news):<EmptyState title="No published reports available"><p>The source is unavailable or returned no bulletins.</p></EmptyState>}</section>
    <section aria-labelledby="earth-log"><div className={s.sectionHeading}><h2 id="earth-log">Earth observations</h2><div className={s.actions}><Link className={s.textLink} href="/eonet">Explore event locations</Link><Link className={s.textLink} href="/epic">Earth from deep space / EPIC sequence</Link></div></div>{renderEntries(journal.observations)}<p className={s.caption}>Event dates refer to the selected latest reported geometry.</p>{latestEpic&&<p className={s.caption}>{latestEpic.identifier==='local-epic-fallback'?'EPIC unavailable; the Earth chapter uses an illustrative fallback.':'Latest available EPIC frame: '+observationDate(latestEpic.date)+'. Archived observation sequence.'} <Link className={s.textLink} href="/epic">View Earth frames</Link></p>}</section>
    <section aria-labelledby="upcoming-log"><div className={s.sectionHeading}><h2 id="upcoming-log">Today & upcoming encounters</h2></div><p className={s.caption}>Encounter dates, not publication dates. The existing feed covers a limited date window; this is not a complete future calendar.</p>{journal.upcoming.length?renderEntries(journal.upcoming):<p className={s.caption}>No upcoming encounters in the available feed.</p>}{journal.past.length>0&&<details className={s.record}><summary>Earlier encounters and undated entries</summary>{renderEntries(journal.past)}</details>}</section>
    <section aria-labelledby="archive-destinations"><div className={s.sectionHeading}><h2 id="archive-destinations">Continue observing</h2></div><div className={s.archiveGrid}>{PREVIEW_SECTIONS.map(section=><PreviewCard key={section.key} section={section} content={previewContentBySection[section.key]||null} query={section.key==='images'?imageKeyword:section.key==='videos'?videoKeyword:undefined}/>)}</div></section>
    <section aria-labelledby="technology-title"><div className={s.sectionHeading}><div><h2 id="technology-title">Exploration, brought to Earth</h2><p>Research, inventions and software developed through NASA&apos;s work.</p></div><Link href={ROUTES.techport} className={s.textLink}>Technology projects</Link></div><RubricCard title="NASA patents & software" description="Discover technologies available for licensing and software for further exploration." href={ROUTES.techtransfer} items={techTransferRubricItems} /></section>
    <div className={s.actions}><Link href="/publics" className={s.textLink}>About these sources</Link></div>
  </Chapter>;
}
