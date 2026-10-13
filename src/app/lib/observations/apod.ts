import type { ApodItem } from "../nasa/apod";

/** An upstream site logo is not the astronomical exhibit described by APOD. */
export function apodExhibit(item: ApodItem | null): ApodItem | null {
  if (!item || !/\/[^/]*nasa[-_]logo[^/]*\.(?:png|svg|webp)/i.test(item.url || "")) return item;
  return {
    title: "Astronomy Picture of the Day",
    media_type: "image",
    url: "/media/main/1.optimized.webp",
    explanation: "The source returned a site logo instead of the daily astronomical image. An illustrative local image is shown while the source is unavailable.",
  };
}
