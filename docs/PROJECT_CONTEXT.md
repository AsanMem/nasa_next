# NASA Next continuity

## Development-server recovery - 13 October 2026, 22:20 Dubai

The user reported the Space Weather error boundary at localhost:3001. Inspection found the production preview left by the previous pass (PID 20776, port 3000) alongside a dev server (PIDs 14488/22696, port 3001), sharing .next. The production log reproduced MODULE_NOT_FOUND for vendor-chunks/next.js and pages/_error.js. Both servers were stopped. The generated cache was preserved at C:/Users/ameme/AppData/Local/Temp/orbital-next-recovery-20261013-221857, and exactly one dev server was started with npm run dev -- --port 3001. Do not leave a production preview running while starting development in this checkout.

During the first fresh compilation, while the existing browser was still making requests, one webpack module-function error appeared. Subsequent repeated /space-weather requests returned the complete timeline with no error digest; /day, /library and /epic also returned 200, and all their referenced script chunks returned 200. A hard browser refresh is needed to discard the old loaded chunks. Browser automation inventory is still empty, so the user's visible recovery is not yet certified. No application code, dependencies or infrastructure changed in this recovery. The Browserslist notice is still present. Chrome's /.well-known/appspecific/com.chrome.devtools.json 404 is optional workspace discovery (https://developer.chrome.com/docs/devtools/automatic-workspaces), not a missing application route.

## Current repair pass - 13 October 2026

This handoff supersedes the APOD fallback and ten-frame EPIC statements in the earlier entry. Work continued on the existing uncommitted checkout; no staging package, reset, commit, push or deployment was used. The visual concept and main homepage composition remain; two clear observation entrances were added below the six destinations.

### Confirmed causes and repairs

- APOD was not an authentication or quota failure: the configured-key request returned HTTP 500 with 9,968 requests remaining. A historical request returned HTTP 200 with the NASA site logo and generic landing-page text. The old apod.nasa.gov HTML redirects to NASA Science. NASA Science's own APOD landing page identifies category 22766 and its article resource at https://science.nasa.gov/wp-json/wp/v2/image-article. The adapter now reads that official public JSON directly, validates the APOD slug/date and exhibit, extracts plain-text explanation and supplied credit, and rejects logos/unrelated posts. No new illustrative fallback was added. This is a confirmed source-endpoint repair, not a hosting change. NASA_API_KEY remains server-only for other services; no key was printed or sent to NASA Science. Cache intervals remain 3600 for Day/date lookup and 43200 for Journal.
- Real restored records: 2026-10-13 Desert Stairway to Heaven (Julien Looten); 1995-06-16 Neutron Star Earth; 2024-01-01 NGC 1232; 2026-09-13 direct NASA MP4; 2026-07-29 YouTube embed. The adapter validates article date independently of query results. It preserves source publication links and credit; absent credit is explicitly unknown. The journal helper's separate broken local path is fixed to /media/main/1.optimized.webp.
- /birthday is available in the shared expedition navigation. A native date field permits the actual APOD archive range, from 1995-06-16 through UTC today; server validation also rejects impossible/future dates. Requests use POST /api/apod, keeping selected dates out of browser/request URLs. Date input stays in component memory, is not written to profile/localStorage, and is omitted from application diagnostics. Public publication data uses existing NASA fetch caching, with no user association. The route response is no-store. Abort/stale-request handling, empty publication and API errors are separate. The real missing publication on 1995-06-17 returned empty. Third-party embeds remain opt-in; direct NASA video has controls and preload=none.
- EONET cluster clicks now set a globe target and increment a monotonic movement revision even for repeated targets; individual selection restores its coordinates. Selection pauses rotation. Existing interruptible 700 ms shortest quaternion motion and reduced-motion immediate targeting are preserved. Cluster controls expose expanded state and return keyboard focus to their trigger on closing/selection. List pagination is eight records, while the map uses every filtered event with coordinates. Marker selection reveals the correct list page; changing filter/sort resets pagination. Selected observation changes invalidate the cluster focus.
- EPIC now shows the complete available sequence (13 frames in the verified 2026-10-11 dataset), ordered by actual observation time, on a fully black chapter background; the source JPEG itself was visually inspected. No masking/cropping or synthetic images were introduced. Existing opt-in playback/pause, decode-before-commit, next-frame preload and stale-load cancellation remain. The journal now computes the latest EPIC time independently of array order.
- Home prominently links Earth from deep space / EPIC and Observation journal. Journal summaries, chronological sections and source links remain.
- Space Weather has plain-language context, a responsive illustrative Sun-Earth diagram and category filters around a source-dated bulletin timeline. The seven-day source window and 43200 cache stay unchanged; the page now retains all 21 returned reports (bounded at 100). No intensity, live measurement or predicted trajectory is invented. Missing text was checked against the official DONKI OpenAPI document at https://ccmc.gsfc.nasa.gov/DONKI-API/v3/api-docs: notifications has only startDate/endDate/type, no text/detail flag. Both all and ALL return messageBody "## ". Source bulletin links and the DONKI web application returned HTTP 503; old webtools links redirect to the migration notice. Full bulletin text remains an upstream blocker, not a claim that NASA never authored it. UI retains real metadata/source links and describes the empty API field accurately.
- Privacy is now a short noindex preview draft. Operator is Asan Memetov, with no claim about nationality/origin. Public email stays "to be added" as explicitly requested; target markets and hosting retention remain unconfirmed. Footer link is small. The full factual audit remains in docs/PRIVACY_AUDIT.md.

### Verification and limits

- 59 regression tests passed, including actual EONET component interaction tests with controlled hooks and the existing actual renderer/EPIC lifecycle tests. New cases cover cluster repetition, paused rotation, reduced-motion controls, pagination and marker-driven page selection; APOD image/video parsing, real-date bounds, midnight queries, missing publications, source migration, unchanged cache and diagnostics without dates/secrets.
- TypeScript passed. Focused next/core-web-vitals lint: 38 changed/new TS/TSX files, zero errors/warnings. Existing repository-wide ESLint configuration remains invalid and was not changed.
- Production build passed with 19 generated pages/handlers; no NASA failures during that build. Ten production HTTP routes returned 200 with expected content: home, Day, Journal, EONET, EPIC, Space Weather, Privacy, Birthday, Gallery and Videos. No Set-Cookie headers. POST tests verified image, direct video, embed, first archive date, actual empty publication and invalid dates. This is HTTP/data verification, not browser interaction certification.
- Real browser desktop/mobile, keyboard and OS reduced-motion review is blocked: cua.listBrowsers returned [], and creating the in-app browser returned "Browser is not available: iab". Simulated tests and inspected source imagery do not replace that review.
- Multiple externally started dev processes appeared during the session. Exact checkout servers were stopped before builds; production preview was started only afterward at http://localhost:3000. Keep one server and stop it before another build.

### Next queue

Lesson builder: a teacher chooses a topic and receives a curated collection of relevant articles, photographs and videos, with source links and credits. Planning only in this pass. No payments, accounts or paid AI integration. Remaining launch tasks: working privacy email when the operator supplies it, target markets/hosting practices, real-browser visual/accessibility review and upstream DONKI text availability.

## Data recovery and final polish — 2026-10-13

This is the latest handoff and supersedes the older phase restrictions below. The pasted recovery brief was implemented against the current checkout, which was clean at the start; no older staging package was copied back. The operator confirmed the privacy name **Asan Memetov** and requested an email placeholder until a later pass. Target markets remain unspecified. See `docs/PRIVACY_AUDIT.md` and the draft `/privacy` route.

Confirmed data findings and repairs:

- Localhost is reachable. The local NASA key is configured and accepted by NeoWs (HTTP 200); no key value was printed. APOD returned HTTP 500 and a later probe timed out. This is not a diagnosis of invalid credentials. APOD keeps an explicitly illustrative local fallback with no invented source date.
- DONKI's legacy api.nasa.gov endpoint returns HTTP 200 HTML after redirecting to CCMC's migration announcement. NASA's [30 September migration announcement](https://ccmc.gsfc.nasa.gov/news/major-updates/) identifies `https://ccmc.gsfc.nasa.gov/DONKI-API/get/...`. The verified notifications endpoint returned 21 records for 6–13 October. Updated only that confirmed endpoint and omitted the unneeded API key; retained 43200-second caching. The upstream bodies were `## `, so records retain their real IDs/dates/source links with an explicit missing-text message instead of fake bulletin content.
- EPIC metadata and the first actual JPEG returned HTTP 200. Metadata contained 13 frames from 11 October; the page's existing ten-frame limit is retained. Observation date is not relabelled as 13 October. A valid empty sequence stays empty, malformed metadata is rejected and local fallback metadata has no fake date.
- The shared JSON fetch has a 15-second timeout, caller cancellation, runtime validators and distinct safe diagnostics for authorization, rate limits, service/network failure, empty responses and invalid data. Logs use allowlisted service labels/statuses and omit URLs, bodies and raw errors. Existing 3600/43200-second cache intervals remain. Raw asteroid retry errors were also removed from logs.
- The journal NeoWs adapter now finds the Earth encounter for the feed date instead of taking array item zero. Real NASA object 2339714 was checked in feed and detail: 2026-10-13, 14.2766885397 km/s, 20,334,583.389771864 km, 52.8761067161 LD. Only the internal index-based event keys differ; physical values and dates agree.

GitHub evidence: latest successful run [38411940778](https://github.com/AsanMem/nasa_next/actions/runs/38411940778) built and deployed successfully on 13 October, but its logs still contain NASA 500s and invalid DONKI HTML. Failed run [37700451091](https://github.com/AsanMem/nasa_next/actions/runs/37700451091) on 7 October exhausted three static-generation attempts for `/day` after 60-second worker timeouts. This supports adding an application request timeout, not altering workflows. Cron `17 6,18 * * *`, Firebase and deployment configuration were preserved.

Interface changes:

- EONET category/count/sort panel, latest/oldest/title ordering with unknown dates last, readable category badges and consistent selected treatment. The existing Earth renderer now performs a shortest quaternion arc over 700 ms; reselecting retargets from the current pose. Pins project each intermediate pose. Selection stops rotation; reduced motion is immediate. Mobile/failed-WebGL flat map, clustering and observation history remain.
- EPIC uses a continuous black area with contained images. Playback stays opt-in at 1500 ms, preloads/decodes frames, rejects obsolete requests and retains the displayed observation on failure. Pause, hidden-tab and unmount cancel playback. EPIC is linked prominently from the journal and expedition navigation.
- Gallery/Videos introductions and search are centered; search has a soft integrated surface, mobile-sized controls and protection against late URL commits replacing newly typed text. URL parameters, debounce, Enter, suggestions and page reset remain. The image is the primary viewer trigger; the repeated View image overlay is removed. The borderless dark viewer gives media the full width, retains close/Escape/native modal focus and video cleanup, and collapses longer text. Source credits are retained where supplied.
- The homepage composition is retained. Its small expedition diagram reuses the existing Earth texture without another renderer. Asteroid generator v3 adds asymmetric relief, clipping and lobes using versioned ID seeds; scale normalization and artistic labels remain.
- Optional APOD video embeds require an explicit provider-labelled load action. The active header, manifest and favicon use an original Orbital mark instead of NASA's insignia as app identity. Existing source attribution remains; no image-rights clearance is implied.

Verification:

- 53 tests pass, including all prior asteroid checks and the new NASA/EPIC/rotation tests; commands are in `tests/README.md`. The actual EPIC component is also exercised against controlled React effects, decoding and timers for opt-in playback, 1500 ms cadence, hidden-tab suspension, stale loads and unmount cleanup.
- `npx tsc --noEmit --incremental false` passed. Focused next/core-web-vitals lint passed for 30 changed/new TS/TSX files with zero errors/warnings. Repository-wide lint remains the pre-existing unsupported config; it was not represented as passing.
- Production builds generated all 17 pages, including `/privacy`, with APOD failures handled. No claim is made that a successful build restores APOD. The final production preview and verification are recorded below.
- Local HTTP checks returned 200 for EONET, EPIC, Space Weather, Day, Gallery, Videos and Privacy, with no Set-Cookie headers. The Earth texture was visually inspected. Browser inventory was empty and both Chrome/in-app browser entry points reported unavailable. Real desktop/mobile layout, keyboard/focus behavior, provider cookies and GPU presentation remain **unverified in this session**; simulated tests are not visual acceptance.

Build coordination: initial dev PIDs 3916/10024 were stopped. A new external `npm run dev` process appeared at 21:29 Dubai time during the later build, occupying port 3000. Its exact checkout processes were stopped; a fresh build completed successfully and sequentially launched `next start`. Final process inspection found only the production preview (PID 22808) for this checkout at `http://localhost:3000`. Do not run dev while this preview/build uses `.next`.

Final production HTTP smoke: home, EONET, EPIC, Space Weather, Day, Gallery (Moon search), Videos (Earth search), Privacy and asteroid 2339714 with `?date=2026-10-13` all returned 200 with their expected rendered server content, no visible Internal Server Error and no Set-Cookie headers. This is nine route checks, not a browser interaction test. Final `git diff --check` passed.

No dependency, Firebase or workflow changes; no commit, push or deployment. The legal result is the factual audit and pending launch requirements, not commercial readiness. Email, target markets, production logging/retention, browser storage and per-asset rights remain follow-up work.

## Complete interface pass — 2026-09-22 (in progress)

The user now authorizes one complete visual/interaction pass through the remaining application, followed by review of the finished result. This supersedes the earlier chapter-by-chapter restriction. Preserve the accepted homepage and asteroid journey. NASA fetching/cache policy, Firebase, scheduled workflows and dependencies remain unchanged; no commit, push or deployment is requested.

Direction: use the Orbital space/raised/foreground/secondary/warm tokens (#030609, #0b1118, #f1f4f6, #a8b3bf, #edc18c) and existing Space Grotesk. Let actual NASA imagery define the media chapters; use a contact sheet and a dark, keyboard-accessible image/video viewer. Earth events use a geographic overview tied to event selection; solar reports use a chronological reading layout. The archive and technology chapters use readable source-led indexes. Quiet shared navigation, honest source dates/fallbacks, visible content, native scrolling, purposeful controls, and responsive layouts are the shared rules. No ornamental telemetry or autoplay gallery animations.

Layout plan: media chapter = wide image above a two-column caption/story; search chapters = large heading, search, contact sheet with a quieter reading sidebar; Earth chapter = map/selected observation followed by category-filtered reports; solar chapter = compact context column alongside expandable bulletins. This uses the subject of each page instead of repeating one card template.

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
