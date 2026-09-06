import { AppChrome } from "@/flows/sprint-3/idea-3/components/AppChrome"
import { QueryWorkbench } from "@/flows/sprint-3/idea-3/components/QueryWorkbench"

/**
 * The primary working state: a query already asked and resolved, rendered as
 * an editable sentence, with the result count and the results underneath it.
 */
export function Sentence() {
  return (
    <AppChrome>
      <QueryWorkbench />
    </AppChrome>
  )
}
