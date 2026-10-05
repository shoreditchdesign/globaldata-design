"use client"

import * as React from "react"

import type { ProductArea } from "@/components/prototype/ProductChrome"
import { ResultsGrid } from "@/flows/sprint-4/idea-1c/components/ResultsGrid"
import type { FilterId, ResolvedFilter } from "@/flows/sprint-4/idea-1c/data"
import { resultsFor } from "@/flows/sprint-4/idea-1c/results"
import { applyAction, initialGridState, type GridAction } from "@/flows/sprint-4/idea-1c/grid"

/**
 * How long the table shows it is working after the filters change. Nothing is
 * being fetched — the sample filters in a frame — but a table that swaps its
 * rows instantly under a changed value reads as not having heard, so it says
 * it did, briefly, before it settles.
 */
const LOADING_MS = 550

/** Everything about the filters that changes which rows come back. */
function signatureOf(filters: ResolvedFilter[]) {
  return filters
    .map(
      (filter) =>
        `${filter.id}:${filter.values.join(",")}:${filter.excluded}:${filter.join}:${filter.link}`,
    )
    .join("|")
}

/**
 * The results page: the filter box across the top, and under it the grid,
 * with the chat section beside the table inside it. The grid follows the
 * filters as they are added, edited or removed, so there is no search to run
 * here.
 *
 * Whether the search panel is open is held in the prototype state rather than
 * here, so Add filter and a column's Edit filters can open it from outside.
 */
export function ResultsPage({
  panel,
  filterBox,
  panelOpen,
  onPanelOpenChange,
  filters,
  onToggleFilterValue,
  onPickOnlyFilterValue,
  onClearFilter,
  onClearFilters,
}: {
  panel: React.ReactNode
  filterBox: React.ReactNode
  panelOpen: boolean
  onPanelOpenChange: (open: boolean) => void
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
  // Loading until the current filters have been settled on — which they have
  // not on arrival, since arriving here means a search has just run.
  const signature = signatureOf(filters)
  const [settled, setSettled] = React.useState<string | null>(null)
  React.useEffect(() => {
    const timer = window.setTimeout(() => setSettled(signature), LOADING_MS)
    return () => window.clearTimeout(timer)
  }, [signature])
  const loading = settled !== signature
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
        loading={loading}
        aside={panel}
        asideOpen={panelOpen}
        // One width in both modes, so nothing beside the panel moves when the
        // switch flips: Advanced's, three thirds of 266px against the Miller
        // columns' 260px floor, which the pills and the composer fit inside.
        asideWidth="800px"
        onOpenAside={() => onPanelOpenChange(true)}
      />
    </main>
  )
}
