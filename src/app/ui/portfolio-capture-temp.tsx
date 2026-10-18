"use client";
import { useEffect, useRef, useState } from "react";

export default function PortfolioCapture() {
  const [name,setName]=useState("01-earth-moon"),[status,setStatus]=useState("Ready"),[busy,setBusy]=useState(false),[visible,setVisible]=useState(true);
  const clean=useRef(()=>{});
  useEffect(()=>{const toggle=(event:KeyboardEvent)=>{if(event.key==="F8")setVisible(value=>!value);};window.addEventListener("keydown",toggle);return()=>{window.removeEventListener("keydown",toggle);clean.current();};},[]);
  async function record(){
    const source=document.querySelector<HTMLCanvasElement>("[data-history-scene][data-ready=true] canvas")??document.querySelector<HTMLCanvasElement>("[data-visual-id] [data-ready=true] canvas")??document.querySelector<HTMLCanvasElement>("canvas");
    if(!source){setStatus("Scene is not ready");return;}
    const rect=source.getBoundingClientRect();
    if(rect.bottom<=0||rect.top>=innerHeight){setStatus("Scroll to the scene first");return;}
    setBusy(true);setStatus("Recording…");await document.fonts.ready;
    const width=Math.floor(Math.min(1280,source.width)/2)*2,scale=width/rect.width;
    const sceneHeight=Math.floor(rect.height*scale/2)*2,footer=40,output=document.createElement("canvas");output.width=width;output.height=sceneHeight+footer;
    const context=output.getContext("2d",{alpha:false})!;
    const stream=output.captureStream(30);
    const mimeType=["video/webm;codecs=vp9","video/webm;codecs=vp8","video/webm"].find(value=>MediaRecorder.isTypeSupported(value));
    const recorder=new MediaRecorder(stream,{mimeType,videoBitsPerSecond:4_000_000}),chunks:BlobPart[]=[];
    let frame=0,done=false,started=performance.now();
    const history=source.closest("[data-history-scene]");
    const caption=history?"Illustrative journey. Positions, sizes and flight paths are not to scale.":name.includes("earth")?"Earth & Moon · Illustrative view":name.includes("solar")?"Illustrative Sun–Earth environment · Not a measurement of current solar activity":"Artistic asteroid reconstruction · NASA ID determines its appearance";
    const text=(element:Element)=>{const style=getComputedStyle(element);if(style.visibility==="hidden"||style.display==="none")return;const box=element.getBoundingClientRect(),size=parseFloat(style.fontSize)*scale;context.font=`${style.fontWeight} ${size}px ${style.fontFamily}`;context.fillStyle=style.color;context.textBaseline="top";context.fillText(element.textContent??"",(box.left-rect.left)*scale,(box.top-rect.top)*scale);};
    const draw=()=>{if(done)return;context.fillStyle="#030609";context.fillRect(0,0,output.width,output.height);context.drawImage(source,0,0,width,sceneHeight);
      if(history){const year=history.querySelector("strong");if(year){text(year);if(year.nextElementSibling)text(year.nextElementSibling);}history.querySelectorAll("[class*=bodyLabels] > span").forEach(text);}
      context.fillStyle="#a8b3bf";context.font=`${Math.max(11,Math.min(14,width/70))}px Space Grotesk, sans-serif`;context.textBaseline="middle";context.fillText(caption,16,sceneHeight+footer/2,width-32);frame=requestAnimationFrame(draw);};
    recorder.ondataavailable=event=>{if(event.data.size)chunks.push(event.data);};
    recorder.onstop=async()=>{done=true;cancelAnimationFrame(frame);stream.getTracks().forEach(track=>track.stop());setStatus("Saving…");try{const durationMs=performance.now()-started;const result=await fetch(`/api/portfolio-capture?name=${encodeURIComponent(name)}`,{method:"POST",headers:{"Content-Type":"video/webm","x-capture-width":String(width),"x-capture-height":String(output.height),"x-capture-duration-ms":String(Math.round(durationMs))},body:new Blob(chunks,{type:"video/webm"})});if(!result.ok)throw Error(String(result.status));setStatus("Saved "+name);}catch(error){setStatus("Save failed: "+String(error));}finally{output.width=output.height=0;setBusy(false);}};
    draw();started=performance.now();recorder.start(250);const timer=setTimeout(()=>recorder.stop(),name.includes("journey")?16000:10000);
    clean.current=()=>{clearTimeout(timer);done=true;cancelAnimationFrame(frame);if(recorder.state!=="inactive")recorder.stop();stream.getTracks().forEach(track=>track.stop());};
  }
  if(!visible)return null;
  return <aside aria-label="Portfolio capture" style={{position:"fixed",right:12,bottom:12,zIndex:10000,padding:10,border:"1px solid #66717c",borderRadius:8,color:"#edf1f4",background:"#08111a",font:"12px sans-serif",display:"flex",gap:8,alignItems:"center"}}><select aria-label="Portfolio clip" disabled={busy} value={name} onChange={event=>setName(event.target.value)} style={{background:"#08111a",color:"white",padding:7}}><option value="01-earth-moon">Earth & Moon</option><option value="02-asteroid-3d">Asteroid</option><option value="03-encounter-journey">Encounter journey</option><option value="04-solar-weather">Solar weather</option></select><button type="button" disabled={busy} onClick={()=>void record()} style={{background:"#edc18c",color:"#08111a",padding:10,borderRadius:6}}>Record scene</button><span role="status">{status}</span><button type="button" onClick={()=>setVisible(false)}>Hide capture tools</button></aside>;
}
