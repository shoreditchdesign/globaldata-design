# Sprint 3 — brief

## Goal

Natural-language search over the GlobalData filter model. The design reviewed in the client's
Sprint 2 is carried in as a baseline, and two new modalities are put against it, so the client
chooses a direction rather than approves a single design.

## Source

Paper file `Globaldata`, page `Sprint 2`, artboard `V2 - 25/8/26 - AG`. The core frame is
**Natural Language / Manual Filter Integration**; supporting clusters are labelled
`Dropdowns in filter bar`, `10+ Filters` and `Group by`.

## Ideas

| Idea | Modality | Testing |
|------|----------|---------|
| 1 — Prompt into filters *(incumbent)* | Prompt resolves into the existing filter rail | Nothing — this is the design already shown and rejected, kept as the baseline to argue against. |
| 2 — Query canvas | Filters as nodes on a pan/zoom canvas, wired through logic gates | Is spatial composition worth the loss of familiarity? |
| 3 — Conversational refinement | Chat plus a reversible filter stack, results live alongside | Is narrowing-in over turns clearer than one-shot parsing? |

Idea 1 is the incumbent: a faithful, unchanged port of the design the client reviewed and pushed
back on. It is in the sprint so the alternatives have something concrete to be compared against, not
as a contender. Ideas 2 and 3 are independent explorations, not polish passes on it.

## Constraints

- shadcn/ui look — colours, radius, type — light mode only.
- Static and hardcoded. No data fetching, no real filtering logic, no state beyond click-through.
  This is exploratory, not a production build.
- Everything must be clickable end to end so it can be shared as a link.

## Success criteria

- Client can walk all three flows unaided and say which modality fits their users, with the incumbent in front of them for comparison.
- Each idea reads as a distinct product decision, not a restyle.
