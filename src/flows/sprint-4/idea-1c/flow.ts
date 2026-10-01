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
    "Idea 1b again, for a structural difference being explored against it. The same screens until that difference lands.",
  lastUpdated: "2026-10-01",
  status: "in-progress",
  screens: [
    {
      slug: "start",
      title: "Start",
      note: "A natural-language starting point, with the ten commonly used filters under the search.",
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
      note: "Advanced search lifts the title under the tabs and puts the Miller columns, three at a time, in place of the query field and pills, with the filter box always beneath them.",
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
      note: "The worked query searched: the search panel on the left, the filter box above an AG Grid-style table that updates as filters are added or removed.",
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
      note: "The walkthrough query resolved into editable Float-style filters and 356 drugs.",
      viewport: "desktop",
      component: Start,
    },
  ],
}
