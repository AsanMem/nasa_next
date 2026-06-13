"use client";

import type { EonetEvent } from "@/app/lib/nasa/eonet";
import { resolveEonetLocation } from "@/app/lib/nasa/eonet-location";
import { CARD_CLASS } from "./constants";
import { EventVisual } from "./event-visual";
import { LocationPreview } from "./location-preview";

type Props = {
  event: EonetEvent;
};

export default function EonetEventCard({ event }: Props) {
  const location = resolveEonetLocation(event.geometry);
  const mainCategory = event.categories?.[0]?.title;

  return (
    <article className={`${CARD_CLASS} flex min-h-[430px] flex-col`}>
      <div className="flex min-h-[178px] gap-4">
        <div className="flex flex-1 flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.4em] text-white/40">Event</p>

          <h2
            className="min-h-[4.25rem] text-lg font-semibold leading-snug"
            title={event.title}
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {event.title}
          </h2>

          {event.formattedDate && (
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">
              Observed {event.formattedDate}
            </p>
          )}

          {event.categories?.length ? (
            <ul className="mt-auto flex max-h-16 flex-wrap gap-2 overflow-hidden text-xs uppercase tracking-[0.3em] text-white/50">
              {event.categories.slice(0, 3).map((category) => (
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

      {location ? <LocationPreview location={location} /> : null}

      <div className="text-readable mt-4 flex flex-col gap-2 text-sm text-white/70">
        {event.sources?.length ? (
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">
            Sources: {event.sources.map((s) => s.id).join(", ")}
          </p>
        ) : null}
      </div>

      {event.link && (
        <a
          href={event.link}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex w-fit rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:border-white/40 hover:bg-white/20"
        >
          View on eonet.gsfc.nasa.gov
        </a>
      )}
    </article>

  );
}
