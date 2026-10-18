"use client";
import { useCallback,useEffect,useMemo,useRef,useState } from "react";
import type { Approach,HistoryFilter } from "../../lib/asteroids/view-model";
import { dateLabel,filterEncounters,numberLabel } from "../../lib/asteroids/view-model";
import { bodyKey,bodyPalette,clusterEncounters,encounterBodies,encounterTimeline,ENCOUNTER_TRAVEL_MS,journeyPhase,nearestEncounter } from "../../lib/asteroids/encounters";
import type { EncounterMotion,TimelineEvent } from "../../lib/asteroids/encounters";
import { useOrbitalScene } from "../orbital/scene-provider";
import { AsteroidPortrait } from "./comparisons";
import s from "./encounter-story.module.css";

type Props={id:string;diameter:number|null;events:Approach[];selected:Approach|null;today:string;onSelect:(event:Approach)=>void;onActiveChange:(active:boolean)=>void};
export default function EncounterStory({id,diameter,events,selected,today,onSelect,onActiveChange}:Props) {
  const all=useMemo(()=>encounterTimeline(events),[events]);
  const bodies=useMemo(()=>encounterBodies(events),[events]);
  const [filter,setFilter]=useState<HistoryFilter>("all"),[active,setActive]=useState(false),[playing,setPlaying]=useState(false),[tabVisible,setTabVisible]=useState(true),[rate,setRate]=useState(1),[travelling,setTravelling]=useState(false),[slots,setSlots]=useState(7),[group,setGroup]=useState<TimelineEvent[]>([]),[recordsOpen,setRecordsOpen]=useState(false);
  const filtered=useMemo(()=>{const keys=new Set(filterEncounters(events,filter,today).map(event=>event.key));return all.filter(item=>keys.has(item.event.key));},[all,events,filter,today]);
  const current=filtered.find(item=>item.event.key===selected?.key)??filtered[0];
  const scene=useRef<HTMLDivElement>(null),track=useRef<HTMLDivElement>(null),motion=useRef<EncounterMotion|null>(null);
  const labels=useRef(new Map<string,HTMLSpanElement>()),picker=useRef(onSelect),expected=useRef(selected?.key),rateRef=useRef(rate),currentRef=useRef(current);
  picker.current=onSelect;rateRef.current=rate;currentRef.current=current;
  const session=useRef<{signature:string;index:number;elapsed:number}|null>(null);
  const autoplay=useRef(true),yearNode=useRef<HTMLElement>(null),yearValue=useRef<number|null>(null);
  const signature=filtered.map(item=>item.event.key).join("|");
  const projectBodies=useCallback((points:{id:string;x:number;y:number;visible:boolean}[])=>{for(const point of points){const element=labels.current.get(point.id);if(element){element.style.left=point.x+"%";element.style.top=point.y+"%";element.style.visibility=point.visible?"visible":"hidden";}}},[]);
  const sceneConfig=useMemo(()=>({kind:"encounters" as const,id,diameter,paused:!playing,encounter:{bodies,body:current?.event.body??"Unknown body",eventKey:current?.event.key,motion},projectBodies}),[id,diameter,playing,bodies,current?.event.body,current?.event.key,projectBodies]);
  const {host,status,reduced}=useOrbitalScene(sceneConfig,active&&!!current);
  const ready=active&&status==="ready";
  const groups=useMemo(()=>clusterEncounters(filtered,slots),[filtered,slots]);
  const ticks=useMemo(()=>all.map(item=>`M${item.position*1000},0v6`).join(" "),[all]);
  const first=all[0]?.time??0,last=all.at(-1)?.time??first;
  const todayTime=Date.parse(today+"T00:00:00Z"),todayPosition=last===first ? .5 : (todayTime-first)/(last-first);
  function clearMotion(){motion.current=null;session.current=null;yearValue.current=null;setTravelling(false);}
  function pause(){autoplay.current=false;setPlaying(false);}
  function choose(event:Approach){pause();clearMotion();expected.current=event.key;picker.current(event);setGroup([]);}
  useEffect(()=>{
    const target=scene.current;if(!target)return;
    let visible=false;
    const observer=new IntersectionObserver(([entry])=>{if(entry.intersectionRatio>=.25)visible=true;else if(!entry.isIntersecting)visible=false;setActive(visible);onActiveChange(visible);if(!visible)setPlaying(false);},{threshold:[0,.25]});observer.observe(target);
    return()=>{observer.disconnect();onActiveChange(false);};
  },[onActiveChange]);
  useEffect(()=>{const target=track.current;if(!target)return;const observer=new ResizeObserver(()=>setSlots(Math.max(1,Math.floor(target.clientWidth/44))));observer.observe(target);setSlots(Math.max(1,Math.floor(target.clientWidth/44)));return()=>observer.disconnect();},[]);
  useEffect(()=>{const stop=()=>{setTabVisible(!document.hidden);if(document.hidden)setPlaying(false);};const pop=()=>{autoplay.current=false;setPlaying(false);motion.current=null;session.current=null;yearValue.current=null;setTravelling(false);};stop();document.addEventListener("visibilitychange",stop);window.addEventListener("popstate",pop);return()=>{document.removeEventListener("visibilitychange",stop);window.removeEventListener("popstate",pop);};},[]);
  useEffect(()=>{if(active&&tabVisible&&!reduced&&status==="ready"&&filtered.length>1&&autoplay.current)setPlaying(true);else setPlaying(false);},[active,tabVisible,reduced,status,filtered.length]);
  useEffect(()=>{
    if(selected?.key!==expected.current){autoplay.current=false;setPlaying(false);motion.current=null;session.current=null;yearValue.current=null;setTravelling(false);if(selected&&!filtered.some(item=>item.event.key===selected.key))setFilter("all");}
    expected.current=selected?.key;
    // Only an externally changed selection resets playback; the loop sets expected before committing a stop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[selected?.key]);
  useEffect(()=>{
    if(!playing||!active||!tabVisible||reduced||status!=="ready"||filtered.length<2)return;
    let state=session.current;
    if(!state||state.signature!==signature){let index=filtered.findIndex(item=>item.event.key===currentRef.current?.event.key);if(index<0||index===filtered.length-1)index=0;state={signature,index,elapsed:0};session.current=state;expected.current=filtered[index].event.key;picker.current(filtered[index].event);}
    let frame=0,previous=0,cancelled=false;const yearClock=new Date(0);
    const updateMotion=()=>{
      const from=filtered[state!.index],nextIndex=(state!.index+1)%filtered.length,to=filtered[nextIndex],before=filtered[(state!.index+filtered.length-1)%filtered.length];
      const live=motion.current;
      if(!live||live.fromKey!==from.event.key||live.toKey!==to.event.key)motion.current={fromBody:from.event.body,toBody:to.event.body,fromKey:from.event.key,toKey:to.event.key,previousBody:before.event.body,previousKey:before.event.key,progress:0,replaying:nextIndex===0};
      const phase=journeyPhase(state!.elapsed);motion.current!.progress=phase.progress;
      yearClock.setTime(from.time+(to.time-from.time)*phase.progress);const nextYear=yearClock.getUTCFullYear();yearValue.current=nextYear;if(yearNode.current)yearNode.current.textContent=String(nextYear);
    };
    setTravelling(true);updateMotion();
    const tick=(time:number)=>{
      if(cancelled||document.hidden)return;
      const delta=previous?Math.min(100,time-previous):0;previous=time;state!.elapsed+=delta*rateRef.current;
      // Preserve the remainder and the same live path at arrivals, including the last-to-first seam.
      while(state!.elapsed>=ENCOUNTER_TRAVEL_MS){state!.elapsed-=ENCOUNTER_TRAVEL_MS;state!.index=(state!.index+1)%filtered.length;const arrived=filtered[state!.index].event;expected.current=arrived.key;picker.current(arrived);}
      updateMotion();frame=requestAnimationFrame(tick);
    };
    frame=requestAnimationFrame(tick);return()=>{cancelled=true;cancelAnimationFrame(frame);};
  // current selection is read at start and committed only on arrival, never on interpolated years.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[playing,active,tabVisible,reduced,status,signature]);
  function changeFilter(value:HistoryFilter){pause();clearMotion();setGroup([]);setFilter(value);const available=all.filter(item=>filterEncounters([item.event],value,today).length);if(available.length&&!available.some(item=>item.event.key===selected?.key)){const next=nearestEncounter(available,selected?Date.parse(selected.date+"T00:00:00Z"):todayTime);if(next){expected.current=next.event.key;picker.current(next.event);}}}
  const currentIndex=filtered.findIndex(item=>item.event.key===current?.event.key);
  const displayedYear=yearValue.current??current?.event.date.slice(0,4)??"—";
  return <div className={s.story}>
    <div className={s.filters} role="group" aria-label="Filter encounters">{(["all","past","upcoming"] as const).map(value=><button type="button" key={value} aria-pressed={filter===value} onClick={()=>changeFilter(value)}>{value==="all"?"All":value==="past"?"Past":"Upcoming"}</button>)}</div>
    <div ref={scene} className={s.stage} data-history-scene="true" data-ready={ready}>
      <div className={s.fallback} aria-hidden={ready} data-hidden={ready}><div className={s.system}><span className={s.sun}>Sun</span>{bodies.map(body=><span key={body} className={s.body}><i style={{backgroundColor:bodyPalette[bodyKey(body)]?.color??"#8796a5",backgroundImage:bodyKey(body)==="earth"?"url(/media/orbital/earth.jpg)":bodyKey(body)==="moon"?"url(/media/orbital/moon.jpg)":undefined}}/>{body}</span>)}</div><div className={s.staticRock}><AsteroidPortrait id={id} diameter={diameter}/></div></div>
      <div ref={host} className={s.canvas} data-ready={ready} aria-hidden="true"/>
      <div className={s.bodyLabels} aria-hidden="true" data-visible={ready}>{["Sun",...bodies].map(body=><span key={body} ref={element=>{if(element)labels.current.set(body,element);else labels.current.delete(body);}}>{body}</span>)}</div>
      <div className={s.year}><strong ref={yearNode}>{displayedYear}</strong><span>{travelling?motion.current?.replaying?"Replaying the timeline":"Between listed encounters":current?`Approach to ${current.event.body}`:"No encounters in this filter"}</span></div>
      {status==="failed"&&<span className={s.staticNote}>Static view · 3D unavailable</span>}
    </div>
    <p className={s.caption}>Illustrative journey. Positions, sizes and flight paths are not to scale.</p>
    <div className={s.eventCard} aria-live={playing?"off":"polite"}>{current?<><div><span>{travelling?"Last listed encounter":"Selected encounter"} · {current.event.body}</span><time dateTime={current.event.date}>{dateLabel(current.event.date)}</time></div><dl><div><dt>Distance from {current.event.body}</dt><dd>{numberLabel(current.event.distance,0)}{current.event.distance!=null&&<small> km</small>}</dd></div><div><dt>Relative speed</dt><dd>{numberLabel(current.event.speed,2)}{current.event.speed!=null&&<small> km/s</small>}</dd></div></dl></>:<p>No encounters are listed for this filter in NASA’s response.</p>}</div>
    <div className={s.controls}><button type="button" aria-label="Previous encounter" disabled={currentIndex<=0} onClick={()=>choose(filtered[currentIndex-1].event)}>←</button><button type="button" className={s.play} aria-pressed={playing} disabled={!ready||reduced||filtered.length<2} onClick={()=>{setGroup([]);autoplay.current=!playing;setPlaying(value=>!value);}}>{playing?"Pause":"Play journey"}</button><button type="button" aria-label="Next encounter" disabled={currentIndex<0||currentIndex>=filtered.length-1} onClick={()=>choose(filtered[currentIndex+1].event)}>→</button><label><span>Speed</span><select aria-label="Journey playback speed" value={rate} onChange={event=>setRate(Number(event.target.value))}><option value={1}>1×</option><option value={2}>2×</option><option value={4}>4×</option></select></label></div>
    <p className={s.caption}>Continuous flight while in view. Pause to explore a date.</p>
    {reduced&&<p className={s.caption}>Reduced motion: choose an encounter with the arrows or timeline.</p>}
    <div className={s.timeArea} ref={track}>
      <label className={s.rangeLabel} htmlFor={`encounter-time-${id}`}>Explore {all.length} listed encounters</label>
      <input id={`encounter-time-${id}`} className={s.scrubber} type="range" min={first} max={last===first?first+86400000:last} step={86400000} value={current?.time??first} disabled={!filtered.length||all.length<2} aria-valuetext={current?`${dateLabel(current.event.date)}, ${current.event.body}`:"No encounters"} onChange={event=>{const next=nearestEncounter(filtered,Number(event.target.value));if(next)choose(next.event);}} onKeyDown={event=>{const index=event.key==="Home"?0:event.key==="End"?filtered.length-1:event.key==="ArrowRight"||event.key==="ArrowUp"?Math.min(filtered.length-1,currentIndex+1):event.key==="ArrowLeft"||event.key==="ArrowDown"?Math.max(0,currentIndex-1):-1;if(index>=0&&filtered[index]){event.preventDefault();choose(filtered[index].event);}}}/>
      <div className={s.markers}><svg className={s.exactTicks} viewBox="0 0 1000 6" preserveAspectRatio="none" aria-hidden="true"><path d={ticks}/></svg>{todayPosition>=0&&todayPosition<=1&&<span className={s.today} style={{left:`${todayPosition*100}%`}}>Today</span>}{groups.map(items=><button type="button" key={items.items[0].event.key} style={{left:`${items.position*100}%`}} aria-label={items.items.length===1?`Choose ${dateLabel(items.items[0].event.date)}, ${items.items[0].event.body}`:`Choose from ${items.items.length} encounters, ${items.items[0].event.date.slice(0,4)} to ${items.items.at(-1)!.event.date.slice(0,4)}`} aria-pressed={items.items.some(item=>item.event.key===current?.event.key)} onClick={()=>{pause();if(items.items.length===1)choose(items.items[0].event);else setGroup(group[0]?.event.key===items.items[0].event.key?[]:items.items);}}><i/>{items.items.length>1&&<span>{items.items.length}</span>}</button>)}</div>
      <div className={s.endpoints}><span>First listed<br/><strong>{all[0]?.event.date.slice(0,4)??"—"}</strong></span><span>Last listed encounter<br/><strong>{all.at(-1)?.event.date.slice(0,4)??"—"}</strong></span></div>
    </div>
    {!!group.length&&<div className={s.cluster} role="group" aria-label="Choose a grouped encounter"><button className={s.closeGroup} type="button" onClick={()=>setGroup([])}>Close ×</button>{group.map(item=><button type="button" key={item.event.key} onClick={()=>choose(item.event)}><time>{dateLabel(item.event.date)}</time><span>{item.event.body}</span></button>)}</div>}
    <details className={s.records} onToggle={event=>{setRecordsOpen(event.currentTarget.open);if(event.currentTarget.open)pause();}}><summary>View encounter records <span>{filtered.length}</span></summary>{recordsOpen&&<div>{filtered.map(item=><button type="button" key={item.event.key} aria-pressed={current?.event.key===item.event.key} onClick={()=>choose(item.event)}><span>{dateLabel(item.event.date)}<small>{item.event.body}</small></span><span>{numberLabel(item.event.distance,0)}{item.event.distance!=null&&" km"}<small>{numberLabel(item.event.speed,2)}{item.event.speed!=null&&" km/s"}</small></span></button>)}</div>}</details>
    <p className={s.caption}>Source: NASA NeoWs. The timeline ends at the last record supplied, not at the end of the asteroid’s journey.</p>
  </div>;
}
