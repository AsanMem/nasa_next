const {test}=require('node:test');const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
function setup(loaded,expanded=false){
 const effects=[],frames=[],errors=[];let hooks=0,destroyed=0,listener;
 let modal=false,focusRestores=0;
 const host={isConnected:true,appendChild(frame){frames.push(frame);},replaceChildren(){frames.length=0;},close(){modal=false;},showModal(){modal=true;},show(){assert.equal(this.isConnected,true);modal=false;},focus(){}};
 const react={useMemo:fn=>fn(),useRef:()=>({current:host}),useState:value=>{const i=hooks++;return [i===0?loaded:i===2?expanded:value,next=>{if(i===1)errors.push(next);}];},useEffect:effect=>effects.push(effect)};
 const model={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/app/lib/observations/video.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:model,exports:model.exports,URL});
 const module={exports:{}};const source=fs.readFileSync(path.join(__dirname,'../src/app/ui/day/external-video.tsx'),'utf8');
 const document={activeElement:{focus(){focusRestores++;}},createElement:()=>({})};
 vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,{module,exports:module.exports,URL,document,window:{location:{origin:'http://localhost:3000'},YT:{Player:function(frame,options){listener=options.events.onError;return {destroy(){destroyed++;}};}}},require:name=>name.endsWith('use-scroll-lock')?{useScrollLock(){}}:name==='next/link'?{default:()=>null,__esModule:true}:name==='react'?react:name.includes('observations/video')?model.exports:name==='react/jsx-runtime'?require(name):{default:{},__esModule:true}});
 module.exports.default({url:'https://www.youtube.com/watch?v=abcdefghijk',title:'NASA video'});
 return {effects,frames,errors,detach:()=>{host.isConnected=false;},modal:()=>modal,focusRestores:()=>focusRestores,error:code=>listener({data:code}),destroyed:()=>destroyed,mount:()=>{const cleanups=effects.map(fn=>fn());return()=>cleanups.reverse().forEach(fn=>fn?.());}};
}
test('external video makes no iframe before consent',()=>{const h=setup(false);h.effects.forEach(effect=>effect());assert.equal(h.frames.length,0);});
test('YouTube iframe identifies the client, reports API errors and cleans up its player',async()=>{
 const h=setup(true),cleanup=h.mount();await Promise.resolve();await Promise.resolve();
 assert.equal(h.frames.length,1);assert.equal(h.frames[0].referrerPolicy,'strict-origin-when-cross-origin');assert.equal(new URL(h.frames[0].src).searchParams.get('origin'),'http://localhost:3000');
 assert.equal(new URL(h.frames[0].src).searchParams.get('fs'),'0');assert.equal(h.frames[0].allowFullscreen,false);
 h.error(153);assert.match(h.errors[0],/Watch it on YouTube/);cleanup();assert.equal(h.frames.length,0);assert.equal(h.destroyed(),1);h.error(100);assert.equal(h.errors.length,1);
});
test('unmount before API readiness prevents a detached player',async()=>{const h=setup(true),cleanup=h.mount();cleanup();await Promise.resolve();await Promise.resolve();assert.equal(h.frames.length,0);assert.equal(h.destroyed(),0);});
test('expanded player uses an owned dialog and restores focus on cleanup',async()=>{const h=setup(true,true),cleanup=h.mount();assert.equal(h.modal(),true);assert.equal(h.frames.length,1);cleanup();await Promise.resolve();assert.equal(h.modal(),false);assert.equal(h.focusRestores(),1);});

test('route unmount does not reopen a detached expanded dialog',()=>{const h=setup(true,true),cleanup=h.mount();h.detach();cleanup();assert.equal(h.modal(),false);assert.equal(h.focusRestores(),0);});
