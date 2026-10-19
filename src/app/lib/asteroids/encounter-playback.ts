import type { TrajectoryReady } from "./trajectory";
export const FLYBY_MS=8000;
export const TIME_JUMP_MS=1200;
export type EncounterView="inner"|"whole"|"close";
export type PhysicalEncounterFrame={trajectory:TrajectoryReady|null;utcMs:number;phase:"idle"|"flyby"|"jump";progress:number;jumpFromYear?:number;jumpToYear?:number};
export function flybyUtc(trajectory:TrajectoryReady,progress:number){return trajectory.close.startUtcMs+(trajectory.close.endUtcMs-trajectory.close.startUtcMs)*Math.max(0,Math.min(1,progress));}
/** Only the camera zooms. A time jump has no interpolated asteroid state. */
export function encounterZoom(view:EncounterView,phase:PhysicalEncounterFrame["phase"],progress:number){
  if(view==="whole")return 0;
  if(view==="close")return phase==="jump"?1-Math.sin(Math.PI*Math.max(0,Math.min(1,progress)))**2:1;
  if(phase==="jump")return 0;
  return phase==="flyby"?Math.sin(Math.PI*Math.max(0,Math.min(1,progress)))**2:0;
}
