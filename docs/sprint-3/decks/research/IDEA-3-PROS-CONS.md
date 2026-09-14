# Idea 3 — Text Input Field: pros and cons

Evidence-backed assessment against the criteria Neil named on 2 September and restated on
14 September. Everything counted below is counted from the prototype's own code in
`src/flows/sprint-3/idea-3/`, and every resolver result quoted is a real output, produced by
compiling `resolve.ts` and running the queries through it. Where the reasoning is ours rather than
a measurement or a citation, it says so.

Segments, as the client frames them: **G1 quick screen** (the majority, three fields or fewer),
**G2 refine** (the power user who narrows after a first pass), **G3 deep Boolean** (the smallest
group, the biggest accounts, and the granularity they pay for).

## What it is, in one paragraph

You describe the drugs you want in your own words — *generic anti-inflammatory drugs targeting
actin gamma, phase II or III, not available in Austria or Italy, oral or IV small molecules* — and
what comes back is not a chat reply and not a filter panel. It is the query itself, written as one
sentence of English above the results table. Every value in it is a pill you can open to see the
alternatives and their counts; every piece of logic is an ordinary word — *targeting*, *excluding*,
*in*, *or* — that you can click and change. The count and the table underneath move as you edit.
A `Filters` toggle redraws the same query as conventional filter groups in the same slot, for
anyone who wants to check it in a familiar shape, and an `Edit` link runs the whole trip backwards
into the text it was read from. There is only ever one query on screen, in one of three costumes.

---

## Pros

**1. The cold start is genuinely free, and that is the whole of the ~70% case.** (G1) The composer
mounts already focused (`Composer.tsx`, the mount effect calls `node.focus()`), and Enter submits.
So a three-condition screen — *phase III oral small molecules* — costs **zero clicks**: one typed
phrase and one keypress. Run through the real resolver that query returns three clauses and 23,200
drugs of 285,529. The measured baseline on the live platform, from
`docs/sprint-3/research/PLATFORM-WALKTHROUGH.md`, is twelve interactions for two attributes and
four values, about three clicks per parameter, and 13–16 clicks for the typical three to four
parameters — followed by a blind six-second commit with no count until it lands. No other
direction in this sprint gets closer to nothing.

**2. It puts the cheap path and the verification in the same object, which is what the literature
says a prompt interface has to do.** (G1, G2) Nielsen's group calls the core weakness of prompt-only
interfaces the *articulation barrier* — users lack the vocabulary and the patience to write good
prompts — and the remedy it proposes is a hybrid: a prompt that resolves into GUI controls rather
than into prose
([NN/g, *Overcoming the Articulation Barrier*](https://www.nngroup.com/articles/ai-articulation-barrier/)).
That is exactly this screen. There is also empirical support for explaining the parse back: Berant
et al. showed that translating a parsed query back into language or provenance improved users'
correctness and reliability on web-table queries
([ICDE 2019, arXiv:1808.04614](https://arxiv.org/abs/1808.04614)). The sentence is that explanation,
and it is also the control surface, so the user does not have to read one thing and edit another.

**3. Editing is priced correctly relative to the mistake.** (G2) Correcting a value is two to three
clicks — open the pill, tick the right value, untick the wrong one — and the count moves live as
you do it. Removing a value without opening anything is one click on the pill's dismiss; dropping a
whole condition is one click on the clause's dismiss; flipping *excluding* to *only in* is two.
Every edit pushes exactly one undo step (`Screener.tsx`, `commit`), so a wrong turn costs one
click, not a retyped query. Shneiderman's original definition of direct manipulation asks for
rapid, incremental, reversible operations with immediately visible effect
([*Computer* 16(8), 1983](https://dl.acm.org/doi/10.1109/MC.1983.1654471)); by that test the
sentence qualifies and a chat transcript does not — the CHI 2024 DirectGPT paper makes precisely
that argument about LLM interfaces, that a linear textual history "undermine[s] most of what makes
an interface direct" ([arXiv:2310.03691](https://arxiv.org/html/2310.03691v2)).

**4. It is the only direction that answers the question Neil has asked since 13 August, and it
answers it with one object rather than two.** (G1, G2) His words: *"how do you combine being able to
use natural language and then saying, well, actually I want to structure my search?"*
(`NEIL-LEDGER.md` §5). Sprint 2's answer was a chat transcript beside a builder panel, and he read
that correctly as two things to reconcile. Here `Sentence` and `Filters` are one click apart, write
through the same handlers, and hold the same clause objects — `FilterView.tsx` imports its value
menu, operator dropdown and add-condition menu from `QuerySentence.tsx`, so neither view can express
anything the other cannot. The swap is lossless in both directions, which is more than the Sprint 2
design could claim.

**5. Failure is reported rather than guessed at, and the honest cases are genuinely good.** (G1, G2)
Typing *phase 3 monoclonal antibodies for rheumatoid arthritis from Pfizer in the last 2 years*
returns two clauses and three separate notes: that Therapy Area and Indication are real attributes
not wired here, that Company is its own product area, and that there is no date condition. Typing
something it cannot place at all builds no query and lists what it can read. That is the right
default — Google's own Conversational Analytics documentation warns that its output "can generate
output that seems plausible but is factually incorrect" and asks users to validate everything
([Looker docs](https://docs.cloud.google.com/looker/docs/conversational-analytics-overview)),
which is a disclaimer rather than a mechanism. Naming the unplaced phrase is a mechanism.

**6. The argument from what GlobalData already owns is strong and costs nothing to make.** (G1) The
platform ships a fast, well-organised, cross-entity natural-language search in the global header,
and nothing found in it can be carried into a screener; it is also missing from the Pharma homepage
and Escape does not close it (`PLATFORM-WALKTHROUGH.md`, findings 11 and 3). In this prototype that
header search is wired: type into it and the last row of the dropdown, *Screen drugs matching "…"*,
hands the text to the sentence below, which resolves it. One click. The pitch is not "let us invent
AI search", it is "you already built the good search and orphaned it."

---

## Cons

**1. The parse is wrong in ways the sentence reads as right, and we can demonstrate it.** (all three,
worst for G3) This is the load-bearing risk and it is not hypothetical. Compiled and run against the
prototype's own resolver:

| Typed | Returned |
|---|---|
| `marketed in Germany but not approved in Japan` | **Drugs only in Germany or Japan, not in the Marketed stage** |
| `oncology drugs in phase 3 marketed in the US, excluding Japan` | **antineoplastic drugs excluding the United States or Japan, and in Phase III or the Marketed stage** |
| `non-generic drugs` | **Generic drugs** |

In the first, Germany was meant to be included and Japan excluded; both land in one geography clause
and the exclusion attaches to the stage instead. The only thing reported unplaced is the word *but*.
In the second, the United States was meant to be included and the negation cue reaches backwards
across the whole clause. In the third the sentence says the exact opposite of the request, and the
correction sits in a grey note underneath rather than in the sentence itself. Each of these produces
a grammatical, plausible English sentence and a confident four-digit count, which is the specific
failure mode the direction says it cannot survive. The prototype's resolver is deliberately keyword
matching rather than a model, so a real implementation would fail differently — but it would still
fail, and the interface has no way to signal *low confidence on this clause* as distinct from *this
clause*. Note also that it is one clause per attribute by construction: `resolveQuery` keys its
accumulator by clause id, so mixed polarity within one attribute cannot be represented and is
silently collapsed rather than refused.

**2. Users will not check it, and there is now a study saying so about this exact interaction.**
(G1, G2) Ipeirotis and Zheng ran a comparative study of a natural-language-to-SQL tool against
Snowflake's native query interface and found users' self-reported trust at 6.1/7 for the NL tool
against 4.0/7 for the native UI, with verification that participants themselves described as light —
*"The query given by the AI is correct… I will just verify it quickly"* — and concluded that "users
may struggle to detect subtle errors in system-generated SQL queries"
([arXiv:2511.14718](https://arxiv.org/html/2511.14718v1)). That is the classic automation-bias
result applied to query building; the underlying finding, that people accept an imperfect aid's
recommendation against their own training and other valid indicators, is Skitka et al.
([*IJHCS* 51(5), 1999](https://www.sciencedirect.com/science/article/abs/pii/S1071581999902525)),
and the misuse/over-reliance framing is Parasuraman and Riley
([*Human Factors* 39(2), 1997](https://journals.sagepub.com/doi/10.1518/001872097778543886)).
Everything this design does to slow a reader down — counts in the dropdowns, the *Read from "…"*
line, the `Filters` view — is mitigation, not proof, and the study above suggests mitigation of
roughly this strength is not enough on its own. This matters more here than anywhere because the
output of the screen is an Excel export somebody else acts on.

**3. A blank input teaches nothing about what the database can be asked.** (G1 and G2 especially)
There is no taxonomy anywhere on screen. Four suggested prompts and an error state listing ten
attribute names are the entire vocabulary the interface offers, against roughly 27 attributes under
Drugs in the real product. A new analyst never learns that Gene Therapy Vector, ATC Classification
or Line of Therapy exist, because nothing shows them. Hearst's position on exactly this trade is
that faceted navigation exists to support "flexible navigation, seamless integration of browsing
with directed search, fluid alternation between refining and expanding", and she reports a study in
which users who initially preferred keyword search shifted toward facet-based exploration as they
learned the system ([*Search User Interfaces*,
ch. 8](https://searchuserinterfaces.com/book/sui_ch8_navigation_and_search.html)). Idea 2 shows all
27 attributes with counts; this one shows none. It is a real loss and it is the one the client's own
record predicts will bite: `CLIENT-CONTEXT.md` §5 records a live internal disagreement about whether
users know what they are looking for up front, and this direction only works well for the half of
that argument that says they do.

**4. A linear sentence cannot hold nested Boolean, and the `Filters` toggle does not fix that —
it is the same power, redrawn.** (G3, squarely) The clause model is flat by construction: one
`Clause` per attribute, one `join` word (`or` | `and`) governing all of that clause's values, one
include/exclude mode for the whole clause, and a fixed AND between clauses (`resultCount`
multiplies clause factors). There is no group, no parenthesis and no second clause on the same
attribute, in either view. So `(Phase III AND oral) OR (Marketed AND injectable)` is not
expressible at any number of clicks. Worse, it is not *refused*: typing *drugs that are either phase
III and oral, or marketed and injectable* returns **Drugs in Phase III or the Marketed stage, taken
orally** and reports only *either* and *injectable* as unplaced. The grouping is dropped without
comment. For context, every comparable product has converged on nested groups — Linear ships
"nested filter groups" with AND/OR ([docs](https://linear.app/docs/filters)), Airtable nests
condition groups three levels deep
([docs](https://support.airtable.com/docs/filtering-records-using-conditions)), Notion three in the
UI and two in the API ([docs](https://developers.notion.com/reference/post-database-query-filter)),
GitHub's newer issue filtering five
([docs](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/filtering-and-searching-issues-and-pull-requests)).
The mitigating fact, and it should be said out loud to the client, is that GlobalData's live
platform cannot do it either: the walkthrough records that `(a OR b) AND (c OR d)` is expressible
and `(a AND b) OR (c AND d)` is not, and that two different attributes cannot be OR'd at all. So
this direction matches today's ceiling rather than raising it — which is fine for G1 and G2 and
leaves G3 exactly where they started.

**5. Adding a condition by clicking is the one expensive path on the screen, and it applies a value
you did not ask for.** (G2) `+ condition` then an attribute is two clicks, but `onAddClause` commits
the template as-is, and every template in `data.ts` carries a default selection — picking
*Mono/Combination Drug* immediately narrows the set to *Mono* and moves the count, without anyone
choosing that. Swapping the default for the value you wanted costs three more clicks, so one
non-default extra condition is five. That is worse than the live platform's own three clicks per
parameter, and it lands on precisely the user — the one refining after a first pass — the direction
most needs to keep.

**6. The results grid is a read-out, not a refinement surface.** (G2) `ResultsGrid.tsx` sorts by
column header and does nothing else; there is no per-column filter, no facet, no promote-this-value.
Everything has to go back through the sentence. That is coherent — one query in one place is the
whole argument — but it means the most natural refinement gesture an Excel-habituated analyst has,
narrowing from something they can see in the data, is unavailable. Bina's constraint in
`NEIL-LEDGER.md` §7, that sorting, filtering and aggregates belong at the top level of the results
view, is met for sorting and not for the rest.

---

## Against the metrics

Counted from the prototype code and its real resolver output, not estimated from the design.
The baseline column is the measured live platform from `PLATFORM-WALKTHROUGH.md`.

**Representative G1 query — "phase III oral small molecules" (three conditions).**

| Step | Cost |
|---|---|
| Land on `/sprint-3/idea-3/start`; composer is already focused | 0 |
| Type the phrase, press Enter | 1 typed string, 1 keypress |
| Resolve animation plays and settles on its own (1,400 ms, scripted, nothing computed) | 0 |
| Results table below is already mounted and re-renders | 0 |
| **Total** | **0 clicks** → 3 clauses, 23,200 of 285,529 drugs, 14 sample rows |

Via a suggested prompt instead it is one click to fill the field and one to `Resolve` — the
suggestion only sets the text, it does not submit. Via the global header it is one click on
*Screen drugs matching "…"*. Correcting one misread value afterwards is two to three clicks.
**Baseline for the same shape of query: 13–16 clicks and a blind six-second commit.**

**Representative G3 Boolean query — "drugs that are either Phase III and oral, or Marketed and
injectable, excluding withdrawn."**

| Step | Cost |
|---|---|
| Express the nested group in the sentence | **not expressible** |
| Express it in the `Filters` view | **not expressible** — same clause model, same handlers |
| Actual behaviour when typed | flattened to *Drugs in Phase III or the Marketed stage, taken orally*, no warning |
| Workaround | two separate screens, two exports, merged by hand in Excel |

For the G3 work it *can* do — the seven-condition worked example at `/sprint-3/idea-3/sentence`,
453 drugs — the cost is again one typed sentence and zero clicks, against "north of twenty clicks
plus the commit" on the live platform. Rebuilding those same seven conditions by clicking, if the
default values did not happen to match, is roughly 24 clicks on our arithmetic: two per condition to
add it, one per value chosen. Flipping between `Sentence` and `Filters` is one click and lossless.

**Scored against the client's "what does good look like".**

| Criterion | Verdict |
|---|---|
| 70% of queries in three terms or fewer | **Best of the four.** Zero clicks, one sentence, three conditions. |
| Number of clicks | **Best of the four** at cold start; worst of the four for adding a condition by hand (5). |
| Speed of access to a usable list | Instant, and the count is live rather than a blind commit. 1.4 s of that is deliberate animation. |
| 10% needing a full Boolean builder | **Not served.** Nested groups are not expressible and are silently flattened. |
| Fusion of NL on-ramp with Boolean depth | **Half answered.** NL in, structure out, one object — but the structure tops out where the sentence does. |

---

## The flip into the power view, and what would close it

This is the thing the client actually asked to see on 14 September, and the honest answer today is
that the `Filters` toggle is not it. It flips the query into a *different drawing of the same
query*, not into a more powerful one — by design, because `FilterView` and `QuerySentence` share
their controls and their clause model. It answers "can I see it as filters"; it does not answer
"can I go deeper". What follows is a concrete proposal for the second half.

**Make it a three-rung ladder on one query object, not a two-state switch, where each rung is
strictly more expressive than the last and the object survives the climb.** Three tabs, in the slot
the toggle already occupies, never a modal — Neil asked twice on 2 September for the full pane
rather than a modal, and the results table below must not move when you climb, so the user never
loses their place.

**Rung 1 — `Sentence`.** What ships today, unchanged. One clause per attribute, values joined by a
word, one include/exclude word each. Owns the ~70% at zero clicks.

**Rung 2 — `Filters`.** Today's second view, re-scoped so it earns the tab. Same clauses as labelled
groups, plus the two things the sentence cannot hold without becoming unreadable: **more than one
clause on the same attribute** (so *marketed in Germany, not approved in Japan* stops being the
misread it currently is), and **operators beyond include/exclude** — *is any of*, *is all of*, *is
none of*, *is empty*, and the numeric and date comparators the real product needs. Still a flat AND
of groups. This is where G2 lives, and it is a small increment on what exists.

**Rung 3 — `Builder`.** The new rung, and the actual answer. A nested group tree: groups that hold
clauses, groups that hold groups, each group carrying its own *all* / *any* / *none*. This is the
only rung that can express `(Phase III AND oral) OR (Marketed AND injectable)`, and it is exactly
what the ~10% are paying for. Every comparable product converged here, which makes it a low-risk
design rather than an invention — and Linear is the precedent worth showing the client, because its
`Add Filter…` menu lists **`AI Filter`** and **`Advanced filter`** as its first two entries, above
the plain attribute list, with both writing into the same chip row
([Mobbin: Linear, filter menu](https://mobbin.com/screens/90b0ca17-b70a-425c-b28b-ce934231b2b9);
[Linear docs](https://linear.app/docs/filters)). HubSpot draws the nesting as `Group 1 OR Group 2`
with `+ Add filter group`
([Mobbin](https://mobbin.com/screens/e4d2111c-78c3-4d2f-8265-346097a3ab1f)); Airtable puts
*"Describe what you want to see"* directly above `Where … / + Add condition / + Add condition group`
in one popover ([Mobbin](https://mobbin.com/screens/3de03dd6-b397-49fb-9fee-f194f1456e6a)).

Five mechanics make the ladder honest, in the order they matter.

**One object, three renderings, and the climb is free.** A flat clause list is a degenerate case of
a group tree — one root group set to *all*. So rungs 1 and 2 are views of the same structure rung 3
edits, and climbing needs no conversion step and loses nothing.

**Descending has to be visible, never silent.** Once a nested group exists the sentence cannot say
it. The rule: the sentence stays available, says the part it can, and renders each nested group as
one non-editable pill reading *matching either of 2 groups* that opens the builder when clicked. It
must never quietly drop logic — which is exactly the failure already present in the resolver, where
*either … and … or … and …* comes back flattened with no warning. That same resolver should stop
flattening and start saying so: when it reads a nested request, either build the group or refuse
and name what it could not hold.

**Language has to reach the top rung, not just the bottom one.** This is the fusion, and it is the
part that is genuinely new. The composer stays available inside the builder, and a typed phrase
*adds to* the query at the level you are standing on rather than replacing it: *"…and also anything
marketed and injectable"* becomes a second group OR'd at the root. That turns natural language from
a mode you leave behind at the door into the way you write into the query at any depth — which is
the literal answer to the question asked on 13 August and repeated on 14 September. Kibana and
Databricks both now put the NL prompt in the query bar rather than in a separate assistant
([Elastic ES|QL AI Assistant](https://www.elastic.co/docs/explore-analyze/ai-features/ai-chat-experiences/ai-assistant);
[Mobbin: Databricks, *Ask Genie* over a data table with a chip row and *Add OR condition*](https://mobbin.com/screens/15a36df5-013f-4cb8-8a7b-35046d654efa)).

**Provenance per clause, not per query.** Today one line under the sentence says *Read from "…"*.
At depth that stops working. Each clause should carry the words it came from, so a power user
checking the machine's reading can see which phrase produced which condition and, critically, which
conditions were not asked for at all. PubMed has shipped this for years — its *Search Details* panel
shows exactly how a typed query was translated, with a warnings section for terms it could not map
([PubMed help](https://pubmed.ncbi.nlm.nih.gov/help/)) — and it is the single cheapest thing that
would move the trust problem from a matter of faith to a matter of inspection.

**A named `Refine` action, so the trip is deliberate and countable.** One control on the sentence
promotes the query into the builder. The claim then becomes measurable in the client's own
vocabulary: *G1 costs zero clicks, and the door to G3 costs one more.* Add query saving on the same
object — named, reopenable, diffable — because the accounts that buy granularity rebuild the same
screen every week, and once the query is one object that costs almost nothing to give them.

**What to test with him.** Two things, and they are cheap. Read him a deliberately nested request
out loud and watch which rung he reaches for. Then show him one of the misreads in the table above,
without warning, and ask whether he would have caught it — because the answer to *"should `Filters`
be the view that opens, with the sentence as the shortcut"* depends entirely on what he says next.

---

## Verdict

The fastest cold start of the four directions and the only one that answers the natural-language
question with a single object rather than two, but it currently tops out at the same flat Boolean
ceiling as the live platform and hides its misreads inside fluent English — so it is the right
front door for the 70% and not yet a home for the 10%, and the third rung proposed above is what
turns it into both.

---

## Sources

**Prototype (measured, not cited)** — `src/flows/sprint-3/idea-3/{flow,data,grammar,resolve}.ts`
and `components/{Composer,QuerySentence,FilterView,Screener,Resolving,ResultsGrid,GlobalSearch}.tsx`.
Resolver outputs in this document were produced by compiling `resolve.ts` with the repo's own
TypeScript and running the quoted strings through `resolveQuery`.

**Project record** — `docs/sprint-3/research/PLATFORM-WALKTHROUGH.md` (click baseline, Boolean
ceiling, orphaned global search), `docs/sprint-3/research/NEIL-LEDGER.md` (§5 the natural-language
question, §7 personas, §9 the four criteria), `docs/sprint-3/research/CLIENT-CONTEXT.md` (§5
constraints, §7 what was asked for next).

**Mobbin**

- [Linear — `Add Filter…` menu listing `AI Filter` and `Advanced filter` above the attribute list](https://mobbin.com/screens/90b0ca17-b70a-425c-b28b-ce934231b2b9)
- [Linear — chip row, `Status is In Progress ×`, `Priority is Urgent ×`, `+`](https://mobbin.com/screens/d3ab0127-662f-4764-9c84-511cd7345e27)
- [Airtable — "Describe what you want to see" above `Where …`, `+ Add condition`, `+ Add condition group`](https://mobbin.com/screens/3de03dd6-b397-49fb-9fee-f194f1456e6a)
- [HubSpot — advanced filters, `Group 1` OR `Group 2`, `+ Add filter group`](https://mobbin.com/screens/e4d2111c-78c3-4d2f-8265-346097a3ab1f)
- [Databricks — *Ask Genie* natural-language bar over a data table, with a filter chip row and `Add OR condition`](https://mobbin.com/screens/15a36df5-013f-4cb8-8a7b-35046d654efa)
- [Clay — AI chat panel beside `Where Location equal to`, `+ Add filter`, `+ Add filter group`](https://mobbin.com/screens/58d4706b-d6a8-4b30-980f-0d58936512fe)
- [Databricks Genie — generated SQL shown for review before `Run`](https://mobbin.com/screens/18b4ec46-a39d-4d21-aef3-197e46f5bdb4)
- [folk — command palette separating `/query` "Ask AI to write a query for you" from `/filter` "write a query"](https://mobbin.com/screens/b53dba9e-376a-4ddf-a37e-6c6e7d3f21d9)
- [Mixpanel Spark — natural-language prompt generating a board](https://mobbin.com/screens/bb8d51bf-89ec-4770-bcaf-ec45a0d00278)

**Published research and writing**

- Shneiderman, *Direct Manipulation: A Step Beyond Programming Languages*, **Computer** 16(8), 1983 — https://dl.acm.org/doi/10.1109/MC.1983.1654471
- Shneiderman & Maes, *Direct manipulation vs. interface agents*, **ACM Interactions** 4(6), 1997 — https://dl.acm.org/doi/10.1145/267505.267514
- Masson et al., *DirectGPT: A Direct Manipulation Interface to Interact with Large Language Models*, CHI 2024 — https://arxiv.org/html/2310.03691v2
- Nielsen, *AI: First New UI Paradigm in 60 Years* (intent-based outcome specification), NN/g, 2023 — https://www.nngroup.com/articles/ai-paradigm/
- NN/g, *Overcoming the Articulation Barrier in Generative AI Using Hybrid Interfaces*, 2023 — https://www.nngroup.com/articles/ai-articulation-barrier/
- Hearst, *Search User Interfaces*, ch. 4 (query specification) and ch. 8 (navigation and search) — https://searchuserinterfaces.com/book/
- Ipeirotis & Zheng, *Natural Language Interfaces for Databases: What Do Users Think?*, 2025 — https://arxiv.org/html/2511.14718v1
- Skitka, Mosier & Burdick, *Does automation bias decision-making?*, **IJHCS** 51(5), 1999 — https://www.sciencedirect.com/science/article/abs/pii/S1071581999902525
- Parasuraman & Riley, *Humans and Automation: Use, Misuse, Disuse, Abuse*, **Human Factors** 39(2), 1997 — https://journals.sagepub.com/doi/10.1518/001872097778543886
- Berant et al., *Explaining Queries over Web Tables to Non-Experts*, ICDE 2019 — https://arxiv.org/abs/1808.04614
- BIRD-SQL text-to-SQL leaderboard (top execution accuracy ~82% as of Sept 2025) — https://bird-bench.github.io/

**Shipped precedents, documented**

- Linear filters — nested filter groups with AND/OR, and natural-language view filtering — https://linear.app/docs/filters
- Airtable — conditional groups, three levels — https://support.airtable.com/docs/filtering-records-using-conditions
- Notion — three levels in the UI, two in the API — https://www.notion.com/help/guides/using-advanced-database-filters · https://developers.notion.com/reference/post-database-query-filter
- GitHub issue filtering — parenthesised nesting to five levels; the older qualifier syntax has no grouping at all — https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/filtering-and-searching-issues-and-pull-requests
- Splunk on the SPL learning curve — https://www.splunk.com/en_us/blog/platform/flatten-the-spl-learning-curve-introducing-splunk-ai-assistant-for-spl.html
- Elastic — ES|QL generated from plain language in the Kibana query bar — https://www.elastic.co/docs/explore-analyze/ai-features/ai-chat-experiences/ai-assistant
- Looker Conversational Analytics — "plausible but factually incorrect" disclaimer and documented limits — https://docs.cloud.google.com/looker/docs/conversational-analytics-overview
- Tableau *Ask Data* retired in Tableau Cloud, February 2024, and in Server 2024.2 — the clearest negative precedent for natural-language query in a data product — https://help.tableau.com/current/pro/desktop/en-us/ask_data.htm
- PubMed *Search Details* — the shipped precedent for showing a user exactly how their query was translated, with warnings for unmapped terms — https://pubmed.ncbi.nlm.nih.gov/help/
- ClinicalTrials.gov advanced search — Essie syntax with explicit parentheses for nested logic — https://www.clinicaltrials.gov/api/gui/ref/expr
