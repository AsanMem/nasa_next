import { createSolarModel } from "./solar-model";
import { createSkyModel } from "./sky-model";
import { createEncounterModel } from "./encounter-model";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { gsap } from "gsap";
import { asteroidVisual, asteroidDisplayScale, randomStream, surfaceSampler } from "../../lib/asteroids/visual";
import { defaultSizeReference, sizeReference, SIZE_REFERENCES, validComparisonDiameter, type SizeReferenceId } from "../../lib/asteroids/size-reference";
import type { SceneBinding, SceneConfig, SceneEngine } from "./scene-types";

type Rock = { mesh: THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>; dispose(): void; height: number; bottom: number; left: number; right: number; rotation: THREE.Euler; lengthBounds: { width: number; height: number; bottom: number; left: number; right: number; rotation: THREE.Euler } };
export function createRock(id: string, wake: () => void, version: 4 | 5 = 5): Rock {
  const descriptor = asteroidVisual(id, version), sample = surfaceSampler(descriptor);
  const original = new THREE.IcosahedronGeometry(1, 24);
  const geometry = mergeVertices(original); original.dispose();
  const positions = geometry.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < positions.count; i++) {
    v.fromBufferAttribute(positions, i).normalize();
    const [x, y, z] = sample(v.x, v.y, v.z); positions.setXYZ(i, x, y, z);
  }
  geometry.computeVertexNormals(); geometry.computeBoundingSphere();
  const normalizer = 1 / geometry.boundingSphere!.radius;
  geometry.scale(normalizer, normalizer, normalizer);
  const material = new THREE.MeshStandardMaterial({ color: descriptor.tint, roughness: descriptor.roughness, metalness: descriptor.version === 4 ? .015 : 0, bumpScale: descriptor.version === 4 ? .018 : 0 });
  const mesh = new THREE.Mesh(geometry, material); mesh.name = `asteroid:${id}`;
  mesh.rotation.set(...descriptor.rotation);
  const bounds = new THREE.Box3().setFromObject(mesh, true);
  const rotation = mesh.rotation.clone();
  mesh.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),Math.PI/2));
  const horizontalBounds = new THREE.Box3().setFromObject(mesh,true);
  const lengthBounds = { width: horizontalBounds.max.x-horizontalBounds.min.x, height: horizontalBounds.max.y-horizontalBounds.min.y, bottom: horizontalBounds.min.y, left: horizontalBounds.min.x, right: horizontalBounds.max.x, rotation: mesh.rotation.clone() };
  mesh.rotation.copy(rotation);
  let disposed = false;
  const texture = new THREE.TextureLoader().load(`/media/asteroid/textures/${descriptor.texture}`, loaded => {
    if (disposed) { loaded.dispose(); return; }
    loaded.colorSpace = THREE.SRGBColorSpace; loaded.wrapS=loaded.wrapT=THREE.RepeatWrapping; loaded.repeat.set(descriptor.textureScale,descriptor.textureScale); loaded.offset.set(...descriptor.textureOffset); material.map = loaded;
    // A colour photograph is not a measured height map. Only explicit legacy
    // v4 comparisons retain the old universal RGB bump treatment.
    if (descriptor.version === 4) material.bumpMap = loaded;
    material.needsUpdate = true; wake();
  }, undefined, () => { /* The lit base material remains usable. */ });
  return { mesh, height: bounds.max.y - bounds.min.y, bottom: bounds.min.y, left: bounds.min.x, right: bounds.max.x, rotation, lengthBounds,
    dispose() { disposed = true; geometry.dispose(); material.dispose(); texture.dispose(); } };
}

/** One renderer survives route templates. Only its DOM host and camera state change. */
export function createSceneEngine(flightHost: HTMLElement): SceneEngine {
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.setClearColor(0x030609, 0);
  renderer.domElement.setAttribute("aria-hidden", "true");
  Object.assign(renderer.domElement.style, { width: "100%", height: "100%", display: "block" });
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, .1, 150);
  const scaleCamera = new THREE.OrthographicCamera(-3, 3, 2, -2, .1, 100);
  scene.add(new THREE.AmbientLight(0xb9cbe0, .5));
  const sun = new THREE.DirectionalLight(0xffe9d0, 3.5); sun.position.set(-3, 4, 5); scene.add(sun);
  const rim = new THREE.DirectionalLight(0x9ab7d9, 1.25); rim.position.set(3, 1, -3); scene.add(rim);
  const rockFill = new THREE.DirectionalLight(0xe0e9f2, 2.6); rockFill.position.set(0, 1, 5); scene.add(rockFill);
  let solarModel: ReturnType<typeof createSolarModel> | undefined;
  let skyModel: ReturnType<typeof createSkyModel> | undefined;
  let encounterModel:ReturnType<typeof createEncounterModel>|undefined;
  const home = new THREE.Group(); scene.add(home);
  const earthGeometry = new THREE.SphereGeometry(1.38, 64, 48);
  const earthMaterial = new THREE.MeshPhongMaterial({ shininess: 6, specular: 0x27333b });
  const earth = new THREE.Mesh(earthGeometry, earthMaterial); earth.name = 'reference-earth'; earth.rotation.set(.12, 3.9, -.12); home.add(earth);
  const atmosphereGeometry = new THREE.SphereGeometry(1.414, 48, 32);
  const atmosphereMaterial = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.BackSide,
    vertexShader: "varying vec3 n; varying vec3 v; void main(){vec4 p=modelViewMatrix*vec4(position,1.0);n=normalize(normalMatrix*normal);v=normalize(-p.xyz);gl_Position=projectionMatrix*p;}",
    fragmentShader: "varying vec3 n; varying vec3 v; void main(){float rim=pow(1.0-abs(dot(normalize(n),normalize(v))),3.0);gl_FragColor=vec4(.22,.49,.82,rim*.48);}" });
  home.add(new THREE.Mesh(atmosphereGeometry, atmosphereMaterial));
  const orbitalPlane = new THREE.Group(); orbitalPlane.rotation.set(.05, -.18, -.4); home.add(orbitalPlane);
  const orbitGeometry = new THREE.BufferGeometry().setFromPoints(Array.from({ length: 181 }, (_, i) => {
    const a = i / 180 * Math.PI * 2; return new THREE.Vector3(Math.cos(a) * 2.35, Math.sin(a) * .9, Math.sin(a) * 2.17198);
  }));
  const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xcfb799, transparent: true, opacity: .45 });
  orbitalPlane.add(new THREE.Line(orbitGeometry, orbitMaterial));
  const moonGeometry = new THREE.SphereGeometry(.23, 32, 24), moonMaterial = new THREE.MeshPhongMaterial({ color: 0xe0ded8, shininess: 0 });
  const moon = new THREE.Mesh(moonGeometry, moonMaterial); orbitalPlane.add(moon);
  let disposed = false, lost = false, frame = 0, lastTime = 0, visible = false, orbitTime = .68;
  let binding: SceneBinding | null = null, controls: OrbitControls | undefined, observer: IntersectionObserver | undefined, resizeObserver: ResizeObserver | undefined;
  let activeRock: Rock | undefined;
  let eventFocus: { from: THREE.Quaternion; to: THREE.Quaternion; elapsed: number } | undefined;
  function focusEarth(config: SceneConfig, instant = false) {
    if (config.kind !== 'events') { eventFocus = undefined; return; }
    const to = new THREE.Quaternion().setFromEuler(new THREE.Euler((config.focus?.latitude ?? 0) * Math.PI / 180, -Math.PI / 2 - (config.focus?.longitude ?? 0) * Math.PI / 180, 0, 'XYZ'));
    if (instant || preference.matches) { earth.quaternion.copy(to); eventFocus = undefined; }
    else eventFocus = { from: earth.quaternion.clone(), to, elapsed: 0 };
  }
  const rocks = new Map<string, Rock>();
  const textures: THREE.Texture[] = [];
  let planetMapsReady = 0, planetMapFailed = false;
  const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  let transition: gsap.core.Tween | undefined, switchTween: gsap.core.Tween | undefined;
  let flight: { from: SceneConfig["kind"]; destination: string; rect: DOMRect; t: number; source: SceneConfig; camera: THREE.Vector3; rotation: THREE.Quaternion } | undefined;
  const entrance = { t: 1 };
  const arrivalCamera = new THREE.Vector3(), arrivalRotation = new THREE.Quaternion();
  const particleRandom = randomStream(82941);
  const starPositions = new Float32Array(450 * 3);
  for (let i = 0; i < starPositions.length; i += 3) { starPositions[i] = (particleRandom() - .5) * 38; starPositions[i+1] = (particleRandom() - .5) * 24; starPositions[i+2] = -3 - particleRandom() * 25; }
  const starGeometry = new THREE.BufferGeometry(); starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
  const starMaterial = new THREE.PointsMaterial({ size: .032, color: 0xcadbe9, transparent: true, opacity: .8, sizeAttenuation: true });
  const stars = new THREE.Points(starGeometry, starMaterial); scene.add(stars);
  const particleCount = window.innerWidth < 760 ? 50 : 130;
  const particlePositions = new Float32Array(particleCount * 6);
  for (let i = 0; i < particlePositions.length; i += 6) { particlePositions[i] = (particleRandom() - .5) * 20; particlePositions[i+1] = (particleRandom() - .5) * 13; particlePositions[i+2] = -particleRandom() * 20; }
  const particleGeometry = new THREE.BufferGeometry(); particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
  const particleMaterial = new THREE.LineBasicMaterial({ color: 0xa6c3dc, transparent: true, opacity: .42 });
  const particles = new THREE.LineSegments(particleGeometry, particleMaterial); particles.name = "illustrative-speed-particles"; scene.add(particles);
  const comparison = new THREE.Group(); scene.add(comparison);
  const references = new Map<SizeReferenceId, THREE.Group>();
  const referenceGeometries: THREE.BufferGeometry[] = [];
  const humanMaterial = new THREE.MeshBasicMaterial({ color: 0xedc18c, side: THREE.DoubleSide });
  const pitchMaterial = new THREE.MeshBasicMaterial({ color: 0x33433d, side: THREE.DoubleSide });
  const detailMaterial = new THREE.LineBasicMaterial({ color: 0x0b1118 });
  const pitchLineMaterial = new THREE.LineBasicMaterial({ color: 0xedc18c });
  SIZE_REFERENCES.forEach(reference => {
    const group = new THREE.Group(); group.name = reference.id === "person" ? "human-1.8m" : `reference-${reference.id}`;
    reference.parts.forEach(points => {
      const shape = new THREE.Shape();
      points.forEach(([x,y],index) => index ? shape.lineTo(x,y) : shape.moveTo(x,y)); shape.closePath();
      const geometry = new THREE.ShapeGeometry(shape); referenceGeometries.push(geometry);
      group.add(new THREE.Mesh(geometry, reference.id === "pitch" ? pitchMaterial : humanMaterial));
      if (reference.id === "pitch") {
        const edge = new THREE.BufferGeometry().setFromPoints([...points,points[0]].map(([x,y])=>new THREE.Vector3(x,y,.002)));
        referenceGeometries.push(edge); group.add(new THREE.Line(edge,pitchLineMaterial));
      }
    });
    reference.lines.forEach(points=>{
      const geometry = new THREE.BufferGeometry().setFromPoints(points.map(([x,y])=>new THREE.Vector3(x,y,.003)));
      referenceGeometries.push(geometry); group.add(new THREE.Line(geometry,reference.id === "pitch" ? pitchLineMaterial : detailMaterial));
    });
    references.set(reference.id, group); comparison.add(group);
  });
  const rulerGeometry = new THREE.BufferGeometry().setFromPoints([[-1.65,-1],[-1.65,1],[-1.75,-1],[-1.55,-1],[-1.75,1],[-1.55,1],[-1.5,-1],[2,-1]].map(([x,y]) => new THREE.Vector3(x,y,0)));
  const rulerMaterial = new THREE.LineBasicMaterial({ color: 0x7e8a94, transparent: true, opacity: .7 }); comparison.add(new THREE.LineSegments(rulerGeometry, rulerMaterial));
  const running = () => !disposed && !lost && !document.hidden && (!!flight || (visible && !!binding && binding.config.mode !== "distance"));
  function wake() {
    if (!running()) { cancelAnimationFrame(frame); frame = 0; lastTime = 0; return; }
    if (!frame) frame = requestAnimationFrame(draw);
  }
  const loader = new THREE.TextureLoader();
  function loadPlanet(url: string, material: THREE.MeshPhongMaterial) {
    const texture = loader.load(url, map => {
      if (disposed) { map.dispose(); return; }
      map.colorSpace = THREE.SRGBColorSpace; material.map = map; material.needsUpdate = true; planetMapsReady++;
      if ((binding?.config.kind === "home" || binding?.config.kind === "events" || binding?.config.kind === "solar") && planetMapsReady === 2 && !planetMapFailed) binding.status("ready"); wake();
    }, undefined, () => { planetMapFailed = true; if ((binding?.config.kind === "home" || binding?.config.kind === "events" || binding?.config.kind === "solar")) binding.status("failed"); }); textures.push(texture);
  }
  loadPlanet("/media/orbital/earth.jpg", earthMaterial); loadPlanet("/media/orbital/moon.jpg", moonMaterial);
  function selectRock(id: string) {
    if (activeRock) activeRock.mesh.visible = false;
    let rock = rocks.get(id);
    if (!rock) { rock = createRock(id, wake); rocks.set(id, rock); scene.add(rock.mesh); }
    else { rocks.delete(id); rocks.set(id, rock); }
    activeRock = rock; rock.mesh.visible = true;
    while (rocks.size > 2) { const key = rocks.keys().next().value as string; const old = rocks.get(key)!; scene.remove(old.mesh); old.dispose(); rocks.delete(key); }
  }
  function resize(width: number, height: number) {
    if (width < 1 || height < 1) return;
    const canvas = renderer.domElement;
    const ratio = renderer.getPixelRatio();
    if (Math.abs(canvas.width / ratio - width) > 1 || Math.abs(canvas.height / ratio - height) > 1) renderer.setSize(width, height, false);
    camera.aspect = width / height; camera.updateProjectionMatrix();
  }
  function finishFlight() {
    flight = undefined; transition = undefined; flightHost.style.display = "none";
    if (binding?.host.isConnected) { binding.host.appendChild(renderer.domElement); binding.status("ready"); }
    else renderer.domElement.remove();
    wake();
  }
  function draw(time: number) {
    frame = 0; if (!running()) return;
    const config = binding?.config ?? flight?.source;
    const delta = lastTime ? Math.min((time - lastTime) / 1000, .04) : 0; lastTime = time;
    const moving = !preference.matches && !config?.paused;
    let rect = binding?.host.getBoundingClientRect();
    if (flight) {
      const source = flight.rect, target = rect && rect.width ? rect : source;
      const middle = { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
      // Catalog → profile follows one uninterrupted host-to-host move. A cold
      // route keeps the original model visible until its destination is ready.
      const direct = flight.from === "catalog";
      const first = flight.t < .4, t = direct ? flight.t : first ? flight.t / .4 : (flight.t - .4) / .6;
      const eased = t * t * (3 - 2 * t), a = direct || first ? source : middle, b = direct ? target : first ? middle : target;
      const left = a.left + (b.left - a.left) * eased, top = a.top + (b.top - a.top) * eased;
      const width = a.width + (b.width - a.width) * eased, height = a.height + (b.height - a.height) * eased;
      Object.assign(flightHost.style, { display: "block", left: `${left}px`, top: `${top}px`, width: `${width}px`, height: `${height}px` });
      resize(width, height);
    } else if (rect) resize(rect.width, rect.height);
    if(config?.kind==='sky'&&skyModel){skyModel.update(config,camera.aspect);renderer.render(skyModel.scene,skyModel.camera);return;}
    const isSolar = config?.kind === "solar";
    const isEncounter=config?.kind==="encounters";
    if(encounterModel)encounterModel.group.visible=isEncounter;
    const isEvents = config?.kind === "events";
    const isHome = config?.kind === "home" || isEvents || isSolar;
    rockFill.visible = !isHome;
    if (solarModel) { solarModel.group.visible = isSolar && planetMapsReady === 2 && !planetMapFailed; if (isSolar && moving && solarModel.group.visible) solarModel.update(delta); }
    sun.position.set(-3, isSolar ? 1 : 4, isSolar ? 2 : 5); sun.intensity = isSolar ? 2.5 : 3.5; rim.intensity = isSolar ? .3 : 1.25;
    orbitalPlane.visible = !isEvents;
    const fromHome = flight?.from === "home";
    orbitalPlane.scale.setScalar(window.innerWidth <= 760 && (config?.kind === "home" || fromHome) ? .82 : 1);
    const comparing = !flight && config?.mode === "size" && validComparisonDiameter(config.diameter) && activeRock;
    home.visible = ((!!isHome && !isSolar) || !!fromHome) && planetMapsReady === 2 && !planetMapFailed;
    home.scale.setScalar(fromHome ? Math.max(.02, 1 - flight!.t * 1.5) : 1);
    home.position.set(fromHome ? -flight!.t * 3 : 0, fromHome ? flight!.t : 0, fromHome ? -flight!.t * 16 : 0);
    if (moving && !isEvents && !isSolar && !isEncounter && planetMapsReady === 2) { earth.rotation.y += delta * .023; orbitTime += delta * .025; }
    moon.position.set(Math.cos(orbitTime) * 2.35, Math.sin(orbitTime) * .9, Math.sin(orbitTime) * 2.17198);
    moon.rotation.y = -orbitTime;
    if (isEvents) {
      if (eventFocus) {
        eventFocus.elapsed += delta;
        const t = preference.matches ? 1 : Math.min(1, eventFocus.elapsed / .7);
        earth.quaternion.slerpQuaternions(eventFocus.from, eventFocus.to, t * t * (3 - 2 * t));
        if (t === 1) eventFocus = undefined;
      } else if (moving) earth.rotation.y += delta * .035;
    }
    stars.visible = !comparing; particles.visible = !isHome && !comparing && !isEncounter || !!flight;
    const speed = config?.speed;
    const particleSpeed = flight ? 10 : speed != null ? speed * .055 : 0;
    for (let i = 0; i < particlePositions.length; i += 6) {
      if (moving) particlePositions[i+2] += delta * particleSpeed;
      if (particlePositions[i+2] > 3) particlePositions[i+2] = -20;
      particlePositions[i+3] = particlePositions[i]; particlePositions[i+4] = particlePositions[i+1];
      particlePositions[i+5] = particlePositions[i+2] - (flight ? .8 : .035 + particleSpeed * .045);
    }
    particleGeometry.attributes.position.needsUpdate = true;
    comparison.visible = !!comparing;
    if (activeRock) {
      const mesh = activeRock.mesh;
      mesh.visible = !isHome && !!config?.id;
      if (comparing) {
        mesh.userData.sizeComparison = true;
        const diameter = config!.diameter!;
        const reference = sizeReference(config!.sizeReference ?? defaultSizeReference(diameter));
        const horizontal = reference.dimension === "length";
        const basis = horizontal ? activeRock.lengthBounds : activeRock;
        const factor = 2 / (horizontal ? activeRock.lengthBounds.width : activeRock.height);
        mesh.rotation.copy(basis.rotation); mesh.scale.setScalar(factor); mesh.position.set(0, -1-basis.bottom*factor, 0);
        const referenceScale = 2 / diameter, rulerX = basis.left * factor - .25;
        const gap = Math.max(2, reference.width * referenceScale, reference.height * referenceScale) * .13;
        const referenceX = basis.right * factor + gap - reference.minX * referenceScale;
        references.forEach((group,id)=>{ group.visible = id === reference.id; group.scale.setScalar(referenceScale); if(group.visible) group.position.set(referenceX,-1,0); });
        const rightEdge = referenceX + (reference.minX + reference.width) * referenceScale, centerX = (rulerX + rightEdge) / 2;
        const ruler = rulerGeometry.attributes.position;
        const rulerPoints = horizontal ? [[basis.left*factor,-1.18],[basis.right*factor,-1.18],[basis.left*factor,-1.25],[basis.left*factor,-1.11],[basis.right*factor,-1.25],[basis.right*factor,-1.11],[rulerX+.1,-1],[rightEdge+.15,-1]] : [[rulerX,-1],[rulerX,1],[rulerX-.1,-1],[rulerX+.1,-1],[rulerX-.1,1],[rulerX+.1,1],[rulerX+.1,-1],[rightEdge+.15,-1]];
        rulerPoints.forEach(([x,y],i) => ruler.setXYZ(i,x,y,0));
        ruler.needsUpdate = true; rulerGeometry.computeBoundingSphere();
        const top = Math.max(-1+basis.height*factor, -1+reference.height*referenceScale);
        const half = Math.max(((rightEdge-rulerX)/2+.25) / camera.aspect, (top+1)/2+.25), center = (top-1)/2;
        scaleCamera.left = -half * camera.aspect; scaleCamera.right = half * camera.aspect; scaleCamera.top = half; scaleCamera.bottom = -half;
        scaleCamera.position.set(centerX, center, 10); scaleCamera.lookAt(centerX, center, 0); scaleCamera.updateProjectionMatrix();
      } else {
        if (mesh.userData.sizeComparison) { mesh.rotation.copy(activeRock.rotation); mesh.userData.sizeComparison = false; }
        if (moving) mesh.rotation.y += delta * .065;
        const arrival = fromHome ? Math.max(0, (flight!.t - .28) / .72) : entrance.t;
        mesh.scale.setScalar(Math.max(.01, arrival)*asteroidDisplayScale(config?.diameter)); mesh.position.set((1 - arrival) * 1.5, (1 - arrival) * -.25, 0);
      }
    }
    if (controls) controls.enabled = !isHome && !comparing && !flight && !isEncounter;
    const homeDistance = window.innerWidth <= 760 ? Math.max(6.2,4.8/camera.aspect) : camera.aspect < 1.1 ? 8.6 : 7.6;
    const distance = isSolar ? Math.max(8.8, 14 / camera.aspect) : isEvents ? Math.max(6.2,4.7/camera.aspect) : isHome ? homeDistance : Math.max(flight?.from === "catalog" ? 4.6 - flight.t * .5 : config?.kind === "catalog" ? window.innerWidth <= 760 ? 3.8 : 4.6 : 4.1, 3.5 / camera.aspect);
    const flightDistance = fromHome ? homeDistance * (1 - flight!.t) + distance * flight!.t : distance;
    if (!controls || !controls.enabled || flight) { camera.position.set(0, .15, flightDistance); camera.lookAt(0, 0, 0); }
    else if (Math.abs(camera.position.length() - distance - (config?.progress?.current ?? 0) * .65) > .05) camera.position.setLength(distance + (config?.progress?.current ?? 0) * .65);
    if (flight?.from === "catalog") {
      const t = flight.t, blend = t * t * (3 - 2 * t);
      const destinationDistance = Math.max(4.1, 3.5 / camera.aspect);
      arrivalCamera.set(0, .15, destinationDistance); camera.position.copy(arrivalCamera); camera.lookAt(0, 0, 0); arrivalRotation.copy(camera.quaternion);
      camera.position.lerpVectors(flight.camera, arrivalCamera, blend);
      camera.position.multiplyScalar(1 + Math.sin(Math.PI * t) * .08);
      camera.quaternion.slerpQuaternions(flight.rotation, arrivalRotation, blend);
    }
    if(isEncounter&&config.encounter&&activeRock)encounterModel?.update(config,camera,activeRock.mesh);
    renderer.render(scene, comparing ? scaleCamera : camera);
    if (isEvents && config.projectMarkers && rect) {
      earth.updateMatrixWorld(true); camera.updateMatrixWorld(true);
      config.projectMarkers((config.markers || []).map(point => {
        const lat=point.latitude*Math.PI/180,lon=point.longitude*Math.PI/180;
        const world=new THREE.Vector3(Math.cos(lat)*Math.cos(lon),Math.sin(lat),-Math.cos(lat)*Math.sin(lon)).multiplyScalar(1.39).applyMatrix4(earth.matrixWorld);
        const facing=world.clone().normalize().dot(camera.position.clone().sub(world).normalize())>0;
        const projected=world.project(camera);
        return {id:point.id,x:(projected.x+1)*50,y:(1-projected.y)*50,visible:facing};
      }));
    }
    if (moving || flight || entrance.t < 1 || eventFocus) frame = requestAnimationFrame(draw);
  }
  function releaseObservers() { observer?.disconnect(); resizeObserver?.disconnect(); controls?.dispose(); controls = undefined; }
  function attach(next: SceneBinding) {
    if (disposed || lost) { next.status("failed"); return; }
    const oldId = binding?.config.id;
    releaseObservers(); binding = next; visible = true;
    if (next.config.kind !== "encounters") { camera.near = .1; camera.far = 150; camera.updateProjectionMatrix(); }
    focusEarth(next.config, true);
    if (next.config.kind === "home") { earth.rotation.set(.12, 3.9, -.12); orbitTime = .68; }
    if (next.config.kind === "solar" && !solarModel) { solarModel = createSolarModel(earthGeometry, earthMaterial); scene.add(solarModel.group); }
    if (next.config.kind === 'sky' && !skyModel) skyModel=createSkyModel();
    if(next.config.kind==="encounters"&&!encounterModel){encounterModel=createEncounterModel(earthMaterial,moonMaterial);scene.add(encounterModel.group);}
    if (next.config.id) selectRock(next.config.id);
    if (!flight) next.host.appendChild(renderer.domElement);
    if (next.config.kind === "catalog" || next.config.kind === "profile") {
      controls = new OrbitControls(camera, next.host); controls.enableZoom = false; controls.enablePan = false; controls.enableDamping = false; controls.rotateSpeed = .6;
      controls.addEventListener("change", wake);
    }
    // Vertical gestures belong to the document; only asteroid hosts need drag rotation.
    next.host.style.touchAction = "pan-y pinch-zoom"; renderer.domElement.style.touchAction = "pan-y pinch-zoom";
    if (!flight) { camera.position.set(0, .15, next.config.kind === "home" ? 7.6 : 4.6); controls?.update(); }
    observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; wake(); }); observer.observe(next.host);
    resizeObserver = new ResizeObserver(wake); resizeObserver.observe(next.host);
    next.status((next.config.kind === "home" || next.config.kind === "events" || next.config.kind === "solar") ? planetMapFailed ? "failed" : planetMapsReady === 2 ? "ready" : "loading" : "ready");
    if (flight?.from === "catalog" && next.config.kind === "profile") {
      transition = gsap.to(flight, { t: 1, duration: .65, ease: "none", onUpdate: wake, onComplete: finishFlight });
    } else if (!flight && oldId !== next.config.id) enter();
    wake();
  }
  function enter() {
    switchTween?.kill(); entrance.t = preference.matches ? 1 : .65;
    if (!preference.matches) switchTween = gsap.to(entrance, { t: 1, duration: .45, ease: "power2.out", onUpdate: wake });
  }
  function update(config: SceneConfig) {
    if (!binding || disposed || lost) return;
    if (config.id && binding.config.id !== config.id) { selectRock(config.id); enter(); }
    if (config.focus?.latitude !== binding.config.focus?.latitude || config.focus?.longitude !== binding.config.focus?.longitude || config.focusRevision !== binding.config.focusRevision) focusEarth(config);
    binding.config = config; wake();
  }
  function depart(destination: string) {
    transition?.kill(); if (flight) finishFlight();
    if (!binding || preference.matches || disposed || lost || document.hidden || binding.config.paused) return;
    const from = binding.config.kind;
    const valid = from === "home" && destination === "/asteroids" || from === "catalog" && /^\/asteroids\/[^/]+\/[^/]+$/.test(destination);
    if (!valid) return;
    const sourceRect = binding.host.getBoundingClientRect();
    if (sourceRect.bottom < 0 || sourceRect.top > window.innerHeight) return;
    if (from === "catalog" && destination.split("/")[2] !== binding.config.id) return;
    switchTween?.kill(); entrance.t = 1;
    flight = { from, destination, rect: sourceRect, t: 0, source: binding.config, camera: camera.position.clone(), rotation: camera.quaternion.clone() };
    flightHost.appendChild(renderer.domElement);
    if (from === "home") transition = gsap.to(flight, { t: 1, duration: window.innerWidth < 760 ? .65 : 1.2, ease: "power2.inOut", onUpdate: wake, onComplete: finishFlight });
    wake();
  }
  const lostContext = (event: Event) => { event.preventDefault(); lost = true; transition?.kill(); switchTween?.kill(); flight = undefined; flightHost.style.display = "none"; cancelAnimationFrame(frame); frame = 0; binding?.status("failed"); renderer.domElement.remove(); };
  const changePreference = () => { if (preference.matches) { transition?.kill(); switchTween?.kill(); entrance.t = 1; finishFlight(); } wake(); };
  renderer.domElement.addEventListener("webglcontextlost", lostContext);
  preference.addEventListener("change", changePreference); document.addEventListener("visibilitychange", wake);
  return { attach, update, depart,
    cancelFlight() { transition?.kill(); if (flight) finishFlight(); },
    detach(host) { if (binding?.host !== host) return; releaseObservers(); binding = null; visible = false; if (!flight) renderer.domElement.remove(); wake(); },
    rotate(direction) { if (!activeRock || !binding || lost) return; activeRock.mesh.rotation.y += direction * .25; wake(); },
    reset() { if (activeRock) activeRock.mesh.rotation.copy(activeRock.rotation); camera.position.set(0,.15,4.6); controls?.target.set(0,0,0); controls?.update(); wake(); },
    dispose() {
      if (disposed) return; disposed = true; transition?.kill(); switchTween?.kill(); cancelAnimationFrame(frame); releaseObservers();
      preference.removeEventListener("change", changePreference); document.removeEventListener("visibilitychange", wake); renderer.domElement.removeEventListener("webglcontextlost", lostContext);
      solarModel?.dispose();
      skyModel?.dispose();
      encounterModel?.dispose();
      rocks.forEach(rock => rock.dispose()); rocks.clear(); textures.forEach(texture => texture.dispose());
      [earthGeometry, atmosphereGeometry, orbitGeometry, moonGeometry, starGeometry, particleGeometry, ...referenceGeometries, rulerGeometry].forEach(item => item.dispose());
      [earthMaterial, atmosphereMaterial, orbitMaterial, moonMaterial, starMaterial, particleMaterial, humanMaterial, pitchMaterial, detailMaterial, pitchLineMaterial, rulerMaterial].forEach(item => item.dispose());
      renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove(); flightHost.style.display = "none";
    }
  };
}
