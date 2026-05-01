import Link from "next/link";
import { notFound } from "next/navigation";
import { ROUTES } from "@/app/lib/constants/routes";
import { fetchTechportProject } from "@/app/lib/nasa/techport";
import { sanitizePlainText } from "@/app/lib/utils/text";

type TechportProjectPageProps = {
  params: {
    id: string;
  };
};

const CARD_CLASS =
  "rounded-3xl bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur hover:bg-white/10 hover:ring-white/20 transition";

export async function generateMetadata({ params }: TechportProjectPageProps) {
  const project = await fetchTechportProject(params.id);
  if (!project) {
    return {
      title: "Techport Project",
      description: "NASA Techport project details.",
    };
  }

  return {
    title: `${project.title ?? `Techport Project ${project.projectId}`}`,
    description: `Details about the NASA Techport project ${project.title ?? project.projectId}.`,
  };
}

export default async function TechportProjectPage({ params }: TechportProjectPageProps) {
  const project = await fetchTechportProject(params.id);

  if (!project) {
    notFound();
  }

  const description =
    sanitizePlainText(project.description) ?? "This project does not have a public description yet.";
  const benefits = sanitizePlainText(project.benefits);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-black to-slate-950 text-white">
      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-6 py-16">
        <header className="flex flex-col gap-3">
          <p className="text-xs uppercase tracking-[0.4em] text-white/50">Techport Project</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {project.title ?? `Project ${project.projectId}`}
          </h1>
          <div className="flex flex-wrap gap-4 text-xs uppercase tracking-[0.4em] text-white/40">
            {project.lastUpdatedFormatted ? <span>Updated {project.lastUpdatedFormatted}</span> : null}
            {project.startDateFormatted ? <span>Start {project.startDateFormatted}</span> : null}
            {project.endDateFormatted ? <span>End {project.endDateFormatted}</span> : null}
          </div>
          <Link
            href={ROUTES.techport}
            className="inline-flex items-center justify-center self-start rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:border-white/40 hover:bg-white/20"
          >
            Back to Techport
          </Link>
        </header>

        <section className={CARD_CLASS}>
          <h2 className="text-xl font-semibold tracking-tight text-white">Overview</h2>
          <p className="text-readable mt-3 whitespace-pre-line text-sm leading-relaxed text-white/70">
            {description}
          </p>
          {benefits ? (
            <div className="mt-6 border-t border-white/10 pt-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">
                Benefits
              </h3>
              <p className="text-readable mt-2 whitespace-pre-line text-sm leading-relaxed text-white/70">{benefits}</p>
            </div>
          ) : null}
        </section>

        <div className="grid gap-6 md:grid-cols-2">
          <section className={CARD_CLASS}>
            <h2 className="text-lg font-semibold tracking-tight text-white">Lead Organization</h2>
            {project.leadOrganization ? (
              <div className="text-readable mt-3 text-sm text-white/70">
                <p className="font-semibold text-white">{project.leadOrganization.name}</p>
                {project.leadOrganization.type ? (
                  <p className="mt-1 text-xs uppercase tracking-[0.4em] text-white/40">
                    {project.leadOrganization.type}
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="text-readable mt-3 text-sm text-white/60">No lead organization data available.</p>
            )}
          </section>

          <section className={CARD_CLASS}>
            <h2 className="text-lg font-semibold tracking-tight text-white">Supporting Teams</h2>
            {project.supportingOrganizations && project.supportingOrganizations.length > 0 ? (
              <ul className="text-readable mt-3 flex flex-col gap-3 text-sm text-white/70">
                {project.supportingOrganizations.map((org, index) => (
                  <li
                    key={`${org?.name ?? "support"}-${index}`}
                    className="rounded-2xl bg-white/5 p-3 ring-1 ring-white/10"
                  >
                    <p className="font-semibold text-white">{org.name}</p>
                    {org.type ? (
                      <p className="mt-1 text-xs uppercase tracking-[0.4em] text-white/40">{org.type}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-readable mt-3 text-sm text-white/60">
                No supporting organizations listed for this project.
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
