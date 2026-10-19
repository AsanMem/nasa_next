const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ts=require('typescript');
const THREE=require('three');
const settle=()=>new Promise(resolve=>setImmediate(resolve));
function setup({reduced=false,webglFailure=false,textureFailure=false}={}) {
 const frames=new Map(), listeners=new Map(), canvasListeners=new Map(), observations=[], tweens=[];
 const stats={renderers:0,disposed:0,controls:0,renders:0};let frameId=0;
 function element(){return {isConnected:true,style:{},children:[],getBoundingClientRect(){return {left:600,top:112,width:800,height:650};},appendChild(child){child.parent?.children.splice(child.parent.children.indexOf(child),1);this.children.push(child);child.parent=this;},setAttribute(){}};}
 const layer=element(),canvas=element();canvas.remove=()=>{if(canvas.parent){canvas.parent.children=canvas.parent.children.filter(c=>c!==canvas);canvas.parent=null;}};
 canvas.addEventListener=(name,fn)=>canvasListeners.set(name,fn);canvas.removeEventListener=name=>canvasListeners.delete(name);
 class Renderer { constructor(){if(webglFailure)throw Error('WebGL unavailable');this.domElement=canvas;stats.renderers++;}setPixelRatio(v){this.ratio=v;}getPixelRatio(){return this.ratio;}setClearColor(){}setSize(w,h){canvas.width=w*this.ratio;canvas.height=h*this.ratio;}render(scene,camera){stats.renders++;stats.scene=scene;stats.camera=camera;}dispose(){stats.disposed++;}forceContextLoss(){} }
 class Controls extends THREE.EventDispatcher {constructor(){super();this.target=new THREE.Vector3();}update(){}dispose(){stats.controls++;}}
 class TextureLoader {load(url,loaded,progress,error){const texture=new THREE.Texture();queueMicrotask(()=>textureFailure?error?.(new Error('Missing image')):loaded(texture));return texture;}}
 const preference={matches:reduced,addEventListener(name,fn){this.change=fn;},removeEventListener(){}};
 const document={hidden:false,addEventListener(name,fn){listeners.set(name,fn);},removeEventListener(name){listeners.delete(name);}};
 const cache=new Map();
 function moduleAt(relative){const absolute=path.resolve(__dirname,'../src/app',relative);if(cache.has(absolute))return cache.get(absolute);const exports={};cache.set(absolute,exports);
  const code=ts.transpileModule(fs.readFileSync(absolute,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
  vm.runInNewContext(code,{exports,console,Math,window:{innerWidth:1440,innerHeight:960,devicePixelRatio:2,matchMedia:()=>preference},document,
   requestAnimationFrame(fn){frames.set(++frameId,fn);return frameId;},cancelAnimationFrame(id){frames.delete(id);},
   IntersectionObserver:class {constructor(fn){this.fn=fn;observations.push(this);}observe(){}disconnect(){this.disconnected=true;}},ResizeObserver:class {observe(){}disconnect(){}},
   require(name){if(name==='three')return {...THREE,WebGLRenderer:Renderer,TextureLoader};if(name.includes('OrbitControls'))return {OrbitControls:Controls};if(name.includes('BufferGeometryUtils'))return {mergeVertices:g=>g.clone()};if(name==='gsap')return {gsap:{to(target,options){const tween={target,options,kill(){this.killed=true;}};tweens.push(tween);return tween;}}};if(name.startsWith('.'))return moduleAt(path.relative(path.join(__dirname,'../src/app'),path.resolve(path.dirname(absolute),name+'.ts')));return require(name);}
  });return exports;
 }
 const exported=moduleAt('ui/orbital/scene-engine.ts');
 const engine=()=>exported.createSceneEngine(layer);
 return {engine,stats,element,layer,canvas,frames,listeners,document,preference,observations,canvasListeners,
  tick(time=100){const callbacks=[...frames.values()];frames.clear();callbacks.forEach(fn=>fn(time));},
  step(value){for(const tween of tweens){if(!tween.killed){tween.target.t=value;tween.options.onUpdate?.();}}},
  finish(){for(const tween of tweens.splice(0)){if(tween.killed)continue;tween.target.t=1;tween.options.onUpdate?.();tween.options.onComplete?.();}}
 };
}
function bind(app,engine,config={}){const binding={host:app.element(),config:{kind:'catalog',id:'3477703',paused:false,speed:9.17,...config},status(value){binding.state=value;}};engine.attach(binding);return binding;}
test('birth sky shares one renderer, stays frozen, updates on view changes and releases resources',async()=>{
 const app=setup(),engine=app.engine(),rock=bind(app,engine,{kind:'profile',paused:true});await settle();app.tick();engine.detach(rock.host);
 const star={id:'one',name:'Star',altitude:45,azimuth:180,magnitude:1,color:'#ffffff'};
 const data={stars:[star],lines:[],bodies:[{...star,id:'Moon',name:'Moon',body:true}]};
 const binding=bind(app,engine,{kind:'sky',id:undefined,paused:true,sky:{data,azimuth:180,altitude:45}});app.tick(200);assert.equal(app.stats.renderers,1);assert.equal(binding.state,'ready');assert.equal(app.frames.size,0);assert.equal(app.stats.camera.fov,75);
 const geometry=app.stats.scene.children[0].children[0].geometry;let freed=0;geometry.addEventListener('dispose',()=>freed++);
 engine.update({...binding.config,sky:{data,azimuth:90,altitude:30}});app.tick(300);assert.equal(app.stats.scene.children[0].children[0].geometry,geometry);assert.equal(app.frames.size,0);
 app.document.hidden=true;app.listeners.get('visibilitychange')();assert.equal(app.frames.size,0);app.document.hidden=false;
 engine.detach(binding.host);bind(app,engine,{kind:'profile',paused:true});app.tick(400);assert.equal(app.stats.renderers,1);assert.ok(app.stats.scene.getObjectByName('human-1.8m'));
 engine.dispose();assert.equal(freed,1);assert.equal(app.frames.size,0);
});

test('history includes every supplied body and leaves document gestures free of orbit controls',async()=>{
 const app=setup(),engine=app.engine(),bodies=['Mercury','Venus','Earth','Moon','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto','Unknown companion'];
 const binding=bind(app,engine,{kind:'encounters',diameter:50,paused:false,encounter:{bodies,body:'Venus',motion:{current:null}}});await settle();app.tick(100);
 for(const body of bodies)assert.ok(app.stats.scene.getObjectByName('encounter-body:'+body.toLowerCase()),body);
 assert.equal(binding.host.style.touchAction,'pan-y pinch-zoom');assert.equal(app.canvas.style.touchAction,'pan-y pinch-zoom');
 const queued=app.frames.size;engine.update({...binding.config,paused:false});engine.update({...binding.config,paused:false});assert.equal(app.frames.size,queued);
 engine.dispose();assert.equal(app.stats.controls,0);assert.equal(app.frames.size,0);
});
test('solar scene shares the existing Earth assets and renderer; pause and visibility suspend plasma time',async()=>{
 const app=setup(),engine=app.engine(),binding=bind(app,engine,{kind:'solar',id:undefined});await settle();app.tick(100);
 const solar=app.stats.scene.getObjectByName('illustrative-solar-environment');
 const earth=app.stats.scene.getObjectByName('reference-earth'),solarEarth=app.stats.scene.getObjectByName('solar-reference-earth');
 assert.equal(binding.state,'ready');assert.equal(solar.visible,true);assert.equal(solarEarth.geometry,earth.geometry);assert.equal(solarEarth.material,earth.material);
 const clock=solar.children.find(child=>child.material?.uniforms?.time).material.uniforms.time;
 app.tick(120);assert.ok(clock.value>0);const before=clock.value;
 engine.update({...binding.config,paused:true});app.tick(140);assert.equal(clock.value,before);assert.equal(app.frames.size,0);
 engine.update({...binding.config,paused:false});app.document.hidden=true;app.listeners.get('visibilitychange')();app.tick(160);assert.equal(clock.value,before);assert.equal(app.frames.size,0);
 app.document.hidden=false;app.listeners.get('visibilitychange')();engine.detach(binding.host);bind(app,engine,{kind:'home',id:undefined,paused:true});app.tick(180);
 assert.equal(solar.visible,false);assert.equal(earth.parent.visible,true);assert.equal(app.stats.renderers,1);engine.dispose();assert.equal(app.frames.size,0);
});
test('solar reduced motion is static and missing planet textures expose the fallback',async()=>{
 const app=setup({reduced:true}),engine=app.engine();bind(app,engine,{kind:'solar',id:undefined});await settle();app.tick();assert.equal(app.frames.size,0);
 const solar=app.stats.scene.getObjectByName('illustrative-solar-environment');assert.equal(solar.children.find(c=>c.material?.uniforms?.time).material.uniforms.time.value,0);engine.dispose();
 const failed=setup({textureFailure:true}),failedEngine=failed.engine(),binding=bind(failed,failedEngine,{kind:'solar',id:undefined});await settle();assert.equal(binding.state,'failed');failedEngine.dispose();
});
test('home restores its initial sphere orientation after an event focus',async()=>{
 const app=setup({reduced:true}),engine=app.engine(),events=bind(app,engine,{kind:'events',id:undefined,focus:{latitude:80,longitude:-45}});await settle();app.tick();
 engine.detach(events.host);bind(app,engine,{kind:'home',id:undefined,paused:true});app.tick();
 const earth=app.stats.scene.getObjectByName('reference-earth');assert.ok(Math.abs(earth.rotation.x-.12)<1e-8);assert.ok(Math.abs(earth.rotation.y-3.9)<1e-8);assert.ok(Math.abs(earth.rotation.z+.12)<1e-8);engine.dispose();
});
test('one renderer is retained through home, catalog, profile and fully disposed',async()=>{
 const app=setup(),engine=app.engine();const home=bind(app,engine,{kind:'home',id:undefined});await settle();app.finish();app.tick();
 engine.depart('/asteroids');engine.detach(home.host);const catalog=bind(app,engine);app.finish();app.tick();
 engine.depart('/asteroids/3477703/view');engine.detach(catalog.host);const profile=bind(app,engine,{kind:'profile'});app.finish();app.tick();
 assert.equal(app.stats.renderers,1);assert.equal(profile.host.children.length,1);assert.equal(app.layer.children.length,0);
 engine.dispose();assert.equal(app.frames.size,0);assert.equal(app.stats.disposed,1);assert.equal(app.canvas.parent,null);assert.equal(app.listeners.size,0);
});
test('selection, size and event changes retain the model identity and exact physical ratio',async()=>{
 const app=setup({reduced:true}),engine=app.engine(),binding=bind(app,engine,{kind:'profile',diameter:6.22,mode:'size'});await settle();app.tick();
 const rock=app.stats.scene.getObjectByName('asteroid:3477703'),human=app.stats.scene.getObjectByName('human-1.8m');
 const height=o=>new THREE.Box3().setFromObject(o,true).getSize(new THREE.Vector3()).y;
 assert.ok(Math.abs(height(rock)/height(human)-6.22/1.8)<.00001);assert.ok(app.stats.camera.isOrthographicCamera);
 const geometry=Array.from(rock.geometry.attributes.position.array);
 engine.update({...binding.config,id:'3708359',mode:'object'});app.tick();engine.update({...binding.config,id:'3477703',speed:30,diameter:9});app.tick();
 assert.deepEqual(Array.from(rock.geometry.attributes.position.array),geometry);engine.dispose();
});
test('offscreen, hidden tab and pause stop automatic scheduling',async()=>{
 const app=setup(),engine=app.engine(),binding=bind(app,engine);await settle();app.finish();app.tick();assert.equal(app.frames.size,1);
 app.observations.at(-1).fn([{isIntersecting:false}]);assert.equal(app.frames.size,0);
 app.observations.at(-1).fn([{isIntersecting:true}]);app.document.hidden=true;app.listeners.get('visibilitychange')();assert.equal(app.frames.size,0);
 app.document.hidden=false;app.listeners.get('visibilitychange')();engine.update({...binding.config,paused:true});app.tick();assert.equal(app.frames.size,0);engine.dispose();
});
test('reduced motion permits manual rotation and never starts flight or auto rotation',async()=>{
 const app=setup({reduced:true}),engine=app.engine();bind(app,engine);await settle();app.tick();assert.equal(app.frames.size,0);
 const rock=app.stats.scene.getObjectByName('asteroid:3477703'),before=rock.rotation.y;engine.rotate(1);app.tick();assert.ok(rock.rotation.y>before);assert.equal(app.frames.size,0);
 engine.depart('/asteroids/3477703/view');assert.equal(app.layer.children.length,0);engine.dispose();
});
test('context loss exposes fallback and cannot restart on visibility changes',async()=>{
 const app=setup(),engine=app.engine(),binding=bind(app,engine);await settle();app.canvasListeners.get('webglcontextlost')({preventDefault(){}});
 assert.equal(binding.state,'failed');assert.equal(app.frames.size,0);app.observations.at(-1).fn([{isIntersecting:true}]);assert.equal(app.frames.size,0);engine.dispose();
});
test('WebGL failure can be caught by the provider and texture failure keeps lit geometry',async()=>{
 assert.throws(()=>setup({webglFailure:true}).engine(),/WebGL unavailable/);
 const app=setup({textureFailure:true}),engine=app.engine(),binding=bind(app,engine);await settle();app.finish();app.tick();assert.equal(binding.state,'ready');assert.ok(app.stats.renders>0);engine.dispose();
});
test('rapid navigation and late textures leave no detached renderer or queued animation',async()=>{
 const app=setup(),engine=app.engine(),binding=bind(app,engine);engine.depart('/asteroids/3477703/view');engine.detach(binding.host);engine.dispose();await settle();app.finish();app.tick();
 assert.equal(app.stats.disposed,1);assert.equal(app.frames.size,0);assert.equal(app.layer.children.length,0);
});
test('particle travel uses the same speed coefficient for every encounter; missing speed is static',async()=>{
 const app=setup(),engine=app.engine(),binding=bind(app,engine,{speed:10});await settle();app.finish();app.tick(100);
 const geometry=app.stats.scene.getObjectByName('illustrative-speed-particles').geometry;
 const z=()=>geometry.attributes.position.array[2];let before=z();app.tick(120);const slow=z()-before;
 engine.update({...binding.config,speed:30});before=z();app.tick(140);const fast=z()-before;
 assert.ok(Math.abs(fast/slow-3)<.001);
 engine.update({...binding.config,speed:null});before=z();app.tick(160);assert.equal(z(),before);engine.dispose();
});

test('event mode reuses the Earth renderer, projects selected geography to the front and disposes it',async()=>{
 const app=setup({reduced:true}),engine=app.engine();let points=[];
 const binding=bind(app,engine,{kind:'events',id:undefined,paused:true,focus:{latitude:40,longitude:70},markers:[{id:'selected',latitude:40,longitude:70},{id:'opposite',latitude:-40,longitude:-110}],projectMarkers:value=>points=value});
 await settle();app.tick();assert.equal(binding.state,'ready');assert.equal(app.stats.renderers,1);assert.equal(points[0].visible,true);assert.equal(points[1].visible,false);assert.ok(Math.abs(points[0].x-50)<1);assert.ok(Math.abs(points[0].y-50)<3);assert.equal(app.frames.size,0);
 engine.update({...binding.config,focus:{latitude:-30,longitude:-120},markers:[{id:'new',latitude:-30,longitude:-120}]});app.tick();assert.equal(points[0].visible,true);assert.ok(Math.abs(points[0].x-50)<1);engine.dispose();assert.equal(app.frames.size,0);assert.equal(app.stats.disposed,1);
});


test('Earth focus follows a shortest 700ms arc, retargets without a jump and projects intermediate markers',async()=>{
 const app=setup(),engine=app.engine();let projections;
 const binding=bind(app,engine,{kind:'events',id:undefined,paused:true,focus:{latitude:0,longitude:179},markers:[{id:'p',latitude:0,longitude:-150}],projectMarkers:value=>projections=value});
 await settle();app.finish();app.tick(100);
 const earth=app.stats.scene.getObjectByName('reference-earth'),start=earth.quaternion.clone();
 engine.update({...binding.config,focus:{latitude:0,longitude:-179}});
 for(let t=120;t<=440;t+=20)app.tick(t);
 assert.ok(start.angleTo(earth.quaternion)<2*Math.PI/180);
 assert.ok(start.angleTo(earth.quaternion)>0);
 const middle=earth.quaternion.clone(),markerX=projections[0].x;
 engine.update({...binding.config,focus:{latitude:35,longitude:-80}});
 assert.ok(middle.angleTo(earth.quaternion)<1e-7);
 app.tick(460);assert.ok(middle.angleTo(earth.quaternion)<.02);
 assert.notEqual(projections[0].x,markerX);
 for(let t=480;t<=1180;t+=20)app.tick(t);
 const target=new THREE.Quaternion().setFromEuler(new THREE.Euler(35*Math.PI/180,-Math.PI/2+80*Math.PI/180,0,'XYZ'));
 assert.ok(target.angleTo(earth.quaternion)<1e-7);assert.equal(app.frames.size,0);
 engine.dispose();
});
test('reduced-motion Earth selection is immediate and keeps no animation queued',async()=>{
 const app=setup({reduced:true}),engine=app.engine(),binding=bind(app,engine,{kind:'events',id:undefined,paused:true,focus:{latitude:0,longitude:0}});
 await settle();app.tick();engine.update({...binding.config,focus:{latitude:40,longitude:90}});app.tick();
 const earth=app.stats.scene.getObjectByName('reference-earth'),target=new THREE.Quaternion().setFromEuler(new THREE.Euler(40*Math.PI/180,-Math.PI,0,'XYZ'));
 assert.ok(target.angleTo(earth.quaternion)<1e-7);assert.equal(app.frames.size,0);engine.dispose();
});

test('encounter stage reuses the asteroid and one renderer, moves camera between stops and restores profile',async()=>{
 const app=setup(),engine=app.engine(),profile=bind(app,engine,{kind:'profile',diameter:100,paused:true});await settle();app.finish();app.tick();
 const rock=app.stats.scene.getObjectByName('asteroid:3477703'),geometry=rock.geometry;
 engine.detach(profile.host);const motion={current:null};let labels;
 const history=bind(app,engine,{kind:'encounters',diameter:100,paused:true,encounter:{bodies:['Venus','Earth'],body:'Earth',motion},projectBodies:value=>labels=value});await settle();app.finish();app.tick();
 const model=app.stats.scene.getObjectByName('illustrative-encounter-history');assert.equal(model.visible,true);assert.equal(rock.geometry,geometry);assert.equal(app.stats.renderers,1);assert.equal(app.frames.size,0);assert.ok(labels.some(p=>p.id==='Earth'));assert.equal(app.stats.scene.getObjectByName('encounter-body:Mars'),undefined);
 const startCamera=app.stats.camera.position.clone(),startRock=rock.position.clone();motion.current={fromBody:'Earth',toBody:'Venus',progress:.5};engine.update({...history.config,paused:true});app.tick();assert.ok(app.stats.camera.position.distanceTo(startCamera)>3);assert.ok(rock.position.distanceTo(startRock)>1);
 motion.current={fromBody:'Earth',toBody:'Venus',progress:1};engine.update({...history.config,encounter:{...history.config.encounter,body:'Venus'}});app.tick();const venus=app.stats.scene.getObjectByName('encounter-body:venus');assert.ok(rock.position.distanceTo(venus.position)>1.5);
 engine.detach(history.host);bind(app,engine,{kind:'profile',diameter:100,paused:true});app.finish();app.tick();assert.equal(model.visible,false);assert.equal(app.stats.renderers,1);engine.dispose();assert.equal(app.frames.size,0);assert.equal(app.stats.disposed,1);
});
test('ordinary asteroid scale changes with diameter while exact human proportions remain independent',async()=>{
 const app=setup({reduced:true}),engine=app.engine(),binding=bind(app,engine,{kind:'profile',diameter:20,paused:true});await settle();app.tick();const rock=app.stats.scene.getObjectByName('asteroid:3477703'),small=rock.scale.x,geometry=rock.geometry;
 engine.update({...binding.config,diameter:243});app.tick();assert.ok(rock.scale.x>small);assert.equal(rock.geometry,geometry);
 engine.update({...binding.config,diameter:20,mode:'size'});app.tick();const person=app.stats.scene.getObjectByName('human-1.8m');const height=o=>new THREE.Box3().setFromObject(o,true).getSize(new THREE.Vector3()).y;assert.ok(Math.abs(height(rock)/height(person)-20/1.8)<1e-6);engine.dispose();
});


test('catalog entry retains its visible source through a cold route and moves directly into the ready profile',async()=>{
 const app=setup(),engine=app.engine(),catalog=bind(app,engine,{diameter:150});await settle();app.finish();app.tick(100);
 const rock=app.stats.scene.getObjectByName('asteroid:3477703'),geometry=rock.geometry,camera=app.stats.camera.position.clone();
 engine.depart('/asteroids/3477703/view');engine.detach(catalog.host);app.tick(200);
 assert.equal(rock.visible,true);assert.equal(rock.geometry,geometry);assert.equal(app.layer.children.length,1);
 assert.equal(app.layer.style.width,'800px');assert.ok(app.stats.camera.position.distanceTo(camera)<1e-8);
 // Waiting for route data must not finish a flight against the now-removed source host.
 app.finish();app.tick(300);assert.equal(app.layer.children.length,1);assert.equal(rock.visible,true);
 const host=app.element();host.getBoundingClientRect=()=>({left:30,top:80,width:600,height:500,bottom:580});
 engine.attach({host,config:{kind:'profile',id:'3477703',diameter:150,paused:false},status(){}});app.tick(400);
 assert.ok(app.stats.camera.position.distanceTo(camera)<1e-8);
 app.step(.5);app.tick(500);assert.equal(app.layer.style.width,'700px');assert.equal(app.layer.style.height,'575px');
 assert.ok(app.stats.camera.position.length()<5.2);assert.equal(rock.geometry,geometry);
 app.finish();app.tick(600);assert.equal(host.children.length,1);assert.equal(app.layer.children.length,0);
 assert.ok(Math.abs(app.stats.camera.position.z-4.1)<.06);assert.equal(app.stats.renderers,1);engine.dispose();
});

test('opening a different list object does not fly the previously selected asteroid into its profile',async()=>{
 const app=setup(),engine=app.engine();bind(app,engine);await settle();app.finish();app.tick();
 engine.depart('/asteroids/3708359/view');assert.equal(app.layer.children.length,0);engine.dispose();
});


test('encounter anchors keep a visible projected gap beside Earth, Venus and Sun on narrow and wide stages',async()=>{
 const app=setup(),engine=app.engine(),binding=bind(app,engine,{kind:'encounters',diameter:243,paused:true,encounter:{bodies:['Venus','Earth'],body:'Earth',eventKey:'earth',motion:{current:null}}});await settle();app.finish();
 for(const aspect of [.45,1.6]){
  const width=320*aspect;binding.host.getBoundingClientRect=()=>({left:0,top:0,width,height:320,bottom:320});
  for(const body of ['Earth','Venus','Sun']){
   engine.update({...binding.config,encounter:{...binding.config.encounter,body,eventKey:body.toLowerCase()}});app.tick();
   const camera=app.stats.camera,rock=app.stats.scene.getObjectByName('asteroid:3477703');
   const planet=body==='Sun'?new THREE.Vector3():app.stats.scene.getObjectByName('encounter-body:'+body.toLowerCase()).position;
   const right=new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld,0),center=planet.clone().project(camera),rockCenter=rock.position.clone().project(camera);
   const planetRadius=Math.abs(planet.clone().addScaledVector(right,.72).project(camera).x-center.x);
   const rockRadius=Math.abs(rock.position.clone().addScaledVector(right,rock.scale.x*1.35).project(camera).x-rockCenter.x);
   const gap=(Math.abs(center.x-rockCenter.x)-planetRadius-rockRadius)*width/2;
   assert.ok(gap>15,body+' '+aspect+' gap '+gap);assert.ok(Math.abs(rockCenter.x)+rockRadius<1);
  }
 }
 engine.dispose();
});


function providerSetup() {
 const app=setup(),hooks=[],effects=[],observers=[],listeners=new Map(),windowListeners=new Map(),timers=new Map();
 let cursor=0,pathname='/asteroids',api,boundary=false,clock=0,timerId=0,engine;
 const equal=(a,b)=>a&&b&&a.length===b.length&&a.every((value,i)=>Object.is(value,b[i]));
 const react={createContext:()=>({Provider:'provider'}),useContext:()=>api,useRef(value){const i=cursor++;hooks[i]??={current:value};return hooks[i];},useMemo(fn,deps){const i=cursor++;if(!equal(hooks[i]?.deps,deps))hooks[i]={deps,value:fn()};return hooks[i].value;},useEffect(fn,deps){if(boundary){effects.push({fn});return;}const i=cursor++;if(!equal(hooks[i]?.deps,deps)){const old=hooks[i];hooks[i]={deps,cleanup:old?.cleanup};effects.push({i,fn,cleanup:old?.cleanup});}}};
 const jsx=(type,props)=>{if(props.ref)props.ref.current=app.layer;return {type,props};};
 const module={exports:{}};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/app/ui/orbital/scene-provider.tsx'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText,{module,exports:module.exports,console,URL,document:{addEventListener:(name,fn)=>listeners.set(name,fn),removeEventListener:name=>listeners.delete(name)},window:{location:{origin:'http://127.0.0.1:3100',get pathname(){return pathname;},get href(){return 'http://127.0.0.1:3100'+pathname;}},addEventListener:(name,fn)=>windowListeners.set(name,fn),removeEventListener:name=>windowListeners.delete(name)},IntersectionObserver:class {constructor(fn){this.fn=fn;observers.push(this);}observe(){}disconnect(){this.disconnected=true;}},setTimeout:(fn,delay)=>{timers.set(++timerId,{fn,due:clock+delay});return timerId;},clearTimeout:id=>timers.delete(id),require(name){if(name==='react')return react;if(name==='react/jsx-runtime')return {jsx,jsxs:jsx};if(name==='next/navigation')return {usePathname:()=>pathname};if(name==='./scene-engine')return {createSceneEngine:()=>{engine=app.engine();return engine;}};return require(name);}});
 function runEffects(){const pending=effects.splice(0);pending.forEach(item=>item.cleanup?.());pending.forEach(item=>{const cleanup=item.fn();if(item.i!=null)hooks[item.i].cleanup=cleanup;});}
 function render(){cursor=0;const tree=module.exports.default({children:null});api=tree.props.value;runEffects();}
 render();
 return {app,async flush(){await settle();await settle();},register(config={kind:'catalog',id:'3477703',paused:false}){const binding={host:app.element(),config,status(value){binding.state=value;}};const release=api.register(binding),observer=observers.at(-1);return {binding,release,show(){observer.fn([{isIntersecting:true}]);}};},click(destination){listeners.get('click')({button:0,target:{closest:()=>({href:'http://127.0.0.1:3100'+destination,hasAttribute:()=>false})}});},route(path){pathname=path;render();},unavailable(){boundary=true;module.exports.SceneUnavailable();boundary=false;runEffects();},back(){windowListeners.get('popstate')();},advance(ms){clock+=ms;for(const [id,timer] of Array.from(timers)){if(timer.due<=clock){timers.delete(id);timer.fn();}}},unmount(){hooks.forEach(hook=>hook?.cleanup?.());},get engine(){return engine;}};
}

test('a resolved unavailable profile removes its retained flight immediately instead of covering the error',async()=>{
 const provider=providerSetup(),catalog=provider.register();catalog.show();await provider.flush();provider.app.finish();provider.app.tick();
 provider.click('/asteroids/3477703/view');catalog.release();provider.route('/asteroids/3477703/view');provider.app.tick();assert.equal(provider.app.canvas.parent,provider.app.layer);
 provider.unavailable();assert.equal(provider.app.canvas.parent,null);assert.equal(provider.app.layer.style.display,'none');assert.equal(provider.app.frames.size,0);assert.equal(provider.app.stats.disposed,1);
 provider.advance(20000);assert.equal(provider.app.stats.disposed,1);provider.route('/asteroids');const retry=provider.register();retry.show();await provider.flush();provider.app.finish();provider.app.tick();assert.equal(provider.app.canvas.parent,retry.binding.host);assert.equal(provider.app.stats.renderers,2);provider.unmount();
});

test('a genuine slow route keeps its source past idle expiry and transfers once when the profile is ready',async()=>{
 const provider=providerSetup(),catalog=provider.register();catalog.show();await provider.flush();provider.app.finish();provider.app.tick();
 provider.click('/asteroids/3477703/view');catalog.release();provider.route('/asteroids/3477703/view');provider.advance(20000);provider.app.tick();
 assert.equal(provider.app.stats.disposed,0);assert.equal(provider.app.canvas.parent,provider.app.layer);
 const profile=provider.register({kind:'profile',id:'3477703',paused:false});profile.show();await provider.flush();provider.app.finish();provider.app.tick();
 assert.equal(provider.app.canvas.parent,profile.binding.host);assert.equal(provider.app.layer.style.display,'none');assert.equal(provider.app.stats.renderers,1);provider.unmount();assert.equal(provider.app.frames.size,0);
});

test('unavailable resolution invalidates a pending host import so late completion cannot recreate the overlay',async()=>{
 const provider=providerSetup(),catalog=provider.register();catalog.show();await provider.flush();provider.app.finish();provider.app.tick();provider.click('/asteroids/3477703/view');catalog.release();
 const pending=provider.register({kind:'profile',id:'3477703',paused:false});pending.show();provider.unavailable();await provider.flush();provider.app.finish();provider.app.tick();
 assert.equal(provider.app.stats.renderers,1);assert.equal(provider.app.stats.disposed,1);assert.equal(provider.app.canvas.parent,null);assert.equal(provider.app.layer.style.display,'none');assert.equal(provider.app.frames.size,0);pending.release();provider.unmount();
});

test('rapid navigation and Back cancel pending flight without losing the next real host',async()=>{
 const provider=providerSetup(),catalog=provider.register();catalog.show();await provider.flush();provider.app.finish();provider.app.tick();provider.click('/asteroids/3477703/view');catalog.release();
 const late=provider.register({kind:'profile',id:'3477703',paused:false});late.show();provider.back();late.release();provider.route('/asteroids');
 const returned=provider.register();returned.show();await provider.flush();provider.app.finish();provider.app.tick();
 assert.equal(provider.app.canvas.parent,returned.binding.host);assert.equal(provider.app.layer.style.display,'none');assert.equal(provider.app.stats.renderers,1);provider.unmount();assert.equal(provider.app.frames.size,0);
});

test('leaving a pending profile for a route with no scene releases the shared renderer',async()=>{
 const provider=providerSetup(),catalog=provider.register();catalog.show();await provider.flush();provider.app.finish();provider.app.tick();provider.click('/asteroids/3477703/view');catalog.release();provider.route('/privacy');await provider.flush();
 assert.equal(provider.app.stats.disposed,1);assert.equal(provider.app.canvas.parent,null);assert.equal(provider.app.layer.style.display,'none');assert.equal(provider.app.frames.size,0);provider.unmount();
});


test('the asteroid route error boundary releases the scene and offers safe reset/catalog actions',()=>{
 const exports={},marker=()=>null,jsx=(type,props)=>({type,props});let resets=0;
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/app/asteroids/error.tsx'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText,{exports,require(name){if(name==='react/jsx-runtime')return {jsx,jsxs:jsx,Fragment:'fragment'};if(name==='next/link')return {default:'a'};if(name.endsWith('/Header'))return {default:'header'};if(name.endsWith('/scene-provider'))return {SceneUnavailable:marker};return {default:new Proxy({},{get:(_,key)=>key})};}});
 const tree=exports.default({error:new Error('private upstream credentials must not render'),reset:()=>resets++});
 function find(predicate,node=tree){if(!node||typeof node!=='object')return;if(Array.isArray(node)){for(const item of node){const result=find(predicate,item);if(result)return result;}return;}if(predicate(node))return node;return find(predicate,node.props?.children??null);}
 assert.ok(find(node=>node.type===marker));find(node=>node.type==='button').props.onClick();assert.equal(resets,1);assert.equal(find(node=>node.type==='a').props.href,'/asteroids');assert.ok(!JSON.stringify(tree).includes('private upstream credentials'));
});
