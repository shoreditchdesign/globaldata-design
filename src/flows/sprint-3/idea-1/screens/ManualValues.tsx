import { IncumbentScreen } from "@/flows/sprint-3/idea-1/components/IncumbentScreen"

/**
 * Level three — values with result counts, and a breadcrumb back up.
 *
 * One of twelve entry points into the same stateful screen — the slug seeds a
 * starting state so the deep link still lands here, and every other state is a
 * click away.
 */
export function ManualValues() {
  return <IncumbentScreen slug="manual-values" />
}
