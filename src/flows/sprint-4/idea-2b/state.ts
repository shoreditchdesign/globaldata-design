/**
 * The one state Idea 2 is, and the frames it can be opened on.
 *
 * The sentence, the explorer tree and the results are three views of one
 * list of conditions, so there is one atom: a slug seeds it on arrival, every
 * click moves it, and `slugFor` names the frame the live state is nearest to so
 * the address bar can follow.
 *
 * Nothing here is hand-authored. A typed query is produced by calling the
 * resolver on a line of English, and the built one is made by `toggleValue` and
 * `withGate`, the functions a click on the canvas calls — so a deep link cannot
 * show a query or a count the screen would not have produced on its own.
 */

import { drugAttributeOrder, matchingRows, type Condition } from "@/flows/sprint-4/idea-2b/data"
import { resolveQuery, type Resolution } from "@/flows/sprint-4/idea-2b/resolve"

export type Phase = "compose" | "resolving" | "resolved"

/** Whether the explorer tree is split in beside the results. */
export type View = "sentence" | "explorer"

/** One query and everything known about where it came from. */
export interface Query {
  conditions: Condition[]
  /** The text it was read from, as typed. Empty for a query built on the canvas. */
  raw: string
  resolution: Resolution | null
}

export interface ScreenerState {
  query: Query
  /** One entry per edit, so every change costs one click to reverse. */
  past: Query[]
  phase: Phase
  /** What is in the composer, whether it has been resolved or not. */
  draft: string
  /** What the quick filter bar has ticked into the line but not resolved. */
  picks: Record<string, string[]>
  /** Which of those ticks are exclusions rather than inclusions. */
  drops: Record<string, string[]>
  /** Whether the filter rail under the box is showing. */
  railOpen: boolean
  /** The last attempt, when it produced no query at all. */
  failure: Resolution | null
  /** The query being read, held for the length of the resolve animation. */
  pending: Resolution | null
  view: View
  /**
   * The drug whose record is open, as an id rather than a row. The row is looked
   * up in the filtered set, so a query that drops the drug closes the drawer.
   */
  recordId: string | null
  /**
   * A quick filter's dropdown, held open by the frame rather than by the
   * pointer. A popover that shuts the moment focus leaves it cannot be
   * screenshotted, and these frames exist to be captured.
   */
  pinnedFilter: string | null
  /** What the explorer is showing before anything is applied, when a frame seeds it. */
  tree: TreeSeed | null
}

/** Branches open and values ticked in the explorer, with nothing applied yet. */
export interface TreeSeed {
  expanded: string[]
  ticks: Record<string, string[]>
}

export const blankQuery: Query = { conditions: [], raw: "", resolution: null }

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
      id: attribute,
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
 * The operator in front of a condition. `NOT` is a
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

/**
 * Enough of a common query for the composer to ghost the rest of it. The frame
 * exists so the completion can be reviewed without typing into the box.
 */
export const autofillPrompt = "oral small"

export const suggestedQueries = [
  workedPrompt,
  "oral small molecules in europe or north america",
  "marketed monoclonal antibodies for plaque psoriasis",
  "phase 3 jak inhibitors for rheumatoid arthritis",
]

const worked = resolveQuery(workedPrompt)
const partial = resolveQuery(partialPrompt)

const queryFrom = (resolution: Resolution): Query => ({
  conditions: resolution.conditions,
  raw: resolution.raw,
  resolution,
})

const base: ScreenerState = {
  query: blankQuery,
  past: [],
  phase: "compose",
  draft: "",
  picks: {},
  drops: {},
  railOpen: true,
  failure: null,
  pending: null,
  view: "sentence",
  recordId: null,
  pinnedFilter: null,
  tree: null,
}

const resolved: ScreenerState = {
  ...base,
  query: queryFrom(worked),
  phase: "resolved",
  draft: workedPrompt,
}

/** Three values ticked in the tree, waiting on the rail to apply them. */
const treeTicks = {
  "Development Stage": ["Phase III"],
  "Drug Geography": ["Europe"],
  "Molecule Type": ["Monoclonal Antibody"],
}

export const initialStates: Record<string, ScreenerState> = {
  /** Nothing asked: the field in the middle of the page. */
  start: base,
  /** A query in the field, a press short of being read. */
  typed: { ...base, draft: workedPrompt },
  /** Read, and the working state it opens on: tree beside the rows, filters tucked. */
  results: { ...resolved, view: "explorer", railOpen: false },
  /** The same query with the quick filters showing over it. */
  "filters-open": { ...resolved, view: "explorer", railOpen: true },
  /** One quick filter's dropdown held open, for capture. */
  "filter-open": { ...base, pinnedFilter: "Development Stage" },
  /** Values ticked in the tree, before the rail applies them. */
  "explorer-ticked": {
    ...resolved,
    view: "explorer",
    railOpen: false,
    tree: {
      expanded: ["Development Stage", "Drug Geography", "Molecule Type"],
      ticks: treeTicks,
    },
  },
  /** A drug's record open over the results. */
  record: { ...resolved, view: "explorer", railOpen: false, recordId: matchingRows(worked.conditions)[0]?.id ?? null },
  /** Read partly, with what it could not place said under the field. */
  partial: {
    ...base,
    query: queryFrom(partial),
    phase: "resolved",
    view: "explorer",
    railOpen: false,
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
  const { query, phase, draft, recordId, pinnedFilter, tree, railOpen } = state

  // The drawer only ever holds a drug the query matches, so it outranks the rest.
  if (recordId && query.conditions.length > 0) return "record"
  // A frame held open for capture names itself, whatever else is true.
  if (pinnedFilter) return "filter-open"
  if (tree && Object.keys(tree.ticks).length > 0) return "explorer-ticked"

  if (query.conditions.length === 0) return draft.trim() ? "typed" : "start"
  if (phase !== "resolved") return "typed"

  // Only while the reading still describes the query.
  const resolution = query.resolution
  if (resolution && (resolution.unplaced.length > 0 || resolution.notes.length > 0)) return "partial"

  return railOpen ? "filters-open" : "results"
}

/**
 * The query with the quick filter bar's ticks folded in. An attribute can keep
 * some values and drop others, so it writes up to two conditions — what it
 * keeps, then what it drops. A condition the query already holds keeps its own
 * join and link; a new one joins the end with a plain `and`, in the order the
 * product lists its attributes.
 */
export function mergePicks(
  conditions: Condition[],
  picks: Record<string, string[]>,
  drops: Record<string, string[]>,
): Condition[] {
  const held = new Map(conditions.map((condition) => [condition.id, condition]))
  const attributes = Array.from(
    new Set([...conditions.map((condition) => condition.attribute), ...Object.keys(picks)]),
  ).sort((a, b) => drugAttributeOrder.indexOf(a) - drugAttributeOrder.indexOf(b))

  const next: Condition[] = []
  for (const attribute of attributes) {
    const picked = picks[attribute]
    const values =
      picked ??
      conditions.filter((condition) => condition.attribute === attribute).flatMap((c) => c.values)
    if (values.length === 0) continue

    const dropped = picked
      ? (drops[attribute] ?? [])
      : conditions
          .filter((condition) => condition.attribute === attribute && condition.mode === "is not")
          .flatMap((c) => c.values)
    const kept = values.filter((value) => !dropped.includes(value))
    const excluded = values.filter((value) => dropped.includes(value))

    if (kept.length > 0) {
      const before = held.get(attribute)
      next.push({
        ...(before ?? { join: "or" as const, link: "and" as const }),
        id: attribute,
        attribute,
        mode: "is" as const,
        values: kept,
      })
    }
    if (excluded.length > 0) {
      const before = held.get(`${attribute}~not`)
      next.push({
        ...(before ?? { join: "or" as const, link: "and" as const }),
        id: `${attribute}~not`,
        attribute,
        mode: "is not" as const,
        values: excluded,
      })
    }
  }
  return next
}
