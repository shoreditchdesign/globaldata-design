# globaldata-design

Design-exploration repo for the design sprints Shoreditch Design Studio is running for
**GlobalData**, a market-intelligence company replatforming a legacy pharma database (search,
filter, export to Excel). It holds clickable prototypes of the competing directions under
consideration, plus the research and evidence behind them. It is not the production codebase —
that is the sibling repo [`globaldata-dev`](https://github.com/shoreditchdesign/globaldata-dev),
which holds the React component library and Storybook catalogue this work eventually feeds.

The repo is **private**. It contains client quotes, screenshots of GlobalData's authenticated
platform, and a reconstructed account of the client relationship — none of it for public view.

## What a "sprint" is, and why every one carries several ideas

A sprint is a two-week block of design work reviewed with the client. Within a sprint, the repo
always carries **multiple independent ideas** — separate takes on the same problem, not
successive polish passes on one converging design. This is not a house convention; it is a direct
response to how Sprint 2 went. That sprint spent four weeks on one refined filter-builder modal,
and the client's CPO rejected it on process grounds as much as on the design itself: *"you've
almost presented the conclusion without the working."* He asked to see the range of options
considered, judged against stated criteria, with what was discarded and why. Sprint 3 (the current
one) is built around that request: four directions, each answering a different position, each
carrying its own rationale for why it exists and what it trades off. See
`sprints/sprint-3/DESIGN-BRIEF.md` for the full situation and `docs/sprint-3/research/CLIENT-CONTEXT.md`
for the project history behind it — read that file rather than expecting a summary of it here.

## The four current directions (Sprint 3)

| Route | Idea | Tests |
|---|---|---|
| `/sprint-3/idea-1/results` (and others) | Modal / Sidebar Takeover | The incumbent — a faithful port of the design already shown and rejected, kept as the baseline the other three have to beat. |
| `/sprint-3/idea-2/screener` | Miller Columns | Whether horizontal depth (Finder-style columns) beats the vertical nesting that made the live product and Idea 1 lose context. |
| `/sprint-3/idea-3/start`, `/sprint-3/idea-3/sentence` | Text Input Field | Whether natural language can replace the filter UI outright — one input resolving into an editable sentence — rather than sit beside it. Fewest clicks, highest trust risk. |
| `/sprint-3/idea-4/grid` | Sidebar Agent | Whether the results grid itself can be the interface, filtered Excel-style from the column headers, with a docked agent that proposes changes rather than a separate filter surface. |

`/sprint-3/compare` steps through any two ideas side by side. `/` is the index of every sprint and
idea in the registry; it is the only conventional navigation surface in the app.

## Repo shape

A sprint maps across five top-level trees, one folder per sprint in each:

```
src/app/<sprint>/<idea>/[screen]   route per screen, e.g. /sprint-3/idea-2/screener
src/app/<sprint>/compare           side-by-side review of two ideas
src/flows/<sprint>/<idea>/flow.ts  screen manifest for one idea
src/flows/<sprint>/<idea>/screens  the screen components themselves
src/flows/registry.ts              single source of truth for which sprints/ideas exist
src/components/prototype           shared prototype chrome — see its own README
src/components/ui                  shadcn components (generated, do not hand-edit)
docs/<sprint>/{decks,scratchpad,research,exports}
slides/<sprint>                    built HTML decks
sprints/<sprint>                   brief, flow notes, decision log
```

`docs/`, `slides/` and `sprints/` are version-controlled alongside the code, deliberately: the
research and the decision log are half the value of a sprint, and separating them from the
prototype they justify would let the two drift apart. They live here because the repo is private,
not despite it.

### Defining a direction

An idea is: a `flow.ts` manifest (premise, rationale, source, tags, and the list of screens), the
screen components it references under `screens/`, and an entry in `src/flows/registry.ts`. Adding
a screen to an existing idea means writing the component and adding one entry to that idea's
`flow.ts` — the route, the Explorer's navigation and the compare view all pick it up from the
manifest automatically. Adding a new sprint or idea means mirroring the folder pattern above under
`src/app/` and registering it in `registry.ts`.

Every idea's `flow.ts` records where the design came from (`source` — a Paper file reference, or a
Sprint 1 approach taken further) and states in `premise` what that specific idea is testing.
Deliberate divergences from the source — a restyle, a scope cut, a bug fix folded in along the way
— get logged with their reasoning in `sprints/<sprint>/DECISIONS.md`, not left implicit in a diff.

### Routing and chrome

Each screen is its own route (`/sprint-3/idea-2/screener`) and renders full bleed, filling the
viewport with no frame, breadcrumb or footer around it — the point is to review something that
reads as a product, not a slide. The only chrome is the **Explorer**, a floating panel toggled
with Cmd+Shift+E (Ctrl+Shift+E off macOS) and closed with Esc; it holds the navigation between
sprints, ideas and screens that would otherwise need a visible harness. It hides itself inside the
compare view's iframes and remembers whether it was open for the rest of the session.

### Shared layer versus per-idea code

`src/components/prototype/` holds two different things, documented in full in its own
[README](./src/components/prototype/README.md). The **harness** (`Explorer`, `SprintTable`,
`CompareView`, `PrototypeScreen`) is review scaffolding, not part of the product being designed.
The **shared product surface** (`ProductChrome`, `StageBadge`, `FilterPill`, `product-areas`,
`motion`) is the parts of the *product* that every direction shows — header, area tabs, stage
colouring, filter-pill styling, animation timing. These are shared because four directions get
reviewed in one sitting, and anything that drifts between two of them reads to the client as four
different products rather than four proposals for one. The test for whether something belongs here
or stays local to an idea: would a client notice if it looked different between two directions? If
yes, share it; if it is used once, it belongs to that idea.

### Static and hardcoded, on purpose

Prototypes do not fetch, and there is no real filter engine. In-memory filtering of a fixed row
array is fine — several screens do exactly that, so a live count and a live table stay honest as
you interact — but a real backend, a real search index, or state that outlives a click-through is
out of scope. This is an exploratory sprint, not a production build, and every screen states its
sample size on screen so a reviewer knows what they are looking at (sample sizes currently vary
across directions — 46 rows in Idea 4, 78 in Idea 3, 1,440 in Idea 2 — each honestly labelled, but
inconsistent if the four are compared side by side; see `sprints/sprint-3/NEXT-SESSION.md`).

### Where the evidence lives

Each direction under `sprints/sprint-3/ideas/` carries a paired `IDEA-*-EVIDENCE.md` and
`IDEA-*-EXPLAINER.md` — the argument for why the idea exists and what it answers. `sprints/sprint-3/DECISIONS.md`
logs every deliberate divergence from source designs. `docs/sprint-3/research/` holds the inputs:
client context, a running ledger of the CPO's stated preferences, and a measured walkthrough of the
live platform with screenshots. `sprints/sprint-3/NEXT-SESSION.md` is the current state of what is
specified but not yet built — read it before picking up new work on this sprint.

## Commands

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm typecheck
pnpm lint
pnpm build
```

`pnpm typecheck` and `pnpm lint` must pass before a sprint is handed over.

## Conventions

File naming, the design system (shadcn/ui, light mode only) and the full repo-shape rules live in
[`CLAUDE.md`](./CLAUDE.md).
