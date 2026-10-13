import Link from "next/link";
import { fetchTechportProjects } from "@/app/lib/nasa/techport";
import { Chapter, ChapterHeading, EmptyState } from "../ui/orbital/chapter";
import s from "../ui/orbital/chapters.module.css";
export const metadata = { title: "Technology projects · Orbital", description: "Explore the NASA Techport technology development portfolio." };
export default async function TechportPage() {
  const projects = await fetchTechportProjects(24);
  return <Chapter><ChapterHeading label="NASA Techport" title="Ideas that take us further." description="From early research to technologies ready for a mission. Explore the work behind NASA's next discoveries." />
    <div className={s.split}><aside className={s.context}><h2>Inside the technology portfolio</h2><p>Each project describes a part of NASA&apos;s research and development. Open a record to read its goals, benefits and participating organizations.</p><Link href="/techtransfer" className={s.textLink}>Explore patents & software</Link></aside>
      <section aria-label="Technology projects">{projects.length ? projects.map(project => <article className={s.record} key={project.projectId}><div className={s.meta}><span>Project {project.projectId}</span>{project.formattedLastUpdated && <span>Updated {project.formattedLastUpdated}</span>}</div><h2><Link href={`/techport/${project.projectId}`}>{project.title || `NASA project ${project.projectId}`}</Link></h2><div className={s.actions}><Link className={s.textLink} href={`/techport/${project.projectId}`}>Read project</Link></div></article>) : <EmptyState title="The project index is unavailable"><p>No Techport records were returned. Try again later or explore NASA&apos;s patents and software.</p><Link href="/techtransfer">Browse technology transfer</Link></EmptyState>}</section>
    </div>
  </Chapter>;
}
