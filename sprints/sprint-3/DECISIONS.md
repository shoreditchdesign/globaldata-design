# Sprint 3 — decisions

Log of deliberate divergences from the Paper source, and why.

| Date | Decision | Rationale | Affects |
|------|----------|-----------|---------|
| 2026-09-04 | Restyle to shadcn tokens rather than reproduce the Paper palette and type (DM Sans / Plus Jakarta Sans). | The brief is an uplift pass — structure ported, surface raised to the design system. | Idea 1, all screens |
| 2026-09-04 | Prototypes are static and hardcoded. No filter engine, no data fetching, no state beyond click-through. | Exploratory sprint, not a production build. Keeps 3 ideas × N screens affordable. | All ideas |
| 2026-09-04 | Idea 3 (conversational refinement) must differentiate on multi-turn narrowing, a reversible filter stack and branching. | The source AI tab already renders a transcript, so a single-turn chat would duplicate Idea 1 rather than explore. | Idea 3 |
| 2026-09-06 | Prototype screens render full bleed at viewport height; all navigation moved into a floating Explorer (Cmd/Ctrl+Shift+E). No breadcrumb, frame, stepper or footer. | The source screens are a product, not a slide — a visible harness undercuts the review. The Explorer is `fixed`, so it never reflows the screen. | All ideas |
| 2026-09-06 | `AppChrome` fills the viewport instead of the source's fixed 900px height; the modal caps at 750px and shrinks below that. | The prototype has to hold up on whatever window the client opens it in. | Idea 1, all screens |
| 2026-09-06 | Sprint renumbered 2 → 3 across routes, folders and the registry. | The repo was one behind the client's numbering: their Sprint 2 was the filter-builder modal reviewed on 2 Sep. This work is Sprint 3. References to what the client saw in their Sprint 1 and Sprint 2 keep the original numbers. | Whole repo |
| 2026-09-06 | Idea 1 is reframed as the incumbent rather than a contender. Screens unchanged; `premise`, `rationale` and tags say it is the rejected baseline. | The alternatives need something concrete to be argued against, and the objections have to stay visible in the flow. | Idea 1 |
| 2026-09-06 | The applied-filter bar is `sticky` inside the scrolling content area. | The bar scrolled away with the table, which the real product would not do. | Idea 1 — applied, many-filters, group-by, filter-bar-dropdown |
| 2026-09-06 | Cascade popovers are flex columns with a capped height and an internally scrolling value list. | At fixed offsets they were clipped by the modal's `overflow-hidden` on windows shorter than ~800px. Unchanged at a normal window height. | Idea 1 — manual-attributes, manual-values, manual-selected, filter-bar-dropdown |
| 2026-09-06 | Explorer's back control routes explicitly to the index instead of calling `router.back()`. | A screen URL opened cold has no history, so the button did nothing visible. | Explorer |

