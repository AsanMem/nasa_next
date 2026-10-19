import type { Approach } from "./view-model";
export type TimelineEvent = { event: Approach; time: number; position: number };
export type EncounterMotion = {
  fromBody:string;toBody:string;progress:number;replaying?:boolean;
  fromKey?:string;toKey?:string;previousBody?:string;previousKey?:string;
};
export type FlightVector={x:number;y:number;z:number};
/** A shared endpoint tangent keeps an illustrative flyby moving across record boundaries. */
export function sampleEncounterFlight(out:FlightVector,start:FlightVector,end:FlightVector,startTangent:FlightVector,endTangent:FlightVector,bend:FlightVector,t:number) {
  const t2=t*t,t3=t2*t,a=2*t3-3*t2+1,b=t3-2*t2+t,c=-2*t3+3*t2,d=t3-t2;
  const lift=16*t2*(1-t)*(1-t);
  out.x=a*start.x+b*startTangent.x+c*end.x+d*endTangent.x+lift*bend.x;
  out.y=a*start.y+b*startTangent.y+c*end.y+d*endTangent.y+lift*bend.y;
  out.z=a*start.z+b*startTangent.z+c*end.z+d*endTangent.z+lift*bend.z;
  return out;
}
export function encounterTimeline(events: readonly Approach[]): TimelineEvent[] {
  const ordered=events.map(event=>({event,time:event.utcMs??Date.parse(event.date+"T00:00:00Z")})).filter(item=>Number.isFinite(item.time)).sort((a,b)=>a.time-b.time);
  const first=ordered[0]?.time??0,last=ordered.at(-1)?.time??first;
  return ordered.map(item=>({...item,position:last===first ? .5 : (item.time-first)/(last-first)}));
}
export function nearestEncounter(events: readonly TimelineEvent[],time:number) {
  return events.reduce<TimelineEvent|undefined>((best,item)=>!best||Math.abs(item.time-time)<Math.abs(best.time-time)?item:best,undefined);
}
export function clusterEncounters(events:readonly TimelineEvent[],slots:number) {
  const count=Math.max(1,slots),bins=new Map<number,TimelineEvent[]>();
  for(const item of events){const bin=Math.min(count-1,Math.floor(item.position*count));const items=bins.get(bin)??[];items.push(item);bins.set(bin,items);}
  // Group targets represent equal calendar intervals. Exact event positions are drawn separately.
  return Array.from(bins.entries()).map(([bin,items])=>({items,position:(bin+.5)/count}));
}
export const ENCOUNTER_HOLD_MS=0;
export const ENCOUNTER_TRAVEL_MS=4000;
export function journeyPhase(elapsed:number) { return {progress:Math.max(0,Math.min(1,(elapsed-ENCOUNTER_HOLD_MS)/ENCOUNTER_TRAVEL_MS)),arrived:elapsed>=ENCOUNTER_HOLD_MS+ENCOUNTER_TRAVEL_MS}; }
export const bodyPalette:Record<string,{color:string;kind:number;order:number}>= {
 mercury:{color:"#a99e91",kind:0,order:0},venus:{color:"#d9ba85",kind:1,order:1},earth:{color:"#6595b5",kind:0,order:2},moon:{color:"#b4b1a9",kind:0,order:3},mars:{color:"#bd7960",kind:0,order:4},jupiter:{color:"#c9a581",kind:2,order:5},saturn:{color:"#d5bf8f",kind:2,order:6},uranus:{color:"#8dbfc6",kind:1,order:7},neptune:{color:"#5c81c0",kind:1,order:8},pluto:{color:"#b5a89a",kind:0,order:9},sun:{color:"#f4bb61",kind:1,order:10}
};
export const bodyKey=(body:string)=>body.trim().toLowerCase();
export function encounterBodies(events:readonly Approach[]) {
  return Array.from(new Map(events.map(event=>[bodyKey(event.body),event.body])).values()).filter(body=>bodyKey(body)!=="sun").sort((a,b)=>(bodyPalette[bodyKey(a)]?.order??99)-(bodyPalette[bodyKey(b)]?.order??99)||a.localeCompare(b));
}
/** Fixed illustrative layout, unrelated to orbital elements or ephemerides. */
export function bodyPosition(index:number,count:number):[number,number,number] {
  const angle=-1.05+(count<2?1.05:index*2.1/(count-1)),radius=3.8+index*.85;
  return [Math.cos(angle)*radius,0,Math.sin(angle)*radius];
}
