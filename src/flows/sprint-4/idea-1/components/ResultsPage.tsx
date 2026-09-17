"use client"

import * as React from "react"

import { ResultsGrid } from "@/flows/sprint-4/idea-1/components/ResultsGrid"
import { matchingRows, resultCountFor, type ResolvedFilter } from "@/flows/sprint-4/idea-1/data"
import { applyAction, initialGridState, type GridAction } from "@/flows/sprint-4/idea-1/grid"

/**
 * The results page: the search panel on the left, and on the right the filter
 * box above the grid it last searched. Editing the box does not move the grid
 * until the search runs again, so the count on the button is a preview.
 */
export function ResultsPage({
  panel,
  filterBox,
  appliedFilters,
}: {
  panel: React.ReactNode
  filterBox: React.ReactNode
  appliedFilters: ResolvedFilter[]
}) {
  const [grid, setGrid] = React.useState(initialGridState)
  const onAction = React.useCallback(
    (action: GridAction) => setGrid((current) => applyAction(current, action)),
    [],
  )

  return (
    <>
      {panel}
      <main className="bg-surface-page flex min-w-0 flex-1 flex-col gap-3 p-3">
        <div className="max-h-[45%] shrink-0 overflow-y-auto rounded-xl">{filterBox}</div>
        <ResultsGrid
          rows={matchingRows(appliedFilters)}
          resultCount={resultCountFor(appliedFilters)}
          state={grid}
          onAction={onAction}
        />
      </main>
    </>
  )
}
