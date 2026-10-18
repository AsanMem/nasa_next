const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
function model(relative){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/app',relative),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports,require,Date,Intl});return exports;}
const data=model('lib/asteroids/encounters.ts'),visual=model('lib/asteroids/visual.ts');
const event=(key,date,body='Earth',distance=1000,speed=10)=>({key,date,body,distance,speed,lunar:null});
test('timeline covers all records, keeps same-date bodies and positions real UTC gaps proportionally',()=>{
 const events=[event('last','2089-03-01'),event('earth','2024-02-29'),event('venus','2024-02-29','Venus'),event('first','1900-01-01')];
 const timeline=data.encounterTimeline(events);assert.deepEqual(Array.from(timeline,x=>x.event.key),['first','earth','venus','last']);assert.equal(timeline[0].position,0);assert.equal(timeline[3].position,1);assert.equal(timeline[1].position,timeline[2].position);assert.equal(events[0].key,'last');
 assert.equal(data.nearestEncounter(timeline,Date.parse('2024-03-01')).event.key,'earth');assert.ok(data.encounterTimeline([events[0]])[0].position===.5);assert.equal(data.encounterTimeline([]).length,0);
});
test('clustering preserves every encounter and ordered bodies include unknown names without inventing planets',()=>{
 const timeline=data.encounterTimeline(Array.from({length:139},(_,i)=>event(String(i),`${1900+i}-01-01`,i===2?'Venus':'Earth')));
 const groups=data.clusterEncounters(timeline,7);assert.equal(groups.reduce((sum,x)=>sum+x.items.length,0),139);assert.ok(groups.length<=7);for(let i=1;i<groups.length;i++)assert.ok(groups[i].position-groups[i-1].position>=1/7-1e-9);assert.equal(data.encounterBodies([event("sun","2026-01-01","Sun")]).length,0);assert.deepEqual(Array.from(data.encounterBodies([event('a','2024-01-01','Earth'),event('b','2025-01-01','Venus'),event('c','2026-01-01','Unknown moon'),event('d','2027-01-01','earth')])),['Venus','earth','Unknown moon']);
});
test('journey moves immediately through its full four-second segment without an encounter hold',()=>{assert.equal(data.ENCOUNTER_HOLD_MS,0);assert.equal(data.journeyPhase(0).progress,0);assert.equal(data.journeyPhase(100).progress,.025);assert.equal(data.journeyPhase(2000).progress,.5);assert.equal(data.journeyPhase(3999).arrived,false);assert.equal(data.journeyPhase(4000).arrived,true);assert.equal(data.journeyPhase(9000).progress,1);});
test('display scale is bounded and monotonic while the visual descriptor stays independent of measurement',()=>{assert.equal(visual.asteroidDisplayScale(null),1);assert.equal(visual.asteroidDisplayScale(0),1);assert.equal(visual.asteroidDisplayScale(1),.5);assert.equal(visual.asteroidDisplayScale(100000),1.35);assert.ok(visual.asteroidDisplayScale(20)<visual.asteroidDisplayScale(243));assert.deepEqual(visual.asteroidVisual('42'),visual.asteroidVisual('42'));});

function setup({reduced=false,failed=false,events=[event('a','2026-01-01'),event('b','2032-05-29','Venus'),event('c','2089-07-02')]}={}){
 const hooks=[],effects=[],frames=new Map(),listeners=new Map(),windowListeners=new Map(),observers=[];let cursor=0,dirty=true,tree,frameId=0,now=1,renders=0,lastSceneConfig;
 const equal=(a,b)=>a&&b&&a.length===b.length&&a.every((x,i)=>Object.is(x,b[i]));
 const react={useRef(value){const i=cursor++;hooks[i]??={current:value};return hooks[i];},useState(value){const i=cursor++;hooks[i]??={value:typeof value==='function'?value():value};return [hooks[i].value,next=>{const value=typeof next==='function'?next(hooks[i].value):next;if(!Object.is(value,hooks[i].value)){hooks[i].value=value;dirty=true;}}];},useMemo(fn,deps){const i=cursor++;if(!equal(hooks[i]?.deps,deps))hooks[i]={deps,value:fn()};return hooks[i].value;},useCallback(fn,deps){return this.useMemo(()=>fn,deps);},useEffect(fn,deps){const i=cursor++;if(!equal(hooks[i]?.deps,deps)){const old=hooks[i];hooks[i]={deps,cleanup:old?.cleanup};effects.push({i,fn,cleanup:old?.cleanup});}}};
 react.useCallback=(fn,deps)=>react.useMemo(()=>fn,deps);
 const document={hidden:false,addEventListener:(name,fn)=>listeners.set(name,fn),removeEventListener:name=>listeners.delete(name)};
 const element=()=>({style:{},clientWidth:320});
 const jsx=(type,props)=>{if(typeof type==='string'&&props.ref){if(typeof props.ref==='function')props.ref(element());else props.ref.current=element();}return {type,props};};
 const cache=new Map();function load(file){file=path.resolve(__dirname,'../src/app',file);if(cache.has(file))return cache.get(file);const exports={};cache.set(file,exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText,{exports,Date,Intl,console,document,window:{addEventListener:(name,fn)=>windowListeners.set(name,fn),removeEventListener:name=>windowListeners.delete(name)},IntersectionObserver:class{constructor(fn){observers.push(fn);}observe(){}disconnect(){}},ResizeObserver:class{constructor(fn){this.fn=fn;}observe(){this.fn();}disconnect(){}},requestAnimationFrame:fn=>{frames.set(++frameId,fn);return frameId;},cancelAnimationFrame:id=>frames.delete(id),require(name){if(name==='react')return react;if(name==='react/jsx-runtime')return {jsx,jsxs:jsx,Fragment:'fragment'};if(name.endsWith('.css'))return {default:new Proxy({},{get:(_,key)=>key})};if(name.endsWith('/scene-provider'))return {useOrbitalScene:config=>{lastSceneConfig=config;return {host:{current:null},status:failed?'failed':'ready',reduced};}};if(name==='./comparisons')return {AsteroidPortrait:()=>null};const base=path.resolve(path.dirname(file),name);return load(['.ts','.tsx'].map(ext=>base+ext).find(fs.existsSync));}});return exports;}
 const Component=load('ui/asteroids/encounter-story.tsx').default,picks=[];
 const props={id:'42',diameter:100,events,selected:events[0]??null,today:'2026-10-18',onSelect:e=>{props.selected=e;picks.push(e.key);dirty=true;},onActiveChange(){}};
 function render(){renders++;cursor=0;dirty=false;tree=Component(props);const pending=effects.splice(0);pending.forEach(e=>e.cleanup?.());pending.forEach(e=>hooks[e.i].cleanup=e.fn());}
 async function flush(){for(let i=0;i<12;i++){if(dirty)render();await Promise.resolve();}}
 function find(predicate,node=tree){if(!node||typeof node!=='object')return;if(Array.isArray(node)){for(const child of node){if(child==null)continue;const result=find(predicate,child);if(result)return result;}return;}if(predicate(node))return node;return find(predicate,node.props?.children??null);}
 return {flush,frames,document,getMotion:()=>lastSceneConfig.encounter.motion.current,getRenders:()=>renders,listeners,windowListeners,props,picks,find,setVisible(value){observers[0]([{isIntersecting:value,intersectionRatio:value ? .5 : 0}]);},button(label){return find(n=>n.type==='button'&&n.props.children===label);},async advance(ms){for(let elapsed=0;elapsed<ms;elapsed+=100){now+=100;const callbacks=[...frames.values()];frames.clear();callbacks.forEach(fn=>fn(now));await flush();}},unmount(){hooks.forEach(h=>h?.cleanup?.());}};
}
test('visible history autoplays, commits on arrival, pauses/resumes and loops after the last stop',async()=>{
 const app=setup();await app.flush();assert.equal(app.frames.size,0);app.setVisible(true);await app.flush();assert.equal(app.button('Pause').props['aria-pressed'],true);
 await app.advance(3500);assert.equal(app.props.selected.key,'a');app.button('Pause').props.onClick();await app.flush();assert.equal(app.frames.size,0);app.button('Play journey').props.onClick();await app.flush();await app.advance(900);assert.equal(app.props.selected.key,'b');await app.advance(4100);assert.equal(app.props.selected.key,'c');await app.advance(4100);assert.equal(app.props.selected.key,'a');assert.equal(app.frames.size,1);app.unmount();assert.equal(app.listeners.size,0);
});
test('record arrivals retain the live flight, carry elapsed time and only then publish NASA measurements',async()=>{
 const app=setup();await app.flush();app.setVisible(true);await app.flush();assert.equal(app.getMotion().progress,0);
 await app.advance(4000);const before=app.getMotion();assert.equal(before.fromKey,'a');assert.ok(before.progress>.95);assert.equal(app.props.selected.key,'a');
 await app.advance(200);const after=app.getMotion();assert.equal(after.fromKey,'b');assert.equal(after.toKey,'c');assert.equal(after.previousKey,'a');assert.ok(after.progress>0&&after.progress<.1);assert.equal(app.props.selected.key,'b');assert.equal(app.props.selected.body,'Venus');assert.equal(app.picks.filter(key=>key==='b').length,1);
 await app.advance(8000);assert.equal(app.getMotion().fromKey,'a');assert.equal(app.getMotion().previousKey,'c');assert.equal(app.props.selected.key,'a');app.unmount();
});
test('4x playback, manual keyboard selection, last-event restart and filter nearest selection',async()=>{
 const app=setup();await app.flush();app.setVisible(true);await app.flush();app.find(n=>n.type==='select').props.onChange({target:{value:'4'}});await app.flush();await app.advance(1200);assert.equal(app.props.selected.key,'b');
 app.find(n=>n.type==='input').props.onKeyDown({key:'End',preventDefault(){}});await app.flush();assert.equal(app.props.selected.key,'c');assert.equal(app.frames.size,0);
 app.button('Play journey').props.onClick();await app.flush();assert.equal(app.props.selected.key,'a');app.button('Upcoming').props.onClick();await app.flush();assert.equal(app.props.selected.key,'b');assert.equal(app.frames.size,0);app.unmount();
});
test('visibility suspends and resumes autoplay while an explicit user pause persists',async()=>{
 const app=setup();await app.flush();app.setVisible(true);await app.flush();assert.equal(app.frames.size,1);app.setVisible(false);await app.flush();assert.equal(app.frames.size,0);app.setVisible(true);await app.flush();assert.equal(app.frames.size,1);
 app.button('Pause').props.onClick();await app.flush();app.setVisible(false);await app.flush();app.setVisible(true);await app.flush();assert.equal(app.frames.size,0);
 app.button('Play journey').props.onClick();await app.flush();app.document.hidden=true;app.listeners.get('visibilitychange')();await app.flush();assert.equal(app.frames.size,0);app.document.hidden=false;app.listeners.get('visibilitychange')();await app.flush();assert.equal(app.frames.size,1);app.unmount();assert.equal(app.frames.size,0);assert.equal(app.windowListeners.size,0);
});
test('intermediate animated years do not rerender the React timeline or publish NASA measurements',async()=>{
 const app=setup();await app.flush();app.setVisible(true);await app.flush();await app.advance(1000);const before=app.getRenders();await app.advance(2000);assert.equal(app.getRenders(),before);assert.equal(app.props.selected.key,'a');assert.equal(app.picks.filter(key=>key!=='a').length,0);app.unmount();
});
test('reduced motion, failed WebGL, one event and empty filters preserve manual/static access',async()=>{
 for(const config of [{reduced:true},{failed:true},{events:[event('one','2020-01-01')]}]){const app=setup(config);await app.flush();app.setVisible(true);await app.flush();assert.equal(app.button('Play journey').props.disabled,true);assert.equal(app.frames.size,0);app.unmount();}
 const app=setup({events:[event('past','2020-01-01')]});await app.flush();app.setVisible(true);await app.flush();app.button('Upcoming').props.onClick();await app.flush();assert.equal(app.button('Play journey').props.disabled,true);assert.equal(app.frames.size,0);app.unmount();
});
test('Back/Forward and opening records stop playback; dates with different bodies remain individually selectable',async()=>{
 const app=setup({events:[event('earth','2026-01-01'),event('venus','2026-01-01','Venus'),event('future','2089-01-01')]});await app.flush();app.setVisible(true);await app.flush();app.find(n=>n.type==='input').props.onKeyDown({key:'ArrowRight',preventDefault(){}});await app.flush();assert.equal(app.props.selected.body,'Venus');app.button('Play journey').props.onClick();await app.flush();app.windowListeners.get('popstate')();await app.flush();assert.equal(app.frames.size,0);app.button('Play journey').props.onClick();await app.flush();app.find(n=>n.type==='details').props.onToggle({currentTarget:{open:true}});await app.flush();assert.equal(app.frames.size,0);app.unmount();
});

test('scene hook registers only an explicitly enabled host and releases it before reactivation',()=>{
 let registrations=0,updates=0,releases=0;const effects=[],host={};
 const api={register(){registrations++;return()=>releases++;},update(){updates++;},rotate(){},reset(){}};
 const react={createContext:()=>({}),useContext:()=>api,useRef:value=>({current:value??host}),useState:value=>[value,()=>{}],useEffect:fn=>effects.push(fn)};
 const module={exports:{}};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/app/ui/orbital/scene-provider.tsx'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText,{module,exports:module.exports,window:{matchMedia:()=>({matches:false,addEventListener(){},removeEventListener(){}})},require(name){return name==='react'?react:name==='next/navigation'?{}:require(name);}});
 const config={kind:'profile',id:'42',paused:true};
 module.exports.useOrbitalScene(config,true);const cleanup=effects.splice(0).map(fn=>fn());assert.equal(registrations,1);assert.equal(updates,1);cleanup.forEach(fn=>fn?.());assert.equal(releases,1);
 const inactive=module.exports.useOrbitalScene(config,false);effects.splice(0).forEach(fn=>fn());assert.equal(inactive.status,'loading');assert.equal(registrations,1);assert.equal(updates,1);
 module.exports.useOrbitalScene(config,true);effects.splice(0).forEach(fn=>fn());assert.equal(registrations,2);
});


test('actual Three encounter paths and cameras meet with nonzero matching velocities, including repeated bodies and the loop seam',()=>{
 const THREE=require('three'),exports={};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/app/ui/orbital/encounter-model.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports,require:name=>name==='three'?THREE:name.endsWith('/encounters')?data:visual});
 const earth=new THREE.MeshPhongMaterial(),moon=new THREE.MeshPhongMaterial(),model=exports.createEncounterModel(earth,moon),rock=new THREE.Mesh(new THREE.SphereGeometry(1),new THREE.MeshBasicMaterial()),camera=new THREE.PerspectiveCamera(42,1.4,.1,200);
 const a={fromBody:'Earth',toBody:'Venus',fromKey:'a',toKey:'b',previousBody:'Earth',previousKey:'c'},b={fromBody:'Venus',toBody:'Earth',fromKey:'b',toKey:'c',previousBody:'Earth',previousKey:'a'},c={fromBody:'Earth',toBody:'Earth',fromKey:'c',toKey:'a',previousBody:'Venus',previousKey:'b'};
 const config={kind:'encounters',id:'42',diameter:100,paused:false,encounter:{bodies:['Venus','Earth','Moon','Uncatalogued body'],body:'Earth',eventKey:'a',motion:{current:null}}};
 function sample(segment,t){config.encounter.motion.current={...segment,progress:t};model.update(config,camera,rock);return {rock:rock.position.clone(),camera:camera.position.clone(),trail:Array.from(model.group.children.find(item=>item.isLine).geometry.attributes.position.array)};}
 const h=1e-5;
 for(const [before,after] of [[a,b],[b,c],[c,a]]){
   const p=sample(before,1-h),end=sample(before,1),start=sample(after,0),q=sample(after,h);
   for(const field of ['rock','camera']){assert.ok(end[field].distanceTo(start[field])<1e-8,field+' has no boundary jump');const left=end[field].clone().sub(p[field]).divideScalar(h),right=q[field].clone().sub(start[field]).divideScalar(h);assert.ok(left.length()>.5,field+' does not stop at a record');assert.ok(left.distanceTo(right)<.025,field+' tangent is continuous');}
   assert.ok(Math.max(...end.trail.map((v,i)=>Math.abs(v-start.trail[i])))<1e-5,'trail survives the boundary');
 }
 const near=sample(a,0),far=sample(a,.5);assert.ok(far.camera.z>near.camera.z+5,'mid-flight camera pulls out farther');
 assert.equal(model.group.children.filter(item=>item.name.startsWith('encounter-body:')).length,4);
 assert.ok(model.group.children.some(item=>item.name==='encounter-body:uncatalogued body'));
 config.encounter.motion.current=null;model.update(config,camera,rock);const still=rock.position.clone();sample(a,0);assert.ok(rock.position.distanceTo(still)<1e-8,'static/manual and playback anchors match');
 model.dispose();assert.equal(model.group.children.length,0);rock.geometry.dispose();rock.material.dispose();earth.dispose();moon.dispose();
});
