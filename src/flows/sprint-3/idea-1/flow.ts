import type { Flow } from "@/flows/types"
import { Results } from "@/flows/sprint-3/idea-1/screens/Results"
import { AiEmpty } from "@/flows/sprint-3/idea-1/screens/AiEmpty"
import { AiTyped } from "@/flows/sprint-3/idea-1/screens/AiTyped"
import { AiParsed } from "@/flows/sprint-3/idea-1/screens/AiParsed"
import { ManualAreas } from "@/flows/sprint-3/idea-1/screens/ManualAreas"
import { ManualAttributes } from "@/flows/sprint-3/idea-1/screens/ManualAttributes"
import { ManualValues } from "@/flows/sprint-3/idea-1/screens/ManualValues"
import { ManualSelected } from "@/flows/sprint-3/idea-1/screens/ManualSelected"
import { Applied } from "@/flows/sprint-3/idea-1/screens/Applied"
import { FilterBarDropdown } from "@/flows/sprint-3/idea-1/screens/FilterBarDropdown"
import { ManyFilters } from "@/flows/sprint-3/idea-1/screens/ManyFilters"
import { GroupBy } from "@/flows/sprint-3/idea-1/screens/GroupBy"

/**
 * The incumbent. A faithful port of the filter-builder modal the client
 * reviewed and rejected — kept in the sprint as the baseline the new
 * directions are measured against, not as a contender in its own right.
 *
 * The design is unchanged from the source; what changed is that it now runs.
 * The twelve frames are one stateful screen, and each slug seeds a starting
 * state, so the deep links and the Explorer's stepper still land where they
 * used to while every state is also reachable by clicking.
 */
export const sprint3Idea1: Flow = {
  id: "idea-1",
  name: "Idea 1 — Prompt into filters (incumbent)",
  premise:
    "The design already shown and rejected, ported as-is. It is here to be argued against — the baseline the other two ideas have to beat.",
  rationale: [
    "This is the incumbent, not a proposal. It is in the sprint so the alternatives have something concrete to be compared against.",
    "A natural-language prompt resolves into the existing filter rail: the AI writes the filters, the user still owns them.",
    "Ported faithfully from the reviewed design — no fixes applied, so the objections raised against it are still visible in the flow.",
    "Clickable end to end, so the click cost is something the client can feel rather than take on trust: six interactions to reach one hand-built value, and the total is still only known after Apply.",
    "The screens that draw the criticism are kept in: ten-plus filters in the bar, and three levels of cascading popovers to reach one value.",
  ],
  source: "Paper — Natural Language / Manual Filter Integration (the reviewed design)",
  lastUpdated: "2026-09-07",
  tags: ["Incumbent", "Rejected", "Natural language", "Filter rail", "Paper port"],
  status: "in-progress",
  screens: [
    { slug: "results", title: "Results", note: "285,529 drugs, no filters yet. Start here.", component: Results },
    { slug: "ai-empty", title: "AI filter", note: "Suggestions and an empty filter builder.", component: AiEmpty },
    { slug: "ai-typed", title: "Query typed", note: "The composer grows with the query; submit resolves it.", component: AiTyped },
    { slug: "ai-parsed", title: "Parsed", note: "Transcript on the left, editable groups on the right.", component: AiParsed },
    { slug: "manual-areas", title: "Manual areas", note: "The same builder, authored by hand.", component: ManualAreas },
    { slug: "manual-attributes", title: "Attributes", note: "Level two — attributes inside Drugs.", component: ManualAttributes },
    { slug: "manual-values", title: "Values", note: "Level three — values with result counts, tickable.", component: ManualValues },
    { slug: "manual-selected", title: "Value selected", note: "Selection writes straight into the builder.", component: ManualSelected },
    { slug: "applied", title: "Applied", note: "Filters move to the bar; 245 drugs, seven rows.", component: Applied },
    { slug: "filter-bar-dropdown", title: "Edit from the bar", note: "Refine without reopening the modal.", component: FilterBarDropdown },
    { slug: "many-filters", title: "Ten-plus filters", note: "Where the pattern starts to strain.", component: ManyFilters },
    { slug: "group-by", title: "Group by", note: "Results collapsed by developmental stage, counted off the filtered set.", component: GroupBy },
  ],
}
