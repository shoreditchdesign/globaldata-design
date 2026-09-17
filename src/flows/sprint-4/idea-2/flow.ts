import type { Flow } from "@/flows/types"
import { Screener } from "@/flows/sprint-4/idea-2/screens/Screener"

/**
 * Three ways into the same query on one screen: type it, tick it in the
 * explorer, or reach for a filter directly. The query is one list of
 * conditions, and the sentence in the box is how it reads back.
 */
export const sprint4Idea2: Flow = {
  id: "idea-2",
  name: "Idea 2 — Sentence and Explorer",
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
      title: "Nothing searched",
      note: "The box, and the full-width grid showing its heads over a one-line empty state.",
      viewport: "desktop",
      component: Screener,
    },
    {
      slug: "explorer-open",
      title: "Explorer, nothing ticked",
      note: "Explorer split in from the head of the results: the Drugs taxonomy, an attribute per branch. Nothing is ticked, so the grid is still empty.",
      viewport: "desktop",
      component: Screener,
    },
    {
      slug: "explorer-applied",
      title: "Ticked and applied",
      note: "Phase II or Phase III, Dermatology, and Europe excluded — ticked in the tree and applied, leaving 28 drugs. The box reads the query back in the same words a typed one resolves to.",
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
      note: "Four conditions, 41 of 1,440 sampled drugs, and the grid holding the 41 rows at full width.",
      viewport: "desktop",
      component: Screener,
    },
    {
      slug: "explorer",
      title: "The typed query, ticked",
      note: "The same four conditions with the explorer open beside them: what the sentence read is ticked in the branches it came from.",
      viewport: "desktop",
      component: Screener,
    },
    {
      slug: "record",
      title: "Record open",
      note: "The worked query with its first drug's record open over a scrim. Clear the pill that drug matched on and the drawer closes with it.",
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
