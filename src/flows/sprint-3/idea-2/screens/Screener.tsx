"use client"

import { ProductChrome } from "@/components/prototype/ProductChrome"
import { AgentSpotlight } from "@/flows/sprint-3/idea-2/components/AgentSpotlight"
import { FilterPanel } from "@/flows/sprint-3/idea-2/components/FilterPanel"
import { ResultsPane } from "@/flows/sprint-3/idea-2/components/ResultsPane"
import { useScreener } from "@/flows/sprint-3/idea-2/use-screener"

/**
 * The primary working state: three filters applied, the drill-down open two
 * levels into Therapy Area, and the results reflowing beside it.
 *
 * The panel is a region of the layout, not an overlay. The objection to Sprint
 * 2 was being covered, not the panel being small, so the columns are never
 * replaced and the filtering itself never puts anything on top of them. Two
 * things do arrive over the screen, and only when they are asked for: ⌘K drops
 * a spotlight that takes the request and goes, and `Open` on a drug name slides
 * the record in from the right behind a scrim — the client wanted a record
 * dismissable rather than docked. What the agent does happens in the panel, in
 * view.
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
        className="border-edge w-[80%] max-w-none min-w-[900px] shrink-0 border-r"
      />
      <ResultsPane screener={screener} className="min-w-[260px] flex-1" />

      <AgentSpotlight screener={screener} />
    </ProductChrome>
  )
}
