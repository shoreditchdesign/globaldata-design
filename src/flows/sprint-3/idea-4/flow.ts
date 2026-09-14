import type { Flow } from "@/flows/types"
import { Grid } from "@/flows/sprint-3/idea-4/screens/Grid"

/**
 * Results-first. There is no filter surface: the grid is the interface, and
 * filtering happens in the column headers the way it happens in Excel. The
 * second half of the direction is the grid itself — the live results view has
 * never been redesigned, and it is the thing the CPO complains about most.
 *
 * The AI surface is a docked panel that acts on the data and its presentation
 * rather than on a query object, proposes before it acts, and shows its work
 * in the thread: what it matched, the steps as they land, and a receipt with
 * an undo.
 */
export const sprint3Idea4: Flow = {
  id: "idea-4",
  name: "Idea 4 — Sidebar Agent",
  premise:
    "No filter surface at all. You land in the grid and filter from the column headers, Excel-style, with counts in every menu — and a docked assistant acts on the same grid: it proposes filters, columns, sorting and grouping, you accept, and its thread shows what it matched, each step landing, and a receipt with an undo.",
  rationale: [
    "Answers Bina's point literally: the users are Excel-habituated, so aggregate, group, sort and columns sit in the table's own header rather than inside a screener.",
    "Takes the second, unanswered complaint too. The results view is the part nobody has redesigned, and it is where the CPO's 'falls off the side of the screen' objection actually lives.",
    "The table's header is two rows: the title with Aggregate, Group, Sort, Columns and Export on the right, then the applied filters. The only other chrome is the match count at the bottom right.",
    "One drug is one row. Multi-valued attributes render as tags capped with a +N that opens every value in a popover, so a row never grows and the lanes stay aligned — replacing the merged rows that let a single drug fill a viewport.",
    "Legibility beats fitting. The grid carries Idea 3's table type — 13px cells under 10px uppercase headers — and headers never wrap; past the lanes' minimum widths the grid scrolls sideways with the checkbox and drug name frozen on the left.",
    "Column management the live product does not have: nine columns shown, more available, each hideable, movable and pinnable, against eight locked columns today.",
    "The AI acts on the data and its presentation, not on a query object — 'show me only the ones in Europe', 'add the NPV column', 'group by company' — which is what separates it from the chat tab in Idea 1, the filter-tree driver in Idea 2 and the sentence in Idea 3.",
    "Staged, not immediate: the agent proposes a plan with a preview of the row count, one click accepts, and a dismiss is always offered. A proposal the grid has moved past goes stale rather than applying over the change.",
    "AI-editability is answered in the thread. Each turn shows the rules it matched, the steps ticking as they land in the grid, and a receipt with the result, the time taken and an undo.",
    "Tests: can the grid be the interface, and does a visible working record make an AI that edits data trustworthy.",
  ],
  source: "Sprint 1, approach 4 (Filter Dropdowns) pushed into the results view — no Paper source",
  lastUpdated: "2026-09-14",
  tags: ["Results-first", "Column filters", "Grid redesign", "Docked agent", "Agent thread"],
  status: "in-progress",
  screens: [
    {
      slug: "grid",
      title: "Working grid",
      note: "Three filters applied by the assistant's opening turn, every column menu live, and a thread that shows each proposal's thinking, steps and receipt with an undo.",
      viewport: "desktop",
      component: Grid,
    },
  ],
}
