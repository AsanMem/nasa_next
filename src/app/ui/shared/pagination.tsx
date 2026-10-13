"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { generatePagination } from "@/app/lib/utils";
import s from "../orbital/chapters.module.css";

export default function Pagination({ totalPages }: { totalPages: number }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const current = Math.max(1, Number(params.get("page")) || 1);
  const href = (page: number) => { const next = new URLSearchParams(params.toString()); next.set("page", String(page)); return `${pathname}?${next.toString()}`; };
  return <nav aria-label="Results pages" className={s.pagination}>
    {current > 1 && <Link href={href(current - 1)} aria-label="Previous results page">Previous</Link>}
    {generatePagination(current, totalPages).map((page, index) => typeof page === "number" ? page === current ? <span key={page} aria-current="page" aria-label={`Page ${page}`}>{page}</span> : <Link key={page} href={href(page)} aria-label={`Go to page ${page}`}>{page}</Link> : <span key={`gap-${index}`} aria-hidden="true">…</span>)}
    {current < totalPages && <Link href={href(current + 1)} aria-label="Next results page">Next</Link>}
  </nav>;
}
