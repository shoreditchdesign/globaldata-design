# Next session — pick up here

State as of the end of the 2026-09-07 session. Sections 1 to 4 are agreed and specified but **not
built**. Section 5 records what was finished.

Run `pnpm dev` and the four directions are at `/sprint-3/idea-{1,2,3,4}`. All four are clickable end
to end. Typecheck, lint and build all pass.

---

## 1. Idea 2 — Miller Columns: replace the agent panel with a spotlight

The persistent agent panel docked at the bottom of the filter rail is the weakest thing on the
screen. It reads as a box rather than as a way in, and it competes with the Miller columns for
height — on a 900px laptop the taxonomy lists get short.

Replace it with a **macOS Spotlight-style overlay**:

- The natural-language prompt sits as **a single line of text at the bottom** of the filter region,
  showing the request that produced the current filter state.
- **Clicking or editing that line opens the spotlight** — a centred overlay with a text input and a
  list of recommendations underneath.
- Typing runs the existing prebuilt plan. The wiring behind it does not change; only the surface it
  is summoned from.
- Dismissing returns to the screen with the prompt line updated.

The agent's actual behaviour — driving the columns, ticking values one at a time, per-step undo,
yielding when you take over — is already built and should be preserved exactly. This is a change of
entry point, not of mechanic.

### Also fix, while in there

- **The double column header.** Each Miller column currently has a label on the left and a second
  one on the right (`15 ATTRIBUTES` / `VALUES`, then `THERAPY AREA` / `DRUGS`). It is unclear which
  is the column's name and which is describing the number beside it. Settle on one model of what a
  column head is and apply it to every column.
- **The breadcrumb and the `‹‹` control.** The breadcrumb above the columns plus the double-chevron
  that jumps the window back to the left is confusing, and it is hard to tell the breadcrumb apart
  from the column headers beneath it. Redesign the whole strip.

---

## 2. Idea 4 — Sidebar Agent: remove the status bar, move context into the thread

The thin status bar along the bottom is being read as a second, competing surface. Remove it.

The information it carries belongs **inside the agent thread**, expressed the way Claude and ChatGPT
express reasoning inline:

- Thinking time on the turn that caused it.
- A collapsible summary of what happened, in the thread rather than in a separate bar.
- The activity log as thread history rather than as a strip.
- Possibly checkpoints, so a reviewer can step back to a known state.

Keep the docked right-hand panel — the reference is the Zed screenshot: a sidebar, with the context
living in the thread rather than in chrome around it.

The propose-and-accept cycle stays as built: the agent proposes, the change previews as
`15 → 4 drugs`, nothing moves until accepted.

### Known bugs to fix at the same time

- **The transcript and the receipt disagree.** An old proposal card stays accept-able against a grid
  that has since moved on, and a card saying "Applied to the grid" keeps saying it after you undo.
- **Undo is a whole-state snapshot**, so undoing an agent step also discards the column and sort
  changes you made by hand since.

---

## 3. Idea 1 — Modal / Sidebar Takeover: the redesign, if we take it

**Decide this deliberately before building it.** Idea 1 is currently a faithful port of the design
the client rejected, and that is what makes it useful as a baseline. The two changes below turn it
into a fifth direction rather than the incumbent, and we lose the fixed point everything else is
measured against.

If we go ahead:

- **Modal becomes a sidebar takeover.** Roughly 80% of viewport width, entering from the side, with
  a scrim over what remains. More room to work in, and it answers Neil's point about losing sight of
  the interface behind the modal.
- **Simplified Miller columns replace the chip cascade** in the manual filter. The current chips do
  not communicate which rows are filterable and which are containers; the middle-column approach
  does that for free. Simpler than Idea 2's version — this is a supporting pattern here, not the
  argument.

---

## 4. Canvas direction — parked

A Sankey-style flow canvas: nodes as filter steps, edge width as volume, branch by dragging off a
node, merge two branches with a union or intersect node (which would express `(a AND b) OR (c AND
d)`, currently inexpressible on the live platform), notes on the canvas, split pane with the results
table, chat that builds the graph.

The framing that makes it defensible: **you do not draw the canvas, the canvas draws itself as you
filter** — so it is a record of your work with branching available, not something you must compose
on.

Sizing: roughly two agents plus a revision pass, against one agent for each of the others. Most
likely of any direction to need a second attempt, since there is no precedent in the repo to lean
on. Right thing to build if we want a "here is how far we pushed it" slide; wrong thing to build
while three directions still need presentation work.

---

## 5. Done — repository is private, history purged, pushed

Resolved at the end of the 2026-09-07 session. Recorded here because earlier notes said otherwise.

- The repository is **private**. It was public while the research and the client's platform
  screenshots were on it; that is closed.
- The 48MB Sprint 1 deck is **purged from history**, taking the repository from 50MB to 1.5MB. The
  file is still on disk at `docs/sprint-3/Sprint 1.pdf`, now covered by a `*.pdf` ignore rule. Its
  content is written up in `DESIGN-BRIEF.md`.
- `docs/`, `slides/` and `sprints/` are **tracked again**, since the exposure reason went away with
  the visibility change and the evidence belongs with the code.
- `origin/main` is up to date. Vercel's framework preset is pinned to Next.js in `vercel.json`,
  which fixes the "no Output Directory named public" build failure.

## 6. Known weaknesses, unfixed and honest

Worth knowing before anyone shows these to a client.

- **The explainer files are stale.** Every `IDEA-*-EXPLAINER.md` still lists controls as
  presentational that now work. They need rewriting before a client reads them.
- **Sample sizes are inconsistent** — 46 rows in Idea 4, 78 in Idea 3, 1,440 in Idea 2. Each is
  labelled honestly on screen, but the inconsistency shows if the four are compared side by side.
- **Idea 2's facets go bleak at depth.** Once the set is down to ~40 rows most values in a column
  read 0. Correct, but three columns of zeros undercuts the browsable-taxonomy pitch.
- **Idea 2's agent runs one canned request.** Type anything else and it does the same four steps.
- **Idea 3 can land on one or two rows** for a narrow query like `egfr oral phase 3`. Reads as a thin
  sample rather than a contradiction, which is the right failure mode, but a reviewer who narrows
  twice will reach it.
- **`(a AND b) OR (c AND d)` is still inexpressible** in every direction, which is the live
  platform's own flaw. Only the parked canvas direction solves it.

---

## 7. Housekeeping

- **No global `~/.claude/CLAUDE.md` exists.** Tone-of-voice preferences are saved to this project's
  memory only, so they will not apply in other repos. Worth creating one.
- `MESSAGE.md` in the repo root is the internal Slack update, gitignored. Its links are correct —
  the rename changed display names, not routes.
