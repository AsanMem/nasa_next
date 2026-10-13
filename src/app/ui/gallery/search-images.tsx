"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import orbital from "../orbital/orbital.module.css";
import s from "../orbital/chapters.module.css";

export default function SearchData() {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const query = params.get("query") || "";
  const [term, setTerm] = useState(query);
  const [pending, startTransition] = useTransition();
  const intent = useRef<string | null>(null);
  useEffect(() => {
    // An older URL may commit while the user is already typing the next query.
    if (intent.current === null || intent.current.trim() === query) {
      setTerm(query); intent.current = null;
    }
  }, [query]);
  function navigate(value: string) {
    intent.current = value;
    const next = new URLSearchParams(params.toString());
    next.set("page", "1");
    if (value.trim()) next.set("query", value.trim()); else next.delete("query");
    startTransition(() => router.replace(`${pathname}?${next.toString()}`, { scroll: false }));
  }
  const search = useDebouncedCallback(navigate, 400);
  useEffect(() => () => search.cancel(), [search]);
  useEffect(() => {
    const restore = () => { search.cancel(); intent.current = null; setTerm(new URLSearchParams(window.location.search).get("query") || ""); };
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, [search]);
  return <form role="search" className={s.search} onSubmit={event => { event.preventDefault(); search.cancel(); navigate(term); }}>
    <label htmlFor="nasa-search">Find a mission, a place, a discovery</label>
    <div className={s.searchField}><input id="nasa-search" name="query" type="search" autoComplete="off" value={term} placeholder="What are you curious about?" onChange={event => { intent.current = event.target.value; setTerm(event.target.value); search(event.target.value); }} />
      <button className={orbital.button} type="submit">Search</button>
      {term && <button className={`${orbital.button} ${orbital.quiet}`} type="button" onClick={() => { search.cancel(); setTerm(""); navigate(""); }}>Clear</button>}
    </div>
    <div className={s.suggestions}><span>Try a subject</span>{["Earth", "Apollo", "James Webb", "nebula"].map(value => <button className={s.chip} key={value} type="button" onClick={() => { search.cancel(); setTerm(value); navigate(value); }}>{value}</button>)}</div>
    <p className={s.caption} role="status">{pending ? "Searching the NASA archive…" : query ? `Showing results for “${query}”.` : "Explore NASA's image and video library."}</p>
  </form>;
}
