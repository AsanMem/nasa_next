import * as THREE from 'three';
import type { BirthSky } from '../../lib/sky/model';
import { skyVector } from '../../lib/sky/coordinates';
import type { SceneConfig } from './scene-types';
/** Frozen, observer-centred celestial sphere. Uses the provider's existing renderer. */
export function createSkyModel(){
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(75,1,.01,150),contents=new THREE.Group();scene.add(contents);
 scene.background=new THREE.Color('#050d20');let current:BirthSky|undefined;
 const resources:{dispose():void}[]=[];
 function clear(){resources.forEach(r=>r.dispose());resources.length=0;contents.clear();}
 function rebuild(sky:BirthSky){
  clear();current=sky;
  const points=sky.stars.filter(p=>p.altitude>=0&&p.magnitude<=6.5).concat(sky.bodies.filter(p=>p.altitude>=0));
  const positions:number[]=[],colors:number[]=[],sizes:number[]=[];
  points.forEach(p=>{positions.push(...skyVector(p).map(v=>v*75));const color=new THREE.Color(p.color);colors.push(color.r,color.g,color.b);sizes.push(p.body?p.name==='Sun'?14:p.name==='Moon'?12:7:Math.max(1.1,5-p.magnitude*.62));});
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.setAttribute('size',new THREE.Float32BufferAttribute(sizes,1));
  const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,vertexColors:true,vertexShader:'attribute float size; varying vec3 starColor; void main(){starColor=color;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_PointSize=size;}',fragmentShader:'varying vec3 starColor; void main(){float r=length(gl_PointCoord-.5)*2.;if(r>1.)discard;gl_FragColor=vec4(starColor,smoothstep(1.,.25,r));}'});
  contents.add(new THREE.Points(geometry,material));resources.push(geometry,material);
  const linePoints:number[]=[];sky.lines.forEach(([a,b])=>{if(a.altitude>=0&&b.altitude>=0){linePoints.push(...skyVector(a).map(v=>v*74),...skyVector(b).map(v=>v*74));}});
  const lineGeometry=new THREE.BufferGeometry();lineGeometry.setAttribute('position',new THREE.Float32BufferAttribute(linePoints,3));const lineMaterial=new THREE.LineBasicMaterial({color:'#91bdda',transparent:true,opacity:.19});contents.add(new THREE.LineSegments(lineGeometry,lineMaterial));resources.push(lineGeometry,lineMaterial);
  const horizon=new THREE.BufferGeometry().setFromPoints(Array.from({length:181},(_,i)=>{const a=i/180*Math.PI*2;return new THREE.Vector3(Math.sin(a)*75,0,-Math.cos(a)*75);}));const horizonMaterial=new THREE.LineBasicMaterial({color:'#d8c1a3',transparent:true,opacity:.65});contents.add(new THREE.Line(horizon,horizonMaterial));resources.push(horizon,horizonMaterial);
  const groundGeometry=new THREE.CircleGeometry(90,80),groundMaterial=new THREE.MeshBasicMaterial({color:'#101a29',side:THREE.DoubleSide});const ground=new THREE.Mesh(groundGeometry,groundMaterial);ground.rotation.x=-Math.PI/2;ground.position.y=-.025;contents.add(ground);resources.push(groundGeometry,groundMaterial);
 }
 return {scene,camera,update(config:SceneConfig,aspect:number){
  if(!config.sky)return;if(current!==config.sky.data)rebuild(config.sky.data);
  camera.aspect=aspect;camera.updateProjectionMatrix();camera.position.set(0,0,0);const direction=skyVector({azimuth:config.sky.azimuth,altitude:Math.min(89.9,config.sky.altitude)});camera.lookAt(...direction);camera.updateMatrixWorld(true);
  config.projectBodies?.(config.sky.data.bodies.filter(b=>b.altitude>=0).concat([{id:'North',name:'North',altitude:0,azimuth:0,magnitude:0,color:''},{id:'East',name:'East',altitude:0,azimuth:90,magnitude:0,color:''},{id:'South',name:'South',altitude:0,azimuth:180,magnitude:0,color:''},{id:'West',name:'West',altitude:0,azimuth:270,magnitude:0,color:''}]).map(b=>{const world=new THREE.Vector3(...skyVector(b)).multiplyScalar(74),p=world.clone().project(camera);const facing=world.dot(new THREE.Vector3(...direction))>0;return {id:b.name,x:(p.x+1)*50,y:(1-p.y)*50,visible:facing&&p.x>-.9&&p.x<.9&&p.y>-.9&&p.y<.9};}));
 },dispose(){clear();}};
}
