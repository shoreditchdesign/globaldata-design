"use client"

import * as React from "react"

import type { ProductArea } from "@/components/prototype/ProductChrome"
import { ResultsGrid } from "@/flows/sprint-4/idea-1c/components/ResultsGrid"
import type { FilterId, ResolvedFilter } from "@/flows/sprint-4/idea-1c/data"
import { resultsFor } from "@/flows/sprint-4/idea-1c/results"
import { applyAction, initialGridState, type GridAction } from "@/flows/sprint-4/idea-1c/grid"
import type { SearchMode } from "@/flows/sprint-4/idea-1c/state"

/**
 * The results page: the filter box across the top, and under it the grid,
 * with the chat section beside the table inside it. The grid follows the
 * filters as they are added, edited or removed, so there is no search to run
 * here.
 *
 * Whether the chat section is open is a view preference, not part of the
 * query, so it is held here rather than in the prototype state and no screen
 * seeds into it.
 */
export function ResultsPage({
  panel,
  mode,
  filterBox,
  filters,
  onToggleFilterValue,
  onPickOnlyFilterValue,
  onClearFilter,
  onClearFilters,
}: {
  panel: React.ReactNode
  /** Advanced widens the chat section to hold its three Miller columns. */
  mode: SearchMode
  filterBox: React.ReactNode
  filters: ResolvedFilter[]
  /** The column menus filter by the same handlers the filter box uses. */
  onToggleFilterValue: (area: ProductArea, attribute: string, value: string) => void
  onPickOnlyFilterValue: (area: ProductArea, attribute: string, value: string) => void
  onClearFilter: (id: FilterId) => void
  /** Clears every criterion. The search field is not this button's business. */
  onClearFilters: () => void
}) {
  const results = resultsFor(filters)
  const [grid, setGrid] = React.useState(initialGridState)
  const [panelOpen, setPanelOpen] = React.useState(true)
  const onAction = React.useCallback(
    (action: GridAction) => setGrid((current) => applyAction(current, action)),
    [],
  )

  return (
    <main className="bg-surface-panel flex min-w-0 flex-1 flex-col">
      <div className="bg-surface-chrome border-edge max-h-[45%] shrink-0 overflow-y-auto border-b">
        {filterBox}
      </div>
      <ResultsGrid
        rows={results.rows}
        resultCount={results.count}
        state={grid}
        filters={filters}
        onAction={onAction}
        onToggleFilterValue={onToggleFilterValue}
        onPickOnlyFilterValue={onPickOnlyFilterValue}
        onClearFilter={onClearFilter}
        onClearFilters={onClearFilters}
        aside={panel}
        asideOpen={panelOpen}
        // A quarter of the page for the pills and the field, held to a floor
        // the ten pills still pair up in; Advanced is 800px, three thirds of
        // 266px against the Miller columns' 260px floor.
        asideWidth={mode === "manual" ? "800px" : "max(360px, 25vw)"}
        onToggleAside={() => setPanelOpen((open) => !open)}
      />
    </main>
  )
}
