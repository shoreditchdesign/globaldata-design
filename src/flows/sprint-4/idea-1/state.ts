import {
  initialResolvedFilters,
  pathFilter,
  workedQuery,
  type ResolvedFilter,
} from "@/flows/sprint-4/idea-1/data"
import type { ProductArea } from "@/components/prototype/ProductChrome"
import { resolveQuery, type Resolution } from "@/flows/sprint-4/idea-1/resolve"

export type SearchMode = "quick" | "manual"

/** A value chosen by walking the pills: area, then attribute, then value. */
export interface SearchPath {
  area: ProductArea
  attribute: string
  value: string
}

export interface Sprint4Idea1State {
  mode: SearchMode
  query: string
  activeCategory: ProductArea | null
  /** The open second-layer pill, whose values show as a third layer. */
  activeAttribute: string | null
  /** The pill path that built the current filters, when no query did. */
  path: SearchPath | null
  /** The last query resolved into filters. Typing never changes this value. */
  submittedQuery: string | null
  filters: ResolvedFilter[]
  /** A synchronous resolution held on screen while its phrases are scanned. */
  pending: Resolution | null
  /** The filters the last search ran. Set once searched, it moves the screen to the results. */
  appliedFilters: ResolvedFilter[] | null
}

const startState = (): Sprint4Idea1State => ({
  mode: "quick",
  query: "",
  activeCategory: null,
  activeAttribute: null,
  path: null,
  submittedQuery: null,
  filters: [],
  pending: null,
  appliedFilters: null,
})

const filteredState = (): Sprint4Idea1State => ({
  mode: "quick",
  query: workedQuery,
  activeCategory: null,
  activeAttribute: null,
  path: null,
  submittedQuery: workedQuery,
  filters: initialResolvedFilters(),
  pending: null,
  appliedFilters: null,
})

const valuesState = (): Sprint4Idea1State => ({
  ...startState(),
  activeCategory: "Drugs",
  activeAttribute: "Therapy Area / Indication",
})

const pickedPath: SearchPath = {
  area: "Drugs",
  attribute: "Therapy Area / Indication",
  value: "Musculoskeletal Disorders",
}

const pickedState = (): Sprint4Idea1State => ({
  ...startState(),
  path: pickedPath,
  filters: [pathFilter(pickedPath.area, pickedPath.attribute, pickedPath.value)],
})

const resolvingState = (): Sprint4Idea1State => ({
  mode: "quick",
  query: workedQuery,
  activeCategory: null,
  activeAttribute: null,
  path: null,
  submittedQuery: null,
  filters: [],
  pending: resolveQuery(workedQuery),
  appliedFilters: null,
})

const resultsState = (): Sprint4Idea1State => ({
  ...filteredState(),
  appliedFilters: initialResolvedFilters(),
})

/** Seed the living screen from its URL. Unknown states return to the start. */
export function initialState(slug: string): Sprint4Idea1State {
  switch (slug) {
    case "values":
      return valuesState()
    case "picked":
      return pickedState()
    case "results":
      return resultsState()
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
  if (state.appliedFilters) return "results"
  if (state.pending) return "resolving"
  if (state.submittedQuery) return "filters"
  if (state.path) return "picked"
  return state.activeAttribute ? "values" : "start"
}
