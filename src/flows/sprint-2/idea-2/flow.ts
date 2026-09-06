import type { Flow } from "@/flows/types"
import { makePlaceholder } from "@/flows/placeholder"

/**
 * Query as a pannable canvas of nodes and logic gates, Zapier-style.
 * Tests spatial composition as the input modality.
 */
export const sprint2Idea2: Flow = {
  id: "idea-2",
  name: "Idea 2 — Query canvas",
  premise:
    "Filters become nodes on a pan-and-zoom canvas, wired through AND/OR gates. The query is a diagram, not a form.",
  rationale: [
    "Makes boolean logic visible — the thing a filter rail cannot express without nesting.",
    "Branching and reuse come free: fork a node, keep both result sets.",
    "Tests whether the audience will trade familiarity for expressive power.",
  ],
  source: "New exploration — no Paper source",
  lastUpdated: "2026-08-28",
  tags: ["Canvas", "Boolean logic", "Spatial"],
  status: "placeholder",
  screens: [
    {
      slug: "entry",
      title: "Entry",
      note: "Awaiting design.",
      viewport: "desktop",
      component: makePlaceholder("Entry", "Sprint 2 / Idea 2 — query canvas"),
    },
  ],
}
