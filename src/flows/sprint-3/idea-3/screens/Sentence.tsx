import { Screener } from "@/flows/sprint-3/idea-3/components/Screener"

/**
 * The working state: a query already asked and resolved, rendered as an
 * editable sentence, with the count and the results underneath it.
 *
 * This is the screen to open on when the point being made is what happens
 * *after* a query is understood. `edit as text` runs it backwards to the prose
 * it was read from; `/sprint-3/idea-3/start` opens on the cold start instead,
 * where the reviewer types their own.
 */
export function Sentence() {
  return <Screener />
}
