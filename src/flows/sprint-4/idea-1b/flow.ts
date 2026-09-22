import type { Flow } from "@/flows/types"
import { Start } from "@/flows/sprint-4/idea-1b/screens/Start"

/**
 * A copy of Idea 1 carrying the revisions from the `S4I1-revisions` branch —
 * pills that toggle their clause in and out of the filter box, dictation, and
 * Advanced search — so Idea 1 itself stays with the direction being built on
 * its own branch.
 */
export const sprint4Idea1b: Flow = {
  id: "idea-1b",
  name: "Idea 1b — Pills and Advanced search",
  premise:
    "Idea 1 with its revisions: the commonly used filters as pills under the search, each putting its clause in the filter box, a query that can be dictated, and Advanced search for the Miller columns.",
  lastUpdated: "2026-09-22",
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
