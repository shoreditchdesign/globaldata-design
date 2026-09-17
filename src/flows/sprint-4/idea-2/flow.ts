import type { Flow } from "@/flows/types"
import { Screener } from "@/flows/sprint-4/idea-2/screens/Screener"

/**
 * Idea 1 with the Miller columns taken out and the logic gate moved into their
 * slot: the text box on top, the results underneath, and the AND / OR / NOT
 * canvas tucked away until the toggle splits the bottom half.
 */
export const sprint4Idea2: Flow = {
  id: "idea-2",
  name: "Idea 2 — Tucked Logic Gate",
  premise:
    "The same one-query hybrid as Idea 1, with two views instead of three: a sentence on top and the results below, and a logic gate canvas that splits the bottom half only when asked for, starting from the filters people pair most often.",
  rationale: [
    "Idea 1 put the text box, the Miller columns and the logic gate on screen at once, and the gate had to push a full-height sidebar in to make room. This asks whether the columns are earning their place, or whether a sentence and a gate are enough.",
    "The screen lands on one thing to do: a big text box, Sentence selected, and a results grid whose heads are already there with a quiet line where the rows will go.",
    "Logic gate splits the bottom half rather than adding a pillar. The canvas takes the left, where Idea 1's columns sat, and the results keep the right. The text box stays full width in both views.",
    "An empty canvas is a blank page, so it offers starting points. They are the attributes that the drug search pairing analysis shows being used together most, and once a node is on the canvas the rest reorder by what pairs with it. They wear the same blue as the pills in the sentence, with a plus to say they are still to add.",
    "A suggestion becomes a node the moment it is clicked, with its value picker already open and every value counted. It joins the query with its first value, so the sentence gains a pill and the grid its rows at the same time.",
    "Tests: whether a gate you reach for, built on top of suggested filters, carries the Boolean work well enough that the columns can go, and whether a sentence alone is enough of a way in for everyone else.",
  ],
  source:
    "Sprint 4 — Idea 1 (Hybrid Screener) for the query model, sample, text box and results. Through it, Sprint 3 Idea 3 (Text Input Field) for the text box and resolver, Idea 2 (Miller Columns) for the sample and taxonomy, and Idea 1 (Incumbent) for the filter-builder stack the canvas draws. No Paper source.",
  lastUpdated: "2026-09-17",
  tags: ["Hybrid", "Natural language", "Logic gate", "Suggested filters", "One query, two views"],
  status: "in-progress",
  screens: [
    {
      slug: "start",
      title: "Nothing searched",
      note: "Sentence selected, the canvas tucked away, and the full-width grid showing its heads over a one-line empty state.",
      viewport: "desktop",
      component: Screener,
    },
    {
      slug: "logic-empty",
      title: "Logic gate, empty",
      note: "Toggled to Logic gate. The bottom half splits, and the empty canvas offers Development stage, Therapy area, Molecule type and Drug geography as suggestions, ranked by how often they are used together. The grid is still empty.",
      viewport: "desktop",
      component: Screener,
    },
    {
      slug: "logic-building",
      title: "Built from suggestions",
      note: "Three nodes added from the suggestions: Phase II or Phase III, AND Dermatology, NOT Europe, leaving 28 drugs. The sentence has the same pills, the grid has the rows, and Molecule type is the suggestion left over.",
      viewport: "desktop",
      component: Screener,
    },
    {
      slug: "typed",
      title: "Typed, not sent",
      note: "A loose line in the box — lowercase, `phase 2/3`, `not in austria` — a click short of the four conditions it becomes. Nothing has been read yet.",
      viewport: "desktop",
      component: Screener,
    },
    {
      slug: "sentence",
      title: "Query as a sentence",
      note: "Four conditions, 41 of 1,440 sampled drugs. The canvas stays tucked away and the grid holds the 41 rows at full width.",
      viewport: "desktop",
      component: Screener,
    },
    {
      slug: "logic-gate",
      title: "Same query on the canvas",
      note: "The typed query, split open: all drugs, then AND, AND, AND, NOT, with the count left after each node, beside the same 41 rows.",
      viewport: "desktop",
      component: Screener,
    },
    {
      slug: "partial",
      title: "Read partly",
      note: "Three conditions placed and 23 drugs found. `immunosuppressives` is offered as its nearest value rather than assumed, and Pfizer is named as its own product area.",
      viewport: "desktop",
      component: Screener,
    },
  ],
}
