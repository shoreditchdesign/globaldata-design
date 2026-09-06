import { PlusIcon, SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Chip, OperatorPill } from "@/flows/sprint-3/idea-1/components/FilterChips"
import type { FilterGroup } from "@/flows/sprint-3/idea-1/data"

/**
 * The applied-filter bar above the table. Same chips and operators as the
 * builder, laid out horizontally in labelled clusters.
 *
 * Sticky: the app content area scrolls, and the real product keeps the applied
 * filters in view while the rows move under them.
 */
export function FilterBar({
  groups,
  resultCount,
  overflowCount,
  children,
}: {
  groups: FilterGroup[]
  resultCount: string
  /** Rendered as a `+N` pill when the bar runs out of room. */
  overflowCount?: number
  /** Anchored popover, for the editable-from-the-bar state. */
  children?: React.ReactNode
}) {
  return (
    <div className="bg-background sticky top-0 z-20 border-b px-6 py-4">
      <div className="flex items-start gap-6">
        <div className="flex min-w-0 flex-1 flex-wrap items-start gap-x-6 gap-y-4">
          {groups.map((group, i) => {
            // The operator between two groups renders as the leading pill of the
            // second one, the way the source bar reads left to right.
            const leading = groups[i - 1]?.next
            return (
              <div key={group.label} className="flex items-stretch gap-6">
                {i > 0 && !leading ? <span className="bg-border w-px self-stretch" /> : null}
                <div className="flex flex-col gap-1.5">
                  <p className="text-muted-foreground text-[10px] font-medium tracking-[0.08em] uppercase">
                    {group.label}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    {leading ? <OperatorPill operator={leading} /> : null}
                    {group.chips.map((chip) => (
                      <span key={chip.label} className="contents">
                        <Chip chip={chip} />
                        {chip.next ? <OperatorPill operator={chip.next} /> : null}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}

          <div className="flex items-center gap-2 self-end">
            {overflowCount ? (
              <span className="bg-muted rounded-full px-3 py-1 text-sm tabular-nums">
                +{overflowCount}
              </span>
            ) : null}
            <span className="bg-muted flex size-7 items-center justify-center rounded-full">
              <PlusIcon className="size-3.5" />
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-3">
          <p className="text-xl font-semibold tracking-tight tabular-nums">{resultCount}</p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm">
              Clear filters
            </Button>
            <Button size="sm">
              <SearchIcon className="size-3.5" />
              Edit filters
            </Button>
          </div>
        </div>
      </div>

      {children}
    </div>
  )
}
