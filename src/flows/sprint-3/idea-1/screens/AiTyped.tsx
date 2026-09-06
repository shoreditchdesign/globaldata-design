import { IncumbentScreen } from "@/flows/sprint-3/idea-1/components/IncumbentScreen"

/**
 * Query typed. The composer grows with the text; the builder is still empty.
 *
 * One of twelve entry points into the same stateful screen — the slug seeds a
 * starting state so the deep link still lands here, and every other state is a
 * click away.
 */
export function AiTyped() {
  return <IncumbentScreen slug="ai-typed" />
}
