import type { EonetEvent } from '../nasa/eonet';
import { resolveEonetLocation } from '../nasa/eonet-location';
import { sourceTime } from './dates';
export function eventObservations(event: EonetEvent) {
  return (event.geometry || []).map((geometry,index) => ({ geometry,index,location:resolveEonetLocation([geometry]),time:sourceTime(geometry.date) }))
    .sort((a,b) => (b.time ?? -Infinity)-(a.time ?? -Infinity));
}
export function latestObservation(event: EonetEvent) { const observations=eventObservations(event); return observations.find(item=>item.location)||observations[0]; }
export type EventSort = 'latest' | 'oldest' | 'title';
export function sortEvents(events: EonetEvent[], sort: EventSort) {
  return [...events].sort((a, b) => {
    const first = eventObservations(a)[0]?.time ?? null, second = eventObservations(b)[0]?.time ?? null;
    if (first === null && second !== null) return 1;
    if (second === null && first !== null) return -1;
    if (sort !== 'title' && first !== null && second !== null && first !== second) return sort === 'oldest' ? first - second : second - first;
    return a.title.localeCompare(b.title, 'en') || a.id.localeCompare(b.id);
  });
}
export type MapPoint = { id:string; latitude:number; longitude:number; title:string; category:string };
export function angularDistance(a:MapPoint,b:MapPoint) {
  const r=Math.PI/180;
  return Math.acos(Math.max(-1,Math.min(1,Math.sin(a.latitude*r)*Math.sin(b.latitude*r)+Math.cos(a.latitude*r)*Math.cos(b.latitude*r)*Math.cos((a.longitude-b.longitude)*r))))/r;
}
export function clusterPoints(points:MapPoint[],threshold=8):MapPoint[][] {
  const clusters:MapPoint[][]=[];
  for(const point of points) { const cluster=clusters.find(group=>group.every(other=>angularDistance(point,other)<=threshold)); if(cluster) cluster.push(point); else clusters.push([point]); }
  return clusters;
}
