import type { EonetEvent } from '../nasa/eonet';
import { resolveEonetLocation } from '../nasa/eonet-location';
import { sourceTime } from './dates';
export function eventObservations(event: EonetEvent) {
  return (event.geometry || []).map((geometry,index) => ({ geometry,index,location:resolveEonetLocation([geometry]),time:sourceTime(geometry.date) }))
    .sort((a,b) => (b.time ?? -Infinity)-(a.time ?? -Infinity));
}
export function latestObservation(event: EonetEvent) { const observations=eventObservations(event); return observations.find(item=>item.location)||observations[0]; }
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
