"use client";

import type { EonetEvent } from "@/app/lib/nasa/eonet";
import { CARD_CLASS } from "./constants";
import { EventVisual } from "./event-visual";

type Props = {
  event: EonetEvent;
};

export default function EonetEventCard({ event }: Props) {
  const coordinates = event.geometry?.[0]?.coordinates;
  const mainCategory = event.categories?.[0]?.title;
  const mapsUrl = coordinates && coordinates.length >= 2
    ? `https://www.google.com/maps?q=${encodeURIComponent(`${coordinates[1]},${coordinates[0]}`)}`
    : undefined;
  const sourceUrl = event.sources?.find((source) => {
    try {
      return Boolean(source.url) && new URL(source.url).protocol === "https:";
    } catch {
      return false;
    }
  })?.url;

  return (
    <article className={CARD_CLASS}>
      <div className="flex gap-4">
        <div className="flex flex-1 flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.4em] text-white/40">Event</p>

          <h2 className="text-lg font-semibold leading-snug">
            {event.title}
          </h2>

          {event.formattedDate && (
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">
              Observed {event.formattedDate}
            </p>
          )}

          {event.categories?.length ? (
            <ul className="mt-2 flex flex-wrap gap-2 text-xs uppercase tracking-[0.3em] text-white/50">
              {event.categories.map((category) => (
                <li
                  key={`${event.id}-${category.id}`}
                  className="rounded-full bg-white/10 px-3 py-1"
                >
                  {category.title}
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <EventVisual category={mainCategory} compact />
      </div>

      <div className="mt-4 flex flex-col gap-2 text-sm text-white/70">
        {coordinates && (
          <p>
            Coordinates:{" "}
            {coordinates
              .map((v) => (typeof v === "number" ? v.toFixed(2) : v))
              .join(", ")}
          </p>
        )}

        {event.sources?.length ? (
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">
            Sources: {event.sources.map((s) => s.id).join(", ")}
          </p>
        ) : null}
      </div>

      {mapsUrl ? (
        <a
          href={mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex w-fit rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:border-white/40 hover:bg-white/20"
        >
          Open in Maps
        </a>
      ) : null}

      {sourceUrl ? (
        <a
          href={sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex w-fit rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:border-white/40 hover:bg-white/20"
        >
          View source report
        </a>
      ) : event.link ? (
        <a
          href={event.link}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex w-fit rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:border-white/40 hover:bg-white/20"
        >
          NASA API record
        </a>
      ) : null}
    </article>

  );
}
