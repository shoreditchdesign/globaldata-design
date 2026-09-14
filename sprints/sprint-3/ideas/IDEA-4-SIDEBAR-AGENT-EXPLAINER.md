# Idea 4 — Results-first

Companion to `IDEA-4-EVIDENCE.md`, which holds the quotes this direction was built from — including
the part of the record that says the central mechanic here has never been put to the client. This
document is for walking a client through the prototype.

## In one sentence

There is no filter screen: you land in the grid with all the data in front of you and narrow it from
the column headers the way you would in Excel — and the grid itself is rebuilt so one drug is one
row, however many indications or countries it carries.

## What we are trying to achieve

Two things, and they are separable.

**The filtering half.** The live product makes you spend about **12 interactions** before you see a
single row, because the screener is a separate page with no results on it. Here the first interaction
shows data. A filter parameter costs **two clicks** — open the column header, tick a value — against
three today, every value in the menu carries its count, and the total updates in the bar above the
grid, so the blind six-second commit disappears. Nothing is ever a separate mode: the grid is
already narrowed behind the menu you have open.

**The grid half, which nobody has designed against yet.** This is the one element the client named
unprompted — "the grid falls off the side of the screen" — and asked for something less like a flat
spreadsheet list. On the live product the results view scrolls sideways at 1600px with eight locked
columns you cannot change, and because sub-values are rendered as merged rows, a single drug can
occupy an entire viewport: "1–10 of 1,091" renders as thirty-five lines. Here:

- **One drug is one row, and the row never grows.** Multi-valued attributes render as tags capped
  with a `+N`; opening it lists every value in a popover rather than stretching the row underneath
  it, so the grid keeps a fixed row height instead of producing the thirty-five-line record.
- **Legibility over fitting.** Cells sit at 16px and headers never wrap; past each column's minimum
  width the grid scrolls sideways, with the row checkbox and Drug Name pinned on the left. An
  earlier pass at this direction tried to compress every column into one viewport with no scroll at
  all — that traded away readable text for a screen the wide record wouldn't fall off, and it lost
  that trade.
- **Column management the product does not have:** 9 columns shown of 37, each of them hideable,
  reorderable and pinnable, against eight locked columns today.
- **Sort, group and aggregate at the top level**, where an Excel-habituated user looks for them,
  with an optional per-column summary row a reviewer turns on rather than fixed figures shown
  whether or not they're wanted.

## How it differs from the other three

All four answer the same question — how do you get from 285,529 drugs to a set you can work with —
and the difference between them is **where the query lives**.

- **Here, the query has no home of its own.** It lives in the column headers of the grid you are
  already reading, and its record is a row of pills under the toolbar. It is the only direction with
  no dedicated filter surface, and the only one that starts you in data rather than in a screener.
- **Idea 1 — the incumbent** puts the query in a modal over dimmed results, with three levels of
  cascading menu to reach one value and an `Apply` at the end. This direction is its opposite on
  every axis: no overlay, no commit, no separate mode.
- **Idea 2 — Full-pane screener** keeps a dedicated panel, permanently, beside the results at
  roughly 40/60. It costs the same two clicks per parameter as this does, so the difference is not
  speed — it is that Idea 2 shows you the whole taxonomy, all 27 attributes under Drugs with counts,
  whether or not they are in the grid. Here you can only filter on a column that is on screen: the
  other 28 attributes have to be added as columns first. That is a real cost, and the column manager
  is the answer to it, not a workaround for it.
- **Idea 3 — Query as a sentence** replaces the interface with language. It is by far the fewest
  interactions and it can express things this direction cannot — negation, and "or" across different
  attributes. This direction's Boolean is deliberately plain: `or` between values inside a column,
  `and` between columns, nothing else. That is the Excel model, and the bet is that it is the one
  these users already have in their hands.

Where the four are not really in competition: the grid redesign here is the only work anybody has
done on the results view, and it would be needed under Ideas 1, 2 and 3 as well. It can be adopted
without adopting the filtering model.

## What is built, and what is not

**One screen, at `/sprint-3/idea-4/grid`.** It opens mid-task, the way a returning user would find
it: the assistant's opening turn has already run and applied three filters — oncology or
immunology, phase 2 or 3, given IV or subcutaneously — narrowing the 46-drug sample from 46 to 15.
The grid is real, in-memory filtering over that sample, not authored frames: every menu, count and
pill tracks the actual rows on screen.

**What responds to a click, in the grid:**

- **Every column's header menu** — sort ascending or descending, group by this column, pin it to
  the left or unpin it, and, where the attribute has one, a searchable list of its values with
  counts and a footer showing how many of the current set match. A column with a filter applied
  shows a count badge instead of a funnel icon.
- **A multi-valued cell's `+N`**, which opens every value the tag ran out of room for in a popover
  headed with the attribute and its count.
- **Aggregate**, top right, which turns on a summary row — off by default — that sits pinned to the
  bottom of the grid and puts one figure (company count, indication count, geography count, median
  or mean stage, NPV) under each column it applies to.
- **The Columns manager**: 9 columns shown, more available, each hideable, reorderable and
  pinnable; a column with nothing to show in this sample says so plainly rather than rendering
  blank.
- Row-selection checkboxes tick and untick; the checkbox column and Drug Name stay pinned left as
  the grid scrolls sideways past them.

**What does not, and what to say before handing over the mouse:**

- **It is a 46-drug sample, not the database.** Every count on screen is honest about that — the
  rail reads "N drugs match · of 46 in sample" — but it is a fixed array, not a live index.
- **The assistant runs on keyword rules, not a model.** Its composer says so directly: "Keyword
  rules over the 46-drug sample — no model." A request it has no rule for gets an honest miss, not
  a wrong answer.
- **Undo is whole-grid, not per-field.** Undoing an agent turn reverts every change made since,
  including anything done by hand in the column menus in between — disclosed in the Undo control's
  own tooltip rather than hidden.
- `Export`, the global search and the account menu are presentational, as everywhere in this set.

One deliberate divergence from the original brief to flag: it asked for a **multi-row, card-like
entry per drug**. What is built is one row per drug, fixed-height, with tags and a `+N` popover for
overflow. It solves the same problem — the sprawling record and the sideways scroll the live
product produces — with a denser answer than a card, and it is a fair thing to push back on.

## The assistant

The panel docked on the right is the other half of this direction: an agent that acts on the grid
itself — its filters, its columns, its sort and grouping — rather than on a query object sitting
apart from it, and shows its work rather than just its result.

Each request becomes one turn, read top to bottom:

1. **You**, the prompt as typed, in its own card.
2. **Thinking** — a spinner while the rules run, collapsing to "Thought for 0.8s" once they land; a
   thin progress bar under the panel header tracks the same beat. Opening the row lists what
   actually matched, or, on a miss, what it tried and came up empty against.
3. **Response** — a plan card listing each step it wants to take, one row per change, worded in
   three tenses as it moves through them: "Add filter" before, "Adding filter" while it lands,
   "Added filter" once it has. Nothing touches the grid yet.
4. Accepting runs the plan and replaces the card with a **receipt** — "Applied · 15 → 4 drugs ·
   1.2s" — with its own Undo, tooltipped with what Undo actually reverts. Dismissing instead leaves
   a plain "Dismissed · nothing changed". If the grid has moved on since the plan was made, Accept
   disables and the card says so — "The grid changed since this was proposed" — with "Run again" in
   its place, rather than applying a stale plan over a grid that no longer matches it.

Between turns, an empty composer shows up to three **Suggestions** pulled from the drugs and
columns actually on screen, and the composer itself carries a context badge — "Drugs grid · N
rows" — so a request is legible against what it would act on before it's even sent.

This is the thing the direction is testing as much as the grid is: whether showing the working,
turn by turn, with an honest miss and a reversible undo, is what makes an AI that edits your data
trustworthy rather than a black box you have to double-check by hand.

## The bet

This is the direction resting on an assumption the client has never been asked about, and it is
worth being blunt about it in the room.

**Nobody has ever put column-header filtering to him.** There is no quote for it. What we have is
that the live product already has a funnel icon on every results column that did nothing in three
attempts to open it — a second, undiscoverable filter system sitting unused in the header row. We
are exploring this because the product measurably fails there, not because it was requested.

The larger bet is about sequence. His own stated working model is to set the criteria first and then
retrieve — "I want to set the criteria that then when I hit the return key it gives it to me… I'm
screening." Results-first inverts that. If that model is genuinely how he thinks about the product,
this direction can be rejected on the word "screener" alone, no matter how good the grid is — which
is exactly why the grid redesign should be judged separately from the filtering model.

The narrower bet: that Excel habits transfer. Sort and filter from a header is second nature in a
spreadsheet; whether it stays second nature across 37 columns of pharma taxonomy, when 28 of them
are not on screen, is untested.

## What we want feedback on

1. The unresolved question in the record, with this as the test case: does the user set criteria
   first, or does the grid come first with filtering layered on top? A straight answer here decides
   whether this direction continues at all.
2. Separately, and regardless of that answer — is the grid right? One fixed-height row per drug,
   `+N` to open overflow values in a popover, a sideways scroll past 16px text rather than a
   viewport-fitting squeeze, 9 of 37 columns under your control. Does it need to be the multi-row
   card you described, or is this dense version better for the work?
3. `or` inside a column and `and` between columns is all the logic this model offers. Is that enough
   for a real screen, or is there a query you build regularly that it could not express?
