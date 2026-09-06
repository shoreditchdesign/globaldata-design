import type { Flow } from "@/flows/types"
import { Grid } from "@/flows/sprint-3/idea-4/screens/Grid"

/**
 * Results-first. There is no filter surface: the grid is the interface, and
 * filtering happens in the column headers the way it happens in Excel. The
 * second half of the direction is the grid itself — the live results view has
 * never been redesigned, and it is the thing the CPO complains about most.
 */
export const sprint3Idea4: Flow = {
  id: "idea-4",
  name: "Idea 4 — Results-first",
  premise:
    "No filter surface at all. You land in the grid and filter from the column headers, Excel-style, with counts in every menu — and the grid is redesigned so one drug is one row however many indications or geographies it carries.",
  rationale: [
    "Answers Bina's point literally: the users are Excel-habituated, so sort, filter, group and aggregate sit at the top level of the grid rather than inside a screener.",
    "Takes the second, unanswered complaint too. The results view is the part nobody has redesigned, and it is where the CPO's 'falls off the side of the screen' objection actually lives.",
    "One drug is one row. Multi-valued attributes render as wrapping pills capped with a +N that expands in place, replacing the merged rows that let a single drug fill a viewport — the worst record in this set is five lines, not thirty-five.",
    "No horizontal scroll at any width. Fixed lanes for the single-valued columns, flexible lanes for the multi-valued ones, so the grid compresses rather than running off the screen.",
    "Column management the live product does not have: nine columns shown of thirty-seven, each hideable, reorderable and pinnable, against eight locked columns today.",
    "Nothing is committed blind. Every value in a column menu carries its count, and the grid is already narrowed behind the open menu.",
    "Tests: can the grid be the interface, and does that suit Excel-habituated users.",
  ],
  source: "Sprint 1, approach 4 (Filter Dropdowns) pushed into the results view — no Paper source",
  lastUpdated: "2026-09-06",
  tags: ["Results-first", "Column filters", "Grid redesign", "Non-modal", "Excel-habituated"],
  status: "in-progress",
  screens: [
    {
      slug: "grid",
      title: "Working grid",
      note: "Three filters applied, the Development Stage menu open with counts, and the widest record expanded in place.",
      viewport: "desktop",
      component: Grid,
    },
  ],
}
