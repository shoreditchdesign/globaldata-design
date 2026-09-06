# Idea 4 — Results-first (column-header filtering + redesigned grid)

## Why we are exploring this

Neil made one complaint in Sprint 1 that nobody has yet designed against directly: the results grid
itself, independent of how filtering works. He asked for a non-linear, pill-style multi-row grid
instead of a flat spreadsheet, and Bina separately flagged that the target users are
Excel-habituated, so sort, filter and aggregates belong at the top level, not buried in a sidebar.
This direction starts there and takes it further than anyone has asked for: if the grid is the one
thing he's reacted to specifically, what happens if the grid becomes the whole interface — filtering
from the column headers, no separate filter surface at all.

## The evidence

Ordered strongest first. Timestamp not available in transcript for every entry below.

1. **"The grid falls off the side of the screen."** — Neil Dodgson, *Sprint 1 Review (Design)*, 13
   Aug 2026. Timestamp not available in transcript.
   *Implication: a direct, specific complaint about the results view, independent of the filter
   question — this is the one design element he named unprompted.*

2. **"Instead of having it for each entry, each result... rather than have just a linear kind of list
   of things like it's an excel spreadsheet, you could create a multi row entry for that... a bit
   more, almost like pill like."** — Neil Dodgson, same meeting (13 Aug). He also offered to send
   concrete examples separately: *"I'll send you something offline... I've done things in the
   past."* Timestamp not available in transcript.
   *Implication: this is close to a direct brief for the grid redesign half of this direction — a
   non-linear, card/pill-style results view rather than a flat table with merged rows.*

3. **"Given the type of persona probably we are dealing here with they are more habituated towards
   using Excel... sorting, searching etc even the average, mean, median if it is required... something
   on top level or like in a row would be much easier to read and work on."** — Bina Patel, same
   meeting (13 Aug). Timestamp not available in transcript.
   *Implication: Bina is a stakeholder, not the decision-maker — Neil never personally contradicted
   or endorsed this — but it directly supports putting sort, filter and aggregate at the top of the
   grid rather than in a side panel, which is what column-header filtering does.*

4. **"I want AG Grid with a load of commercial [functionality]... so we don't have [15,000]
   variations of tables which people have built over time."** — Neil Dodgson, *Shoreditch Design
   Sync: Design and Tech*, 2 Sep 2026 (dev-facing context, mandating a single grid component for the
   rebuild). Timestamp not available in transcript.
   *Implication: dev-facing, not a design-review comment, but it shows the grid's inconsistency is
   still front of mind for him three weeks later — a live concern to design against, not a one-off.*
   Note: an internal ledger (`NEIL-LEDGER.md` §1) previously attributed a "14,000 different versions
   of the grid, no consistency between them" quote to Neil at this meeting. Re-checked against the
   transcript directly: that "14,000" line is Richard Barnett's, from the separate 11 Aug *In-Office
   Catch-up* (Richard only on the client side that call), and the number Neil actually used on 2
   September, in a different context, was "15,000 variations of tables." Corrected here.

5. **The column-header filtering mechanic itself has no client mandate.** Neil has never commented on
   column-header filtering specifically, and no transcript reviewed shows him asked about it. What we
   have instead: on the live platform, a column-header funnel icon exists on every results column and
   gave no visible response in three separate attempts to open it (`PLATFORM-WALKTHROUGH.md`) —
   whether it duplicates or intersects the main screener's filters isn't discoverable from the UI at
   all. This is genuinely thin evidence, and it should be presented as such rather than stretched: we
   are exploring this because the live product measurably fails here — a second, undiscoverable
   filter system sitting unused in the header row — not because the client asked for this specific
   mechanic.

## What this direction is betting

That Excel-habituated users will find filtering from the grid itself more intuitive than a dedicated
filter surface, and that starting in the grid with no upfront filter step is still a "screener" in
spirit. That second half is the risk: Neil's own stated working model, given in his own words, is to
set criteria up front and only then retrieve results — *"I want to set the criteria that then when I
hit the return key... it gives it to me... I'm screening."* (relayed via Richard, *In-Office
Catch-up*, 11 Aug — Neil's own account of his usage, as voiced back by Richard on that call, not a
live Neil quote from this specific meeting). Results-first inverts that sequence. If that model is
truly how he thinks about the product, this is the direction most likely to be rejected on the
"screener" question alone, independent of how well the grid itself is executed.

## What we would need from the client to validate it

This is the named, unresolved ambiguity in the record (`NEIL-LEDGER.md` §6): does the user set
criteria first, or does the grid come first with filtering layered on top? Ask directly, with this
direction as the concrete test case: does starting in the grid, with no separate filter step, fit how
he actually uses the product himself — or does it fight the "screener" model he's described in his
own words. This direction cannot be judged on the grid redesign alone; that question has to be
answered first.
