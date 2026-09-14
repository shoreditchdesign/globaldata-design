import { Screener as ScreenerView } from "@/flows/sprint-3/idea-3/components/Screener"

/**
 * Every frame of Idea 3, as one screen.
 *
 * The cold start, the resolve, the sentence, the same query as filters and the
 * three states where the reading falls short are all the same component. The
 * slug in the URL says which of them it opens on; from there it is one flow,
 * and the address bar follows wherever the reviewer takes it.
 */
export function Screener() {
  return <ScreenerView />
}
