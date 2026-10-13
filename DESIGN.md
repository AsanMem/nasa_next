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
