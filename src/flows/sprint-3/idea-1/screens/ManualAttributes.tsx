import { IncumbentScreen } from "@/flows/sprint-3/idea-1/components/IncumbentScreen"

/**
 * Level two — the attributes inside Drugs, each with a chevron deeper.
 *
 * One of twelve entry points into the same stateful screen — the slug seeds a
 * starting state so the deep link still lands here, and every other state is a
 * click away.
 */
export function ManualAttributes() {
  return <IncumbentScreen slug="manual-attributes" />
}
