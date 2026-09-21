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

Install reusable design expertise globally without forcing all projects into one visual style. Make NASA's homepage distinctive, readable and polished, inspired by the quality of experimental web design. User rejected the decorative small type, weak hierarchy, capsule list and indistinct planet. Finish the homepage before redesigning internal routes.

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
