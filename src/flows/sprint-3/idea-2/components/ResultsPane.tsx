"use client"

import { Columns3Icon, DownloadIcon, LayersIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AppliedPills } from "@/flows/sprint-3/idea-2/components/AppliedPills"
import { RecordDrawer } from "@/flows/sprint-3/idea-2/components/RecordDrawer"
import { ResultsTable, resultColumns } from "@/flows/sprint-3/idea-2/components/ResultsTable"
import { platformTotal, sample } from "@/flows/sprint-3/idea-2/data"
import type { Screener } from "@/flows/sprint-3/idea-2/use-screener"
import { cn } from "@/lib/utils"

/** One page of rows. The set is counted whole; the table draws the top of it. */
const PAGE = 40

/**
 * The right region: the answer, and the rows it is an answer about.
 *
 * The count and the applied-filter sentence head this pane rather than footing
 * the filter panel. They are what the query left, and the client asked for them
 * at the top of the thing they describe — so the header states the count, says
 * the whole query in one line of removable objects, and carries the handles for
 * reading the set. There is no Search button and no commit: the rows are read
 * off the sample against the filters as they stand, so they move in the same
 * tick as the tick box that changed them, and when a combination matches
 * nothing the table says so rather than showing the last set that worked.
 *
 * `Showing 1–N` is gone. Beside a real count it said the same thing twice, and
 * the one fact it carried that the count does not — that the table draws the
 * top of a longer set — is now a clause on the count itself, and only on the
 * queries where it is true.
 *
 * `Group by`, `Columns` and `Export` are icons with tooltips; the words on this
 * row belong to the count and the query. The rest of a record is a drawer away,
 * not a column away.
 */
export function ResultsPane({
  screener,
  className,
}: {
  screener: Screener
  className?: string
}) {
  const { filters, rows, visibleColumns, toggleColumn } = screener
  const page = rows.slice(0, PAGE)

  return (
    <section className={cn("bg-surface-panel flex min-w-0 flex-col", className)}>
        <div className="border-edge flex shrink-0 flex-col gap-2 border-b px-3 py-2.5">
          <div className="flex items-center gap-1.5">
            <div className="mr-auto flex min-w-0 items-baseline gap-1.5">
              {/* The count is a count, not a headline. Thirty pixels was a
                  size for a foot rail two rounds ago; at the head of the table
                  it reads on the table's own scale, and the weight on the
                  number is the whole of the prominence it needs. */}
              <span className="text-[13px] leading-none font-semibold tabular-nums">
                {rows.length.toLocaleString("en-GB")}
              </span>
              <span className="text-[13px]">drugs</span>
              <span
                className="text-muted-foreground text-xs tabular-nums"
                title={`This prototype filters a fixed sample of ${sample.length.toLocaleString("en-GB")} rows in memory. The live platform holds ${platformTotal.toLocaleString("en-GB")}.`}
              >
                of {sample.length.toLocaleString("en-GB")} in the sample
              </span>
              {/* Said only when it is true, and it is a fact the count cannot
                  carry: the set is longer than the page the table draws. */}
              {rows.length > PAGE ? (
                <span className="text-muted-foreground text-xs tabular-nums">
                  · first {PAGE} shown
                </span>
              ) : null}
            </div>

            {/* Labelled, not icon-only. The icons alone were a concession to a
                results pane a fifth of the window wide; at half the window the
                words fit, and a toolbar you have to hover to read is a worse
                toolbar than one you can. */}
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <LayersIcon className="size-4" />
              Group by
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <Columns3Icon className="size-4" />
                  Columns
                </Button>
              </DropdownMenuTrigger>
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

            <Button size="sm" disabled={rows.length === 0}>
              <DownloadIcon className="size-4" />
              Export
            </Button>
          </div>

          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <AppliedPills screener={screener} />
            </div>

            {/* A link, not a button. It undoes the sentence beside it rather
                than doing anything to the set, and a bordered control at the
                end of a row of pills read as one more thing to press. */}
            <button
              type="button"
              onClick={screener.clearAll}
              disabled={filters.length === 0}
              className="text-muted-foreground hover:text-foreground mt-0.5 shrink-0 text-xs underline-offset-4 hover:underline disabled:pointer-events-none disabled:opacity-50"
            >
              Clear all
            </button>
          </div>
        </div>

      {rows.length === 0 ? (
        <div className="flex min-h-0 flex-1 items-start justify-center px-4 pt-16">
          <div className="max-w-sm text-center">
            <p className="text-[17px] font-medium">No drugs match this query.</p>
            {/*
              No `Clear all` here: it is in the header directly above, beside
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
