import { ChevronRightIcon, PlusIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { AppChrome } from "@/flows/sprint-2/idea-1/components/AppChrome"
import { FilterBar } from "@/flows/sprint-2/idea-1/components/FilterBar"
import { groupByRows, parsedGroups } from "@/flows/sprint-2/idea-1/data"

/** Results collapsed into groups, with room for a second grouping. */
export function GroupBy() {
  return (
    <AppChrome>
      <FilterBar groups={parsedGroups} resultCount="245 Drugs" />

      <div className="flex items-center gap-3 px-6 py-4">
        <span className="text-muted-foreground text-[10px] font-medium tracking-[0.08em] uppercase">
          Group by
        </span>
        <span className="bg-muted inline-flex items-center gap-1.5 rounded-full py-1 pr-1.5 pl-3 text-sm">
          Developmental stage
          <XIcon className="text-muted-foreground size-3.5" />
        </span>
        <span className="bg-muted flex size-7 items-center justify-center rounded-full">
          <PlusIcon className="size-3.5" />
        </span>
        <Button variant="ghost" size="sm" className="ml-auto">
          Clear all
        </Button>
      </div>

      <div className="px-6">
        <div className="overflow-hidden rounded-lg border">
          {groupByRows.map((row) => (
            <div
              key={row.label}
              className="flex items-center gap-2 border-b px-4 py-2.5 text-sm last:border-0"
            >
              <ChevronRightIcon className="text-muted-foreground size-3.5" />
              <span className="flex-1">{row.label}</span>
              <span className="text-muted-foreground text-xs tabular-nums">{row.count}</span>
            </div>
          ))}
        </div>
      </div>
    </AppChrome>
  )
}
