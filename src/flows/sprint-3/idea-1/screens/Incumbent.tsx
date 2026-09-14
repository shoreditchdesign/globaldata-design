import { IncumbentScreen } from "@/flows/sprint-3/idea-1/components/IncumbentScreen"

/**
 * The incumbent, as one living screen.
 *
 * All twelve entries in `flow.ts` point at this one component, so moving
 * between them never swaps the component type underneath the state. The slug
 * is read from the URL: it seeds the state on arrival, and the URL follows the
 * state from then on.
 */
export function Incumbent() {
  return <IncumbentScreen />
}
