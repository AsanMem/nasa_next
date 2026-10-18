import { NextResponse } from 'next/server';
import type { SkyLocation } from '../../lib/sky/model';
export const dynamic='force-dynamic';
export async function POST(request:Request){
 const headers={'Cache-Control':'no-store'};
 let query:string;
 try{if(Number(request.headers.get('content-length')||0)>2048)throw new Error();const input=await request.json();query=typeof input.query==='string'?input.query.trim():'';if(query.length<2||query.length>100)throw new Error();}
 catch{return NextResponse.json({error:'Enter a city name (2–100 characters).'}, {status:400,headers});}
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),7000);
 try{
  const url=new URL('https://geocoding-api.open-meteo.com/v1/search');url.search=new URLSearchParams({name:query,count:'7',language:'en',format:'json'}).toString();
  const response=await fetch(url,{signal:controller.signal,cache:'no-store'});if(!response.ok)throw new Error();
  const data=await response.json();
  const locations:SkyLocation[]=(Array.isArray(data.results)?data.results:[]).filter((p:Record<string,unknown>)=>typeof p.name==='string'&&typeof p.timezone==='string'&&Number.isFinite(p.latitude)&&Number.isFinite(p.longitude)&&Math.abs(p.latitude as number)<=90&&Math.abs(p.longitude as number)<=180).map((p:Record<string,unknown>)=>({name:String(p.name),region:String(p.admin1||''),country:String(p.country||''),latitude:p.latitude as number,longitude:p.longitude as number,timezone:p.timezone as string}));
  return NextResponse.json({locations},{headers});
 }catch{return NextResponse.json({error:'City search is unavailable. Try again or enter coordinates below.'},{status:502,headers});}
 finally{clearTimeout(timer);}
}
