import { ChevronDownIcon, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import type { FilterChip, FilterGroup, Operator } from "@/flows/sprint-2/idea-1/data"

/** A removable filter value. */
export function Chip({ chip, className }: { chip: FilterChip; className?: string }) {
  return (
    <span
      className={cn(
        "bg-muted inline-flex items-center gap-1.5 rounded-full py-1 pr-1.5 pl-3 text-sm",
        className,
      )}
    >
      {chip.prefix ? <span className="text-muted-foreground">{chip.prefix}</span> : null}
      {chip.label}
      {chip.count !== undefined ? (
        <span className="text-muted-foreground text-xs tabular-nums">{chip.count}</span>
      ) : null}
      <XIcon className="text-muted-foreground size-3.5" />
    </span>
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
