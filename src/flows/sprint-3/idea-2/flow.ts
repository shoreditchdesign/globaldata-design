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
  name: "Idea 2 — Full-pane screener",
  premise:
    "The filter tree drills sideways, not down. Each level opens as a new column beside the previous one, so the path you took stays on screen and two branches can be open at once.",
  rationale: [
    "Approach 1 grown up. The client liked the stepper shape and worried about depth — \"sections upon sections upon sections\". Miller columns turn that depth horizontal, cap it at three, and fold the rest into a live breadcrumb.",
    "It fixes the flaw that is in the live product too: switching attribute wipes the pane you were working in. Here nothing is wiped, so nothing has to be remembered.",
    "Counts sit on every attribute row and every value row, so the user knows what a click will cost before spending it. The live product shows none, then commits blind for six seconds.",
    "Every chosen value carries a tick and a highlight, and every attribute holding a selection carries a badge — the applied query is legible from the panel alone, not only from the pill bar.",
    "The panel and the results coexist at roughly 40 / 60. Nothing is dimmed, nothing overlays anything, and the table never empties — the task reads as reducing a set, not composing a query in the dark.",
  ],
  source: "Sprint 1 — Approach 1 (Side Navigation), rebuilt on Miller columns",
  lastUpdated: "2026-09-06",
  tags: ["Full pane", "Miller columns", "Counts everywhere", "Non-modal"],
  status: "in-progress",
  screens: [
    {
      slug: "screener",
      title: "Screener",
      note: "Three filters applied, the drill-down two levels deep, 146 drugs left.",
      viewport: "desktop",
      component: Screener,
    },
  ],
}
