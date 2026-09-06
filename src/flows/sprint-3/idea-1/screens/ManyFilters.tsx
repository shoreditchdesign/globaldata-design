import { IncumbentScreen } from "@/flows/sprint-3/idea-1/components/IncumbentScreen"

/**
 * Past ten filters the bar wraps and overflows into a +2.
 *
 * One of twelve entry points into the same stateful screen — the slug seeds a
 * starting state so the deep link still lands here, and every other state is a
 * click away.
 */
export function ManyFilters() {
  return <IncumbentScreen slug="many-filters" />
}
