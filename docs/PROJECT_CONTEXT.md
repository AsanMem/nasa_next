# NASA Next continuity

Recovered on 2026-09-21 from the actual repository and two saved Codex tasks.

## Canonical locations

- Code: `C:/Users/ameme/Desktop/nasa_next`.
- Current discussion was created in `C:/Users/ameme/Documents/ChatGPT/NASA 2`, initially an empty Git repository with no remote. `Documents/ChatGPT/NASA` was also empty.
- Saved local Codex project named NASA points to NASA 2, not to the application code.
- Separate ChatGPT project `NASA - project` exists and was pinned when inspected. It is a conversation container, not the local checkout.

## Prior tasks

- `Stabilize NASA Next refresh`, id `01a015f0-610f-7062-aba0-c8abdc8d0c8e`, cwd nasa_next: NASA freshness/source dates, scheduled Firebase redeploy and resilience. The code's latest commit at recovery was `bc99366` (Stabilize NASA data refresh and source links).
- `Redesign orbital mission homepage`, id `01a0164d-60b7-7fe3-9f51-ead7fbefbf08`, cwd nasa_next: three homepage iterations. The current uncommitted state was a modified src/app/page.tsx and an untracked src/app/ui/mission-console directory.

These are separate work topics in the same codebase. History was read explicitly; this document does not claim all ChatGPT project content has been recovered.

## Current user intent

The homepage direction was accepted. The user explicitly approved implementation of the asteroid chapter: catalog, complete object journey, shared navigation and a six-chapter expedition map. Preserve the homepage composition and carry its visual language through this first complete inner chapter. Other content is redesigned later. The observer is outside in realistic space; do not introduce a cockpit interface. The original global-skills goal remains project-neutral: global skills carry methods, local documents own the visual identity.

## Diagnosis

The body inherits Bungee from globals.css; the old homepage changed some headings but left body and labels in that display font. The Earth was only layered CSS gradients. Inactive mission cards were faded to 48% opacity. UI included decorative fake status strings and font-dependent arrows.

## Current direction

See DESIGN.md. Global skills carry methods; local documents carry NASA appearance and decisions. Main page remains English, matching the existing project; collaboration with the user is in Russian.

## Verification and remaining work

Implemented homepage-only redesign: Space Grotesk is scoped to the homepage, the hero now has deferred Three.js Earth/Moon rendering, local texture maps, an orbital path, a pause control and a static fallback. Six readable destination rows replace faded capsules. Homepage metadata is now Orbital. No dependencies were added to the application.

Installed global skills: frontend-design from anthropics/skills and personal design-quality. Both passed the official skill-creator quick_validate.py. They become discoverable on a subsequent turn; this pass read and applied their instructions directly.

Final verification on 2026-09-21:
- `npx tsc --noEmit --incremental false`: passed.
- `npm run build`: passed, all 16 static pages generated. Home route: 4.97 kB, first load shared+route JS 106 kB; deferred Three.js payload and textures are additional.
- Focused ESLint for page.tsx and all three TSX components: passed with a separate next/core-web-vitals config. Repository-wide lint remains blocked by pre-existing invalid .eslintrc.json keys (ignores and editor.codeActionsOnSave). No global lint config changes were made.
- `git diff --check`: passed.
- Browser inspected at 1440x960 and 390x844, plus the default narrow panel. Confirmed the actual Space Grotesk font, loaded image assets, initialized WebGL scene, pause state, destination anchor navigation, keyboard focus and no horizontal overflow. All six hrefs match the existing destinations.
- Reduced-motion CSS and renderer media-query handling are implemented and reviewed in code; browser media emulation and forced WebGL-loss testing were not available in the chosen UI tool.
- An initial build ran into the existing dev-server .next/trace lock. Exact nasa_next dev processes were stopped, build succeeded, and the dev preview was restarted. Do not run next dev and next build concurrently in this checkout.
- An earlier build reported network resolution failures for NASA APIs and completed using existing fallback behavior. Successful homepage/build checks do not certify external NASA data availability.

Original modified/untracked homepage files were backed up before application under `C:/Users/ameme/Documents/ChatGPT/NASA 2/design-staging/backups/20260921-205012`. No commit, push or production deployment was performed. Existing internal route implementations, NASA helpers, Firebase config, GitHub workflows and package files were not edited.

## Sidebar continuity

The task `Redesign orbital mission homepage` is now pinned. The saved local project NASA still points at NASA 2; available project tools cannot change its path. Select/add the existing folder `C:/Users/ameme/Desktop/nasa_next` as the code project in the app. Do not clone/recreate the application into NASA 2. A local AGENTS.md pointer was added there so this discussion can still locate the actual code and brief.

## Asteroid chapter implementation — 2026-09-21

Implemented the approved Orbital extension:
- Typed unknown-input adapter for diameters, classification, source links and approach events; finite measurements retain precision. Catalog preview/search/three sorts preserve state in URL query parameters. Default preview is the nearest known encounter in the current feed.
- Legacy detail routes remain intact. Catalog date is carried into the profile. Default selection uses the next Earth approach or latest past Earth approach. Timeline selection updates the URL and every displayed event metric together; other-body events are labelled. Invalid/unavailable requested dates get an explicit fallback note.
- Deferred, ID-seeded Three.js rock, drag and keyboard/button rotation, pause/reset, native scroll, scoped GSAP ScrollTrigger cleanup, one sticky desktop scene. The same rock is shown against a 1.8 m human and dimension ruler with an orthographic camera. Mobile/reduced-motion views use sequential static comparisons; unknown diameters do not create a false scale.
- NASA Earth–Moon distance explanation, selectable full history, expandable original orbital fields and JPL link. The old glass panels and delayed hidden-content layout are no longer used by the asteroid routes.
- Shared Orbital palette, controls, type, header and fullscreen six-destination content map. Dialog includes explicit Tab wrap, Escape, scroll lock and focus restoration. Existing chapters get the navigation while retaining their content. The root route template provides a 450 ms entry; Next routing is not delayed. Homepage composition is retained with shared navigation and readable type sizes.

Verification:
- Data regression suite: 11 passing checks. Renderer lifecycle suite: 7 passing checks, including the actual geometric rock/person ratio and an orthographic camera, deferred-unmount race, offscreen/hidden suspension, reduced-motion manual rotation, WebGL failure and context loss. Run with the commands in tests/README.md.
- Actual NASA object 3477703: Sep 21, 2026 stays selected from catalog to profile with 55,299,669 km and 9.17 km/s (catalog rounds speed to 9.2). The first 1913 event no longer replaces it. Selecting Dec 21, 2026 updates all event values to 35,477,010 km, 9.59 km/s and 92.25 LD.
- Browser review at desktop 1440×960 and mobile 390×844: catalog default, empty search/clear, all sorts, row selection, profile controls, pinned desktop chapters, proportional mobile diagram, event selection, expanded orbital details, old/direct links and invalid-date note, unavailable-object view, map keyboard wrapping/Escape/focus restoration, and no horizontal overflow. Back/Forward preserve catalog sorting; returning to the profile has one canvas. Navigating to Gallery removes the canvas and retains the existing search.
- Reduced-motion and WebGL-failure execution paths were exercised with browser/WebGL boundary doubles in tests. Actual OS media emulation and forced GPU failure were not available in the UI automation surface, so those modes were not visually certified on a real GPU.
- TypeScript and focused Next/core-web-vitals ESLint passed. Production builds passed with all 16 static pages, including the final navigation integration. Global ESLint config still has its pre-existing invalid keys; use the focused config rather than claiming repository-wide lint passed. One build received a NASA 429 response and completed with the existing fallback behavior; a successful build does not certify external API availability.

Dev stability: two simultaneous dev servers for the same checkout caused corrupted .next manifests and transient 404s during this work. Both were stopped; the generated cache was moved to C:/Users/ameme/Documents/ChatGPT/NASA 2/asteroid-cache-backup and a clean build succeeded. Keep exactly one server running. Do not build while dev is running.

Original edited files were backed up in C:/Users/ameme/Documents/ChatGPT/NASA 2/asteroid-backups. Implementation staging is in asteroid-staging in that workspace. No dependencies, API/cache-policy changes, Firebase changes, commit, push or deployment were made.

## Living asteroids / continuous flight — 2026-09-21

Implemented the accepted second asteroid pass. The primary files are lib/asteroids/visual.ts, ui/orbital/scene-provider.tsx and scene-engine.ts, and the existing catalog/journey/comparisons components. Root layout now owns the scene provider. The previous per-page renderers were replaced, not layered on top of a third canvas.

- Generator v2 uses four clearly different silhouette families, seeded simplex noise, local depressions, clipped shard faces and independent material seeds. ID determines geometry, named texture, tone and initial pose; date, speed, list order and diameter updates cannot change identity. Twelve independent IDs were visually compared using the actual Three.js generator in a temporary local harness, then the overly wavy first pass was softened. Static diagrams share the generated surface projection. All materials remain explicitly artistic; no composition is inferred from the hash.
- The root scene owner lazily imports Three.js and GSAP, transfers one renderer between home/catalog/profile hosts, and retains at most two rock meshes. Normal link navigation begins immediately. The Earth-to-catalog flight lasts 1.2 s, the closer profile view 0.8 s; mobile uses 0.65 s. Browser history cancels a pending flight. Slow data loads show a readable themed status without extending the animation. Other sections release all renderer resources.
- Catalog double-click selects and scrolls to the preview, with an explicit keyboard/touch button. A single click leaves scroll position alone. Exact encounter speed drives a shared-scale particle effect and the fixed 0–100 km one-second ruler. Spin is independent of speed. Pause/reduced motion stop automatic motion and manual controls remain available.
- The next known Earth encounter after the selected event is visible near the top of the profile. Past/Upcoming/All history filters use UTC today. Earth/Moon diagrams use local image maps and lighting, with the selected object's projected silhouette, explicit non-scale/reference wording and correct other-body labels. Orthographic size comparisons fit the actual rock bounds, including elongated bodies, while preserving the exact 1.8 m person ratio.

Verification of this pass:
- 24 regression checks passed: 13 data cases, three identity/projection cases, and eight shared-engine lifecycle/measurement cases. Boundary doubles execute the actual renderer engine for resource disposal, pause/offscreen/hidden state, reduced motion/manual controls, missing textures, unavailable WebGL/context loss, late loads, rapid navigation, physical size ratio and proportional particle velocity. These are simulated browser/GPU boundaries, not visual certification of OS reduced-motion or a failed real GPU.
- TypeScript and focused Next/core-web-vitals ESLint passed for all changed TS/TSX files. git diff --check passed. The existing invalid repository-wide ESLint configuration was not changed.
- Desktop 1440×960 and mobile 390×844 were reviewed in the browser. Verified different models, double-click and preview focus, search/empty result/clear, speed sorting, selected event updates, next-encounter jump, history filtering, recognizable Earth/Moon, mobile proportional comparison, map Escape/focus return and no horizontal overflow. Home flight was observed while the destination URL was already active; one canvas persisted. Gallery had zero canvas. Back/Forward restored sort=speed and object=3477703 and did not replay the flight.
- Actual object 3477703 retained Sep 21, 2026, 55,299,669 km and 9.17 km/s. Object 3708359 exposed Feb 18, 2030 as the next Earth encounter after Sep 21, 2026; selecting it updated all values to 25,705,208 km and 18.97 km/s.
- Production build passed: all 16 static pages generated. Home first-load JS 107 kB, catalog 113 kB, profile 114 kB; deferred Three.js assets are additional. NASA request timeouts occurred during generation of other pages; existing fallback handling allowed the build to complete. This does not assert external API availability.

Build coordination: a second dev process appeared after the initially inspected server was stopped and held .next/trace. All Next processes for this checkout were stopped; the generated cache was preserved at C:/Users/ameme/Documents/ChatGPT/NASA 2/orbital-flight-build-cache. The subsequent clean build passed. Never run dev and build concurrently in this checkout. Editing the shared engine during dev can trigger a full Fast Refresh reload; after such an edit, wait for hydration before evaluating navigation state.

Staging: C:/Users/ameme/Documents/ChatGPT/NASA 2/orbital-flight-staging. Originals before this pass are in orbital-flight-backups, preserving the user's previously staged implementation. Sync-OrbitalFlight.ps1 copies only an explicit source/test/doc allowlist and skips identical files. No staged files were reset or committed. NASA fetch helpers, revalidation (3600 s), scheduled workflows, package files and Firebase are unchanged. No deployment was made.
