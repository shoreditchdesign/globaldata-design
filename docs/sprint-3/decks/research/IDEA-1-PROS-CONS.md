# Idea 1 — Modal / Sidebar Takeover: pros and cons

Judged against the measures Neil set on 14 September — number of clicks, speed of access, and
whether 70% of queries are reachable in three terms or fewer — and against the three user goals in
`docs/sprint-3/decks/CLIENT-BRIEF-14-SEP.md`: **G1** quick screen (~70% of queries, three fields or
fewer), **G2** refine (a list that is nearly right), **G3** deep Boolean (~10% of refined queries,
the largest accounts).

Click counts below were taken by reading the prototype's own code — `state.ts`, `IncumbentScreen`,
`ManualPane` and `FilterChips` — and counting the handlers a user has to fire, not by timing anyone.
The routes are `/sprint-3/idea-1/<slug>`.

---

## What the direction is

You land on the full drug table. Filtering is a separate mode you enter by pressing a button: an
overlay covers the results, carrying two tabs over one shared filter builder. On the **AI** tab you
type a question in plain English and the system writes the filters for you; they appear on the right
as groups of chips with `AND` / `OR` / `NOT` between them, and you can edit any of them by hand. On
the **Manual** tab you build the same thing yourself, clicking down three levels of menu — product
area, then attribute, then value — with the number of drugs behind each value shown before you
choose it. Either way you press **Apply filters**, the overlay closes, and your query reappears as a
row of pills above the table, where an individual value can be changed without reopening anything.
It is the design GlobalData reviewed on 2 September, rebuilt so it runs, and it is in this set as
the baseline the other three are measured against rather than as a candidate.

---

## Pros

**1. Natural language and hand-building write into one shared object.**
The two tabs swap the left pane and leave the builder alone (`FilterModal`), so a query the AI wrote
and a query built by hand are the same groups of chips in the same panel — and a pill the AI
produced reopens the exact picker path a hand-built one would (`openFilterPath` in
`IncumbentScreen`). It is the only direction in the set that keeps both a prompt and a Boolean
builder and makes them the same artefact; Idea 3 reaches the same unity by deleting the builder, and
Ideas 2 and 4 have no prompt to reconcile. This is a partial answer to the fusion question, and it
is under-sold in the current build. Shipped precedent is direct: HubSpot's list builder puts **Use AI to create filters** at the
top of a pane whose body is nested Boolean filter groups, and Apollo's people search puts an AI
prompt box inside the same surface as its filter rail. *Serves the G1 → G3 hand-off, which is the
thing Neil says he has not been shown.*

**2. Counts sit next to every value before you spend a click on it.**
`CascadeValueRow` renders the value, its count and a checkbox on one row. The live platform shows no
number anywhere before you commit — every refinement there is a blind six-second bet
(`PLATFORM-WALKTHROUGH.md` §2). Baymard call per-value counts "one of the single highest-impact
improvements you can make to a filter UI," and it is what Klarna, Selfridges, Coursera and Walmart
all ship. *Serves G1 and G2.*

**3. The applied query is legible and editable without re-entering the mode.**
The filter bar restates the whole query as labelled pill clusters above the table. Clicking a group
label opens its values in a popover and ticking one re-filters the table immediately — `editApplied`
writes straight into `state.applied`, with no Apply step. Two clicks to change a value on a list you
already have, and the table never leaves the screen. The live platform's equivalent, *Your
Refinements*, is read-only and costs a round trip through **Refine Drugs**. Notion anchors the same
control to the pill itself; Confluence puts it in a side panel beside the live table. *Serves G2
directly; this is the segment the direction serves best.*

**4. Boolean is on the surface rather than behind a syntax, and negation is visibly different.**
`AND` / `OR` / `NOT` dropdowns sit between chips inside a group and between groups, and a negated
group renders in the `excluded` tone so an exclusion never reads as an inclusion. As built it is the
most complete Boolean model of the four Sprint 3 directions. beehiiv ("All (AND) / At least one
(OR)"), Proton Mail (ALL / ANY) and HubSpot all expose the operator as a control rather than as
typed syntax, which matters because Nielsen's long-standing finding is that most users cannot write
Boolean query syntax at all. *Serves G3 — up to a ceiling, see con 4.*

**5. Filtering as a deliberate mode matches Neil's own description of how he works.**
He calls himself a screener: set the criteria, hit return, get the list (`NEIL-LEDGER.md` §6). A
modal makes that a discrete act with an unambiguous commit, and Walmart and GoFundMe both ship an
overlay filter panel with an explicit commit button on a results page. It is also the cheapest thing
to build — the same panes, vocabulary and Boolean grammar the platform already has, so the migration
risk is the lowest of the four. Both points are real and both are weak: he questioned the modal
choice himself on the call rather than endorsing it.

---

## Cons

**1. The cold start is the worst of the four and misses Neil's headline metric outright.**
Built by hand, the cost is `3n + 3` clicks for `n` parameters: five to reach the first value, three
for each one after, one to commit. Three fields is twelve clicks. The live platform is roughly three
clicks per parameter and 13–16 for a typical three-or-four-parameter screen
(`PLATFORM-WALKTHROUGH.md`). So the manual path does not beat the incumbent, it matches it — which
is what Neil said on 2 September: *"Feels like we're delivering a similar number of clicks to the
way we have it today."* **Fails G1** on the client's own first measure.

**2. The modal hides the thing being filtered, and there is no count until you commit.**
The overlay is `absolute inset-0 z-40` over the table, and `FilterBuilderPane` renders no total. The
per-value counts are corpus-wide constants (`count / BASE_COUNT` in `data.ts`), not conditioned on
the rest of the query, so nothing on screen tells you whether five groups will leave you 245 drugs
or none until **Apply filters** fires. It does not have to be this way: Walmart's filter panel
commits with the number in the button — **Apply filters (197)** — and HubSpot's list builder runs a
live *Estimated size* preview in a third column beside the rules. NN/g's guidance is that modals are
for consequential interruptions, not for the main work of a screen. *Hurts G1 and G3.*

**3. Three levels of menu to reach one value, each covering the last.**
Area pill, then attribute list, then value list, with the panel positioned `left-full` over the
pills beneath it — a menu on top of a menu, one branch at a time. This is the loss Neil named twice
and most precisely: *"I feel like on the trees I lose the context. I can't have multiple things open
at the same time."* The research agrees with him. Kiger (1984) found error rates falling from 12.5%
to 2.2% when menu depth dropped from six levels to two; Miller (1981) found broad-and-shallow beat
narrow-and-deep on both time and errors; NN/g advise against hierarchical menus more than two levels
deep, because moving diagonally from a parent into a submenu is a steering-law problem, not a
pointing one. Mixpanel ships the same failure inside a modal, where the value picker covers the rule
it belongs to. *Hurts G2 and G3.*

**4. The Boolean ceiling is lower than the controls suggest.**
The between-group pill offers `AND`, `OR` and `NOT`, but `matchingRows` evaluates every group with
`groups.every(...)` — so choosing `OR` between two groups changes the word on screen and nothing
else — and `NOT` is not a join at all: `groupNegated` reads the *previous* group's operator, so the
control negates the group after it. There are no parentheses and no nesting. `(a OR b) AND (c OR d)`
is expressible; `(a AND b) OR (c AND d)` is not — exactly the ceiling the live platform already has.
The ~10% who pay for granularity reach it on their first non-trivial query. What they get elsewhere
is more: HubSpot gives real nested groups with `OR` between them, and Juicebox simply hands power
users a typed expression box — `(software OR engineer) AND (python OR java)`. Professional searchers
do work this way; the systematic-review literature treats transparent, reproducible Boolean
construction as a core skill, not an edge case. **Fails G3**, the highest-value segment.

**5. A second question to the AI throws the first query away.**
`finishResolving` replaces the builder wholesale with the new parse. The reason is sound and
documented in `state.ts` — folding a `Phase II` group into a query whose stage group carries a `NOT`
would silently invert it — but the consequence is that the natural-language tab can start a query
and cannot refine one. Conversation is the obvious way to say *"same thing, but only Europe,"* and
this conversation has no memory of what it built. The EMNLP work on editable step-by-step
explanations found that letting users amend the machine's interpretation step by step beat showing
them the finished query on usability, confidence and mental load; Horvitz's mixed-initiative
principles say the same thing more generally. **Fails G2**, and it is the specific reason the fusion
here is half-built rather than built.

**6. Past ten values the query stops being visible.**
`BAR_FILTER_LIMIT` is ten; beyond it the remaining groups collapse into a `+N` whose only action is
to reopen the modal — so the moment a query gets big enough to be worth checking, checking it means
going back behind the overlay that hides the table. Below that threshold the bar wraps three rows
deep and pushes the results down. A G3 query is, by definition, the one with more than ten values.

**One thing that is not a con of this direction specifically.** The AI tab's parses are canned; none
of the four directions tests real resolution accuracy, and the risk is shared. It is worth stating
to the client anyway, because the evidence is not encouraging: on BIRD — 12,751 question/SQL pairs
over 95 real, messy databases — GPT-4 reached 54.9% execution accuracy with curated domain knowledge
and 34.9% without it, against 92.96% for humans. Whatever the interface, the machine's reading of
the query has to be visible and correctable. Idea 1 gets that part right.

---

## Against the metrics

**A representative G1 query** — *Phase III dermatology drugs in the United States*, three fields.

| Path | Clicks | Where the count appears |
|---|---|---|
| Natural language | **4** | after click 4 |
| Manual builder | **12** | after click 12 |

The natural-language path: **Apply filter** opens the modal on the AI tab (1), a suggestion chip
fills the composer (2), the submit arrow resolves it (3), **Apply filters** commits (4). Typed free
text instead of a chip costs three clicks plus focusing the box, typing and `Enter` — the composer
is not autofocused. The manual path: **Apply filter** (1) → **Manual filter** tab (2) → **Drugs**
area pill (3) → Development Stage (4) → Phase III (5) → back (6) → Therapy Area / Indication (7) →
Dermatology (8) → back (9) → Drug Geography (10) → United States (11) → **Apply filters** (12).

Four clicks is competitive with anything in the set. Twelve is not, and twelve is what a user gets
whenever the question is one the natural-language tab cannot answer — which nothing in the interface
warns them about in advance.

**A representative G3 query** — the worked example already in the build: generic
anti-inflammatories targeting ACTG2, excluding drugs available in Austria or Italy and excluding
marketed drugs that are withdrawn or archived. Five groups, seven values, two negations.

Hand-built, **24 clicks**: one to open, one to reach the Manual tab, one for the **Drugs** area, two
for the first attribute and value, three each for Drug Type and Drug Descriptor, four each for the
two-value Development Stage and Drug Geography groups, and one to apply — twenty — plus two operator
changes at two clicks each, since `OperatorPill` is a dropdown that has to be opened before an option
can be chosen. Nothing reports the size of the result until the twenty-fourth click.

By natural language it is four clicks, but only for a query the system has a parse for, and a
follow-up discards it rather than amending it. The 245 drugs it lands on are reachable only because
the query is `AND`-shaped throughout. Ask for an `OR` across two attributes and the builder will
draw it and the results will ignore it.

---

## Verdict

This is the direction for **G2** — someone holding a list that is nearly right, who wants to change
one value and see the table move — and its single biggest structural problem is that filtering is a
mode that hides the results it filters, so the fast cold start G1 needs and the visible depth G3 pays
for are both shut behind the same door.

---

## Sources

**Prototype** — `src/flows/sprint-3/idea-1/{state.ts,data.ts}`,
`src/flows/sprint-3/idea-1/components/{IncumbentScreen,ManualPane,FilterChips,FilterBar,FilterModal,FilterBuilderPane,AiPane}.tsx`.
Live at `/sprint-3/idea-1/results`, `/sprint-3/idea-1/manual-values`, `/sprint-3/idea-1/applied`,
`/sprint-3/idea-1/many-filters`.

**Project record** — `docs/sprint-3/decks/CLIENT-BRIEF-14-SEP.md`,
`docs/sprint-3/research/NEIL-LEDGER.md`, `docs/sprint-3/research/PLATFORM-WALKTHROUGH.md`,
`sprints/sprint-3/ideas/IDEA-1-MODAL-SIDEBAR-TAKEOVER-EVIDENCE.md`.

**Shipped precedent (Mobbin)**

- HubSpot — list builder with Boolean filter groups, a live *Estimated size* preview and **Use AI to create filters**: https://mobbin.com/screens/35b6285a-a380-487d-b004-219e7295cecd
- HubSpot — *All Filters* side panel, quick filters above advanced groups joined by `OR`: https://mobbin.com/screens/e4d2111c-78c3-4d2f-8265-346097a3ab1f
- Apollo — AI prompt box and quick filters inside the same pane as the filter rail: https://mobbin.com/screens/d7ec9731-1995-47f0-a9f1-6a0be1b7f32d
- Pin — *"Ask Pin to add or change any criteria for you"* above editable criteria chips over a live candidate table: https://mobbin.com/screens/66a05728-5fc3-499d-9e4a-3f770c5ec209
- Pin — per-chip Required / Inverse (Not) / Exact Match controls: https://mobbin.com/screens/a91db153-fa53-4000-9e41-0fda604403d1
- Juicebox — typed Boolean expression as a power-user mode alongside natural language: https://mobbin.com/screens/2df13bc5-3ec4-4fa8-8fd0-d0995d53fce0
- Juicebox — natural-language query resolved into filter pills over live results: https://mobbin.com/screens/1f29bc9b-bdd8-46b6-ba7b-ec28352cf0a3
- Remote — natural-language sourcing query resolved into editable pills over a live table: https://mobbin.com/screens/ad1c5658-0650-40d5-b7a0-28c2d0a52538
- Walmart — *All filters* panel committing with the count in the button, **Apply filters (197)**: https://mobbin.com/screens/f030246c-be00-466a-93e4-82827140c371
- Mixpanel — modal filter builder whose value picker covers the rule it belongs to: https://mobbin.com/screens/87f36249-9cd4-4341-b932-1acaffc62b85
- Zoho CRM — *Add Filter* modal splitting Quick View and Advanced tiers: https://mobbin.com/screens/c0f85935-8d6f-46f4-96f3-e02ea2df8b8b
- Proton Mail — ALL / ANY statement with conditions in a modal: https://mobbin.com/screens/fba9c05e-89fe-4285-a902-ec04b21c9287
- beehiiv — *All (AND) / At least one (OR)* condition grouping: https://mobbin.com/screens/6cc5a7c8-92a3-4656-8305-412ebd97ebda
- Notion — filter popover anchored to the applied pill, live table behind: https://mobbin.com/screens/d8abbe0b-4c55-4316-91b7-2e6b4baecb52
- Confluence — filter side panel with `and` between conditions over the live table: https://mobbin.com/screens/5b90695b-ac32-4dbe-a706-503f0de2a6d0
- Klarna — facet values with counts in a persistent sidebar: https://mobbin.com/screens/2ff7fdaf-9702-4d37-9d3a-72eb63cf463c
- Selfridges — checked facets with counts and a live result total: https://mobbin.com/screens/97e038fa-5fd3-4e29-a891-d8d5d40034f0
- Coursera — facet counts beside every value: https://mobbin.com/screens/69ce3b55-5d49-4115-a760-805d564b1db4
- Pinterest — over-filtered empty state offering one-click removal of each applied facet: https://mobbin.com/screens/45560b08-b73e-4f7e-8a82-878c035ddd68
- Elicit — filter popover over a live academic results table: https://mobbin.com/screens/0413c8c7-a017-451a-b093-f6fe99d4c20e

**Published research**

- Kathryn Whitenton, *Overuse of Overlays: How to Avoid Misusing Lightboxes*, NN/g, 2015 — https://www.nngroup.com/articles/overuse-of-overlays/ (practitioner synthesis of usability tests, not a controlled study)
- NN/g, *Modal & Nonmodal Dialogs: When (& When Not) to Use Them* — https://www.nngroup.com/articles/modal-nonmodal-dialog/
- Christian Holst, *What Is an Ecommerce Filter? UI Best Practices*, Baymard — https://baymard.com/learn/ecommerce-filter-ui (synthesis of Baymard's benchmark and think-aloud corpus)
- Baymard Institute, *Product List UX* benchmark — https://baymard.com/blog/current-state-product-list-and-filtering (344 sites, 4,400+ test sessions; 78% of mobile and 58% of desktop sites rated poor-to-mediocre on filtering)
- Page Laubheimer, *Accot-Zhai Steering Law: Implications for UI Design*, NN/g, 2019 — https://www.nngroup.com/articles/steering-law/ (diagonal submenu traversal as a steering problem; avoid hierarchies deeper than two levels)
- HCIL Tech Report 99-24, *Performance Benefits of Simultaneous over Sequential Menus*, University of Maryland — http://www.cs.umd.edu/hcil/trs/99-24/99-24.html (summarises Kiger 1984's 12.5% → 2.2% error drop and Landauer & Nachbar 1985; secondary to the originals)
- Jacko & Salvendy, *Hierarchical Menu Design: Breadth, Depth, and Task Complexity*, Perceptual and Motor Skills 82(3c), 1996 — https://journals.sagepub.com/doi/10.2466/pms.1996.82.3c.1187 (peer-reviewed, cites Miller 1981)
- S. C. Seow, *Information Theoretic Models of HCI: A Comparison of the Hick-Hyman Law and Fitts' Law*, Human–Computer Interaction 20(3), 2005 — https://www.tandfonline.com/doi/abs/10.1207/s15327051hci2003_3 (the rigorous account of where Hick's law stops applying; it assumes a known, ordered choice set, so it does not describe reading an unfamiliar 17-item attribute menu)
- Eric Horvitz, *Principles of Mixed-Initiative User Interfaces*, CHI '99 — https://dl.acm.org/doi/10.1145/302979.303030
- *Interactive Text-to-SQL Generation via Editable Step-by-Step Explanations*, EMNLP 2023 — https://aclanthology.org/2023.emnlp-main.1004/ (n=24 user study; editable explanations beat raw SQL and answer-only on usability and mental load)
- *Understanding the Effects of Noise in Text-to-SQL*, arXiv 2402.12243 — https://arxiv.org/pdf/2402.12243 (BIRD benchmark figures: GPT-4 at 54.89% with curated knowledge, 34.88% without, against 92.96% human)
- Svarre & Russell-Rose, *Think outside the search box: a comparative study of visual and form-based query builders*, arXiv 2205.04212 — https://arxiv.org/abs/2205.04212 (expert searchers; preprint)
- Jakob Nielsen, *Search: Visible and Simple*, NN/g, 2001 — https://www.nngroup.com/articles/search-visible-and-simple/ (most users cannot use Boolean query syntax; typical query ~2 words — qualitative, no percentage given)
- NN/g, *Interaction Cost: Definition* — https://www.nngroup.com/articles/interaction-cost-definition/

Two figures were checked and **not** used: a widely repeated claim that faceted navigation makes
tasks 25–50% faster does not appear in the NN/g report it is attributed to, and the commonly quoted
steps-to-abandonment statistics trace back to marketing content with no named method.
