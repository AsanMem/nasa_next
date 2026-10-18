# Orbital usability follow-up — 18 October 2026

This review follows the approved compact-mobile, asteroid v4, birthday and teacher-pack implementation. The user's latest screenshots supersede earlier decisions to use a flat EONET map on mobile, opt-in EPIC playback, Hubble as the default birthday view, square buttons and strong orange focus outlines.

## Delivered

- Search uses one rounded surface. Keyboard focus is a thin gray outline; pointer focus adds a single muted warm border without an inner orange rectangle. Shared actions have softer corners and a 44 px minimum target.
- Gallery and Videos reveal their existing search form on upward document scrolling and hide it while scrolling down. Focus keeps it visible. Explicit submission from the floating form returns to the first results; debounce, Enter, clear, URL and stale-result protection remain.
- EONET starts with the shared textured globe on both narrow and wide viewports. Mobile uses larger marker groups and a camera that fits the sphere. Flat map remains an explicit alternative and a WebGL fallback. Markers wait for the actual globe projection.
- EPIC plays decoded NASA frames automatically, crossfading two images at most. Pause and manual controls retain user intent. Offscreen/reduced-motion/hidden-tab behavior stops automatic playback; a hidden tab requires an explicit restart. Auto playback does not repeatedly announce timestamps to screen readers.
- Birthday defaults to a complete Day / Month / Year form, with ordinary-language labels: “Your birth date” and “Same day, other years”. NASA's daily publication archive starts on 1995-06-16; earlier dates get a clear route to Hubble's day/month collection. The year shown on Hubble results remains the actual observation year. Dates remain transient POST input, outside URLs and persistent storage.
- Lesson resources now appear inside the relevant 5/10/15/10-minute activities. First-step photos are visible; video and reading links appear alongside the task that uses them. Short labels improve scanning while original titles, sources, credits and print URLs remain. Videos open the original NASA record. The home teacher entry has an original workbook/orbit illustration instead of an asteroid thumbnail.
- Route loading uses a small orbit status instead of an oversized chapter slogan. Media viewers have an explicit “Back to page” action and identify original files as opening in a new tab.
- YouTube enlargement uses an in-page modal around the same connected iframe, with visible return, source link and player-error text. Escape, scroll locking and focus restoration work without reloading the player. The documented `fs=0` parameter hides the vendor's native fullscreen button, which produced incorrect scaling in the tested emulated viewport. Consent, strict-origin-when-cross-origin, official IFrame API errors and the original watch link remain.
- Wikipedia thumbnails are rendered again when supplied, with text-only fallback. Existing Wikipedia search and NASA fetching/cache policy are unchanged.

## Validation

Automated: 80 tests passed; TypeScript and focused Next/core-web-vitals ESLint passed. The repository-wide ESLint configuration still contains pre-existing unsupported keys; this is not a claim that global lint passed. The final production build passed with 21/21 generated pages, with the dev server stopped. The pre-existing Browserslist database warning remains.

Real in-app Chromium review:

- 360×800: search focus, a first result above 400 px, upward-scroll search recovery in Gallery and Videos, complete birthday fields, real APOD result for 2026-10-13, real Wikipedia image loading, enlarged-image close/focus/scroll restoration, teacher home thumbnail, EONET globe and flat/globe switching.
- 390×844: inline Moon lesson photos, concise labels, activity/source placement and no horizontal overflow.
- 1440×900: EONET globe, projected event markers, one canvas and no horizontal overflow.
- EPIC advanced from frame 1 to later frames automatically; Pause retained the selected frame and Next selected the next observation.
- YouTube loaded after consent. Expand, Escape, reopen and Back restored the page and focus; the iframe identity remained unchanged. The final source/error footer was checked again against the production build, including repeat open/close and Escape.
- Navigation through the expedition map remained functional.

Browser/GPU/network doubles, separately from real presentation: reduced motion, unavailable WebGL, texture failure, offscreen suspension, late requests, YouTube error callbacks, expanded-player route unmount, resource cleanup and repeated transitions. No physical touch device or OS reduced-motion setting was certified. Native print pagination remains unverified; print content and CSS were reviewed. Ad scripts were not installed or tested.

Screenshots and command logs are in the task workspace's `usability-review` directory and `usability-*.log` files. Staging/backups use `usability-staging` / `usability-backups`; apply through Sync-Usability.ps1, which rejects concurrent source changes. No dependencies, Firebase/workflow changes, commit, push or deployment.

## Advertising proposal — researched, not enabled

Start with one manually placed responsive advertisement after approximately six gallery/video results, clearly separated from Search, Play, originals and NASA source links. Keep media viewers, birthday forms, lessons and navigation free of ads initially. Avoid interstitials, floating overlays and automatic full-screen ads. Reserve space to prevent layout shifts.

AdSense requires a suitable public site, account eligibility and site review; a NASA feed alone does not guarantee approval. Evaluate the publisher's actual country/account eligibility and visitor consent requirements before connecting it. Do not transmit birthday input for advertising. Keep Orbital's own identity and never imply NASA endorses an advertisement.

Revenue cannot be forecast from the current information. Page RPM is revenue per thousand page views: for illustration only, 100,000 views at an assumed $2 page RPM would produce $200. This is an arithmetic example, not an expected rate or guarantee. Measure actual traffic, viewability, geography and revenue before adding more slots.

Official references checked for this pass:

- [AdSense placement policies](https://support.google.com/adsense/answer/1346295?hl=en): distinguish ads from controls and content; use appropriate labels and avoid accidental clicks.
- [Site connection and approval](https://support.google.com/adsense/answer/7584263?hl=en), [eligibility](https://support.google.com/adsense/answer/9724/eligibility-requirements-for-adsense?hl=en-uk), [original content](https://support.google.com/adsense/answer/7299563?hl=en).
- [Page RPM](https://support.google.com/adsense/answer/112030?hl=en-GB).
- [NASA advertising guidelines](https://www.nasa.gov/nasa-brand-center/advertising-guidelines/).
- [YouTube player parameters](https://developers.google.com/youtube/player_parameters#fs).

Potential later features that add visitor value before advertising: a shareable birthday card that preserves the real observation/publication year and credits, and a short “one-minute discovery” from verified existing records. Neither is silently included in this implementation.
