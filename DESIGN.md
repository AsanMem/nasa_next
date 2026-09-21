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
