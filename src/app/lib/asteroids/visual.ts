import { createNoise3D } from "simplex-noise";

export type Vec3 = [number, number, number];
export type AsteroidVisualDescriptor = {
  version: 3; id: string; seed: number;
  family: "rubble" | "elongated" | "shard" | "bilobed";
  proportions: Vec3; rotation: Vec3; texture: string; tint: string;
  roughness: number; relief: number;
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
  { texture: "stone-2.jpg", tint: "#a5a39d" },
  { texture: "stone-8.jpg", tint: "#adaba0" },
  { texture: "stone-2.jpg", tint: "#707779" },
  { texture: "stone-8.jpg", tint: "#b7a593" },
] as const;
export function asteroidVisual(id: string): AsteroidVisualDescriptor {
  const shape = randomStream(hashSeed(`orbital:3:shape:${id}`));
  const material = randomStream(hashSeed(`orbital:3:material:${id}`));
  const family = (["rubble", "elongated", "shard", "bilobed"] as const)[Math.floor(shape() * 4)];
  const proportions: Vec3 = family === "elongated" ? [1.5 + shape() * .35, .7 + shape() * .15, .75]
    : family === "shard" ? [1.25, .7, .55 + shape() * .15]
    : family === "bilobed" ? [1.4, .84, .76] : [1.04 + shape() * .15, .9 + shape() * .14, .92];
  const craters = Array.from({ length: 6 }, () => {
    const z = shape() * 2 - 1, angle = shape() * Math.PI * 2, r = Math.sqrt(1 - z * z);
    return { direction: [r * Math.cos(angle), r * Math.sin(angle), z] as Vec3, width: .12 + shape() * .22, depth: .025 + shape() * .085 };
  });
  return { version: 3, id, family, seed: hashSeed(`orbital:3:noise:${id}`), proportions,
    rotation: [.16 + shape() * .25, -.5 + shape(), -.6 + shape() * 1.2],
    ...surfaces[Math.floor(material() * 4)], roughness: .86 + material() * .12,
    relief: .065 + shape() * .045, craters };
}
export function surfaceSampler(descriptor: AsteroidVisualDescriptor) {
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
    if (descriptor.family === "bilobed") radius *= .52 + .7 * Math.abs(x + .12 * y) + .17 * x;
    if (descriptor.family === "shard") radius = Math.min(radius, .9 / Math.max(.1, Math.abs(x + z * .25 + .12)), .72 / Math.max(.1, Math.abs(y - z * .3 - .09)), .8 / Math.max(.1, Math.abs(z - x * .2 + .07)));
    return [x * radius * descriptor.proportions[0], y * radius * descriptor.proportions[1], z * radius * descriptor.proportions[2]];
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
