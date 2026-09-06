import { ChevronDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { FilterPill } from "@/components/prototype/FilterPill"
import type { FilterChip, FilterGroup, Operator } from "@/flows/sprint-3/idea-1/data"

/**
 * A removable filter value. The shared pill in its plainer `muted` skin — this
 * is the incumbent's chip, and it should look like the incumbent's chip.
 */
export function Chip({ chip, className }: { chip: FilterChip; className?: string }) {
  return (
    <FilterPill variant="muted" removeLabel={`Remove ${chip.label}`} className={className}>
      {chip.prefix ? <span className="text-muted-foreground">{chip.prefix}</span> : null}
      {chip.label}
      {chip.count !== undefined ? (
        <span className="text-muted-foreground text-xs tabular-nums">{chip.count}</span>
      ) : null}
    </FilterPill>
  )
}

/** AND / OR / NOT, editable in the real product — a dropdown affordance here. */
export function OperatorPill({ operator, className }: { operator: Operator; className?: string }) {
  return (
    <span
      className={cn(
        "text-muted-foreground inline-flex items-center gap-1 rounded-full border bg-transparent px-2.5 py-1 text-xs font-medium",
        className,
      )}
    >
      {operator}
      <ChevronDownIcon className="size-3" />
    </span>
  )
}

/** One group of chips inside the filter builder, as a card. */
export function FilterGroupCard({ group }: { group: FilterGroup }) {
  return (
    <div className="bg-background w-fit max-w-full rounded-xl border p-3 shadow-xs">
      <p className="text-muted-foreground mb-2 text-[10px] font-medium tracking-[0.08em] uppercase">
        {group.label}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {group.chips.map((chip) => (
          <span key={chip.label} className="contents">
            <Chip chip={chip} />
            {chip.next ? <OperatorPill operator={chip.next} /> : null}
          </span>
        ))}
      </div>
    </div>
  )
}

/** The stack of cards, with the between-group operators centred like the source. */
export function FilterBuilderStack({ groups }: { groups: FilterGroup[] }) {
  return (
    <div className="flex flex-col items-center gap-3">
      {groups.map((group) => (
        <div key={group.label} className="flex w-full flex-col items-center gap-3">
          <div className="w-full">
            <FilterGroupCard group={group} />
          </div>
          {group.next ? <OperatorPill operator={group.next} /> : null}
        </div>
      ))}
    </div>
  )
}
