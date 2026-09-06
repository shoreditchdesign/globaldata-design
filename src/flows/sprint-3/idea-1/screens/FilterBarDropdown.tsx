import { IncumbentScreen } from "@/flows/sprint-3/idea-1/components/IncumbentScreen"

/**
 * Refining from the bar, without reopening the modal.
 *
 * One of twelve entry points into the same stateful screen — the slug seeds a
 * starting state so the deep link still lands here, and every other state is a
 * click away.
 */
export function FilterBarDropdown() {
  return <IncumbentScreen slug="filter-bar-dropdown" />
}
