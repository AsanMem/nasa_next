import { createNoise3D } from "simplex-noise";

export type Vec3 = [number, number, number];
/** Bounded display scale only. Never use for the exact human comparison. */
export function asteroidDisplayScale(diameter?:number|null) {
  return diameter!=null&&Number.isFinite(diameter)&&diameter>0?Math.max(.5,Math.min(1.35,(diameter/150)**.3)):1;
}
export type AsteroidVisualDescriptorV4 = {
  version: 4; id: string; seed: number;
  family: "rubble" | "elongated" | "shard" | "bilobed";
  proportions: Vec3; rotation: Vec3; texture: string; tint: string;
  roughness: number; relief: number; textureScale: number; textureOffset: [number,number];
  craters: { direction: Vec3; width: number; depth: number }[];
};
export function hashSeed(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) hash = Math.imul(hash ^ value.charCodeAt(i), 16777619);
  return hash >>> 0;
}
export function randomStream(seed: number) {
  return () => {
    seed |= 0; seed = seed + 0x6d2b79f5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
// Versioned, named material slots: never derive identity from a mutable asset list.
const surfaces = [
  { texture: "stone-1.jpg", tint: "#b9b4a9" },
  { texture: "stone-2.jpg", tint: "#999e9c" },
  { texture: "stone-5.jpg", tint: "#aaa69e" },
  { texture: "stone-8.jpg", tint: "#9f9d97" },
  { texture: "stone-10.jpg", tint: "#b3a28c" },
  { texture: "stone-12.jpg", tint: "#b4b7b2" },
] as const;
const tints = ["#c2beb4", "#aaa8a0", "#979d9e", "#b5a69a", "#93928e", "#b3b6b6"] as const;
/** Frozen v4 identity: retained for explicit legacy comparison, never edited in place. */
export function asteroidVisualV4(id: string): AsteroidVisualDescriptorV4 {
  const shape = randomStream(hashSeed(`orbital:4:shape:${id}`));
  const material = randomStream(hashSeed(`orbital:4:material:${id}`));
  const familyDraw=shape();
  const family = familyDraw < .6 ? "rubble" : familyDraw < .85 ? "elongated" : familyDraw < .97 ? "shard" : "bilobed";
  const proportions: Vec3 = family === "elongated" ? [1.25 + shape() * .4, .8 + shape() * .14, .8 + shape() * .14]
    : family === "shard" ? [1.25, .7, .55 + shape() * .15]
    : family === "bilobed" ? [1.2 + shape()*.15, .92, .88] : [1.0 + shape() * .2, .88 + shape() * .2, .85 + shape()*.22];
  const craters = Array.from({ length: 6 }, () => {
    const z = shape() * 2 - 1, angle = shape() * Math.PI * 2, r = Math.sqrt(1 - z * z);
    return { direction: [r * Math.cos(angle), r * Math.sin(angle), z] as Vec3, width: .12 + shape() * .22, depth: .025 + shape() * .085 };
  });
  return { version: 4, id, family, seed: hashSeed(`orbital:4:noise:${id}`), proportions,
    rotation: [.16 + shape() * .25, -.5 + shape(), -.6 + shape() * 1.2],
    ...surfaces[Math.floor(material() * 6)], tint: tints[Math.floor(material()*tints.length)], roughness: .87 + material() * .11, textureScale: .8 + material()*.8, textureOffset: [material(),material()],
    relief: .065 + shape() * .045, craters };
}
export function surfaceSamplerV4(descriptor: AsteroidVisualDescriptorV4) {
  const noise = createNoise3D(randomStream(descriptor.seed));
  return (x: number, y: number, z: number): Vec3 => {
    const warp = noise(x * 1.3 + 7, y * 1.3 - 4, z * 1.3 + 2) * .28;
    let radius = 1 + descriptor.relief * noise(x * 1.05 + warp, y * 1.05, z * 1.05)
      + .045 * noise(x * 3.2 + 5, y * 3.2, z * 3.2 - 2) + .012 * noise(x * 8, y * 8, z * 8)
      + .07 * x - .035 * y * z;
    for (const crater of descriptor.craters) {
      const distance = 1 - (x * crater.direction[0] + y * crater.direction[1] + z * crater.direction[2]);
      radius -= crater.depth * Math.exp(-distance / (crater.width * crater.width));
    }
    if (descriptor.family === "bilobed") radius *= .84 + .19 * Math.abs(x + .21 * y) + .11 * x + .04*y;
    if (descriptor.family === "shard") {
      const chipped = Math.min(radius, .9 / Math.max(.1, Math.abs(x + z * .25 + .12)), .72 / Math.max(.1, Math.abs(y - z * .3 - .09)), .8 / Math.max(.1, Math.abs(z - x * .2 + .07)));
      radius = .35 * radius + .65 * chipped;
    }
    return [x * radius * descriptor.proportions[0], y * radius * descriptor.proportions[1], z * radius * descriptor.proportions[2]];
  };
}

export type AsteroidVisualDescriptorV5 = Omit<AsteroidVisualDescriptorV4, "version"> & {
  version: 5;
  surface: "calm" | "weathered" | "fractured" | "bouldery";
  bend: Vec3;
  planes: { direction: Vec3; offset: number }[];
  patches: { direction: Vec3; width: number; strength: number }[];
};
export type AsteroidVisualDescriptor = AsteroidVisualDescriptorV4 | AsteroidVisualDescriptorV5;

function randomDirection(random: () => number): Vec3 {
  const z = random() * 2 - 1, angle = random() * Math.PI * 2, radius = Math.sqrt(1 - z * z);
  return [radius * Math.cos(angle), radius * Math.sin(angle), z];
}

/** A deliberate v5 migration. Measurements never participate in this identity. */
export function asteroidVisual(id: string, version: 4 | 5 = 5): AsteroidVisualDescriptor {
  if (version === 4) return asteroidVisualV4(id);
  const shape = randomStream(hashSeed(`orbital:5:shape:${id}`));
  const surface = randomStream(hashSeed(`orbital:5:surface:${id}`));
  const material = randomStream(hashSeed(`orbital:5:material:${id}`));
  const draw = shape();
  const family = draw < .6 ? "rubble" : draw < .85 ? "elongated" : draw < .97 ? "shard" : "bilobed";
  const flattened = shape() < .32;
  const proportions: Vec3 = family === "elongated" ? [1.35 + shape() * .45, .65 + shape() * .2, .7 + shape() * .22]
    : family === "shard" ? [1.18 + shape() * .25, .62 + shape() * .22, .56 + shape() * .2]
    : family === "bilobed" ? [1.25 + shape() * .25, .83 + shape() * .1, .78 + shape() * .1]
    : [1.02 + shape() * .23, flattened ? .58 + shape() * .17 : .86 + shape() * .22, .84 + shape() * .23];
  const profiles = ["calm", "weathered", "fractured", "bouldery"] as const;
  const profile = profiles[Math.floor(surface() * profiles.length)];
  const planes = Array.from({ length: family === "shard" ? 4 + Math.floor(shape() * 3) : profile === "fractured" ? 2 + Math.floor(shape() * 3) : Math.floor(shape() * 2) }, () => ({ direction: randomDirection(shape), offset: .79 + shape() * .18 }));
  const craters = Array.from({ length: Math.floor(surface() * 5) }, () => ({ direction: randomDirection(surface), width: .25 + surface() * .3, depth: .012 + surface() * .045 }));
  const patches = Array.from({ length: profile === "calm" ? 0 : 2 + Math.floor(surface() * 3) }, () => ({ direction: randomDirection(surface), width: .3 + surface() * .3, strength: profile === "bouldery" ? .025 + surface() * .028 : .008 + surface() * .015 }));
  return {
    version: 5, id, family, surface: profile, seed: hashSeed(`orbital:5:noise:${id}`), proportions,
    rotation: [.13 + shape() * .35, -.8 + shape() * 1.6, -.55 + shape() * 1.1],
    ...surfaces[Math.floor(material() * surfaces.length)], tint: tints[Math.floor(material() * tints.length)],
    roughness: .88 + material() * .1, textureScale: .8 + material() * .8, textureOffset: [material(), material()],
    relief: .08 + shape() * .08, craters, planes, patches,
    bend: [(shape() - .5) * .2, (shape() - .5) * .13, (shape() - .5) * .13],
  };
}

export function surfaceSampler(descriptor: AsteroidVisualDescriptor) {
  if (descriptor.version === 4) return surfaceSamplerV4(descriptor);
  const noise = createNoise3D(randomStream(descriptor.seed));
  return (x: number, y: number, z: number): Vec3 => {
    // Large, asymmetric volumes define the rock. Fine relief is local rather
    // than the same corrugated displacement over every point of every body.
    let radius = 1 + descriptor.relief * noise(x * .92 + 3, y * .92 - 2, z * .92 + 5)
      + .045 * x - .035 * y * z;
    for (const crater of descriptor.craters) {
      const distance = 1 - (x * crater.direction[0] + y * crater.direction[1] + z * crater.direction[2]);
      radius -= crater.depth * Math.exp(-distance / (crater.width * crater.width));
    }
    for (const patch of descriptor.patches) {
      const distance = 1 - (x * patch.direction[0] + y * patch.direction[1] + z * patch.direction[2]);
      const mask = Math.exp(-distance / (patch.width * patch.width));
      const frequency = descriptor.surface === "bouldery" ? 3.1 : 2.1;
      radius += patch.strength * mask * noise(x * frequency + 4, y * frequency - 7, z * frequency + 1);
    }
    for (const plane of descriptor.planes) {
      const facing = x * plane.direction[0] + y * plane.direction[1] + z * plane.direction[2];
      if (facing > .1) radius = Math.min(radius, plane.offset / facing);
    }
    if (descriptor.family === "bilobed") radius *= .86 + .16 * Math.abs(x + .18 * y) + .09 * x + .035 * z;
    const px = x * radius, py = y * radius, pz = z * radius;
    return [
      (px + descriptor.bend[0] * (py * py - .25)) * descriptor.proportions[0],
      (py + descriptor.bend[1] * px * pz) * descriptor.proportions[1],
      (pz + descriptor.bend[2] * (px * px - .3)) * descriptor.proportions[2],
    ];
  };
}
export function rotatePoint([x, y, z]: Vec3, [rx, ry, rz]: Vec3): Vec3 {
  // Three.js Euler XYZ applies Z, then Y, then X to a column vector.
  const a = x * Math.cos(rz) - y * Math.sin(rz), b = x * Math.sin(rz) + y * Math.cos(rz);
  const c = a * Math.cos(ry) + z * Math.sin(ry), d = -a * Math.sin(ry) + z * Math.cos(ry);
  return [c, b * Math.cos(rx) - d * Math.sin(rx), b * Math.sin(rx) + d * Math.cos(rx)];
}
/** Orthographic envelope of the very same surface, for the SVG fallback. */
export function asteroidProjection(descriptor: AsteroidVisualDescriptor) {
  const sample = surfaceSampler(descriptor);
  const points: number[][] = [];
  for (let lat = 0; lat <= 32; lat++) for (let lon = 0; lon < 64; lon++) {
    const p = lat / 32 * Math.PI, t = lon / 64 * Math.PI * 2;
    const [x, y] = rotatePoint(sample(Math.sin(p) * Math.cos(t), Math.cos(p), Math.sin(p) * Math.sin(t)), descriptor.rotation);
    points.push([x, -y]);
  }
  // Angular bins keep broad concavities; a convex hull would erase a bilobed waist.
  const edge = Array.from({ length: 96 }, (_, i) => {
    const angle = i / 96 * Math.PI * 2 - Math.PI;
    return points.filter(([x, y]) => Math.abs(Math.atan2(y, x) - angle) < Math.PI / 96 * 1.6)
      .sort((a, b) => b[0] ** 2 + b[1] ** 2 - a[0] ** 2 - a[1] ** 2)[0] ?? [Math.cos(angle), Math.sin(angle)];
  });
  const minY = Math.min(...edge.map(p => p[1])), maxY = Math.max(...edge.map(p => p[1]));
  const factor = 100 / (maxY - minY), centerX = (Math.min(...edge.map(p => p[0])) + Math.max(...edge.map(p => p[0]))) / 2;
  const normalized = edge.map(([x, y]) => [(x - centerX) * factor, (y - minY) * factor]);
  return { path: normalized.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ") + "Z",
    width: Math.max(...normalized.map(p => p[0])) - Math.min(...normalized.map(p => p[0])) };
}
