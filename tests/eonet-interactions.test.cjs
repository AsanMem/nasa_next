const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');

// Execute the actual components with controlled hooks; renderer motion has its own
// lifecycle tests. These checks do not substitute for real-browser keyboard QA.
function setup(entry, props, reduced=false) {
  const hooks=[],effects=[],cache=new Map();let cursor=0,dirty=true,tree,focusRestores=0;
  const equal=(a,b)=>a&&b&&a.length===b.length&&a.every((x,i)=>Object.is(x,b[i]));
  const react={
    useState(initial){const i=cursor++;hooks[i]??={value:typeof initial==='function'?initial():initial};return[hooks[i].value,value=>{const next=typeof value==='function'?value(hooks[i].value):value;if(!Object.is(next,hooks[i].value)){hooks[i].value=next;dirty=true;}}];},
    useRef(value){const i=cursor++;hooks[i]??={current:value};return hooks[i];},
    useMemo(fn,deps){const i=cursor++;if(!equal(hooks[i]?.deps,deps))hooks[i]={deps,value:fn()};return hooks[i].value;},
    useCallback(fn,deps){return react.useMemo(()=>fn,deps);},
    useEffect(fn,deps){const i=cursor++;if(!equal(hooks[i]?.deps,deps)){hooks[i]={deps,cleanup:hooks[i]?.cleanup};effects.push({i,fn});}},
  };
  function load(file){
    file=path.resolve(file);if(cache.has(file))return cache.get(file);const exports={};cache.set(file,exports);
    const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2020}}).outputText;
    vm.runInNewContext(code,{exports,Date,Intl,URL,console,matchMedia:query=>({matches:query.includes('reduced')?reduced:true,addEventListener(){},removeEventListener(){}}),require(name){
      if(name==='react')return react;
      if(name==='react/jsx-runtime')return{jsx:(type,props)=>({type,props}),jsxs:(type,props)=>({type,props}),Fragment:'fragment'};
      if(name==='next/link')return{default:'a'};
      if(name.endsWith('.css'))return{default:new Proxy({},{get:(_,key)=>key})};
      if(name.endsWith('/chapter'))return{EmptyState:'empty'};
      if(name.endsWith('/scene-provider'))return{useOrbitalScene:()=>({host:null,status:'ready'})};
      const base=name.startsWith('@/')?path.resolve('src',name.slice(2)):path.resolve(path.dirname(file),name);
      return load(['.ts','.tsx'].map(ext=>base+ext).find(fs.existsSync));
    }});return exports;
  }
  const Component=load(entry).default;
  function flush(){for(let j=0;dirty&&j<20;j++){dirty=false;cursor=0;tree=Component(props);effects.splice(0).forEach(({i,fn})=>{hooks[i].cleanup?.();hooks[i].cleanup=fn();});}}
  function all(predicate,node=tree){if(!node||typeof node!=='object')return[];if(Array.isArray(node))return node.flatMap(x=>all(predicate,x??null));return [...(predicate(node)?[node]:[]),...all(predicate,node.props?.children??null)];}
  return{get focusRestores(){return focusRestores;},flush,all,find:fn=>all(fn)[0],update(next){Object.assign(props,next);dirty=true;flush();},click(fn){const node=all(fn)[0];assert.ok(node,'control exists');node.props.onClick({currentTarget:{focus(){focusRestores++;}}});flush();}};
}
const named=text=>node=>node.type==='button'&&node.props.children===text;
test('EONET cluster click focuses Earth on every click; individual selection restores its coordinates while paused',()=>{
  const points=[{id:'a',title:'A',category:'Storm',latitude:10,longitude:20},{id:'b',title:'B',category:'Storm',latitude:11,longitude:21}];
  let chosen;const app=setup('src/app/ui/eonet/event-map.tsx',{points,selectedId:'b',focusRevision:0,onSelect:id=>chosen=id});app.flush();
  const globe=()=>app.find(node=>node.type?.name==='Globe').props;
  app.click(node=>node.props?.['aria-label']==='Show 2 nearby events');
  assert.equal(globe().focus.id,'a');assert.equal(globe().paused,true);const revision=globe().focusRevision;
  app.click(named('Rotate Earth'));assert.equal(globe().paused,false);
  app.click(node=>node.props?.['aria-label']==='Show 2 nearby events');assert.ok(globe().focusRevision>revision);assert.equal(globe().paused,true);
  app.click(named('B'));assert.equal(chosen,'b');assert.equal(app.focusRestores,1);app.update({selectedId:'b',focusRevision:1});assert.equal(globe().focus.id,'b');
  app.update({points:[points[0],{...points[1],latitude:50}],focusRevision:2});assert.equal(globe().focus.latitude,50);
});
test('EONET reduced motion keeps cluster selection and disables automatic rotation',()=>{
  const app=setup('src/app/ui/eonet/event-map.tsx',{points:[{id:'a',title:'A',latitude:0,longitude:0},{id:'b',title:'B',latitude:1,longitude:1}],selectedId:'a',onSelect(){}},true);app.flush();
  assert.equal(app.find(named('Reduced motion')).props.disabled,true);
  app.click(node=>node.props?.['aria-label']==='Show 2 nearby events');assert.equal(app.all(named('B')).length,1);
});
test('EONET paginates eight records while mapping all filtered events and reveals marker selections on their page',()=>{
  const events=Array.from({length:17},(_,i)=>({id:String(i),title:'Event '+String(i).padStart(2,'0'),categories:[{title:i<9?'Storm':'Fire'}],geometry:[{type:'Point',coordinates:[i*10-80,0],date:'2026-10-01T00:00:00Z'}]}));
  const app=setup('src/app/ui/eonet/earth-events.tsx',{events});app.flush();
  const rows=()=>app.all(node=>node.type==='article');const map=()=>app.find(node=>node.type?.name==='EventMap').props;
  assert.equal(rows().length,8);assert.equal(map().points.length,17);
  app.click(named('Next'));assert.equal(rows()[0].props.id,'event-8');
  map().onSelect('16');app.flush();assert.equal(rows().length,1);assert.equal(rows()[0].props.id,'event-16');
  app.click(named('Storm'));assert.equal(map().points.length,9);assert.equal(rows().length,8);
  app.find(node=>node.type==='select'&&node.props.value==='latest').props.onChange({target:{value:'title'}});app.flush();
  assert.equal(rows()[0].props.id,'event-0');assert.equal(map().points.length,9);
});
