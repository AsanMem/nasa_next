# Calculated encounter journeys

The October 19 brief supersedes the earlier continuous illustrative flight. A journey consists of a calculated window around a listed encounter, followed by an explicit **Time jump** to the next window. There is no simulated connecting flight through the intervening decades or from the final record back to the first.

## Coordinate contract

The server resolves the NeoWs designation with the official Horizons Lookup. A NeoWs numeric ID is never converted to a JPL SPK ID by arithmetic. The selected asteroid and encounter body use geometric Horizons vectors with the Sun as origin, J2000 ecliptic axes, AU positions and AU/day velocities. The response records source solution, time convention, coverage and interpolation validation. Background planets use the existing Astronomy Engine at the same displayed instant. Three.js receives the handedness-preserving `(x,z,-y)` transformation.

NeoWs encounter measurements describe the listed closest approach. They do not become new measurements at each animation frame. NeoWs and Horizons can use different orbit solutions; the UI retains that distinction rather than bending a trajectory to meet an old distance. Horizons UT output is UTC after 1962 and UT1 before 1962; future leap-second conventions also limit the absolute precision of distant civil times.

The close window's half-duration is twice `distance / speed`, bounded to six hours through thirty days, or seven days if those measurements are missing. The exact encounter instant belongs to the samples. The wider track spans at most one orbital period, capped at ten years. Finite coverage is a **trajectory segment**, never a forcibly closed orbit. Interpolation uses cubic Hermite positions and velocities, with independent interior samples used to validate and refine it. Invalid frame, units, coverage, identity or interpolation accuracy produce an unavailable state.

All planet centers retain computed AU positions. In the system view, visible disks and markers are deliberately enlarged; the close view uses physical radii and a local origin. Screen markers can remain legible when physical surfaces are too small to see. The schematic asteroid belt is an indicated region, not a calculated catalogue of individual objects.

## Server cache and request serialization

`src/app/lib/asteroids/server/trajectory-cache.ts` uses Firestore REST with the Firebase SSR workload's Google OAuth identity. It does not use a browser Firebase credential, an embedded private key, or open client rules. Existing deny-all Firestore client rules remain valid.

- Public payloads are stored in `orbital_ephemerides`, keyed by a SHA-256 digest of the full request identity. They are accepted for 24 hours. This is cache validity; automatic document deletion requires a separately configured Firestore TTL policy.
- `orbital_ephemeris_control/jpl` is a single cross-instance lease. Conditional writes using Firestore `updateTime` or `exists=false` arbitrate cold contention. An expired owner cannot release a replacement lease. Successful calls have a short shared cooldown; upstream backoff is also shared.
- Each JPL HTTP operation has a hard timeout shorter than the lease. Busy instances return pending/retry information. Partial work is saved in the shared cache and completed by subsequent awaited requests. No HTTP response relies on a background task continuing after Firebase freezes its instance.
- Concurrent clients reuse the same completed blocks. Only the next encounter may be prefetched. The renderer performs no upstream network requests.
- Missing identity, database, IAM permission or upstream coverage leaves the rest of the profile available and shows a Retry state. No in-memory production cache or invented orbit bypasses the distributed gate.

Before release, run `node scripts/check-trajectory-store.mjs` **under the intended NASA SSR workload identity**. It verifies a public test document can be created and read. The identity needs Firestore document get/create/update permissions in `nasa-odisey`; the default database must exist. Client security rules must not be opened to make this pass. The script does not create a database or change IAM. A loopback `FIRESTORE_EMULATOR_HOST` is permitted for local integration only and is rejected in deployed Firebase runtimes. Passing a local protocol double is not evidence of cloud availability or permissions.

Cloud inspection on 19 October confirmed the Native `(default)` database in `eur3` and the actual Gen2 SSR function `ssrnasaodisey` in `europe-west1`. Its attached compute service account already has an unconditional project role containing the three required document permissions. A real Firestore adapter probe under the project owner passed create/update/read and CAS acquire/release; anonymous access remained denied. That user probe does not certify server execution. The standalone script obtains identity through Google's metadata server, so ordinary local CLI login alone will not make it run on a desktop. Complete the final server proof through the released trajectory API (or an already-authorized runtime probe); do not add impersonation privileges just to make a local test pass. See the dated verification in `PROJECT_CONTEXT.md`.

## Exact size comparisons and reconstruction identity

`Compare with` defaults to a 1.8 m person below 10 m diameter, a representative 12 m bus at 10–60 m, a 105 × 68 m pitch at 60–300 m, and the 828 m Burj Khalifa from 300 m. The bus and pitch compare **length**; person and tower compare **height**. Both silhouettes share meters per pixel. A tiny person is never enlarged independently. An unknown diameter has no made-up comparison.

Generator v5 intentionally changes v4 appearances once. It uses version + NASA ID for broad shape, independent surface profile and material. Local flat, chipped and rough areas replace universal all-over ripples. Catalog, profile, journey and static projections share it. The bounded display scale used in previews does not enter the exact reference comparison.

## Primary references

- [Horizons API](https://ssd-api.jpl.nasa.gov/doc/horizons.html), [Lookup](https://ssd-api.jpl.nasa.gov/doc/horizons_lookup.html), [manual and time conventions](https://ssd.jpl.nasa.gov/horizons/manual.html), [fair-use policy](https://ssd-api.jpl.nasa.gov/doc/).
- [Astronomy Engine](https://github.com/cosinekitty/astronomy), [JPL planetary physical parameters](https://ssd.jpl.nasa.gov/planets/phys_par.html).
- [Firestore REST authorization](https://firebase.google.com/docs/firestore/use-rest-api), [Google workload identity metadata](https://cloud.google.com/compute/docs/access/authenticate-workloads).
- [FIFA pitch dimensions](https://ipt.fifa.com/innovation/stadium-guidelines/technical-guidelines/stadiums-guidelines/pitch-dimensions-and-surrounding-areas), [Emaar: Burj Khalifa](https://www.emaar.com/en/other-emaar-businesses/burj-khalifa).

Verification results and remaining release checks belong in `docs/PROJECT_CONTEXT.md` and `tests/README.md`; architecture descriptions alone are not evidence of rendered or deployed behavior.
