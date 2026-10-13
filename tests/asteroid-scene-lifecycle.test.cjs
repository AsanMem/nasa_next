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
  finish(){for(const tween of tweens.splice(0)){if(tween.killed)continue;tween.target.t=1;tween.options.onUpdate?.();tween.options.onComplete?.();}}
 };
}
function bind(app,engine,config={}){const binding={host:app.element(),config:{kind:'catalog',id:'3477703',paused:false,speed:9.17,...config},status(value){binding.state=value;}};engine.attach(binding);return binding;}
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
