import { DonkiNotificationItem } from "@/app/lib/nasa/donki";
import { NasaItem, NewsItem, PreviewContent, SPACE_KEYWORDS } from "./constants";
import { EonetEvent } from "@/app/lib/nasa/eonet";
import { NeoFeedItem } from "@/app/lib/nasa/neows";
import { ApodItem } from "@/app/lib/nasa/apod";
import { fetchNasaImages, fetchNasaVideos } from "@/app/lib/nasa/media";
import { EpicImage } from "@/app/lib/nasa/epic";
import { TechTransferItem } from "@/app/lib/nasa/techtransfer";
import { RubricCardItem } from "./rubric-сard";
import { sanitizePlainText, truncatePlainText } from "@/app/lib/utils/text";

export async function buildNewsFeed(
  donki: DonkiNotificationItem[],
  eonet: EonetEvent[],
  neos: NeoFeedItem[],
): Promise<NewsItem[]> {



  const donkiItems: NewsItem[] = donki.map((item, index) => {
    const imageUrls = extractImageUrlsFromText(item.messageBody);
    return {
      id: item.messageID ?? `donki-${index}`,
      type: "Space Weather",
      source: "DONKI",
      title: sanitizePlainText(item.messageTitle) ?? item.messageType ?? "Space weather alert",
      summary: truncatePlainText(item.messageBody, 200),
      timestamp: item.formattedTime,
      imageUrls,
    };
  });

  const eonetItems: NewsItem[] = eonet.map((event) => ({
    id: event.id,
    type: "Earth Events",
    source: "EONET",
    title: sanitizePlainText(event.title) ?? "Earth observation update",
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



export function getApodPreview(apod: ApodItem | null): PreviewContent | null {
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
    title: sanitizePlainText(apod.title) ?? "Astronomy Picture of the Day",
    description: truncatePlainText(apod.explanation, 140),
  };
}




export function getFirstAssetPreview(
  items:
    | Awaited<ReturnType<typeof fetchNasaImages>>
    | Awaited<ReturnType<typeof fetchNasaVideos>>,
  fallbackTitle: string,
): PreviewContent | null {
  if (!items) return null;


  const list: any[] = Array.isArray(items)
    ? items
    :
    (items as any).items ??
    (items as any).collection?.items ??
    [];

  if (!list || list.length === 0) {
    return null;
  }


  const firstWithImage =
    list.find((asset) => {
      const links = asset.links ?? asset.data?.[0]?.links;
      const lnk =
        links?.find((lnk: any) => lnk.render === "image") ??
        links?.[0];
      return !!lnk?.href;
    }) ?? list[0];

  const data = firstWithImage.data?.[0];
  const links = firstWithImage.links ?? data?.links;
  const mainLink =
    links?.find((lnk: any) => lnk.render === "image") ??
    links?.[0];

  const gallery =
    list
      .slice(0, 8)
      .map((asset) => {
        const d = asset.data?.[0];
        const lnk =
          (asset.links ??
            d?.links)?.find((lnk: any) => lnk.render === "image") ??
          (asset.links ?? d?.links)?.[0];

        if (!lnk?.href) return null;

        return {
          url: lnk.href,
          alt: d?.title ?? fallbackTitle,
        };
      })
      .filter(Boolean) || [];


  if (!mainLink?.href && gallery.length === 0) {
    return {
      title: data?.title ?? fallbackTitle,
      description: truncatePlainText(data?.description, 140),
      metadata: data?.date_created,
    };
  }

  return {
    media: mainLink?.href
      ? {
        url: mainLink.href,
        alt: data?.title ?? fallbackTitle,
      }
      : undefined,
    gallery: gallery.length
      ? (gallery as { url: string; alt: string }[])
      : undefined,
    title: sanitizePlainText(data?.title) ?? fallbackTitle,
    description: truncatePlainText(data?.description, 140),
    metadata: data?.date_created,
  };
}


export function getEpicPreview(images: EpicImage[]): PreviewContent | null {
  if (!images || images.length === 0) {
    return null;
  }


  const slides = images
    .filter((img) => img.imageUrl)
    .slice(0, 3)
    .map((img) => ({
      url: img.imageUrl as string,
      alt: img.caption ?? "EPIC Earth image",
    }));

  const first = images[0];

  return {
    media: slides[0] ?? (first.imageUrl
      ? {
        url: first.imageUrl,
        alt: first.caption ?? "EPIC Earth image",
      }
      : undefined),
    slideshow: slides.length ? slides : undefined,
    title: sanitizePlainText(first.caption) ?? "EPIC Earth capture",
    description: sanitizePlainText(first.identifier),
    metadata: first.date,
  };
}

export function getNeoPreview(neos: NeoFeedItem[]): PreviewContent | null {
  if (!neos || neos.length === 0) return null;

  const neo = neos[0];


  const fallbackHazard = "/media/main/1.png.optimized.webp";
  const fallbackNormal = "/media/fallback/neo.jpg";

  const mediaUrl = neo.hazard ? fallbackHazard : fallbackNormal;

  return {
    media: {
      url: mediaUrl,
      alt: neo.hazard ? "Potentially hazardous asteroid" : "Near-Earth object",
    },
    title: sanitizePlainText(neo.name) ?? "Near-Earth object",
    description: sanitizePlainText(neo.summary),
    metadata: neo.closeApproachTime,
  };
}



export function mapNasaItemToRubricItem(nasa: NasaItem): RubricCardItem {
  const imageUrl =
    nasa.imageUrl || extractImageUrlFromRaw(nasa.raw) || undefined;

  return {

    title: sanitizePlainText(nasa.application) ?? "NASA asset",
    detail: sanitizePlainText(nasa.center),
    meta: `${nasa.reference} • ${nasa.patentNumber}`,
    imageUrl,
  };
}

export function mapTechTransferItemToRubricItem(item: TechTransferItem): RubricCardItem {
  const imageUrl =
    item.imageUrl || (Array.isArray(item.raw) ? extractImageUrlFromRaw(item.raw) : undefined);

  return {
    title:
      sanitizePlainText(item.application) ||
      sanitizePlainText(item.description) ||
      "TechTransfer asset",
      detail: sanitizePlainText(item.center),
      meta: [item.reference, item.patentNumber].filter(Boolean).join(" • ") ||
      item.releaseDateFormatted,
    imageUrl,
  };
}

export function extractImageUrlsFromText(text?: string): string[] {
  if (!text) return [];
  const regex = /(https?:\/\/[^\s'"]+\.(?:png|jpe?g|gif|webp))/gi;
  const matches = text.match(regex);
  if (!matches) return [];
  return Array.from(new Set(matches));
}

export function extractImageUrlFromRaw(raw: Array<string | null>): string | undefined {
  const text = raw.join(" ");
  const match = text.match(
    /(https?:\/\/[^\s'"]+\.(?:png|jpe?g|gif|webp))/i
  );
  return match ? match[0] : undefined;
}



export function getDailyKeyword(offset: number = 0): string {
  const now = new Date();

  const dayIndex = Math.floor(now.getTime() / (1000 * 60 * 60 * 24));

  const index = (dayIndex + offset) % SPACE_KEYWORDS.length;

  return SPACE_KEYWORDS[(index + SPACE_KEYWORDS.length) % SPACE_KEYWORDS.length];
}
