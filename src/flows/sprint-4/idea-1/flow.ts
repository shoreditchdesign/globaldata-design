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
      note: "A natural-language starting point with the incumbent's top-level search areas.",
      viewport: "desktop",
      component: Start,
    },
    {
      slug: "filters",
      title: "Resolved filters",
      note: "The walkthrough query resolved into five filters and an authored result count.",
      viewport: "desktop",
      component: Start,
    },
  ],
}
