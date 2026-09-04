import type { Flow } from "@/flows/types"
import { makePlaceholder } from "@/flows/placeholder"

/**
 * Conversational refinement: the query is built over turns, and every turn
 * leaves a reversible filter in a visible stack.
 */
export const sprint2Idea3: Flow = {
  id: "idea-3",
  name: "Idea 3 — Conversational refinement",
  premise:
    "Chat on the left, live results on the right. Each turn appends a reversible filter to a stack the user can toggle, reorder or branch from.",
  rationale: [
    "Treats AI as dialogue rather than a one-shot parser — the user narrows in, rather than getting one answer.",
    "The filter stack keeps the reasoning auditable, which matters for a research product.",
    "Tests whether the result set updating mid-conversation is clarifying or disorienting.",
  ],
  source: "New exploration — no Paper source",
  status: "placeholder",
  screens: [
    {
      slug: "entry",
      title: "Entry",
      note: "Awaiting design.",
      viewport: "desktop",
      component: makePlaceholder("Entry", "Sprint 2 / Idea 3 — conversational refinement"),
    },
  ],
}
