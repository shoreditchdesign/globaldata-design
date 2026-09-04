# Sprint 2 — brief

## Goal

Natural-language search over the GlobalData filter model. Three input modalities compared, so the
client can choose a direction rather than approve a single design.

## Source

Paper file `Globaldata`, page `Sprint 2`, artboard `V2 - 25/8/26 - AG`. The core frame is
**Natural Language / Manual Filter Integration**; supporting clusters are labelled
`Dropdowns in filter bar`, `10+ Filters` and `Group by`.

## Ideas

| Idea | Modality | Testing |
|------|----------|---------|
| 1 — Prompt into filters | Prompt resolves into the existing filter rail | Can AI sit on top of the current model without replacing it? |
| 2 — Query canvas | Filters as nodes on a pan/zoom canvas, wired through logic gates | Is spatial composition worth the loss of familiarity? |
| 3 — Conversational refinement | Chat plus a reversible filter stack, results live alongside | Is narrowing-in over turns clearer than one-shot parsing? |

Idea 1 is the faithful port. Ideas 2 and 3 are independent explorations, not polish passes on it.

## Constraints

- shadcn/ui look — colours, radius, type — light mode only.
- Static and hardcoded. No data fetching, no real filtering logic, no state beyond click-through.
  This is exploratory, not a production build.
- Everything must be clickable end to end so it can be shared as a link.

## Success criteria

- Client can walk all three flows unaided and say which modality fits their users.
- Each idea reads as a distinct product decision, not a restyle.
