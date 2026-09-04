# Sprint 2 — decisions

Log of deliberate divergences from the Paper source, and why.

| Date | Decision | Rationale | Affects |
|------|----------|-----------|---------|
| 2026-09-04 | Restyle to shadcn tokens rather than reproduce the Paper palette and type (DM Sans / Plus Jakarta Sans). | The brief is an uplift pass — structure ported, surface raised to the design system. | Idea 1, all screens |
| 2026-09-04 | Prototypes are static and hardcoded. No filter engine, no data fetching, no state beyond click-through. | Exploratory sprint, not a production build. Keeps 3 ideas × N screens affordable. | All ideas |
| 2026-09-04 | Idea 3 (conversational refinement) must differentiate on multi-turn narrowing, a reversible filter stack and branching. | The source AI tab already renders a transcript, so a single-turn chat would duplicate Idea 1 rather than explore. | Idea 3 |
