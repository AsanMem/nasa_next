import { pageMetadata } from "@/app/lib/site";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchTechportProject } from "@/app/lib/nasa/techport";
import { sanitizePlainText } from "@/app/lib/utils/text";
import { Chapter, ChapterHeading } from "../../ui/orbital/chapter";
import s from "../../ui/orbital/chapters.module.css";
type Props = { params: { id: string } };
export async function generateMetadata({ params }: Props) {
  const project = await fetchTechportProject(params.id);
  return pageMetadata(`/techport/${encodeURIComponent(params.id)}`,`${project?.title || "Technology project"} · Orbital`,"NASA Techport project details.");
}
export default async function TechportProjectPage({ params }: Props) {
  const project = await fetchTechportProject(params.id);
  if (!project) notFound();
  return <Chapter><ChapterHeading label={`NASA Techport / Project ${project.projectId}`} title={project.title || `Project ${project.projectId}`}><div className={s.meta}>{project.lastUpdatedFormatted && <span>Updated {project.lastUpdatedFormatted}</span>}{project.startDateFormatted && <span>Start {project.startDateFormatted}</span>}{project.endDateFormatted && <span>End {project.endDateFormatted}</span>}</div><Link href="/techport" className={s.textLink}>All technology projects</Link></ChapterHeading>
    <section className={s.story}><h2>The research</h2><div><p>{sanitizePlainText(project.description) || "No public description has been supplied for this project."}</p>{project.benefits && <article className={s.record} style={{ marginTop: 36 }}><h3>Potential benefits</h3><p>{sanitizePlainText(project.benefits)}</p></article>}</div></section>
    <div className={s.recordGrid}><section className={s.record}><h2>Lead organization</h2><p>{project.leadOrganization?.name || "Not supplied"}</p>{project.leadOrganization?.type && <p>{project.leadOrganization.type}</p>}</section><section className={s.record}><h2>Supporting organizations</h2>{project.supportingOrganizations?.length ? project.supportingOrganizations.map((org, i) => <p key={i}>{org.name || "Unnamed organization"}{org.type ? ` / ${org.type}` : ""}</p>) : <p>No supporting organizations listed.</p>}</section></div>
  </Chapter>;
}
