import * as THREE from "three";
import { bodyKey,bodyPalette,bodyPosition,sampleEncounterFlight } from "../../lib/asteroids/encounters";
import { asteroidDisplayScale } from "../../lib/asteroids/visual";
import type { SceneConfig } from "./scene-types";

/** A stage for NASA encounter records, never an ephemeris or calculated trajectory. */
export function createEncounterModel(earthMaterial:THREE.MeshPhongMaterial,moonMaterial:THREE.MeshPhongMaterial) {
  const group=new THREE.Group();group.name="illustrative-encounter-history";
  const sphere=new THREE.SphereGeometry(1,40,28),glowSphere=new THREE.SphereGeometry(1,32,20);
  const materials:THREE.Material[]=[];
  const sunMaterial=new THREE.ShaderMaterial({
    vertexShader:"varying vec3 p;varying vec3 n;void main(){p=position;n=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader:"varying vec3 p;varying vec3 n;void main(){float grain=fract(sin(dot(floor(p*85.),vec3(127.1,311.7,74.7)))*43758.5453);float cloud=.5+.5*sin(p.x*17.+sin(p.z*13.)*2.);float limb=pow(max(.02,dot(normalize(n),vec3(0.,0.,1.))),.35);vec3 color=mix(vec3(.87,.26,.025),vec3(1.,.78,.32),.4+grain*.22+cloud*.22);gl_FragColor=vec4(color*(.45+.55*limb),1.);}"});materials.push(sunMaterial);
  const sun=new THREE.Mesh(sphere,sunMaterial);sun.scale.setScalar(.72);group.add(sun);
  const glowMaterial=new THREE.MeshBasicMaterial({color:0xf3a84a,transparent:true,opacity:.12,side:THREE.BackSide,depthWrite:false});materials.push(glowMaterial);
  const glow=new THREE.Mesh(glowSphere,glowMaterial);glow.scale.setScalar(.94);group.add(glow);
  const trailGeometry=new THREE.BufferGeometry();const trailPoints=new Float32Array(32*3);trailGeometry.setAttribute("position",new THREE.BufferAttribute(trailPoints,3));
  const trailColors=new Float32Array(32*3),trailTone=new THREE.Color(0xedc18c);
  for(let i=0;i<32;i++){const fade=(i/31)**1.6;trailColors[i*3]=trailTone.r*fade;trailColors[i*3+1]=trailTone.g*fade;trailColors[i*3+2]=trailTone.b*fade;}trailGeometry.setAttribute("color",new THREE.BufferAttribute(trailColors,3));
  const trailMaterial=new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:.6});materials.push(trailMaterial);
  const trail=new THREE.Line(trailGeometry,trailMaterial);trail.frustumCulled=false;group.add(trail);
  const bodies=new Map<string,THREE.Mesh>();let signature="";
  const missingPosition=new THREE.Vector3();
  const position=(name:string)=>bodies.get(bodyKey(name))?.position??missingPosition;
  function configure(names:string[]) {
    const next=names.join("|");if(next===signature)return;signature=next;
    for(const body of Array.from(bodies.values())){group.remove(body);if(body.material!==earthMaterial&&body.material!==moonMaterial){(body.material as THREE.Material).dispose();const index=materials.indexOf(body.material as THREE.Material);if(index>=0)materials.splice(index,1);}}bodies.clear();
    names.forEach((name,index)=>{
      const key=bodyKey(name),style=bodyPalette[key]??{color:"#8796a5",kind:0};
      const material:THREE.Material=key==="earth"?earthMaterial:key==="moon"?moonMaterial:new THREE.ShaderMaterial({uniforms:{tone:{value:new THREE.Color(style.color)},kind:{value:style.kind}},
        vertexShader:"varying vec3 p;varying vec3 n;void main(){p=position;n=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
        fragmentShader:`uniform vec3 tone;uniform float kind;varying vec3 p;varying vec3 n;
          float hash(vec3 x){return fract(sin(dot(x,vec3(127.1,311.7,74.7)))*43758.5453);}
          void main(){float grain=hash(floor(p*65.));float cloud=sin(p.y*12.+sin(p.x*6.)*.7)*sin(p.z*8.);float bands=sin(p.y*25.+sin(p.z*5.));float detail=kind>1.5?bands*.13:kind>.5?cloud*.07:grain*.11;float light=.22+.85*max(0.,dot(normalize(n),normalize(vec3(-.7,.6,1.))));gl_FragColor=vec4(tone*(.9+detail)*light,1.);}`});
      if(material!==earthMaterial&&material!==moonMaterial)materials.push(material);
      const mesh=new THREE.Mesh(sphere,material);mesh.name=`encounter-body:${key}`;mesh.position.set(...bodyPosition(index,names.length));mesh.scale.setScalar(key==="moon"?.48:.72);mesh.rotation.set(.12,3.9,-.12);group.add(mesh);bodies.set(key,mesh);
    });
  }
  const point=new THREE.Vector3(),origin=new THREE.Vector3(),labelOffset=new THREE.Vector3(0,-.9,0);
  const center=new THREE.Vector3(),overview=new THREE.Vector3(),look=new THREE.Vector3();
  const fromLook=new THREE.Vector3(),toLook=new THREE.Vector3(),lookStartTangent=new THREE.Vector3(),lookEndTangent=new THREE.Vector3(),lookBend=new THREE.Vector3();
  const fromCamera=new THREE.Vector3(),toCamera=new THREE.Vector3(),cameraStartTangent=new THREE.Vector3(),cameraEndTangent=new THREE.Vector3(),cameraBend=new THREE.Vector3();
  const flight=()=>({start:new THREE.Vector3(),end:new THREE.Vector3(),startTangent:new THREE.Vector3(),endTangent:new THREE.Vector3(),bend:new THREE.Vector3()});
  const path=flight(),previousPath=flight();
  type Flight=ReturnType<typeof flight>;
  const hash=(key:string)=>{let value=2166136261;for(let i=0;i<key.length;i++)value=Math.imul(value^key.charCodeAt(i),16777619);return (value>>>0)/4294967295;};
  function waypoint(body:string,key:string,out:THREE.Vector3,tangent:THREE.Vector3) {
    const angle=hash(key)*Math.PI*2;
    out.copy(position(body));out.x+=2+Math.sin(angle)*.18;out.y+=.23+Math.cos(angle)*.08;out.z+=.4;
    tangent.set(.65,4.8+.28*Math.cos(angle),.9*Math.sin(angle));
  }
  function setPath(target:Flight,fromBody:string,fromKey:string,toBody:string,toKey:string) {
    waypoint(fromBody,fromKey,target.start,target.startTangent);waypoint(toBody,toKey,target.end,target.endTangent);target.bend.set(0,0,0);
    sampleEncounterFlight(point,target.start,target.end,target.startTangent,target.endTangent,target.bend,.5);
    const angle=hash(fromKey+"|"+toKey)*Math.PI*2,radius=Math.max(3.5,dataRadius*.85);
    // A lifted, open arc provides system context; it is unrelated to measured orbital elements.
    target.bend.set(center.x+Math.cos(angle)*radius,2.4,center.z+Math.sin(angle)*radius).sub(point);
  }
  function cameraAnchor(body:string,key:string,nearDistance:number,out:THREE.Vector3,target:THREE.Vector3,cameraTangent:THREE.Vector3,targetTangent:THREE.Vector3) {
    const angle=hash(key)*Math.PI*2;target.copy(position(body));target.x+=.85+.12*Math.sin(angle);target.z+=.2;
    out.copy(target);out.x+=.45*Math.sin(angle);out.y+=1.7+.14*Math.cos(angle);out.z+=nearDistance;
    cameraTangent.set(1.45,.14*Math.cos(angle),.35*Math.sin(angle));targetTangent.set(.55,0,.15*Math.sin(angle));
  }
  const projected:{id:string;x:number;y:number;visible:boolean}[]=[];
  let cameraKey="",dataRadius=4;
  function update(config:SceneConfig,camera:THREE.PerspectiveCamera,rock:THREE.Mesh) {
    const data=config.encounter!;configure(data.bodies);
    const motion=data.motion.current,t=motion?.progress??0;
    const fromBody=motion?.fromBody??data.body,toBody=motion?.toBody??data.body;
    const fromKey=motion?.fromKey??data.eventKey??fromBody,toKey=motion?.toKey??data.eventKey??toBody;
    const nextKey=`${signature}|${fromKey}|${toKey}|${motion?.previousKey??""}|${camera.aspect}`;
    if(nextKey!==cameraKey){
      cameraKey=nextKey;
      let minX=0,maxX=0,minZ=0,maxZ=0;
      for(const body of Array.from(bodies.values())){minX=Math.min(minX,body.position.x);maxX=Math.max(maxX,body.position.x);minZ=Math.min(minZ,body.position.z);maxZ=Math.max(maxZ,body.position.z);}
      center.set((minX+maxX)/2,0,(minZ+maxZ)/2);dataRadius=Math.max(4,(maxX-minX)/2,(maxZ-minZ)/2);
      const nearDistance=Math.max(7.8,5.7/camera.aspect);
      overview.set(center.x,Math.max(6.5,dataRadius*1.15),center.z+Math.max(18,dataRadius*2.25/camera.aspect));
      setPath(path,fromBody,fromKey,toBody,toKey);
      setPath(previousPath,motion?.previousBody??fromBody,motion?.previousKey??fromKey,fromBody,fromKey);
      cameraAnchor(fromBody,fromKey,nearDistance,fromCamera,fromLook,cameraStartTangent,lookStartTangent);
      cameraAnchor(toBody,toKey,nearDistance,toCamera,toLook,cameraEndTangent,lookEndTangent);
      cameraBend.set(0,0,0);sampleEncounterFlight(point,fromCamera,toCamera,cameraStartTangent,cameraEndTangent,cameraBend,.5);cameraBend.copy(overview).sub(point);
      lookBend.set(0,0,0);sampleEncounterFlight(point,fromLook,toLook,lookStartTangent,lookEndTangent,lookBend,.5);lookBend.copy(center).sub(point);
      projected.splice(0,projected.length,...["Sun",...data.bodies].map(id=>({id,x:0,y:0,visible:false})));
    }
    if(motion)sampleEncounterFlight(rock.position,path.start,path.end,path.startTangent,path.endTangent,path.bend,t);else rock.position.copy(path.start);
    rock.scale.setScalar(.24*asteroidDisplayScale(config.diameter));trail.visible=!!motion;
    if(trail.visible){for(let i=0;i<32;i++){const progress=t-.12+i/31*.12,segment=progress<0?previousPath:path;sampleEncounterFlight(point,segment.start,segment.end,segment.startTangent,segment.endTangent,segment.bend,progress<0?1+progress:progress);trailPoints[i*3]=point.x;trailPoints[i*3+1]=point.y;trailPoints[i*3+2]=point.z;}trailGeometry.attributes.position.needsUpdate=true;}
    if(motion){sampleEncounterFlight(camera.position,fromCamera,toCamera,cameraStartTangent,cameraEndTangent,cameraBend,t);sampleEncounterFlight(look,fromLook,toLook,lookStartTangent,lookEndTangent,lookBend,t);}
    else{camera.position.copy(fromCamera);look.copy(fromLook);}
    camera.lookAt(look);camera.updateMatrixWorld(true);
    const prominent=bodyKey(motion?(t<.5?fromBody:toBody):data.body),showAll=!!motion&&t>=.2&&t<=.8;
    for(const item of projected){point.copy(item.id==="Sun"?origin:position(item.id)).add(labelOffset).project(camera);item.x=(point.x+1)*50;item.y=(1-point.y)*50;item.visible=(showAll||bodyKey(item.id)===prominent)&&point.z<1&&point.z>-1&&Math.abs(point.x)<.98&&Math.abs(point.y)<.95;}
    config.projectBodies?.(projected);
  }
  return {group,update,dispose(){sphere.dispose();glowSphere.dispose();trailGeometry.dispose();materials.forEach(item=>item.dispose());group.clear();}};
}
