export const AU_KM=149597870.7;
export const PLANETS=["Mercury","Venus","Earth","Mars","Jupiter","Saturn","Uranus","Neptune"] as const;
export type PlanetName=typeof PLANETS[number];
export const SYSTEM_BODIES=["Sun",...PLANETS,"Moon"];
/** Volumetric mean radii, km. Positions and surface sizes are separate from screen markers. */
export const BODY_RADIUS_KM:Record<string,number>={Sun:695700,Mercury:2439.7,Venus:6051.8,Earth:6371,Moon:1737.4,Mars:3389.5,Jupiter:69911,Saturn:58232,Uranus:25362,Neptune:24622,Pluto:1188.3};
export const BODY_TONE:Record<string,string>={Sun:"#ffcc75",Mercury:"#a99e91",Venus:"#d9ba85",Earth:"#6595b5",Moon:"#b4b1a9",Mars:"#bd7960",Jupiter:"#c9a581",Saturn:"#d5bf8f",Uranus:"#8dbfc6",Neptune:"#5c81c0",Pluto:"#b5a89a"};
export type Cartesian={x:number;y:number;z:number};
type Astronomy=typeof import("../sky/vendor/astronomy");
let astronomy:Astronomy|undefined,loading:Promise<void>|undefined;
export function preparePlanetEphemeris(){
  if(astronomy)return Promise.resolve();
  return loading??=import("../sky/vendor/astronomy").then(module=>{astronomy=module;}).catch(error=>{loading=undefined;throw error;});
}
/** Geometric heliocentric J2000 ecliptic AU, at the same UTC as the JPL frame. */
export function planetPosition(name:string,utcMs:number,out:Cartesian):boolean {
  if(!astronomy||!Number.isFinite(utcMs)||!SYSTEM_BODIES.includes(name))return false;
  const A=astronomy;
  const equatorial=A.HelioVector(name as import("../sky/vendor/astronomy").Body,new Date(utcMs));
  const ecliptic=A.RotateVector(A.Rotation_EQJ_ECL(),equatorial);
  out.x=ecliptic.x;out.y=ecliptic.y;out.z=ecliptic.z;return true;
}
export function planetPeriodDays(name:PlanetName){return astronomy?.PlanetOrbitalPeriod(name as import("../sky/vendor/astronomy").Body)??0;}
/** Ecliptic north becomes Three's up axis without mirroring the handedness. */
export function eclipticToScene(out:Cartesian,point:Cartesian,origin:Cartesian){out.x=point.x-origin.x;out.y=point.z-origin.z;out.z=origin.y-point.y;return out;}
