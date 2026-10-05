import type { Flow } from "@/flows/types"
import { Start } from "@/flows/sprint-4/idea-1c/screens/Start"

/**
 * A duplicate of Idea 1b, taken to explore a structural difference against it.
 * Identical to it at the point of the copy, so that whatever changes here is
 * the thing being tested and the two can be read side by side.
 */
export const sprint4Idea1c: Flow = {
  id: "idea-1c",
  name: "Idea 1c — In progress",
  premise:
    "Idea 1b, reworked after the 5 October client review into the version Sprint 5 tests: one place to build a filter by hand (Add filter and a column's Edit filters both open the Miller tray), Drugs first and open by default, a value tree the columns can drill, no Excludes, and the query field back at the head of Quick search.",
  lastUpdated: "2026-10-05",
  status: "in-progress",
  screens: [
    {
      slug: "start",
      title: "Start",
      note: "A natural-language starting point, with Quick search / Advanced search tabs directly over the field and the ten commonly used filters under it.",
      viewport: "desktop",
      component: Start,
    },
    {
      slug: "values",
      title: "A pill pressed",
      note: "A pill puts its clause in the filter box at Select value, and pressing it again takes the clause out. The value is chosen from the clause's own selector rather than from a further layer of pills.",
      viewport: "desktop",
      component: Start,
    },
    {
      slug: "manual",
      title: "Advanced search",
      note: "The Advanced search tab puts the Miller columns under the field in place of the pills, with the filter box always beneath them. Drugs leads the area list and is open by default, so two columns are filled. Values with values under them (therapy area › indication, region › country) carry a chevron and drill; three columns show at a time and slide.",
      viewport: "desktop",
      component: Start,
    },
    {
      slug: "picked",
      title: "Filter from a path",
      note: "A value chosen builds the same filter box as a resolved query, holding one filter for it.",
      viewport: "desktop",
      component: Start,
    },
    {
      slug: "results",
      title: "Results",
      note: "The worked query searched: the filter box across the full width, then the search panel beside the AG Grid-style table. The panel's head holds the Quick search / Advanced search tabs on the left and a close button on the right; Quick puts the query field under them with the commonly used filters beneath, and Advanced shows the Miller columns only, opening at the last-applied filter. The table's own toolbar puts the count over the Drug name column, with Group by and View placeholders, \"11 of 18 columns\" and Export, and a reopen button at its left edge when the panel is closed. Every column head shows a sort arrow at rest. While the table loads, its column head stays above the scrim.",
      viewport: "desktop",
      component: Start,
    },
    {
      slug: "edit-filter",
      title: "Edit filter opens the tray",
      note: "A column menu's Edit filters, or Add filter, opens the search panel on Advanced search at that column's attribute, its values ticked. Here the Development Stage column, with Phase II and Phase III ticked. The panel opens if it was closed and flips from Quick if Quick was on.",
      viewport: "desktop",
      component: Start,
    },
    {
      slug: "resolving",
      title: "Reading the query",
      note: "Recognised phrases flash in place before the Float-style filters update.",
      viewport: "desktop",
      component: Start,
    },
    {
      slug: "filters",
      title: "Resolved filters",
      note: "The walkthrough query resolved into editable Float-style filters and 31 drugs. Each chip's value list carries the same counts as the Miller columns.",
      viewport: "desktop",
      component: Start,
    },
  ],
}
