import type { Flow } from "@/flows/types"
import { Screener } from "@/flows/sprint-4/idea-2b/screens/Screener"

/**
 * Three ways into the same query on one screen: type it, tick it in the
 * explorer, or reach for a filter directly. The query is one list of
 * conditions, and the sentence in the box is how it reads back.
 */
export const sprint4Idea2b: Flow = {
  id: "idea-2b",
  name: "Option 2b — Search and filters",
  premise:
    "One query, three ways to build it: a sentence typed in your own words, a file tree of the whole taxonomy, and the filters themselves. Whichever you use, the box says what the query now reads, and the other two follow.",
  rationale: [
    "The screen lands on one thing to do: a text box, and a results grid whose heads are already there with a quiet line where the rows will go.",
    "Three ways in, one query. The bar under the box is the quick one — tick a value and it is written into the line above in the same words a typed query resolves to, so building a filter by hand and describing it in English end in the same sentence. Nothing reaches the table until Resolve.",
    "Typing is the fast way in and the tree is the thorough one. Neither is a mode — the tree splits in from the head of the results, ticks build up without moving anything, and applying them writes the query the box then reads back in plain words.",
    "The explorer is the Drugs taxonomy, an attribute per branch with an icon each, because recognising where a filter lives is most of the work of finding it. The other product areas are their own screeners, so they are not at the top of this tree.",
    "A file tree is the shape analysts already read in an editor: branches that stay open, a rule tracing each level back to its parent, and a search that marks the branch a nested match is hiding in rather than flattening the tree into a list.",
    "Reading it the other way is what makes it one query rather than two. A sentence resolved in the box arrives in the tree as ticks in the right branches, so neither view can claim something the other does not.",
    "The sentence shows the grouping and nothing more to pick from: its pills open no dropdowns and its operator words are read, not set. What it does keep is clearing — a value, or a whole condition.",
    "Open on a drug name brings the whole record in from the right over a scrim, as in Sprint 3 Idea 2. It is looked up in the filtered set, so an edit that drops the drug closes it.",
    "Tests: whether a tree of the taxonomy carries the manual half of the work better than columns did, and whether typing and ticking can be the same query without either one feeling like the fallback.",
  ],
  source:
    "The Sprint 4 hybrid screener (commit ae56cf1, since taken off main) for the query model, sample, text box and results. Through it, Sprint 3 Idea 3 (Text Input Field) for the text box and resolver, Idea 2 (Miller Columns) for the sample, taxonomy and record drawer, and Idea 1 (Incumbent) for the filter dropdowns. No Paper source.",
  lastUpdated: "2026-09-18",
  tags: ["Hybrid", "Natural language", "File tree", "Quick filters", "One query, three ways"],
  status: "in-progress",
  screens: [
    {
      slug: "start",
      title: "Nothing asked",
      note: "The field in the middle of the page, a few queries to start from under it, and the filters people reach for most. No table of everything.",
      viewport: "desktop",
      component: Screener,
    },
    {
      slug: "typed",
      title: "Typed, not searched",
      note: "A loose line in the field — lowercase, `phase 2/3`, `not in austria` — a press short of the filters it becomes.",
      viewport: "desktop",
      component: Screener,
    },
    {
      slug: "results",
      title: "Read, and working",
      note: "The field at the top with what was typed still in it, the quick filters tucked away, the tree open beside 41 rows.",
      viewport: "desktop",
      component: Screener,
    },
    {
      slug: "filters-open",
      title: "Quick filters showing",
      note: "The same query with the filter rail pulled back out under the field, each chip holding what the query already has.",
      viewport: "desktop",
      component: Screener,
    },
    {
      slug: "filter-open",
      title: "A quick filter open",
      note: "Development Stage's dropdown, every value with what picking it would leave. Held open by the frame, so it can be captured.",
      viewport: "desktop",
      component: Screener,
    },
    {
      slug: "explorer-ticked",
      title: "Ticked, not applied",
      note: "Three values ticked across three branches of the tree, with the rail counting them. The rows hold the query from before until Apply filters is used.",
      viewport: "desktop",
      component: Screener,
    },
    {
      slug: "record",
      title: "Record open",
      note: "The whole drug over the results, closing if an edit drops it from them.",
      viewport: "desktop",
      component: Screener,
    },
    {
      slug: "partial",
      title: "Read partly",
      note: "Three filters placed and 23 drugs found, with what it could not place named under the field rather than guessed at.",
      viewport: "desktop",
      component: Screener,
    },
  ],
}
