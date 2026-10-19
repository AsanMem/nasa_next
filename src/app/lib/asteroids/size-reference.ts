/** Metres shared by the SVG fallback and the orthographic Three.js scene. */
export type SizeReferenceId = "person" | "bus" | "pitch" | "burj";
export type ReferencePoint = [number, number];
export type SizeReference = {
  id: SizeReferenceId;
  label: string;
  dimension: "height" | "length";
  metres: number;
  width: number;
  height: number;
  minX: number;
  parts: ReferencePoint[][];
  lines: ReferencePoint[][];
  note: string;
  source?: { label: string; url: string };
};

function circle(x: number, y: number, radius: number, count = 28): ReferencePoint[] {
  return Array.from({ length: count }, (_, index) => {
    const angle = index * Math.PI * 2 / count;
    return [x + Math.cos(angle) * radius, y + Math.sin(angle) * radius];
  });
}

export const SIZE_REFERENCES: readonly SizeReference[] = [
  {
    id: "person", label: "Person", dimension: "height", metres: 1.8,
    width: .46, height: 1.8, minX: -.23,
    parts: [
      [[-.13,1.48],[.13,1.48],[.23,.93],[.15,.9],[.09,1.25],[.1,.72],[.13,0],[.03,0],[0,.63],[-.03,0],[-.13,0],[-.1,.72],[-.09,1.25],[-.15,.9],[-.23,.93]],
      circle(0, 1.68, .12),
    ], lines: [], note: "A representative 1.8 m person.",
  },
  {
    id: "bus", label: "City bus", dimension: "length", metres: 12,
    width: 12, height: 3.2, minX: 0,
    parts: [
      [[0,.65],[0,2.7],[.55,3.2],[11.45,3.2],[12,2.5],[12,.65]],
      circle(2.1,.45,.45), circle(9.7,.45,.45),
    ],
    lines: [[[.8,2.6],[10.7,2.6],[11.3,2],[.8,2],[.8,2.6]], [[7.8,.8],[7.8,2.6]]],
    note: "A representative 12 m city bus; models vary. Length is the comparison dimension.",
  },
  {
    id: "pitch", label: "Football pitch", dimension: "length", metres: 105,
    width: 105, height: 68, minX: 0,
    parts: [[[0,0],[105,0],[105,68],[0,68]]],
    lines: [[[52.5,0],[52.5,68]], [...circle(52.5,34,9.15), [61.65,34]]],
    note: "A 105 × 68 m football pitch, shown from above. The 105 m length is the comparison dimension.",
    source: { label: "FIFA stadium guidelines", url: "https://ipt.fifa.com/innovation/stadium-guidelines/technical-guidelines/stadiums-guidelines/pitch-dimensions-and-surrounding-areas" },
  },
  {
    id: "burj", label: "Burj Khalifa", dimension: "height", metres: 828,
    width: 140, height: 828, minX: -70,
    parts: [[[-70,0],[-70,105],[-57,105],[-57,230],[-44,230],[-44,355],[-32,355],[-32,485],[-23,485],[-23,600],[-14,600],[-14,690],[-7,690],[-7,755],[-2,755],[0,828],[2,755],[6,755],[6,708],[13,708],[13,624],[23,624],[23,520],[34,520],[34,405],[46,405],[46,280],[59,280],[59,145],[70,145],[70,0]]],
    lines: [[[0,0],[0,720]], [[-22,0],[-22,460]], [[23,0],[23,510]]],
    note: "828 m from ground to architectural tip, including the spire. The outline is simplified.",
    source: { label: "Emaar · Burj Khalifa", url: "https://www.emaar.com/en/other-emaar-businesses/burj-khalifa" },
  },
];

export function validComparisonDiameter(diameter?: number | null): diameter is number {
  return typeof diameter === "number" && Number.isFinite(diameter) && diameter > 0;
}

export function defaultSizeReference(diameter?: number | null): SizeReferenceId {
  if (!validComparisonDiameter(diameter) || diameter < 10) return "person";
  if (diameter < 60) return "bus";
  if (diameter < 300) return "pitch";
  return "burj";
}

export function sizeReference(id: SizeReferenceId): SizeReference {
  return SIZE_REFERENCES.find(reference => reference.id === id) ?? SIZE_REFERENCES[0];
}

export function referenceSvgPath(points: ReferencePoint[]): string {
  return points.map(([x, y], index) => `${index ? "L" : "M"}${x},${-y}`).join(" ") + "Z";
}

/** One unit factor; neither object is independently enlarged for visibility. */
export function sizeComparisonLayout(diameter: number, rockAspect: number, reference: SizeReference, width = 500, height = 460) {
  if (!validComparisonDiameter(diameter) || !Number.isFinite(rockAspect) || rockAspect <= 0) return null;
  const horizontal = reference.dimension === "length";
  const rockWidth = horizontal ? diameter : diameter * rockAspect;
  const rockHeight = horizontal ? diameter * rockAspect : diameter;
  const gap = Math.max(diameter, reference.width, reference.height) * .13;
  const worldWidth = rockWidth + gap + reference.width;
  const worldHeight = Math.max(rockHeight, reference.height);
  const unit = Math.min((width - 62) / worldWidth, (height - 112) / worldHeight);
  const left = (width - worldWidth * unit) / 2;
  const baseline = height - 82;
  return {
    unit, baseline, horizontal, rockExtent: diameter * unit, rockHeight: rockHeight * unit, rockWidth: rockWidth * unit,
    rockX: left + rockWidth * unit / 2,
    referenceX: left + (rockWidth + gap - reference.minX) * unit,
    referenceCenterX: left + (rockWidth + gap + reference.width / 2) * unit,
    referenceHeight: reference.height * unit, referenceWidth: reference.width * unit,
  };
}
