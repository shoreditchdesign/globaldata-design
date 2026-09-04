import type { Flow } from "@/flows/types"
import { makePlaceholder } from "@/flows/placeholder"

export const sprint2Idea2: Flow = {
  id: "idea-2",
  name: "Idea 2",
  premise: "TBD — set once the Paper flow for Sprint 2 is imported.",
  rationale: [],
  source: "Paper — pending link",
  status: "placeholder",
  screens: [
    {
      slug: "entry",
      title: "Entry",
      note: "First screen of the flow.",
      viewport: "desktop",
      component: makePlaceholder("Entry", "Sprint 2 / Idea 2"),
    },
  ],
}
