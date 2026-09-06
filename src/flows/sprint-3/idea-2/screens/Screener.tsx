"use client"

import { ProductChrome } from "@/components/prototype/ProductChrome"
import { FilterPanel } from "@/flows/sprint-3/idea-2/components/FilterPanel"
import { ResultsPane } from "@/flows/sprint-3/idea-2/components/ResultsPane"
import { useScreener } from "@/flows/sprint-3/idea-2/use-screener"

/**
 * The primary working state: three filters applied, the drill-down open two
 * levels into Therapy Area, and the results reflowing beside it.
 *
 * The panel is a region of the layout, not an overlay. Nothing is dimmed and
 * nothing sits on top of anything — the objection to Sprint 2 was being
 * covered, not the panel being small. The agent docks inside that same region
 * on the same terms: a third band of the layout, never a sheet over the work.
 *
 * All of the screen's state lives in one hook, because the columns, the pills,
 * the count and the table have to be derived from the same filters — and the
 * agent has to drive that state rather than a copy of it.
 */
export function Screener() {
  const screener = useScreener()

  return (
    <ProductChrome activeArea="Drugs" body="row">
      <FilterPanel
        screener={screener}
        className="border-edge w-[40%] max-w-[760px] min-w-[580px] shrink-0 border-r"
      />
      <ResultsPane screener={screener} className="flex-1" />
    </ProductChrome>
  )
}
