# Orbital privacy and launch audit

Reviewed 13 October 2026. Operator: Asan Memetov. No statement about nationality or country of origin is made. The public privacy email is deliberately pending, as requested by the operator. Target markets have not been specified. This is an implementation audit and launch requirements list, not a worldwide compliance opinion. The draft visitor notice is implemented at `/privacy` and is marked noindex.

## Actual implementation

| Surface | Finding | Remaining verification |
| --- | --- | --- |
| Application cookies | No application cookie setters, analytics tags or authentication code are used by the current routes. Seven local HTTP route checks returned no Set-Cookie header. | Inspect a clean production browser session, including response headers and third-party storage. HTTP checks do not reveal browser or provider storage. |
| Browser storage | `useRouteIntro.ts` contains `nasa-welcome-intro`, but its only consumer is the unused `welcome.tsx`; the active homepage renders `HomeConsole`. No active localStorage/sessionStorage writes were found. | Recheck if the old welcome component is restored. Normal cache/history is still browser storage. |
| Search | Query and page are URL parameters. Server helpers send searches to NASA Images and Wikipedia; browser history and host request logs can contain the terms. No saved user search profile exists. | Discourage personal details in searches; confirm log retention and query handling in hosting. |
| Firebase | Hosting and a europe-west1 framework backend are configured. `firebaseConfig.ts` initializes Storage but has no active importer; no active Auth, Firestore, Analytics or Storage operations were found in current routes. | Inspect the deployed Firebase/Google Cloud settings, access logs, enabled services, processors and retention. Installing the SDK does not establish collection. No Firebase configuration was changed. |
| Server diagnostics | Common NASA fetch logs now include only an allowlisted service name, outcome and numeric status. Full URLs, response bodies and raw errors are excluded. Asteroid retry logs no longer print raw errors. | Google infrastructure logs and existing non-NASA helpers have separate behavior; do not claim all server logs have been audited in production. |
| Media | MediaImage loads NASA/upstream images directly; external hosts receive IP and normal HTTP headers. NASA video files are mounted after the viewer is opened. | Inventory actual hosts for current content and provider terms; hosts vary with source metadata. |
| Optional embeds | APOD YouTube/Vimeo iframes are absent until a named-provider load button is pressed. YouTube short/watch links use the nocookie host. No consent choice is persisted. Navigation unmounts the player. | A click gate and a nocookie domain do not certify lawful consent or absence of tracking. Assess each provider’s storage/access purpose and actual behavior. Closing a player does not erase provider storage. |
| Fonts and illustration | Next font assets and Earth/Moon textures are served locally. No runtime Google Fonts browser embed was added. | Local texture provenance and licences must remain documented. |

Browser automation in this session reported no available browsers; Chrome and the in-app browser could not be opened. This limits both storage verification and desktop/mobile visual acceptance. No production account settings were inferred from the source tree.

## Applicable rules to assess before launch

The UAE’s official portal identifies Federal Decree-Law No. 45 of 2021 and describes its application to electronic personal-data processing inside and outside the country. Given the operator’s UAE location, confirm the precise establishment, activities, scope/exclusions, lawful processing basis and international transfer requirements. The primary legislation download could not be retrieved in this session; a legal scope determination remains pending. Do not copy a GDPR lawful basis into the UAE notice without review. [UAE official guidance](https://u.ae/en/about-the-uae/digital-uae/data/data-protection-laws.)

An operator outside the EU can fall under GDPR when offering goods or services to people in the EU or monitoring their behavior there. International availability alone does not settle targeting. Determine the launch markets, processing purposes, applicable rights, processor agreements and any transfer/representative requirements before finalizing the notice. [European Commission applicability guidance](https://commission.europa.eu/law/law-topic/data-protection/information-business-and-organisations/application-gdpr_en?prefLang=nl)

For UK audiences, storage/access rules extend beyond cookies to web storage, pixels and other device access. Assess purpose, applicable exceptions and consent before optional technology loads. The current per-page video action is an implementation control, not a conclusion that every provider meets consent requirements. [ICO storage and access guidance](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/what-are-storage-and-access-technologies/)

No child-directed account or lesson product is implemented. A later child-directed US service, or collection with actual knowledge of a child under 13, requires a COPPA assessment that includes third-party collection. An adult-teacher product should avoid student accounts and pupil personal data by design. [FTC COPPA guidance](https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions)

## Attribution and identity

NASA source material may have third-party rights, and NASA attribution is not NASA endorsement. APOD explicitly includes copyrighted contributions whose owners must authorize relevant reuse. The APOD credit is preserved in the exhibit and viewer. Gallery photographer/secondary creator/center fields are shown when supplied, with a source-record link in the viewer. Missing credit metadata must never imply public-domain status. [NASA media guidance](https://www.nasa.gov/nasa-brand-center/images-and-media/), [APOD permissions](https://science.nasa.gov/apod/apod-about/)

The active header, manifest and favicon now use an original simple Orbital orbit mark instead of NASA’s insignia as app identity. Existing NASA logo files were retained; they are not a licence for future branding. Informational NASA attribution remains.

Earth and Moon textures retain the established [Three.js r167 examples provenance](https://github.com/mrdoob/three.js/tree/r167/examples/textures/planets). `stone-2.jpg`, `stone-8.jpg` and the local main/gallery illustration assets do not yet have a complete per-file origin/licence register. Build that register, retain original credit lines, distinguish NASA works from third-party contributions and resolve commercial-use permissions before monetization.

## Required owner follow-up

- Supply a working privacy email and confirm the operator’s establishment details and target markets.
- Verify production logging categories, retention periods, deletion/access process, subprocessors and cross-border arrangements; then replace the corresponding draft wording with facts.
- Verify browser storage and outgoing media requests in a fresh production session, before and after enabling each optional player. Decide consent requirements by purpose, not the presence of a cookie.
- Complete the media rights register and final notice review. The draft does not promise compliance in all countries.
- Review relocation or work from Russia, payment processing, children’s use, accounts and any new analytics separately before enabling them.

The chosen-date APOD feature is now implemented at `/birthday`. The date stays in client component memory, is posted to `/api/apod` rather than added to the browser URL, and is sent server-side to NASA Science to retrieve a public publication. Application diagnostics omit dates, request URLs and bodies. Public NASA responses use the existing cache with no user association; the browser-facing POST response is no-store. No profile or localStorage write was added. Hosting request-body logging still needs deployment-level verification.

The teacher lesson collection remains a future concept: articles, photographs and videos assembled by topic without pupil accounts, payments or paid AI. Product value would be selection, explanation and presentation, with rights reviewed for each included work.
