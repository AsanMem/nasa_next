# Production recovery checks — 19 October 2026

The current complete suite has **141 tests**. Keep the asteroid view-model compilation below and ORBITAL_TEST_MODEL, set ORBITAL_DEV_TREE_TEST=1 for the real Windows tree cleanup check, and run all tests/*.test.cjs (including the new firebase-runtime-env and deployment-smoke suites). No new dependencies are needed.

The new checks cover resolved unavailable/error scene cleanup, imports completing after failure, genuinely slow loading, Back/reset, private Firebase dotenv creation/cleanup, PR preview isolation and content-aware deployment checks that reject HTTP200 failure pages. After a release use `node scripts/smoke-deployment.mjs https://nasa-odisey.web.app`. The script uses public pages, no visitor input or secrets.

Real production Chromium and the unresolved public redeployment are documented separately in docs/PRODUCTION_REPAIR_2026-10-19.md. Local typecheck/lint/build passed; physical Safari and deployed Cloud environment were not inspected.

---

# Current verification — uninterrupted flight, 18 October 2026

The complete suite now contains **125 tests**. Append `tests/dev-isolation.test.cjs` to the latest full command (including `tests/site-presentation.test.cjs` and `tests/birth-sky.test.cjs`). For the real Windows child-tree cleanup test set `$env:ORBITAL_DEV_TREE_TEST='1'` and run with normal process permissions; restricted sandboxes may block taskkill. Without that opt-in, 124 pass and the platform integration is skipped. The temporary fixture cleanup only targets processes created by that test.

Start the application with `npm run dev` at **http://127.0.0.1:3100**; the script guards one dev process per checkout and isolates `.next-dev` from production `.next`. Stop the preview before production acceptance. Do not start another direct `next dev` process. Unexpected cross-origin API preflights are logged only in development with sanitized origins; a404 is not evidence of a server crash. Child exit details are saved under ignored `.orbital-dev/last-exit.json`.

Journey timing now has zero encounter hold. Tests execute real Three geometry with controlled renderer boundaries for continuous position/nonzero tangent, trail seams, static-to-Play anchors, visible planet/asteroid gaps, cold-route canvas retention and direct source-to-profile interpolation. Measurements commit only at real event arrivals. Real desktop/mobile/browser observations and the limits of FPS/touch/GPU evidence are recorded separately in `docs/PROJECT_CONTEXT.md`.

---

# Recording follow-up — 18 October 2026

Current complete suite: **100 tests**. Compile the view-model as described below, then use the full command from the encounter section with **tests/site-presentation.test.cjs** appended. The newest checks supersede the earlier opt-in/non-looping playback expectations: visible autoplay, active-filter looping, persistent user Pause, visibility suspension/resume, short hold/long transfer and no React timeline renders for intermediate years. Renderer checks include every supported/unknown body, scroll gesture ownership and coalesced RAFs. Poster/metadata checks preserve real observation years/credits, private birth year, print cleanup and canonical/sitemap origin behavior.

Real mobile/desktop review and the native-print-preview limitation are recorded in docs/PROJECT_CONTEXT.md. Controlled WebGL/reduced-motion/print tests are not a claim of real GPU, physical touch or printed pagination approval.

---

# Encounter journey — 18 October 2026

Current complete suite: **95 tests**. Compile the view-model as described below, then run:

```powershell
node --test tests/asteroids-view-model.test.cjs tests/asteroid-visual.test.cjs tests/asteroid-scene-lifecycle.test.cjs tests/observations.test.cjs tests/presentation.test.cjs tests/nasa-recovery.test.cjs tests/epic-playback.test.cjs tests/eonet-interactions.test.cjs tests/compact-interface.test.cjs tests/external-video.test.cjs tests/encounter-journey.test.cjs
```

The added journey tests execute the real UTC model, component and scene hook with controlled hooks/RAF/observers; renderer tests execute the scene engine with WebGL boundaries doubled. Coverage includes all-range spacing/clusters, same-date bodies, missing measurements, Sun/unknown names, playback timing/rates/arrival, manual/filter/keyboard selection, hidden/offscreen/reduced-motion/failure/empty states, URL-related cancellation, explicit host ownership and disposal. Preview scale is bounded by diameter; the physical rock/person ratio stays exact. Actual Chromium mobile/desktop, single-canvas transfer and repaired Back/Forward checks are recorded separately in docs/PROJECT_CONTEXT.md. These tests do not certify physical touch or OS/GPU failures.

---
# Mobile asteroid catalog correction — 18 October 2026

The complete command below now runs **83 tests**. Added presentation coverage for the immediately rendered catalog model, ID-consistent static thumbnails, native links to the dated profile, unknown measurements, non-Earth body labels and descending Largest/Fastest ordering with unknowns last. The model is no longer hidden behind a mobile reveal control. Browser observations and capability doubles are distinguished in docs/PROJECT_CONTEXT.md.
# Usability follow-up — 18 October 2026

Current complete suite: **83 tests**. Use the compilation and full command below. New checks cover automatic decoded EPIC playback, explicit pause/manual frames, offscreen suspension and reduced motion; a mobile EONET globe with explicit flat/failure fallback; plain birthday labels and visible Day/Month/Year; restored Wikipedia thumbnails/text fallback; every curated lesson resource attached to a stage; owned YouTube modal, client identity, errors, cleanup and detached-dialog unmount.

Real browser review and simulated capabilities are distinguished in `docs/USABILITY_REVIEW_2026-10-18.md`. EPIC's older opt-in expectation is superseded by automatic playback with user pause and reduced-motion protection. YouTube's enlarged view is a page modal, not native browser fullscreen.

---
# Compact mobile and new collections — 18 October 2026

Initial compact implementation: **74 tests**, using the model compilation below, then:

```powershell
node --test tests/asteroids-view-model.test.cjs tests/asteroid-visual.test.cjs tests/asteroid-scene-lifecycle.test.cjs tests/observations.test.cjs tests/presentation.test.cjs tests/nasa-recovery.test.cjs tests/epic-playback.test.cjs tests/eonet-interactions.test.cjs tests/compact-interface.test.cjs tests/external-video.test.cjs
```

New coverage: actual observation Year versus CSV grouping Date, blank date continuation, quoted multiline fields, February 29, invalid/unsafe/missing records, five-record cap, 12-hour shared fetch, selection POST/no-store and source errors; five complete curated lesson contracts; video URL normalization, no embed before consent, client identity, onError and cancellation/disposal; nested modal lock restoration; v4 weighted population, six textures and repeatable identity/projection.

Real in-app Chromium review: mobile 360×800 and 390×844, desktop, compact gallery/video search shell and loading, Enter/clear and Back/Forward, first gallery result at ~275 px, native wheel gesture over header, modal reopen/Escape/focus/scroll restoration, content-sized direct-video viewer, today's YouTube consent/player without error 153, Hubble leap-day results, teacher page, home action in first viewport, mobile catalog search/sort/preview and profile date consistency (2014 TG17, 2026-10-18, 21,778,489 km, 10.62 km/s). Twenty-four actual Three.js models were inspected in multiple rotations on a temporary local harness. Existing unit tests cover the exact rock/person scale.

Simulated boundaries: unavailable WebGL, texture errors, reduced motion, offscreen/pause, rapid scene navigation/resource cleanup, late requests, API failures and YouTube onError. Real provider availability is separate from the doubles. Native print-preview pagination, physical touch hardware and OS accessibility settings are not certified by this run; print content/layout rules were inspected. All 40 lesson source/preview URLs passed an HTTP availability check; availability alone is not a substitute for the manual metadata/source review.

TypeScript and focused Next/core-web-vitals ESLint run against the actual checkout, using the previously established external review configuration because the repository-wide ESLint config is pre-existing invalid. Production build must run only after the dev server has stopped. No dependencies were added.

---

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


## Birth-sky regression suite — 18 October 2026

The complete suite is now **108 tests**. Append `tests/birth-sky.test.cjs` to the existing full command. Keep ORBITAL_TEST_MODEL set to the compiled asteroid view model as described above. New coverage includes historical IANA time conversion, two-offset DST folds, skipped times (including Samoa), half-hour changes, leap dates, observer/projection orientation, independent NASA JPL airless topocentric fixture directions, safe SVG output, PNG source/density metadata, geocoder no-store/privacy/failure behavior, one-renderer reuse and the new poster’s print-state cleanup.

The real downloaded PNG was inspected as 3508x4961 at 300 dpi. Browser scene/form/download observations are recorded separately in PROJECT_CONTEXT.md. Native print-dialog pagination and physical-device/OS/GPU behavior are not certified by these simulations. The older birthday-poster.tsx presentation fixture remains as legacy regression code; it is no longer reachable from the active Hubble tab.


## Direct PDF poster suite — 18 October 2026

The same complete command now passes **113 tests**. `tests/birth-sky.test.cjs` additionally checks PDF structure/xref, exact A3 Media/Crop/Trim/Bleed boxes, lossless RGB stream contents, metadata, no external font/URL resources, uncompressed fallback, private bundled-asset embedding/failure, plain printed HH:MM, optional photographs and safe edge labels. Actual downloaded PDF validation with pypdf and rendered Poppler review is separate from those pure tests; see PROJECT_CONTEXT.md. Physical printing remains unverified.
