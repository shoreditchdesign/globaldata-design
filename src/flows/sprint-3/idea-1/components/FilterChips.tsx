import { ChevronDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { FilterPill } from "@/components/prototype/FilterPill"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { FilterChip, FilterGroup, Operator } from "@/flows/sprint-3/idea-1/data"
import { operators } from "@/flows/sprint-3/idea-1/data"

/**
 * A removable filter value. The shared pill in its plainer `muted` skin — this
 * is the incumbent's chip, and it should look like the incumbent's chip.
 *
 * The shared pill owns its own remove button and takes no handler, so the
 * removal is caught on the way up rather than by forking the component.
 */
export function Chip({
  chip,
  className,
  onRemove,
}: {
  chip: FilterChip
  className?: string
  onRemove?: () => void
}) {
  return (
    <span
      className="contents"
      onClick={(event) => {
        if (!onRemove) return
        if ((event.target as HTMLElement).closest("button")) onRemove()
      }}
    >
      <FilterPill variant="muted" removeLabel={`Remove ${chip.label}`} className={className}>
        {chip.prefix ? <span className="text-muted-foreground">{chip.prefix}</span> : null}
        {chip.label}
        {chip.count !== undefined ? (
          <span className="text-muted-foreground text-xs tabular-nums">{chip.count}</span>
        ) : null}
      </FilterPill>
    </span>
  )
}

/** AND / OR / NOT. A dropdown in the real product, and a dropdown here. */
export function OperatorPill({
  operator,
  className,
  onChange,
}: {
  operator: Operator
  className?: string
  onChange?: (operator: Operator) => void
}) {
  const classes = cn(
    "text-muted-foreground inline-flex items-center gap-1 rounded-full border bg-transparent px-2.5 py-1 text-xs font-medium",
    onChange && "hover:text-foreground hover:bg-accent transition-colors",
    className,
  )

  if (!onChange) {
    return (
      <span className={classes}>
        {operator}
        <ChevronDownIcon className="size-3" />
      </span>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={classes} aria-label={`Operator, currently ${operator}`}>
        {operator}
        <ChevronDownIcon className="size-3" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-24">
        {operators.map((option) => (
          <DropdownMenuItem key={option} onSelect={() => onChange(option)}>
            {option}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export interface GroupHandlers {
  onRemoveChip?: (groupIndex: number, chipIndex: number) => void
  onChipOperator?: (groupIndex: number, chipIndex: number, operator: Operator) => void
  onGroupOperator?: (groupIndex: number, operator: Operator) => void
}

/** The chips of one group, with the operators between them. */
export function GroupChips({
  group,
  groupIndex,
  onRemoveChip,
  onChipOperator,
}: { group: FilterGroup; groupIndex: number } & GroupHandlers) {
  return (
    <>
      {group.chips.map((chip, chipIndex) => (
        <span key={chip.label} className="contents">
          <Chip chip={chip} onRemove={onRemoveChip && (() => onRemoveChip(groupIndex, chipIndex))} />
          {chip.next ? (
            <OperatorPill
              operator={chip.next}
              onChange={
                onChipOperator && ((operator) => onChipOperator(groupIndex, chipIndex, operator))
              }
            />
          ) : null}
        </span>
      ))}
    </>
  )
}

/** One group of chips inside the filter builder, as a card. */
export function FilterGroupCard({
  group,
  groupIndex,
  ...handlers
}: { group: FilterGroup; groupIndex: number } & GroupHandlers) {
  return (
    <div className="bg-background w-fit max-w-full rounded-xl border p-3 shadow-xs">
      <p className="text-muted-foreground mb-2 text-[10px] font-medium tracking-[0.08em] uppercase">
        {group.label}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <GroupChips group={group} groupIndex={groupIndex} {...handlers} />
      </div>
    </div>
  )
}

/** The stack of cards, with the between-group operators centred like the source. */
export function FilterBuilderStack({
  groups,
  ...handlers
}: { groups: FilterGroup[] } & GroupHandlers) {
  const { onGroupOperator } = handlers

  return (
    <div className="flex flex-col items-center gap-3">
      {groups.map((group, groupIndex) => (
        <div key={group.label} className="flex w-full flex-col items-center gap-3">
          <div className="w-full">
            <FilterGroupCard group={group} groupIndex={groupIndex} {...handlers} />
          </div>
          {group.next ? (
            <OperatorPill
              operator={group.next}
              onChange={onGroupOperator && ((operator) => onGroupOperator(groupIndex, operator))}
            />
          ) : null}
        </div>
      ))}
    </div>
  )
}
