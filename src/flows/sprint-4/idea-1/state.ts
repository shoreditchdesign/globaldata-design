import {
  initialResolvedFilters,
  workedQuery,
  type ResolvedFilter,
} from "@/flows/sprint-4/idea-1/data"
import { resolveQuery, type Resolution } from "@/flows/sprint-4/idea-1/resolve"

export type SearchMode = "quick" | "manual"

export interface Sprint4Idea1State {
  mode: SearchMode
  query: string
  /** The last query resolved into filters. Typing never changes this value. */
  submittedQuery: string | null
  filters: ResolvedFilter[]
  /** A synchronous resolution held on screen while its phrases are scanned. */
  pending: Resolution | null
}

const startState = (): Sprint4Idea1State => ({
  mode: "quick",
  query: "",
  submittedQuery: null,
  filters: [],
  pending: null,
})

const filteredState = (): Sprint4Idea1State => ({
  mode: "quick",
  query: workedQuery,
  submittedQuery: workedQuery,
  filters: initialResolvedFilters(),
  pending: null,
})

const resolvingState = (): Sprint4Idea1State => ({
  mode: "quick",
  query: workedQuery,
  submittedQuery: null,
  filters: [],
  pending: resolveQuery(workedQuery),
})

/** Seed the living screen from its URL. Unknown states return to the start. */
export function initialState(slug: string): Sprint4Idea1State {
  switch (slug) {
    case "resolving":
      return resolvingState()
    case "filters":
      return filteredState()
    case "start":
    default:
      return startState()
  }
}

/** Keep the address bar aligned with the state currently on screen. */
export function slugFor(state: Sprint4Idea1State) {
  if (state.pending) return "resolving"
  return state.submittedQuery ? "filters" : "start"
}
