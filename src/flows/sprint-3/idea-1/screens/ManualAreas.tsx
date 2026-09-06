import { IncumbentScreen } from "@/flows/sprint-3/idea-1/components/IncumbentScreen"

/**
 * Manual tab: the eight filter areas, nothing selected.
 *
 * One of twelve entry points into the same stateful screen — the slug seeds a
 * starting state so the deep link still lands here, and every other state is a
 * click away.
 */
export function ManualAreas() {
  return <IncumbentScreen slug="manual-areas" />
}
