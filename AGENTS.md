# NASA Next working context

The application repository is `C:/Users/ameme/Desktop/nasa_next`.

Before visual work, read `DESIGN.md` and `docs/PROJECT_CONTEXT.md`. Apply available frontend-design and design-quality skills as methods; the NASA-local brief owns the appearance. Keep unrelated projects' styles out of this repository.

The user expanded the design pass to the asteroid catalog, asteroid encounter journey, shared Orbital navigation and the expedition map. Preserve the homepage composition. Other chapters receive shared navigation only; their content redesign follows later (Media of the Day, Gallery/Videos, Earth Events, Space Weather). Preserve NASA fetching/cache policy, Firebase and deployment workflows. GSAP and Three.js are already installed; do not add dependencies for this phase.

Read tests/README.md for regression checks. Start development with `npm run dev`: the guarded launcher uses http://127.0.0.1:3100 and a separate `.next-dev` directory; production build/start retain `.next`. One development process per checkout is allowed. Stop the preview before production acceptance checks so browser evidence belongs to the intended server. Do not reuse another local project’s port or hide unexpected work API requests with fake handlers.

Keep meaningful decisions and verification in docs/PROJECT_CONTEXT.md so a new conversation can resume without replaying every chat. Do not overwrite uncommitted work. Do not commit, push or deploy unless requested.


The latest journey correction removes all automatic holds at encounters. Flight and camera tangents remain continuous across real records, including repeated bodies and the loop seam; measurements still commit only at real event arrivals. Preserve manual Pause, timeline/filter inspection, offscreen/hidden suspension and reduced-motion fallback. Catalog entry keeps its source canvas/model until the profile is ready, then makes one host-to-host move instead of expanding through a full-window midpoint.

The current approved calculated-encounter brief supersedes the earlier last paragraph's invented continuous transfer. Use verified JPL windows with explicit Time jump transitions. Preserve Pause, reduced motion, offscreen suspension, one renderer and native scroll. Do not reinstate an artistic orbit when calculated states are unavailable. See docs/CALCULATED_ENCOUNTERS.md.
