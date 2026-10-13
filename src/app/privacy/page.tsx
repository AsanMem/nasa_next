import { Chapter, ChapterHeading } from "../ui/orbital/chapter";
import s from "../ui/orbital/chapters.module.css";
export const metadata = { title: "Privacy and sources | Orbital", robots: { index: false, follow: true } };
export default function PrivacyPage() {
  return <Chapter><ChapterHeading label="Privacy and sources" title="A short privacy note." description="Draft for the current preview. This notice is not yet a finalized legal privacy policy." />
    <div className={s.privacyNote}>
      <section><h2>Who runs Orbital</h2><p>Operator: Asan Memetov. Orbital is an independent exploration project using public NASA sources.</p><p>Privacy contact: to be added before public launch.</p></section>
      <section><h2>What happens when you browse</h2><p>The current interface does not require an account or use advertising analytics. Hosting providers receive normal technical request information, including your IP address. Hosting logs and retention still need to be confirmed.</p><p>A date entered in the APOD archive is used to request that public publication from NASA. Orbital does not save it in a profile or localStorage, or include it in application diagnostics.</p></section>
      <section><h2>External content is your choice</h2><p>Images load from NASA and other credited source hosts, which receive normal network information. External video players load only after you choose to enable them and may use their own browser storage. Related reading may use Wikipedia.</p><p><a href="https://www.nasa.gov/privacy/">NASA</a>, <a href="https://policies.google.com/privacy">Google / YouTube</a>, <a href="https://vimeo.com/privacy">Vimeo</a> and <a href="https://foundation.wikimedia.org/wiki/Policy:Privacy_policy">Wikimedia</a> describe their own practices.</p></section>
      <section><h2>Sources and credits</h2><p>Observation dates and available credits accompany the content. Illustrations and reconstructed asteroid shapes are labelled. Some APOD works belong to third-party creators: check the original source before reuse.</p></section>
      <p className={s.caption}>Before launch: add a working contact, confirm target markets and hosting practices, and finish the applicable privacy notice.</p>
    </div>
  </Chapter>;
}
