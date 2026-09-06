"use client"

import { ChevronDownIcon, Columns3Icon, DownloadIcon, LayersIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { AppliedPills } from "@/flows/sprint-3/idea-2/components/AppliedPills"
import { ResultsTable } from "@/flows/sprint-3/idea-2/components/ResultsTable"
import { platformTotal, sample } from "@/flows/sprint-3/idea-2/data"
import type { Screener } from "@/flows/sprint-3/idea-2/use-screener"

/** One page of rows. The set is counted whole; the table draws the top of it. */
const PAGE = 40

/**
 * The right region: the query as pills, the one live total, then the rows.
 *
 * There is no Search button and no commit. The count and the rows are both
 * read off the sample against the filters as they stand, so they move in the
 * same tick as the tick box that changed them — and when a combination matches
 * nothing, the table says so rather than showing the last set that worked.
 */
export function ResultsPane({
  screener,
  className,
}: {
  screener: Screener
  className?: string
}) {
  const { rows } = screener
  const page = rows.slice(0, PAGE)

  return (
    <section className={cn("bg-surface-panel flex min-w-0 flex-col", className)}>
      <div className="border-hairline shrink-0 border-b px-4 py-2.5">
        <AppliedPills screener={screener} />
      </div>

      <div className="border-edge flex shrink-0 items-center gap-3 border-b px-4 py-2">
        <div className="flex items-baseline gap-1.5">
          <span className="text-brand-ink text-[22px] leading-none font-semibold tracking-tight tabular-nums">
            {rows.length.toLocaleString("en-GB")}
          </span>
          <span className="text-[13px] font-medium">drugs</span>
          <span
            className="text-muted-foreground text-[12px] tabular-nums"
            title={`This prototype filters a fixed sample of ${sample.length.toLocaleString("en-GB")} rows in memory. The live platform holds ${platformTotal.toLocaleString("en-GB")}.`}
          >
            of {sample.length.toLocaleString("en-GB")} in the sample
          </span>
        </div>

        <span className="text-muted-foreground ml-auto text-[12px] tabular-nums">
          {rows.length === 0 ? "Nothing to show" : `Showing 1–${page.length}`}
        </span>
        <span className="bg-border h-4 w-px" />
        <Button variant="ghost" size="sm" className="text-muted-foreground h-7 px-2 text-[12px]">
          <LayersIcon className="size-3.5" />
          Group by
          <ChevronDownIcon className="size-3" />
        </Button>
        <Button variant="ghost" size="sm" className="text-muted-foreground h-7 px-2 text-[12px]">
          <Columns3Icon className="size-3.5" />
          Columns
        </Button>
        <Button size="sm" className="h-7 px-2.5 text-[12px]" disabled={rows.length === 0}>
          <DownloadIcon className="size-3.5" />
          Export
        </Button>
      </div>

      {rows.length === 0 ? (
        <div className="flex min-h-0 flex-1 items-start justify-center px-4 pt-16">
          <div className="max-w-sm text-center">
            <p className="text-[14px] font-medium">No drugs match this query.</p>
            <p className="text-muted-foreground mt-1 text-[12.5px] leading-relaxed">
              Nothing in the sample satisfies every condition at once.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={screener.clearAll}
              className="mt-3 h-7 px-2.5 text-[12px]"
            >
              Clear all filters
            </Button>
          </div>
        </div>
      ) : (
        <ResultsTable rows={page} />
      )}
    </section>
  )
}
