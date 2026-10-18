const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const root=path.resolve(__dirname,'..');
function loader(globals={}) {
 const cache=new Map();
 function load(file){file=path.resolve(root,file);if(cache.has(file))return cache.get(file).exports;if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8').replace(/^\uFEFF/,''));
 const module={exports:{}};cache.set(file,module);
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,{module,exports:module.exports,URL,Date,Intl,AbortController,Request,Response,setTimeout,clearTimeout,...globals,require:name=>name.startsWith('.')?load(path.resolve(path.dirname(file),name)+(path.extname(name)?'':'.ts')):require(name)});return module.exports;}
 return load;
}
const load=loader(),hubble=load('src/app/lib/observations/hubble.ts'),video=load('src/app/lib/observations/video.ts');
const csv='Date,Year,Image_File,Name,Description,URL\r\n1/1/2019 0:00:00,2012,first.jpg,"Leo, IV","One ""quoted""\nline",https://science.nasa.gov/asset/hubble/first/\r\n,2023,second.jpg,Second,Description,https://science.nasa.gov/asset/hubble/second/\r\n2/29/2020 0:00:00,2004,leap.jpg,Leap,Description,https://science.nasa.gov/asset/hubble/leap/';
test('Hubble carries grouped dates but uses the actual Year field, including February 29',()=>{
 const items=hubble.parseHubbleBirthday('\uFEFF'+csv);assert.equal(items.length,3);assert.equal(items[0].year,2012);assert.equal(items[1].day,1);assert.equal(items[1].month,1);assert.equal(items[1].year,2023);assert.equal(items[2].day,29);assert.equal(items[0].description,'One "quoted"\nline');
 for(const pair of [[0,1],[13,1],[2,30],[4,31],['2',29],[1,0],[1,1.5]])assert.equal(hubble.validCalendarDay(...pair),false);assert.equal(hubble.validCalendarDay(2,29),true);
});
test('Hubble rejects missing headers, incomplete CSV, unsafe files and untrusted sources',()=>{
 assert.throws(()=>hubble.parseHubbleBirthday('wrong,headers'));assert.throws(()=>hubble.csvRows('"unfinished'));
 assert.throws(()=>hubble.parseHubbleBirthday(csv.replaceAll('science.nasa.gov','untrusted.test')));
 assert.throws(()=>hubble.parseHubbleBirthday(csv.replaceAll(/\w+\.jpg/g,'../secret.jpg')));
});
test('Hubble upstream request caches only the public CSV for twelve hours and limits the selected day to five',async()=>{
 let call;const adapter=loader({fetch:async(url,options)=>{call={url,options};return {ok:true,text:async()=>csv};}})('src/app/lib/nasa/hubble.ts');
 const result=await adapter.fetchHubbleBirthday(1,1);assert.equal(result.outcome,'ok');assert.equal(result.data.length,2);assert.equal(call.url,hubble.HUBBLE_CSV_URL);assert.equal(call.options.next.revalidate,43200);assert.doesNotMatch(call.url,/month=|day=/);
 const many=csv.split('\r\n')[0]+'\r\n'+Array.from({length:7},(_,i)=>`1/1/2019,2004,item-${i}.jpg,Image,Description,https://science.nasa.gov/asset/hubble/item-${i}/`).join('\r\n');
 const full=loader({fetch:async()=>({ok:true,text:async()=>many})})('src/app/lib/nasa/hubble.ts');assert.equal((await full.fetchHubbleBirthday(1,1)).data.length,5);
 assert.equal((await adapter.fetchHubbleBirthday(3,1)).outcome,'empty');assert.equal((await adapter.fetchHubbleBirthday(2,30)).outcome,'invalid-data');
});
test('Hubble adapter handles an unavailable source and rate limits',async()=>{
 for(const [status,outcome] of [[429,'rate-limit'],[503,'unavailable']]){const adapter=loader({fetch:async()=>({ok:false,status})})('src/app/lib/nasa/hubble.ts');assert.equal((await adapter.fetchHubbleBirthday(1,1)).outcome,outcome);}
 const adapter=loader({fetch:async()=>{throw Error('offline');}})('src/app/lib/nasa/hubble.ts');assert.equal((await adapter.fetchHubbleBirthday(1,1)).outcome,'unavailable');
});
test('Hubble POST validates dates, never caches personal selections and sends only public data upstream',async()=>{
 const route=loader({fetch:async()=>({ok:true,text:async()=>csv})})('src/app/api/hubble-birthday/route.ts');
 for(const body of ['{bad','null','{}','{"month":2,"day":30}','{"month":"2","day":29}']){const response=await route.POST(new Request('http://localhost/api/hubble-birthday',{method:'POST',body}));assert.equal(response.status,400);assert.equal(response.headers.get('cache-control'),'no-store');}
 const response=await route.POST(new Request('http://localhost/api/hubble-birthday',{method:'POST',body:'{"month":2,"day":29}'}));assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'no-store');assert.equal((await response.json()).data[0].year,2004);
});
test('curated lessons have forty minutes, three questions and exactly the required five NASA resources',()=>{
 const {lessonPacks}=load('src/app/lib/lessons/registry.ts');assert.equal(lessonPacks.length,5);
 for(const pack of lessonPacks){assert.equal(pack.ages,'11–14');assert.equal(pack.stages.map(x=>x.minutes).join(','),'5,10,15,10');assert.equal(pack.stages.reduce((s,x)=>s+x.minutes,0),40);assert.equal(pack.questions.length,3);assert.ok(pack.objective&&pack.exitTask&&pack.note);
 const linked=pack.stages.flatMap(stage=>stage.resources||[]);assert.equal(linked.length,5);assert.equal(new Set(linked).size,5);assert.equal(linked.slice().sort().join(','),pack.resources.map(x=>x.id).sort().join(','));
 const counts={image:0,video:0,page:0};for(const r of pack.resources){counts[r.kind]++;const url=new URL(r.source);assert.ok(url.hostname==='nasa.gov'||url.hostname.endsWith('.nasa.gov'));assert.equal(url.protocol,'https:');if(r.kind==='image')assert.ok(r.preview&&r.credit);}assert.equal(JSON.stringify(counts),JSON.stringify({image:2,video:1,page:2}));}
});
test('video normalizer accepts official YouTube forms, retains a watch link and rejects spoofed or malformed sources',()=>{
 for(const url of ['https://youtu.be/abcdefghijk?t=10','https://www.youtube.com/watch?v=abcdefghijk&rel=0','https://www.youtube-nocookie.com/embed/abcdefghijk?rel=0','https://youtube.com/shorts/abcdefghijk']){const v=video.embeddedVideo(url);assert.equal(v.id,'abcdefghijk');assert.match(v.embed,/youtube-nocookie.com/);assert.match(v.original,/watch\?v=abcdefghijk/);}
 for(const url of ['https://youtube.com.evil.test/watch?v=abcdefghijk','javascript:alert(1)','https://www.youtube.com/watch?v=short','http://youtu.be/abcdefghijk'])assert.equal(video.embeddedVideo(url),null);
 assert.equal(video.displayCredit('Image credit: Image credit: NASA, ESA'),'NASA, ESA');
});
test('nested dialog locks restore original styles and page position exactly once',()=>{
 const rootStyle={overflow:'auto'},bodyStyle={overflow:'visible',position:'',top:'',width:'',paddingRight:'4px'},calls=[];
 const model=loader({document:{documentElement:{style:rootStyle,clientWidth:345},body:{style:bodyStyle}},window:{scrollY:510,innerWidth:360,scrollTo:options=>calls.push(options)},getComputedStyle:()=>({paddingRight:'4px'})})('src/app/ui/orbital/use-scroll-lock.ts');
 const first=model.lockDocumentScroll(),second=model.lockDocumentScroll();assert.equal(bodyStyle.top,'-510px');assert.equal(bodyStyle.paddingRight,'19px');first();first();assert.equal(bodyStyle.position,'fixed');assert.equal(calls.length,0);second();assert.equal(bodyStyle.position,'');assert.equal(rootStyle.overflow,'auto');assert.equal(bodyStyle.paddingRight,'4px');assert.equal(calls[0].top,510);assert.equal(calls.length,1);
});
