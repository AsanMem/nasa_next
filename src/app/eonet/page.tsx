import Link from "next/link";
import { ROUTES } from "@/app/lib/constants/routes";
import { fetchOngoingEonetEvents } from "@/app/lib/nasa/eonet";

const CARD_CLASS =
  "rounded-3xl bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur hover:bg-white/10 hover:ring-white/20 transition";

export const metadata = {
  title: "NASA EONET Events",
  description: "Stay updated with ongoing natural events tracked by NASA’s EONET service.",
};

export default async function EonetPage() {
  const events = await fetchOngoingEonetEvents(24);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-black to-slate-950 text-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-12 px-6 py-16">
        <header className="flex flex-col gap-4">
          <p className="text-sm uppercase tracking-[0.6em] text-white/50">EONET</p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Ongoing natural events around Earth
          </h1>
          <p className="max-w-3xl text-base text-white/70 sm:text-lg">
            This feed highlights live geophysical phenomena captured by NASA and agency partners.
            Data is fetched server-side and revalidated every 30 minutes to keep the view current.
          </p>
          <Link
            href={ROUTES.library}
            className="inline-flex items-center justify-center self-start rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:border-white/40 hover:bg-white/20"
          >
            Back to Library
          </Link>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          {events.length > 0 ? (
            events.map((event) => (
              <article key={event.id} className={CARD_CLASS}>
                <div className="flex flex-col gap-2">
                  <p className="text-xs uppercase tracking-[0.4em] text-white/40">Event</p>
                  <h2 className="text-xl font-semibold tracking-tight">{event.title}</h2>
                  {event.formattedDate ? (
                    <p className="text-xs uppercase tracking-[0.4em] text-white/50">
                      Observed {event.formattedDate}
                    </p>
                  ) : null}
                </div>
                {event.categories && event.categories.length > 0 ? (
                  <ul className="mt-4 flex flex-wrap gap-2 text-xs uppercase tracking-[0.3em] text-white/50">
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
                <div className="mt-4 flex flex-col gap-3 text-sm text-white/70">
                  {event.geometry && event.geometry.length > 0 ? (
                    <p>
                      Coordinates:{" "}
                      {event.geometry[0].coordinates
                        ?.map((value) => (typeof value === "number" ? value.toFixed(2) : value))
                        .join(", ")}
                    </p>
                  ) : null}
                  {event.sources && event.sources.length > 0 ? (
                    <p className="text-xs uppercase tracking-[0.3em] text-white/40">
                      Sources: {event.sources.map((source) => source.id).join(", ")}
                    </p>
                  ) : null}
                </div>
                {event.link ? (
                  <a
                    href={event.link}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:border-white/40 hover:bg-white/20"
                  >
                    View on eonet.gsfc.nasa.gov
                  </a>
                ) : null}
              </article>
            ))
          ) : (
            <div className={CARD_CLASS}>
              <p className="text-sm text-white/60">
                EONET did not return any ongoing events for now. Check again later for new activity.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

