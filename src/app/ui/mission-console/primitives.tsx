import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./home-console.module.css";
import orbital from "../orbital/orbital.module.css";

export function ArrowIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function MissionButton({ href, children, variant = "primary" }: { href: string; children: ReactNode; variant?: "primary" | "quiet" }) {
  return <Link href={href} className={variant === "primary" ? `${orbital.button} ${styles.primaryButton}` : styles.quietButton}>{children}{variant === "primary" && <ArrowIcon />}</Link>;
}

export function MissionCard({ title, description, href, category, image }: { title: string; description: string; href: string; category: string; image?: string }) {
  return (
    <Link href={href} className={styles.missionCard}>
      <div className={styles.missionImage}>{image ? <Image src={image} alt="" fill sizes="(max-width: 600px) 76px, 128px" /> : <div className={styles.solarPreview} aria-hidden="true" />}</div>
      <div className={styles.missionCopy}><span className={styles.category}>{category}</span><h3>{title}</h3><p>{description}</p></div>
      <span className={styles.missionArrow}><ArrowIcon /></span>
    </Link>
  );
}
