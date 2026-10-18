import * as A from './vendor/astronomy';
import catalog from './catalog.json';
export type SkyLocation={name:string;region?:string;country:string;latitude:number;longitude:number;timezone:string};
export type SkyPoint={id:string;name:string;altitude:number;azimuth:number;magnitude:number;color:string;body?:boolean};
export type BirthSky={utc:number;location:SkyLocation;stars:SkyPoint[];bodies:SkyPoint[];lines:[SkyPoint,SkyPoint][];sunAltitude:number;moonPhase:number};
const rad=Math.PI/180;
/** Local geometric sky, no refraction. J2000 catalogue proper motion + precession/nutation. */
export function calculateSky(utc:number,location:SkyLocation):BirthSky{
  if(!Number.isFinite(utc)||new Date(utc).getUTCFullYear()<1900||new Date(utc).getUTCFullYear()>2100||!Number.isFinite(location.latitude)||Math.abs(location.latitude)>90||!Number.isFinite(location.longitude)||Math.abs(location.longitude)>180)throw new Error('Choose a date from 1900–2100 and valid coordinates.');
  const date=new Date(utc),time=A.MakeTime(date),observer=new A.Observer(location.latitude,location.longitude,0),rotation=A.Rotation_EQJ_HOR(time,observer);
  const years=(utc-Date.UTC(2000,0,1,12))/(365.25*86400000),byId=new Map<number,SkyPoint>();
  const stars=catalog.stars.map(row=>{
    const [id,name,ra,dec,mag,pmra,pmdec,ci]=row as [number,string,number,number,number,number,number,number];
    const a=ra*15*rad,d=dec*rad,k=rad/3600000*years;
    const x=Math.cos(d)*Math.cos(a)-k*(pmra*Math.sin(a)+pmdec*Math.sin(d)*Math.cos(a));
    const y=Math.cos(d)*Math.sin(a)+k*(pmra*Math.cos(a)-pmdec*Math.sin(d)*Math.sin(a));
    const z=Math.sin(d)+k*pmdec*Math.cos(d);
    const h=A.HorizonFromVector(A.RotateVector(rotation,new A.Vector(x,y,z,time)),'');
    const p:SkyPoint={id:String(id),name,altitude:h.lat,azimuth:h.lon,magnitude:mag,color:ci<0?'#bfdfff':ci<.6?'#e4edff':ci<1.2?'#fff1d3':'#ffca9b'};
    byId.set(id,p);return p;
  });
  const colors:Record<string,string>={Sun:'#ffce70',Moon:'#f4f5ff',Mercury:'#b7cbe0',Venus:'#ffe4bc',Mars:'#ff927c',Jupiter:'#f5cc9b',Saturn:'#f0dfaa',Uranus:'#a2e8e7',Neptune:'#849fff'};
  const bodies=Object.keys(colors).map(name=>{const body=name as A.Body,e=A.Equator(body,date,observer,true,true),h=A.Horizon(date,observer,e.ra,e.dec,'');return {id:name,name,body:true,altitude:h.altitude,azimuth:h.azimuth,magnitude:A.Illumination(body,date).mag,color:colors[name]};});
  const lines=catalog.lines.flatMap(([a,b])=>{const start=byId.get(a),end=byId.get(b);return start&&end?[[start,end] as [SkyPoint,SkyPoint]]:[];});
  return {utc,location,stars,bodies,lines,sunAltitude:bodies[0].altitude,moonPhase:A.MoonPhase(date)};
}
