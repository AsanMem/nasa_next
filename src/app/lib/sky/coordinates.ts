import type { SkyPoint } from './model';
const rad=Math.PI/180;
/** Zenith stereographic projection: north up, east left, looking up from the ground. */
export function projectSky(point:Pick<SkyPoint,'altitude'|'azimuth'>){const radius=Math.tan((90-point.altitude)*rad/2);return {x:-radius*Math.sin(point.azimuth*rad),y:-radius*Math.cos(point.azimuth*rad)};}
export function skyVector(point:Pick<SkyPoint,'altitude'|'azimuth'>){const a=point.altitude*rad,z=point.azimuth*rad;return [Math.cos(a)*Math.sin(z),Math.sin(a),-Math.cos(a)*Math.cos(z)] as const;}
export function skyLight(altitude:number){return altitude>=0?'Daylight':altitude>=-18?'Twilight':'Night';}
