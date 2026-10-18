const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const cache=new Map();
function load(relative,overrides={}){const file=path.resolve(__dirname,'../src/app',relative);if(cache.has(file)&&!Object.keys(overrides).length)return cache.get(file);if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));const exports={};if(!Object.keys(overrides).length)cache.set(file,exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,{exports,console,Intl,Date,Math,Number,Set,Map,URL,URLSearchParams,TextEncoder,TextDecoder,Uint8Array,DataView,Blob,AbortController,setTimeout,clearTimeout,...overrides,require(name){if(name.startsWith('.')){const base=path.resolve(path.dirname(file),name),target=['','.ts','.js','.json'].map(e=>base+e).find(p=>fs.existsSync(p)&&fs.statSync(p).isFile());return load(path.relative(path.resolve(__dirname,'../src/app'),target));}return require(name);}});return exports;}
const time=load('lib/sky/time.ts'),model=load('lib/sky/model.ts'),coords=load('lib/sky/coordinates.ts'),poster=load('lib/sky/poster.ts');
const berlin={name:'Berlin',country:'Germany',latitude:52.52,longitude:13.405,timezone:'Europe/Berlin'};
const utc=Date.parse('1980-06-06T20:30:00Z');
test('civil time uses historical zones, non-hour offsets and calendar validation',()=>{
 assert.equal(time.resolveCivilTime({date:'1980-06-06',time:'22:30',zone:'Europe/Berlin'})[0],utc);
 assert.equal(time.resolveCivilTime({date:'1990-06-06',time:'12:00',zone:'Asia/Kathmandu'})[0],Date.parse('1990-06-06T06:15:00Z'));
 assert.equal(time.resolveCivilTime({date:'1980-06-06',time:'12:00',zone:'Asia/Kathmandu'})[0],Date.parse('1980-06-06T06:30:00Z'));
 assert.equal(time.resolveCivilTime({date:'1900-02-29',time:'12:00',zone:'UTC'}).length,0);
 assert.equal(time.resolveCivilTime({date:'2000-02-29',time:'12:00',zone:'UTC'}).length,1);
 assert.equal(time.resolveCivilTime({date:'2000-02-29',time:'24:01',zone:'UTC'}).length,0);
 assert.throws(()=>time.resolveCivilTime({date:'1980-06-06',time:'22:30',zone:'Invalid/Zone'}));
});
test('DST gaps are rejected and both occurrences of folded times are exposed',()=>{
 assert.equal(time.resolveCivilTime({date:'2020-03-08',time:'02:30',zone:'America/New_York'}).length,0);
 assert.equal(time.resolveCivilTime({date:'2011-12-30',time:'12:00',zone:'Pacific/Apia'}).length,0);
 const fold=time.resolveCivilTime({date:'2020-11-01',time:'01:30',zone:'America/New_York'});assert.equal(fold.length,2);assert.equal(fold[1]-fold[0],3600000);
 const half=time.resolveCivilTime({date:'2020-04-05',time:'01:45',zone:'Australia/Lord_Howe'});assert.equal(half.length,2);assert.equal(half[1]-half[0],1800000);
});
test('local sky agrees with independent JPL airless topocentric fixture within 0.02 degrees',()=>{
 const sky=model.calculateSky(utc,berlin),expected=require('./fixtures/sky-jpl.json');
 for(const [name,az,alt] of expected.bodies){const p=sky.bodies.find(b=>b.name===name);assert.ok(Math.abs(p.azimuth-az)<.02,`${name} azimuth ${p.azimuth} vs ${az}`);assert.ok(Math.abs(p.altitude-alt)<.02,`${name} altitude ${p.altitude} vs ${alt}`);}
 assert.equal(sky.bodies.length,9);assert.equal(sky.stars.length,8922);assert.equal(sky.lines.length,695);
 assert.ok(sky.stars.every(p=>Number.isFinite(p.azimuth)&&Number.isFinite(p.altitude)));
 const next=model.calculateSky(utc+3600000,berlin);assert.ok(Math.abs(next.stars.find(p=>p.name==='Vega').azimuth-sky.stars.find(p=>p.name==='Vega').azimuth)>1);
 assert.throws(()=>model.calculateSky(utc,{...berlin,latitude:NaN}));
});
test('zenith, horizon and east/west are consistent between the printed chart and 3D',()=>{
 const north=coords.projectSky({altitude:0,azimuth:0}),east=coords.projectSky({altitude:0,azimuth:90}),zenith=coords.projectSky({altitude:90,azimuth:0});assert.ok(Math.abs(north.x)<1e-10&&Math.abs(north.y+1)<1e-10);assert.ok(Math.abs(east.x+1)<1e-10);assert.ok(Math.abs(zenith.y)<1e-10);
 const vector=coords.skyVector({altitude:0,azimuth:90});assert.ok(Math.abs(vector[0]-1)<1e-10);assert.equal(coords.skyLight(-20),'Night');assert.equal(coords.skyLight(5),'Daylight');
});
test('poster is one vector composition with actual year/place, escaped personal text and embedded credit',()=>{
 const sky=model.calculateSky(utc,berlin),options={title:'Born <script> & loved',date:'1980-06-06',time:'22:30',zone:'GMT+02:00',style:'coral',lines:true,labels:true};const art=poster.posterSvg(sky,options);
 assert.match(art,/width="297mm" height="420mm"/);assert.match(art,/>6 June 1980</);assert.match(art,/>Berlin</);assert.match(art,/>Germany</);assert.match(art,/Born &lt;script&gt; &amp; loved/);assert.match(art,/<metadata>.*CC BY-SA 4.0/);assert.doesNotMatch(art,/<a |<script>/);
 assert.ok(art.includes('Jupiter'));assert.ok(!poster.posterSvg(sky,{...options,lines:false,labels:false}).includes('>Jupiter</text>'));
});
test('larger map has plain time and identified photo artwork, with a photograph-free option',()=>{
 const sky=model.calculateSky(utc,berlin),options={title:'W'.repeat(30),date:'1980-06-06',time:'22:30',zone:'GMT+02:00',style:'coral',lines:true,labels:true};const art=poster.posterSvg(sky,options);
 const visible=Array.from(art.matchAll(/<text\b[^>]*>([\s\S]*?)<\/text>/g),m=>m[1]).join(' ');
 assert.match(visible,/Your birth sky/);assert.match(visible,/22:30/);assert.doesNotMatch(visible,/GMT|local time|moment in the universe|day you arrived/i);
 assert.match(art,/r="369"/);assert.match(visible,/Carina Nebula/);assert.match(visible,/Whirlpool Galaxy/);assert.match(visible,/2022/);assert.match(visible,/2005/);assert.match(art,/textLength="365"/);
 const plain=poster.posterSvg(sky,{...options,photos:false});assert.doesNotMatch(plain,/<image/);assert.doesNotMatch(plain,/Carina Nebula|Whirlpool Galaxy/);
});
test('PDF is exactly one borderless A3 sheet with lossless pixels and complete credit metadata',async()=>{
 const {posterPdf,A3_POINTS}=load('lib/sky/pdf.ts',{CompressionStream,Response});const rgb=new Uint8Array([255,0,0,0,255,0,0,0,255,255,255,255]);const pdf=Buffer.from(await(await posterPdf(rgb,2,2,'HYG & <credit> · Berlin')).arrayBuffer());const text=pdf.toString('latin1');
 assert.ok(pdf.subarray(0,8).equals(Buffer.from('%PDF-1.7')));assert.match(text,/\/Count 1/);assert.match(text,/\/Width 2 \/Height 2/);assert.match(text,/\/ColorSpace \/DeviceRGB/);assert.match(text,/\/Filter \/FlateDecode/);assert.doesNotMatch(text,/\/Annots|\/URI|\/Font/);
 for(const box of ['MediaBox','CropBox','TrimBox','BleedBox']){const coords=new RegExp('/'+box+' \\[([^\\]]+)\\]').exec(text)[1].split(' ').map(Number);assert.equal(coords[0],0);assert.equal(coords[1],0);assert.ok(Math.abs(coords[2]-297/25.4*72)<.00001);assert.ok(Math.abs(coords[3]-420/25.4*72)<.00001);}
 const imageStart=pdf.indexOf('stream\n',pdf.indexOf('4 0 obj'))+7,length=Number(/\/Length (\d+)/.exec(text.slice(text.indexOf('4 0 obj')))[1]);assert.ok(require('node:zlib').inflateSync(pdf.subarray(imageStart,imageStart+length)).equals(Buffer.from(rgb)));
 const xref=Number(/startxref\n(\d+)/.exec(text)[1]);assert.equal(text.slice(xref,xref+4),'xref');const entries=text.slice(xref).split('\n').slice(3,10);entries.forEach((entry,index)=>assert.equal(text.slice(Number(entry.slice(0,10)),Number(entry.slice(0,10))+7),`${index+1} 0 obj`));assert.ok(Math.abs(A3_POINTS[0]-841.88976378)<.00001);
 assert.ok(pdf.includes(Buffer.from('HYG &amp; &lt;credit&gt; · Berlin')));
 await assert.rejects(()=>posterPdf(new Uint8Array(2),1,1,''));await assert.rejects(()=>posterPdf(new Uint8Array(),NaN,0,''));
});
test('PDF remains valid without browser stream compression and RGB conversion discards only alpha',async()=>{
 const {posterPdf}=load('lib/sky/pdf.ts',{CompressionStream:undefined}),rgb=new Uint8Array([1,2,3]);const pdf=Buffer.from(await(await posterPdf(rgb,1,1,'')).arrayBuffer());assert.doesNotMatch(pdf.toString('latin1'),/FlateDecode/);assert.ok(pdf.includes(Buffer.from(rgb)));
 const {opaqueRgb}=load('lib/sky/export-artwork.ts');assert.deepEqual(Array.from(opaqueRgb(new Uint8ClampedArray([1,2,3,255,9,8,7,255]))),[1,2,3,9,8,7]);
});
test('edge labels never run through the circular chart crop',()=>{
 const edge={id:'Neptune',name:'Neptune',azimuth:270,altitude:8,magnitude:1,color:'#ffffff',body:true};const sky={...model.calculateSky(utc,berlin),bodies:[edge],stars:[],lines:[]};const art=poster.posterSvg(sky,{title:'',date:'1980-06-06',time:'22:30',zone:'GMT+02:00',style:'coral',lines:true,labels:true,photos:false});assert.doesNotMatch(art,/>Neptune<\/text>/);assert.match(art,/<circle/);
});
test('self-contained exports embed only bundled assets and never send birth details',async()=>{
 const requests=[],module=load('lib/sky/export-artwork.ts',{btoa,fetch:async url=>{requests.push(url);return {ok:true,arrayBuffer:async()=>new Uint8Array([1,2,3]).buffer};}}),sky=model.calculateSky(utc,berlin),options={title:'Private name',date:'1980-06-06',time:'22:30',zone:'GMT+02:00',style:'coral',lines:true,labels:true};
 const art=await module.embeddedPoster(sky,options);assert.equal(requests.length,3);assert.ok(requests.every(url=>url.startsWith('/media/sky/')&&!url.includes('?')));assert.match(art,/data:font\/woff2;base64/);assert.match(art,/data:image\/jpeg;base64/);assert.doesNotMatch(art,/href="\/media/);
 requests.length=0;const plain=await module.embeddedPoster(sky,{...options,photos:false});assert.equal(requests.length,1);assert.doesNotMatch(plain,/<image/);
 const failed=load('lib/sky/export-artwork.ts',{fetch:async()=>({ok:false})});await assert.rejects(()=>failed.embeddedPoster(sky,options),/asset could not be loaded/);
});
test('PNG export retains UTF-8 catalogue licence metadata without changing image pixels',async()=>{
 const {pngWithCredit}=load('lib/sky/png-credit.ts');const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aK1kAAAAASUVORK5CYII=','base64');const result=Buffer.from(await(await pngWithCredit(new Blob([png]),'CC BY-SA 4.0 · HYG')).arrayBuffer());assert.ok(result.includes(Buffer.from('pHYs')));assert.ok(result.includes(Buffer.from('iTXtDescription')));assert.ok(result.includes(Buffer.from('CC BY-SA 4.0 · HYG')));function idat(bytes){for(let i=8;i<bytes.length;){const length=bytes.readUInt32BE(i);if(bytes.toString('ascii',i+4,i+8)==='IDAT')return bytes.subarray(i+8,i+8+length);i+=length+12;}}assert.ok(idat(result).equals(idat(png)));assert.ok(result.indexOf('pHYs')<result.indexOf('IDAT'));assert.equal(result.readUInt32BE(result.indexOf('pHYs')+4),11811);assert.ok(result.subarray(-12).equals(png.subarray(-12)));
});
test('city adapter sends only a city query and preserves IANA coordinates with no-store responses',async()=>{
 let called;const route=load('api/sky-cities/route.ts',{fetch:async(url,options)=>{called={url:String(url),options};return {ok:true,json:async()=>({results:[{name:'Berlin',admin1:'Berlin',country:'Germany',latitude:52.52,longitude:13.405,timezone:'Europe/Berlin'},{name:'Bad',latitude:999,longitude:0,timezone:'UTC'}]})};}});
 const response=await route.POST(new Request('https://example.test/api/sky-cities',{method:'POST',body:JSON.stringify({query:'Berlin',date:'private-ignored'})}));const data=await response.json();assert.equal(data.locations.length,1);assert.equal(data.locations[0].timezone,'Europe/Berlin');assert.equal(response.headers.get('cache-control'),'no-store');assert.equal(called.options.cache,'no-store');assert.ok(!called.url.includes('private'));assert.ok(called.url.includes('name=Berlin'));
 const invalid=await route.POST(new Request('https://example.test/api/sky-cities',{method:'POST',body:JSON.stringify({query:'a'})}));assert.equal(invalid.status,400);
 const failed=load('api/sky-cities/route.ts',{fetch:async()=>{throw Error('offline');}});assert.equal((await failed.POST(new Request('https://example.test/api/sky-cities',{method:'POST',body:'{"query":"Berlin"}'}))).status,502);
});
