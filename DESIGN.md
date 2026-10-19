# Compact mobile tools and curated learning — 2026-10-18

This accepted direction supersedes the older centered archive introductions and generator v3 below. Keep Space Grotesk, the dark expedition identity and real media, but put the tool first on internal mobile pages: 28–32 px headings, 16 px body copy, labels at least 12 px, controls at least 44 px. One primary action may use warm fill; search and secondary controls use quiet outlines. Gallery/Videos begin with a short title and inline search; asynchronous results do not replace the search shell. Home keeps Earth, Moon and flight with a shorter mobile scene and description.

The document is the page's only vertical scroll container. Native dialogs own their scroll and share a ref-counted background lock that restores styles, scroll position and focus. The expedition map is a compact linked route with thumbnails, current chapter and a reduced-motion equivalent. Birthday and teacher collections are explicit additional destinations.

Media of the Day is an exhibit, not an introduction: compact title/publication metadata, full uncropped image over its subdued same-source background, image enlargement, and expandable explanation/source. Publication and observation dates are distinct. External embeds require an action; YouTube uses the official IFrame API and strict-origin-when-cross-origin, reports errors next to the player and always exposes its watch link. No download proxy is introduced.

Generator v4 is the intentional one-time identity migration: 60% irregular rubble, 25% elongated, 12% softly chipped fragments and 3% asymmetric thick-necked bilobes. ID fixes the versioned descriptor, texture, independently selected tone, detail scale and offsets. Use six inspected existing stone maps (1, 2, 5, 8, 10, 12). Do not silently change this generator after release; a future intentional migration requires a new version. NASA measurements never drive surface identity or imply composition. Mobile catalog preview is opt-in; the profile retains the scene and proportional comparisons.

`/learn` contains five hand-curated English LessonPack records for ages 11–14, each 40 minutes in 5/10/15/10 stages, with source-linked media and browser printing. No runtime lesson generation. `/birthday` defaults to five Hubble images grouped by CSV Date day/month, using Year for observation year. The common public CSV is cached for 12 hours; selections use POST with no-store and never enter URLs/storage. The APOD exact-date mode retains the existing archive adapter. Existing NASA intervals, fallback policy, Firebase and deployment remain unchanged.

---

# NASA Next: Orbital

## Direction

An inviting orbital observatory for curious people exploring NASA's public data and imagery. The main action is to choose a destination, with near-Earth objects and the image of the day available immediately.

The defining image is a recognizable Earth with a small Moon and a legible orbital ellipse. The scene is an illustration, not a live ephemeris or a scale model. Slow rotation supplies depth; the surrounding interface stays quiet. No invented operational status, dates, or telemetry.

Use the existing Space Grotesk family throughout the homepage. Display type is large, regular, tightly composed and plain white. Body text is sentence case with comfortable leading. Bungee remains available to existing internal routes but must not be inherited by the homepage. Navigation labels are human-readable, without decorative tracking codes.

Color roles: space #030609, raised surface #0b1118, foreground #f1f4f6, secondary #a8b3bf, warm interaction accent #edc18c. Blue belongs primarily to Earth's imagery. Keep texture and stars restrained enough that text does not compete with them.

Composition: calm header, large left-aligned two-line headline and supporting copy, Earth dominating the right side, with its orbit extending behind the composition. Below, a sticky introductory column faces a readable list of six destinations with image previews. On mobile the scene sits above the copy and the destinations form a single column.

Avoid the rejected treatments: giant blurred gradient ball; Bungee body copy; faint capsule strips; 01/TRACK labels; fake live badges; arbitrary orbit codes; individually colored title words; hover-dependent readability. Do not replace these with another unrelated generic theme.

## Interaction and scope

The existing six destinations remain /asteroids, /day, /eonet, /space-weather, /gallery and /video. /library is retained in navigation. The homepage's data-free illustrative scene is isolated from NASA fetching, Firebase, deployment workflows and internal route behavior.

Use existing Three.js with deferred import, local textures, capped device pixel ratio, cleanup, offscreen/hidden-tab suspension, reduced-motion support and an explicit pause control. Static textured fallback must remain when WebGL fails. Native document scrolling; no scroll hijacking or fade-to-unreadable sections.

## References and provenance

- Frontend design method: https://github.com/anthropics/skills/tree/main/skills/frontend-design (installed globally; project brief controls the actual style).
- Awwwards 3D collection: https://www.awwwards.com/websites/3d/ (discovery source, not a claim of implementing a particular award-winning site's design).
- NASA exploration reference: https://trek.nasa.gov/ (subject and destination-oriented exploration).
- Earth and Moon texture files come from Three.js r167 examples: https://github.com/mrdoob/three.js/tree/r167/examples/textures/planets . These are illustrative texture maps; no new live NASA data endpoint is introduced.

## Validation

Verify desktop and mobile composition, all six route links, keyboard focus, pause/resume and reduced motion. Run TypeScript, focused lint and production build. Record actual results in docs/PROJECT_CONTEXT.md; do not equate compilation with visual approval by the user.

## Asteroid chapter: approved extension

The observer is freely exploring realistic space, not sitting inside a cockpit. Continue the homepage's lighting, typography and calm controls. Shared Orbital tokens live in ui/orbital/orbital.module.css; destinations and the accessible fullscreen content map are shared with the homepage. Space Grotesk body copy is at least 16 px; auxiliary labels at least 12 px on updated screens.

The catalog is a selected-object scene followed by a legible NASA list, name search and distance/diameter/speed sorting. Default to the smallest known miss distance. The encounter journey moves from the illuminated object to human scale, then to Earth–Moon distance, followed by selectable approach history and expandable source data.

One desktop scene is sticky during the first three chapters. ScrollTrigger controls the camera pullback and chapter changes while document scrolling remains native. An orthographic scale view compares the same reconstructed rock with a 1.8 m silhouette: the rock's exact vertical extent is normalized to the midpoint of the estimated diameter range. This is a representative dimension, not a measured physical shape. The scale ruler has the same physical extent. On mobile and with reduced motion, sections run sequentially with proportional static diagrams. Never enlarge the human independently to make it easier to see.

All surface geometry is seeded by asteroid ID. Label it as an artistic reconstruction. The Earth–Moon diagram is explicitly not to scale and never implies a computed orbit or trajectory. A lunar distance is approximately 384,400 km. Non-Earth history entries identify their actual encounter body.

Catalog links carry ?date=YYYY-MM-DD. Profile data must refer to the selected event, not the first array item. With no valid requested event choose the next Earth encounter relative to UTC today, otherwise the latest known Earth encounter; missing Earth history remains unknown. Keep legacy /asteroids/[id]/[scaleAsteroidSize] URLs working while ignoring their old size/speed payload. Do not invent absent measurements.

No added dependencies, sound, planet pages, Firebase changes or deployment belong to this phase. The next content phase is Media of the Day.

## Living asteroids and continuous flight

The accepted refinement keeps the expedition composition and makes each object recognizable. Visual generator v2 is a pure NASA-ID-derived descriptor with independent shape/material seeds, four silhouette families (rubble, elongated, shard, bilobed), broad asymmetric volumes, local depressions and small surface detail. Its named material slots and version are fixed. Date, ordering, encounter velocity and updated diameter estimates never alter identity. These are artistic surfaces, not claims about an object's measured shape or composition. Shape references: https://science.nasa.gov/solar-system/asteroids/25143-itokawa/ and https://science.nasa.gov/solar-system/asteroids/101955-bennu/facts/ . Existing stone-2.jpg and stone-8.jpg assets were visually inspected and reused; their original provenance was not newly established.

One deferred renderer belongs to the root OrbitalSceneProvider, above route templates. Scene hosts register home/catalog/profile state. A link-intent flight transfers its canvas into a non-interactive overlay, then into the destination host; Next.js navigation starts immediately. Home-to-catalog flight takes 1.2 s, catalog-to-profile 0.8 s, mobile 0.65 s. Slow data loads do not extend the flight. Back/Forward cancels it, and changes to query parameters do not replay it. Other chapters dispose the renderer; a maximum of two asteroid meshes is retained during chapter navigation.

Stars and reference particles provide depth. Particle travel has one fixed coefficient for every encounter speed, while the 0–100 km ruler shows the exact distance travelled in one second. Spin is artistic and independent of linear velocity. Pause and reduced motion stop automatic motion; controls remain available. The scale comparison fits the actual rock bounds and preserves the 1.8 m person ratio. Static views project the same generated surface. The explanatory distance figure uses local textured Earth/Moon disks, spherical lighting and the selected rock's projection; it remains explicitly not to scale.

Catalog single-click selects without scrolling; double-click and the accessible Show selected object button return to the preview. The profile exposes the next known Earth approach after the selected event and an explicit Past & future encounters link. Past/Upcoming filters use UTC today; unknown future history is never described as no future return.

## Complete interface extension — 2026-10-01

The remaining chapters now share the Orbital background and Space Grotesk. Media uses a large exhibit and caption/story; image and video catalogs retain search, pagination and a native modal viewer. Solar reports and technology records are readable lists. Preserve the accepted home and asteroid compositions.

Earth events use the root scene owner's deferred renderer in an `events` mode, with reported coordinates projected onto the textured Earth. Category icons share one warm color. Nearby observations open a list; selecting a report or its geometry changes the focus and source observation date together. No affected areas or trajectories are inferred. Mobile and failed WebGL use the same events on an equirectangular reference image. Rotation is opt-in, pausable and suspended offscreen; reduced motion leaves selection available.

EPIC is an archived observation sequence with manual frames and opt-in playback. `/library` is an observation journal: an issue image, available-data summary, source-dated publications, Earth observations and a separate encounter section. Source dates, observation times and page generation are distinct. Unknown dates remain unknown; local images and upstream failures are labelled. API requests, cache intervals and scheduled workflows are unchanged.

## Recovery and polish — 2026-10-13

The current brief authorizes repairs and final polish across these existing chapters. Gallery and Videos use centered introductions and one soft search surface; the viewer gives the image the full width with compact expandable context. EONET has one category/count/sort panel; selection moves Earth along a 700 ms shortest quaternion arc with interruptible targeting and synchronized pins. EPIC uses a pure-black uncropped image area and decoded-frame playback. The homepage keeps its composition and uses its existing Earth texture for the small expedition diagram.

Asteroid generator v3 supersedes v2: versioned ID seeds, asymmetric clipping and lobes, and stronger local relief reduce mirrored/smooth surfaces. Physical normalization and the artistic-reconstruction labels remain. The original Orbital mark replaces the NASA insignia as application identity; NASA remains credited as the source. Optional third-party video players require an explicit load action.

## Current chapter repairs - 13 October 2026

Keep the established home hero and six destination rows. Below them, two calm, prominent links introduce EPIC and Observation journal. EPIC's entire chapter is pure black, joining the real uncropped frame to its surroundings. EONET keeps the shared globe and all filtered map locations while its list paginates by eight. Space Weather pairs real publication dates with a quiet conceptual Sun-Earth diagram; no quantitative telemetry or event trajectory is implied. The navigable Birthday chapter searches actual APOD publications by a transient date. Privacy remains a short, explicitly unfinished preview notice.

## Animated solar environment

The user requested the Space Weather illustration to share the dimensional character of the homepage Earth. Use the same texture and shared renderer for Earth, a procedural warm solar surface/corona, braided plasma loops and flowing particles. Motion is explanatory, never a claim about current space weather; retain the not-to-scale caption, pause and static reduced-motion mode. Home must not switch between an equirectangular map clipped to a disk and a true sphere: reveal the loaded sphere directly, retaining the static image only on rendering failure.

## Compact interface and screenshot follow-up — 18 October 2026

These current rules supersede earlier chapter-specific descriptions above. Keep Space Grotesk and the dark expedition identity; on mobile put the search, date form or media first. Internal headings use 28–32 px, body copy 16 px and captions at least 12 px. Actions have soft corners, 44 px targets, quiet secondary borders and one warm primary action. Focus is thin gray, with a thin muted warm line for pointer-active fields; never stack orange rings.

Gallery/Videos use a compact single-row search that returns on upward scrolling. The document remains the only page scroll container. Modal media and navigation own their scroll while open and restore focus/page position on close. Media of the Day uses an uncropped image over its own subdued blurred backdrop and expandable context. Expanded YouTube uses an owned in-page dialog with a persistent Back action and source link, preserving iframe state.

Asteroid visual generator v4 supersedes v3: ID-seeded 60/25/12/3 percent rounded/elongated/angular/bilobed families, six stone textures, independent tone/detail. Mobile catalog starts with search/sort/list and an explicit preview reveal. NASA measurements never change visual identity or imply physical composition.

EONET uses the shared globe on mobile too; flat reference is explicit or a rendering fallback. EPIC starts automatic decoded-frame playback while visible, with Pause, manual frames and static reduced motion. These replace the former mobile-flat and opt-in-playback decisions.

Birthday uses a complete date by default, explained without APOD jargon. The alternate Hubble view groups day/month across years and identifies each actual observation year. Teacher lessons put curated sources inside their activities, preserving credits and printable links. No visitor dates in URLs/storage. No ads, accounts or new dependencies in this phase. See docs/USABILITY_REVIEW_2026-10-18.md for verification and the separate advertising proposal.

## Home focus: Earth first, clear asteroid entry — 18 October 2026

The current narrow brief prioritizes a larger mobile Earth/Moon scene over hero typography. On phones the scene is 320–370 px high, the heading is 32 px, and the supporting sentence is short. A closer home-only camera makes Earth the focal point; the illustrative Moon orbit is compacted enough to remain beside it. Desktop camera framing, other scene modes, pause, reduced motion, fallback, DPR limits and shared renderer ownership remain.

The primary home action is “Explore asteroids” with “How close do they pass Earth?” beneath it, using a quiet warm outline and a warm circular arrow. The map and home destination say “Asteroids” and explain close passes plainly. Use the existing single-body Psyche illustration as a decorative close-up thumbnail, not the former field of tiny fragments. It represents the section, not a measured near-Earth encounter or a claim that Psyche is in the feed. Do not invent impact warnings or countdowns to make the entry engaging.

## Mobile asteroid catalog: visible object and direct rows — 18 October 2026

This user correction supersedes the earlier mobile preview-collapse rule. Never hide the catalog's selected asteroid behind “Preview selected object”. Mobile starts with a compact visible model, date, exact selected distance and View details. The full mobile profile also shows the model before its longer narrative.

Compact mobile rows lead with rounded miss distance, then estimated size and speed. The designation is secondary; ordinary rows do not repeat “Near-Earth asteroid”. Each row has a shaded textured projection of the same ID-derived surface and opens its dated profile directly. These thumbnails are static projections, not additional WebGL canvases. Desktop keeps selection and double-click return to the scene. Sorting sits on the right: Closest ascending, Largest/Fastest descending, unknown values last. Designation search remains a secondary magnifier disclosure without occupying a full input row.

Asteroid-only front fill improves legibility of dark textures; home Earth/Moon and solar lighting are unaffected. Generator v4 identity, family distribution, textures, measurement normalization and reconstruction labels remain. The small rows intentionally round large distances; the selected summary and profile retain precise kilometres. No inferred trajectories or impact claims.

## Asteroid history: a journey through years — 18 October 2026

The encounter section now leads with an opt-in illustrative journey, a large year, the actual selected event card, playback controls and a full-range calendar timeline. The complete records remain below in a disclosure. Keep All/Past/Upcoming relative to UTC today; a final record means only the end of NASA's supplied history.

The shared renderer has an explicit `encounters` host. At least one quarter of the history stage must be visible to activate it; it releases the canvas only when entirely offscreen. The upper profile scene then restores its host. Inactive scenes use a textured static reconstruction. Offscreen/hidden-tab playback stops and requires Play again. Reduced motion and failed WebGL preserve manual event selection.

Only bodies present in the history join the central Sun. Earth and Moon reuse existing maps; other bodies use procedural materials and unknown bodies retain a labelled neutral marker. A short transient trail and overview-to-close camera illustrate travel without drawing a computed orbit. Measurements commit only at real event stops. Never label Venus distances as distances from Earth or infer distances from the drawn gap.

Normal previews, history and list portraits use `clamp(0.5, 1.35, (diameter / 150) ** 0.3)` with neutral scale 1 for missing diameter. Generator v4 and ID identity remain unchanged. Human comparisons preserve the exact physical ratio and bypass this visual constraint. NASA requests, caches, public Approach/API contracts and dependencies remain unchanged.


## Continuous journey, birthday keepsake and public identity — 18 October 2026

The user's recording follow-up supersedes the opt-in/non-looping encounter rule. History now autoplays and repeats while visible, with a persistent user Pause. A short 600 ms encounter hold and 3400 ms transfer replace the former long static stop. Offscreen/hidden-tab suspension resumes only if the visitor has not paused or manually selected a date; manual timeline/filter/record actions leave inspection still. Reduced motion and failed WebGL remain manual/static. Do not claim scientific flight paths or frame-rate guarantees.

Keep animation years outside React's per-frame render path, reuse the transfer curve/vectors, and coalesce renderer wake requests. History, Earth and solar hosts do not attach unused OrbitControls. All scene hosts preserve pan-y and pinch-zoom; the scripted history canvas is pointer-transparent. All bodies supplied by NASA history are represented; close views label the featured body, and overview views label the system.

Birthday now defaults to a printable Hubble collage, with plain Birthday poster / NASA picture by date modes. The day/month collection works for any birth year. A birth year can be added to the poster, is labelled Born, and stays client-only; each photograph independently names its actual observation year. Preserve uncropped images, source links and the distinction from a calculated birth-sky map. The daily publication archive still starts June 16, 1995.

The Orbital mark is now an open O with a warm orbital path, replacing the filled gray planet. Public author: Asan Memetov; privacy contact: amemetoff.it@gmail.com. Privacy uses quiet 14 px body text and a 12 px footer link, with readable contrast. The notice describes actual app behavior and provider handling without inventing infrastructure retention periods.

Technical SEO uses the confirmed https://nasa-odisey.web.app origin. NEXT_PUBLIC_SITE_URL changes the canonical origin for a future domain after rebuilding. Keep route-specific titles/descriptions/canonicals, sitemap, robots, social image and truthful WebSite/Person structured data. No analytics, Search Console account actions, dependencies or deployment were added.


## Birth sky and wall artwork — 18 October 2026

The owner explicitly replaced the Hubble collage direction with a calculated birth sky and a wall poster. Birthday defaults to My birth sky; archive photographs remain secondary, accurately labelled. The product stays English and the surrounding Orbital UI retains Space Grotesk, dark surfaces and one warm primary action.

The artwork is a single A3 portrait composition, separate from the web controls: one large stereographic sky hemisphere, an expressive curved colour field, a two-line personal title, actual local date/time/place and a small Orbital mark. No photo grid, web buttons or source list is printed on its face. Sources/licence live beside the work and in exported metadata. Base palette: deep blue #091f3d, steel blue #224f72, cyan #55cbd8, coral #ff785f, rose #d74861, pale ink #fff2de. Violet and Midnight are selectable colour treatments of the same calculated chart. These decorative colours do not claim to reconstruct observed nebulae or weather.

Desktop: date/place tools left, frozen interactive 3D observer sky right; a separate poster workbench below. Mobile: compact heading and three short tabs, explicit date/hour/minute fields, city selection, sky, then poster controls/art. Vertical gestures remain native scrolling; sideways drag and labelled keyboard sliders change the viewing direction. No automatic spinning of a birth-time sky. Typography in the artwork uses the bundled Space Grotesk font; SVG export embeds it.


## Direct PDF and telescope-image fragments — 18 October 2026

The user requested an actual downloadable print-shop PDF, plain time (no visible GMT/local-time wording), a larger chart and creatively layered real telescope photographs. This supersedes the former default dedication and abstract “moment in the universe” heading. The poster now says Your birth sky, names the birthplace prominently and prints the date, simple HH:MM and coordinates. Optional personal text starts blank. The chart radius increases from 333 to 369 units (about 23% more area), with unchanged astronomical positions and orientation.

The single-sheet composition has a translucent Carina photographic texture outside the opaque chart, a warm ribbon, and two differently tilted photo plates with side faces/shadows: Carina Nebula / Webb 2022, Whirlpool Galaxy / Hubble 2005. Plates sit below the chart and preserve the calculation’s meaning. Photographs can be disabled. On-screen explanation explicitly separates the calculated birth sky from telescope portraits taken in their stated years. Full credits remain beside the work and in export metadata; no source list is printed on the face. Space Grotesk remains the artwork typeface. PDF is the primary warm action; PNG/SVG/browser print remain secondary.


## Uninterrupted flybys and profile entry — 18 October 2026

The newest recording correction supersedes the short encounter hold: autoplay is an uninterrupted illustrative flight, including the loop seam. Shared encounter waypoints and tangents carry both asteroid and camera through each event without a stationary beat. A wider overview provides breathing room around the central Sun and every body actually supplied in the history. Keep a visible gap at flybys, an open fading trail and the explicit not-to-scale caption; do not add invented encounter bodies or claim a calculated orbit. Pause and manual selection remain available.

The selected catalog action says Explore this asteroid, supported by 3D view, size & future flybys. It is the warm primary action, wide and readable on phones. Entry retains the original model while route data loads, then moves the single canvas directly to the ready profile host with a subtle camera pullback. No full-screen midpoint or second entrance pop.

## Calculated encounter windows and v5 rocks — 19 October 2026

The approved current brief supersedes continuous invented arcs between encounter records. Use JPL Horizons sampled states for asteroid and encounter target, with Astronomy Engine for background planets at the same time. Each close-approach window lasts eight seconds at 1×, followed by an explicit Time jump; repeat resets the date without a connecting arc. Default framing shows the inner system through Jupiter, with Whole Solar System available. Real AU centers, physical local radii and enlarged screen markers are separate; captions explain the distinction. Missing data shows a status and Retry, never a fabricated orbit.

Keep the existing dark Space Grotesk interface, full-range timeline, native scrolling and one shared WebGL renderer. Comparison references adapt to diameter: person 1.8 m, representative bus 12 m length, football pitch 105 × 68 m length, Burj Khalifa 828 m height. Manual selection shares the exact meter scale in SVG and Three. Generator v5 is an intentional version change: broad asymmetric masses, local calm/eroded/fractured/bouldery areas and independent materials, without uniform bumps. Shape remains version+NASA-ID deterministic. See docs/CALCULATED_ENCOUNTERS.md for the coordinate/cache contract and release preflight.
