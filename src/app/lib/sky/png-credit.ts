/** PNG iTXt is standard UTF-8 metadata; keep source/licence attached to exported art. */
export async function pngWithCredit(blob:Blob,credit:string){
 const bytes=new Uint8Array(await blob.arrayBuffer());
 function chunk(name:string,body:Uint8Array){const type=new TextEncoder().encode(name),data=new Uint8Array(body.length+12),view=new DataView(data.buffer);view.setUint32(0,body.length);data.set(type,4);data.set(body,8);let crc=0xffffffff;for(let i=4;i<data.length-4;i++){crc^=data[i];for(let k=0;k<8;k++)crc=crc&1?(crc>>>1)^0xedb88320:crc>>>1;}view.setUint32(data.length-4,(crc^0xffffffff)>>>0);return data;}
 const density=new Uint8Array(9),densityView=new DataView(density.buffer);densityView.setUint32(0,11811);densityView.setUint32(4,11811);density[8]=1;
 const parts:Uint8Array[]=[bytes.slice(0,8)],view=new DataView(bytes.buffer);
 for(let offset=8;offset<bytes.length-12;){const length=view.getUint32(offset),type=new TextDecoder().decode(bytes.slice(offset+4,offset+8));if(type!=='pHYs')parts.push(bytes.slice(offset,offset+length+12));if(type==='IHDR')parts.push(chunk('pHYs',density));offset+=length+12;}
 parts.push(chunk('iTXt',new TextEncoder().encode(`Description\0\0\0\0\0${credit}`)),bytes.slice(bytes.length-12));
 return new Blob(parts,{type:'image/png'});
}
