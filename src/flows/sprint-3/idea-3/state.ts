/**
 * The one state the Idea 3 frames turned out to be.
 *
 * Every slug below is an entry point rather than a page — the review may want
 * to open on a state rather than click to it — so a slug seeds a starting
 * state and from there every click moves the same live state. The URL follows
 * it the other way: `slugFor` names the frame the live state is nearest to.
 *
 * Nothing here is hand-authored. Each seed is produced by calling the
 * direction's own resolver on a line of typed English, so the screen a
 * reviewer opens on is the screen typing that line would have made. What the
 * resolver does with those lines — what it places, what it reports, how many
 * of the seventy-eight sample rows survive — was run and read before the note
 * in `flow.ts` was written for it.
 */

import { exampleClauses, originalPrompt, type Clause } from "@/flows/sprint-3/idea-3/data"
import { clausesToProse } from "@/flows/sprint-3/idea-3/grammar"
import { resolveQuery, type Resolution } from "@/flows/sprint-3/idea-3/resolve"

export type View = "sentence" | "filters"
export type Phase = "compose" | "resolving" | "resolved"

/** One query and everything known about where it came from. */
export interface Query {
  clauses: Clause[]
  /** The text it was read from, as typed. */
  raw: string
  /** What the resolver made of that text — kept for the honesty notes. */
  resolution: Resolution | null
  /** Whether pills have been edited since it resolved. */
  edited: boolean
}

/** The value whose dropdown is open, named by the clause it belongs to. */
export interface OpenPill {
  clauseId: string
  value: string
}

export interface Idea3State {
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
  openPill: OpenPill | null
}

export const blankQuery: Query = { clauses: [], raw: "", resolution: null, edited: false }

function queryFrom(resolution: Resolution): Query {
  return { clauses: resolution.clauses, raw: resolution.raw, resolution, edited: false }
}

const base: Idea3State = {
  query: blankQuery,
  past: [],
  phase: "compose",
  draft: "",
  failure: null,
  pending: null,
  view: "sentence",
  openPill: null,
}

/* -------------------------------------------------------------------------- */
/* The four readings the seeds are built from                                  */
/* -------------------------------------------------------------------------- */

/** The worked example: seven clauses, nothing unplaced, sixteen sample rows. */
const worked = resolveQuery(originalPrompt)

/**
 * Two conditions placed, one word it does not hold offered as the nearest
 * thing it does, and one attribute that is real in the product but unwired.
 * `immunosuppressives` is spelled correctly — it is simply not one of the
 * words the map knows, which is the honest version of this failure.
 */
const partial = resolveQuery(
  "phase III immunosuppressives for rheumatoid arthritis in Germany",
)

/** Nothing placed at all, so no query is built and the words stay put. */
const missed = resolveQuery("pfizer pipeline")

/** Three conditions, read cleanly, that no drug in the sample satisfies. */
const barren = resolveQuery("biosimilar drugs targeting cyclooxygenase 2 in preclinical")

/**
 * The worked example as a query. The resolver produces it; `exampleClauses` is
 * the fallback only so a change to the map cannot leave the screen blank.
 */
export const seed: Query = worked.ok
  ? queryFrom(worked)
  : { clauses: exampleClauses, raw: originalPrompt, resolution: null, edited: false }

/** A pill of the seed to open, taken from the seed rather than named beside it. */
const geography = seed.clauses.find((clause) => clause.id === "geography")
const seedPill: OpenPill | null = geography?.selected[0]
  ? { clauseId: geography.id, value: geography.selected[0] }
  : null

const resolved: Idea3State = { ...base, query: seed, phase: "resolved" }

export const initialStates: Record<string, Idea3State> = {
  start: base,
  // The same line the next two frames resolve and land, so `typed`,
  // `resolving` and `sentence` are one query walked through rather than three.
  typed: { ...base, draft: originalPrompt },
  resolving: { ...base, phase: "resolving", pending: worked.ok ? worked : null },
  sentence: resolved,
  filters: { ...resolved, view: "filters" },
  edit: { ...resolved, phase: "compose", draft: clausesToProse(seed.clauses) },
  partial: { ...base, query: queryFrom(partial), phase: "resolved" },
  failure: { ...base, draft: missed.raw, failure: missed },
  "pill-open": { ...resolved, openPill: seedPill },
  empty: { ...base, query: queryFrom(barren), phase: "resolved" },
}

export function initialState(slug: string): Idea3State {
  return initialStates[slug] ?? base
}

/**
 * The frame a live state is nearest to, so the URL can follow the click-through.
 *
 * Every seed maps back to its own slug, so landing on a deep link never
 * rewrites it — a `slugFor` that cannot tell two seeds apart would bounce the
 * address off the link that was just opened.
 *
 * @param rowCount how many of the sample rows survive the query, which is the
 *   only thing separating a sentence that works from one nothing satisfies
 */
export function slugFor(state: Idea3State, rowCount: number): string {
  if (state.phase === "resolving") return "resolving"

  if (state.phase === "compose") {
    if (state.failure) return "failure"
    // A query behind the composer means `Edit` opened it, not a cold start.
    if (state.query.clauses.length > 0) return "edit"
    return state.draft.trim() ? "typed" : "start"
  }

  if (state.view === "filters") return "filters"
  if (state.openPill) return "pill-open"
  if (state.query.clauses.length > 0 && rowCount === 0) return "empty"

  // Only while the reading still describes the query. The first pill edit
  // answers the note, and the screen stops showing it.
  const resolution = state.query.edited ? null : state.query.resolution
  if (
    resolution &&
    (resolution.unplaced.length > 0 ||
      resolution.suggestions.length > 0 ||
      resolution.notes.length > 0)
  ) {
    return "partial"
  }

  return "sentence"
}
