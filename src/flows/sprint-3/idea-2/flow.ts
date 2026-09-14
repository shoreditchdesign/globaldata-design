import type { Flow } from "@/flows/types"
import { Screener } from "@/flows/sprint-3/idea-2/screens/Screener"

/**
 * Sprint 1's Approach 1 — the one Neil called "almost like a stepper
 * approach" — with its one fatal flaw fixed. Drilling into the filter tree no
 * longer replaces the level you were on; each level opens as a column beside
 * the last, so the path stays visible and more than one branch stays open.
 */
export const sprint3Idea2: Flow = {
  id: "idea-2",
  name: "Idea 2 — Miller Columns",
  premise:
    "The filter tree drills sideways, not down. Each level opens as a new column beside the previous one, so the path you took stays on screen and two branches can be open at once.",
  rationale: [
    "Approach 1 grown up. The client liked the stepper shape and worried about depth — \"sections upon sections upon sections\". Miller columns turn that depth horizontal, cap it at three, and fold the rest into a live breadcrumb.",
    "It fixes the flaw that is in the live product too: switching attribute wipes the pane you were working in. Here nothing is wiped, so nothing has to be remembered.",
    "Counts sit on every attribute row and every value row, so the user knows what a click will cost before spending it. The live product shows none, then commits blind for six seconds.",
    "Every chosen value carries a tick, and every attribute holding a selection carries its name in medium weight — the applied query is legible from the panel alone, not only from the pill bar.",
    "The columns are the work and the results are the evidence, so the window is split down the middle. The panel keeps the room two columns of long taxonomy labels need; the table gets enough width to be read rather than glanced at, and the whole record still opens on demand.",
    "The filter columns are never replaced — drilling in adds a column rather than wiping the one you were on. Two things do arrive over them, both summoned and both dismissable: ⌘K drops the agent spotlight, and Open on a drug name slides the record in behind a scrim.",
    "Three columns up front — name, stage, company — and every other field a drawer away rather than a column away, which is the two or three the client asked for. The table reads at Idea 3's sizes, so the directions are one product rather than two prototypes.",
    "Selection is live. A fixed sample of 1,440 drug rows is filtered in memory, so the headline count, the per-value counts, the pills and the table are all read off the same set and cannot disagree. Where a combination matches nothing, the screen says so rather than padding.",
    "The agent is summoned, not resident. ⌘K takes one request in plain language and goes; the steps then appear in the foot of the panel and drive the columns in view — values tick, pills appear, the count falls — each one individually undoable. Touch a column and it stops and hands back.",
    "The filter surface is independent of the display: the screen arrives already filtered on molecule type, which the table shows in no column at all. Anything in the taxonomy can be filtered on whether or not it is on screen.",
    "At the sprint's 1440px review viewport the panel holds two columns; a third needs 2,280px. The column count yields to the 16px labels rather than the other way round, which is this direction's own premise — cap the depth on screen and let the breadcrumb carry the rest.",
  ],
  source: "Sprint 1 — Approach 1 (Side Navigation), rebuilt on Miller columns",
  lastUpdated: "2026-09-14",
  tags: [
    "Full pane",
    "Miller columns",
    "Counts everywhere",
    "Columns never replaced",
    "Agent drives the UI",
  ],
  status: "in-progress",
  screens: [
    {
      slug: "screener",
      title: "Screener",
      note: "Four filters applied, the drill-down two levels deep, 40 of 1,440 sampled drugs left. Selection and pills are live. One agent request is wired, and its plan is authored rather than parsed; what the steps do to the filters, the counts and the table is real.",
      viewport: "desktop",
      component: Screener,
    },
  ],
}
