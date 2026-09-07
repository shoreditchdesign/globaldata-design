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

- **One drug is one row.** Multi-valued attributes render as pills that wrap inside their lane,
  capped with a `+N` that opens a detail band under the row. The widest record in this set —
  Zanidatamab, with 9 indications, 2 routes and 12 geographies — is five lines, not thirty-five.
- **No horizontal scroll.** Fixed lanes for single-valued columns, flexible lanes for the
  multi-valued ones, so the grid compresses instead of running off the screen.
- **Column management the product does not have:** 9 columns shown of 37, each of them hideable,
  reorderable and pinnable, against eight locked columns today.
- **Sort, group and aggregate at the top level**, where an Excel-habituated user looks for them,
  with a summary strip along the bottom — 61 companies, 84 indications, 42 geographies, median stage
  Phase II.

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

**One screen, at `/sprint-3/idea-4/grid`.** It opens mid-task: Therapy Area is Oncology or
Immunology, Route of Administration is Intravenous or Subcutaneous, the Development Stage menu is
open on the third filter, and the widest record in the set is expanded so the multi-value case is
visible rather than described. 248 drugs match, from 1,091 in scope before the stage filter, out of
285,529 in the database.

**What responds to a click:**

- **The Development Stage column menu** — sort ascending/descending, group by this column, pin
  column left, a searchable list of all 14 values with counts, and a footer reading "248 of 1,091
  match".
- **The Columns manager**, top right: 9 columns in the grid, 28 more available, each with a drag
  handle, a checkbox and a pin.
- **The expand control on any row**, which opens the detail band listing every value the collapsed
  pills hid.
- The row-selection checkboxes tick and untick.

**What does not:**

- **Only Development Stage has a working menu.** The chevrons on the other eight headers open
  nothing. Say so before handing over the mouse.
- **The checkboxes inside that menu do not filter.** Ticking Phase I does not change the count, the
  grid, or the pills. The menu is there to be read, not driven.
- Sort, Group and Aggregate in the toolbar; the crosses on the filter pills; `Clear all`;
  `Reset column`; the search boxes in both menus; `Export to Excel` — all presentational.
- Every number is authored to hang together for this one moment — the 14 stage counts sum to the
  1,091 in scope — but nothing recomputes.

One deliberate divergence to flag: the brief asked for a **multi-row, card-like entry per drug**.
What is built is one row per drug with wrapping pills and an expandable detail band. It solves the
same problem — the thirty-five-line record and the sideways scroll — but it is a denser answer than
a card, and it is a fair thing to push back on.

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
2. Separately, and regardless of that answer — is the grid right? One row per drug, pills that wrap,
   `+N` to expand, no sideways scroll, 9 of 37 columns under your control. Does it need to be the
   multi-row card you described, or is this dense version better for the work?
3. `or` inside a column and `and` between columns is all the logic this model offers. Is that enough
   for a real screen, or is there a query you build regularly that it could not express?
