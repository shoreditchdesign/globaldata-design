# Idea 2 — Miller Columns: pros and cons

Written against the measures Neil gave us on 14 September — number of clicks, speed of access, 70%
of queries reachable in three or fewer terms — and against the three goals those measures serve:
**G1 quick screen** (the ~70% majority), **G2 refine** (power users adjusting a list that is nearly
right), **G3 deep Boolean** (~10% of refined queries, from the largest accounts). Everything
numbered below is counted off the prototype's own code, in
`src/flows/sprint-3/idea-2/`, and says so where it is.

This is the direction with the widest gap between what the client felt and what we felt. He was
drawn to it more than to any other — *"in your three-column one, I can see how I get the power
view… I see what I'm trying to filter for, I use my real estate to help me filter"* — and in the
same breath named its one fatal problem: *"it's lost the quick onboarding. How do I get that
initial query done?"* We were the opposite: it was the one the team felt least confident in, the
most overwhelming, the least clear about what the steps are, and the closest to what GlobalData
already ships. Both readings are correct, and they are about different halves of the same screen.
Neil's own resolution is the one to hold on to: *"if this was the only interface, I'd go,
absolutely don't want this… but we've not iterated the fusion of this style of interface with AI."*

## What it is

The filter taxonomy stops being a tree you go down and becomes a set of columns you go sideways
through. Pick a filter area, and its attributes open in a column beside it; pick an attribute, and
its values open in a column beside that; pick a value that has anything underneath it — a therapy
area, a region — and its indications or countries open in a third. Nothing is ever replaced, so the
path you took stays on screen and two branches stay open at once. Three columns are the most the
screen shows, and everything to the left of them folds into a live breadcrumb you can click to
slide back. Every row in every column carries the number of drugs it would leave you with, counted
against the filters you have already applied, so you can see what a click will cost before you
spend it. The results table sits beside the panel and reflows on the same tick — there is no Search
button and no waiting. At the foot of the panel is a composer where you can ask for a set in plain
English; the agent then drives the same columns you were using, one step at a time, in view, each
step individually undoable, and stops the moment you touch anything yourself.

## Pros

**1. The path stays on screen, which is the complaint it was built to fix — G2, G3.**
Neil has rejected linear accordion trees twice: *"sections upon sections upon sections, and then
you have to go up and close them all to go anywhere"* (13 Aug) and *"on the trees I lose the
context, I can't have multiple things open at the same time"* (2 Sep). Miller columns exist for
precisely that: the pattern has held since Mark Miller's 1980 browser through the NeXTSTEP File
Viewer to Finder's column view, and its documented advantage is showing several levels of a
hierarchy and your position in it simultaneously
([Miller columns](https://en.wikipedia.org/wiki/Miller_columns)). The live GlobalData screener
fails here in exactly the way he described — switching attribute wipes the middle pane, per
`docs/sprint-3/research/PLATFORM-WALKTHROUGH.md` — and in this prototype nothing is ever wiped:
`FilterPanel.tsx` appends a column per level and `useScreener`'s `leftIndex` only changes which
window of them you are looking at.

**2. Counts on every row turn guessing into reading — G1, G2, G3.**
Every attribute row carries how many distinct values it can still split the set into, and every
value row carries how many drugs it would leave; both are recomputed against the current query by
`facetCounts` and `attributeSplit` in `data.ts`, with the facet counts measured with that
attribute's own condition lifted, which is the correct way to count a facet. This is the single
highest-impact thing a filter UI can do — Baymard puts live per-option result counts in exactly
those terms, alongside avoiding options that would return zero
([Baymard, ecommerce filter UI](https://baymard.com/learn/ecommerce-filter-ui)). It is the standard
in the B2B data products GlobalData competes with — Apollo's Find People carries a facet rail with
per-filter counts beside a sortable results table, Indeed's Smart Sourcing shows a live match count
against its facets — and it is what information-foraging theory calls scent: a visible cue telling
you whether a branch is worth the walk before you commit to it
([NN/g on information foraging](https://www.nngroup.com/articles/information-foraging/); Pirolli &
Card, *Information Foraging*, Psychological Review 106(4), 1999). The live product has no count on
the filter
screen; you commit, wait about six seconds, and only then find out whether you made 12 rows or
12,000.

**3. No commit, so the cost of being wrong is one click — G2.**
`ResultsPane` reads `screener.rows` straight off `matchingRows(filters)`, so the headline count,
the per-value counts, the pills and the table are all derived from one array and cannot disagree.
Tick, and the answer moves in the same tick; untick, and it moves back. Against the baseline — a
~6-second blind server round trip per query, per the walkthrough — refinement stops being a
transaction and becomes a conversation with the data. This is what G2 is: *"that's not quite what I
wanted, let me tailor that precisely."*

**4. The filter surface is independent of the results grid — G2, G3.**
The screen arrives filtered on molecule type, and molecule type is in no column of the table. Take
the pill off and the count climbs while the columns stay put. That is a real capability and it is
the line between this direction and Idea 4, where an attribute has to be displayed before it can be
filtered on — and the live grid can only ever get wider, 36 columns with the default 8 locked on.
The 15 attributes in the column (`drugAttributeOrder`) are an inventory of the data model, browsable
before you know what you want, which is the recognition-over-recall case: *"minimize the user's
memory load by making elements, actions, and options visible"*
([NN/g heuristic 6](https://www.nngroup.com/articles/ten-usability-heuristics/)).

**5. The agent drives the interface rather than replacing it — G1 on-ramp, G2 hand-off.**
Ask for a set in the composer and the columns travel to each attribute, values tick on one at a
time, the pills appear and the count falls — the same state a click drives, not a parallel one.
Every step is listed and individually undoable, and touching any control stops the run and hands
back (`yieldToUser` in `use-screener.ts`). It is a pattern shipping products have converged on:
Notion's AI Autofill fills the visible table cells rather than answering about them, Databricks'
Assistant writes cells into the notebook with accept or reject on each, Pipedrive's Insights agent
builds the actual filter condition and chart in the report panel beside the chat, and Clay's
Sculptor turns an instruction into real, hand-editable filter chips in the rail to its left. It is
also the most defensible shape for an agent inside a paid data product, because the reviewable
middle ground is what produces well-calibrated trust: a controlled study of text-to-SQL explanation
transparency found medium-transparency explanations produced better-calibrated reliance than either
opaque or fully-exposed ones ([arXiv 2410.16283](https://arxiv.org/html/2410.16283)), and NN/g
still lists how interface features shape trust in generative systems as an open question rather
than a settled one
([NN/g, research agenda for generative AI in UX](https://www.nngroup.com/articles/genai-ux-research-agenda/)).
It answers half of what Neil liked out loud: *"your fusion of natural language and dropdown… and
collapsing them back."*

**6. It is the shape he asked for, and the shape his clients have asked for — all three.**
*"Do we maybe make this a full-screen takeover?"* (2 Sep) and *"we've finally seen the pullout from
the left, the sightline style options, which our clients have given us feedback on"* (14 Sep). Our
own reservation — that it is closest to what GlobalData already ships — cuts the other way for
adoption: an analyst who lives in the current screener loses nothing and gains counts, persistence
and a live total. That is worth saying plainly rather than treating familiarity as a defect.

## Cons

**1. There is no cold start. This is the one that matters — G1, and G1 is 70% of the traffic.**
His words: *"it's lost the quick onboarding. How do I get that initial query done?"* Read the
screen as a first-time user and he is right. The panel opens on an inventory of 15 attributes and
asks you to know which one you want, and the only route in is to recognise a label. The composer
that would let you say what you want in one line is at the *foot* of the panel, below three
columns of taxonomy — the last thing you reach rather than the first, and `AgentFoot.tsx` puts it
there deliberately, under the columns it drives. For a user whose whole query is three fields, the
ordering is backwards: the slow instrument is in front of them and the fast one is below the fold
of their attention. Everything in the prototype's own copy reinforces it — the composer's
suggestions read as examples of what the agent can do, not as a way to start.

**2. Our own reservation, honestly: the steps are not named anywhere — G1, and it costs G2 too.**
The team's read was that it is the most overwhelming direction and the least clear about what the
user is meant to do, and the code shows why. Nothing on screen sequences the task. There is no
"start here", no step count, no distinction between the column you navigate with and the column you
tick in other than the shape of the control in the lead lane. A first-time user cannot tell from
looking that clicking an attribute name opens a column, that clicking a value's checkbox puts it in
the query, and that clicking the rest of that same value row drills into it instead — three
outcomes across two kinds of row, decided by which pixel you hit (`ColumnItem` in
`MillerColumn.tsx`). That is learnable in
thirty seconds and invisible in the first five, which is exactly the wrong distribution for a
majority use case measured in clicks and speed of access. Progressive disclosure is the standard
answer — defer the rarely used to a second surface and make the route to it obvious
([NN/g](https://www.nngroup.com/articles/progressive-disclosure/)) — and this direction currently
discloses everything at once.

**3. The prototype understates the volume the client was worried about — all three.**
The attribute column holds 15 attributes; the live product has about 27 under Drugs alone, plus
two contextual sub-headings. The therapy-area column holds 13 areas; the live tree opens on 24 with
expand chevrons and goes deeper underneath. So the demo is running at roughly half the density of
the real thing, and the bet this direction makes — that horizontal depth is different in kind from
vertical depth — has not actually been tested at full size. If Neil's *"the overwhelming amount of
stuff that we've got might overwhelm that UI"* was about volume rather than axis, three dense
columns will feel exactly as heavy as the tree did. The pattern's own documented failure mode
agrees: column browsers suit broad hierarchies, but deeper navigation means more columns in the
same width until each is too narrow to read and the strip scrolls sideways
([Miller columns](https://en.wikipedia.org/wiki/Miller_columns)).

**4. Three columns is a claim the screen usually cannot honour — G2, G3.**
`FilterPanel.tsx` sets `THREE_COLUMN_MIN_WIDTH = 1880`; below that the panel shows **two** columns,
not three. On the 1440px review viewport — and on any laptop — the thing Neil praised as *"your
three-column one"* renders as two columns plus a breadcrumb. Miller columns spend width, and this
layout gives them half the window (`w-[50%]`, floor 522px) while the results table takes the other
half. The trade is real and unresolved: a third column costs the table its readability, which is
the complaint that started all of this (*"the grid falls off the side of the screen"*).

**5. The Boolean ceiling is the incumbent's ceiling, so G3 is not actually served — G3, the
highest-value segment.**
This is the most important finding in the code. `matchingRows` in `data.ts` is
`rows.filter(row => filters.every(...))` — attributes are hard-ANDed. Within one attribute you get
`or` or `and`, and per attribute you get `is` or `is not`. So `(a OR b) AND (c OR d) AND NOT e` is
expressible and **cross-attribute OR, grouping and nesting are not** — which is precisely the limit
the live platform has today, documented in the walkthrough. For the users Neil describes as
*"our biggest customers, power users… coming to us to get that level of granularity"*, this
direction currently offers a nicer way to build the same queries they can already build, not a
deeper one. There is also a live footgun: the pill bar offers `and` between values of a
single-valued attribute such as Development Stage, and choosing it silently returns zero rows,
because no drug is in two phases at once.

**6. It is a desktop file-manager idiom with almost no shipped web precedent, and the prototype has
not collected what makes it fast on the desktop — G2, G3.**
A search of Mobbin's index across file managers, cloud storage, CMS, BI and data tools turned up no
shipped web product using a true cascading column browser; the nearest neighbours — Hex's data
browser, Dropbox's folder rail, GitHub's file browser — are all single-pane trees. Web products
have converged on tree rails and facet panels instead, and the fact that they did is worth taking
seriously rather than reading as an opportunity. What makes the pattern work where it does survive
is keyboard traversal, and there are no key handlers anywhere in this direction (`grep onKeyDown`
across `src/flows/sprint-3/idea-2/` returns nothing), so every move is a mouse move. The live
product's own tree chevrons are unreachable by keyboard too, so this is not worse than the
baseline — but it is the pattern's stated advantage, unclaimed.

## Against the metrics

Counted by hand off the prototype's interaction model — `ColumnItem` in `MillerColumn.tsx` decides
what a click on a row does; `ResultsPane` derives the count and table from `screener.rows` with no
commit step; `AppliedPills` owns the `is`/`is not` and `or`/`and` menus. These are click counts for
a person who already knows the taxonomy; a first-time user's cost is reading, and that is con 1.

**G1 — a representative three-field screen.** Dermatology, Phase III, Europe, from an empty query:

| # | Click | What it does |
|---|---|---|
| 1 | `Therapy Area / Indication` | opens the value column |
| 2 | Dermatology's checkbox | ticks it into the query |
| 3 | `Development Stage` | opens the value column |
| 4 | `Phase III` row | ticks it (leaf rows tick from anywhere on the row) |
| 5 | `Drug Geography` | opens the value column |
| 6 | Europe's checkbox | ticks it |

**Six clicks, no typing, no commit, and the count is correct after every one of them.** A fourth
value is a seventh click. From the prototype's loaded state add one click for `Clear all`. Against
the measured baseline — roughly 3 interactions per parameter plus Search, 13–16 clicks and one
~6-second blind round trip for 3–4 parameters — this is a little over half the clicks and none of
the waiting. Against G1's real bar, though, it is six clicks and three acts of recall versus the
single sentence Neil thinks would answer ~70% of queries.

Via the composer instead: **two clicks** — one to fill the field from a suggestion, one to send —
and the run takes about **4.7 seconds** (`NAVIGATE_MS` 520 plus `TICK_MS` 380 per value, over the
four authored steps). That is deliberate pacing so you can watch the columns move, and it is worth
noticing that it currently costs about as long as the blind wait it replaces. It is visible and
interruptible, which the wait is not, but it should be tuned. One caveat for the demo: only one
request is wired, so the two-click route exists in the prototype for that sentence alone, and the
Send button disarms if the line is edited.

**G3 — a representative Boolean query.** The wired example, built by hand: anti-inflammatories in
Phase II or later, excluding Austria and Italy.

| # | Click | What it does |
|---|---|---|
| 1–2 | `Drug Descriptor` → `Antiinflammatory Therapy` | one attribute, one value |
| 3–6 | `Development Stage` → Phase II, Phase III, Phase IV | three values, OR'd within the attribute |
| 7–8 | `Drug Geography` → Europe | drills to the country column |
| 9–10 | Austria, Italy | two checkboxes |
| 11–12 | `Drug geography is` in the pill bar → `is not` | flips the clause to an exclusion |

**Twelve clicks, no typing.** The agent does the same query in two clicks. Both routes land on the
same
filter state, which is the direction's best structural property. What neither route can express is
a cross-attribute `OR`, so the query beyond this one — the actual G3 query — has no path through
this screen at all.

## The cold-start gap, and what would close it

The gap is not that the direction lacks natural language. It has a composer, and the composer
already drives the real controls. The gap is **position, priority and scope**: the composer is at
the bottom of the panel, it reads as an assistant for people who already understand the columns,
and it is one wired sentence rather than a way in. Four changes would close it without touching
anything Neil liked.

**1. Move the ask to the top and make it the empty state.** With no filters applied, the panel
should open on one line — *"Describe the set you want"* — with the columns present but quiet
beneath it. The moment a query exists, whether typed or clicked, that line shrinks to a persistent
composer and the columns take the room back. Nothing is removed: the attribute inventory Neil
praised is still there, still browsable, still the thing he can see himself filtering with. It is
simply no longer the first decision a new user has to make. This is straight progressive
disclosure, and it is the only change of the four that is purely a layout move. Indeed's Smart
Sourcing does this already — a typed sentence at the top, the conventional facet sidebar still
underneath it and still hand-adjustable — as does Shop's product search, where the sentence sits
directly above the same chip bar used for manual filtering, and Todoist's Filter Assist, which
frames the blank slate as *"describe what you're looking for"* and hands back an ordinary,
editable filter afterwards.

**2. Land the sentence *in the columns*, not in a results list.** The run already does this and it
is the direction's unfair advantage: the agent ticks values in the visible columns, so the answer
to *"how do I get my initial query done"* and the answer to *"how do I learn this panel"* are the
same event. A first query typed in English teaches the taxonomy by driving it — the user sees that
"anti-inflammatories" was Drug Descriptor and that Phase II or later meant three ticks under
Development Stage. Idea 3 gets the 70% to a list fast but leaves the 27 attributes invisible; this
fusion gets them to a list fast *and* shows them where the list came from. That is the hybrid Neil
described: *"some clever fusion of classic Boolean search building and ability for natural language
searches."*

**3. Make the hand-off explicit at the end of the run.** When the steps finish, the panel should
say what it did in one line and offer the two moves G2 actually makes — widen or narrow. The parts
are already built: each step is individually undoable, and the columns are already parked on the
last attribute the agent touched. What is missing is the sentence that tells a user the interface
is theirs again, which is also the thing Neil asked of Idea 3 — *"I'd want to see how that flips
then into the power user view."* Here the flip costs nothing, because there is no view to change
into.

**4. Let the sentence be edited as a sentence.** The pill bar at the head of the results already
reads as language — *"Therapy area is Dermatology or Cardiovascular and Drug geography is not
Austria or Italy"* — with every word a control. Wire the composer to accept a follow-up against the
existing query rather than only a fresh request ("now only Phase III", "drop Italy") and the two
halves become one instrument: type to get going, click to be precise, type again to adjust. Clay's
Sculptor is the closest shipped version of this — a plain-English prompt produces structured,
hand-editable filter groups in the rail beside it, and the two are the same query — and it is the
one competitor screen worth putting on the slide next to ours. That is the fusion stated in the
client's own terms, and it is the single most valuable thing this direction could carry into the
next sprint.

One caveat worth keeping honest on the slide: none of this solves G3. Cross-attribute `OR` and
grouping have to be built in the query model regardless of how the query is started, and until they
are, the highest-paying segment is being offered a better-mannered version of what they already
have.

## Verdict

The strongest structure of the four and the weakest opening — keep it, move the composer from the
foot of the panel to the front of the journey so the first query is a sentence and the columns are
what the sentence lands in, and settle the cross-attribute Boolean question separately before
claiming it serves the power user.

## Sources

**In this repo.** `src/flows/sprint-3/idea-2/` (`use-screener.ts`, `data.ts`,
`components/MillerColumn.tsx`, `components/FilterPanel.tsx`, `components/AppliedPills.tsx`,
`components/AgentComposer.tsx`, `components/ResultsPane.tsx`) for every count and behaviour claimed
above; `docs/sprint-3/research/PLATFORM-WALKTHROUGH.md` for the measured baseline;
`docs/sprint-3/research/NEIL-LEDGER.md` and `docs/sprint-3/decks/CLIENT-BRIEF-14-SEP.md` for the
quotes; `sprints/sprint-3/ideas/IDEA-2-MILLER-COLUMNS-EVIDENCE.md` for the direction's premise.

**Published research.**

- Miller columns — history and documented trade-offs: https://en.wikipedia.org/wiki/Miller_columns
  (documented history rather than a primary source; no surviving 1980 Miller paper could be found).
- Pirolli, P. & Card, S. K., *Information Foraging*, Psychological Review 106(4), 1999 —
  https://doi.org/10.1037/0033-295X.106.4.643
- NN/g, *Information Foraging: A Theory of How People Navigate on the Web* —
  https://www.nngroup.com/articles/information-foraging/
- Baymard Institute, *What Is an Ecommerce Filter? UI Best Practices* —
  https://baymard.com/learn/ecommerce-filter-ui
- NN/g, *The State of Ecommerce Search* — https://www.nngroup.com/articles/state-ecommerce-search/
- NN/g, *10 Usability Heuristics for User Interface Design* (heuristic 6, recognition over recall) —
  https://www.nngroup.com/articles/ten-usability-heuristics/
- NN/g, *Progressive Disclosure* — https://www.nngroup.com/articles/progressive-disclosure/
- Larson, K. & Czerwinski, M., *Web Page Design: Implications of Memory, Structure and Scent for
  Information Retrieval*, CHI '98 — https://dl.acm.org/doi/10.1145/274644.274649
- Kiger, J. I., *The depth/breadth tradeoff in the design of menu-driven interfaces*, IJMMS 1984;
  Zaphiris & Mtei 1997 replication — summarised at
  https://www.humanfactors.com/Newsletters/breadth_vs_depth_we_revisit_this_question.asp
- *Understanding the Effect of Algorithm Transparency of Model Explanations in Text-to-SQL Semantic
  Parsing* — https://arxiv.org/html/2410.16283
- NN/g, *A Research Agenda for Generative AI in UX* —
  https://www.nngroup.com/articles/genai-ux-research-agenda/

**Shipped precedent (Mobbin).**

*Faceted panels with counts beside a results table.*

- Apollo, Find People — https://mobbin.com/screens/104af54e-2d5e-4f6f-9b67-ff1b8d7fabc7
- Indeed, Smart Sourcing — https://mobbin.com/screens/e279795b-2699-4b8d-ae86-e044f18414b0
- Codecademy, course search — https://mobbin.com/screens/80c77769-3571-4efd-af09-7a357e1ba35c
- Zillow, homes for sale — https://mobbin.com/screens/1899b9a4-752f-483c-9798-3b16ea1b074f
- Amazon, search results — https://mobbin.com/screens/8f53c293-f83c-4a15-a34d-429aecebc19d

*Agents that drive the visible interface rather than answering beside it.*

- Notion, AI Autofill on a database property —
  https://mobbin.com/screens/8440d5d2-b026-429f-b638-69d4fe28dbc6
- Databricks, Assistant editing a notebook with accept/reject per cell —
  https://mobbin.com/screens/4bdce60b-801a-4d60-9d7a-4fb2ac206455
- Pipedrive, Insights AI report builder —
  https://mobbin.com/screens/d77bd5e0-94fc-4078-9c3f-178f987b33d1
- Clay, Sculptor assistant populating editable filter chips —
  https://mobbin.com/screens/5b4da92e-3328-4435-854f-799504934c55
- Customer.io, campaign agent proposing structured choices inline —
  https://mobbin.com/screens/42f37b19-0505-4d3d-b5fe-fbafce1a658c

*Natural language sitting on top of a structured filter builder — the fusion.*

- Clay, Chat with Sculptor → "Refine with filters" —
  https://mobbin.com/screens/9dbcacb6-feeb-4f6a-8a6d-90b177c12c86
- Indeed, Smart Sourcing (a sentence parsed into a count plus an adjustable sidebar) —
  https://mobbin.com/screens/e279795b-2699-4b8d-ae86-e044f18414b0
- Todoist, Filter Assist — https://mobbin.com/screens/3983e606-7fee-4b8e-8b35-77de228ca6ab
- Shop (Shopify), sentence above the chip filter bar —
  https://mobbin.com/screens/76e1e24b-9efd-472e-a506-e0611e3d54c6
- Linear, structured filter chips — https://mobbin.com/screens/90b0ca17-b70a-425c-b28b-ce934231b2b9

*Miller columns themselves — the honest gap.* Eight-plus differently phrased searches of Mobbin
across file managers, cloud storage, CMS, BI and data tools returned no shipped web product using a
true cascading column browser. The nearest neighbours are single-pane trees: Hex's data browser
(https://mobbin.com/screens/18e71440-94d8-4549-b26d-6915a4ccbfcc), Dropbox's folder rail
(https://mobbin.com/screens/05729902-55fa-445b-891b-585542951b79), GitHub's file browser
(https://mobbin.com/screens/ee3e030f-ef84-4ad6-b838-9ac06d7607e3). The pattern's living precedent is
on the desktop — Finder's column view and its NeXTSTEP ancestor — not on the web.

