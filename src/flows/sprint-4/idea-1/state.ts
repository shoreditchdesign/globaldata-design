/**
 * The one state the hybrid is, and the frames it can be opened on.
 *
 * The sentence, the Miller columns, the logic gate and the results are four
 * views of one list of conditions, so there is one atom: a slug seeds it on
 * arrival, every click moves it, and `slugFor` names the frame the live state
 * is nearest to so the address bar can follow.
 *
 * Nothing here is hand-authored. Each query is produced by calling the resolver
 * on a line of typed English, and the column edit is made by `toggleValue`, the
 * function a tick in a column calls — so a deep link cannot show a query or a
 * count the screen would not have produced on its own.
 */

import { type Condition } from "@/flows/sprint-4/idea-1/data"
import { resolveQuery, type Resolution } from "@/flows/sprint-4/idea-1/resolve"

export type Phase = "compose" | "resolving" | "resolved"

/** One query and everything known about where it came from. */
export interface Query {
  conditions: Condition[]
  /** The text it was read from, as typed. Empty for a query built by ticking. */
  raw: string
  resolution: Resolution | null
  /** Whether it has been edited since it resolved. */
  edited: boolean
}

export interface HybridState {
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
  /** The logic gate sidebar. `Sentence` closes it, `Logic gate` opens it. */
  gate: boolean
  /** The open path through the Miller columns, attribute first. */
  path: string[]
  /** Which column the visible window starts on; clamped to the rightmost. */
  leftIndex: number
}

export const blankQuery: Query = { conditions: [], raw: "", resolution: null, edited: false }

/** Any index past the end lands on the rightmost window, whatever the depth. */
export const RIGHTMOST = 99

/* -------------------------------------------------------------------------- */
/* Editing, shared by every view                                               */
/* -------------------------------------------------------------------------- */

/**
 * A value ticked or unticked, from whichever view it happened in. A new
 * attribute joins the end of the query with `and`; an attribute left with no
 * values leaves the query, rather than a dangling operator in the sentence and
 * an empty card in the gate.
 */
export function toggleValue(conditions: Condition[], attribute: string, value: string) {
  const existing = conditions.find((condition) => condition.attribute === attribute)
  if (!existing) {
    return [...conditions, { attribute, values: [value], join: "or", mode: "is", link: "and" } as Condition]
  }
  const values = existing.values.includes(value)
    ? existing.values.filter((v) => v !== value)
    : [...existing.values, value]
  if (values.length === 0) return conditions.filter((condition) => condition !== existing)
  return conditions.map((condition) => (condition === existing ? { ...condition, values } : condition))
}

/**
 * The operator in front of a condition, as the logic gate draws it. `NOT` is a
 * condition that drops rows; `AND` and `OR` are how a condition meets the rest.
 * Idea 1 had the first three. `OR NOT` is here because the sentence can say
 * `or not available in`, and a gate that could not draw what the sentence says
 * would be a second query rather than a second view.
 */
export type Gate = "AND" | "OR" | "NOT" | "OR NOT"

export function gateOf(condition: Condition): Gate {
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

/**
 * The first condition meets nothing, so its link is always `and` — otherwise
 * removing the head of an `A, or B` query would leave B reading `or` against
 * the whole sample, which keeps everything.
 */
export function normaliseConditions(conditions: Condition[]) {
  if (conditions.length === 0 || conditions[0].link === "and") return conditions
  return [{ ...conditions[0], link: "and" as const }, ...conditions.slice(1)]
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

const base: HybridState = {
  query: blankQuery,
  past: [],
  phase: "compose",
  draft: "",
  failure: null,
  pending: null,
  gate: false,
  // The columns open on the first attribute's values, so the cold start is a
  // counted taxonomy rather than a bare list of attribute names.
  path: ["Therapy Area / Indication"],
  leftIndex: RIGHTMOST,
}

const resolved: HybridState = {
  ...base,
  query: queryFrom(worked),
  phase: "resolved",
  draft: workedPrompt,
  path: ["Therapy Area / Indication"],
}

/** The value ticked in the columns for `column-edit`: a fifth condition, a fifth node. */
const columnTick = { attribute: "Molecule Type", value: "Monoclonal Antibody" }

export const initialStates: Record<string, HybridState> = {
  start: base,
  typed: { ...base, draft: workedPrompt },
  resolving: { ...base, draft: workedPrompt, phase: "resolving", pending: worked },
  sentence: resolved,
  "logic-gate": { ...resolved, gate: true },
  "column-edit": {
    ...resolved,
    gate: true,
    query: {
      ...resolved.query,
      conditions: toggleValue(resolved.query.conditions, columnTick.attribute, columnTick.value),
      edited: true,
    },
    past: [resolved.query],
    path: [columnTick.attribute],
  },
  partial: {
    ...base,
    query: queryFrom(partial),
    phase: "resolved",
    draft: partialPrompt,
    path: ["Therapy Area / Indication", "Musculoskeletal Disorders"],
  },
}

export function initialState(slug: string): HybridState {
  return initialStates[slug] ?? base
}

/**
 * The frame a live state is nearest to. Every seed maps back to its own slug,
 * so landing on a deep link never rewrites it.
 */
export function slugFor(state: HybridState): string {
  if (state.phase === "resolving") return "resolving"
  if (state.phase === "compose" || state.query.conditions.length === 0) {
    return state.draft.trim() ? "typed" : "start"
  }

  if (state.gate) return state.query.edited ? "column-edit" : "logic-gate"

  // Only while the reading still describes the query. The first edit answers
  // the note, and the screen stops showing it.
  const resolution = state.query.edited ? null : state.query.resolution
  if (
    resolution &&
    (resolution.unplaced.length > 0 || resolution.suggestions.length > 0 || resolution.notes.length > 0)
  ) {
    return "partial"
  }
  return "sentence"
}
