import { IncumbentScreen } from "@/flows/sprint-3/idea-1/components/IncumbentScreen"

/**
 * Modal open on the AI tab: suggestions, empty composer, empty builder.
 *
 * One of twelve entry points into the same stateful screen — the slug seeds a
 * starting state so the deep link still lands here, and every other state is a
 * click away.
 */
export function AiEmpty() {
  return <IncumbentScreen slug="ai-empty" />
}
