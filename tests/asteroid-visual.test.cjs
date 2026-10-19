const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
const vm=require('node:vm');
const {createHash}=require('node:crypto');
const output={};
const source=fs.readFileSync(path.join(__dirname,'../src/app/lib/asteroids/visual.ts'),'utf8');
vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:output,require,Math});
const {asteroidVisual,surfaceSampler,asteroidProjection}=output;
test('visual identity survives A → B → A and independent evaluation',()=>{
 const first=JSON.stringify(asteroidVisual('3477703')); asteroidVisual('3708359');
 assert.equal(JSON.stringify(asteroidVisual('3477703')),first);
 const other={};vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:other,require,Math});
 assert.equal(JSON.stringify(other.asteroidVisual('3477703')),first);
});
test('four silhouette families occur with distinct, finite bounded surfaces',()=>{
 const families=new Set(), signatures=new Set();
 for(let i=0;i<240;i++) {
  const descriptor=asteroidVisual(String(3477703+i)); families.add(descriptor.family);
  const sample=surfaceSampler(descriptor), points=[];
  for(let j=0;j<100;j++){const y=1-2*j/99,a=j*2.399963,r=Math.sqrt(1-y*y),p=sample(r*Math.cos(a),y,r*Math.sin(a));assert.ok(p.every(Number.isFinite));assert.ok(Math.hypot(...p)>.2&&Math.hypot(...p)<3);points.push(p);}
  signatures.add(JSON.stringify(points));
 }
 assert.equal(families.size,4);assert.equal(signatures.size,240);
});

test('v5 population favors irregular rubble and keeps bilobes rare with six stable materials',()=>{
 const counts={rubble:0,elongated:0,shard:0,bilobed:0},textures=new Set(),scales=new Set();
 for(let i=0;i<10000;i++) {
  const d=asteroidVisual(String(2000000+i));assert.equal(d.version,5);counts[d.family]++;textures.add(d.texture);scales.add(d.textureScale.toFixed(2));
  assert.ok(d.textureScale>=.8&&d.textureScale<=1.6);assert.ok(d.textureOffset.every(x=>x>=0&&x<1));
 }
 assert.equal(textures.size,6);assert.ok(scales.size>60);
 for(const [family,proportion] of Object.entries({rubble:.6,elongated:.25,shard:.12,bilobed:.03}))assert.ok(Math.abs(counts[family]/10000-proportion)<.02,JSON.stringify(counts));
});
test('v4 remains explicit and frozen while v5 separates local surface profiles',()=>{
 const v4=output.asteroidVisualV4('3477703');
 assert.equal(createHash('sha256').update(JSON.stringify(['3477703','3708359','3878625'].map(id=>output.asteroidVisualV4(id)))).digest('hex'),'1d5719e7b2655f0737314471729881ad947b1e691f9fc7e45791911047ea0847');
 assert.equal(v4.version,4);assert.equal(JSON.stringify(v4),JSON.stringify(asteroidVisual('3477703',4)));
 const legacy=output.surfaceSamplerV4(v4),dispatch=surfaceSampler(v4);
 assert.equal(JSON.stringify(legacy(.3,.4,Math.sqrt(.75))),JSON.stringify(dispatch(.3,.4,Math.sqrt(.75))));
 const profiles=new Set(),craterCounts=new Set();
 for(let i=0;i<300;i++){const descriptor=asteroidVisual(String(4000000+i));profiles.add(descriptor.surface);craterCounts.add(descriptor.craters.length);if(descriptor.surface==='calm')assert.equal(descriptor.patches.length,0);}
 assert.equal(profiles.size,4);assert.ok(craterCounts.has(0));assert.ok(craterCounts.has(4));
});
test('the static projection preserves identity and a 100-unit physical height',()=>{
 for(const id of ['3519453','3708359','3878625','3477703']) {
  const visual=asteroidVisual(id), projection=asteroidProjection(visual);
  assert.equal(projection.path,asteroidProjection(asteroidVisual(id)).path);
  assert.ok(!/NaN|Infinity/.test(projection.path));
  const ys=[...projection.path.matchAll(/[ML](-?[\d.]+),(-?[\d.]+)/g)].map(m=>Number(m[2]));
  assert.equal(Math.min(...ys),0);assert.equal(Math.max(...ys),100);
 }
});
