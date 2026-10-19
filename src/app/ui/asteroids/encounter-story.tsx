"use client";
import { useCallback,useEffect,useMemo,useRef,useState } from "react";
import type { Approach,HistoryFilter } from "../../lib/asteroids/view-model";
import { dateLabel,filterEncounters,numberLabel } from "../../lib/asteroids/view-model";
import { clusterEncounters,encounterTimeline,nearestEncounter } from "../../lib/asteroids/encounters";
import type { EncounterMotion,TimelineEvent } from "../../lib/asteroids/encounters";
import { FLYBY_MS,TIME_JUMP_MS,flybyUtc } from "../../lib/asteroids/encounter-playback";
import type { EncounterView,PhysicalEncounterFrame } from "../../lib/asteroids/encounter-playback";
import { declutterPlanetLabels,labelLayout } from "../../lib/asteroids/planet-labels";
import { BODY_TONE,SYSTEM_BODIES,preparePlanetEphemeris } from "../../lib/asteroids/physical-planets";
import { isTrajectoryReady } from "../../lib/asteroids/trajectory";
import type { TrajectoryReady } from "../../lib/asteroids/trajectory";
import { useOrbitalScene } from "../orbital/scene-provider";
import PhysicalFallback from "./physical-fallback";
import { AsteroidPortrait } from "./comparisons";
import s from "./encounter-story.module.css";

type Props={id:string;diameter:number|null;events:Approach[];selected:Approach|null;today:string;onSelect:(event:Approach)=>void;onActiveChange:(active:boolean)=>void};
type RequestState={eventKey:string;status:"pending"|"unavailable"|"ready";message:string;trajectory?:TrajectoryReady};
export default function EncounterStory({id,diameter,events,selected,today,onSelect,onActiveChange}:Props) {
  const all=useMemo(()=>encounterTimeline(events),[events]);
  const [filter,setFilter]=useState<HistoryFilter>("all"),[active,setActive]=useState(false),[playing,setPlaying]=useState(false),[tabVisible,setTabVisible]=useState(true),[rate,setRate]=useState(1),[view,setView]=useState<EncounterView>("inner"),[slots,setSlots]=useState(7),[group,setGroup]=useState<TimelineEvent[]>([]),[recordsOpen,setRecordsOpen]=useState(false),[retry,setRetry]=useState(0),[inspectionRevision,setInspectionRevision]=useState(0),[request,setRequest]=useState<RequestState|null>(null),[jump,setJump]=useState<{from:number;to:number}|null>(null);
  const filtered=useMemo(()=>{const keys=new Set(filterEncounters(events,filter,today).map(event=>event.key));return all.filter(item=>keys.has(item.event.key));},[all,events,filter,today]);
  const current=filtered.find(item=>item.event.key===selected?.key)??filtered[0];
  const scene=useRef<HTMLDivElement>(null),track=useRef<HTMLDivElement>(null),motion=useRef<EncounterMotion|null>(null);
  const physical=useRef<PhysicalEncounterFrame>({trajectory:null,utcMs:current?.time??0,phase:"idle",progress:0});
  const labelWork=useRef(labelLayout());
  const labels=useRef(new Map<string,HTMLSpanElement>()),picker=useRef(onSelect),expected=useRef(selected?.key),rateRef=useRef(rate),currentRef=useRef(current),cache=useRef(new Map<string,TrajectoryReady>()),prefetch=useRef<((event:Approach)=>void)|null>(null);
  picker.current=onSelect;rateRef.current=rate;currentRef.current=current;
  const session=useRef<{eventKey:string;elapsed:number;phase:"flyby"|"jump"}|null>(null),autoplay=useRef(true),yearNode=useRef<HTMLElement>(null),clockNode=useRef<HTMLSpanElement>(null),yearValue=useRef<number|null>(null);
  const signature=filtered.map(item=>item.event.key).join("|");
  const projectBodies=useCallback((points:{id:string;x:number;y:number;visible:boolean}[])=>{declutterPlanetLabels(points,scene.current?.clientWidth??320,scene.current?.clientHeight??300,currentRef.current?.event.body??"",labelWork.current);for(const point of points){const element=labels.current.get(point.id);if(element){element.style.left=point.x+"%";element.style.top=point.y+"%";element.style.visibility=point.visible?"visible":"hidden";}}},[]);
  const sceneConfig=useMemo(()=>({kind:"encounters" as const,id,diameter,paused:!playing||request?.status!=="ready",encounter:{bodies:SYSTEM_BODIES,body:current?.event.body??"Unknown body",eventKey:current?.event.key,revision:inspectionRevision,motion,physical,view},projectBodies}),[id,diameter,playing,request?.status,current?.event.body,current?.event.key,view,inspectionRevision,projectBodies]);
  const {host,status,reduced}=useOrbitalScene(sceneConfig,active&&!!current);
  const ready=active&&status==="ready",loaded=request?.status==="ready"&&request.eventKey===current?.event.key?request.trajectory:null;
  const groups=useMemo(()=>clusterEncounters(filtered,slots),[filtered,slots]);
  const ticks=useMemo(()=>all.map(item=>`M${item.position*1000},0v6`).join(" "),[all]);
  const first=all[0]?.time??0,last=all.at(-1)?.time??first,todayTime=Date.parse(today+"T00:00:00Z"),todayPosition=last===first?.5:(todayTime-first)/(last-first);
  function clearMotion(){motion.current=null;session.current=null;yearValue.current=null;physical.current={trajectory:null,utcMs:currentRef.current?.time??0,phase:"idle",progress:0};setJump(null);setInspectionRevision(value=>value+1);}
  function pause(){autoplay.current=false;setPlaying(false);}
  function choose(event:Approach){pause();clearMotion();expected.current=event.key;picker.current(event);setGroup([]);}
  useEffect(()=>{
    const target=scene.current;if(!target)return;let visible=false;
    const observer=new IntersectionObserver(([entry])=>{if(entry.intersectionRatio>=.25)visible=true;else if(!entry.isIntersecting)visible=false;setActive(visible);onActiveChange(visible);if(!visible)setPlaying(false);},{threshold:[0,.25]});observer.observe(target);
    return()=>{observer.disconnect();onActiveChange(false);};
  },[onActiveChange]);
  useEffect(()=>{const target=track.current;if(!target)return;const observer=new ResizeObserver(()=>setSlots(Math.max(1,Math.floor(target.clientWidth/44))));observer.observe(target);setSlots(Math.max(1,Math.floor(target.clientWidth/44)));return()=>observer.disconnect();},[]);
  useEffect(()=>{const stop=()=>{setTabVisible(!document.hidden);if(document.hidden)setPlaying(false);};const pop=()=>{autoplay.current=false;setPlaying(false);motion.current=null;session.current=null;yearValue.current=null;physical.current.trajectory=null;physical.current.phase="idle";setJump(null);};stop();document.addEventListener("visibilitychange",stop);window.addEventListener("popstate",pop);return()=>{document.removeEventListener("visibilitychange",stop);window.removeEventListener("popstate",pop);};},[]);
  useEffect(()=>{
    if(selected?.key!==expected.current){autoplay.current=false;setPlaying(false);session.current=null;yearValue.current=null;physical.current.trajectory=null;physical.current.phase="idle";setJump(null);if(selected&&!filtered.some(item=>item.event.key===selected.key))setFilter("all");}
    expected.current=selected?.key;
    // A profile URL change pauses inspection; expected is set before an automatic real-event selection.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[selected?.key]);
  useEffect(()=>{
    if(!active||!tabVisible||!current)return;
    const controller=new AbortController();let cancelled=false;
    if(physical.current.trajectory?.eventKey!==current.event.key){
      physical.current={trajectory:null,utcMs:current.time,phase:"idle",progress:0};
      yearValue.current=new Date(current.time).getUTCFullYear();
      if(yearNode.current)yearNode.current.textContent=String(yearValue.current);
      if(clockNode.current)clockNode.current.textContent="";
    }
    const inFlight=new Map<string,Promise<TrajectoryReady>>();
    const userError=(message:string)=>Object.assign(new Error(message),{name:"TrajectoryLoadError"});
    const remember=(value:TrajectoryReady)=>{cache.current.delete(value.eventKey);cache.current.set(value.eventKey,value);while(cache.current.size>3)cache.current.delete(Array.from(cache.current.keys())[0]);};
    const loadRaw=async(event:Approach):Promise<TrajectoryReady>=>{
      const cached=cache.current.get(event.key);if(cached)return cached;
      for(let attempt=0;attempt<8;attempt++){
        const query=new URLSearchParams({date:event.date,event:event.key});
        if(controller.signal.aborted)throw new Error("Aborted");
        const http=new AbortController(),abort=()=>http.abort();let timedOut=false;controller.signal.addEventListener("abort",abort,{once:true});
        const timeout=setTimeout(()=>{timedOut=true;http.abort();},55000);
        let value:unknown;try{const response=await fetch(`/api/asteroids/${encodeURIComponent(id)}/trajectory?${query}`,{signal:http.signal,headers:{Accept:"application/json"}});value=await response.json();}catch(error){if(timedOut)throw userError("The trajectory request timed out. Retry to continue.");throw error;}finally{clearTimeout(timeout);controller.signal.removeEventListener("abort",abort);}
        if(isTrajectoryReady(value)&&value.eventKey===event.key&&value.target.neoId===id){remember(value);return value;}
        const state=value as {status?:string;retryAfterMs?:number;message?:string};
        if(state?.status!=="pending")throw userError(typeof state?.message==="string"?state.message.slice(0,180):"This trajectory is unavailable. Try again shortly.");
        const delay=Math.max(1000,Math.min(5000,Number(state.retryAfterMs)||1500));
        await new Promise<void>((resolve,reject)=>{const abort=()=>{clearTimeout(timer);reject(new Error("Aborted"));};const timer=setTimeout(()=>{controller.signal.removeEventListener("abort",abort);resolve();},delay);controller.signal.addEventListener("abort",abort,{once:true});});
      }
      throw userError("The trajectory is still being prepared. Try again shortly.");
    };
    const load=(event:Approach)=>{const existing=inFlight.get(event.key);if(existing)return existing;const promise=loadRaw(event).finally(()=>inFlight.delete(event.key));inFlight.set(event.key,promise);return promise;};
    const nextPrefetch=(event:Approach)=>{void load(event).catch(()=>{});};prefetch.current=nextPrefetch;
    setRequest({eventKey:current.event.key,status:"pending",message:"Preparing the JPL trajectory…"});
    void Promise.all([load(current.event),preparePlanetEphemeris()]).then(([trajectory])=>{
      if(cancelled||controller.signal.aborted)return;
      setRequest({eventKey:trajectory.eventKey,status:"ready",message:"",trajectory});
    }).catch(error=>{if(!cancelled&&!controller.signal.aborted)setRequest({eventKey:current.event.key,status:"unavailable",message:error instanceof Error&&error.name==="TrajectoryLoadError"?error.message:"This trajectory couldn’t be loaded. Check your connection and retry."});});
    return()=>{cancelled=true;controller.abort();if(prefetch.current===nextPrefetch)prefetch.current=null;};
    // The active filter determines only the single next prefetch, never a bulk history download.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[id,current?.event.key,signature,active,tabVisible,retry]);
  useEffect(()=>{
    if(!loaded)return;
    if(session.current?.eventKey!==loaded.eventKey){session.current=null;physical.current={trajectory:loaded,utcMs:loaded.encounterUtcMs,phase:"idle",progress:.5};yearValue.current=new Date(loaded.encounterUtcMs).getUTCFullYear();if(yearNode.current)yearNode.current.textContent=String(yearValue.current);if(clockNode.current)clockNode.current.textContent=`Frame: ${new Intl.DateTimeFormat("en-US",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",timeZone:"UTC"}).format(loaded.encounterUtcMs)} UTC`;}
  },[loaded,inspectionRevision]);
  useEffect(()=>{setPlaying(Boolean(active&&tabVisible&&!reduced&&status==="ready"&&loaded&&filtered.length>0&&autoplay.current));},[active,tabVisible,reduced,status,loaded,filtered.length]);
  useEffect(()=>{if(playing&&current){const next=filtered[(filtered.findIndex(item=>item.event.key===current.event.key)+1)%filtered.length];if(next&&next.event.key!==current.event.key)prefetch.current?.(next.event);}},[playing,current,filtered]);
  useEffect(()=>{
    if(!playing||!active||!tabVisible||reduced||!loaded||status!=="ready")return;
    let state=session.current;if(!state||state.eventKey!==loaded.eventKey){state={eventKey:loaded.eventKey,elapsed:0,phase:"flyby"};session.current=state;}
    let frame=0,previous=0,cancelled=false;const clock=new Date(0),format=new Intl.DateTimeFormat("en-US",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",timeZone:"UTC"});
    const draw=()=>{const progress=Math.min(1,state!.elapsed/(state!.phase==="flyby"?FLYBY_MS:TIME_JUMP_MS));physical.current.trajectory=loaded;physical.current.phase=state!.phase;physical.current.progress=progress;if(state!.phase==="flyby"){physical.current.utcMs=flybyUtc(loaded,progress);clock.setTime(physical.current.utcMs);yearValue.current=clock.getUTCFullYear();if(yearNode.current)yearNode.current.textContent=String(yearValue.current);if(clockNode.current)clockNode.current.textContent=`Frame: ${format.format(clock)} UTC`;}};
    const tick=(time:number)=>{if(cancelled||document.hidden)return;const delta=previous?Math.min(100,time-previous):0;previous=time;state!.elapsed+=delta*rateRef.current;
      if(state!.phase==="flyby"&&state!.elapsed>=FLYBY_MS&&filtered.length===1){state!.elapsed=FLYBY_MS;draw();autoplay.current=false;setPlaying(false);return;}
      if(state!.phase==="flyby"&&state!.elapsed>=FLYBY_MS){state!.elapsed-=FLYBY_MS;state!.phase="jump";const next=filtered[(filtered.findIndex(item=>item.event.key===loaded.eventKey)+1)%filtered.length];setJump({from:new Date(loaded.encounterUtcMs).getUTCFullYear(),to:new Date(next.time).getUTCFullYear()});}
      if(state!.phase==="jump"&&state!.elapsed>=TIME_JUMP_MS){const next=filtered[(filtered.findIndex(item=>item.event.key===loaded.eventKey)+1)%filtered.length];session.current={eventKey:next.event.key,elapsed:0,phase:"flyby"};expected.current=next.event.key;setJump(null);picker.current(next.event);setPlaying(false);return;}
      draw();frame=requestAnimationFrame(tick);
    };draw();frame=requestAnimationFrame(tick);return()=>{cancelled=true;cancelAnimationFrame(frame);};
  },[playing,active,tabVisible,reduced,status,loaded,signature,filtered]);
  function changeFilter(value:HistoryFilter){pause();clearMotion();setGroup([]);setFilter(value);const available=all.filter(item=>filterEncounters([item.event],value,today).length);if(available.length&&!available.some(item=>item.event.key===selected?.key)){const next=nearestEncounter(available,selected?Date.parse(selected.date+"T00:00:00Z"):todayTime);if(next){expected.current=next.event.key;picker.current(next.event);}}}
  const currentIndex=filtered.findIndex(item=>item.event.key===current?.event.key);
  const displayedYear=jump?`${jump.from} → ${jump.to}`:loaded?yearValue.current??current?.event.date.slice(0,4)??"—":current?.event.date.slice(0,4)??"—";
  return <div className={s.story}>
    <div className={s.filters} role="group" aria-label="Filter encounters">{(["all","past","upcoming"] as const).map(value=><button type="button" key={value} aria-pressed={filter===value} onClick={()=>changeFilter(value)}>{value==="all"?"All":value==="past"?"Past":"Upcoming"}</button>)}</div>
    <div className={s.views} role="group" aria-label="System view">{(["inner","whole","close"] as const).map(value=><button type="button" key={value} aria-pressed={view===value} onClick={()=>setView(value)}>{value==="inner"?"Inner system":value==="whole"?"Whole Solar System":"Close approach"}</button>)}</div>
    <div ref={scene} className={s.stage} data-history-scene="true" data-ready={ready}>
      <div className={s.fallback} aria-hidden={ready} data-hidden={ready}>{loaded?<><PhysicalFallback trajectory={loaded} view={view}/><div className={s.loadedPortrait}><AsteroidPortrait id={id} diameter={diameter}/><span>Surface reconstruction</span></div></>:<><div className={s.system}>{SYSTEM_BODIES.filter(body=>body!=="Moon").map(body=><span key={body} className={s.body}><i style={{backgroundColor:BODY_TONE[body],backgroundImage:body==="Earth"?"url(/media/orbital/earth.jpg)":undefined}}/>{body}</span>)}</div><div className={s.staticRock}><AsteroidPortrait id={id} diameter={diameter}/><span>Surface reconstruction</span></div></>}</div>
      <div ref={host} className={s.canvas} data-ready={ready} aria-hidden="true"/>
      <div className={s.bodyLabels} aria-hidden="true" data-visible={ready}>{Array.from(new Set([...SYSTEM_BODIES,current?.event.body??"Unknown body","Asteroid"])).map(body=><span key={body} ref={element=>{if(element)labels.current.set(body,element);else labels.current.delete(body);}}>{body}</span>)}</div>
      <div className={s.year} data-jump={!!jump}><strong ref={yearNode}>{displayedYear}</strong><span>{jump?"Time jump · next listed encounter":loaded?`Closest approach to ${loaded.body}`:"Selected encounter"}</span><span ref={clockNode}>{loaded?`Frame: ${new Intl.DateTimeFormat("en-US",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",timeZone:"UTC"}).format(physical.current.utcMs||loaded.encounterUtcMs)} UTC`:""}</span></div>
      {(!request||request.eventKey!==current?.event.key||request.status!=="ready")&&current&&<div className={s.trajectoryStatus} role="status">{request?.status==="unavailable"&&<span className={s.unlocated}><i/>{current.event.body} encounter · trajectory unavailable</span>}<p>{request?.eventKey===current.event.key?request.message:"Preparing the JPL trajectory…"}</p>{request?.status==="unavailable"&&<button type="button" onClick={()=>setRetry(value=>value+1)}>Retry trajectory</button>}</div>}
      {status==="failed"&&<span className={s.staticNote}>Static view · 3D unavailable</span>}
    </div>
    <div className={s.planetLegend} aria-label="Bodies in this view">{Array.from(new Set(view==="close"?["Asteroid",current?.event.body??"Unknown body"]:SYSTEM_BODIES.filter(body=>view==="whole"||!["Saturn","Uranus","Neptune"].includes(body)))).map(body=><span key={body}><i style={{backgroundColor:BODY_TONE[body]??"#edc18c"}}/>{body}</span>)}</div>
    <p className={s.caption}>Positions are calculated; visible sizes and markers are enlarged, and time is accelerated. The line is a sampled trajectory segment. Close approach uses physical radii; the asteroid belt is schematic.</p>
    <div className={s.eventCard} aria-live={playing?"off":"polite"}>{current?<><div><span>{"Closest approach record"} · {current.event.body}</span><time dateTime={current.event.date}>{dateLabel(current.event.date)}</time></div><dl><div><dt>Distance from {current.event.body}</dt><dd>{numberLabel(current.event.distance,0)}{current.event.distance!=null&&<small> km</small>}</dd></div><div><dt>Relative speed</dt><dd>{numberLabel(current.event.speed,2)}{current.event.speed!=null&&<small> km/s</small>}</dd></div></dl></>:<p>No encounters are listed for this filter in NASA’s response.</p>}</div>
    <div className={s.controls}><button type="button" aria-label="Previous encounter" disabled={currentIndex<=0} onClick={()=>choose(filtered[currentIndex-1].event)}>←</button><button type="button" className={s.play} aria-pressed={playing} disabled={!ready||!loaded||reduced||filtered.length<1} onClick={()=>{setGroup([]);if(!playing&&session.current?.elapsed===FLYBY_MS&&filtered.length===1)session.current.elapsed=0;autoplay.current=!playing;setPlaying(value=>!value);}}>{playing?"Pause":"Play journey"}</button><button type="button" aria-label="Next encounter" disabled={currentIndex<0||currentIndex>=filtered.length-1} onClick={()=>choose(filtered[currentIndex+1].event)}>→</button><label><span>Speed</span><select aria-label="Journey playback speed" value={rate} onChange={event=>setRate(Number(event.target.value))}><option value={1}>1×</option><option value={2}>2×</option><option value={4}>4×</option></select></label></div>
    <p className={s.caption}>Each flyby plays its real local time window in eight seconds. Time jumps skip the unplayed years; Pause to inspect a frame.</p>
    {reduced&&<p className={s.caption}>Reduced motion: choose an encounter with the arrows or timeline.</p>}
    <div className={s.timeArea} ref={track}>
      <label className={s.rangeLabel} htmlFor={`encounter-time-${id}`}>Explore {all.length} listed encounters</label>
      <input id={`encounter-time-${id}`} className={s.scrubber} type="range" min={first} max={last===first?first+86400000:last} step={1} value={current?.time??first} disabled={!filtered.length||all.length<2} aria-valuetext={current?`${dateLabel(current.event.date)}, ${current.event.body}`:"No encounters"} onChange={event=>{const next=nearestEncounter(filtered,Number(event.target.value));if(next)choose(next.event);}} onKeyDown={event=>{const index=event.key==="Home"?0:event.key==="End"?filtered.length-1:event.key==="ArrowRight"||event.key==="ArrowUp"?Math.min(filtered.length-1,currentIndex+1):event.key==="ArrowLeft"||event.key==="ArrowDown"?Math.max(0,currentIndex-1):-1;if(index>=0&&filtered[index]){event.preventDefault();choose(filtered[index].event);}}}/>
      <div className={s.markers}><svg className={s.exactTicks} viewBox="0 0 1000 6" preserveAspectRatio="none" aria-hidden="true"><path d={ticks}/></svg>{todayPosition>=0&&todayPosition<=1&&<span className={s.today} style={{left:`${todayPosition*100}%`}}>Today</span>}{groups.map(items=><button type="button" key={items.items[0].event.key} style={{left:`${items.position*100}%`}} aria-label={items.items.length===1?`Choose ${dateLabel(items.items[0].event.date)}, ${items.items[0].event.body}`:`Choose from ${items.items.length} encounters, ${items.items[0].event.date.slice(0,4)} to ${items.items.at(-1)!.event.date.slice(0,4)}`} aria-pressed={items.items.some(item=>item.event.key===current?.event.key)} onClick={()=>{pause();if(items.items.length===1)choose(items.items[0].event);else setGroup(group[0]?.event.key===items.items[0].event.key?[]:items.items);}}><i/>{items.items.length>1&&<span>{items.items.length}</span>}</button>)}</div>
      <div className={s.endpoints}><span>First listed<br/><strong>{all[0]?.event.date.slice(0,4)??"—"}</strong></span><span>Last listed encounter<br/><strong>{all.at(-1)?.event.date.slice(0,4)??"—"}</strong></span></div>
    </div>
    {!!group.length&&<div className={s.cluster} role="group" aria-label="Choose a grouped encounter"><button className={s.closeGroup} type="button" onClick={()=>setGroup([])}>Close ×</button>{group.map(item=><button type="button" key={item.event.key} onClick={()=>choose(item.event)}><time>{dateLabel(item.event.date)}</time><span>{item.event.body}</span></button>)}</div>}
    <details className={s.records} onToggle={event=>{setRecordsOpen(event.currentTarget.open);if(event.currentTarget.open)pause();}}><summary>View encounter records <span>{filtered.length}</span></summary>{recordsOpen&&<div>{filtered.map(item=><button type="button" key={item.event.key} aria-pressed={current?.event.key===item.event.key} onClick={()=>choose(item.event)}><span>{dateLabel(item.event.date)}<small>{item.event.body}</small></span><span>{numberLabel(item.event.distance,0)}{item.event.distance!=null&&" km"}<small>{numberLabel(item.event.speed,2)}{item.event.speed!=null&&" km/s"}</small></span></button>)}</div>}</details>
    {loaded&&<details className={s.source}><summary>Trajectory source & accuracy</summary><p>NASA/JPL Horizons · solution {loaded.source.solutionId??"not supplied"}. Retrieved {loaded.source.retrievedAt}.</p><p>Sampled trajectory segment: {dateLabel(new Date(loaded.overview.startUtcMs).toISOString().slice(0,10))} – {dateLabel(new Date(loaded.overview.endUtcMs).toISOString().slice(0,10))}.</p><p>The highlighted card is the closest-approach record; the clock shows the currently played frame.</p>{loaded.source.warning&&<p role="status">{loaded.source.warning}</p>}{loaded.source.timeConvention&&<p>{loaded.source.timeConvention}</p>}<a href={loaded.source.url} target="_blank" rel="noreferrer">Open JPL source</a></details>}
    <p className={s.caption}>Encounter records: NASA NeoWs. Trajectories: NASA/JPL Horizons. Planet context: Astronomy Engine. The timeline ends at the last record supplied, not at the end of the asteroid’s journey.</p>
  </div>;
}
