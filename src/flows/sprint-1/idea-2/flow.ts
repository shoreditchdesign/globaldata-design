import type { Flow } from "@/flows/types"
import { makePlaceholder } from "@/flows/placeholder"

export const sprint1Idea2: Flow = {
  id: "idea-2",
  name: "Idea 2",
  premise: "TBD — set once the Paper flow for Sprint 1 is imported.",
  rationale: [],
  source: "Paper — pending link",
  status: "placeholder",
  screens: [
    {
      slug: "entry",
      title: "Entry",
      note: "First screen of the flow.",
      viewport: "desktop",
      component: makePlaceholder("Entry", "Sprint 1 / Idea 2"),
    },
  ],
}
