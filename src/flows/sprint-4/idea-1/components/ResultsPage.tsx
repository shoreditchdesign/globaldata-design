"use client"

import * as React from "react"

import { ResultsGrid } from "@/flows/sprint-4/idea-1/components/ResultsGrid"
import { matchingRows, resultCountFor, type ResolvedFilter } from "@/flows/sprint-4/idea-1/data"
import { applyAction, initialGridState, type GridAction } from "@/flows/sprint-4/idea-1/grid"

/**
 * The results page: the search panel on the left, and on the right the filter
 * box above the grid. The grid follows the filters as they are added, edited
 * or removed, so there is no search to run here.
 */
export function ResultsPage({
  panel,
  filterBox,
  filters,
}: {
  panel: React.ReactNode
  filterBox: React.ReactNode
  filters: ResolvedFilter[]
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
          rows={matchingRows(filters)}
          resultCount={resultCountFor(filters)}
          state={grid}
          onAction={onAction}
        />
      </main>
    </>
  )
}
