export type CivilTime = { date: string; time: string; zone: string };
/** Resolve civil clock time with IANA historical rules; never guess across DST folds/gaps. */
export function resolveCivilTime({date,time,zone}:CivilTime):number[]{
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!/^\d{2}:\d{2}$/.test(time))return [];
  const [year,month,day]=date.split('-').map(Number),[hour,minute]=time.split(':').map(Number);
  const wall=Date.UTC(year,month-1,day,hour,minute),check=new Date(wall);
  if(year<1900||year>2100||check.getUTCMonth()!==month-1||check.getUTCDate()!==day||hour>23||minute>59)return [];
  const formatter=new Intl.DateTimeFormat('en-GB',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
  function at(stamp:number){const p=Object.fromEntries(formatter.formatToParts(stamp).map(part=>[part.type,part.value]));return Date.UTC(+p.year,+p.month-1,+p.day,+p.hour,+p.minute,+p.second);}
  const offsets=new Set<number>();
  for(let h=-48;h<=48;h+=6){const probe=wall+h*3600000;offsets.add(at(probe)-probe);}
  return Array.from(offsets).map(offset=>wall-offset).filter(stamp=>at(stamp)===wall).sort((a,b)=>a-b);
}
export function utcOffset(stamp:number,zone:string){return new Intl.DateTimeFormat('en',{timeZone:zone,timeZoneName:'longOffset',hour:'2-digit'}).formatToParts(stamp).find(p=>p.type==='timeZoneName')?.value||zone;}
