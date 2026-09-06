# Idea 1 — The incumbent

Companion to `IDEA-1-EVIDENCE.md`, which holds the quotes and the record of why this design was
rejected. This document is for walking a client through the prototype.

## In one sentence

This is the filter-builder modal you reviewed on 2 September, rebuilt unchanged, so the three new
directions have something real to be compared against instead of a written summary of what was
wrong with it.

## What we are trying to achieve

Nothing, in the sense that we are not proposing it. Its job in this set is to be the fixed point.

The measured baseline on the live platform is about **12 interactions** from landing to a filtered
set of two attributes and four values — roughly **3 clicks per filter parameter**, so a typical
three- or four-parameter screen costs **13–16 clicks** and one blind six-second commit where you
find out whether you produced 12 rows or 12,000.

This design moved two of those things and not the third. It put per-value counts into the picker,
so you can see that Dermatology holds 126 and Immunology holds 9 before you spend the click. It put
the finished query into a bar above the results, editable without reopening anything. But reaching
a single value still costs three levels of cascading menu — area, then attribute, then value — and
there is still an **Apply filters** step, so the total is still only known after you commit. That is
the specific reading behind the client's own observation that the manual side felt like a similar
number of clicks to the product he already has.

Success for this direction is therefore not "it wins". Success is that showing it satisfies the
request for the working and the discarded options, rather than the conclusion on its own.

## How it differs from the other three

All four answer the same question — how do you get from 285,529 drugs to a set you can work with —
and the difference between them is **where the query lives**.

- **Here, the query lives in a modal you open, fill in, and close.** Filtering is a separate mode
  from looking at results: the table dims behind the overlay, and you commit with a button. That
  containment is what drew the "fiddly… versus having the full pane" objection, and it is the one
  thing none of the other three do.
- **Idea 2 — Full-pane screener** keeps this design's underlying logic and takes away the overlay.
  The query lives in a permanent panel beside the results, at roughly 40/60. Drilling in opens a new
  column to the right instead of a menu on top of a menu, so the path you took stays on screen and
  two branches can be open at once. Reaching a value costs two clicks instead of three levels, and
  there is no Apply — the total moves as you go.
- **Idea 3 — Query as a sentence** takes away the builder as well. The query lives in one line of
  English above the results: you describe the set you want, and what comes back is a sentence whose
  values and operators are all editable in place. It is the descendant of this design's AI tab —
  the part of Sprint 2 that drew questions rather than criticism — with the manual builder beside it
  removed, so there is one representation of the query rather than a transcript and a panel to
  reconcile.
- **Idea 4 — Results-first** takes away the filter surface entirely. The query lives in the grid's
  column headers. You land in data rather than an empty screener, and you cut the set down from the
  columns you are already reading, Excel-style.

Two honest notes so the comparison is fair. First, this design is not the live product: it already
has counts in the picker and an editable filter bar, which the production screener has neither of.
The objections against it were shape, click cost and lost context — not an absence of numbers.
Second, its Boolean model is the most complete of the four as built: `AND`/`OR`/`NOT` dropdowns
between chips within a group and between groups. Idea 2 shows Boolean but you cannot change it,
Idea 4 offers `or` inside a column and `and` between columns only, and Idea 3 moves it into words in
the sentence.

## What is built, and what is not

**Twelve fixed frames, none of them interactive inside the frame.** This is a faithful port of what
was reviewed, so it behaves like a click-through of that review, not like software.

You can move between the twelve screens with the Explorer (Cmd/Ctrl+Shift+E), or the previous/next
controls in it. The sequence runs: the unfiltered results table; the AI tab empty, typed and parsed;
the manual tab at area, attribute, value and selected; the applied state; editing from the filter
bar; the ten-plus-filter state; and results grouped by development stage.

Inside any one frame, nothing responds. The `AI filter` / `Manual filter` tabs are drawn, not
clickable. The cascading pickers are drawn open — each level is a separate frame rather than
something you open yourself. `Apply filters`, `Clear filters`, the `AND`/`OR`/`NOT` dropdowns, the
crosses on chips and the prompt box are all presentational. Every number is authored: 285,529
unfiltered, 245 after the ten-filter state, and the per-value counts in the picker.

Worth showing deliberately: the **ten-plus filters** frame. It is included because it is where the
pattern strains — seven groups of chips wrapping across three rows above the table — and dropping it
would be presenting the conclusion again.

## The bet

That re-showing a rejected design, unsoftened, reads as showing the working rather than as not
having listened.

If the client has moved on from Sprint 2 and does not want to see it again in any form, this
backfires, and it backfires first in the room — it is the frame we open on. The mitigation is
labelling: it is introduced as the baseline being argued against, not as a fourth candidate.

## What we want feedback on

1. Does having the rejected design in the set, and argued against, answer the "conclusion without
   the working" objection — or does re-surfacing it read as relitigating a decision you consider
   closed?
2. Of the things this design did get right — per-value counts before you commit, the filter bar you
   can edit without reopening the builder, `AND`/`OR`/`NOT` on every chip — which must survive into
   whichever direction we take forward?
3. Was the objection the modal specifically, or the three-levels-of-menus cost of reaching one
   value? Idea 2 fixes both; Ideas 3 and 4 make the second one moot by removing the builder
   altogether. Knowing which of the two mattered more tells us where to spend the next sprint.
