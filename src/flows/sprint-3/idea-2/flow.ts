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
    "Every chosen value carries a tick and a highlight, and every attribute holding a selection carries a badge — the applied query is legible from the panel alone, not only from the pill bar.",
    "The panel and the results coexist at roughly 40 / 60. Nothing is dimmed and nothing overlays anything — the task reads as reducing a set, not composing a query in the dark.",
    "Selection is live. A fixed sample of 1,440 drug rows is filtered in memory, so the headline count, the per-value counts, the attribute badges, the pills and the table are all read off the same set and cannot disagree. Where a combination matches nothing, the screen says so rather than padding.",
    "The agent is a third region of the same panel, not an overlay and not a chat. A request in plain language resolves into discrete steps that drive the columns in view — values tick, pills appear, the count falls — and each step is individually undoable. Touch a column and it stops and hands back.",
    "The filter surface is independent of the display: the screen arrives already filtered on molecule type, which is not one of the table's six columns. Anything in the taxonomy can be filtered on whether or not it is on screen.",
  ],
  source: "Sprint 1 — Approach 1 (Side Navigation), rebuilt on Miller columns",
  lastUpdated: "2026-09-07",
  tags: ["Full pane", "Miller columns", "Counts everywhere", "Non-modal", "Agent drives the UI"],
  status: "in-progress",
  screens: [
    {
      slug: "screener",
      title: "Screener",
      note: "Four filters applied, the drill-down two levels deep, 40 of 1,440 sampled drugs left. Selection, pills and the agent panel are all live.",
      viewport: "desktop",
      component: Screener,
    },
  ],
}
