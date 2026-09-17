import { workedQuery } from "@/flows/sprint-4/idea-1/data"

export type SearchMode = "quick" | "manual"

export interface Sprint4Idea1State {
  mode: SearchMode
  query: string
  /** The last query resolved into filters. Typing never changes this value. */
  submittedQuery: string | null
}

const startState = (): Sprint4Idea1State => ({
  mode: "quick",
  query: "",
  submittedQuery: null,
})

const filteredState = (): Sprint4Idea1State => ({
  mode: "quick",
  query: workedQuery,
  submittedQuery: workedQuery,
})

/** Seed the living screen from its URL. Unknown states return to the start. */
export function initialState(slug: string): Sprint4Idea1State {
  switch (slug) {
    case "filters":
      return filteredState()
    case "start":
    default:
      return startState()
  }
}

/** Keep the address bar aligned with the state currently on screen. */
export function slugFor(state: Sprint4Idea1State) {
  return state.submittedQuery ? "filters" : "start"
}
