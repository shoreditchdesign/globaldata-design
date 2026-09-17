/**
 * The one state Idea 2 is, and the frames it can be opened on.
 *
 * The sentence, the logic gate canvas and the results are three views of one
 * list of conditions, so there is one atom: a slug seeds it on arrival, every
 * click moves it, and `slugFor` names the frame the live state is nearest to so
 * the address bar can follow.
 *
 * Nothing here is hand-authored. A typed query is produced by calling the
 * resolver on a line of English, and the built one is made by `toggleValue` and
 * `withGate`, the functions a click on the canvas calls — so a deep link cannot
 * show a query or a count the screen would not have produced on its own.
 */

import { applyDrop, newConditionId, normaliseConditions } from "@/flows/sprint-4/idea-2/arrange"
import { type Condition } from "@/flows/sprint-4/idea-2/data"
import { resolveQuery, type Resolution } from "@/flows/sprint-4/idea-2/resolve"

export type Phase = "compose" | "resolving" | "resolved"

/** Which view sits under the text box. `logic` splits the bottom half. */
export type View = "sentence" | "logic"

/** One query and everything known about where it came from. */
export interface Query {
  conditions: Condition[]
  /** The text it was read from, as typed. Empty for a query built on the canvas. */
  raw: string
  resolution: Resolution | null
  /** Whether it has been edited since it resolved. */
  edited: boolean
}

export interface ScreenerState {
  query: Query
  /** One entry per edit, so every change costs one click to reverse. */
  past: Query[]
  phase: Phase
  /** What is in the composer, whether it has been resolved or not. */
  draft: string
  /** The last attempt, when it produced no query at all. */
  failure: Resolution | null
  /** The query being read, held for the length of the resolve animation. */
  pending: Resolution | null
  view: View
}

export const blankQuery: Query = { conditions: [], raw: "", resolution: null, edited: false }

/* -------------------------------------------------------------------------- */
/* Editing, shared by every view                                               */
/* -------------------------------------------------------------------------- */

/**
 * A value ticked or unticked in one condition, from whichever view it happened
 * in. `id` names the condition; one that is not in the query yet joins the end
 * with `and`. A condition left with no values leaves the query, rather than a
 * dangling operator in the sentence and an empty node on the canvas.
 */
export function toggleValue(conditions: Condition[], id: string, attribute: string, value: string) {
  const existing = conditions.find((condition) => condition.id === id)
  if (!existing) {
    const added: Condition = {
      id: newConditionId(conditions, attribute),
      attribute,
      values: [value],
      join: "or",
      mode: "is",
      link: "and",
    }
    return [...conditions, added]
  }
  const values = existing.values.includes(value)
    ? existing.values.filter((v) => v !== value)
    : [...existing.values, value]
  if (values.length === 0) return conditions.filter((condition) => condition !== existing)
  return conditions.map((condition) => (condition === existing ? { ...condition, values } : condition))
}

/**
 * A value added from outside any one condition — the resolver's nearest match.
 * It goes into the first condition on that attribute, or starts one.
 */
export function addValue(conditions: Condition[], attribute: string, value: string) {
  const existing = conditions.find((condition) => condition.attribute === attribute)
  if (existing?.values.includes(value)) return conditions
  return toggleValue(conditions, existing?.id ?? attribute, attribute, value)
}

/**
 * The operator in front of a condition, as the logic gate draws it. `NOT` is a
 * condition that drops rows; `AND` and `OR` are how a condition meets the rest.
 * `OR NOT` is there because the sentence can say `or not available in`.
 */
export type Gate = "AND" | "OR" | "NOT" | "OR NOT"

export function gateOf(condition: Pick<Condition, "mode" | "link">): Gate {
  if (condition.mode === "is not") return condition.link === "or" ? "OR NOT" : "NOT"
  return condition.link === "or" ? "OR" : "AND"
}

export function withGate(condition: Condition, gate: Gate): Condition {
  return {
    ...condition,
    mode: gate === "NOT" || gate === "OR NOT" ? "is not" : "is",
    link: gate === "OR" || gate === "OR NOT" ? "or" : "and",
  }
}

export { normaliseConditions }

/* -------------------------------------------------------------------------- */
/* Suggestions                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * How often two Drugs filters are used together in one search, from the drug
 * search behaviour pairing analysis. Company Name + Company Type (10.3%) tops
 * that list, but the sample carries neither as a filter, so it is left out.
 * The shares only rank suggestions; they never appear on screen.
 */
const pairings: [a: string, b: string, share: number][] = [
  ["Development Stage", "Therapy Area / Indication", 9.2],
  ["Development Stage", "Molecule Type", 5.0],
  ["Development Stage", "Drug Geography", 3.6],
  ["Molecule Type", "Therapy Area / Indication", 3.5],
]

function pairShare(a: string, b: string) {
  return pairings
    .filter(([x, y]) => (x === a && y === b) || (x === b && y === a))
    .reduce((sum, [, , share]) => sum + share, 0)
}

/**
 * The attributes the empty canvas offers, ranked by how much they co-occur
 * across all the pairs: Development Stage sits in three of them, so it leads.
 */
const coldStart = Array.from(new Set(pairings.flatMap(([a, b]) => [a, b]))).sort(
  (a, b) =>
    pairings.reduce((sum, [x, y, share]) => sum + (x === b || y === b ? share : 0), 0) -
    pairings.reduce((sum, [x, y, share]) => sum + (x === a || y === a ? share : 0), 0),
)

/**
 * What to suggest next, given what is already on the canvas. Empty, it is the
 * cold-start ranking. Once a node is there, it is whatever pairs with the nodes
 * present, strongest pairing first, so the suggestions build on the query
 * rather than repeating the same list. A canvas holding nothing that pairs
 * falls back to the cold-start ranking.
 */
export function suggestionsFor(used: string[]) {
  const remaining = coldStart.filter((attribute) => !used.includes(attribute))
  if (used.length === 0) return remaining

  const scored = remaining
    .map((attribute) => ({
      attribute,
      score: used.reduce((sum, present) => sum + pairShare(attribute, present), 0),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)

  return scored.length > 0 ? scored.map(({ attribute }) => attribute) : remaining
}

/* -------------------------------------------------------------------------- */
/* The seeds                                                                   */
/* -------------------------------------------------------------------------- */

/** The worked example, as a reviewer would type it — loose, lowercase, `phase 2/3`. */
export const workedPrompt =
  "anti-inflammatories for dermatology or immunology, phase 2/3, not in austria or italy"

/** Three conditions read; one word offered as its nearest match; one company named. */
const partialPrompt =
  "late stage immunosuppressives for rheumatoid arthritis or psoriasis in Europe from Pfizer"

export const suggestedQueries = [
  workedPrompt,
  "oral small molecules in europe or north america",
  "marketed monoclonal antibodies for plaque psoriasis",
]

const worked = resolveQuery(workedPrompt)
const partial = resolveQuery(partialPrompt)

const queryFrom = (resolution: Resolution): Query => ({
  conditions: resolution.conditions,
  raw: resolution.raw,
  resolution,
  edited: false,
})

const base: ScreenerState = {
  query: blankQuery,
  past: [],
  phase: "compose",
  draft: "",
  failure: null,
  pending: null,
  view: "sentence",
}

const resolved: ScreenerState = {
  ...base,
  query: queryFrom(worked),
  phase: "resolved",
  draft: workedPrompt,
}

/**
 * Three nodes added from the suggestions, in the order they are offered: two
 * development stages, then Dermatology under Therapy Area, then Europe under
 * Drug Geography, flipped to NOT. Molecule Type is the suggestion left over.
 * Every step is kept in `past`, so Undo walks back through them.
 */
function buildFromSuggestions() {
  const steps: Condition[][] = [[]]
  const push = (next: Condition[]) => steps.push(normaliseConditions(next))
  const last = () => steps[steps.length - 1]

  const tick = (attribute: string, value: string) => toggleValue(last(), attribute, attribute, value)
  push(tick("Development Stage", "Phase II"))
  push(tick("Development Stage", "Phase III"))
  push(tick("Therapy Area / Indication", "Dermatology"))
  push(tick("Drug Geography", "Europe"))
  push(
    last().map((condition) =>
      condition.attribute === "Drug Geography" ? withGate(condition, "NOT") : condition,
    ),
  )

  const queries = steps.map<Query>((conditions, i) => ({
    ...blankQuery,
    conditions,
    edited: i > 0,
  }))
  return { query: queries[queries.length - 1], past: queries.slice(0, -1) }
}

const built = buildFromSuggestions()

/** Read, then one value dragged out of its group. */
export const pulledApartPrompt = "small molecules in europe or north america"
const pulledApartRead = resolveQuery(pulledApartPrompt)

/**
 * North America dragged out of the geography group and dropped straight after
 * it, by the same `applyDrop` a drag calls. It joins with `or`, so the query
 * now reads (small molecules in Europe) or anything in North America. Undo
 * puts it back.
 */
function pullApart(): Pick<ScreenerState, "query" | "past"> {
  const before = queryFrom(pulledApartRead)
  const source = before.conditions.find((condition) => condition.attribute === "Drug Geography")
  const arranged =
    source &&
    applyDrop(
      before.conditions,
      { kind: "value", id: source.id, value: "North America" },
      { kind: "gap", index: before.conditions.indexOf(source) + 1 },
    )
  if (!arranged) return { query: before, past: [] }
  return { query: { ...before, conditions: arranged.conditions, edited: true }, past: [before] }
}

export const initialStates: Record<string, ScreenerState> = {
  start: base,
  "logic-empty": { ...base, view: "logic" },
  "logic-building": { ...base, ...built, phase: "resolved", view: "logic" },
  typed: { ...base, draft: workedPrompt },
  sentence: resolved,
  "logic-gate": { ...resolved, view: "logic" },
  "pulled-apart": {
    ...base,
    ...pullApart(),
    phase: "resolved",
    draft: pulledApartPrompt,
  },
  partial: {
    ...base,
    query: queryFrom(partial),
    phase: "resolved",
    draft: partialPrompt,
  },
}

export function initialState(slug: string): ScreenerState {
  return initialStates[slug] ?? base
}

/**
 * The frame a live state is nearest to. Every seed maps back to its own slug,
 * so landing on a deep link never rewrites it.
 */
export function slugFor(state: ScreenerState): string {
  const { query, view, phase, draft } = state

  if (query.conditions.length === 0) {
    if (view === "logic") return "logic-empty"
    return draft.trim() ? "typed" : "start"
  }

  // Read from a sentence or built node by node.
  if (view === "logic") return query.raw ? "logic-gate" : "logic-building"
  if (phase !== "resolved") return "typed"

  // A value pulled out of its group leaves the same attribute in two conditions.
  const attributes = query.conditions.map((condition) => condition.attribute)
  if (new Set(attributes).size < attributes.length) return "pulled-apart"

  // Only while the reading still describes the query. The first edit answers
  // the note, and the screen stops showing it.
  const resolution = query.edited ? null : query.resolution
  if (
    resolution &&
    (resolution.unplaced.length > 0 || resolution.suggestions.length > 0 || resolution.notes.length > 0)
  ) {
    return "partial"
  }
  return "sentence"
}
