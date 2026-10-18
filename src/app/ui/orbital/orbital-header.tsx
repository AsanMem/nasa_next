"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { destinations } from "./destinations";
import { useScrollLock } from "./use-scroll-lock";
import s from "./orbital.module.css";

const extras=[{href:"/epic",title:"EPIC observations"},{href:"/library",title:"Observation journal"},{href:"/birthday",title:"Your birth sky"},{href:"/learn",title:"For teachers"}];
export default function OrbitalHeader() {
  const pathname=usePathname(), [open,setOpen]=useState(false), [hover,setHover]=useState<number|null>(null);
  const dialog=useRef<HTMLDialogElement>(null), trigger=useRef<HTMLButtonElement>(null);
  const active=destinations.findIndex(item=>pathname.startsWith(item.href));
  useScrollLock(open);
  useEffect(()=>setOpen(false),[pathname]);
  useEffect(()=>{
    if(!open)return;
    const element=dialog.current,returnFocus=trigger.current;
    element?.showModal();
    return ()=>{element?.close();returnFocus?.focus({preventScroll:true});};
  },[open]);
  return <>
    <header className={`${s.theme} ${s.header}`}>
      <Link href="/" className={s.brand} aria-label="Orbital home"><Image src="/orbital-icon.svg" alt="" width={58} height={48} priority/><span>Orbital<small>An independent NASA explorer</small></span></Link>
      <nav className={s.nav} aria-label="Expedition navigation"><span className={s.chapter}>{destinations[active]?.title??extras.find(item=>item.href===pathname)?.title??(pathname==="/"?"Follow your curiosity":"NASA archive")}</span><button className={`${s.button} ${s.quiet}`} ref={trigger} type="button" aria-haspopup="dialog" aria-expanded={open} onClick={()=>{setHover(null);setOpen(true);}}>Expedition map <span aria-hidden="true">↗</span></button></nav>
    </header>
    <dialog ref={dialog} className={`${s.theme} ${s.map}`} aria-modal="true" aria-labelledby="expedition-map-title" onCancel={()=>setOpen(false)} onClose={()=>setOpen(false)} onKeyDown={event=>{
      if(event.key!=="Tab")return;
      const items=Array.from(event.currentTarget.querySelectorAll<HTMLElement>('a[href],button:not([disabled])')),first=items[0],last=items[items.length-1];
      if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
    }}>
      <div className={s.mapTop}><Link href="/" onClick={()=>setOpen(false)}>Orbital / Home</Link><button type="button" className={`${s.button} ${s.quiet}`} onClick={()=>setOpen(false)} autoFocus>Close map ×</button></div>
      <h2 id="expedition-map-title">Explore Orbital</h2>
      <nav aria-label="All expedition chapters" className={s.mapGrid} onMouseLeave={()=>setHover(null)}>
        <span className={s.routeMarker} style={{"--route-index":hover??Math.max(0,active)} as React.CSSProperties} aria-hidden="true"/>
        {destinations.map((item,index)=><Link className={s.destination} href={item.href} key={item.href} aria-current={active===index?"page":undefined} onFocus={()=>setHover(index)} onMouseEnter={()=>setHover(index)} onClick={()=>setOpen(false)}>
          <span className={s.mapThumbnail}>{item.image?<Image src={item.image} alt="" width={96} height={72}/>:<span className={s.mapSun}/>}</span><span>{item.title}{item.menuDescription&&<small>{item.menuDescription}</small>}{active===index&&<small>Current chapter</small>}</span><span aria-hidden="true">↗</span>
        </Link>)}
      </nav>
      <nav className={s.mapExtras} aria-label="More observations">{extras.map(item=><Link key={item.href} href={item.href} aria-current={pathname===item.href?"page":undefined} onClick={()=>setOpen(false)}>{item.title}<span aria-hidden="true">↗</span></Link>)}</nav>
    </dialog>
  </>;
}
