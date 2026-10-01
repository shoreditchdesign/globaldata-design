"use client"

import * as React from "react"

import type { ProductArea } from "@/components/prototype/ProductChrome"
import { ResultsGrid } from "@/flows/sprint-4/idea-1b/components/ResultsGrid"
import type { FilterId, ResolvedFilter } from "@/flows/sprint-4/idea-1b/data"
import { resultsFor } from "@/flows/sprint-4/idea-1b/results"
import { applyAction, initialGridState, type GridAction } from "@/flows/sprint-4/idea-1b/grid"

/**
 * The results page: the search panel on the left, and on the right the filter
 * box above the grid. The grid follows the filters as they are added, edited
 * or removed, so there is no search to run here.
 */
export function ResultsPage({
  panel,
  filterBox,
  filters,
  onToggleFilterValue,
  onPickOnlyFilterValue,
  onClearFilter,
  onClearFilters,
}: {
  panel: React.ReactNode
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
  const onAction = React.useCallback(
    (action: GridAction) => setGrid((current) => applyAction(current, action)),
    [],
  )

  return (
    <>
      {panel}
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
        />
      </main>
    </>
  )
}
