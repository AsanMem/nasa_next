import { Chapter, ChapterHeading } from "../ui/orbital/chapter";
import { pageMetadata, site } from "../lib/site";
import s from "../ui/orbital/chapters.module.css";

export const metadata = {
  ...pageMetadata("/privacy", "Privacy & sources | Orbital", "How Orbital handles browsing information, birth-sky inputs, external media and image credits."),
  robots: { index: false, follow: true },
};

export default function PrivacyPage() {
  return <Chapter><ChapterHeading compact title="Privacy & sources" /><div className={s.privacyNote}>
    <p className={s.caption}>Updated October 19, 2026</p>
    <section>
      <h2>Who runs Orbital</h2>
      <p>Orbital is an independent project by {site.author}, using public NASA sources. It is not affiliated with or endorsed by NASA. Questions or privacy requests: <a href={`mailto:${site.email}`}>{site.email}</a>.</p>
    </section>
    <section>
      <h2>Browsing and searches</h2>
      <p>No account is needed. Orbital has no advertising or audience analytics and does not create a visitor profile. Search terms and selected asteroid encounters can appear in page URLs, browser history and hosting request logs. Please avoid personal information in searches.</p>
      <p>Firebase Hosting and its Google Cloud backend process technical request information, including IP addresses and HTTP headers, to deliver and protect the site. Technical logs are managed under the providers’ service settings. <a href="https://firebase.google.com/support/privacy">Firebase privacy information</a>.</p>
    </section>
    <section>
      <h2>Your birth sky and archive searches</h2>
      <p>Birth-sky calculations and poster exports happen in your browser. Orbital does not save your birth-sky date, time, selected coordinates or poster text in a URL, persistent browser storage or a visitor profile, or upload them to a conversion service.</p>
      <p>City search sends the city name to Orbital’s server and Open-Meteo / GeoNames to find coordinates and a time zone. Your birth date and time are not included. City-search responses use no-store. You can enter coordinates and a time zone instead. <a href="https://open-meteo.com/en/terms">Open-Meteo terms and privacy</a>.</p>
      <p>The separate NASA picture-by-date search sends your selected date to Orbital’s server, which requests that public archive entry from NASA. Hubble search sends only day and month and matches a shared public dataset. These selections are not added to the page URL or a visitor profile.</p>
    </section>
    <section>
      <h2>External media</h2>
      <p>Images, videos and Wikipedia reading can load from credited external hosts, which receive normal network request information. Optional YouTube and Vimeo players load only after you press the named provider’s button. The provider may then use browser storage; Orbital does not save that choice between visits.</p>
      <p>Provider policies: <a href="https://www.nasa.gov/privacy/">NASA</a>, <a href="https://policies.google.com/privacy">Google / YouTube</a>, <a href="https://vimeo.com/privacy">Vimeo</a> and <a href="https://foundation.wikimedia.org/wiki/Policy:Privacy_policy">Wikimedia</a>. You can leave optional players unloaded and manage provider data in your browser.</p>
    </section>
    <section>
      <h2>Contact and your choices</h2>
      <p>Information you email is used to answer your message or handle your request. Contact <a href={`mailto:${site.email}`}>{site.email}</a> about access, correction, deletion or another privacy concern. We will explain what we can access and what is handled by an external provider, subject to applicable law.</p>
    </section>
    <section>
      <h2>Sources and credits</h2>
      <p>Dates, source links and available credits accompany the content. Asteroid surfaces and encounter flight paths are artistic illustrations. Birth-sky directions are calculated; decorative colours and enlarged markers are artistic. Earth-event coordinates locate reported observations, not temperature readings or affected-area boundaries.</p>
      <p>Image rights vary, including third-party NASA archive and APOD contributions. Check the original item’s credits before reuse. <a href="https://www.nasa.gov/nasa-brand-center/images-and-media/">NASA media guidance</a>.</p>
      <p>Birth-sky stars: HYG v4.1 by David Nash / Astronexus. Constellation lines: Stellarium modern skyculture. Catalogue data and derived chart: <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>. Calculations: Astronomy Engine 2.1.19 by Don Cross (MIT). Exported PDF, SVG and PNG files include source and licence metadata. Decorative Carina Nebula and Whirlpool Galaxy photographs have separate credits beside the artwork and in export metadata. Keep credits with shared copies. Typography: Space Grotesk, SIL Open Font License.</p>
    </section>
  </div></Chapter>;
}
