import { BODY_TONE,PLANETS,planetPosition } from "../../lib/asteroids/physical-planets";
import { sampleTrajectoryTrack } from "../../lib/asteroids/trajectory";
import type { TrajectoryReady } from "../../lib/asteroids/trajectory";
import type { EncounterView } from "../../lib/asteroids/encounter-playback";

/** Static top-down projection of the same coordinates, without a WebGL boundary. */
export default function PhysicalFallback({trajectory,view}:{trajectory:TrajectoryReady;view:EncounterView}) {
  const origin={x:0,y:0,z:0},target={x:0,y:0,z:0},asteroid={x:0,y:0,z:0};
  sampleTrajectoryTrack(trajectory.close.target,trajectory.encounterUtcMs,target);sampleTrajectoryTrack(trajectory.close.asteroid,trajectory.encounterUtcMs,asteroid);
  if(view==="close")Object.assign(origin,target);
  const samples=(view==="close"?trajectory.close:trajectory.overview).asteroid.samples;
  const radius=view==="whole"?35:view==="inner"?6.5:Math.max(1e-5,...samples.map(point=>Math.hypot(point.x-origin.x,point.y-origin.y)))*1.2;
  const x=(value:number)=>300+(value-origin.x)/radius*145,y=(value:number)=>180-(value-origin.y)/radius*145;
  const path=samples.map((point,index)=>`${index?"L":"M"}${x(point.x).toFixed(2)},${y(point.y).toFixed(2)}`).join(" ");
  const bodies=["Sun",...PLANETS].map(name=>{const point={x:0,y:0,z:0};if(name.toLowerCase()===trajectory.body.toLowerCase())Object.assign(point,target);else if(!planetPosition(name,trajectory.encounterUtcMs,point))return null;return {name,...point};}).filter((point):point is {name:string;x:number;y:number;z:number}=>!!point);
  return <svg viewBox="0 0 600 360" role="img" aria-label="Static top-down projection of the JPL trajectory at the selected encounter"><path d={path} fill="none" stroke="#edc18c" strokeWidth="1.5"/>{bodies.filter(point=>Math.abs(x(point.x)-300)<285&&Math.abs(y(point.y)-180)<150).map(point=><g key={point.name}><circle cx={x(point.x)} cy={y(point.y)} r={point.name==="Sun"?5:3} fill={BODY_TONE[point.name]}/><text x={x(point.x)+7} y={y(point.y)+7} fill="#bac8d2" fontSize="22">{point.name}</text></g>)}<circle cx={x(target.x)} cy={y(target.y)} r="4" fill="none" stroke="#edc18c"/><circle cx={x(asteroid.x)} cy={y(asteroid.y)} r="4" fill="#edc18c"/><text x={x(target.x)+8} y={y(target.y)-12} fill="#edc18c" fontSize="22">{trajectory.body}</text><text x={x(asteroid.x)+8} y={y(asteroid.y)+24} fill="#edc18c" fontSize="22">Asteroid</text><text x="18" y="340" fill="#bac8d2" fontSize="22">Top-down projection · markers enlarged</text></svg>;
}
