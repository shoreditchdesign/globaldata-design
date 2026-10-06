import type { Flow } from "@/flows/types"
import { Start } from "@/flows/sprint-4/idea-1c/screens/Start"

/**
 * A duplicate of Idea 1b, taken to explore a structural difference against it.
 * Identical to it at the point of the copy, so that whatever changes here is
 * the thing being tested and the two can be read side by side.
 */
export const sprint4Idea1c: Flow = {
  id: "idea-1c",
  name: "1c) Pills",
  premise:
    "Idea 1b, reworked after the 5 October client review into the version Sprint 5 tests: one place to build a filter by hand (Add filter and a column's Edit filters both open the Miller tray), Drugs first and open by default, a value tree the columns can drill, Excludes only in the filter bar, not the columns, and the query field back at the head of Quick search.",
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
      note: "A pill puts its clause in the filter box at Select value, and pressing it again takes the clause out. Pressing Select value opens Advanced search's columns at that attribute, where the value is picked.",
      viewport: "desktop",
      component: Start,
    },
    {
      slug: "manual",
      title: "Advanced search",
      note: "The Advanced search tab puts the Miller columns under the field in place of the pills, with the filter box always beneath them. With nothing applied it opens Drugs › Drug Name, so three columns show. Values with values under them (therapy area › indication, region › country) carry a chevron and drill; past three columns the newest comes in at the right and the earlier ones scroll off to the left, as in Finder's column view.",
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
      note: "The worked query searched: the filter box across the full width, then the search panel beside the AG Grid-style table. The Advanced search / Quick search tabs sit at the panel's top left, Advanced first and open on arrival; Quick puts the query field under them with the commonly used filters beneath, and Advanced shows the Miller columns only. Add filter, a chip's value and a column's Edit filters all open the panel on Advanced at the right place, and Add filter flashes the row to click next. The table's toolbar puts the count over the Drug name column, with Group by and View placeholders, \"11 of 18 columns\" and Export; every column head shows a sort arrow at rest; the footer's Hide filters / Show filters folds the panel away. While the table loads, its column head stays above the scrim.",
      viewport: "desktop",
      component: Start,
    },
    {
      slug: "edit-filter",
      title: "Edit filter opens the tray",
      note: "A column menu's Edit filters, or a value on a filter chip, opens the search panel on Advanced search at that attribute, its values ticked. Here the Development Stage column. The panel opens if it was closed and flips from Quick if Quick was on.",
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
      note: "The walkthrough query resolved into editable Float-style filters and 48 drugs, two of them excluded with IS NOT.",
      viewport: "desktop",
      component: Start,
    },
  ],
}
