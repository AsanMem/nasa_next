import Image from "next/image";
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
import type { TechportProjectSummary } from "@/app/lib/nasa/techport";
import type { TechTransferItem } from "@/app/lib/nasa/techtransfer";

type NewsItem =
  | {
      id: string;
      type: "Space Weather";
      source: "DONKI";
      title: string;
      summary?: string;
      timestamp?: string;
    }
  | {
      id: string;
      type: "Earth Events";
      source: "EONET";
      title: string;
      summary?: string;
      timestamp?: string;
    }
  | {
      id: string;
      type: "Hazardous NEO";
      source: "NeoWS";
      title: string;
      summary?: string;
      timestamp?: string;
    };

const PREVIEW_SECTIONS: Array<{
  key: keyof typeof ROUTES;
  title: string;
  description: string;
  href: string;
}> = [
  {
    key: "apod",
    title: "Astronomy Picture of the Day",
    description: "Daily highlights from the cosmos with NASA’s featured imagery.",
    href: ROUTES.apod,
  },
  {
    key: "images",
    title: "NASA Images",
    description: "Curated imagery spanning missions, nebulae, launches, and Earth.",
    href: ROUTES.images,
  },
  {
    key: "videos",
    title: "NASA Videos",
    description: "Mission briefings, launches, and archival footage in motion.",
    href: ROUTES.videos,
  },
  {
    key: "epic",
    title: "EPIC Earth",
    description: "Daily views of Earth captured by the DSCOVR spacecraft.",
    href: ROUTES.epic,
  },
  {
    key: "neos",
    title: "Hazardous NEOs",
    description: "Track near-Earth objects and their approach to our planet.",
    href: ROUTES.neos,
  },
];

const SECTION_CARD_CLASS =
  "flex flex-col gap-4 rounded-3xl bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur-lg transition hover:bg-white/10 hover:ring-white/20";

const BUTTON_CLASS =
  "inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:border-white/40 hover:bg-white/20";

async function buildNewsFeed(
  donki: DonkiNotificationItem[],
  eonet: EonetEvent[],
  neos: NeoFeedItem[],
): Promise<NewsItem[]> {
  const donkiItems: NewsItem[] = donki.map((item, index) => ({
    id: item.messageID ?? `donki-${index}`,
    type: "Space Weather",
    source: "DONKI",
    title: item.messageTitle ?? item.messageType ?? "Space weather alert",
    summary: item.messageBody?.slice(0, 200),
    timestamp: item.formattedTime,
  }));

  const eonetItems: NewsItem[] = eonet.map((event) => ({
    id: event.id,
    type: "Earth Events",
    source: "EONET",
    title: event.title ?? "Earth observation update",
    summary: event.categories?.map((category) => category.title).join(", "),
    timestamp: event.formattedDate,
  }));

  const neoItems: NewsItem[] = neos.map((neo) => ({
    id: neo.id,
    type: "Hazardous NEO",
    source: "NeoWS",
    title: neo.name,
    summary: neo.velocityKmPerSec
      ? `Velocity ${parseFloat(neo.velocityKmPerSec).toFixed(2)} km/s · Miss ${neo.missDistanceKm?.split(".")[0]} km`
      : neo.missDistanceKm
        ? `Miss distance ${neo.missDistanceKm.split(".")[0]} km`
        : undefined,
    timestamp: neo.closeApproachTime,
  }));

  return [...donkiItems, ...eonetItems, ...neoItems].slice(0, 9);
}

type PreviewContent = {
  media?: {
    url: string;
    alt: string;
  };
  title: string;
  description?: string;
  metadata?: string;
};

function getApodPreview(apod: ApodItem | null): PreviewContent | null {
  if (!apod) {
    return null;
  }

  const mediaUrl = apod.media_type === "image" ? apod.url : apod.thumbnail_url ?? apod.url;

  return {
    media: mediaUrl
      ? {
          url: mediaUrl,
          alt: apod.title ?? "Astronomy Picture of the Day",
        }
      : undefined,
    title: apod.title ?? "Astronomy Picture of the Day",
    description: apod.explanation?.slice(0, 140),
  };
}

function getFirstAssetPreview(
  items: Awaited<ReturnType<typeof fetchNasaImages>> | Awaited<ReturnType<typeof fetchNasaVideos>>,
  fallbackTitle: string,
): PreviewContent | null {
  if (!items || items.length === 0) {
    return null;
  }
  const item = items[0];
  const data = item.data?.[0];
  const link = item.links?.find((lnk) => lnk.render === "image") ?? item.links?.[0];

  return {
    media: link?.href
      ? {
          url: link.href,
          alt: data?.title ?? fallbackTitle,
        }
      : undefined,
    title: data?.title ?? fallbackTitle,
    description: data?.description?.slice(0, 140),
    metadata: data?.date_created,
  };
}

function getEpicPreview(images: EpicImage[]): PreviewContent | null {
  if (!images || images.length === 0) {
    return null;
  }
  const image = images[0];
  return {
    media: image.imageUrl
      ? {
          url: image.imageUrl,
          alt: image.caption ?? "EPIC Earth image",
        }
      : undefined,
    title: image.caption ?? "EPIC Earth capture",
    description: image.identifier,
    metadata: image.date,
  };
}

function getNeoPreview(neos: NeoFeedItem[]): PreviewContent | null {
  if (!neos || neos.length === 0) {
    return null;
  }
  const neo = neos[0];
  return {
    title: neo.name,
    description: neo.summary,
    metadata: neo.closeApproachTime,
  };
}

function renderMedia(media?: PreviewContent["media"]) {
  if (!media) {
    return (
      <div className="flex h-40 items-center justify-center rounded-2xl bg-white/5 text-sm text-white/40">
        Preview unavailable
      </div>
    );
  }

  return (
    <div className="relative h-40 w-full overflow-hidden rounded-2xl bg-white/5">
      <Image
        src={media.url}
        alt={media.alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        className="object-cover"
        unoptimized
        priority={false}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
    </div>
  );
}

function PreviewCard({
  section,
  content,
}: {
  section: (typeof PREVIEW_SECTIONS)[number];
  content: PreviewContent | null;
}) {
  return (
    <div className={SECTION_CARD_CLASS}>
      {renderMedia(content?.media)}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.4em] text-white/50">
          <span>{section.title}</span>
          <span>Featured</span>
        </div>
        <h3 className="text-xl font-semibold tracking-tight">{content?.title ?? section.title}</h3>
        <p className="text-sm text-white/70">
          {content?.description ?? section.description}
        </p>
        {content?.metadata ? (
          <p className="text-xs uppercase tracking-[0.4em] text-white/40">
            {content.metadata}
          </p>
        ) : null}
        <Link href={section.href} className={BUTTON_CLASS}>
          Open
        </Link>
      </div>
    </div>
  );
}

type RubricCardProps = {
  title: string;
  description: string;
  href: string;
  items: Array<{
    title: string;
    detail?: string;
    meta?: string;
  }>;
};

function RubricCard({ title, description, href, items }: RubricCardProps) {
  return (
    <div className={SECTION_CARD_CLASS}>
      <div className="flex flex-col gap-3">
        <p className="text-xs uppercase tracking-[0.4em] text-white/50">New Section</p>
        <h3 className="text-2xl font-semibold tracking-tight">{title}</h3>
        <p className="text-sm text-white/70">{description}</p>
      </div>
      <ul className="mt-4 flex flex-col gap-4 text-sm text-white/80">
        {items.length > 0 ? (
          items.slice(0, 4).map((item) => (
            <li key={item.title} className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
              <p className="font-semibold text-white">{item.title}</p>
              {item.detail ? <p className="mt-2 text-white/70">{item.detail}</p> : null}
              {item.meta ? (
                <p className="mt-2 text-xs uppercase tracking-[0.4em] text-white/40">
                  {item.meta}
                </p>
              ) : null}
            </li>
          ))
        ) : (
          <li className="rounded-2xl bg-white/5 p-4 text-white/50 ring-1 ring-white/10">
            Data not available right now. Check the full section for more.
          </li>
        )}
      </ul>
      <div className="mt-auto pt-4">
        <Link href={href} className={BUTTON_CLASS}>
          Open
        </Link>
      </div>
    </div>
  );
}

export default async function LibraryPage() {
  const [
    donki,
    eonet,
    neos,
    apod,
    images,
    videos,
    epic,
    techport,
    patents,
    software,
  ] = await Promise.all([
    fetchDonkiNotifications(),
    fetchOngoingEonetEvents(6),
    fetchTodayNeoFeed(),
    fetchApod(),
    fetchNasaImages("cosmos showcase", 6),
    fetchNasaVideos("nasa mission", 6),
    fetchEpicImages(6),
    fetchTechportProjects(6),
    fetchTechTransferPatents(6),
    fetchTechTransferSoftware(6),
  ]);

  const newsFeed = await buildNewsFeed(donki, eonet, neos);

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
            Your curated gateway to NASA’s data universe
          </h1>
          <p className="max-w-3xl text-base text-white/70 sm:text-lg">
            Browse mission updates, Earth observation alerts, and technology breakthroughs—all
            collected server-side with gentle caching so you can explore without disruption.
          </p>
        </header>

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
              newsFeed.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 rounded-3xl bg-white/5 p-5 ring-1 ring-white/10 backdrop-blur"
                >
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.4em]">
                    <span className="text-white/60">{item.type}</span>
                    <span className="text-white/40">{item.source}</span>
                  </div>
                  <h3 className="text-lg font-semibold tracking-tight text-white">{item.title}</h3>
                  {item.summary ? <p className="text-sm text-white/70">{item.summary}</p> : null}
                  <div className="mt-auto flex items-center justify-between text-xs uppercase tracking-[0.4em] text-white/40">
                    <span>{item.timestamp ?? "Recent"}</span>
                    <span>
                      {item.source === "DONKI" && "Space Weather"}
                      {item.source === "EONET" && "Earth Watch"}
                      {item.source === "NeoWS" && "Asteroids"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-3xl bg-white/5 p-6 text-sm text-white/60 ring-1 ring-white/10">
                Space weather feed is cooling off right now. Revisit in a few moments.
              </div>
            )}
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">Explore</p>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Featured destinations from your library
            </h2>
            <p className="mt-2 text-sm text-white/60">
              Quick snapshots from the sections you already unlocked. Server-rendered previews keep
              things snappy without CORS surprises.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {PREVIEW_SECTIONS.map((section) => (
              <PreviewCard
                key={section.key}
                section={section}
                content={previewContentBySection[section.key] ?? null}
              />
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">Deep Dives</p>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              New NASA rubrics, ready to explore
            </h2>
            <p className="mt-2 text-sm text-white/60">
              Technology programs, transfer-ready patents, and real-time alerts—each section cached
              individually with ISR so fresh intel is only ever a revalidate away.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <RubricCard
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
            />
            <RubricCard
              title="Space Weather Monitor"
              description="DONKI notifications curated for quick situational awareness."
              href={ROUTES.spaceWeather}
              items={donki.map((item) => ({
                title: item.messageTitle ?? item.messageType ?? "Space weather alert",
                detail: item.messageBody?.slice(0, 120),
                meta: item.formattedTime,
              }))}
            />
            <RubricCard
              title="TechTransfer Patents & Software"
              description="Flight heritage tools and innovations available for industry adoption."
              href={ROUTES.techtransfer}
              items={[
                ...patents.slice(0, 2),
                ...software.slice(0, 2),
              ].map((item: TechTransferItem) => ({
                title: item.title ?? "TechTransfer asset",
                detail: item.description ?? item.application ?? undefined,
                meta: item.center ?? item.releaseDateFormatted ?? undefined,
              }))}
            />
            <RubricCard
              title="EONET Earth Events"
              description="Live geophysical events from NASA and international partners."
              href={ROUTES.eonet}
              items={eonet.map((event) => ({
                title: event.title ?? "Earth event",
                detail: event.categories?.map((c) => c.title).join(", "),
                meta: event.formattedDate,
              }))}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

