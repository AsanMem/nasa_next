import * as THREE from "three";

/** An illustrative plasma scene, never driven by or presented as DONKI measurements. */
export function createSolarModel(earthGeometry: THREE.SphereGeometry, earthMaterial: THREE.MeshPhongMaterial) {
  const group = new THREE.Group(); group.name = "illustrative-solar-environment";
  const geometries: THREE.BufferGeometry[] = [], materials: THREE.Material[] = [];
  const time = { value: 0 };
  const sunGeometry = new THREE.SphereGeometry(1.18, 64, 48); geometries.push(sunGeometry);
  const sunMaterial = new THREE.ShaderMaterial({
    uniforms: { time },
    vertexShader: `varying vec3 sphere; varying vec3 normalView; varying vec3 eye;
      void main(){sphere=position;vec4 p=modelViewMatrix*vec4(position,1.);normalView=normalize(normalMatrix*normal);eye=normalize(-p.xyz);gl_Position=projectionMatrix*p;}`,
    fragmentShader: `uniform float time; varying vec3 sphere; varying vec3 normalView; varying vec3 eye;
      float hash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
      float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
        return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
        mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
      void main(){vec3 p=normalize(sphere);float t=time*.025;
        float large=noise(p*7.+vec3(0,t,0));float grain=noise(p*65.+large*3.+t);
        float threads=pow(abs(sin(p.y*46.+noise(p*12.+t)*11.)),6.);
        vec3 color=mix(vec3(.55,.055,.006),vec3(1.,.48,.085),grain*.65+large*.35);
        color=mix(color,vec3(1.,.83,.43),threads*.32);
        float limb=pow(max(0.,dot(normalize(normalView),normalize(eye))),.28);
        gl_FragColor=vec4(color*(.55+.55*limb),1.);}`,
  }); materials.push(sunMaterial);
  const sun = new THREE.Mesh(sunGeometry, sunMaterial); sun.position.x = -2.65; group.add(sun);
  const coronaMaterial = new THREE.ShaderMaterial({ transparent:true, depthWrite:false, side:THREE.BackSide, blending:THREE.AdditiveBlending,
    uniforms:{time}, vertexShader:`varying vec3 n;varying vec3 v;varying vec3 p;void main(){p=position;vec4 q=modelViewMatrix*vec4(position,1.);n=normalize(normalMatrix*normal);v=normalize(-q.xyz);gl_Position=projectionMatrix*q;}`,
    fragmentShader:`uniform float time;varying vec3 n;varying vec3 v;varying vec3 p;void main(){float rim=pow(1.-abs(dot(normalize(n),normalize(v))),3.);float ray=.65+.35*sin(atan(p.y,p.x)*31.+time*.12);gl_FragColor=vec4(1.,.24,.025,rim*ray*.4);}` }); materials.push(coronaMaterial);
  const coronaGeometry = new THREE.SphereGeometry(1.27,48,32); geometries.push(coronaGeometry);
  const corona = new THREE.Mesh(coronaGeometry,coronaMaterial); corona.position.copy(sun.position); group.add(corona);
  const earth = new THREE.Mesh(earthGeometry,earthMaterial); earth.name="solar-reference-earth";
  earth.scale.setScalar(.46); earth.position.set(2.7,0,0); earth.rotation.set(.12,3.9,-.12); group.add(earth);
  const atmosphereGeometry = new THREE.SphereGeometry(.655,48,32); geometries.push(atmosphereGeometry);
  const atmosphereMaterial = new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.BackSide,
    vertexShader:coronaMaterial.vertexShader,fragmentShader:`varying vec3 n;varying vec3 v;void main(){float rim=pow(1.-abs(dot(normalize(n),normalize(v))),3.);gl_FragColor=vec4(.12,.45,.85,rim*.6);}`}); materials.push(atmosphereMaterial);
  const atmosphere = new THREE.Mesh(atmosphereGeometry,atmosphereMaterial); atmosphere.position.copy(earth.position); group.add(atmosphere);

  // Braided prominences, anchored to the solar surface; apparent motion is illustrative.
  for(let strand=0;strand<9;strand++) {
    const points:THREE.Vector3[]=[];
    for(let i=0;i<=90;i++) {
      const t=i/90,arch=Math.sin(Math.PI*t),twist=t*Math.PI*4+strand*.66;
      points.push(new THREE.Vector3(-1.72+arch*(1.35+strand*.035), (t-.5)*1.42+Math.sin(twist)*arch*.18, .28+Math.cos(twist)*arch*.28));
    }
    const geometry=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),96,strand%3===0?.013:.006,5,false);geometries.push(geometry);
    const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{time,offset:{value:strand*.7}},
      vertexShader:`varying vec2 pathUv;void main(){pathUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
      fragmentShader:`uniform float time;uniform float offset;varying vec2 pathUv;void main(){float pulse=.35+.65*pow(.5+.5*sin(pathUv.x*22.-time*1.6+offset),3.);gl_FragColor=vec4(1.,.24+pulse*.3,.035,pulse*.85);}`});materials.push(material);group.add(new THREE.Mesh(geometry,material));
  }
  const count=360,positions=new Float32Array(count*3),seeds=new Float32Array(count*3);
  for(let i=0;i<count;i++){seeds[i*3]=(i*.61803398875)%1;seeds[i*3+1]=(i*.754877666)%1;seeds[i*3+2]=(i*.569840291)%1;}
  const flowGeometry=new THREE.BufferGeometry();flowGeometry.setAttribute("position",new THREE.BufferAttribute(positions,3));flowGeometry.setAttribute("seed",new THREE.BufferAttribute(seeds,3));geometries.push(flowGeometry);
  const flowMaterial=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{time},
    vertexShader:`uniform float time;attribute vec3 seed;varying float opacity;void main(){float t=fract(seed.x+time*.035);float x=-1.5+t*5.9;float a=seed.y*6.283+t*2.;float spread=.2+seed.z*.95;float deflection=exp(-pow((x-2.7)*.95,2.))*.85;
      vec3 p=vec3(x,sin(a)*(spread+deflection),cos(a)*(spread+deflection));vec4 q=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*q;gl_PointSize=2.2;opacity=sin(t*3.14159)*(.18+seed.z*.5);}`,
    fragmentShader:`varying float opacity;void main(){float r=length(gl_PointCoord-.5);gl_FragColor=vec4(1.,.56,.2,opacity*(1.-smoothstep(.1,.5,r)));}`});materials.push(flowMaterial);
  const flow=new THREE.Points(flowGeometry,flowMaterial);flow.frustumCulled=false;group.add(flow);
  // A few field-reference curves bend around Earth instead of claiming an impact path.
  for(const sign of [-1,1]) for(let lane=0;lane<3;lane++) {
    const points=Array.from({length:65},(_,i)=>{const t=i/64;return new THREE.Vector3(1.65+t*2.4,sign*Math.sin(t*Math.PI*.78)*(.85+lane*.19),-.15);});
    const geometry=new THREE.BufferGeometry().setFromPoints(points);geometries.push(geometry);
    const material=new THREE.LineBasicMaterial({color:0x638eaa,transparent:true,opacity:.2});materials.push(material);group.add(new THREE.Line(geometry,material));
  }
  return {group, update(delta:number){time.value+=delta;earth.rotation.y+=delta*.025;sun.rotation.y+=delta*.014;}, dispose(){geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());}};
}
