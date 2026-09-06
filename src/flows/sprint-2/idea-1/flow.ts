import type { Flow } from "@/flows/types"
import { Results } from "@/flows/sprint-2/idea-1/screens/Results"
import { AiEmpty } from "@/flows/sprint-2/idea-1/screens/AiEmpty"
import { AiTyped } from "@/flows/sprint-2/idea-1/screens/AiTyped"
import { AiParsed } from "@/flows/sprint-2/idea-1/screens/AiParsed"
import { ManualAreas } from "@/flows/sprint-2/idea-1/screens/ManualAreas"
import { ManualAttributes } from "@/flows/sprint-2/idea-1/screens/ManualAttributes"
import { ManualValues } from "@/flows/sprint-2/idea-1/screens/ManualValues"
import { ManualSelected } from "@/flows/sprint-2/idea-1/screens/ManualSelected"
import { Applied } from "@/flows/sprint-2/idea-1/screens/Applied"
import { FilterBarDropdown } from "@/flows/sprint-2/idea-1/screens/FilterBarDropdown"
import { ManyFilters } from "@/flows/sprint-2/idea-1/screens/ManyFilters"
import { GroupBy } from "@/flows/sprint-2/idea-1/screens/GroupBy"

/**
 * Faithful port of the Paper flow: a natural-language prompt that resolves into
 * the existing manual filter model. Tests whether AI can sit on top of the
 * current filter model without replacing it.
 */
export const sprint2Idea1: Flow = {
  id: "idea-1",
  name: "Idea 1 — Prompt into filters",
  premise:
    "Natural-language prompt resolves into the existing filter rail. The AI writes the filters; the user still owns them.",
  rationale: [
    "Closest to the source design — lowest risk, easiest to sell as an incremental release.",
    "Both tabs write into one filter builder, so the AI's output is the same editable object the manual path produces.",
    "Tests whether users trust a parsed query they can see and correct.",
  ],
  source: "Paper — Natural Language / Manual Filter Integration",
  lastUpdated: "2026-09-04",
  tags: ["Natural language", "Filter rail", "Paper port"],
  status: "in-progress",
  screens: [
    { slug: "results", title: "Results", note: "285,529 drugs, no filters yet.", component: Results },
    { slug: "ai-empty", title: "AI filter", note: "Suggestions and an empty filter builder.", component: AiEmpty },
    { slug: "ai-typed", title: "Query typed", note: "The composer grows with the query.", component: AiTyped },
    { slug: "ai-parsed", title: "Parsed", note: "Transcript on the left, editable groups on the right.", component: AiParsed },
    { slug: "manual-areas", title: "Manual areas", note: "The same builder, authored by hand.", component: ManualAreas },
    { slug: "manual-attributes", title: "Attributes", note: "Level two — attributes inside Drugs.", component: ManualAttributes },
    { slug: "manual-values", title: "Values", note: "Level three — values with result counts.", component: ManualValues },
    { slug: "manual-selected", title: "Value selected", note: "Selection writes straight into the builder.", component: ManualSelected },
    { slug: "applied", title: "Applied", note: "Filters move to the bar; 245 drugs remain.", component: Applied },
    { slug: "filter-bar-dropdown", title: "Edit from the bar", note: "Refine without reopening the modal.", component: FilterBarDropdown },
    { slug: "many-filters", title: "Ten-plus filters", note: "Where the pattern starts to strain.", component: ManyFilters },
    { slug: "group-by", title: "Group by", note: "Results collapsed by developmental stage.", component: GroupBy },
  ],
}
