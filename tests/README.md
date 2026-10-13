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
