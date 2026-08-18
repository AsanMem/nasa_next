import Link from "next/link";
import { ROUTES } from "@/app/lib/constants/routes";
import { fetchOngoingEonetEvents } from "@/app/lib/nasa/eonet";

import { CARD_CLASS } from "@/app/ui/eonet/constants";
import EonetEventCard from "../ui/eonet/eonet-event-card";

export const metadata = {
  title: "NASA EONET Events",
  description: "Stay updated with ongoing natural events tracked by NASA’s EONET service.",
};

export const revalidate = 43200;

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
            events.map((event) => <EonetEventCard key={event.id} event={event} />)
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
