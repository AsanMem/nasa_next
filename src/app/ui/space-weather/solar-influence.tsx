import s from "../orbital/chapters.module.css";
export default function SolarInfluence() {
  return <figure className={s.solarInfluence}>
    <svg viewBox="0 0 760 220" role="img" aria-labelledby="solar-title solar-description">
      <title id="solar-title">How the Sun can affect Earth</title><desc id="solar-description">Conceptual diagram connecting solar radiation and solar wind with Earth&apos;s atmosphere and magnetic environment. It does not represent a current event, a trajectory or measured intensity.</desc>
      <circle cx="90" cy="96" r="46" fill="#edc18c" /><text x="90" y="177" textAnchor="middle">Sun</text>
      <path d="M158 65H290M158 125H290M465 96H577" stroke="#a8b3bf" strokeWidth="1.5" strokeDasharray="4 7" />
      <text x="377" y="77" textAnchor="middle">Radiation</text><text x="377" y="124" textAnchor="middle">Solar wind</text>
      <ellipse cx="645" cy="96" rx="61" ry="78" fill="none" stroke="#a8b3bf" strokeWidth="1.5" /><circle cx="645" cy="96" r="32" fill="#254960" /><path d="M630 74l22 8-8 17 16 11-20 14-13-20z" fill="#8daba7" /><text x="645" y="200" textAnchor="middle">Earth</text>
    </svg>
    <div className={s.solarEffects}><p><strong>Radiation</strong>Solar flares can disturb the upper atmosphere and radio communication.</p><p><strong>Particles and magnetic fields</strong>Solar wind and eruptions can interact with Earth’s magnetic environment, affecting satellites and helping produce auroras.</p><p><strong>Read the reports</strong>Bulletins below describe individual observations. A notification is not a measurement of conditions at your location.</p></div>
    <figcaption className={s.caption}>Illustrative connections only: not to scale, not a predicted path or a display of current intensity. <a href="https://science.nasa.gov/heliophysics/focus-areas/space-weather/" className={s.textLink}>NASA: understanding space weather</a></figcaption>
  </figure>;
}
