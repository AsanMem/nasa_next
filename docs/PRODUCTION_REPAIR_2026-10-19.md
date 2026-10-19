# Production asteroid recovery — 19 October 2026

## Evidence

The public site reproduced the reported failure: the current catalog displayed the 19 October feed, but its real `3781897/view?date=2026-10-19` link rendered “NASA object data is unavailable”. Read-only requests also found the same unavailable content on profiles 2509505, 3761354 and 3893275 despite HTTP 200. HTTP status alone did not establish success.

The official NASA lookup for 2509505 returned its actual object and 88 encounters with the public demo credential; without a credential NASA returned 403 / API_KEY_MISSING. Production deliberately has no DEMO_KEY fallback. The CI jobs supplied NASA_API_KEY to build/deploy processes but did not materialize it in the generated Firebase SSR backend. Firebase's framework adapter copies root dotenv files into the backend; its Functions environment loader accepts `.env.<projectId>`. Arbitrary CI process variables are not automatically a deployed Functions configuration. See the [Firebase framework source](https://github.com/firebase/firebase-tools/blob/master/src/frameworks/index.ts) and [Functions environment documentation](https://firebase.google.com/docs/functions/config-env).

This is a concrete deployment configuration gap and matches the observed failure. Direct inspection of the deployed function environment/logs was unavailable: this computer has no authenticated Firebase CLI session or ADC/token. No login was started. The deployed runtime value was not read, and an actual successful redeployment remains required to confirm recovery on the public site.

## Changes

- Both workflows create `.env.nasa-odisey` from the existing GitHub NASA_API_KEY secret before build/deploy. Only that server key is written, mode 0600. Empty/demo/control-bearing values fail before deployment. Existing local files are not overwritten. Always-run cleanup removes only the helper's own generated file. The file is ignored by Git; no Next public env variable or client key was introduced.
- The PR workflow previously specified `channelId: live`. It now uses the action's separate preview channel and its documented deployment URL. Master and scheduled live publication retain their original schedule.
- `scripts/smoke-deployment.mjs` verifies rendered profile content as well as Privacy contact and the birthday route after publication. An HTTP 200 unavailable page is a failed smoke check. The stable profile fixture remains checked even when the current catalog is empty or its links are client-rendered.
- A resolved unavailable asteroid route explicitly cancels flight, invalidates pending imports and disposes the renderer. An asteroid route error boundary performs the same cleanup and offers Retry/catalog actions. Real pending loading retains its source rather than being confused with a resolved error. Back and subsequent scene registration remain supported.
- Privacy was already a factual published notice, not a draft. It is shortened and now separates local birth-sky calculations/exports, city-only geocoding and server-side NASA archive searches. No custom domain is required. The confirmed author/contact, 14 px body, 12 px footer link, noindex and credits remain. No new retention or universal legal-compliance promise is made.
- Navigation/catalog arrows request Unicode text presentation, avoiding an unintended emoji style on platforms that support that selector. Physical Safari rendering remains unverified.

## Git and temporary capture cleanup

At task start the only three working-tree changes were deletion of `src/app/api/portfolio-capture/route.ts`, deletion of `src/app/ui/portfolio-capture-temp.tsx`, and removal of their import/mount from `src/app/layout.tsx`. Commit 6884358 had included those temporary portfolio-recording files while recording was in progress; recording cleanup happened afterward. These changes are intentional and must be included in the next release. They are separate from the NASA runtime credential issue. A stale generated `.next-dev/types/app/api/portfolio-capture/route.ts` was removed after it caused a standalone typecheck to reference the already deleted route.

## Verification

- **141/141 regression tests passed**, including the opt-in Windows child-tree check; no skipped tests. Added lifecycle and deployment regressions cover resolved errors, late imports, slow route loading, Back, retry and safe credential handling.
- TypeScript 5.9.3 `--noEmit --incremental false` passed after the stale generated type was removed.
- Targeted ESLint passed with the existing external Next/core-web-vitals review configuration and `--no-eslintrc`. The repository's pre-existing global ESLint configuration is still invalid and was not changed.
- Production build passed with dev stopped: 24/24 generated pages, dynamic asteroid route preserved. The existing Browserslist age notice was non-blocking. No dependency, NASA endpoint or cache interval changed.
- The exact production build was exercised at 127.0.0.1:3101. With NASA_API_KEY intentionally blank, a real mobile catalog-to-profile navigation rendered the unavailable state with **zero canvases and hidden flight layer**. With the ordinary local server configuration restored, the dated current profile 3781897 and the user's 2509505 / 18 October link opened successfully. The latter showed 19,404,413 km, 9.78 km/s and 88 encounter records. Back/Forward retained one renderer and a hidden flight layer.
- The same postdeploy smoke script passed against local production (four pages; current catalog links were client-rendered in this response). Real in-app Chromium was reviewed at 390×844, 360×800 and desktop 1440×1000. Privacy had no horizontal overflow, 14 px body and no residual canvas. Physical iOS Safari is not certified by these observations.
- Review screenshots are in the task workspace `production-repair-review`. Guarded sync and previous source versions are preserved in `production-repair-staging` / `production-repair-backups`. Temporary production stopped; a single guarded hidden dev preview was restored on 127.0.0.1:3100.

No commit, push, new login or deployment was performed. The public site still needs the prepared release and its postdeploy check. Do not describe local browser success as a repaired public deployment.
