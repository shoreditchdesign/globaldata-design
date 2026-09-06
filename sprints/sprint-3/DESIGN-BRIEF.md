# Sprint 3 — design brief

Single source of truth for the three new directions. Read this before building anything.

## The situation

GlobalData Healthcare is replatforming a legacy pharma database — search, filter, export to Excel.
**Sprint 1** (13 Aug) showed four approaches and landed well. **Sprint 2** showed one refined
approach — a filter-builder modal — and landed badly on 2 September. The relationship is at risk.
Sprint 3 is the recovery.

Neil Dodgson, the client CPO, rejected Sprint 2 on two counts. The modal was *"a bit fiddly…
versus kind of having the full pane to work with"*, and more damagingly, four weeks had produced
one converged path: *"you've almost presented the conclusion without the working."*

He asked for a wide funnel of options, judged against **four named criteria — number of clicks,
cognitive load, AI-editability, modal vs non-modal** — with the discarded options shown and
reasoned.

## The trap to avoid

**Neil's complaint about the modal is already true of the live product.** The production screener
is *already* full-pane, and it already loses context, already can't hold two branches open. Going
full-screen fixes nothing on its own. The real causes, measured on the live platform:

- The query is never visible in one place — attribute in the left pane, values in the middle, the
  only record of what you built is a stack of chips in a third pane.
- Selected values show **no selected state**. No tick, no highlight. You cannot deselect from the
  list you selected in.
- Switching attribute **wipes the middle pane**. That is the lost context, literally.
- **No counts anywhere**, then a six-second commit with no idea whether you get 12 rows or 12,000.
- Two Boolean grammars six inches apart: a per-pair `OR/AND/NOT` dropdown within an attribute, an
  `AND/NOT` radio (no OR) between attributes, and no parentheses — `(a AND b) OR (c AND d)` is
  inexpressible.

Baseline to beat: **12 interactions** from landing to a filtered set of 2 attributes / 4 values.
About **3 clicks per filter parameter**, so a typical 3–4 parameter screen is **13–16 clicks** plus
one blind server round trip.

## What Sprint 1 already established

Seven principles, from the benchmarking of Linear, Hugging Face, Kibana, Kaggle, OpenML and Google
Dataset Search. Every new direction should be arguable against these — they are the client's own
frame of reference now.

1. **The pill is the primary filter control, not the search box.** Filters are objects: visible,
   editable in place, individually removable.
2. **One prominent live result count**, updating on every change.
3. **Results first, no empty states.** Show the collection, let filtering narrow it. Reframes the
   task as reduce, not guess.
4. **Hard spatial split between controls and results.** A persistent panel owns the query; the rest
   of the screen owns the output. The user never hunts for where to edit.
5. **Cheap, obvious reversibility.** Per-pill dismiss, per-group reset, one global clear.
6. **Progressive reveal of complexity.** Simple pills on the surface, nested logic underneath, in
   the same place.
7. **Filters read as plain language.** Subject–operator–value: `Priority is High`.

### The four Sprint 1 approaches

| # | Name | Shape | Client reaction |
|---|------|-------|-----------------|
| 1 | **Side Navigation** | Left rail of areas; drilling replaces the rail contents with a back-chevron breadcrumb (`‹ Drugs`, then `‹ Drugs / Therapy Area`); values are a searchable checkbox tree; chips sit in a bar above the results with inline `OR`/`AND` operators and a `+`; live count and Export top right; the results table is visible the whole time. | **Neil's favourite** — *"almost like a stepper approach."* Worried about depth: *"sections upon sections upon sections."* |
| 2 | **Stepped Search** | Centred search box on an otherwise empty page; typeahead grouped by RECENT / THERAPY AREAS / STAGES with an `Add` button per row; picks become chips inside the input. A variant used a **Define Search Parameters modal** with area tabs and two-column checkbox values. | The modal variant is what became Sprint 2. Rejected. |
| 3 | **Search Priority** | Search bar pinned top-left above the rail, always present; grouped typeahead with `Add` per row; footer hint: *"Type AND OR NOT after a term to chain searches."* Results always visible. | Under-explored. Closest thing to an answer to his NL question. |
| 4 | **Filter Dropdowns** | Chips bar at the top; `+` opens cascading nested flyout menus (areas → attributes → values) over the results. | Under-explored. |

## The three directions to build

Each is an independent take. None is a modal. Each answers a different stated position.

### Idea 2 — Full-pane screener (`idea-2`)

Approach 1 grown up, with the depth problem actually solved. The fix is that **each level opens as
a column rather than replacing the one before it** — Finder/Miller columns. Depth becomes
horizontal, the path stays visible, and more than one branch can be open at once. Cap it at three
columns with a breadcrumb collapsing the rest.

Every level shows **result counts**, every selected value shows a **selected state**, and the live
total updates as you go. Filters land as pills in the bar above the results.

*Tests: does horizontal depth beat vertical nesting.*

### Idea 3 — Query as a sentence (`idea-3`)

Approach 3 taken to its conclusion, and the answer to Neil's recurring question: *"how do you
combine being able to use natural language and then saying I want to structure my search?"*

One input. Natural language goes in; what comes back is **the query rendered as an editable
sentence** — every noun a pill with a dropdown, operators as plain-language words between them.
Not a chat transcript, not a builder panel: one line you can read and correct. A "show as filters"
affordance for anyone who wants the structure.

Worth knowing: the platform **already has** a fast, cross-entity natural-language search in the
global header, and nothing found in it can be carried into a screener. This direction is best
argued as *"you already built the good search and orphaned it."*

*Tests: can AI replace the filter UI rather than sit beside it. Fewest clicks, highest trust risk.*

### Idea 4 — Results-first (`idea-4`)

The one nobody has designed, against a complaint Neil made in Sprint 1 and repeated since. Start in
the grid; **filter from the column headers**, Excel-style, with counts in the menu. No separate
filter surface at all.

This also has to fix the grid itself. On the live product the results view scrolls horizontally at
1600px with eight locked columns, and one drug can occupy an entire viewport because sub-values are
rendered as merged rows — "1–10 of 1,091" renders as thirty-five lines. Neil asked for a
non-linear, pill-style multi-row card grid instead of the flat spreadsheet list. Build that.

Bina's point applies here: the users are **Excel-habituated**, so sort, filter and aggregates belong
at the top level.

*Tests: can the grid be the interface, and does that suit Excel-habituated users.*

## Constraints

- shadcn/ui, light mode only, Tailwind tokens, no raw hex. Read `CLAUDE.md`.
- **Static and hardcoded.** No filter engine, no fetching, no state beyond click-through and UI
  toggles. This is exploratory.
- Domain vocabulary must match the product: Therapy Area / Indication, Development Stage, Drug
  Geography, Route of Administration, Molecule Type, Target, Mechanism of Action, ATC
  Classification, Drug Type, Mono/Combination Drug, Drug Descriptor, Gene Therapy Vector,
  Application Type, CAS Number. Areas: Companies, Drugs, Licensing Opportunity, Regulatory
  Milestones, Sales and Forecast, Drugs by Manufacturer, NPV, Advanced Company Watchlist.
- Stage values render as badges: Launched, Phase I/II/III, Marketed, Discovery, Preclinical.
- Reference data already exists at `src/flows/sprint-3/idea-1/data.ts` — import from it read-only.

## Reference material

- `docs/sprint-3/research/CLIENT-CONTEXT.md` — project history, who's who
- `docs/sprint-3/research/NEIL-LEDGER.md` — every stated preference, with quotes
- `docs/sprint-3/research/PLATFORM-WALKTHROUGH.md` — the live product, measured
- `docs/sprint-3/Sprint 1.pdf` — the deck the client liked
- `src/flows/sprint-3/idea-1/` — the rejected Sprint 2 design, ported. The incumbent to beat.
