import type { Flow } from "@/flows/types"
import { Grid } from "@/flows/sprint-3/idea-4/screens/Grid"

/**
 * Results-first. There is no filter surface: the grid is the interface, and
 * filtering happens in the column headers the way it happens in Excel. The
 * second half of the direction is the grid itself — the live results view has
 * never been redesigned, and it is the thing the CPO complains about most.
 *
 * The AI surface is a docked panel that acts on the data and its presentation
 * rather than on a query object, proposes before it acts, and leaves a receipt
 * for every change on a status bar along the bottom.
 */
export const sprint3Idea4: Flow = {
  id: "idea-4",
  name: "Idea 4 — Results-first",
  premise:
    "No filter surface at all. You land in the grid and filter from the column headers, Excel-style, with counts in every menu — and a docked assistant acts on the same grid: it proposes filters, columns, sorting and grouping, you accept, and a status bar along the bottom records what it did with an undo.",
  rationale: [
    "Answers Bina's point literally: the users are Excel-habituated, so sort, filter, group and aggregate sit at the top level of the grid rather than inside a screener.",
    "Takes the second, unanswered complaint too. The results view is the part nobody has redesigned, and it is where the CPO's 'falls off the side of the screen' objection actually lives.",
    "One drug is one row. Multi-valued attributes render as wrapping pills capped with a +N that expands into a full-width detail band, replacing the merged rows that let a single drug fill a viewport.",
    "No horizontal scroll at the default nine columns. The lanes' minimum widths sum to 866px, so the grid compresses beside the agent panel rather than running off the side of the screen.",
    "Column management the live product does not have: nine columns shown, more available, each hideable, movable and pinnable, against eight locked columns today.",
    "The AI acts on the data and its presentation, not on a query object — 'show me only the ones in Europe', 'add the NPV column', 'group by company' — which is what separates it from the chat tab in Idea 1, the filter-tree driver in Idea 2 and the sentence in Idea 3.",
    "Staged, not immediate: the agent proposes with a preview of the row count, one click accepts, and a dismiss is always offered.",
    "AI-editability is answered by the receipt. The status bar names the last action, its result and how long it took, carries an undo for it, and holds the full session history.",
    "Tests: can the grid be the interface, and does an audit trail make an AI that edits data trustworthy.",
  ],
  source: "Sprint 1, approach 4 (Filter Dropdowns) pushed into the results view — no Paper source",
  lastUpdated: "2026-09-06",
  tags: ["Results-first", "Column filters", "Grid redesign", "Docked agent", "Audit trail"],
  status: "in-progress",
  screens: [
    {
      slug: "grid",
      title: "Working grid",
      note: "Three filters applied, every column menu live, and a docked assistant that proposes changes to the grid with an undo on the status bar.",
      viewport: "desktop",
      component: Grid,
    },
  ],
}
