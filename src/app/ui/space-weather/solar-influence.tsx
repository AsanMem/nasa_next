import SolarScene from "./solar-scene";
import s from "../orbital/chapters.module.css";
export default function SolarInfluence() {
  return <figure className={s.solarInfluence}>
    <SolarScene />
    <div className={s.solarEffects}><p><strong>Radiation</strong>Solar flares can disturb the upper atmosphere and radio communication.</p><p><strong>Particles and magnetic fields</strong>Solar wind and eruptions can interact with Earth’s magnetic environment, affecting satellites and helping produce auroras.</p><p><strong>Read the reports</strong>Bulletins below describe individual observations. A notification is not a measurement of conditions at your location.</p></div>
    <figcaption className={s.caption}>Illustrative connections only: not to scale, not a predicted path or a display of current intensity. <a href="https://science.nasa.gov/heliophysics/focus-areas/space-weather/" className={s.textLink}>NASA: understanding space weather</a></figcaption>
  </figure>;
}
