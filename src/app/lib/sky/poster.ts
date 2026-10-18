import type { BirthSky, SkyPoint } from './model';
import { projectSky } from './coordinates';
export type PosterStyle='coral'|'violet'|'ink';
export type PosterOptions={title:string;date:string;time:string;zone:string;style:PosterStyle;lines:boolean;labels:boolean;font?:string;photos?:boolean;photoData?:{carina:string;whirlpool:string}};
export const photoCredits='Optional artwork photographs: Carina Nebula / Cosmic Cliffs, Webb, observed 3 June 2022, NASA, ESA, CSA, STScI; https://science.nasa.gov/asset/webb/cosmic-cliffs-in-the-carina-nebula-nircam-image/ . Whirlpool Galaxy / M51, Hubble, January 2005, NASA, ESA, S. Beckwith (STScI), and The Hubble Heritage Team (STScI/AURA); https://science.nasa.gov/asset/hubble/out-of-this-whirl-the-whirlpool-galaxy-m51-and-companion-galaxy/ . Photographs are decorative telescope portraits from their stated years, separate from the calculated birth-sky chart.';
const palettes={coral:{base:'#091f3d',top:'#224f72',glow:'#55cbd8',accent:'#ff785f',second:'#d74861',ink:'#fff2de'},violet:{base:'#131b3d',top:'#3a2675',glow:'#8a9eff',accent:'#ffa08c',second:'#c247a1',ink:'#fff2ed'},ink:{base:'#08131c',top:'#173749',glow:'#62a8b7',accent:'#d1ba8d',second:'#425f70',ink:'#f1eadb'}};
export const skyCredits='Star data: HYG v4.1, David Nash / Astronexus; constellation line data: Stellarium modern skyculture. Data and derived chart: CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/). Calculations: Astronomy Engine 2.1.19, Don Cross (MIT). Artwork: Orbital / Asan Memetov. https://github.com/astronexus/HYG-Database ; https://github.com/Stellarium/stellarium/tree/master/skycultures/modern ; https://github.com/cosinekitty/astronomy .';
export function xml(value:string){return value.replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]!));}
function n(value:number){return value.toFixed(2);}
export function posterSvg(sky:BirthSky,options:PosterOptions){
 const p=palettes[options.style],cx=420,cy=437,r=369;
 const pos=(point:SkyPoint)=>{const q=projectSky(point);return {x:cx+q.x*r,y:cy+q.y*r};};
 const labelFits=(x:number,y:number,name:string,size:number)=>{const width=name.length*size*.86;return [[x,y-size],[x+width,y-size],[x,y+size*.3],[x+width,y+size*.3]].every(([a,b])=>Math.hypot(a-cx,b-cy)<r-5);};
 const circle=(point:SkyPoint)=>{const q=pos(point),size=Math.max(.45,2.8-point.magnitude*.36);return `<circle cx="${n(q.x)}" cy="${n(q.y)}" r="${n(size)}" fill="${point.color}" opacity="${point.magnitude>5.5?.68:.95}"/>`;};
 const stars=sky.stars.filter(point=>point.altitude>=0&&point.magnitude<=6.5).map(circle).join('');
 const paths=options.lines?sky.lines.filter(([a,b])=>a.altitude>=0&&b.altitude>=0).map(([a,b])=>{const u=pos(a),v=pos(b);return `M${n(u.x)},${n(u.y)}L${n(v.x)},${n(v.y)}`;}).join(''):'';
 const bodyLabels=sky.bodies.filter(b=>b.altitude>=0).map(b=>{const q=pos(b),label=options.labels&&Math.hypot(q.x-cx,q.y-cy)<r-34&&labelFits(q.x+12,q.y+4,b.name,12);return `<circle cx="${n(q.x)}" cy="${n(q.y)}" r="${b.name==='Sun'?5:b.name==='Moon'?4.5:3}" fill="${b.color}"/><circle cx="${n(q.x)}" cy="${n(q.y)}" r="9" fill="none" stroke="${b.color}" stroke-opacity=".45" stroke-width=".6"/>${label?`<text x="${n(q.x+12)}" y="${n(q.y+4)}" font-size="12" fill="${p.ink}">${xml(b.name)}</text>`:''}`;}).join('');
 const occupied:{x:number;y:number}[]=sky.bodies.filter(b=>b.altitude>=0).map(pos);
 const names=options.labels?sky.stars.filter(s=>s.altitude>6&&s.magnitude<1.8&&s.name).sort((a,b)=>a.magnitude-b.magnitude).flatMap(star=>{const q=pos(star);if(Math.hypot(q.x-cx,q.y-cy)>r-50||!labelFits(q.x+9,q.y-8,star.name,10)||occupied.some(v=>Math.hypot(v.x-q.x,v.y-q.y)<65))return [];occupied.push(q);return [`<text x="${n(q.x+9)}" y="${n(q.y-8)}" fill="${p.ink}" opacity=".65" font-size="10">${xml(star.name)}</text>`];}).join(''):'';
 const date=new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(`${options.date}T12:00:00Z`));
 const title=options.title.trim().split('\n').slice(0,2).map(t=>t.slice(0,30));
 const city=[sky.location.name,sky.location.country].filter(Boolean).join(', ');
 const coords=`${Math.abs(sky.location.latitude).toFixed(2)}° ${sky.location.latitude<0?'S':'N'}  /  ${Math.abs(sky.location.longitude).toFixed(2)}° ${sky.location.longitude<0?'W':'E'}`;

 const photos=options.photos!==false,carina=xml(options.photoData?.carina||'/media/sky/carina.jpg'),whirlpool=xml(options.photoData?.whirlpool||'/media/sky/whirlpool.jpg');
 const credits=skyCredits+(photos?' '+photoCredits:'');
 function text(value:string,x:number,y:number,size:number,width:number,extra=''){
  // Conservative maximum glyph width constrains even long unbroken names; no text may leave its column.
  const fit=value.length*size*.82>width?` textLength="${width}" lengthAdjust="spacingAndGlyphs"`:'';
  return `<text x="${x}" y="${y}" font-size="${size}"${fit} ${extra}>${xml(value)}</text>`;
 }
 const place=sky.location.name,placeLines:string[]=[];let line='';
 for(const word of place.split(/\s+/)){if((line+' '+word).trim().length>20&&line){placeLines.push(line);line=word;}else line=(line+' '+word).trim();}if(line)placeLines.push(line);
 const nameLines=placeLines.slice(0,2);if(placeLines.length>2)nameLines[1]=nameLines[1].slice(0,17)+'…';
 const second=nameLines.length>1,citySize=second?38:54;
 const cityArt=nameLines.map((line,i)=>text(line,54,933+i*44,citySize,377,'font-weight="500" letter-spacing="-1.8"')).join('');
 const countryY=second?1004:963,dateY=second?1038:1006,timeY=second?1067:1038,coordsY=second?1092:1068;
 return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="297mm" height="420mm" viewBox="0 0 840 1188" role="img" aria-labelledby="sky-title sky-desc"><title id="sky-title">Your birth sky above ${xml(city)} — ${xml(date)}</title><desc id="sky-desc">Calculated sky above ${xml(city)} on ${xml(date)} at ${xml(options.time)} (${xml(options.zone)}). North up, east left, zenith at centre. Stars shown even in daylight. ${xml(credits)}</desc><metadata>${xml(credits)}</metadata><defs>
 <style>@font-face{font-family:Poster;src:url(${options.font?`data:font/woff2;base64,${options.font}`:'/media/sky/space-grotesk.woff2'}) format('woff2');font-weight:400 600;}text{font-family:Poster,Arial,sans-serif}</style>
 <linearGradient id="paper" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="${p.top}"/><stop offset=".6" stop-color="${p.base}"/><stop offset="1" stop-color="#060e25"/></linearGradient>
 <radialGradient id="light"><stop stop-color="${p.glow}" stop-opacity=".8"/><stop offset="1" stop-color="${p.glow}" stop-opacity="0"/></radialGradient>
 <linearGradient id="ribbon" x1="0" y1="1" x2="1" y2="0"><stop stop-color="${p.second}"/><stop offset=".5" stop-color="${p.accent}"/><stop offset="1" stop-color="#ffd7a7"/></linearGradient>
 <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${p.base}" stop-opacity=".46"/><stop offset=".65" stop-color="${p.base}" stop-opacity=".83"/><stop offset="1" stop-color="#060e25"/></linearGradient>
 <radialGradient id="dome"><stop stop-color="#16345a"/><stop offset=".7" stop-color="#0b2042"/><stop offset="1" stop-color="#07192e"/></radialGradient>
 <clipPath id="dome-clip"><circle cx="420" cy="437" r="369"/></clipPath>
 </defs><rect width="840" height="1188" fill="url(#paper)"/>
 ${photos?`<image href="${carina}" x="0" y="0" width="840" height="1188" preserveAspectRatio="xMidYMid slice" opacity=".38"/><rect width="840" height="1188" fill="url(#shade)"/>`:''}
 <ellipse cx="770" cy="310" rx="420" ry="570" fill="url(#light)" opacity=".6"/>
 <path d="M-110 1010C50 772 210 856 340 839C553 812 715 714 889 415L955 568C745 892 545 948 284 917C105 895 42 1067-70 1242Z" fill="url(#ribbon)"/>
 <text x="54" y="44" fill="${p.ink}" font-size="13">The sky above your birthplace</text>
 <g transform="translate(727 33)" fill="none" stroke="${p.ink}" stroke-width="1.5"><circle cx="0" cy="0" r="9"/><ellipse rx="16" ry="4" transform="rotate(-35)"/><circle cx="13" cy="-8" r="2" fill="${p.accent}" stroke="none"/></g><text x="749" y="37" fill="${p.ink}" font-size="12">Orbital</text>
 <circle cx="420" cy="437" r="384" fill="#000" fill-opacity=".18"/>
 <circle cx="420" cy="437" r="380" fill="none" stroke="${p.ink}" stroke-opacity=".23" stroke-width=".7"/>
 <circle cx="420" cy="437" r="373" fill="none" stroke="${p.accent}" stroke-opacity=".9" stroke-width="1"/>
 <circle cx="420" cy="437" r="369" fill="url(#dome)"/>
 <g fill="${p.ink}" font-size="11" text-anchor="middle"><text x="420" y="51">N</text><text x="420" y="833">S</text><text x="26" y="441">E</text><text x="814" y="441">W</text></g>
 <g clip-path="url(#dome-clip)"><g fill="none" stroke="${p.glow}" stroke-width=".5" opacity=".13"><circle cx="420" cy="437" r="98.9"/><circle cx="420" cy="437" r="213"/><path d="M51 437H789M420 68V806"/></g><path d="${paths}" fill="none" stroke="${p.glow}" stroke-opacity=".3" stroke-width=".65"/>${stars}${names}${bodyLabels}</g>
 <g fill="${p.ink}"><text x="54" y="875" font-size="28" font-weight="500" letter-spacing="-.8">Your birth sky</text>${cityArt}${text(sky.location.country,56,countryY,14,374,'fill-opacity=".72"')}${text(date,54,dateY,25,377)}<text x="56" y="${timeY}" font-size="19">${xml(options.time)}</text><text x="56" y="${coordsY}" fill-opacity=".65" font-size="11">${xml(coords)}</text>${title.filter(Boolean).map((line,i)=>text(line,56,1120+i*23,17,365,'fill-opacity=".9"')).join('')}</g>
 ${photos?`<g transform="translate(479 885) rotate(-8)"><path d="M5 7H239V175H5Z" fill="#020915" fill-opacity=".7"/><path d="M0 0H231L237 5V170L231 166H0Z" fill="#14243a"/><image href="${carina}" width="230" height="133" preserveAspectRatio="xMidYMid slice"/><path d="M0 0H230V166H0Z" fill="none" stroke="#d6dfe7" stroke-opacity=".3" stroke-width=".6"/><text x="10" y="148" fill="${p.ink}" font-size="11">Carina Nebula</text><text x="10" y="160" fill="#b7cadb" font-size="8">Webb · 2022</text></g>
 <g transform="translate(604 988) rotate(6)"><path d="M5 6H188V161H5Z" fill="#020915" fill-opacity=".7"/><path d="M0 0H180L185 4V156L180 152H0Z" fill="#14243a"/><image href="${whirlpool}" width="179" height="124" preserveAspectRatio="xMidYMid slice"/><path d="M0 0H179V154H0Z" fill="none" stroke="#d6dfe7" stroke-opacity=".3" stroke-width=".6"/><text x="9" y="138" fill="${p.ink}" font-size="10.5">Whirlpool Galaxy</text><text x="9" y="150" fill="#b7cadb" font-size="8">Hubble · 2005</text></g><text x="473" y="1171" fill="${p.ink}" fill-opacity=".65" font-size="9">Deep-space photographs</text>`:''}
 </svg>`;
}
