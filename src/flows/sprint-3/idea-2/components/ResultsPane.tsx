"use client"

import { Columns3Icon, DownloadIcon, LayersIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { RecordDrawer } from "@/flows/sprint-3/idea-2/components/RecordDrawer"
import { ResultsTable, resultColumns } from "@/flows/sprint-3/idea-2/components/ResultsTable"
import type { Screener } from "@/flows/sprint-3/idea-2/use-screener"
import { cn } from "@/lib/utils"

/** One page of rows. The set is counted whole; the table draws the top of it. */
const PAGE = 40

/**
 * The right region: the rows, and nothing about the query.
 *
 * The count and the sentence live at the foot of the filter panel, beside the
 * controls that move them, so this pane carries only what is on screen and the
 * handles for reading it. There is no Search button and no commit — the rows
 * are read off the sample against the filters as they stand, so they move in
 * the same tick as the tick box that changed them, and when a combination
 * matches nothing the table says so rather than showing the last set that
 * worked.
 *
 * At a fifth of the window the toolbar cannot spell its own controls, so
 * `Group by`, `Columns` and `Export` are icons with tooltips and only the count
 * keeps its words. The rest of a record is a drawer away, not a column away.
 */
export function ResultsPane({
  screener,
  className,
}: {
  screener: Screener
  className?: string
}) {
  const { rows, visibleColumns, toggleColumn } = screener
  const page = rows.slice(0, PAGE)

  return (
    <section className={cn("bg-surface-panel flex min-w-0 flex-col", className)}>
      <TooltipProvider>
        <div className="border-edge flex shrink-0 items-center gap-1.5 border-b px-3 py-2">
          <span className="text-muted-foreground mr-auto text-[16px] tabular-nums">
            {rows.length === 0 ? "Nothing to show" : `Showing 1–${page.length}`}
          </span>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                <LayersIcon className="size-4" />
                <span className="sr-only">Group by</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Group by</TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                    <Columns3Icon className="size-4" />
                    <span className="sr-only">Columns</span>
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>Columns</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end" className="w-auto min-w-44">
              {resultColumns.map((column) => {
                const shown = visibleColumns.includes(column.key)
                return (
                  <DropdownMenuCheckboxItem
                    key={column.key}
                    checked={shown}
                    // Two columns is the floor, and the name is never one of
                    // the two that go: it carries `Open`, so unticking it would
                    // shut the only door to the fields the table dropped.
                    disabled={column.key === "name" || (shown && visibleColumns.length <= 2)}
                    onSelect={(event) => event.preventDefault()}
                    onCheckedChange={() => toggleColumn(column.key)}
                  >
                    {column.label}
                  </DropdownMenuCheckboxItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon-sm" disabled={rows.length === 0}>
                <DownloadIcon className="size-4" />
                <span className="sr-only">Export</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Export</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>

      {rows.length === 0 ? (
        <div className="flex min-h-0 flex-1 items-start justify-center px-4 pt-16">
          <div className="max-w-sm text-center">
            <p className="text-[17px] font-medium">No drugs match this query.</p>
            {/*
              No `Clear all` here: it is permanently on the panel foot, beside
              the query it would clear. A second one in the empty state put the
              same control in two places and moved it away from the rail the
              client asked to carry it.
            */}
            <p className="text-muted-foreground mt-1 text-[16px] leading-relaxed">
              Nothing in the sample satisfies every condition at once.
            </p>
          </div>
        </div>
      ) : (
        <ResultsTable
          rows={page}
          visibleColumns={visibleColumns}
          onOpenRecord={screener.openRecord}
        />
      )}

      <RecordDrawer screener={screener} />
    </section>
  )
}
