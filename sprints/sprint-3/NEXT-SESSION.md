# Next session — pick up here

State as of the end of the 2026-09-13 session. Sections 1 to 4 are agreed and specified but **not
built**. Section 5 records what was finished on 2026-09-07; section 8 records what was decided by
default on 2026-09-13 and what that leaves open.

Run `pnpm dev` and the four directions are at `/sprint-3/idea-{1,2,3,4}`. All four are clickable end
to end. Typecheck, lint and build all pass.

---

## 1. Idea 2 — Miller Columns: replace the agent panel with a spotlight — done, 2026-09-14

Done, along with the two fixes below and rather more besides — see `DECISIONS.md`, 2026-09-14, and
§9 for what the pass left open. The specification is kept as written for the record.

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

## 2. Idea 4 — Sidebar Agent: done, 2026-09-14

Done. The status bar (`StatusBar.tsx`) is gone, and everything it carried — thinking time,
what happened, the undo — now lives **inside the agent thread**, the way this section asked:
a thinking row that collapses to "Thought for Xs", step rows in three tenses as they land, and a
receipt closing the turn. The docked right-hand panel stays, at `w-[380px]`; the context lives in
the thread rather than in chrome around it, per the Zed reference below.

The propose-and-accept cycle is unchanged: the agent proposes, the change previews as
`15 → 4 drugs`, nothing moves until accepted.

**Amended 2026-09-14, round 2.** The grid's own 16/14 type scale is gone: on the client's
correction the grid, its chips and its count rail take Idea 3's table type — 13px cells, 10px
uppercase headers, 12px tags — so the directions read as one product. `StageBadge` drops its
`h-6 px-2 text-sm` override back to the shared size. The lane minimums were re-measured against
Geist rather than scaled, and the default nine columns now sum to 1,749px of scroll instead of
1,928px. The agent panel keeps every size it had; this was about the table, not the interface.

### Known bugs — one fixed, one still open

- **Fixed.** The transcript and the receipt no longer disagree. A `proposed` turn now carries the
  grid's `stateVersion` at the time it was made; if the grid has moved on since, the turn goes
  stale — Accept disables, "Run again" replaces it, and the turn says the grid changed since it was
  proposed — rather than staying accept-able against a state it no longer describes.
- **Still open.** Undo is still a whole-state snapshot, so undoing an agent step also discards any
  column or sort changes made by hand since. This is now disclosed rather than hidden: the Undo
  control's tooltip reads "Also reverts hand edits made since."

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

## 8. Open from the 2026-09-13 refinement pass — updated 2026-09-14

Two of the three questions below are settled; `StageBadge` is still open.

- **Does the links-and-buttons-only colour rule spread to ideas 1, 2 and 4?** Settled: yes. It's now
  a repo-wide mid-fidelity wireframe colour rule rather than an Idea 3 special case — see `CLAUDE.md`
  for the full rule and `DECISIONS.md` for what changed where. Idea 3 has been brought onto it.
- **Should chips go neutral at rest?** Settled: no. Chips keep `brand-tint` — ticking or opening one
  is still read as a button press, so they stay blue under the repo-wide rule too. What changed is
  their hover: they no longer shift fill on hover or open, only lift with `shadow-panel`.
- **Does `StageBadge`'s blue ramp conflict with a narrower accent rule?** Still open. It's unchanged,
  still reading pipeline position with fills under 0.06 chroma, and it's still the one place blue
  carries information rather than an action on every direction that shows it. Worth checking side by
  side with the settled wireframe rule above, and against the calmer brand value logged in
  `DECISIONS.md`, 2026-09-14 — the badges were tuned against the old, louder `brand`.

Separately: the brand accent itself was toned down on 2026-09-14 (`CLAUDE.md`, `DECISIONS.md`) but
hasn't been looked at in a running browser yet. Worth a pass before calling it final — the contrast
numbers check out on paper, but paper isn't a screen.

Also from 2026-09-14: Idea 3's value-pill hover-reveal `×` hasn't been seen in a browser yet either —
worth checking the fade-in/fade-out timing against the chevron it replaces, and that the chip width
genuinely never shifts. On touch it only appears on focus, which is a known compromise rather than a
bug.

Also from 2026-09-14: Idea 4's refinement pass settles the colour law referenced throughout this
section — see `CLAUDE.md`'s accent section and the matching `DECISIONS.md` rows for the final
rule (solid brand on primary actions, checked controls, chips and links; washed brand on every
other selected state; grey hover; neutral focus). Ideas 2 and 3 are being swept onto it by their
own sessions in parallel with this one, so a Miller row, a segmented toggle or a menu option that
still reads old-rule blue in either of those ideas belongs to that work, not to this pass.

Two verification gaps left open at the end of the Idea 4 session: `pnpm build` was not run (only
`pnpm typecheck` and `pnpm lint`, both green), and the 1280px breakpoint was not properly confirmed
— the visual check was done at 1440px. Worth both before calling the grid final.

---

## 9. Open from the 2026-09-14 Idea 2 pass

The spotlight, the 80/20 split, the panel foot, the record drawer and the 16px baseline all landed
(see `DECISIONS.md`, 2026-09-14). What is left open:

- **`StageBadge` is still `text-[11px]`**, which now makes it the most visible sub-12px element on
  the screen — it sits in a 16px table cell and again in the drawer header. All four directions share
  it, so raising it is a cross-direction decision rather than Idea 2's to take.
- **The open Miller row is `brand-tint`**, a very pale blue, against a client complaint that the
  colours are washed out. Needs their eye on an open row beside a hovered one and a ticked one before
  it is called settled.
- **`bg-negative/60` on a ticked excluding row** is the last alpha step left in the idea. Removing it
  needs a `negative-wash` token rather than a call-site edit.
- **Bare `opacity-50` disabled steps** in `src/components/ui/dropdown-menu.tsx` and `checkbox.tsx` —
  the pattern CLAUDE.md's disabled rule rejects, though neither is a `Button`, so the rule does not
  literally reach them. For whoever owns `src/components/ui`.
- **Two for the client.** Whether ⌘K should toggle the spotlight or only open it, and whether the
  agent run strip should keep echoing the request and its `Read as …` line — it reports how the
  authored plan read the request, so it is arguably a disclosure rather than fluff, but the foot is
  already carrying the count, the steps, the pills, `Ask` and `Clear all`.
