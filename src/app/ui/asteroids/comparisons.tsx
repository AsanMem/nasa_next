import { Approach, Asteroid, numberLabel } from "@/app/lib/asteroids/view-model";
import { asteroidProjection, asteroidVisual } from "@/app/lib/asteroids/visual";
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
export function AsteroidPortrait({ id }: { id: string }) {
  return <svg viewBox="-110 -12 220 125" role="img" aria-label="Static artistic reconstruction of this asteroid"><RockProjection id={id}/></svg>;
}
export function SizeComparison({ asteroid }: { asteroid: Pick<Asteroid, "id" | "diameter"> }) {
  const silhouetteWidth = useMemo(() => asteroidProjection(asteroidVisual(asteroid.id)).width, [asteroid.id]);
  if (!asteroid.diameter) return <div className={s.unknownFigure}>NASA has not supplied a valid diameter range. A scale comparison is unavailable.</div>;
  const diameter = asteroid.diameter, unit = Math.min(245 / Math.max(diameter, 1.8), 420 / (diameter * silhouetteWidth / 100)), human = 1.8 * unit, rock = diameter * unit;
  return <figure className={s.comparison}>
    <svg viewBox="0 0 650 380" role="img" aria-label={`Proportional comparison: asteroid representative diameter ${numberLabel(diameter, 2)} metres, person 1.8 metres.`}>
      <line x1="20" x2="630" y1="280" y2="280" stroke="#a8b3bf55" />
      <g transform={`translate(280 ${280-rock}) scale(${rock/100})`}><RockProjection id={asteroid.id}/></g>
      <g transform={`translate(575 ${280-human}) scale(${human/180})`} fill="#edc18c"><circle cy="12" r="12"/><path d="M-13 29H13L23 87L15 90L9 53L10 108L13 180H3L0 117L-3 180H-13L-10 108L-9 53L-15 90L-23 87Z"/></g>
      <path d={`M22 280H12V${280-rock}H22`} fill="none" stroke="#edc18c"/>
      <text x="280" y="330" textAnchor="middle" fill="#f1f4f6" fontSize="20">{numberLabel(diameter, 2)} m</text>
      <path d={`M575 ${280-human-8}V${Math.min(240,280-human-18)}`} stroke="#edc18c99" />
      <text x="575" y={Math.min(230,Math.max(22,280-human-25))} textAnchor="middle" fill="#edc18c" fontSize="20">1.8 m</text>
    </svg>
    <figcaption>Proportions preserved. The rock’s height represents the midpoint of NASA’s diameter estimate. Its shape and surface are artistic.</figcaption>
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
