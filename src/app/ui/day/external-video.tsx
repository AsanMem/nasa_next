"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { embeddedVideo } from "../../lib/observations/video";
import s from "../orbital/chapters.module.css";
import orbital from "../orbital/orbital.module.css";
import { useScrollLock } from "../orbital/use-scroll-lock";

type Player={destroy():void};
type YouTubeAPI={Player:new(element:HTMLIFrameElement,options:{events:{onError:(event:{data:number})=>void}})=>Player};
declare global { interface Window { YT?: YouTubeAPI; onYouTubeIframeAPIReady?:()=>void } }
let apiPromise:Promise<YouTubeAPI>|undefined;
function youtubeAPI() {
  if(window.YT?.Player)return Promise.resolve(window.YT);
  if(!apiPromise)apiPromise=new Promise<YouTubeAPI>((resolve,reject)=>{
    const script=document.createElement("script");script.src="https://www.youtube.com/iframe_api";script.async=true;
    const previous=window.onYouTubeIframeAPIReady;
    const timer=window.setTimeout(()=>{apiPromise=undefined;script.remove();reject(new Error("Player unavailable"));},12000);
    window.onYouTubeIframeAPIReady=()=>{previous?.();window.clearTimeout(timer);if(window.YT)resolve(window.YT);else reject(new Error("Player unavailable"));};
    script.onerror=()=>{window.clearTimeout(timer);apiPromise=undefined;script.remove();reject(new Error("Player unavailable"));};
    document.head.appendChild(script);
  });
  return apiPromise;
}
export default function ExternalVideo({url,title}:{url:string;title:string}) {
  const source=useMemo(()=>embeddedVideo(url),[url]);
  const [loaded,setLoaded]=useState(false),[error,setError]=useState("");
  const host=useRef<HTMLDivElement>(null);
  const shell=useRef<HTMLDialogElement>(null),expandButton=useRef<HTMLButtonElement>(null);
  const [expanded,setExpanded]=useState(false);
  useScrollLock(expanded);
  useEffect(()=>{
    const element=shell.current;
    if(!expanded||!element)return;
    const previous=document.activeElement as HTMLElement|null;
    // Keep the same connected iframe: closing/showing this dialog does not reparent or reload it.
    element.close();element.showModal();expandButton.current?.focus({preventScroll:true});
    return()=>{element.close();if(element.isConnected){element.show();previous?.focus({preventScroll:true});}};
  },[expanded]);
  useEffect(()=>{
    if(!loaded||!source||!host.current)return;
    const element=host.current;let cancelled=false,player:Player|undefined;
    const iframe=document.createElement("iframe");iframe.title=title;iframe.referrerPolicy="strict-origin-when-cross-origin";
    const ownFullscreen=source.provider==="YouTube";
    iframe.allow=`${ownFullscreen?"":"fullscreen; "}picture-in-picture; encrypted-media`;iframe.allowFullscreen=!ownFullscreen;
    const embed=new URL(source.embed);
    if(source.provider==="YouTube"){embed.searchParams.set("enablejsapi","1");embed.searchParams.set("origin",window.location.origin);embed.searchParams.set("playsinline","1");embed.searchParams.set("fs","0");}
    iframe.src=embed.href;element.appendChild(iframe);
    if(source.provider==="YouTube")void youtubeAPI().then(api=>{
      if(cancelled)return;
      player=new api.Player(iframe,{events:{onError:()=>{if(!cancelled)setError("This video cannot play here. Watch it on YouTube or try again.");}}});
    }).catch(()=>{if(!cancelled)setError("The player could not connect. Use the original video link.");});
    return ()=>{cancelled=true;player?.destroy();element.replaceChildren();};
  },[loaded,source,title]);
  if(!source)return <div className={s.embedPrompt}><p>This video is available at its original source.</p><a className={s.textLink} href={url} target="_blank" rel="noopener noreferrer">Watch original video ↗</a></div>;
  return <div className={s.externalVideo}>
    <dialog open className={s.playerShell} data-expanded={expanded} role={expanded?"dialog":"presentation"} aria-modal={expanded?true:undefined} aria-label={expanded?title:undefined} ref={shell} onCancel={event=>{event.preventDefault();setExpanded(false);}} onKeyDown={event=>{if(!expanded||event.key!=="Tab")return;const elements=Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button,iframe,a[href]'));if(event.shiftKey&&document.activeElement===elements[0]){event.preventDefault();elements.at(-1)?.focus();}else if(!event.shiftKey&&document.activeElement===elements.at(-1)){event.preventDefault();elements[0]?.focus();}}}>{loaded?<>{source.provider==="YouTube"&&<div className={s.playerBar}><button ref={expandButton} className={`${orbital.button} ${orbital.quiet}`} onClick={()=>setExpanded(value=>!value)}>{expanded?"← Back to page":"Expand player ⤢"}</button></div>}<div ref={host} className={s.externalPlayer}/></>:<div className={s.embedPrompt}><span className={s.playSymbol} aria-hidden="true">▷</span><button className={`${orbital.button} ${orbital.quiet}`} type="button" onClick={()=>setLoaded(true)}>Play {source.provider} video</button><details><summary>About external video</summary><p>The provider receives your IP address and may use browser storage after you choose Play. <Link href="/privacy">Privacy & sources</Link></p></details></div>}{expanded&&<div className={s.playerStatus}>{error&&<p role="alert" className={s.caption}>{error}</p>}<a className={s.videoSource} href={source.original} target="_blank" rel="noopener noreferrer">Watch on {source.provider} ↗</a></div>}</dialog>
    {!expanded&&error&&<p role="alert" className={s.caption}>{error} <button type="button" className={s.textLink} onClick={()=>{setExpanded(false);setLoaded(false);setError("");}}>Try again</button></p>}
    {!expanded&&<a className={s.videoSource} href={source.original} target="_blank" rel="noopener noreferrer">Watch on {source.provider} ↗</a>}
  </div>;
}
