# Birth-sky data and calculation register

This feature reconstructs celestial directions above a chosen location/time, not a historical photograph or an exact reconstruction of weather. There are no new runtime NASA requests. Date/time/location conversion and sky calculations run locally in the visitor's browser. Scientific layout and artwork are separate.

## Astronomy Engine

Bundled, unmodified ESM source and TypeScript declarations: **2.1.19**, Don Cross, MIT. Licence: `src/app/lib/sky/vendor/astronomy-LICENSE.txt`. No package.json or lockfile change. Source: https://github.com/cosinekitty/astronomy/tree/master/source/js . Downloaded 18 October 2026; ESM SHA-256 `0276ebbcfc3746cad98417e3082ba510067ae81a92c1f6ad0f43fae8d417fdc7`; declarations `07761fe116180d74f3ee8fb2930e03493d535c99984c7d88c4b5bbca6c1105d1`.

The observer is at selected city-centre geodetic latitude/longitude and zero elevation. Planetary Equator(ofdate=true, aberration=true) -> Horizon without refraction. Stars use proper motion, Rotation_EQJ_HOR and no refraction; no annual stellar parallax/aberration or radial perspective correction is claimed. Map precision is appropriate for a personal wall chart, not telescope pointing or navigation. UT/UTC before modern UTC follows the library time approximation.

## Stars and constellation lines

HYG **v4.1**, David Nash / Astronexus, compiled from Hipparcos/Yale/Gliese. Source https://github.com/astronexus/HYG-Database/blob/main/hyg/CURRENT/hygdata_v41.csv ; SHA-256 `d9f69fd86bbf90a4e4d52b4c5c53eacfa6dfc0bfdef85bfd94f095e0bebe4ebd`. Licence CC BY-SA 4.0; preserved HYG-LICENSE.txt and CC-BY-SA-4.0.txt beside the data.

The derived `catalog.json` retains stars with visual magnitude <=6.5, plus endpoints of the modern constellation figures, excluding the catalogue's Sol entry. 8,922 rows: `[HIP or negative HYG ID, proper name, RA hours J2000, Dec degrees J2000, visual magnitude, pmRA*cosDec mas/year, pmDec mas/year, B-V colour index]`. Proper motion is a tangent-vector displacement from J2000 over Julian years, then the observer rotation is applied. Displayed stars are limited to magnitude <=6.5 and the upper geometric hemisphere.

Stellarium modern skyculture line data: https://github.com/Stellarium/stellarium/tree/master/skycultures/modern ; index SHA-256 `1f2f5ffd6c9e25a7d0dcfdbf1f756e2db03dd3b8ed4ec016a2839b09f6b0fe1e`. The skyculture description states **Text and data: CC BY-SA 4.0**. Only constellation line sequences are used, not illustrations or application code. Expand each sequence to neighbouring HIP pairs; retain pairs present in the catalogue: 695 segments. The source description SHA-256 is `4b58344f63168d7c816fdfef405103b5770fda2e1f4a4bf5c8871041ce042586`.

HYG/Stellarium data and the derived chart carry CC BY-SA 4.0. Attribution/license text is visible beside the artwork and in SVG metadata/description and PNG iTXt. The downloaded artwork face contains no web source-list. Keep accompanying credits with redistributed charts. The homepage preview is derived from the same public Berlin example; its provenance is this register.

## City lookup and civil time

Open-Meteo geocoding / GeoNames, https://open-meteo.com/en/docs/geocoding-api . Only the city search term is sent through a bounded, abortable server endpoint; no-store, no birthday date/time/location history. Return coordinates, country/region and IANA zone. The current free provider is non-commercial: https://open-meteo.com/en/terms . Future monetization requires permitted commercial/self-hosted geocoding; no paid account was created.

Intl.DateTimeFormat uses the visitor platform's IANA database. Candidate offsets around the requested local day are checked by exact round trip. No silent gap/fold disambiguation. Historical rules, particularly pre-1970, are not universally complete; users can inspect the IANA zone and calculated offset. Geometry accepts 1900–2100; birth form accepts 1900 through today.

## Typography and export

Space Grotesk by Florian Karsten, SIL Open Font License 1.1, https://github.com/floriankarsten/space-grotesk . The existing Next font's Latin WOFF2 is copied to `public/media/sky/space-grotesk.woff2`, with OFL.txt. SVG export embeds this font; non-Latin glyphs fall back to a viewer font. Poster title is escaped as XML and constrained to two lines. PNG is 3508x4961 with 11811 pixels/metre (300 dpi), source credit iTXt and unchanged pixel chunks. SVG has physical A3 portrait dimensions and scalable geometry. Browser print isolates the same artwork; borderless printing or trimming is needed for full bleed. Print-dialog paper/headers settings belong to the visitor's browser.

## Independent reference check

`tests/fixtures/sky-jpl.json` records NASA JPL Horizons API airless topocentric azimuth/elevation for the public Berlin fixture, 1980-06-06 20:30 UT, longitude 13.405, latitude 52.52, zero elevation. Sun 324.372739/-7.528626, Moon 47.654796/-32.830783, Venus 313.365772/-0.535781, Jupiter 253.615972/26.495510 degrees. Local output agrees within 0.02 degrees. Source: https://ssd-api.jpl.nasa.gov/doc/horizons.html ; observer coord@399, geodetic SITE_COORD, quantity 4, APPARENT=AIRLESS, retrieved 18 October 2026. The reference is test data only, not a production API dependency.


## Optional poster photographs and PDF — 18 October 2026

The photographs are decorative telescope portraits, separate from the calculated sky. They are not selected by birth date and do not claim to be the view from that city. The checkbox removes all photo elements.

- Carina Nebula / Cosmic Cliffs, NIRCam, observed **3 June 2022**. Credit **NASA, ESA, CSA, STScI**. Source: https://science.nasa.gov/asset/webb/cosmic-cliffs-in-the-carina-nebula-nircam-image/ . Downloaded official 2000x1158 PNG rendition of STScI-01GA6KKWG229B16K4Q38CH3BXS; converted to local high-quality JPEG with 4:4:4 chroma for the decorative fragment/texture. `public/media/sky/carina.jpg` SHA-256 `b1b64120943ae9ce073487f0692771a779a08fefc829b4d0c66560ccd27bad2c`.
- Whirlpool Galaxy / M51, observed **January 2005**, Hubble ACS. Credit **NASA, ESA, S. Beckwith (STScI), and The Hubble Heritage Team (STScI/AURA)**. Source: https://science.nasa.gov/asset/hubble/out-of-this-whirl-the-whirlpool-galaxy-m51-and-companion-galaxy/ . Bundled the official photograph-only 1280x888 JPEG rendition of STScI-01EVT85S0E93YAFY779MNYA9Y4, not the annotated 3000x2400 lithograph. `public/media/sky/whirlpool.jpg` SHA-256 `a8616d354fab41d53d5115772d5a01e41b76db081a80a0eb5ac3f77a08648de8`.

Sources and credit strings were manually checked on NASA pages on 18 October 2026. Image fragments are cropped/tilted through SVG composition; the faint background is decorative. The opaque chart still shows only calculated directions. Photo rights/credit remain separate from the CC BY-SA chart-data licence; no blanket relicensing or endorsement is claimed. Saved SVG/PDF/PNG metadata preserves these credits, with clickable source pages in the on-screen disclosure.

Direct PDF export uses the browser-rendered artwork at 3508x4961 with lossless RGB Flate compression, exact 297x420 mm boxes and no margins, interactive links or external resource references. Lettering is rasterized at print resolution; no viewer font substitution. The default is a standard RGB PDF, not a PDF/X/CMYK or a larger sheet with additional bleed. A print shop can print this A3 sheet at 100% and trim full bleed as needed. No native-browser print-dialog scaling is involved in PDF creation. The separately downloaded SVG keeps vector chart geometry and embeds fonts/photos.
