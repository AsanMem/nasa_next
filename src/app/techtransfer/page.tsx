import Link from "next/link";
import { ROUTES } from "@/app/lib/constants/routes";
import {
  fetchTechTransferPatents,
  fetchTechTransferSoftware,
} from "@/app/lib/nasa/techtransfer";

const SECTION_CLASS =
  "flex flex-col gap-4 rounded-3xl bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur hover:bg-white/10 hover:ring-white/20 transition";

export const metadata = {
  title: "NASA TechTransfer",
  description: "Browse NASA’s TechTransfer patents and software ready for adoption.",
};

export const revalidate = 86400;

function AssetList({
  items,
  emptyLabel,
}: {
  items: Awaited<ReturnType<typeof fetchTechTransferPatents>>;
  emptyLabel: string;
}) {
  if (!items || items.length === 0) {
    return (
      <p className="rounded-2xl bg-white/5 p-4 text-sm text-white/60 ring-1 ring-white/10">
        {emptyLabel}
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {items.map((item, index) => {
        const centerIsLong = Boolean(item.center && item.center.length > 80);

        return (
          <li
            key={`${item.reference ?? item.patentNumber ?? item.title ?? index}-${index}`}
            className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10"
          >
            <p className="font-semibold text-white">{item.title ?? "Untitled asset"}</p>
            {item.description ? (
              <p className="text-readable mt-2 text-sm leading-relaxed text-white/70">
                {item.description.length > 240
                  ? `${item.description.slice(0, 240)}…`
                  : item.description}
              </p>
            ) : null}
            {centerIsLong ? (
              <p className="text-readable mt-3 text-sm leading-relaxed text-white/70">
                {item.center}
              </p>
            ) : null}
            <div className="mt-3 flex flex-wrap gap-4 text-xs uppercase tracking-[0.4em] text-white/40">
              {item.center && !centerIsLong ? <span>{item.center}</span> : null}
              {item.releaseDateFormatted ? <span>Released {item.releaseDateFormatted}</span> : null}
              {item.patentNumber ? <span>#{item.patentNumber}</span> : null}
            </div>
            {item.url ? (
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:border-white/40 hover:bg-white/20"
              >
                View on nasa.gov
              </a>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

export default async function TechTransferPage() {
  const [patents, software] = await Promise.all([
    fetchTechTransferPatents(12),
    fetchTechTransferSoftware(12),
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-black to-slate-950 text-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-12 px-6 py-16">
        <header className="flex flex-col gap-4">
          <p className="text-sm uppercase tracking-[0.6em] text-white/50">TechTransfer</p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            NASA patents & software ready for collaboration
          </h1>
          <p className="text-readable max-w-3xl text-base leading-relaxed text-white/70 sm:text-lg">
            Access innovations cleared for industry adoption, fetched server-side and cached daily to
            give you a reliable snapshot of NASA’s transfer pipeline.
          </p>
          <Link
            href={ROUTES.library}
            className="inline-flex items-center justify-center self-start rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:border-white/40 hover:bg-white/20"
          >
            Back to Library
          </Link>
        </header>

        <section className="grid gap-8 lg:grid-cols-2">
          <div className={SECTION_CLASS}>
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/50">Patents</p>
              <h2 className="text-2xl font-semibold tracking-tight">Technology transfer patents</h2>
              <p className="text-readable mt-2 text-sm leading-relaxed text-white/60">
                Filtered daily. Perfect for scouting NASA-developed solutions ready for licensing.
              </p>
            </div>
            <AssetList items={patents} emptyLabel="Patents are not available at the moment." />
          </div>

          <div className={SECTION_CLASS}>
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/50">Software</p>
              <h2 className="text-2xl font-semibold tracking-tight">Open NASA software</h2>
              <p className="text-readable mt-2 text-sm leading-relaxed text-white/60">
                Server-rendered catalogue of reusable NASA-developed software packages.
              </p>
            </div>
            <AssetList items={software} emptyLabel="Software listings are paused right now." />
          </div>
        </section>
      </div>
    </div>
  );
}
