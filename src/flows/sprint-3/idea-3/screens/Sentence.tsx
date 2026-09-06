import { ProductChrome } from "@/components/prototype/ProductChrome"
import { QueryWorkbench } from "@/flows/sprint-3/idea-3/components/QueryWorkbench"

/**
 * The primary working state: a query already asked and resolved, rendered as
 * an editable sentence, with the result count and the results underneath it.
 *
 * The global search in the chrome is still the shared placeholder. This
 * direction's argument is that the platform already ships a good cross-entity
 * natural-language search up there and nothing found in it can be carried into
 * a screener — so when that argument gets made on screen, it gets made by
 * passing a real control into `ProductChrome`'s `search` slot, not by drawing a
 * second header.
 */
export function Sentence() {
  return (
    <ProductChrome activeArea="Drugs">
      <QueryWorkbench />
    </ProductChrome>
  )
}
