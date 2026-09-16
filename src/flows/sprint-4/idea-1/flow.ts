import type { Flow } from "@/flows/types"
import { Screener } from "@/flows/sprint-4/idea-1/screens/Screener"

/**
 * Three Sprint 3 directions on one screen, as views of one query: Idea 3's
 * text box on top, Idea 2's Miller columns and the results underneath, and
 * Idea 1's filter-builder stack as a logic gate that opens down the left.
 */
export const sprint4Idea1: Flow = {
  id: "idea-1",
  name: "Idea 1 — Hybrid Screener",
  premise:
    "Type a request, tick a column or flip a logic gate, and all three move together: the sentence, the Miller columns and the AND / OR / NOT flowchart are three ways of holding one query, with the results beside them.",
  rationale: [
    "Sprint 3 put three good answers on three separate screens. Idea 3's sentence was the fastest way in, Idea 2's columns were the best way to see what the data can be cut by, and Idea 1's builder stack was the only place the Boolean was drawn out rather than read. This asks whether they are better as one tool than as a choice.",
    "One query state, four views. A tick in a column adds a pill to the sentence and a node to the gate; flipping a gate to NOT turns `available in` into `not available in`; the count, every per-value count and the rows follow. Nothing is synced, because there is nothing to sync — each view is drawn from the same list of conditions.",
    "The text box reads typed English by keyword matching against Idea 2's taxonomy, so a phrase lands on the same label a column ticks. What it cannot place it says, and it offers the nearest value rather than applying it.",
    "The right half stays empty until there is a question. Before one, it states the size of the set and the two ways in; after, it is the results at the sprint's grid scale.",
    "The logic gate is a toggle beside Sentence, not a second screen. It pushes the layout rather than covering it, and the columns fold to one plus the breadcrumb while it is open, so the results keep their width at 1440px.",
    "Tests: whether an analyst who starts by typing, one who starts by browsing and one who thinks in Boolean can share one surface without any of them having to learn the others' way in.",
  ],
  source:
    "Sprint 3 — Idea 3 (Text Input Field) for the text box and resolver, Idea 2 (Miller Columns) for the columns, sample and taxonomy, and Idea 1 (Incumbent) for the filter-builder stack. No Paper source.",
  lastUpdated: "2026-09-16",
  tags: ["Hybrid", "Natural language", "Miller columns", "Logic gate", "One query, four views"],
  status: "in-progress",
  screens: [
    {
      slug: "start",
      title: "Nothing searched",
      note: "The whole 1,440-row sample, the columns open on therapy area with every value counted, and the right half saying how big the set is and the two ways into it.",
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
      slug: "resolving",
      title: "Resolving",
      note: "Idea 3's resolve: the recognised phrases light up and harden into pills. The query resolved before the animation started.",
      viewport: "desktop",
      component: Screener,
    },
    {
      slug: "sentence",
      title: "Query as a sentence",
      note: "Four conditions, 41 of 1,440 sampled drugs. The same values are ticked in the columns, and the grid on the right holds the 41 rows.",
      viewport: "desktop",
      component: Screener,
    },
    {
      slug: "logic-gate",
      title: "Logic gate open",
      note: "The same query as Idea 1's builder stack, down the left: all drugs, then AND, AND, AND, NOT, with the count left after each node. The columns fold to one plus the breadcrumb to make room.",
      viewport: "desktop",
      component: Screener,
    },
    {
      slug: "column-edit",
      title: "Edited from the columns",
      note: "Monoclonal Antibody ticked under Molecule Type: a fifth pill in the sentence, a fifth node in the gate, and 41 drugs down to 11. Undo takes it back.",
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
