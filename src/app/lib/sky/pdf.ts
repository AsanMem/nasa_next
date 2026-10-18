/** One full-bleed A3 sheet. Lossless RGB art at 300 dpi, no font substitution or print-dialog margins. */
export const A3_POINTS=[297/25.4*72,420/25.4*72] as const;
export async function posterPdf(rgb:Uint8Array,width:number,height:number,description:string):Promise<Blob>{
 if(!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1||width*height>40_000_000||rgb.length!==width*height*3)throw new Error('Invalid poster image.');
 const encoder=new TextEncoder(),bytes=(value:string)=>encoder.encode(value);
 const compressed=typeof CompressionStream!=='undefined';
 const image=compressed?new Uint8Array(await new Response(new Blob([rgb]).stream().pipeThrough(new CompressionStream('deflate'))).arrayBuffer()):rgb;
 const [w,h]=A3_POINTS,page=`0 0 ${w.toFixed(6)} ${h.toFixed(6)}`;
 const parts:Uint8Array[]=[new Uint8Array([37,80,68,70,45,49,46,55,10,37,226,227,207,211,10])],offsets:number[]=[0];let length=parts[0].length;
 const add=(value:Uint8Array)=>{parts.push(value);length+=value.length;};
 function object(id:number,text:string,data?:Uint8Array){offsets[id]=length;add(bytes(`${id} 0 obj\n${text}`));if(data){add(bytes(`\nstream\n`));add(data);add(bytes('\nendstream'));}add(bytes('\nendobj\n'));}
 function utf16(value:string){let hex='FEFF';for(let i=0;i<value.length;i++)hex+=value.charCodeAt(i).toString(16).padStart(4,'0');return `<${hex}>`;}
 const escaped=description.replace(/[<>&]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]!));
 const xmp=bytes(`<?xpacket begin="\ufeff" id="W5M0MpCehiHzreSzNTczkc9d"?><x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description rdf:about="" xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title><rdf:Alt><rdf:li xml:lang="x-default">Orbital birth sky poster</rdf:li></rdf:Alt></dc:title><dc:description><rdf:Alt><rdf:li xml:lang="x-default">${escaped}</rdf:li></rdf:Alt></dc:description></rdf:Description></rdf:RDF></x:xmpmeta><?xpacket end="w"?>`);
 object(1,'<< /Type /Catalog /Pages 2 0 R /Metadata 6 0 R >>');
 object(2,'<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
 object(3,`<< /Type /Page /Parent 2 0 R /MediaBox [${page}] /CropBox [${page}] /TrimBox [${page}] /BleedBox [${page}] /Resources << /XObject << /Art 4 0 R >> >> /Contents 5 0 R >>`);
 object(4,`<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Interpolate false ${compressed?'/Filter /FlateDecode ':''}/Length ${image.length} >>`,image);
 const paint=bytes(`q\n${w.toFixed(6)} 0 0 ${h.toFixed(6)} 0 0 cm\n/Art Do\nQ\n`);object(5,`<< /Length ${paint.length} >>`,paint);
 object(6,`<< /Type /Metadata /Subtype /XML /Length ${xmp.length} >>`,xmp);
 object(7,`<< /Title ${utf16('Orbital - Your birth sky')} /Author ${utf16('Asan Memetov / Orbital')} /Subject ${utf16(description)} /Creator (Orbital) >>`);
 const xref=length;add(bytes('xref\n0 8\n0000000000 65535 f \n'));for(let i=1;i<=7;i++)add(bytes(`${String(offsets[i]).padStart(10,'0')} 00000 n \n`));add(bytes(`trailer\n<< /Size 8 /Root 1 0 R /Info 7 0 R >>\nstartxref\n${xref}\n%%EOF\n`));
 return new Blob(parts,{type:'application/pdf'});
}
