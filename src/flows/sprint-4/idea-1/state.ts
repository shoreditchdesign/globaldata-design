export interface Sprint4Idea1State {
  slug: "start"
}

const startState: Sprint4Idea1State = { slug: "start" }

/** Seed the living screen from its URL. Unknown states return to the start. */
export function initialState(slug: string): Sprint4Idea1State {
  switch (slug) {
    case "start":
    default:
      return startState
  }
}

/** Keep the address bar aligned with the state currently on screen. */
export function slugFor(state: Sprint4Idea1State) {
  return state.slug
}
