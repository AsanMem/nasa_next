"use client";
import { useEffect,useMemo,useRef,useState } from 'react';
import { posterSvg,skyCredits,photoCredits,type PosterOptions } from '../../lib/sky/poster';
import type { BirthSky } from '../../lib/sky/model';
import s from './birth-sky.module.css';
import orbital from '../orbital/orbital.module.css';
function save(blob:Blob,name:string){const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
export default function SkyPoster({sky,date,time,zone}:{sky:BirthSky;date:string;time:string;zone:string}){
 const [title,setTitle]=useState(''),[style,setStyle]=useState<PosterOptions['style']>('coral'),[lines,setLines]=useState(true),[labels,setLabels]=useState(true),[photos,setPhotos]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const drawing=useRef<HTMLDivElement>(null),alive=useRef(true);
 const options={title,date,time,zone,style,lines,labels,photos};
 const svg=useMemo(()=>posterSvg(sky,{title,date,time,zone,style,lines,labels,photos}),[sky,title,date,time,zone,style,lines,labels,photos]);
 useEffect(()=>{alive.current=true;const clear=()=>delete document.documentElement.dataset.printView;window.addEventListener('afterprint',clear);return()=>{alive.current=false;clear();window.removeEventListener('afterprint',clear);};},[]);
 async function download(kind:'svg'|'png'|'pdf'){
  setBusy(true);setError('');let rendered:HTMLCanvasElement|undefined;
  try{const {embeddedPoster,posterCanvas,opaqueRgb}=await import('../../lib/sky/export-artwork');const source=await embeddedPoster(sky,options);
   if(kind==='svg'){save(new Blob([source],{type:'image/svg+xml'}),'orbital-birth-sky-A3.svg');return;}
   const {canvas,context}=await posterCanvas(source);rendered=canvas;
   const credit=skyCredits+(photos?' '+photoCredits:'');
   if(kind==='pdf'){
    const {posterPdf}=await import('../../lib/sky/pdf');const pixels=context.getImageData(0,0,canvas.width,canvas.height);const rgb=opaqueRgb(pixels.data);
    save(await posterPdf(rgb,canvas.width,canvas.height,`Birth sky above ${sky.location.name}, ${date}, ${time}. ${credit}`),'orbital-birth-sky-A3.pdf');
   }else{
    const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(new Error('Image export failed. Save the vector poster instead.')),'image/png'));
    const {pngWithCredit}=await import('../../lib/sky/png-credit');save(await pngWithCredit(blob,credit),'orbital-birth-sky-A3-300dpi.png');
   }
  }catch(reason){if(alive.current)setError(reason instanceof Error?reason.message:'Could not export the poster. Try again.');}
  finally{if(rendered)rendered.width=rendered.height=1;if(alive.current)setBusy(false);}
 }

 return <section className={s.posterSection} aria-labelledby="poster-heading"><div className={s.posterControls}><h2 id="poster-heading">Make it yours.</h2><p>The map shows stars and planets calculated for your date, time and city.</p><label>Personal message <span>(optional)</span><textarea placeholder="A name or a short dedication" rows={2} maxLength={60} value={title} onChange={e=>{const text=e.target.value.split('\n').slice(0,2).map(line=>line.slice(0,30)).join('\n');setTitle(text);}}/></label><fieldset><legend>Colour</legend><div className={s.swatches}>{(['coral','violet','ink'] as const).map(value=><button key={value} type="button" aria-pressed={style===value} onClick={()=>setStyle(value)}><span data-palette={value}/>{value==='coral'?'Blue & coral':value==='violet'?'Violet':'Midnight'}</button>)}</div></fieldset><label className={s.check}><input type="checkbox" checked={lines} onChange={e=>setLines(e.target.checked)}/>Constellation lines</label><label className={s.check}><input type="checkbox" checked={labels} onChange={e=>setLabels(e.target.checked)}/>Star & planet names</label><label className={s.check}><input type="checkbox" checked={photos} onChange={e=>setPhotos(e.target.checked)}/>Deep-space photographs</label><p className={s.note}>The photographs are telescope portraits from 2022 and 2005, added as artwork around your map.</p><div className={s.exports}><button className={orbital.button} disabled={busy} onClick={()=>void download('pdf')}>{busy?'Preparing artwork…':'Download PDF'}</button><button type="button" disabled={busy} onClick={()=>void download('png')}>Save print image</button><button type="button" disabled={busy} onClick={()=>void download('svg')}>Save vector poster</button><button type="button" onClick={()=>{document.documentElement.dataset.printView='sky';window.print();}}>Print poster</button></div><p className={s.note}>PDF: one A3 page, 297 × 420 mm, 300 dpi, no added margins. Give the PDF to your print shop at its original size. PNG and SVG are also available.</p>{error&&<p role="alert">{error}</p>}</div><div className={s.artwork} ref={drawing} data-sky-poster="true" dangerouslySetInnerHTML={{__html:svg}}/></section>;
}
