"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import orbital from "../orbital/orbital.module.css";
import s from "../orbital/chapters.module.css";

export default function SearchData({kind="image"}:{kind?:"image"|"video"}) {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const query = params.get("query") || "";
  const [term, setTerm] = useState(query);
  const [pending, startTransition] = useTransition();
  const intent = useRef<string | null>(null);
  const dock = useRef<HTMLFormElement>(null);
  const [floating,setFloating]=useState(false),[shown,setShown]=useState(true),[pointerFocus,setPointerFocus]=useState(false);
  useEffect(()=>{
    let previous=window.scrollY,travel=0,frame=0;
    const update=()=>{frame=0;const y=window.scrollY,delta=y-previous;previous=y;
      if(!dock.current||document.body.style.position==="fixed")return;
      const away=y>220;setFloating(away);
      if(!away){setShown(true);travel=0;return;}
      if(dock.current.contains(document.activeElement)){setShown(true);return;}
      travel=delta*travel<0?delta:travel+delta;
      if(Math.abs(travel)>8){setShown(travel<0);travel=0;}
    };
    const scroll=()=>{if(!frame)frame=requestAnimationFrame(update);};
    window.addEventListener("scroll",scroll,{passive:true});
    return()=>{window.removeEventListener("scroll",scroll);cancelAnimationFrame(frame);};
  },[]);
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
  const revealResults=()=>{if(floating)window.scrollTo({top:0,behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth"});};
  useEffect(() => () => search.cancel(), [search]);
  useEffect(() => {
    const restore = () => { search.cancel(); intent.current = null; setTerm(new URLSearchParams(window.location.search).get("query") || ""); };
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, [search]);
  return <form ref={dock} role="search" className={`${s.search} ${s.searchDock}`} data-floating={floating} data-shown={shown} data-pointer-focus={pointerFocus} onPointerDownCapture={()=>setPointerFocus(true)} onKeyDownCapture={()=>setPointerFocus(false)} onFocusCapture={()=>setShown(true)} onSubmit={event => { event.preventDefault(); search.cancel(); navigate(term);revealResults(); }}>
    <label htmlFor="nasa-search" className={s.visuallyHidden}>Search NASA {kind === "image" ? "images" : "videos"}</label>
    <div className={s.searchField}><input id="nasa-search" name="query" type="search" autoComplete="off" value={term} placeholder={kind === "image" ? "Search NASA images" : "Search NASA videos"} onChange={event => { intent.current = event.target.value; setTerm(event.target.value); search(event.target.value); }} />
      {term && <button className={s.clearSearch} aria-label="Clear search" type="button" onClick={() => { search.cancel(); setTerm(""); navigate(""); }}>×</button>}
      <button className={`${orbital.button} ${orbital.quiet}`} type="submit">Search</button>
    </div>
    <div className={s.suggestions} aria-label="Suggested searches">{["Earth", "Apollo", "Webb", "nebula"].map(value => <button className={s.chip} key={value} type="button" onClick={() => { search.cancel(); setTerm(value); navigate(value); }}>{value}</button>)}</div>
    <p className={s.searchStatus} role="status">{pending ? "Searching…" : query ? `Results for “${query}”` : ""}</p>
  </form>;
}
