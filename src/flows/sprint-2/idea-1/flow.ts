import type { Flow } from "@/flows/types"
import { makePlaceholder } from "@/flows/placeholder"

/**
 * Faithful port of the Paper flow: a natural-language prompt that resolves into
 * the existing manual filter rail. Tests whether AI can sit on top of the
 * current filter model without replacing it.
 */
export const sprint2Idea1: Flow = {
  id: "idea-1",
  name: "Idea 1 — Prompt into filters",
  premise:
    "Natural-language prompt resolves into the existing filter rail. The AI writes the filters; the user still owns them.",
  rationale: [
    "Closest to the source design — lowest risk, easiest to sell as an incremental release.",
    "Filters stay the source of truth, so nothing about the current mental model breaks.",
    "Tests whether users trust a parsed query they can see and correct.",
  ],
  source: "Paper — Natural Language / Manual Filter Integration",
  status: "placeholder",
  screens: [
    {
      slug: "entry",
      title: "Entry",
      note: "Awaiting the ported source screens.",
      viewport: "desktop",
      component: makePlaceholder("Entry", "Sprint 2 / Idea 1 — prompt into filters"),
    },
  ],
}
