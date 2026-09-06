import { ChevronDownIcon, Columns3Icon, DownloadIcon, LayersIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { AppliedPills } from "@/flows/sprint-3/idea-2/components/AppliedPills"
import { ResultsTable } from "@/flows/sprint-3/idea-2/components/ResultsTable"
import { baseTotal, liveTotal, resultRows } from "@/flows/sprint-3/idea-2/data"

/**
 * The right region: the query as pills, the one live total, then the rows.
 *
 * The table is never replaced by an empty state or a screening step — the user
 * is watching a set shrink, not composing a query in the dark.
 */
export function ResultsPane({ className }: { className?: string }) {
  return (
    <section className={cn("flex min-w-0 flex-col", className)}>
      <div className="shrink-0 border-b px-4 py-2.5">
        <AppliedPills />
      </div>

      <div className="flex shrink-0 items-center gap-3 border-b px-4 py-2">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[22px] leading-none font-semibold tracking-tight tabular-nums">
            {liveTotal.toLocaleString("en-GB")}
          </span>
          <span className="text-[13px] font-medium">drugs</span>
          <span className="text-muted-foreground text-[12px] tabular-nums">
            from {baseTotal.toLocaleString("en-GB")}
          </span>
        </div>

        <span className="text-muted-foreground ml-auto text-[12px] tabular-nums">
          Showing 1–{resultRows.length}
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
        <Button size="sm" className="h-7 px-2.5 text-[12px]">
          <DownloadIcon className="size-3.5" />
          Export
        </Button>
      </div>

      <ResultsTable />
    </section>
  )
}
