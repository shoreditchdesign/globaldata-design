# Idea 2 — Full-pane screener

Companion to `IDEA-2-EVIDENCE.md`, which holds the quotes this direction was built from. This
document is for walking a client through the prototype.

## In one sentence

The filter builder comes out of the modal and becomes a permanent panel beside the results, and
drilling into the taxonomy opens a new column to the right instead of replacing the one you were
looking at — so the path you took stays on screen and two branches can be open at once.

## What we are trying to achieve

The complaint was that the modal was fiddly next to having the full pane, and that the tree lost
context because only one branch could be open at a time. The trap is that **the live product is
already full-pane and already loses context**: choosing a different attribute wipes the middle pane,
selected values carry no tick, and there are no counts anywhere until you commit and wait.

So this direction is not "the same thing, bigger". It attacks four specific costs in the measured
baseline:

- **Clicks.** Today a filter parameter costs about **3 interactions** — pick the attribute, focus
  the value picker, pick the value — and 12 interactions gets you two attributes and four values.
  Here a parameter is **two clicks**: open the attribute, click the value. The same worked example
  is 6 clicks rather than 10 clicks and 2 typed strings.
- **The blind commit.** There is no Search button. The total sits above the results and moves as you
  go, so the six-second round trip that tells you whether you have 12 rows or 12,000 disappears.
- **Counts before you spend.** Every attribute row and every value row carries its own number in the
  context of what you have already applied: Dermatology 126, Cardiovascular 20, Immunology 9. You
  can see which attributes can actually discriminate before clicking into one.
- **Lost context.** Nothing is wiped. Attributes stay in their column, values stay in theirs, and
  the indications you opened underneath stay open beside them. Selected values carry a tick, and any
  attribute holding a selection carries a badge with how many, so the query is legible from the
  panel alone — not only from the pill bar.

Success looks like an analyst building a four-parameter screen without ever losing sight of what
they have already chosen, and without ever guessing at the size of the result.

## How it differs from the other three

All four answer the same question — how do you get from 285,529 drugs to a set you can work with —
and the difference between them is **where the query lives**.

- **Here, the query lives in a permanent panel beside the results**, at roughly 40/60. Nothing is
  dimmed, nothing overlays anything, and the table never empties. The task reads as reducing a set
  rather than composing one in the dark. It is the most conventional of the four, and deliberately
  so: it is the shape the client asked for, done properly.
- **Idea 1 — the incumbent** puts the same query in a modal you open, fill and close, with the
  results dimmed behind it and an `Apply filters` commit at the end. Reaching one value takes three
  levels of cascading menu rather than two clicks. It does have things this direction does not:
  per-value counts were already there, and its Boolean is fully editable — `AND`/`OR`/`NOT` between
  chips and between groups.
- **Idea 3 — Query as a sentence** removes the panel entirely. Instead of navigating a taxonomy you
  describe the set in English and correct the sentence that comes back. It is far fewer
  interactions — one typed line against six clicks for the same query — but you cannot browse: the
  27 attributes under Drugs are not visible anywhere, so you have to know what to ask for. This
  direction is the opposite trade: more clicks, but the taxonomy is in front of you and countable.
- **Idea 4 — Results-first** removes the filter surface altogether and moves filtering into the
  grid's column headers. That saves the 40% of screen width this panel occupies, and it starts you
  in data rather than in a screener. What it gives up is exactly what this panel is for: you can
  only filter on columns that are in the grid, so the other 28 attributes have to be added as
  columns before they can be filtered on.

One thing to hold in mind when comparing: **this is the only one of the four with no
natural-language route at all.** Idea 1 has its AI tab, Idea 3 is entirely natural language. This
direction is a manual instrument, and if the answer to "how do natural language and structured
search combine" matters most, this is not the direction that answers it.

## What is built, and what is not

**One screen, at `/sprint-3/idea-2/screener`.** It opens on a worked example: Therapy area is
Dermatology or Cardiovascular, Drug geography is Europe, Development stage is Phase II or Phase III
— 146 drugs from 285,529, with the drill-down two levels into Dermatology.

**What responds to a click:**

- The drill-down itself. Clicking `Drugs`, then an attribute, then a therapy area opens each level as
  a new column to the right. Past three columns the leftmost folds away.
- The breadcrumb above the columns. Each crumb slides that column back into view without discarding
  anything to the right of it, and the ‹‹ control steps the window of three columns back one at a
  time. This is the answer to "sections upon sections" and it is worth demonstrating live.

**What does not:**

- **Selection.** The ticks, the badges and the pills are fixed to the worked example. Clicking a
  value does not select or deselect it, and the total stays at **146 whatever you click**. Only the
  navigation is live.
- The search field at the top of each column is a placeholder — it does not accept typing.
- The crosses on the pills, `Add filter`, `Clear all`, `Group by`, `Columns`, `Export` and the sort
  arrows in the table header are all presentational. The 15 result rows never change.
- The Boolean words in the pill bar — `is`, `or`, `and` — are written, not editable. As built, the
  model is `or` within an attribute and `and` between attributes; changing that is not in this
  prototype.
- The filter areas other than Drugs (Companies, Licensing Opportunities, and the rest) show their
  record counts but do not open.

The counts are authored to be internally consistent — the selected values under one attribute sum to
the live total — but they are stand-ins, not query results.

## The bet

That horizontal depth is different in kind from vertical depth.

The client's worry, raised on the same call where he liked this shape, was volume: "sections upon
sections upon sections… the overwhelming amount of stuff we've got might overwhelm that UI." This
direction assumes the problem was the **axis** — that being sent down a tree and losing the level
above it is what hurt, and that three columns side by side with counts fixes it.

If the problem was really the sheer **amount** of taxonomy — 27 attributes under Drugs alone, a
24-row therapy tree with sub-levels underneath — then three dense columns will feel exactly as
overwhelming as the tree did, and turning the depth sideways will have bought nothing. That is the
thing to test in the room, on the real taxonomy, not on a clean two-level example.

## What we want feedback on

1. With Therapy Area open two levels deep beside Development Stage, is "I lose the context" solved —
   or is the volume still the problem regardless of how it is laid out?
2. Three columns is a cap we chose. Is three right, or should the panel let you open a fourth and
   scroll, Finder-style, at the cost of a narrower results table?
3. This direction has no natural-language route and no editable Boolean. If it went forward, which of
   those two is the first thing that has to be added — and does the answer change if Idea 3 goes
   forward alongside it rather than instead of it?
