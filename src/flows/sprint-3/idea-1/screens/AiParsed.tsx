import { IncumbentScreen } from "@/flows/sprint-3/idea-1/components/IncumbentScreen"

/**
 * Submitted. The exchange becomes a transcript and the builder fills with editable groups.
 *
 * One of twelve entry points into the same stateful screen — the slug seeds a
 * starting state so the deep link still lands here, and every other state is a
 * click away.
 */
export function AiParsed() {
  return <IncumbentScreen slug="ai-parsed" />
}
