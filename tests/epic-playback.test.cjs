const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), ts = require('typescript');

// Run the actual component with controlled React effects, image decoding and timers.
// This tests lifecycle logic, not browser rendering.
function setup() {
  const hooks = [], effects = [], timers = new Map(), listeners = new Map(), images = new Map();
  let cursor = 0, dirty = true, tree, timerId = 0;
  const equal = (a,b) => a && b && a.length === b.length && a.every((x,i) => Object.is(x,b[i]));
  const react = {
    useState(initial) {
      const id = cursor++; hooks[id] ??= { value: typeof initial === 'function' ? initial() : initial };
      return [hooks[id].value, value => { const next = typeof value === 'function' ? value(hooks[id].value) : value; if (!Object.is(next,hooks[id].value)) { hooks[id].value = next; dirty = true; } }];
    },
    useMemo(factory,deps) { const id=cursor++; if (!equal(hooks[id]?.deps,deps)) hooks[id]={deps,value:factory()}; return hooks[id].value; },
    useEffect(effect,deps) { const id=cursor++; if (!equal(hooks[id]?.deps,deps)) { const previous=hooks[id]; hooks[id]={deps,cleanup:previous?.cleanup}; effects.push({id,effect,cleanup:previous?.cleanup}); } },
  };
  const document = { hidden:false, addEventListener:(name,fn)=>listeners.set(name,fn), removeEventListener:name=>listeners.delete(name) };
  class Image {
    set src(url) { this.url=url; images.set(url,this); }
    decode() { return Promise.resolve(); }
  }
  const cache = new Map();
  function load(file) {
    file=path.resolve(__dirname,'..',file); if(cache.has(file))return cache.get(file);
    const exports={}; cache.set(file,exports);
    const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2020}}).outputText;
    vm.runInNewContext(code,{exports,Image,document,Intl,Date,console,
      setTimeout(fn,delay){timers.set(++timerId,{fn,delay});return timerId;},clearTimeout(id){timers.delete(id);},
      require(name){
        if(name==='react')return react;
        if(name==='react/jsx-runtime')return {jsx:(type,props)=>({type,props}),jsxs:(type,props)=>({type,props}),Fragment:'fragment'};
        if(name.endsWith('.css'))return {default:new Proxy({},{get:(_,key)=>key})};
        const base=path.resolve(path.dirname(file),name),target=['.ts','.tsx'].map(ext=>base+ext).find(fs.existsSync);
        return load(target);
      },
    });return exports;
  }
  const Component=load('src/app/ui/main/image-component.tsx').default;
  const props={images:[0,1,2].map(i=>({imageUrl:`frame-${i}`,date:`2026-10-11 0${i}:00:00`,caption:`Earth ${i}`}))};
  function render(){cursor=0;dirty=false;tree=Component(props);const pending=effects.splice(0);pending.forEach(x=>x.cleanup?.());pending.forEach(x=>hooks[x.id].cleanup=x.effect());}
  async function flush(){for(let i=0;i<12;i++){if(dirty)render();await Promise.resolve();}}
  function find(predicate,node=tree){if(!node||typeof node!=='object')return;if(Array.isArray(node)){for(const child of node){const found=find(predicate,child);if(found)return found;}return;}if(predicate(node))return node;return find(predicate,node.props?.children ?? null);}
  return {flush,document,timers,listeners,images,find,
    frame:()=>find(node=>node.props?.alt?.startsWith('Earth '))?.props.src,
    play:()=>find(node=>node.type==='button'&&node.props.children==='Play sequence').props.onClick(),
    choose:i=>find(node=>node.type==='button'&&node.props['aria-label']?.startsWith(`Show frame ${i+1},`)).props.onClick(),
    load:url=>images.get(url).onload(),
    advance(){const first=timers.entries().next().value;assert.ok(first);timers.delete(first[0]);first[1].fn();},
    unmount(){hooks.forEach(h=>h?.cleanup?.());},
  };
}
test('EPIC stays opt-in, waits for decoding, advances at 1500ms and stops when the tab is hidden',async()=>{
  const app=setup();await app.flush();assert.equal(app.timers.size,0);
  app.load('frame-0');await app.flush();app.play();await app.flush();
  assert.equal([...app.timers.values()][0].delay,1500);
  app.advance();await app.flush();assert.equal(app.frame(),'frame-0');assert.equal(app.timers.size,0);
  app.load('frame-1');await app.flush();assert.equal(app.frame(),'frame-1');assert.equal(app.timers.size,1);
  app.document.hidden=true;app.listeners.get('visibilitychange')();await app.flush();assert.equal(app.timers.size,0);
  app.document.hidden=false;app.listeners.get('visibilitychange')();await app.flush();assert.equal(app.timers.size,0);
  app.unmount();assert.equal(app.listeners.size,0);
});
test('EPIC rapid manual selection ignores an older load and unmount clears playback timers',async()=>{
  const app=setup();await app.flush();app.load('frame-0');await app.flush();
  app.choose(1);await app.flush();app.choose(2);await app.flush();
  app.load('frame-2');await app.flush();assert.equal(app.frame(),'frame-2');
  app.load('frame-1');await app.flush();assert.equal(app.frame(),'frame-2');
  app.play();await app.flush();assert.equal(app.timers.size,1);app.unmount();assert.equal(app.timers.size,0);assert.equal(app.listeners.size,0);
});
