import Link from "next/link";
import { ROUTES } from "@/app/lib/constants/routes";
import { fetchDonkiNotifications } from "@/app/lib/nasa/donki";

const CARD_CLASS =
  "rounded-3xl bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur hover:bg-white/10 hover:ring-white/20 transition";

export const metadata = {
  title: "NASA Space Weather (DONKI)",
  description: "Live DONKI notifications rendered server-side and cached every 30 minutes.",
};

export default async function SpaceWeatherPage() {
  const notifications = await fetchDonkiNotifications({ limit: 20 });

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-black to-slate-950 text-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-16">
        <header className="flex flex-col gap-4">
          <p className="text-sm uppercase tracking-[0.6em] text-white/50">Space Weather</p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Space weather alerts from NASA DONKI
          </h1>
          <p className="max-w-3xl text-base text-white/70 sm:text-lg">
            These notifications are refreshed every 30 minutes using incremental static regeneration.
            Keep an eye on solar activity, geomagnetic storms, and more—without client-side fetching.
          </p>
          <Link
            href={ROUTES.library}
            className="inline-flex items-center justify-center self-start rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:border-white/40 hover:bg-white/20"
          >
            Back to Library
          </Link>
        </header>

        <section className="flex flex-col gap-6">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <article key={notification.messageID ?? notification.messageTitle} className={CARD_CLASS}>
                <div className="flex flex-col gap-2">
                  <p className="text-xs uppercase tracking-[0.4em] text-white/40">
                    {notification.messageType ?? "Notification"}
                  </p>
                  <h2 className="text-2xl font-semibold tracking-tight">
                    {notification.messageTitle ?? "Space weather alert"}
                  </h2>
                  {notification.formattedTime ? (
                    <p className="text-xs uppercase tracking-[0.4em] text-white/50">
                      Issued {notification.formattedTime}
                    </p>
                  ) : null}
                </div>
                <p className="mt-4 whitespace-pre-line text-sm text-white/70">
                  {notification.messageBody ?? "Details are not available for this notification."}
                </p>
                {notification.messageURL ? (
                  <a
                    href={notification.messageURL}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-6 inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:border-white/40 hover:bg-white/20"
                  >
                    View full bulletin
                  </a>
                ) : null}
              </article>
            ))
          ) : (
            <div className={CARD_CLASS}>
              <p className="text-sm text-white/60">
                Space weather notifications are currently unavailable. NASA’s DONKI service might be
                updating—try again shortly.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

