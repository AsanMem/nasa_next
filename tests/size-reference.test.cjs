const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ts=require('typescript');
const THREE=require('three');
const exportsObject={};
const source=fs.readFileSync(path.join(__dirname,'../src/app/lib/asteroids/size-reference.ts'),'utf8');
vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:exportsObject,Math,Number});
const {defaultSizeReference,sizeReference,sizeComparisonLayout,SIZE_REFERENCES,validComparisonDiameter}=exportsObject;

test('automatic references use the approved boundaries and compare the correct dimension',()=>{
 for(const [diameter,id] of [[.1,'person'],[9.999,'person'],[10,'bus'],[59.999,'bus'],[60,'pitch'],[299.999,'pitch'],[300,'burj'],[828,'burj'],[1656,'burj']])assert.equal(defaultSizeReference(diameter),id);
 for(const value of [undefined,null,0,-1,NaN,Infinity])assert.equal(validComparisonDiameter(value),false);
 assert.equal(sizeReference('bus').metres,12);assert.equal(sizeReference('bus').dimension,'length');
 assert.equal(sizeReference('pitch').width,105);assert.equal(sizeReference('pitch').height,68);assert.equal(sizeReference('pitch').dimension,'length');
 assert.equal(sizeReference('burj').metres,828);assert.equal(sizeReference('burj').dimension,'height');
});

test('shared contours have exact canonical extents in actual Three geometry',()=>{
 for(const reference of SIZE_REFERENCES){
  const group=new THREE.Group();
  for(const points of reference.parts){const shape=new THREE.Shape();points.forEach(([x,y],index)=>index?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();group.add(new THREE.Mesh(new THREE.ShapeGeometry(shape)));}
  const bounds=new THREE.Box3().setFromObject(group,true).getSize(new THREE.Vector3());
  const extent=reference.dimension==='height'?bounds.y:bounds.x;
  assert.ok(Math.abs(extent-reference.metres)<.00001,reference.id);
  assert.ok(Math.abs(bounds.x-reference.width)<.00001,reference.id+' width');
  assert.ok(Math.abs(bounds.y-reference.height)<.00001,reference.id+' height');
  group.children.forEach(mesh=>{mesh.geometry.dispose();mesh.material.dispose();});
 }
});

test('one metres-per-pixel factor preserves every ratio, including manual human and Burj choices',()=>{
 for(const diameter of [1,1.8,6.22,19.66,59.99,60,105,243,300,828,1656,10000,40000])for(const reference of SIZE_REFERENCES){
  const layout=sizeComparisonLayout(diameter,1.3,reference);
  assert.ok(layout.unit>0&&Number.isFinite(layout.unit));
  const renderedReference=reference.dimension==='height'?layout.referenceHeight:layout.referenceWidth;
  assert.ok(Math.abs(layout.rockExtent/renderedReference-diameter/reference.metres)<1e-8);
  assert.ok(layout.rockHeight<=348+.00001&&layout.referenceHeight<=348+.00001);
 }
 const equal=sizeComparisonLayout(828,1.2,sizeReference('burj'));
 assert.equal(equal.rockHeight,equal.referenceHeight);
 const twice=sizeComparisonLayout(1656,1.2,sizeReference('burj'));
 assert.equal(twice.rockHeight,twice.referenceHeight*2);
 for(const id of ['bus','pitch']){const reference=sizeReference(id);const equalLength=sizeComparisonLayout(reference.metres,1.3,reference);assert.equal(equalLength.rockWidth,equalLength.referenceWidth);assert.equal(equalLength.horizontal,true);}
 assert.equal(sizeComparisonLayout(NaN,1,sizeReference('person')),null);
 assert.equal(sizeComparisonLayout(100,0,sizeReference('person')),null);
});
