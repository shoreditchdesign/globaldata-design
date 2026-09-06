import { AppChrome } from "@/flows/sprint-3/idea-2/components/AppChrome"
import { FilterPanel } from "@/flows/sprint-3/idea-2/components/FilterPanel"
import { ResultsPane } from "@/flows/sprint-3/idea-2/components/ResultsPane"

/**
 * The primary working state: three filters applied, the drill-down open two
 * levels into Therapy Area, and the results reflowing beside it.
 *
 * The panel is a region of the layout, not an overlay. Nothing is dimmed and
 * nothing sits on top of anything — the objection to Sprint 2 was being
 * covered, not the panel being small.
 */
export function Screener() {
  return (
    <AppChrome>
      <FilterPanel className="w-[40%] max-w-[760px] min-w-[580px] shrink-0 border-r" />
      <ResultsPane className="flex-1" />
    </AppChrome>
  )
}
