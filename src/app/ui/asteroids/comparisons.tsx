import { Approach, Asteroid, numberLabel } from "@/app/lib/asteroids/view-model";
import { asteroidProjection, asteroidVisual, asteroidDisplayScale } from "@/app/lib/asteroids/visual";
import { defaultSizeReference, referenceSvgPath, sizeComparisonLayout, sizeReference, validComparisonDiameter, type SizeReferenceId } from "@/app/lib/asteroids/size-reference";
import s from "./asteroids.module.css";
import { useId, useMemo } from "react";

function RockProjection({ id }: { id: string }) {
  const key = useId();
  const { visual, projection } = useMemo(() => { const visual = asteroidVisual(id); return { visual, projection: asteroidProjection(visual) }; }, [id]);
  return <g data-reconstruction-id={id}>
    <defs><pattern id={`${key}-stone`} width="1" height="1" patternContentUnits="objectBoundingBox"><image href={`/media/asteroid/textures/${visual.texture}`} width="1" height="1" preserveAspectRatio="xMidYMid slice" /></pattern><linearGradient id={`${key}-light`} x1="0" y1="0" x2="1" y2=".7"><stop stopColor="#edc18c44"/><stop offset=".35" stopColor="#00000008"/><stop offset=".75" stopColor="#03060990"/><stop offset="1" stopColor="#030609"/></linearGradient></defs>
    <path d={projection.path} fill={visual.tint}/><path d={projection.path} fill={`url(#${key}-stone)`}/><path d={projection.path} fill={`url(#${key}-light)`} stroke="#bdb4a766" strokeWidth=".3"/>
  </g>;
}
export function AsteroidPortrait({ id, thumbnail = false,diameter }: { id: string; thumbnail?: boolean;diameter?:number|null }) {
  const width=useMemo(()=>thumbnail?Math.max(125,asteroidProjection(asteroidVisual(id)).width)*1.35+16:300,[id,thumbnail]);
  const scale=asteroidDisplayScale(diameter);
  return <svg viewBox={`${-width/2} -34 ${width} 168`} role="img" aria-label="Static artistic reconstruction of this asteroid"><g transform={`translate(0 50) scale(${scale}) translate(0 -50)`}><RockProjection id={id}/></g></svg>;
}
export function SizeComparison({ asteroid, referenceId }: { asteroid: Pick<Asteroid, "id" | "diameter">; referenceId?: SizeReferenceId }) {
  const silhouetteWidth = useMemo(() => asteroidProjection(asteroidVisual(asteroid.id)).width, [asteroid.id]);
  if (!validComparisonDiameter(asteroid.diameter)) return <div className={s.unknownFigure}>NASA has not supplied a valid diameter range. A scale comparison is unavailable.</div>;
  const diameter = asteroid.diameter;
  const reference = sizeReference(referenceId ?? defaultSizeReference(diameter));
  const layout = sizeComparisonLayout(diameter, silhouetteWidth / 100, reference)!;
  const { unit, baseline, horizontal, rockExtent, rockHeight, rockWidth, rockX, referenceX, referenceCenterX } = layout;
  const rockTransform = horizontal ? `translate(${rockX} ${baseline-rockHeight/2}) scale(${rockExtent/100}) rotate(-90) translate(0 -50)` : `translate(${rockX} ${baseline-rockHeight}) scale(${rockExtent/100})`;
  return <figure className={`${s.comparison} ${s.sizeComparison}`} data-size-reference={reference.id} data-metres-to-units={unit}>
    <svg viewBox="0 0 500 460" role="img" aria-label={`Proportional comparison: asteroid representative diameter ${numberLabel(diameter, 2)} metres; ${reference.label}, ${reference.metres} metres ${reference.dimension}. Same metres per pixel.`}>
      <line x1="20" x2="480" y1={baseline} y2={baseline} stroke="#a8b3bf55" />
      <g transform={rockTransform}><RockProjection id={asteroid.id}/></g>
      <g transform={`translate(${referenceX} ${baseline}) scale(${unit})`}>
        {reference.parts.map((points,index)=><path key={index} d={referenceSvgPath(points)} fill={reference.id === "pitch" ? "#33433d" : "#edc18c"} stroke={reference.id === "pitch" ? "#edc18c" : "none"} vectorEffect="non-scaling-stroke" strokeWidth="1"/>)}
        {reference.lines.map((points,index)=><polyline key={`line-${index}`} points={points.map(([x,y])=>`${x},${-y}`).join(" ")} fill="none" stroke={reference.id === "pitch" ? "#edc18c" : "#0b1118"} vectorEffect="non-scaling-stroke" strokeWidth="1"/>)}
      </g>
      <path d={horizontal ? `M${rockX-rockWidth/2},${baseline+5}v9H${rockX+rockWidth/2}v-9` : `M${rockX-rockWidth/2-6},${baseline}h-8V${baseline-rockHeight}h8`} fill="none" stroke="#a8b3bf88"/>
      <path d={horizontal ? `M${referenceCenterX-layout.referenceWidth/2},${baseline+5}v9H${referenceCenterX+layout.referenceWidth/2}v-9` : `M${referenceCenterX+layout.referenceWidth/2+6},${baseline}h8V${baseline-layout.referenceHeight}h-8`} fill="none" stroke="#edc18c88"/>
      <text x={rockX} y={baseline+30} textAnchor="middle" fill="#f1f4f6" fontSize="20">{numberLabel(diameter, 2)} m</text>
      <text x={rockX} y={baseline+57} textAnchor="middle" fill="#a8b3bf" fontSize="19">Diameter</text>
      <text x={referenceCenterX} y={baseline+30} textAnchor="middle" fill="#edc18c" fontSize="20">{reference.metres} m</text>
      <text x={referenceCenterX} y={baseline+57} textAnchor="middle" fill="#a8b3bf" fontSize="19">{reference.dimension === "height" ? "Height" : "Length"}</text>
    </svg>
    <figcaption>Both silhouettes use the same metres per pixel.</figcaption>
  </figure>;
}
export function DistanceComparison({ event, id }: { event: Approach | null; id: string }) {
  const key = useId();
  return <figure className={s.comparison}>
    <svg viewBox="0 0 600 310" role="img" aria-label={`Distance reference diagram, not to scale. Selected approach to ${event?.body ?? "unknown body"}: ${numberLabel(event?.distance,0)} kilometres.`}>
      <defs>
        <pattern id={`${key}-earth`} width="1" height="1" patternContentUnits="objectBoundingBox"><image href="/media/orbital/earth.jpg" x="-.5" width="2" height="1" preserveAspectRatio="none"/></pattern>
        <pattern id={`${key}-moon`} width="1" height="1" patternContentUnits="objectBoundingBox"><image href="/media/orbital/moon.jpg" x="-.25" width="2" height="1" preserveAspectRatio="none"/></pattern>
        <radialGradient id={`${key}-shade`} cx=".26" cy=".27" r=".85"><stop stopColor="#fff4df22"/><stop offset=".45" stopColor="#03060900"/><stop offset=".72" stopColor="#03060999"/><stop offset="1" stopColor="#030609"/></radialGradient>
      </defs>
      <line x1="95" y1="140" x2="520" y2="140" stroke="#a8b3bf60" strokeDasharray="3 8"/>
      <circle cx="90" cy="140" r="54" fill="#77b5ec" opacity=".08"/>
      <circle cx="90" cy="140" r="50" fill="#315775"/><circle cx="90" cy="140" r="50" fill={`url(#${key}-earth)`}/><circle cx="90" cy="140" r="50" fill={`url(#${key}-shade)`} stroke="#9bc8ec55"/>
      <circle cx="250" cy="140" r="19" fill="#b9b8b4"/><circle cx="250" cy="140" r="19" fill={`url(#${key}-moon)`}/><circle cx="250" cy="140" r="19" fill={`url(#${key}-shade)`}/>
      <g transform="translate(510 116) scale(.48)"><RockProjection id={id}/></g>
      <text x="90" y="220" textAnchor="middle" fill="#f1f4f6" fontSize="18">Earth</text><text x="250" y="220" textAnchor="middle" fill="#f1f4f6" fontSize="18">Moon</text><text x="510" y="220" textAnchor="middle" fill="#edc18c" fontSize="18">Asteroid</text>
      <path d="M90 70V58H250V70" fill="none" stroke="#a8b3bf80"/><text x="170" y="40" textAnchor="middle" fill="#a8b3bf" fontSize="17">1 LD ≈ 384,400 km</text>
    </svg>
    <figcaption>Not to scale. Earth–Moon spacing is a reference, not a calculated flight path. {event && event.body.toLowerCase() !== "earth" && `The selected event is near ${event.body}; Earth and the Moon are shown only for reference.`}</figcaption>
  </figure>;
}
export function SpeedComparison({ speed }: { speed: number | null | undefined }) {
  return <div className={s.speedComparison} aria-label="Distance travelled in one second at the selected encounter speed">
    <p>In one second <strong>{numberLabel(speed,2)}{speed != null && <small> km</small>}</strong></p>
    <div className={s.speedTrack} aria-hidden="true"><span style={{ width: `${speed == null ? 0 : Math.min(100,speed)}%` }}/>{speed != null && speed > 100 && <b>→</b>}</div>
    <div className={s.speedTicks} aria-hidden="true"><span>0</span><span>25</span><span>50</span><span>75</span><span>100 km</span></div>
    {speed == null && <small>NASA has not supplied a speed for this encounter.</small>}
    {speed != null && speed > 100 && <small>Travel continues beyond this 100 km reference.</small>}
  </div>;
}
