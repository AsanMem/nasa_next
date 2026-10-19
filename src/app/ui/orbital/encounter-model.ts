import * as THREE from "three";
import { AU_KM,BODY_RADIUS_KM,BODY_TONE,PLANETS,SYSTEM_BODIES,eclipticToScene,planetPeriodDays,planetPosition } from "../../lib/asteroids/physical-planets";
import { encounterZoom } from "../../lib/asteroids/encounter-playback";
import { sampleTrajectoryTrack } from "../../lib/asteroids/trajectory";
import type { SceneConfig } from "./scene-types";

/** Physical AU centers; only camera framing and labelled overview markers are enlarged. */
export function createEncounterModel(earthMaterial:THREE.MeshPhongMaterial,moonMaterial:THREE.MeshPhongMaterial) {
  const group=new THREE.Group();group.name="physical-encounter-history";
  const sphere=new THREE.SphereGeometry(1,32,22),materials:THREE.Material[]=[],geometries:THREE.BufferGeometry[]=[sphere];
  const bodies=new Map<string,THREE.Mesh>(),orbits=new THREE.Group();group.add(orbits);
  function ensureBody(name:string){if(bodies.has(name))return;
    const material=name==="Earth"?earthMaterial:name==="Moon"?moonMaterial:name==="Sun"?new THREE.MeshBasicMaterial({color:BODY_TONE[name]}):new THREE.ShaderMaterial({uniforms:{tone:{value:new THREE.Color(BODY_TONE[name]??"#8796a5")},bands:{value:["Jupiter","Saturn"].includes(name)?1:0}},vertexShader:"varying vec3 p;varying vec3 n;void main(){p=position;n=normalMatrix*normal;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",fragmentShader:"uniform vec3 tone;uniform float bands;varying vec3 p;varying vec3 n;void main(){float texture=sin(p.y*25.+sin(p.z*7.)*.7)*.08;float light=.4+.6*max(0.,dot(normalize(n),normalize(vec3(-.5,.6,1.))));gl_FragColor=vec4(tone*(1.+texture*bands)*light,1.);}"});
    if(material!==earthMaterial&&material!==moonMaterial)materials.push(material);
    const mesh=new THREE.Mesh(sphere,material);mesh.name=`encounter-body:${name.toLowerCase()}`;mesh.rotation.set(.12,3.9,-.12);group.add(mesh);bodies.set(name,mesh);
  }
  SYSTEM_BODIES.forEach(ensureBody);
  const ringGeometry=new THREE.RingGeometry(1.35,2.25,56),ringMaterial=new THREE.MeshBasicMaterial({color:0xc9b58d,side:THREE.DoubleSide,transparent:true,opacity:.5});geometries.push(ringGeometry);materials.push(ringMaterial);
  const saturnRing=new THREE.Mesh(ringGeometry,ringMaterial);saturnRing.rotation.x=1.1;bodies.get("Saturn")!.add(saturnRing);
  const beltPositions=new Float32Array(700*3);let seed=94623;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  for(let i=0;i<700;i++){const a=random()*Math.PI*2,r=Math.sqrt(2.1**2+random()*(3.3**2-2.1**2));beltPositions[i*3]=Math.cos(a)*r;beltPositions[i*3+1]=(random()-.5)*.14;beltPositions[i*3+2]=-Math.sin(a)*r;}
  const beltGeometry=new THREE.BufferGeometry();beltGeometry.setAttribute("position",new THREE.BufferAttribute(beltPositions,3));geometries.push(beltGeometry);
  const beltMaterial=new THREE.PointsMaterial({color:0x71808c,size:1.1,sizeAttenuation:false,transparent:true,opacity:.42,depthWrite:false});materials.push(beltMaterial);
  const belt=new THREE.Points(beltGeometry,beltMaterial);belt.name="schematic-main-asteroid-belt";group.add(belt);
  const pathGeometry=new THREE.BufferGeometry(),pathPositions=new Float32Array(1025*3),pathMaterial=new THREE.LineBasicMaterial({color:0xedc18c,transparent:true,opacity:.65});pathGeometry.setAttribute("position",new THREE.BufferAttribute(pathPositions,3));pathGeometry.setDrawRange(0,0);geometries.push(pathGeometry);materials.push(pathMaterial);
  const pathLine=new THREE.Line(pathGeometry,pathMaterial);pathLine.name="jpl-asteroid-trajectory";pathLine.frustumCulled=false;group.add(pathLine);
  const markerGeometry=new THREE.BufferGeometry(),markerPositions=new Float32Array(6);markerGeometry.setAttribute("position",new THREE.BufferAttribute(markerPositions,3));geometries.push(markerGeometry);
  const markerMaterial=new THREE.PointsMaterial({color:0xedc18c,size:6,sizeAttenuation:false,depthTest:false,transparent:true,opacity:.95});materials.push(markerMaterial);
  const markers=new THREE.Points(markerGeometry,markerMaterial);markers.name="enlarged-physical-center-markers";markers.frustumCulled=false;markers.renderOrder=8;group.add(markers);
  const physical=new THREE.Vector3(),asteroid=new THREE.Vector3(),target=new THREE.Vector3(),origin=new THREE.Vector3(),closeOrigin=new THREE.Vector3(),closeCenter=new THREE.Vector3(),point=new THREE.Vector3(),focus=new THREE.Vector3(),offset=new THREE.Vector3(),min=new THREE.Vector3(),max=new THREE.Vector3();
  const projected=SYSTEM_BODIES.map(id=>({id,x:0,y:0,visible:false}));projected.push({id:"Asteroid",x:0,y:0,visible:false});
  let trajectoryKey="",pathKey="",orbitKey=0,closeRadius=.1;
  function configureOrbits(utcMs:number){
    if(orbitKey===utcMs)return;
    const period=planetPeriodDays("Earth");if(!period)return;orbitKey=utcMs;
    for(const item of [...orbits.children]){orbits.remove(item);const line=item as THREE.Line;line.geometry.dispose();(line.material as THREE.Material).dispose();}
    for(const name of PLANETS){const positions=new Float32Array(193*3),days=planetPeriodDays(name);for(let i=0;i<=192;i++){planetPosition(name,utcMs+(i/192-.5)*days*86400000,physical);positions[i*3]=physical.x;positions[i*3+1]=physical.z;positions[i*3+2]=-physical.y;}const geometry=new THREE.BufferGeometry();geometry.setAttribute("position",new THREE.BufferAttribute(positions,3));const material=new THREE.LineBasicMaterial({color:0x7a8b99,transparent:true,opacity:.18});const line=new THREE.Line(geometry,material);line.name=`planet-orbit:${name.toLowerCase()}`;orbits.add(line);}
  }
  function update(config:SceneConfig,camera:THREE.PerspectiveCamera,rock:THREE.Mesh){
    const data=config.encounter!,frame=data.physical?.current,trajectory=frame?.trajectory;
    const utcMs=frame?.utcMs??Date.UTC(2000,0,1,12),view=data.view??"inner",phase=frame?.phase??"idle",progress=frame?.progress??0,zoom=trajectory?encounterZoom(view,phase,progress):0;
    if(trajectory&&!SYSTEM_BODIES.some(name=>name.toLowerCase()===trajectory.body.toLowerCase()))ensureBody(trajectory.body);
    const available=!!trajectory&&phase!=="jump"&&sampleTrajectoryTrack(trajectory.close.asteroid,utcMs,asteroid)&&sampleTrajectoryTrack(trajectory.close.target,utcMs,target);
    configureOrbits(trajectory?.encounterUtcMs??Date.UTC(new Date(utcMs).getUTCFullYear(),0,1));
    const key=trajectory?`${trajectory.target.spkId}|${trajectory.eventKey}|${trajectory.encounterUtcMs}`:"";
    if(trajectory&&trajectoryKey!==key){
      trajectoryKey=key;sampleTrajectoryTrack(trajectory.close.target,trajectory.encounterUtcMs,closeOrigin);
      min.set(0,0,0);max.set(0,0,0);
      for(const sample of trajectory.close.asteroid.samples){sampleTrajectoryTrack(trajectory.close.target,sample.utcMs,physical);point.set(sample.x-physical.x,sample.y-physical.y,sample.z-physical.z);min.min(point);max.max(point);}
      closeCenter.addVectors(min,max).multiplyScalar(.5);closeRadius=Math.max(2e-5,min.distanceTo(max)*.55);
    }
    const nextPathKey=key+(zoom>.5?"close":"overview");
    if(trajectory&&nextPathKey!==pathKey){pathKey=nextPathKey;const samples=(zoom>.5?trajectory.close:trajectory.overview).asteroid.samples,positions=pathPositions;for(let i=0;i<samples.length;i++){const item=samples[i];if(zoom>.5)sampleTrajectoryTrack(trajectory.close.target,item.utcMs,physical);else physical.copy(closeOrigin);positions[i*3]=item.x-physical.x;positions[i*3+1]=item.z-physical.z;positions[i*3+2]=physical.y-item.y;}pathGeometry.attributes.position.needsUpdate=true;pathGeometry.setDrawRange(0,samples.length);}
    origin.copy(available?target:closeOrigin).multiplyScalar(zoom);focus.set(closeCenter.x,closeCenter.z,-closeCenter.y).multiplyScalar(zoom);
    const systemRadius=view==="whole"?34:6.3,halfFrustum=Math.atan(Math.tan(camera.fov*Math.PI/360)*Math.min(1,camera.aspect)),systemDistance=view==="whole"?systemRadius*1.1/(Math.sin(halfFrustum)*Math.hypot(1,.62)):systemRadius*1.85/Math.min(1,camera.aspect),closeDistance=closeRadius*2.6/Math.min(1,camera.aspect),distance=systemDistance*(1-zoom)+closeDistance*zoom;
    const angle=.15+(phase==="flyby"?Math.sin(Math.PI*progress)**2*.22:0);offset.set(Math.sin(angle)*distance,distance*.62,Math.cos(angle)*distance);camera.position.copy(focus).add(offset);camera.near=Math.max(1e-10,distance*1e-5);camera.far=Math.max(systemRadius*4,distance*7);camera.updateProjectionMatrix();camera.lookAt(focus);camera.updateMatrixWorld(true);
    for(const [name,mesh] of Array.from(bodies.entries())){const coherent=available&&name.toLowerCase()===trajectory!.body.toLowerCase();if(view==="inner"&&zoom<.75&&["Saturn","Uranus","Neptune"].includes(name)&&!coherent){mesh.visible=false;continue;}if(coherent)physical.copy(target);else if(!planetPosition(name,utcMs,physical)){mesh.visible=false;continue;}mesh.visible=true;eclipticToScene(mesh.position,physical,origin);const radius=(BODY_RADIUS_KM[name]??0)/AU_KM,compression=name==="Sun"?2.6:Math.max(.55,Math.min(3,((BODY_RADIUS_KM[name]??6371)/6371)**.3)),markerRadius=camera.position.distanceTo(mesh.position)*Math.tan(camera.fov*Math.PI/360)*.018*compression;mesh.scale.setScalar(radius*zoom+Math.max(radius,markerRadius)*(1-zoom));}
    eclipticToScene(point,zoom>.5&&available?target:closeOrigin,origin);pathLine.position.copy(point);pathLine.visible=!!trajectory&&phase!=="jump";pathMaterial.opacity=.6;
    orbits.position.set(-origin.x,-origin.z,origin.y);belt.position.copy(orbits.position);beltMaterial.opacity=.42*(1-zoom);for(const child of orbits.children)(child as THREE.Line).visible=zoom<.85&&(view==="whole"||!["planet-orbit:saturn","planet-orbit:uranus","planet-orbit:neptune"].includes(child.name));
    rock.visible=available;if(available){eclipticToScene(rock.position,asteroid,origin);rock.scale.setScalar(config.diameter&&config.diameter>0?config.diameter/1000/AU_KM/2:0);}
    markers.visible=available;if(available){eclipticToScene(point,asteroid,origin);markerPositions[0]=point.x;markerPositions[1]=point.y;markerPositions[2]=point.z;eclipticToScene(point,target,origin);markerPositions[3]=point.x;markerPositions[4]=point.y;markerPositions[5]=point.z;markerGeometry.attributes.position.needsUpdate=true;markerGeometry.setDrawRange(0,zoom>.8?2:1);}
    if(trajectory&&!projected.some(item=>item.id===trajectory.body))projected.push({id:trajectory.body,x:0,y:0,visible:false});
    for(const item of projected){const mesh=bodies.get(item.id);if(item.id==="Asteroid"){if(!available){item.visible=false;continue;}point.copy(rock.position);}else if(mesh?.visible)point.copy(mesh.position);else{item.visible=false;continue;}point.project(camera);item.x=(point.x+1)*50;item.y=(1-point.y)*50;item.visible=point.z>-1&&point.z<1&&Math.abs(point.x)<.97&&Math.abs(point.y)<.9&&(zoom<.7||item.id==="Asteroid"||item.id.toLowerCase()===trajectory?.body.toLowerCase());}
    config.projectBodies?.(projected);
  }
  return {group,update,dispose(){for(const child of orbits.children){const line=child as THREE.Line;line.geometry.dispose();(line.material as THREE.Material).dispose();}geometries.forEach(item=>item.dispose());materials.forEach(item=>item.dispose());group.clear();}};
}
