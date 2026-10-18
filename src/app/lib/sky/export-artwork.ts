import { posterSvg,type PosterOptions } from './poster';
import type { BirthSky } from './model';
async function inline(path:string,mime:string){const response=await fetch(path);if(!response.ok)throw new Error('A poster asset could not be loaded. Try again, or turn off deep-space photographs.');const bytes=new Uint8Array(await response.arrayBuffer());let binary='';for(let i=0;i<bytes.length;i+=32768)binary+=String.fromCharCode(...Array.from(bytes.subarray(i,i+32768)));return `data:${mime};base64,${btoa(binary)}`;}
/** Export never relies on external fonts or image URLs, and sends no birth details to a server. */
export async function embeddedPoster(sky:BirthSky,options:PosterOptions){
 const [font,carina,whirlpool]=await Promise.all([inline('/media/sky/space-grotesk.woff2','font/woff2'),...(options.photos!==false?[inline('/media/sky/carina.jpg','image/jpeg'),inline('/media/sky/whirlpool.jpg','image/jpeg')]:[])]);
 return posterSvg(sky,{...options,font:font.split(',')[1],photoData:carina&&whirlpool?{carina,whirlpool}:undefined});
}
export async function posterCanvas(source:string){
 const canvas=document.createElement('canvas');canvas.width=3508;canvas.height=4961;
 const context=canvas.getContext('2d',{willReadFrequently:true});if(!context)throw new Error('Print export is unavailable on this device. Save the vector poster instead.');
 const image=new Image(),url=URL.createObjectURL(new Blob([source],{type:'image/svg+xml'}));
 try{image.src=url;await image.decode();context.fillStyle='#ffffff';context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(image,0,0,canvas.width,canvas.height);return {canvas,context};}
 catch{canvas.width=canvas.height=1;throw new Error('The poster could not be rendered. Try again, or turn off deep-space photographs.');}
 finally{image.src='';URL.revokeObjectURL(url);}
}
export function opaqueRgb(pixels:Uint8ClampedArray){const rgb=new Uint8Array(pixels.length/4*3);for(let p=0,q=0;p<pixels.length;p+=4){rgb[q++]=pixels[p];rgb[q++]=pixels[p+1];rgb[q++]=pixels[p+2];}return rgb;}
