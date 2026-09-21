import {
  emptyPathFilter,
  initialResolvedFilters,
  pathFilter,
  workedQuery,
  type FilterId,
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
  /**
   * The clause whose value selector is open in the filter box. A pill starts a
   * filter and hands it this, so the value is picked where the filter lives.
   */
  picking: FilterId | null
  /** The manual search's Miller path, kept apart so the pills stay closed. */
  manualCategory: ProductArea | null
  manualAttribute: string | null
  /** The pill path that built the current filters, when no query did. */
  path: SearchPath | null
  /** The last query resolved into filters. Typing never changes this value. */
  submittedQuery: string | null
  filters: ResolvedFilter[]
  /** A synchronous resolution held on screen while its phrases are scanned. */
  pending: Resolution | null
  /** Set once a search runs; the results then follow the filters as they change. */
  showResults: boolean
}

const startState = (): Sprint4Idea1State => ({
  mode: "quick",
  query: "",
  picking: null,
  manualCategory: null,
  manualAttribute: null,
  path: null,
  submittedQuery: null,
  filters: [],
  pending: null,
  showResults: false,
})

const filteredState = (): Sprint4Idea1State => ({
  mode: "quick",
  query: workedQuery,
  picking: null,
  manualCategory: null,
  manualAttribute: null,
  path: null,
  submittedQuery: workedQuery,
  filters: initialResolvedFilters(),
  pending: null,
  showResults: false,
})

/** A pill pressed: its clause is in the box with the value selector open. */
const valuesState = (): Sprint4Idea1State => {
  const started = emptyPathFilter("Companies", "Company Name")
  return { ...startState(), filters: [started], picking: started.id }
}

/** Manual chosen on the landing page: the Miller columns with the filter box beneath. */
const manualState = (): Sprint4Idea1State => ({
  ...startState(),
  mode: "manual",
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
  picking: null,
  manualCategory: null,
  manualAttribute: null,
  path: null,
  submittedQuery: null,
  filters: [],
  pending: resolveQuery(workedQuery),
  showResults: false,
})

const resultsState = (): Sprint4Idea1State => ({
  ...filteredState(),
  showResults: true,
})

/** Seed the living screen from its URL. Unknown states return to the start. */
export function initialState(slug: string): Sprint4Idea1State {
  switch (slug) {
    case "values":
      return valuesState()
    case "manual":
      return manualState()
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
  if (state.showResults) return "results"
  if (state.pending) return "resolving"
  if (state.mode === "manual") return "manual"
  if (state.submittedQuery) return "filters"
  if (state.picking) return "values"
  if (state.path || state.filters.length > 0) return "picked"
  return "start"
}
