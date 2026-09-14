import type { Flow } from "@/flows/types"
import { Incumbent } from "@/flows/sprint-3/idea-1/screens/Incumbent"

/**
 * The incumbent. A faithful port of the filter-builder modal the client
 * reviewed and rejected — kept in the sprint as the baseline the new
 * directions are measured against, not as a contender in its own right.
 *
 * The design is unchanged from the source; what changed is that it now runs.
 * The twelve frames are states of one living screen: every entry below shares
 * one component, a slug seeds where the flow starts, and the URL follows the
 * state as it is clicked through.
 */
export const sprint3Idea1: Flow = {
  id: "idea-1",
  name: "Idea 1 — Modal / Sidebar Takeover",
  premise:
    "The design already shown and rejected, ported as-is. It is here to be argued against — the baseline the other two ideas have to beat.",
  rationale: [
    "This is the incumbent, not a proposal. It is in the sprint so the alternatives have something concrete to be compared against.",
    "A natural-language prompt resolves into the existing filter rail: the AI writes the filters, the user still owns them.",
    "Ported faithfully from the reviewed design — no fixes applied, so the objections raised against it are still visible in the flow.",
    "One flow, clickable end to end, so the click cost is something the client can feel rather than take on trust: six interactions to reach one hand-built value, and the total is still only known after Apply.",
    "The states that draw the criticism are kept in: ten-plus filters in the bar, and three levels of cascading popovers to reach one value.",
  ],
  source: "Paper — Natural Language / Manual Filter Integration (the reviewed design)",
  lastUpdated: "2026-09-14",
  tags: ["Incumbent", "Rejected", "Natural language", "Filter rail", "Paper port"],
  status: "in-progress",
  screens: [
    { slug: "results", title: "Results", note: "285,529 drugs, no filters yet. Apply filter opens the modal.", component: Incumbent },
    { slug: "ai-empty", title: "AI filter", note: "The modal on its AI tab: four suggestions, an empty builder.", component: Incumbent },
    { slug: "ai-typed", title: "Query typed", note: "A suggestion or free text in the composer; submit resolves it after a short beat.", component: Incumbent },
    { slug: "ai-parsed", title: "Parsed", note: "The exchange on the left, the parse as editable groups on the right.", component: Incumbent },
    { slug: "manual-areas", title: "Manual areas", note: "The same builder on the Manual tab, authored by hand.", component: Incumbent },
    { slug: "manual-attributes", title: "Attributes", note: "An area open — level two of the cascade.", component: Incumbent },
    { slug: "manual-values", title: "Values", note: "An attribute open — level three, values with result counts.", component: Incumbent },
    { slug: "manual-selected", title: "Value selected", note: "A ticked value writes straight into the builder.", component: Incumbent },
    { slug: "applied", title: "Applied", note: "Apply moves the builder into the bar and filters the table.", component: Incumbent },
    { slug: "filter-bar-dropdown", title: "Edit from the bar", note: "A bar pill reopens its values without the modal.", component: Incumbent },
    { slug: "many-filters", title: "Ten-plus filters", note: "Past ten values the bar collapses the rest into +N.", component: Incumbent },
    { slug: "group-by", title: "Group by", note: "A column menu collapses the filtered rows by that column.", component: Incumbent },
  ],
}
