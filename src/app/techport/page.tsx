import Link from "next/link";
import { ROUTES } from "@/app/lib/constants/routes";
import { fetchTechportProjects } from "@/app/lib/nasa/techport";

const CARD_CLASS =
  "flex flex-col gap-4 rounded-3xl bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur hover:bg-white/10 hover:ring-white/20 transition";

export const metadata = {
  title: "NASA Techport Projects",
  description:
    "Explore NASA Techport projects, from early-stage concepts to mission-ready technology development.",
};

export default async function TechportPage() {
  const projects = await fetchTechportProjects(24);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-black to-slate-950 text-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-12 px-6 py-16">
        <header className="flex flex-col gap-4">
          <p className="text-sm uppercase tracking-[0.6em] text-white/50">Techport</p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            NASA technology portfolio
          </h1>
          <p className="text-readable max-w-3xl text-base leading-relaxed text-white/70 sm:text-lg">
            A curated feed of NASA’s latest technology initiatives. Each project is fetched
            server-side and cached for 24 hours to balance freshness with stability.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          {projects.length > 0 ? (
            projects.map((project) => (
              <article key={project.projectId} className={CARD_CLASS}>
                <div className="flex flex-col gap-2">
                  <p className="text-xs uppercase tracking-[0.4em] text-white/40">Project</p>
                  <h2 className="text-xl font-semibold tracking-tight">{project.title ?? `Project ${project.projectId}`}</h2>
                  {project.formattedLastUpdated ? (
                    <p className="text-xs uppercase tracking-[0.4em] text-white/40">
                      Updated {project.formattedLastUpdated}
                    </p>
                  ) : null}
                </div>
                <Link
                  href={`${ROUTES.techport}/${project.projectId}`}
                  className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:border-white/40 hover:bg-white/20"
                >
                  View project
                </Link>
              </article>
            ))
          ) : (
            <div className="text-readable rounded-3xl bg-white/5 p-6 text-sm leading-relaxed text-white/60 ring-1 ring-white/10 md:col-span-2">
              No Techport data is available right now. Try again later or open an individual project
              if you already know its identifier.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
