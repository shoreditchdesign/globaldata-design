import { IncumbentScreen } from "@/flows/sprint-3/idea-1/components/IncumbentScreen"

/**
 * Filters applied. Same chips, now horizontal, above a narrowed result set.
 *
 * One of twelve entry points into the same stateful screen — the slug seeds a
 * starting state so the deep link still lands here, and every other state is a
 * click away.
 */
export function Applied() {
  return <IncumbentScreen slug="applied" />
}
