import type { Flow } from "@/flows/types"
import { Screener } from "@/flows/sprint-3/idea-3/screens/Screener"

/**
 * One input, one representation. Natural language goes in and the query comes
 * back as an editable sentence — values as pills, Boolean logic as the words
 * between them. The answer to the CPO's standing question about combining
 * natural language with structured search.
 */
export const sprint3Idea3: Flow = {
  id: "idea-3",
  name: "Idea 3 — Text Input Field",
  premise:
    "Natural language in, and what comes back is the query itself as one editable line of English: every value a pill with a dropdown, every operator a word you can change. Not a transcript beside a builder — one object, in one place.",
  rationale: [
    "Answers the question Neil has asked in nearly every call and never had answered: how natural language and structured search are the same act rather than two modes.",
    "The Boolean lives in the words. `excluding`, `or`, `in` are dropdowns, so AND/OR/NOT never appears as a radio group and the logic stays readable to a non-technical analyst.",
    "One representation, not two. Sprint 2 put a chat thread beside a stack of filter cards and asked the user to reconcile them; the `Filters` toggle here swaps the same clauses in place rather than adding a second surface.",
    "The platform already ships a fast cross-entity natural-language search in the global header and nothing found there can be carried into a screener. This is that search, wired to the data.",
    "Typing is the beginning, not a given: the cold start takes a loose phrase, shows the words it recognised being turned into structure, and resolves. `Edit` runs the same trip backwards, which is the answer to \"what if it read me wrong\".",
    "Cheap reversal is the load-bearing claim: dismiss a clause from the sentence, clear a value from its dropdown, or undo. Editing mid-query beats retyping it.",
    "Tests: can AI replace the filter UI rather than sit beside it. Fewest clicks of the three, highest trust risk.",
  ],
  source: "Sprint 1, approach 3 (Search Priority) taken to its conclusion — no Paper source",
  lastUpdated: "2026-09-14",
  tags: ["Natural language", "Editable sentence", "Inline Boolean", "Non-modal", "Fewest clicks"],
  status: "in-progress",
  screens: [
    {
      slug: "start",
      title: "Cold start",
      note: "Nothing asked yet. Type a loose request in your own words and the phrases it recognises harden into pills — keyword matching against a fixed map, and it says what it could not place.",
      viewport: "desktop",
      component: Screener,
    },
    {
      slug: "typed",
      title: "Typed, not sent",
      note: "One line in the reviewer's own words — loose, lowercase, `IV` for intravenous — a click short of the seven conditions it becomes. Nothing has been read yet.",
      viewport: "desktop",
      component: Screener,
    },
    {
      slug: "resolving",
      title: "Resolving",
      note: "The words it recognised lighting up and hardening into pills. Nothing is being computed — the query resolved before the animation started.",
      viewport: "desktop",
      component: Screener,
    },
    {
      slug: "sentence",
      title: "Query as a sentence",
      note: "Seven clauses resolved, 453 drugs, sixteen of the seventy-eight sample rows beneath. Clauses, operators and values are all editable in place.",
      viewport: "desktop",
      component: Screener,
    },
    {
      slug: "filters",
      title: "The same query as filters",
      note: "The identical clauses drawn as conventional filters, swapped in place rather than opened as a second surface.",
      viewport: "desktop",
      component: Screener,
    },
    {
      slug: "edit",
      title: "Read back as prose",
      note: "`Edit` run backwards: the sentence collapsed to the English it was read from, editable, and resolving again to the same seven clauses.",
      viewport: "desktop",
      component: Screener,
    },
    {
      slug: "partial",
      title: "Read partly",
      note: "Phase III and Germany placed; `immunosuppressives` reported with the nearest condition offered rather than assumed, and rheumatoid arthritis named as real in the product but unwired here.",
      viewport: "desktop",
      component: Screener,
    },
    {
      slug: "failure",
      title: "Nothing placed",
      note: "No condition matched, so no query was built. The words stay where they were typed, and Company is named as its own product area rather than guessed at.",
      viewport: "desktop",
      component: Screener,
    },
    {
      slug: "pill-open",
      title: "Inside a value",
      note: "One pill's dropdown: every value of Drug Geography with its count, ticked or not, and the whole condition dismissable from inside it.",
      viewport: "desktop",
      component: Screener,
    },
    {
      slug: "empty",
      title: "No matches",
      note: "Three conditions read cleanly that no drug in the seventy-eight-row sample satisfies. The count reads zero rather than a confident four digits.",
      viewport: "desktop",
      component: Screener,
    },
  ],
}
