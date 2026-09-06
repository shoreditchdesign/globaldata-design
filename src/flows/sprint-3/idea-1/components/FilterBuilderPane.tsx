import { Button } from "@/components/ui/button"
import { FilterBuilderStack } from "@/flows/sprint-3/idea-1/components/FilterChips"
import type { FilterGroup } from "@/flows/sprint-3/idea-1/data"

/**
 * Right-hand pane of the modal. Present in every state — empty, or holding the
 * groups written by either tab.
 */
export function FilterBuilderPane({ groups = [] }: { groups?: FilterGroup[] }) {
  const empty = groups.length === 0

  return (
    <div className="bg-muted/30 flex w-[420px] shrink-0 flex-col border-l">
      {empty ? null : (
        <p className="text-muted-foreground px-6 pt-6 text-[11px] font-medium tracking-[0.08em] uppercase">
          Filter builder
        </p>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
        {empty ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="font-medium">Filter builder</p>
            <p className="text-muted-foreground mt-1 max-w-[260px] text-sm">
              Any filters applied will appear here. Add a filter manually or using AI.
            </p>
          </div>
        ) : (
          <FilterBuilderStack groups={groups} />
        )}
      </div>

      <div className="flex justify-end gap-2 px-6 pb-6">
        <Button variant="secondary" size="sm">
          Clear filters
        </Button>
        <Button size="sm">Apply filters</Button>
      </div>
    </div>
  )
}
