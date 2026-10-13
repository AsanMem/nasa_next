# Orbital regression checks

No additional test dependencies are required. Run from the repository root in PowerShell:

```powershell
$modelOutput = Join-Path $env:TEMP 'orbital-model-tests'
npx tsc src/app/lib/asteroids/view-model.ts --module commonjs --target es2020 --skipLibCheck --outDir $modelOutput
$env:ORBITAL_TEST_MODEL = Join-Path $modelOutput 'view-model.js'
node --test tests/asteroids-view-model.test.cjs tests/asteroid-visual.test.cjs tests/asteroid-scene-lifecycle.test.cjs
```

The data suite checks date selection, the 1913/2026 regression, next Earth encounters, UTC history filters, missing measurements, diameter precision, sorting, legacy path generation and source links. The visual suite checks reproducible identity, the four shape families, finite surfaces and normalized static projections. The renderer suite executes the actual shared scene engine with browser/WebGL boundary doubles: a single renderer through chapter navigation, cancellation, disposal, offscreen/hidden suspension, pause, reduced motion with manual rotation, texture/WebGL failures, the actual orthographic rock/person ratio, and a fixed coefficient for particle speed. These are 24 checks in total.

These tests do not replace real-browser visual review or GPU testing. For the rendered review, check desktop and mobile, catalog search/sorts/selection, direct and legacy links, selected encounters, map focus/Escape, Back/Forward, and canvas count after repeated navigation.

Run `npx tsc --noEmit --incremental false` and a production build. Stop every dev server for this checkout before `npm run build`: simultaneous Next processes can corrupt the shared `.next` manifests. Start exactly one preview afterward.

## Complete interface checks (2026-10-01)

After the model compilation above, run the complete 38-check suite:

```powershell
node --test tests/asteroids-view-model.test.cjs tests/asteroid-visual.test.cjs tests/asteroid-scene-lifecycle.test.cjs tests/observations.test.cjs tests/presentation.test.cjs
```

The extra checks cover UTC and explicit offsets, impossible/unknown dates, source ordering and deduplication, separate encounter dates, EONET geometry/date agreement, invalid coordinates, antimeridian polygons, coincident/polar marker clusters, Earth marker projection through the existing renderer, APOD/EPIC fallback labels, upstream site logos, missing media and accessible image triggers. Browser/GPU boundaries in lifecycle tests are simulated.

## Recovery checks (2026-10-13)

After compiling the model as above, run all 53 checks:

```powershell
node --test tests/asteroids-view-model.test.cjs tests/asteroid-visual.test.cjs tests/asteroid-scene-lifecycle.test.cjs tests/observations.test.cjs tests/presentation.test.cjs tests/nasa-recovery.test.cjs tests/epic-playback.test.cjs
```

New cases cover authorization, rate limits, service errors, HTML instead of JSON, invalid schema, empty responses, secret-free logs, cancellation/timeouts and unchanged cache intervals; DONKI migration and missing text; EPIC metadata, decode-before-commit, stale-load rejection, 1500 ms opt-in playback, hidden-tab suspension and unmount cancellation; journal encounter selection; event sorting with unknown dates; shortest quaternion focus, interrupted retargeting and reduced motion; and optional video embeds before activation. These tests use network, image and browser/GPU doubles. They do not certify provider availability, actual storage behavior, keyboard operation or desktop/mobile composition in a real browser.

## Current repair checks (13 October 2026)

Run the full suite above plus `tests/eonet-interactions.test.cjs`: 59 tests total. The EONET tests execute the real components with controlled hooks and check group/individual focus, repeated selection, paused/reduced motion controls, eight-item pagination and marker selection across pages. APOD tests now cover the verified NASA Science source, publication date bounds, image/video/credit extraction, midnight-inclusive queries, empty publications and diagnostics without dates. Invalid APOD responses now remain unavailable rather than presenting an invented daily observation.

Production smoke also exercises POST /api/apod with public archive fixtures (image, direct video, embedded video, first date, missing date and invalid dates). Do not log real visitor date input. Actual desktop/mobile, keyboard and OS reduced-motion review remains pending until a browser is connected.

## Earth / solar-scene checks

The full suite now has 62 tests. The shared-engine suite includes solar geometry/material and renderer reuse, animation time stopping on pause/hidden tabs, reduced-motion static rendering, failed planet textures, and restoring the home orientation after EONET. Actual GLSL/GPU presentation still requires a connected browser.
