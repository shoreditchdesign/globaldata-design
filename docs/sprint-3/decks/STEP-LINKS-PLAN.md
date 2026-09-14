# Deep links per state, and the goal each one is evidence for

Neil asked for two things on 14 September that this plan covers: URLs that open on a specific state
of a flow rather than at the start of it, and a map from those states to the user goal each one is
evidence for. See `CLIENT-BRIEF-14-SEP.md` for where both asks come from.

Idea 1 already works this way. The other three do not, and this is what it takes.

## The pattern Idea 1 established

Four moving parts, all under `src/flows/sprint-3/idea-1/`:

1. `flow.ts` lists twelve `Screen` entries whose `component` is the same `Incumbent`.
2. `state.ts` holds one `Idea1State` interface, a `base`, an `initialStates: Record<string, Idea1State>`,
   an `initialState(slug)` that falls back to `base`, and a `slugFor(state)` naming the frame the live
   state is nearest to.
3. `components/IncumbentScreen.tsx` does the wiring: `usePathname()` → `splitPath` →
   `useState(() => initialState(slug))`, a during-render reseed guarded by `seenSlug` and a
   module-scope `lastWrittenSlug`, and a `useEffect` that calls `window.history.replaceState`
   (never push) to `${base}/${liveSlug}`.
4. `app/sprint-3/idea-1/[screen]/page.tsx` needs no change at all — `generateStaticParams` reads
   `flow.screens`, so adding slugs adds routes.

The reseed guard is the subtle part and the thing to copy exactly. Without `lastWrittenSlug` the
screen's own `replaceState` comes back through `usePathname` and reseeds the state it just wrote.

## Idea 2 — Miller Columns

Nine core states and three more if there is time. All the state already lives in one hook,
`use-screener.ts`, which makes this the cleanest of the three structurally and the messiest in one
specific place, the agent's step records.

| # | slug | title | note | seed |
|---|---|---|---|---|
| 1 | `cold-start` | Cold start | Nothing filtered, the attribute inventory open, all 1,440 sampled drugs. | `filters: []`, `path: ["Drugs"]`, `leftIndex: 0`, agent idle |
| 2 | `values` | Values, counted | One attribute open. Every value carries what picking it would leave, before you spend the click. | `filters: []`, `path: ["Drugs", "Therapy Area / Indication"]`, `leftIndex: 99` |
| 3 | `screener` | Screener | *(unchanged)* | `filters: initialFilters`, `path: defaultPath`, `leftIndex: 1` |
| 4 | `excluded` | Excluded | Drug geography flipped to `is not`. An excluded pill does not look like an included one. | geography filter as `{ values: ["Austria","Italy"], mode: "is not" }`, `path: ["Drugs","Drug Geography","Europe"]` |
| 5 | `intersected` | Joined with AND | The same attribute's values joined with `and` rather than `or`, and the count collapsing for it. | therapy filter `join: "and"`, `path: ["Drugs","Therapy Area / Indication"]` |
| 6 | `agent-running` | Agent working | Mid-run: the columns travel, values tick, the count falls one value at a time. | `agent: { status: "running", steps: replayPlan(0), stepIndex: 1, beat: 0 }`, `filters: []` |
| 7 | `agent-done` | Four steps applied | The run finished, each step still undoable on its own. | `filters: replayPlan().filters`, `agent: { status: "done", steps: replayPlan().steps, stepIndex: 4 }` |
| 8 | `agent-undone` | One step reversed | The geography exclude taken back on its own; the three steps around it are untouched. | as above, geography step `status: "undone"`, its filter removed |
| 9 | `record` | Record open | The whole drug, summoned rather than docked, over a query it cannot outlive. | `filters: initialFilters`, `selectedRecordId: matchingRows(initialFilters)[0].id` |
| 10 | `empty` | No matches | A combination the sample cannot satisfy. The table says so rather than showing the last set that worked. | a filter set verified against `matchingRows`, not guessed |
| 11 | `agent-unwired` | Send disarmed | A request with no plan behind it. The button will not pretend. | `request: suggestedRequests[1].text` |
| 12 | `breadcrumb` | Folded columns | Four levels deep at 1440px: two columns on screen, the rest in the breadcrumb. | `path: ["Drugs","Therapy Area / Indication","Dermatology", <indication>]`, `leftIndex: 0` |

**Refactor.** `useScreener()` becomes `useScreener(seed: Idea2State)`, and every `useState(x)`
becomes `useState(seed.x)`. Two things block seeding as the code stands.

`AgentComposer` holds `const [request, setRequest] = useState(agentRequest)` locally. Lift it into
the hook and pass `request` and `setRequest` down — six lines, and it is what makes
`agent-unwired` addressable.

The agent's `StepRecord.previous` and `.removed` are captured inside the sequencer effect at run
time, so a seeded `agent-done` cannot honestly offer Undo without hand-authoring them. The least
churn that stays honest: extract the per-beat filter mutation out of the `useEffect` into a pure
`applyStep(filters, step) => { filters, previous, removed }`, have the sequencer call it, and have
`state.ts` call it too in a `replayPlan()` that walks `agentPlan` from `initialFilters` and returns
both the end filters and fully populated step records. The seed is then produced by the same code
the run uses.

Leave alone: `FilterPanel`'s local `query` (column search, no slug needs it), `useMaxColumns` (a
media query, and at 1440px it always resolves to two columns, which is what `breadcrumb` depends
on), and `RecordDrawer`'s `lastRow` (exit-animation memory).

`slugFor` needs the row count to name `empty`, so its signature is `slugFor(state, rowCount)`. The
hook already memoises `rows`.

## Idea 3 — Text Input Field

Eight core states and two more if there is time.

| # | slug | title | note | seed |
|---|---|---|---|---|
| 1 | `start` | Cold start | *(unchanged)* | `clauses: []`, `phase: "compose"`, `draft: ""` |
| 2 | `typed` | Typed, not sent | A loose request in the reviewer's own words, a beat before it becomes structure. | `phase: "compose"`, `draft: suggestedQueries[0]` |
| 3 | `resolving` | Resolving | The words the system recognised lighting up and hardening into pills. Nothing is being computed. | `phase: "resolving"`, `pending: resolveQuery(originalPrompt)` |
| 4 | `sentence` | Query as a sentence | *(unchanged)* | today's `seed` |
| 5 | `filters` | The same query as filters | The identical clauses drawn as conventional filters — one query, swapped in place, not a second surface. | `view: "filters"` |
| 6 | `edit` | Read back as prose | `Edit` run backwards: the sentence collapsed to the English it came from, editable. | `phase: "compose"`, `draft: clausesToProse(seed.clauses)`, clauses intact |
| 7 | `partial` | Read partly | Some phrases placed, others reported with the nearest condition offered rather than assumed. | `resolveQuery("phase III drugs for rheumatoid arthritis in Germany")`, verified against what it actually produces |
| 8 | `failure` | Nothing placed | Nothing understood, so nothing built. The words stay where they were typed. | `phase: "compose"`, `failure: resolveQuery("pfizer's late-stage pipeline")` |
| 9 | `pill-open` | Inside a value | One pill's dropdown: change the operator, add a value, clear the clause — refinement without retyping. | `openPill: { clauseId: "geography", value: "Austria" }` |
| 10 | `empty` | No matches | A sentence the 78-row sample cannot satisfy; the count reads zero rather than a confident four digits. | clauses verified against `screenDrugs` |

**Refactor.** Collapse `screens/Start.tsx` and `screens/Sentence.tsx` into one `screens/Screener.tsx`,
drop the `start` prop, and have `components/Screener.tsx` read the slug itself. Two blockers.

`resolvedRef` is set inside `submit`, so a seeded `resolving` would settle into nothing. One line:
`React.useRef<Resolution | null>(seed.pending)`.

`ValuePill` in `QuerySentence.tsx` holds its Popover `open` locally, and lifting that through a
444-line file is not worth it before Wednesday. The cheapest honest fix is to thread an optional
`openPill` prop from `Screener` through `QuerySentence` to the matching `ValuePill` and pass it to
Radix as `defaultOpen` — uncontrolled from the first click onward, which is all a deep link needs.
If that still reads as too much churn, `pill-open` is the slug to cut.

Leave alone: `ResultsGrid`'s local `sort`, `FilterView`'s local `open`, `GlobalSearch`'s `value`
and `focused`.

## Idea 4 — Sidebar Agent

Nine core states and three more if there is time.

| # | slug | title | note | seed |
|---|---|---|---|---|
| 1 | `grid` | Working grid | *(unchanged)* | today's `initialGridState` and `seedThread()` |
| 2 | `cold-grid` | Unfiltered grid | 1,440 rows, no filters, no thread. The grid before anything has been asked of it. | `filters: {}`, `messages: []` |
| 3 | `typed` | Prompt unsent | A request in the composer, a click short of a proposal. | `draft: examplePrompts[0]` |
| 4 | `proposed` | Plan proposed | What it is about to do, what it matched, and how many rows it would leave — before it touches the grid. | `respond(prompt, state)` at `phase: "proposed"` |
| 5 | `undone` | Undone | The receipt's undo taken. The grid is exactly where it was, and the turn says so. | seeded turn at `phase: "undone"`, `grid: message.before` |
| 6 | `missed` | Could not map that | A request with no rule behind it, answered with what it can do instead of a guess. | `respond("what's pfizer's pipeline", state)` |
| 7 | `column-menu` | Column menu | Filtering from the header, Excel-style, with a count against every value. | `openColumn: "stage"` |
| 8 | `grouped` | Grouped by company | The grid collapsed by a column, with the summary row under it. | `grid.group: "company"` |
| 9 | `wide` | Past the edge | Extra columns added until the grid scrolls sideways, with the checkbox and drug name frozen. | `grid.order` extended with `npv`, `patents`, `phaseStart` |
| 10 | `stale` | Stale proposal | The grid moved on under a plan. It goes stale rather than applying over the change. | seeded turn with `stateVersion: 0`, `version: 1` |
| 11 | `panel-closed` | Grid alone | The assistant dismissed. The direction has to stand up without it. | `panelOpen: false` |
| 12 | `empty` | No matches | A filter set nothing survives. | verified against `filterRows` |

**Refactor.** `Grid.tsx` already keeps everything in one component and `seedThread()` is the
pattern for every thread seed, so generalise it in `state.ts` into `turn(prompt, before, phase)`
and hand-author nothing. Blockers: `AgentPanel`'s local `draft` must be lifted to props for
`typed`; and a seeded `thinking` turn will never resolve, because only `submit()` schedules
`think()` — either add a mount effect that resolves a seeded `thinking` message, or, better, skip
`thinking` and `applying` as seeds entirely and let the reviewer press Accept on `proposed`. Say
that in the note rather than shipping a turn that hangs. `GridToolbar`'s four Popovers are
uncontrolled Radix, so a `columns` slug showing the column manager open is blocked until they take
`open` and `onOpenChange`; that is the slug to cut this week.

Leave alone: `ColumnHeaderMenu`'s local `query`, `ColumnManager`'s local `query`, and
`ResultsGrid`'s local `collapsed` — a seeded `grouped` link opening with every group expanded is
the right default.

## The one shared piece

`IncumbentScreen` carries about thirty-five lines of URL machinery: `lastWrittenSlug`, `splitPath`,
the `seenSlug` render-time reseed and the `replaceState` effect. Copying it four times is four
places to get the reseed guard wrong. AGENTS.md forbids extracting a cross-variant React component
library, but this is a hook rather than a design component, so it is allowed on that reading:
`src/hooks/use-deep-link.ts`, taking `{ slug, liveSlug, onReseed }`. Do not move Idea 1 onto it in
the same session — Idea 1 works, and destabilising it before a review buys nothing.

## The goal map

G1 quick screen, G2 refine, G3 deep Boolean, and a dash for a state that serves no goal because it
exists to show a limitation. Neil asked to see those as explicitly as the strengths.

| URL | Goal | What a reviewer is meant to see |
|---|---|---|
| `/sprint-3/idea-1/results` | G1 | Where every query starts: 285,529 drugs and no way forward but a modal. |
| `/sprint-3/idea-1/ai-empty` | G1 | The natural-language door on the incumbent, with an empty builder beside it. |
| `/sprint-3/idea-1/ai-typed` | G1 | One sentence about to do the work of six clicks. |
| `/sprint-3/idea-1/ai-parsed` | G1, G2 | The parse arriving as editable groups — AI writes the filters, the user still owns them. |
| `/sprint-3/idea-1/manual-areas` | G3 | Where the Boolean path starts: level one of the cascade. |
| `/sprint-3/idea-1/manual-attributes` | G3, — | Level two, and the depth objection beginning to show. |
| `/sprint-3/idea-1/manual-values` | G3, — | Level three. Three popovers deep to reach one value. |
| `/sprint-3/idea-1/manual-selected` | G3 | A ticked value writing straight into the builder — the one thing the incumbent does well. |
| `/sprint-3/idea-1/applied` | G1 | The commit, and the fact that the total is only known after it. |
| `/sprint-3/idea-1/filter-bar-dropdown` | G2 | Editing one clause from the bar without reopening the modal. |
| `/sprint-3/idea-1/many-filters` | — | Past ten values the bar folds into +N and the query stops being legible. |
| `/sprint-3/idea-1/group-by` | G2 | Collapsing the filtered rows by a column. |
| `/sprint-3/idea-2/cold-start` | G1, G3 | The data model browsable before you know what you want — and the click cost of getting a list by hand. |
| `/sprint-3/idea-2/values` | G1, G2 | Every value priced before the click. The live product shows none, then commits blind. |
| `/sprint-3/idea-2/screener` | G2 | Four filters, two levels open, nothing wiped. The path you took is still on screen. |
| `/sprint-3/idea-2/excluded` | G3 | NOT per attribute, in its own tone, with the count moving for it. |
| `/sprint-3/idea-2/intersected` | G3 | AND rather than OR inside one attribute — the granularity the biggest customers pay for. |
| `/sprint-3/idea-2/agent-running` | G1 | Your own interface being driven: columns travel, values tick, the count falls. |
| `/sprint-3/idea-2/agent-done` | G1, G2 | Cold start to a finished list in one request, with the four steps still on the table. |
| `/sprint-3/idea-2/agent-undone` | G2 | One step reversed without the three around it coming apart. |
| `/sprint-3/idea-2/record` | G2 | The whole drug on demand rather than a column away. |
| `/sprint-3/idea-2/empty` | — | A combination nothing survives, said plainly instead of padded. |
| `/sprint-3/idea-2/agent-unwired` | — | The prototype's own limit: one request is wired, and the button will not pretend otherwise. |
| `/sprint-3/idea-2/breadcrumb` | — | Two columns at 1440px and the rest folded away. The depth cap, and what it costs. |
| `/sprint-3/idea-3/start` | G1 | The cold start this direction is built for: type it loosely, in your own words. |
| `/sprint-3/idea-3/typed` | G1 | One line, about to become seven conditions. |
| `/sprint-3/idea-3/resolving` | G1 | Structure being imposed on a sentence, which is the thing a reviewer cannot otherwise see. |
| `/sprint-3/idea-3/sentence` | G1, G2 | The answer to the standing question: natural language and structured search as one object. |
| `/sprint-3/idea-3/filters` | G2, G3 | The same clauses as conventional filters, swapped in place — one query, not two surfaces. |
| `/sprint-3/idea-3/edit` | G2 | The round trip closing: the query written back as the English it came from. |
| `/sprint-3/idea-3/partial` | G1, — | What it could not place, named, with the nearest condition offered rather than assumed. |
| `/sprint-3/idea-3/failure` | — | Nothing understood, so nothing built. The failure mode this direction cannot afford to fake. |
| `/sprint-3/idea-3/pill-open` | G2, G3 | Where the Boolean lives: the operator, the join and the values, all inside one pill. |
| `/sprint-3/idea-3/empty` | — | Zero, said honestly, over an empty table. |
| `/sprint-3/idea-4/grid` | G1 | Landing in data rather than in a screener, three filters already applied by one request. |
| `/sprint-3/idea-4/cold-grid` | — | The grid with nothing asked of it — the redesigned results view on its own terms. |
| `/sprint-3/idea-4/typed` | G1 | A request about to act on the grid rather than on a query object. |
| `/sprint-3/idea-4/proposed` | G1, G2 | Proposed before applied, with a preview count and a dismiss always offered. |
| `/sprint-3/idea-4/undone` | G2 | The receipt's undo taken, and the grid exactly where it was. |
| `/sprint-3/idea-4/missed` | — | A request it cannot map, answered with what it can do instead of a guess. |
| `/sprint-3/idea-4/column-menu` | G2, G3 | Filtering from the header, Excel-style, with a count against every value. |
| `/sprint-3/idea-4/grouped` | G2 | Aggregate and group in the table's own header, which is Bina's point answered literally. |
| `/sprint-3/idea-4/wide` | — | The results-grid complaint reproduced and then answered: it scrolls, with identity frozen. |
| `/sprint-3/idea-4/stale` | G2, — | A plan the grid moved past. It goes stale rather than applying over the change. |
| `/sprint-3/idea-4/panel-closed` | G3 | The grid without the assistant, for the user who does not want one. |
| `/sprint-3/idea-4/empty` | — | A filter set nothing survives. |

Read as a whole: G1 is well covered in Ideas 2, 3 and 4 and barely covered in Idea 1, which is the
argument the sprint is making. G3 is the thinnest — Idea 3's `pill-open` and `filters`, Idea 2's
`excluded` and `intersected`, Idea 4's `column-menu`. Nothing in the sprint yet demonstrates
cross-attribute Boolean, a group of ANDs OR'd against another group, which the live platform does
and which `docs/sprint-3/research/platform/08-two-filter-groups-and-cross-attribute-and-not.png`
shows. That is worth saying to Neil rather than letting him find it, given G3 is where his
highest-value customers live.

## Order and effort

One developer session, with `pnpm typecheck`, `pnpm lint` and `pnpm build` all green before the
Wednesday 4pm review.

1. `src/hooks/use-deep-link.ts`, about thirty minutes. Everything else depends on it.
2. Idea 3, all eight core slugs, about an hour and a half. Lowest risk, since its `Screener`
   already takes a seed-shaped prop, and highest evidential value, since it is the direction Neil
   has asked about in nearly every call. Ship this even if nothing else lands.
3. Idea 4, nine core slugs, about two hours. `seedThread()` already proves the pattern; the only
   new work is lifting `draft` and writing `turn()`.
4. Idea 2, nine core slugs, about two hours, and the most refactoring because of `replayPlan` and
   `applyStep`. If the session runs short, cut to `cold-start`, `values`, `screener`, `excluded`
   and `agent-done`.
5. The goal map published where Neil reads it, about thirty minutes, and half of what he asked for.
   Do it even if Idea 2 slips.

**Can wait.** Idea 4's `columns` slug, blocked on uncontrolled toolbar popovers. `thinking` and
`applying` as seeds. Moving Idea 1 onto the shared hook. And `CompareView`, which pairs ideas by
array index (`idea.screens[step]`), so going from 12/1/2/1 screens to 12/9/8/9 puts step five of
Idea 2 beside an unrelated step five of Idea 3 — the right fix is a `phase?: string` on `Screen` in
`types.ts` and a `CompareView` that pairs on it. Until then, order each idea's slugs to a common
spine (cold start, typed, in flight, proposed, result, refine, Boolean, undo, alternate view,
limitations) so index pairing stays roughly honest. Do not reorder Idea 1; its links are already
out.

**Verification.** After each idea, open every slug and confirm the address bar does not change on
arrival. A `slugFor` that cannot distinguish two seeds will bounce the URL off the link the client
just clicked, and that is the single most likely bug in this piece of work. Then `pnpm build`,
because `generateStaticParams` prerenders every slug and a seed that touches `window` or throws
fails there rather than in `typecheck`. Every seed built by calling `resolveQuery`, `respond` or
`replayPlan` at module scope runs at build time; all three are pure, so that is fine, but nothing
in a seed may reach for `Date.now()` or `Math.random()`.

## As built — where the plan above was wrong

All 46 slugs shipped on 14 September, `pnpm typecheck`, `pnpm lint` and `pnpm build` clean, every
seed round-trip tested. The seed column in the tables above is the plan, not the result; five
entries in it turned out to be false once the code was actually run, and the shipped version
differs.

- **Idea 2 `intersected`** — the planned Dermatology AND Cardiovascular matches zero rows, because a
  drug carries one therapy area, so it would have been the `empty` frame under another name and
  `slugFor` could not have told them apart. The only honest AND this sample carries is parent and
  child: Dermatology AND Plaque Psoriasis, 25 rows with `or` and 11 with `and`.
- **Idea 2 `breadcrumb`** — `leftIndex: 0` shows the depth in the crumb trail but not the fold.
  Seeded at the rightmost window instead, so the folded crumbs take the sunken treatment and the
  chevron appears.
- **Idea 3 `failure`** — `resolveQuery("pfizer's late-stage pipeline")` returns `ok: true`, reading
  "late-stage" as Phase II or III. It would have shipped a working query under a "nothing placed"
  note. Now `"pfizer pipeline"`.
- **Idea 3 `partial`** — the planned query produces no suggestions at all, so "the nearest condition
  offered" would have described an empty panel. Now a query that places two clauses and leaves one
  unplaced with a real suggestion behind it.
- **Idea 4 `cold-grid` and `wide`** — Idea 4's sample is 46 rows, not the 1,440 written above, which
  is Idea 2's; and `patents` and `phaseStart` are not columns that exist, so `wide` turns on the five
  the sample actually has.

`Idea 3 pill-open` landed more cheaply than planned: `ValuePill` already held its own open state, so
lifting it to `QuerySentence` as an optional controlled prop was about fifteen lines and avoided the
`defaultOpen` workaround, which means closing the popover clears the state and the URL falls back to
`sentence` honestly.

Still outstanding, and deliberately not done before the review: `CompareView` pairs ideas by array
index, so now that the ideas carry 12, 12, 10 and 12 screens its side-by-side pairs are meaningless.
The fix is a `phase?: string` on `Screen` in `types.ts` and a `CompareView` that pairs on it.
