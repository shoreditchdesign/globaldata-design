# Idea 4 — Sidebar Agent: pros and cons

Written against the measures Neil gave us on 14 September — number of clicks, speed of access, 70%
of queries reachable in three terms or fewer — and against the three user goals in
`docs/sprint-3/decks/CLIENT-BRIEF-14-SEP.md`: **G1 quick screen**, **G2 refine**, **G3 deep
Boolean**. Click counts come from the prototype's own code rather than from a screenshot, and where
the reasoning is ours rather than someone else's evidence, it says so.

Prototype: `/sprint-3/idea-4/grid`. Code: `src/flows/sprint-3/idea-4/`.

## In one paragraph

There is no filter screen. You land in the drugs grid with the data already in front of you and
narrow it from the column headers the way you would in Excel — open a header, tick values, each one
carrying the count of drugs it would give you, and the grid behind the menu is already narrowed
before you close it. The second half of the direction is the grid itself, which is the one thing
Neil has complained about unprompted and the one thing no direction has redesigned: one drug is one
row at a fixed height however many indications or countries it carries, nine columns of thirty-seven
under the analyst's control rather than eight locked ones, and a sideways scroll with the drug name
pinned rather than a squeeze that makes the text unreadable. Docked on the right is an assistant
that acts on that grid rather than on a query object — "show me only the ones in Europe", "add the
NPV column", "group by company" — and it proposes before it acts: a plan of steps, a preview of the
row count the plan would produce, then the steps ticking as they land, and a receipt with an undo.

---

## Pros

### 1. It is the only direction that answers the complaint Neil raised himself

His grid objection is the most specific, most repeated, least designed-against thing in the record —
*"the grid falls off the side of the screen"* (13 Aug), the ask for *"a multi row entry… a bit more,
almost like pill like"* in place of a flat spreadsheet list, and, three weeks later, *"15,000
variations of tables"* while mandating a single grid component for the rebuild
(`docs/sprint-3/research/NEIL-LEDGER.md` §1). The platform walkthrough confirms it and finds the
larger problem underneath: at 1600px the live grid is already about 1.8 screens wide with eight
locked columns, and because sub-values render as merged cells a single drug can fill a viewport, so
*"1 – 10 of 1,091"* draws as thirty-five-plus lines with the Drug Name column blank on every line
after the first (`PLATFORM-WALKTHROUGH.md` §§ results grid, findings 12–13). This direction fixes
that: fixed-height rows, overflow values behind a `+N` popover, the checkbox and Drug Name frozen
left, and a column manager. **Serves G1, G2 and G3 equally** — every segment reads the same grid,
and the fix is portable: it can be adopted underneath Ideas 1, 2 or 3 without adopting any of this
direction's filtering model.

### 2. Two clicks per parameter, with the count on the value before you commit

A filter parameter costs **two interactions** — open the header, tick the value
(`ColumnHeaderMenu.tsx`) — against roughly three on the live product, and every value in the menu
carries its count within the current scope, computed with every *other* column's filter applied but
not this one's (`data.ts`, `columnValues` / `scopeFor`). The live screener has no result count
anywhere on it and commits blind through a six-second round trip
(`PLATFORM-WALKTHROUGH.md`). Counts before commit are the oldest well-evidenced win in this part of
the field. Hearst lists preventing empty result sets among the stated goals of faceted navigation,
and the underlying study is unusually direct about the effect: Maryland's HCIL built "query
previews" for NASA's Global Change Master Directory precisely because users *"waste time posing
queries that have zero-hit or mega-hit result sets"*, and gave the resulting paper the title *The
end of zero-hit queries*. The prototype also gets the hard part right. Hearst flags that showing
counts alongside checkbox disjunctions is a genuine tradeoff — the number means different things
depending on what is already ticked — and `scopeFor` resolves it by counting each column's values
against every *other* column's filters, so the number always answers "what would I get if I ticked
one more box." It keeps zero-count values visible rather than dropping them, on the stated grounds
that a menu which silently removes options is a menu you cannot trust. **Serves G1 and G2.**

### 3. It puts sort, group, filter and aggregate where an Excel user reaches for them

Bina's constraint was explicit and never contradicted: the persona is Excel-habituated, so
*"sorting, searching… even the average, mean, median"* belong *"on top level or like in a row"*
rather than buried in a sidebar (`NEIL-LEDGER.md` §7). The walkthrough's verdict on the live product
is that this is *not* an Excel-like grid at all — merged cells, server round-trip sorting, locked
columns, an undiscoverable header funnel — and that this is why customers export to Excel and work
there instead. The toolbar here carries Aggregate, Group, Sort, Columns and Export in that order,
and the same operations appear again inside each column's own menu. The pattern is ordinary in
shipped software rather than novel, which is the point: Airtable, Mixpanel, Hex, Profound, Deel,
Hotjar, Whop and Patreon all put column control and value filtering in or beside the header row of a
grid.

The persona claim holds up under measurement, too. A study of 21,398 entry-level job postings found
Excel named in 51–61% of those mentioning a spreadsheet, against 21–31% for Google Sheets, while
only 11–12% of postings asked for data analytics at all; and the standing estimate of the working
population is roughly 55 million people who use spreadsheets or databases against 13 million who
would call themselves programmers. The reason the idiom transfers is not habit but form — Nardi and
Miller's finding that *"the tabular format of the spreadsheet provides a clean and simple means for
constructing the data model"* is why people who will never write a query can build a large
spreadsheet. One caution against reproducing Excel wholesale: the same literature finds spreadsheet
fluency is shallow and error-prone, so the right move is to borrow the grid's affordances and not
its expressive freedom. **Serves G1 and G2**, and is the direction's strongest claim on "reduce
cognitive load".

### 4. The assistant acts on the grid and shows its working, which is the safest shape for an agent that edits your data

Every change the panel makes goes through the same `GridAction` reducer a person's clicks produce
(`grid-state.ts`) — the agent has no private route into the grid — and nothing lands until you press
Accept. Before you do, the proposal card names each step and previews the outcome as *"15 → 4
drugs"* (`AgentPanel.tsx`, `previewCount`); after you do, the steps tick one per reflow beat and the
card becomes a receipt with the row delta, the elapsed time and an Undo. A proposal made against a
grid that has since moved becomes stale and offers "Run again" rather than applying over the change.
This is close to a textbook reading of Horvitz's mixed-initiative principles, three of which it
satisfies almost line by line: *"minimizing the cost of poor guesses, including… natural gestures
for rejecting attempts at service"*, *"efficient means by which users can directly invoke or
terminate the automated services"*, and *"mechanisms for efficient agent–user collaboration to
refine results"*. Microsoft's later human-AI guidelines split the same principle into three, and the
panel meets all of them: invocation is a composer, dismissal is a button sitting beside Accept at
equal weight, and correction is the Undo on the receipt. The shape is well precedented in shipped
products too: Descript proposes a
whole plan behind one **Approve plan** button, Base44 shows a plan before **Start Building**, Asana
asks **Keep content / Replace with draft** before overwriting, Copy.ai's "Fix with AI" shows a
proposed transform over the rows before Import, and Lightfield ticks each step as it lands in the
CRM. **Serves G2 most directly** — cheap, reversible, legible refinement — and is the answer to
Neil's own criterion *"allow for quick AI editing [of] filters"*.

### 5. Column management the live product simply does not have

Nine columns shown of thirty-seven, each hideable, reorderable and pinnable, with the five real
attributes this sample carries but does not show listed alongside twenty-three the live product
holds and the sample cannot populate — disabled and labelled rather than quietly omitted
(`ColumnManager.tsx`, `data.ts` `unpopulatedAttributes`). Today it is eight locked columns and
twenty-eight you can only add. Reordering is a pair of chevrons rather than a drag handle, which is
fewer interactions in a fourteen-row list and does not lie about being draggable. Deel, Whop,
Patreon and Hotjar all ship this exact control. **Serves G2 and G3**, who are the ones who need a
column the default view does not carry.

### 6. Nothing is a mode, so refinement is free

There is no Apply, no overlay, no separate screen and no server round trip: ticking a value changes
the grid behind the open menu, the applied-filter bar keeps a removable pill per parameter, and the
whole state is one object a snapshot can restore. That removes at a stroke the two things Neil has
complained about in the incumbent — the fiddliness of working inside a modal, and losing context
when you cannot hold more than one thing open (`NEIL-LEDGER.md` §§2, 4). **Serves G2.**

---

## Cons

### 1. The cold start — Neil's own objection, and the build does not answer it

His sharpest criticism on 14 September was aimed at exactly this: *"if you look at the sidebar
example, I don't see how that quite works in that initial query point of view. So you start with the
data and you're manipulating your query off to the right-hand side."* It sits directly against his
own stated working model, quoted in his own words: *"Why do I need to see everything at the point
that I go in? I'm not interested in every drug out there. I want to set the criteria that then when
I hit the return key… it gives it to me… I rebranded it a screener."* (`NEIL-LEDGER.md` §6). And the
prototype, honestly read, sidesteps the problem rather than solving it: `seedThread()` in
`screens/Grid.tsx` opens the screen with three filters already applied by a pre-run assistant turn,
so **the one state a reviewer never sees is the cold start**. The direction's real first screen is
285,529 rows sorted by development stage, and there is no affordance on it that says "start here" —
the only cold-start move available is to guess which of nine visible column headers to open first.
**Fails G1**, which is 70% of queries, and G1 is the segment the metric is written for.

### 2. This is the pattern with the worst adoption record in the tool category he named it from

He recognised it immediately — *"Assistant, yeah. BI tools, things like that. Looker, yeah."* — and
that recognition cuts both ways, because the docked natural-language assistant beside a data view is
the most-tried and least-retained idea in business intelligence. Both dominant platforms have now
killed their first-generation version of it. Tableau's own help pages state that *"Ask Data and
Metrics features were retired in Tableau Cloud in February 2024 and in Tableau Server version
2024.2"*, and Microsoft's Power BI documentation now opens with *"Q&A experiences are going away in
February 2027."* Neither vendor published a usage figure; Tableau did ship an "Ask Data Usage"
admin dashboard, which tells you adoption was the open question. The reason is visible in what it
took to make them work: Power BI's Q&A needed a hand-authored *linguistic schema* — a `.lsdl.yaml`
grammar of synonyms and phrasings that Microsoft tells you to edit in VS Code with a YAML extension —
and even then *"multiple conditions aren't supported."* Gartner's 2021 Analytics and BI Hype Cycle
reached the same diagnosis for search-based NLQ generally: the mapping and modelling effort was too
high, so the questions supported were too basic to be useful or the answers were wrong.

Two pieces of newer evidence sharpen it for this specific design. First, the work does not go away,
it moves: a controlled study of twenty SQL-literate professionals found an LLM query interface about
31% faster but only **46% correct against 64%** for hand-written SQL, because *"the interface
reallocated the work of querying rather than removing it"* — users stopped navigating the schema and
started verifying that the generated query matched their intent. Second, and almost exactly this
screen: a mixed-methods study of twenty people across four industrial decision tasks found the
chatbot rated significantly *more useful* than the dashboard, and yet when the criterion was
**confidence, 100% favoured the dashboard and 0% the chatbot**. Several participants asked for both
at once. That is a strong argument for a docked assistant — but only one that writes its result into
the grid's own visible filter state, which is what this prototype does, rather than answering beside
the grid in prose. **The risk falls on G1**: if the assistant is the cold start and it is not
trusted, there is no cold start.

The panel also costs width, which matters more here than anywhere else. `AGENT_PANEL_WIDTH` is
`w-[380px]` (`AgentPanel.tsx`), so at the 1600px viewport the walkthrough was run on it leaves the
grid 1220px — a quarter of the horizontal budget spent on the surface meant to compensate for a grid
that is already too narrow. That is our own reasoning from the measurements rather than a client
complaint, and it is closable from the header, but the default state is the one that gets judged.

### 3. You can only filter on what is on screen, and the two most obvious cold-start fields cannot be filtered at all

Of the fourteen real columns, **eleven are filterable**; `Drug Name`, `Brand` and `NPV` have no value
list, so the most natural opening move in a drug database — name the drug — is not expressible from
a column header at all, and the global search in the chrome is presentational. Of the thirty-seven
attributes, nine are on screen, so filtering on any of the other twenty-eight costs a detour through
the Columns manager first (about three clicks) plus a horizontal scroll to reach the header you just
added. The Sort and Group menus in the toolbar list only visible columns (`GridToolbar.tsx`), so a
hidden attribute is invisible to every top-level control as well.

The cost of hiding navigation behind a menu has been measured. Nielsen Norman's study of 179
participants across six sites found *"a more than 20% drop in discoverability on sites with hidden
navigation"*, users *"at least 39% slower"* on desktop, and the hidden menus used in only 27% of
cases against 48–50% for visible navigation. Information foraging explains why: people judge where
to go from proximal cues, and a filter that lives inside a closed header menu emits none — a filter
on a column scrolled off the right-hand edge emits none twice over. The live product already proves
the failure mode in this exact place: its column-header funnel icons gave no response in three
separate attempts, a second filter system nobody has ever used. Idea 2's whole argument is the
opposite — that all twenty-seven attributes under Drugs should be visible and countable whether or
not they are in the grid. **Costs G1 most** — the quick screener has to know the taxonomy before the
interface will show it to them.

### 4. The Boolean model is the thinnest of the four directions, and G3 is the segment that pays most

`or` between values inside a column, `and` between columns, and nothing else (`data.ts`,
`FilterState`). No `NOT`, no `OR` across different attributes, no nesting, no grouping of clauses.
The assistant does not rescue it: `agent.ts` has no negation rule anywhere — the word "without" is
handled only as *remove a column* — so neither the grid nor the agent can express "phase III
oncology drugs **excluding** anything oral" or "(Roche **or** targets PD-1) **and** phase III". Neil
was explicit that this is where the money is: *"some of our biggest customers, power users, are
needing kind of the detailed Boolean builder,"* and *"the highest value users right now are the
people that are going to tailor it really precisely."* **Fails G3 outright.** Of the four
directions, this is the only one whose filtering model cannot be extended to full Boolean without
changing its central mechanic, because a column header menu has nowhere to put a clause.

### 5. Undo is whole-grid, and the panel says so

Undoing an agent turn restores a snapshot of the entire grid state, so it also reverts anything done
by hand in the column menus since (`grid-state.ts`; the tooltip reads *"Also reverts hand edits made
since."*). Disclosing it is right, and reversibility is the correct instinct — user control and
freedom is Nielsen's third heuristic, and a cheap undo is what makes an agent's mistakes affordable
rather than frightening. But a coarse undo is a worse bargain than it looks: after two or three
turns interleaved with hand edits, the only safe correction is to redo the hand edits, which is
exactly the work the assistant was supposed to remove. **Costs G2**, whose whole job is iterative
refinement.

### 6. Landing in 285,529 unfiltered rows is a cost with no offsetting benefit

The prototype's counters are honest about running on a 46-drug sample, but the production behaviour
is the thing being proposed: the first screen is every drug in the database. Users do not browse deep
into result sets — log analyses of close to a billion AltaVista and Excite requests put the share of
searchers who view only the first page of results at between 50% and 85%, and roughly 80% look at no
more than ten to twenty results — so an unfiltered list of 285,529 drugs is not a starting point
anyone reads. It is a starting point that has to be got rid of, and the first paint has to sort, page
and count a quarter of a million rows to produce it.

One honest counterweight, because it is the strongest thing that can be said for this sequence:
Shneiderman's visual-information-seeking mantra is *"overview first, zoom and filter, then
details-on-demand"*, and landing in the whole grid is literally the overview step — as is the
receipt-and-undo thread, since "keep a history of actions to support undo, replay, and progressive
refinement" is one of the same seven tasks. The rebuttal is that 285,529 rows at ten to a page is
not an overview of anything; it is the absence of one. An overview of this corpus would be its
shape — how many drugs per phase, per therapy area, per company — which is what Idea 2's counted
attribute columns give you and what this screen does not.

---

## Against the metrics

Counted from the prototype code — `ColumnHeaderMenu.tsx`, `ColumnManager.tsx`, `AgentPanel.tsx` and
`screens/Grid.tsx` — not estimated. The baseline from `PLATFORM-WALKTHROUGH.md` is **12 interactions
(10 clicks + 2 typed strings)** from landing to a two-attribute, four-value result set, at roughly
**three clicks per filter parameter** plus one blind six-second commit.

### G1 — a quick screen, three fields or fewer

Worked example: *oncology, phase III, given intravenously*. All three columns are in the default
nine, so no column has to be added.

**By hand, from a cold grid**

| # | Interaction |
|---|---|
| 1 | Click the **Therapy Area** header |
| 2 | Tick *Oncology* |
| 3 | Click the **Development Stage** header (dismisses the first menu and opens this one in one click) |
| 4 | Tick *Phase III* |
| 5 | Click the **Route of Administration** header |
| 6 | Tick *Intravenous* |
| 7 | `Esc` or click away to close the last menu |

**6 clicks and one dismissal, no typing, no commit step, and the row count is correct after every
one of them.** The prototype's own seeded query — two therapy areas, two stages, two routes — is 9
clicks plus the dismissal on the same pattern. Against the live product's 12 interactions for a
smaller query, that is a genuine halving, and it is the same two-clicks-per-parameter cost as Idea 2.

**Through the assistant**

| # | Interaction |
|---|---|
| 1 | Type the sentence and press Enter (one typed string) |
| 2 | Click **Accept** |

**2 interactions**, or 2 clicks if the request happens to match one of the three suggestions shown
above the composer. This is the fastest cold start of any of the four directions apart from Idea 3's
single sentence, which has no Accept step — and unlike the header menus, the assistant *can* set a
filter on a column that is not on screen, because `setFilter` operates on the data rather than on the
view.

### G3 — a deep Boolean query

Worked example, of the kind Neil describes his largest accounts building: *phase III or
pre-registration oncology or immunology drugs, excluding anything oral, from Roche or Novartis.*

| Clause | Can this direction express it? |
|---|---|
| Development Stage is Phase III **or** Pre-registration | Yes — 3 clicks |
| Therapy Area is Oncology **or** Immunology | Yes — 3 clicks |
| **and** between those two columns | Yes, implicitly — 0 clicks |
| Company is Roche **or** Novartis | Yes — 3 clicks |
| **not** Route of Administration is Oral | **No.** No negation in the filter model and no negation rule in the agent |
| **or** across two different attributes (e.g. Roche *or* targets PD-1) | **No.** `or` exists only inside one column |

**9 clicks gets four-sixths of the query; the last two clauses cannot be built at any number of
clicks.** The honest count for G3 is therefore not a number — it is that the query has to leave the
interface. There is no advanced mode to fall through to, and nowhere in the direction that can hold
a clause; the live product, for all its faults, puts AND / OR / NOT radio pairs between attribute
groups and can express both of the rows this cannot.

### What starting from 285,529 rows costs

Three things, stated plainly. **A wasted first screen**: the opening state is every drug in the
database, sorted by development stage, which nobody asked for and which the user's first action is
to destroy. **A guess about where to start**: nine column headers, eleven filterable attributes
behind them and twenty-eight more hidden, with no ranking of the common few — and the walkthrough
found the same failure on the live product, where all twenty-seven attributes are presented as
equals. **A rendering bill**: first paint has to count and page a quarter of a million rows before
anything useful appears, which is the opposite of the "speed of access" measure. Set against that,
the count is *correct and visible from the first frame* rather than after a six-second blind commit,
which is worth something — but it is worth less than a first screen that asks what you are screening
for.

---

## The cold-start gap, and what would close it

The grid redesign is this direction's real contribution and it is orthogonal to the filtering model.
The objection is entirely about sequence: the interface never asks what you are screening for. That
is closable without touching the grid, and the fix is one screen and one component rather than a
rebuild.

**1. Open on a screener overlay, over the grid, not instead of it.** The first thing on screen is a
single natural-language field — *"What are you screening for?"* — floating over the grid, which is
visible and dimmed behind it with its live total. Typing is optional; `Esc` or "Browse all 285,529
drugs" dismisses it into the grid as it works today. This costs the direction nothing it currently
has and answers the literal objection: the sequence becomes criteria first, results second, which is
Neil's own stated model. It is Idea 3's on-ramp borrowed as a door rather than as a whole interface.
The field must not be a blank box: the documented failure of natural-language interfaces is
discoverability — knowing how to phrase the thing — and the researched fix is to seed the field with
real example utterances so the phrasings the system supports are learned by reading rather than
guessed (Srinivasan and Setlur's *Snowy*, UIST 2021). The panel already computes exactly this: its
Suggestions are filtered to prompts that would actually change the grid as it stands
(`AgentPanel.tsx`). Move three of them under the opening field, phrased against the taxonomy —
*"Phase III oncology drugs in Europe"* — and the cold start teaches itself.

**2. Resolve the sentence into the grid's own controls, not into a private query object.** The
assistant already does exactly this — `respond()` returns `GridAction`s, the same ones a click
produces — so the opening sentence should land as applied-filter pills in the bar under the toolbar,
each one openable into the column menu that owns it. The user sees their sentence turn into
tickboxes they recognise, which is the hand-off Neil said he had not been shown: *"I'd want to see
how that flips then into the power user view."* Nothing new is needed in the state layer; the work is
routing the first turn through the same reducer and showing the pills.

**3. Make the sentence add columns as well as filters.** Filtering on an attribute that is not one of
the nine visible columns should bring that column into the grid. `structuralReply` already does this
for grouping and aggregates — it emits an `addColumn` before a `setGroup` — and extending the same
rule to `filterReply` removes the direction's sharpest structural con, that you can only filter on
what you can see. A filter the user cannot see is worse than a column they did not ask for.

**4. Put the Boolean depth in the pills, not in the headers.** A column header menu has nowhere to
put a clause, and that is why G3 fails here. But the applied-filter bar does: each pill is already a
column plus a set of values, which is one attribute group. Give a pill three things — an
include/exclude toggle (the `negative` tone already exists in the design system for exactly this),
an `and`/`or` control between adjacent pills, and the ability to hold two pills as one bracketed
group — and the direction gains `NOT`, cross-attribute `OR` and one level of nesting without adding a
screen. That is the same expressive ceiling the live screener reaches with its AND/OR/NOT radio pairs
between attribute groups, and it keeps the header menus doing the one job they are good at: picking
values with counts.

**5. Keep the assistant, but demote it to a refiner.** With a cold-start field at the front, the
docked panel stops carrying the query and starts carrying what it is genuinely good at — "add the
NPV column", "group by company", "show me only the ones in Europe", each proposed, previewed and
undoable. That is G2 work, which is where every shipped BI assistant that has survived has ended up:
acting on a view the user already has, rather than producing the view from nothing. Pipedrive's
Insights AI is the cleanest shipped example — the chat produces a report, and the report's filter
conditions sit beside it as an editable `field / condition / value` row with `+ Add condition`, so
the natural-language turn and the structured builder are two views of one object.

Taken together that is the fusion Neil asked for and has not been shown: a natural-language on-ramp
for the 70%, the same sentence landing as structured, editable filter pills for the 30% who refine,
and Boolean depth in those pills for the 10% who need it — with the grid redesign underneath all
three, unchanged.

---

## Verdict

The grid redesign is the most valuable single artefact in Sprint 3 and should be adopted whichever
filtering model wins; the results-first *filtering* model, as built, fails the cold start the client
named and cannot express the Boolean depth his highest-value customers pay for — so the direction
should continue only with a screener on-ramp bolted to its front and Boolean logic moved into the
applied-filter pills.

---

## Sources

### Repository and prototype

- `src/flows/sprint-3/idea-4/` — the prototype. Click counts taken from `ColumnHeaderMenu.tsx`,
  `ColumnManager.tsx`, `GridToolbar.tsx`, `AgentPanel.tsx`, `grid-state.ts` and `screens/Grid.tsx`.
- `docs/sprint-3/decks/CLIENT-BRIEF-14-SEP.md` — the 14 Sep review; the G1/G2/G3 segmentation, the
  "what good looks like" measures and the fusion question.
- `docs/sprint-3/research/NEIL-LEDGER.md` — §1 results grid, §5 AI and natural language, §6 the
  unresolved screener question, §7 the Excel-habituated persona, §9 the four evaluation criteria.
- `docs/sprint-3/research/PLATFORM-WALKTHROUGH.md` — the 12-interaction baseline, the 1600px
  horizontal scroll, merged rows, the eight locked columns and the dead column-header funnel.
- `sprints/sprint-3/ideas/IDEA-4-SIDEBAR-AGENT-{EXPLAINER,EVIDENCE}.md`.

### Mobbin — shipped precedent

**Docked assistant beside a data grid**

- [Clay](https://mobbin.com/screens/7480cd83-a6b3-4782-9898-70b0fbc92229) — assistant docked left of
  a working table, with Build and Analyze modes acting on the table itself.
- [Airtable](https://mobbin.com/screens/8ada7206-8853-4f9d-afeb-5019f5496d1b) — AI panel beside a
  grid view that carries Hide fields, Filter, Group, Sort as its own toolbar.
- [Twenty](https://mobbin.com/screens/4c690377-c1a0-4f68-a668-8ece2212ad35) — "Ask AI" docked right
  of a 230-row companies table.
- [Rows](https://mobbin.com/screens/523485e2-8aab-4629-b656-ef9d9755c013) — "AI Analyst" docked
  right of spreadsheet tables with per-column filter carets.
- [Databricks](https://mobbin.com/screens/431debbd-1d18-4605-b40c-d6ceb5733be5) — Assistant in chat
  mode beside a notebook and its result table.
- [Basedash](https://mobbin.com/screens/d70088d0-09ff-472b-9bb6-ef9a6d0ef8c2),
  [Amplitude](https://mobbin.com/screens/e1856900-5667-4ff3-8e7e-1526f649ad49) and
  [Mixpanel Spark](https://mobbin.com/screens/bb8d51bf-89ec-4770-bcaf-ec45a0d00278) — the same
  pattern in analytics tools, which is the family Neil recognised it from.

**Agent proposes, user accepts**

- [Descript](https://mobbin.com/screens/d7b719a7-32f8-4ca8-b589-89aaf5facec2) — a full plan of
  numbered steps behind one **Approve plan** button.
- [Base44](https://mobbin.com/screens/1af86cad-8541-40c6-9999-c6d7e4147660) — a Plan card with
  **Start Building** before anything is built.
- [Asana](https://mobbin.com/screens/a7c7d26a-be3a-4cfa-aef0-8c5688f18034) — **Keep content /
  Replace with draft** before an AI draft overwrites existing content.
- [Copy.ai](https://mobbin.com/screens/9219efd5-d402-49e8-8109-1f62da887c04) — "Fix with AI" shows
  the proposed transform over the rows, with Import as the commit.
- [Lightfield](https://mobbin.com/screens/99d01dcd-a6c6-4a51-8e61-b202b1fe08af) — steps ticking as
  they land in the CRM, with an error state surfaced in the thread.

**In-grid column filtering and column management**

- [Profound](https://mobbin.com/screens/62f39246-9a09-471a-ab70-0abd3d3fce2c) — searchable checkbox
  value list in a header menu, with Group by and Customize Columns beside it.
- [Mixpanel Lexicon](https://mobbin.com/screens/a5b0c21b-f7e3-4fdb-bf97-22fcb90c5302) and
  [Hex](https://mobbin.com/screens/b4a98dec-3dde-452b-8198-7581b6654778) — value pickers opened from
  the column header itself.
- [Deel](https://mobbin.com/screens/6acab441-2244-43e6-a6f8-e4215a179b0b),
  [Whop](https://mobbin.com/screens/3e10c98f-7c68-4fbf-9efa-da729b55834c),
  [Patreon](https://mobbin.com/screens/7e11b1ba-e9e5-4596-a7fa-b801babb0b16) and
  [Hotjar](https://mobbin.com/screens/5888d91a-00d9-4a5a-a804-b0e02db0b32c) — "6 / 21 selected"
  column managers of exactly the kind the live product lacks.

**The fusion, already shipped**

- [Pipedrive Insights AI](https://mobbin.com/screens/2f13cf32-e76e-4b5a-b52a-036dea6e3bb5) — an AI
  chat on the left and the structured filter it produced on the right, as an editable
  `field / condition / value` row with **+ Add condition**, Cancel and Save.
- [Seline](https://mobbin.com/screens/20b4d15f-de9b-4064-a1c8-3a18a1197b72) — a composer pre-filled
  with bracketed slots — *"Help me filter the dashboard. I want to see: [all my blog posts] [traffic
  from GPT]"* — which is a cold start that teaches the query shape rather than an empty box.
- [TravelPerk](https://mobbin.com/screens/0ba9eaf0-66bc-42ea-a351-f395c04a7c09) — a natural-language
  field with "Popular topics" chips underneath it as the cold-start affordance.

### Published research and industry record

**Conversational analytics, retired and re-scoped**

- Tableau help, *Ask Data* — *"Tableau's Ask Data and Metrics features were retired in Tableau Cloud
  in February 2024 and in Tableau Server version 2024.2."*
  https://help.tableau.com/current/pro/desktop/en-us/ask_data.htm — and the admin usage view that
  existed to measure it: https://help.tableau.com/current/server/en-us/adminview_ask_data_usage.htm
- Tableau help, *Ask questions with Tableau Agent in Pulse* — the replacement answers only within a
  curated metric framework and *"can't answer questions about columns that aren't used in the
  metrics or metadata"*; users are told to cross-check every insight.
  https://help.tableau.com/current/online/en-us/pulse_ask_discover_qa.htm
- Microsoft Learn, *Q&A limitations* — *"Q&A experiences are going away in February 2027."* Also the
  fixed, tiny grammar of teachable filter phrasings and *"multiple conditions aren't supported."*
  https://learn.microsoft.com/en-us/power-bi/natural-language/q-and-a-limitations
- Microsoft Learn, *Q&A linguistic modelling* — the `.lsdl.yaml` linguistic schema, and the
  instruction to install VS Code and a YAML extension to edit it.
  https://learn.microsoft.com/en-us/power-bi/natural-language/q-and-a-tooling-advanced
- Google, *Looker Conversational Analytics* — Gemini *"can generate output that seems plausible but
  is factually incorrect"*; a 50,000-row ceiling; and the positioning that the conversation is only
  as trustworthy as the LookML semantic layer beneath it.
  https://docs.cloud.google.com/looker/docs/conversational-analytics-overview and
  https://cloud.google.com/blog/products/business-intelligence/looker-conversational-analytics-now-ga
- Gartner's 2021 Hype Cycle for Analytics and BI on search-based NLQ — the mapping and modelling
  effort was too high, so supported questions were too basic or answers inaccurate. Quoted at one
  remove through a vendor blog; the Gartner document itself is paywalled and was not read.
  https://www.yellowfinbi.com/blog/why-natural-language-query-nlq-didnt-take-off

**What natural language to data actually costs the user**

- *An LLM query interface versus SQL*, 20 SQL-literate professionals — ~31% faster, 46% correct
  against 64%; *"the interface reallocated the work of querying rather than removing it."*
  https://arxiv.org/abs/2511.14718
- *Conversational agent versus dashboard*, n=20 across four industrial decision tasks — the chatbot
  significantly more *useful* (p=0.0038), and 100% of participants more *confident* with the
  dashboard. https://arxiv.org/abs/2605.31224
- Spider 2.0 — the best model solves **21.3%** of enterprise text-to-SQL tasks against 91.2% on
  Spider 1.0 and 73.0% on BIRD. https://arxiv.org/abs/2411.07763
- BEAVER, drawn from private data warehouses — state-of-the-art agentic frameworks reach **10.8%**,
  rising to 30.1% with oracle hints at every subtask. https://arxiv.org/abs/2409.02038
- BIRD leaderboard — human experts 92.96%, best system 82.39% (Aug 2026), on the easier benchmark.
  https://bird-bench.github.io/
- Srinivasan and Setlur, *Snowy* (Tableau Research, UIST 2021) — discoverability, "knowing how to
  phrase input utterances", is the persistent barrier, and utterance recommendations are the fix.
  https://arxiv.org/abs/2110.04323
- Austin Z. Henley, *Natural language is the lazy user interface* — *"It puts all the burden on the
  user to articulate good questions."* https://austinhenley.com/blog/naturallanguageui.html

**Mixed initiative — what a proposing agent owes the user**

- Horvitz, *Principles of Mixed-Initiative User Interfaces*, CHI 1999 — principle 6 (*"efficient
  means by which users can directly invoke or terminate the automated services"*), principle 7
  (*"minimizing the cost of poor guesses… natural gestures for rejecting attempts at service"*),
  principle 9 (*"efficient agent–user collaboration to refine results"*).
  https://www.microsoft.com/en-us/research/wp-content/uploads/2016/11/chi99horvitz-1.pdf
- Amershi et al., *Guidelines for Human-AI Interaction*, CHI 2019 — G7 invocation, G8 dismissal, G9
  correction, as three separate obligations.
  https://www.microsoft.com/en-us/research/wp-content/uploads/2019/01/Guidelines-for-Human-AI-Interaction-camera-ready.pdf
- Shneiderman and Maes, *Direct Manipulation vs. Interface Agents*, Interactions 1997 — the
  responsibility argument, and Maes conceding that *"the most successful interfaces are the ones
  where the agents are pretty much invisible."*
  https://www.cs.umd.edu/~ben/papers/Shn-Maes-v4n6-1997.pdf
- Nielsen, *User control and freedom* — undo as the thing that makes exploration affordable.
  https://www.nngroup.com/articles/user-control-and-freedom/

**Counts, discoverability and where a filter should live**

- Greene, Tanin, Plaisant, Shneiderman et al., *The end of zero-hit queries: query previews for
  NASA's Global Change Master Directory*, Int. J. Digital Libraries 1999.
  https://link.springer.com/article/10.1007/s007990050039 — project page, with the problem stated as
  users who *"waste time posing queries that have zero-hit or mega-hit result sets"*:
  https://www.cs.umd.edu/hcil/eosdis/
- Hearst, *UIs for Faceted Navigation: Recent Advances and Remaining Open Problems*, HCIR 2008 —
  preventing empty result sets as a stated goal, and the tradeoff that showing counts *"is
  potentially confusing… when disjunctions are allowed."*
  https://people.ischool.berkeley.edu/~hearst/papers/hcir08.pdf
- Hearst, *Search User Interfaces*, ch. 8 — facet counts as *"query previews"*.
  https://searchuserinterfaces.com/book/sui_ch8_navigation_and_search.html
- Nielsen Norman Group, *Hamburger menus and hidden navigation hurt UX findability* — 179
  participants, *"a more than 20% drop in discoverability"*, 39% slower on desktop, hidden menus used
  in 27% of cases against 48–50% for visible navigation.
  https://www.nngroup.com/articles/hamburger-menus/
- Pirolli and Card, information foraging and information scent — proximal cues as the basis for
  judging where to go. https://www.nngroup.com/articles/information-foraging/ (primary:
  https://doi.org/10.1037/0033-295X.106.4.643)
- Shneiderman, *The Eyes Have It*, IEEE VL 1996 — *"overview first, zoom and filter, then
  details-on-demand"*, with History/undo as one of the seven tasks.
  https://www.cs.umd.edu/~ben/papers/Shneiderman1996eyes.pdf
- Jansen and Spink, *An Analysis of Document Viewing Patterns of Web Search Engine Users* — 85.2% of
  1998 AltaVista queries and 72.8% of 2002 queries produced a single results-page view.
  http://www.bernardjjansen.com/uploads/2/4/1/8/24188166/jansen_web_mining.pdf

**The Excel-habituated persona**

- Rebman et al., *An Industry Survey of Analytics Spreadsheet Tools Adoption*, ISEDJ 21(5), 2023 —
  21,398 job postings; Excel named in 51–61% of spreadsheet-mentioning postings against 21–31% for
  Google Sheets. https://files.eric.ed.gov/fulltext/EJ1409034.pdf
- Scaffidi, Shaw and Myers, *Estimating the Numbers of End Users and End User Programmers*, VL/HCC
  2005 — ~55 million spreadsheet and database users against ~13 million self-described programmers.
  http://www.cs.cmu.edu/~Compose/eu_20050923_vlhcc.pdf
- Nardi and Miller, *Twinkling lights and nested loops*, IJMMS 1991 — *"the tabular format of the
  spreadsheet provides a clean and simple means for constructing the data model."*
  https://www.miramontes.com/writing/twinklinglights/

### Not verified, and therefore not leaned on

Hearst's 2006 SIGIR workshop paper is live at
https://flamenco.berkeley.edu/papers/faceted-workshop06.pdf but its text could not be extracted, so
the faceted-search claims above rest on the 2008 paper and the book chapter instead. No vendor has
published a usage figure for Ask Data or Power BI Q&A, so the retirement is the evidence, not a
number. The Gartner Hype Cycle wording is quoted at one remove through a vendor blog. ThoughtSpot's
adoption percentages are vendor PR and are deliberately not cited. Pirolli and Card's and
Marchionini's primary texts are paywalled and were read through secondary sources.
