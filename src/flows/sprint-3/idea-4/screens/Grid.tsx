"use client"

import { useState } from "react"

import { AppChrome } from "@/flows/sprint-3/idea-4/components/AppChrome"
import { AppliedFilterBar, GridToolbar } from "@/flows/sprint-3/idea-4/components/GridToolbar"
import { ResultsGrid } from "@/flows/sprint-3/idea-4/components/ResultsGrid"

/**
 * The primary working state. Two filters are already on, a third is being set
 * from the Development Stage column header, and the widest record in the set
 * is expanded so the multi-value case is visible rather than implied.
 *
 * State here is presentational only — which menu is open, which records are
 * expanded. Nothing computes: every count is authored in `data.ts`.
 */
export function Grid() {
  const [openColumn, setOpenColumn] = useState<string | null>("stage")
  const [columnsOpen, setColumnsOpen] = useState(false)
  const [expandedRows, setExpandedRows] = useState<string[]>(["zanidatamab"])

  const toggleRow = (id: string) =>
    setExpandedRows((current) =>
      current.includes(id) ? current.filter((rowId) => rowId !== id) : [...current, id]
    )

  return (
    <AppChrome>
      <GridToolbar
        columnsOpen={columnsOpen}
        onColumnsOpenChange={(open) => {
          setColumnsOpen(open)
          if (open) setOpenColumn(null)
        }}
      />
      <AppliedFilterBar />
      <ResultsGrid
        openColumn={openColumn}
        onOpenColumnChange={(key) => {
          setOpenColumn(key)
          if (key) setColumnsOpen(false)
        }}
        expandedRows={expandedRows}
        onToggleRow={toggleRow}
      />
    </AppChrome>
  )
}
