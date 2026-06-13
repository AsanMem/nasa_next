import Link from "next/link";
import { ROUTES } from "@/app/lib/constants/routes";
import { fetchDonkiNotifications } from "@/app/lib/nasa/donki";
import { fetchOngoingEonetEvents } from "@/app/lib/nasa/eonet";
import { fetchTodayNeoFeed } from "@/app/lib/nasa/neows";
import { fetchApod } from "@/app/lib/nasa/apod";
import { fetchNasaImages, fetchNasaVideos } from "@/app/lib/nasa/media";
import { fetchEpicImages } from "@/app/lib/nasa/epic";
import { fetchTechportProjects } from "@/app/lib/nasa/techport";
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

import { BUTTON_CLASS, PREVIEW_SECTIONS, PreviewContent } from "../ui/library/constants";
import { RubricCard, RubricCardItem } from "../ui/library/rubric-сard";
import { buildNewsFeed, formatNasaSummaryText, getApodPreview, getDailyKeyword, getEpicPreview, getFirstAssetPreview, getNeoPreview, mapTechTransferItemToRubricItem } from "../ui/library/helpers";
import { PreviewCard } from "../ui/library/preview-card";
import { CATEGORY_ICON_MAP } from "../ui/eonet/constants";
import { LocationBadge } from "../ui/eonet/location-badge";

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
    fetchApod(),
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
  const apod: ApodItem | null = apodResult.status === "fulfilled" ? apodResult.value : null;
  const images = imagesResult.status === "fulfilled" ? imagesResult.value : [];
  const videos = videosResult.status === "fulfilled" ? videosResult.value : [];

  const epic: EpicImage[] = epicResult.status === "fulfilled" ? epicResult.value : [];
  //  const techport: TechportProjectSummary[] = techportResult.status === "fulfilled" ? techportResult.value : [];
  const patents: TechTransferItem[] =
    patentsResult.status === "fulfilled" ? patentsResult.value : [];
  const software: TechTransferItem[] =
    softwareResult.status === "fulfilled" ? softwareResult.value : [];

  const newsFeed = await buildNewsFeed(liveDonki, eonet, neos);


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

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-black to-slate-950 text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-16 px-6 py-16">
        <header className="flex flex-col gap-4">
          <p className="text-sm uppercase tracking-[0.6em] text-white/50">NASA Library</p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Your personal doorway into NASA’s universe
          </h1>
          <p className="text-readable max-w-3xl text-base text-white/70 sm:text-lg">
            Explore mission stories, Earth’s moments, and discoveries—simple, clear, and inspiring.
          </p>
        </header>



        <section className="flex flex-col gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">Explore</p>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Your favorite corners of the cosmos
            </h2>
            <p className="text-readable mt-2 text-sm text-white/60">
              Quick previews of the sections you explore most—everything right where you need it.
            </p>
          </div>
          <div className="grid items-stretch gap-6 md:grid-cols-2 xl:grid-cols-3">
            {PREVIEW_SECTIONS.map((section) => {
              let query: string | undefined;

              if (section.key === "images") {
                query = imageKeyword;
              } else if (section.key === "videos") {
                query = videoKeyword;
              }

              return (
                <PreviewCard
                  key={section.key}
                  section={section}
                  content={previewContentBySection[section.key] ?? null}
                  query={query}
                />
              );
            })}
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">Deep Dives</p>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Fresh NASA topics waiting for your curiosity
            </h2>
            <p className="text-readable mt-2 text-sm text-white/60">
              Dive into new ideas, discoveries, and stories shaping tomorrow.
            </p>
          </div>

          <div className="grid gap-6">

            <RubricCard
              title="TechTransfer Patents & Software"
              description="Flight heritage tools and innovations available for industry adoption."
              href={ROUTES.techtransfer}
              items={techTransferRubricItems}
            />

          </div>


          <div className="grid gap-6 md:grid-cols-2">
            {/* <RubricCard
              title="Techport Projects"
              description="NASA’s technology portfolio, from early concepts to flight-ready initiatives."
              href={ROUTES.techport}
              items={techport.map((project: TechportProjectSummary) => ({
                title: project.title ?? `Project ${project.projectId}`,
                detail: project.formattedLastUpdated
                  ? `Last updated ${project.formattedLastUpdated}`
                  : undefined,
                meta: project.projectId,
              }))}
            /> */}
            {/* <RubricCard
              title="EONET Earth Events"
              description="Live geophysical events from NASA and international partners."
              href={ROUTES.eonet}
              items={eonet.map((event) => ({
                title: event.title ?? "Earth event",
                detail: event.categories?.map((c) => c.title).join(", "),
                meta: event.formattedDate,
              }))}
            /> */}
          </div>

        </section>

        <section className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/50">Live Feed</p>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Space weather & planetary alerts
              </h2>
            </div>
            <Link href={ROUTES.spaceWeather} className={BUTTON_CLASS}>
              Space Weather Hub
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {newsFeed.length > 0 ? (
              newsFeed.map((item) => {
                const isEonet = item.source === "EONET";
                const eonetCategory = isEonet ? item.category : undefined;
                const eonetLocation = isEonet ? item.location : undefined;
                const eonetIcon = eonetCategory ? CATEGORY_ICON_MAP[eonetCategory] : undefined;

                return (
                  <div
                    key={item.id}
                    className="flex flex-col gap-3 rounded-3xl bg-white/5 p-5 ring-1 ring-white/10 backdrop-blur"
                  >
                    <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.4em]">
                      <span className="text-white/60">{item.type}</span>
                      <span className="text-white/40">{item.source}</span>
                    </div>

                    <div className="flex min-h-[4.5rem] items-start gap-3">
                      {eonetIcon ? (
                        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/10">
                          <img
                            src={eonetIcon}
                            alt={eonetCategory ?? "Earth event"}
                            className="h-6 w-6 opacity-80"
                          />
                        </span>
                      ) : null}
                      <h3
                        className="text-lg font-semibold tracking-tight text-white"
                        title={item.title}
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {item.title}
                      </h3>
                    </div>

                    {item.imageUrls && item.imageUrls.length > 0 && (
                      <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
                        {item.imageUrls.slice(0, 2).map((url) => (
                          <div
                            key={url}
                            className="relative h-24 w-32 flex-shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/5"
                          >
                            <img
                              src={url}
                              alt={item.title}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    {item.summary ? <p className="text-readable text-sm text-white/70">{item.summary}</p> : null}
                    {eonetLocation ? <LocationBadge location={eonetLocation} /> : null}
                    <div className="text-readable mt-auto flex items-center justify-between text-xs text-white/40">
                      <span>{item.timestamp ?? "Recent"}</span>
                      <span>
                        {item.source === "DONKI" && "Space Weather"}
                        {item.source === "EONET" && "Earth Watch"}
                        {item.source === "NeoWS" && "Asteroids"}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-readable rounded-3xl bg-white/5 p-6 text-sm text-white/60 ring-1 ring-white/10">
                Space weather feed is cooling off right now. Revisit in a few moments.
              </div>
            )}
          </div>

          <RubricCard
            title="Space Weather Monitor"
            description="DONKI notifications curated for quick situational awareness."
            href={ROUTES.spaceWeather}
            items={liveDonki.map((item) => ({
              title: item.messageTitle ?? item.messageType ?? "Space weather alert",
              detail: formatNasaSummaryText(item.messageBody, 120),
              meta: item.formattedTime,
            }))}
          />
        </section>
      </div>
    </div>
  );
}
