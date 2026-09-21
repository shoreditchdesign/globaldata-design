import type { Flow } from "@/flows/types"
import { Start } from "@/flows/sprint-4/idea-1/screens/Start"

/**
 * Held for a second direction, being built on its own branch. The hybrid
 * screener that sat here first came off main when that work started; it is in
 * the history at `ae56cf1`.
 */
export const sprint4Idea1: Flow = {
  id: "idea-1",
  name: "Idea 1 — In progress",
  premise: "Held for a second direction, in progress on its own branch.",
  lastUpdated: "2026-09-17",
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
      title: "Picking a value",
      note: "A pill starts its clause in the filter box and opens that clause's own value selector, so the value is chosen where the filter lives rather than in a further layer of pills.",
      viewport: "desktop",
      component: Start,
    },
    {
      slug: "manual",
      title: "Manual search",
      note: "Manual lifts the title under the tabs and puts the Miller columns, three at a time, in place of the query field and pills, with the filter box always beneath them.",
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
