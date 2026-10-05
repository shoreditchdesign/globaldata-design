import {
  emptyPathFilter,
  initialResolvedFilters,
  stampInOrder,
  pathFilter,
  workedQuery,
  type ResolvedFilter,
} from "@/flows/sprint-4/idea-1c/data"
import type { ProductArea } from "@/components/prototype/ProductChrome"
import { resolveQuery, type Resolution } from "@/flows/sprint-4/idea-1c/resolve"

export type SearchMode = "quick" | "manual"

/** A value chosen by walking the pills: area, then attribute, then value. */
export interface SearchPath {
  area: ProductArea
  attribute: string
  value: string
}

export interface Sprint4Idea1cState {
  mode: SearchMode
  query: string
  /**
   * The manual search's Miller path, kept apart so the pills stay closed: the
   * area, then the attribute, then as many values down its tree as are open.
   * Drugs is open by default, on the landing page and the results page.
   */
  manualTrail: string[]
  /**
   * Once the box is on screen it stays there, empty if need be, until it is
   * closed. Taking the last clause out is editing the filters, not finishing
   * with them, so the box must not fold up underneath the hand doing it.
   */
  filterBoxOpen: boolean
  /** The pill path that built the current filters, when no query did. */
  path: SearchPath | null
  /** The last query resolved into filters. Typing never changes this value. */
  submittedQuery: string | null
  filters: ResolvedFilter[]
  /** A synchronous resolution held on screen while its phrases are scanned. */
  pending: Resolution | null
  /**
   * The last read that left something behind: a query nothing in it could be
   * placed from, or one that settled with words it could not place. Cleared
   * when the query changes or a later read places everything.
   */
  unread: Resolution | null
  /** Set once a search runs; the results then follow the filters as they change. */
  showResults: boolean
  /**
   * Whether the results page's search panel is open. Held here rather than in
   * the results page, so Add filter and a column's Edit filters can open it.
   */
  panelOpen: boolean
}

const startState = (): Sprint4Idea1cState => ({
  mode: "quick",
  query: "",
  manualTrail: ["Drugs"],
  filterBoxOpen: false,
  path: null,
  submittedQuery: null,
  filters: [],
  pending: null,
  unread: null,
  showResults: false,
  panelOpen: true,
})

const filteredState = (): Sprint4Idea1cState => ({
  mode: "quick",
  query: workedQuery,
  manualTrail: ["Drugs"],
  filterBoxOpen: true,
  path: null,
  submittedQuery: workedQuery,
  // Stamped in the order the worked query names them, so a screen seeded
  // with filters can say which was applied last just as a built one can.
  filters: stampInOrder(initialResolvedFilters()),
  pending: null,
  unread: null,
  showResults: false,
  panelOpen: true,
})

/** A pill pressed: its clause is in the box, waiting for a value. */
const valuesState = (): Sprint4Idea1cState => ({
  ...startState(),
  filterBoxOpen: true,
  filters: stampInOrder([emptyPathFilter("Companies", "Company Name")]),
})

/** Advanced chosen on the landing page: the Miller columns with the filter box beneath. */
const manualState = (): Sprint4Idea1cState => ({
  ...startState(),
  mode: "manual",
})

const pickedPath: SearchPath = {
  area: "Drugs",
  attribute: "Therapy Area / Indication",
  value: "Musculoskeletal Disorders",
}

const pickedState = (): Sprint4Idea1cState => ({
  ...startState(),
  filterBoxOpen: true,
  path: pickedPath,
  filters: stampInOrder([pathFilter(pickedPath.area, pickedPath.attribute, pickedPath.value)]),
})

const resolvingState = (): Sprint4Idea1cState => ({
  mode: "quick",
  query: workedQuery,
  manualTrail: ["Drugs"],
  filterBoxOpen: false,
  path: null,
  submittedQuery: null,
  filters: [],
  pending: resolveQuery(workedQuery),
  unread: null,
  showResults: false,
  panelOpen: true,
})

const resultsState = (): Sprint4Idea1cState => ({
  ...filteredState(),
  showResults: true,
})

/**
 * A column's Edit filters pressed on the results page: the panel open on
 * Advanced search at Drugs › Development Stage, the worked query's stages
 * ticked. The address bar then reads `results`, which is the page it is.
 */
const editFilterState = (): Sprint4Idea1cState => ({
  ...resultsState(),
  mode: "manual",
  panelOpen: true,
  manualTrail: ["Drugs", "Development Stage"],
})

/** Seed the living screen from its URL. Unknown states return to the start. */
export function initialState(slug: string): Sprint4Idea1cState {
  switch (slug) {
    case "values":
      return valuesState()
    case "manual":
      return manualState()
    case "picked":
      return pickedState()
    case "results":
      return resultsState()
    case "edit-filter":
      return editFilterState()
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
export function slugFor(state: Sprint4Idea1cState) {
  if (state.showResults) return "results"
  if (state.pending) return "resolving"
  if (state.mode === "manual") return "manual"
  if (state.submittedQuery) return "filters"
  // A clause with no value in it is a pill pressed and nothing chosen yet.
  if (state.filters.length > 0) {
    return state.filters.some((filter) => filter.values.length > 0) ? "picked" : "values"
  }
  if (state.path) return "picked"
  return "start"
}
