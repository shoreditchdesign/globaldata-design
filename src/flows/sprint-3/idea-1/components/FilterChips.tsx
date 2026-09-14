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
import { groupNegated, operators } from "@/flows/sprint-3/idea-1/data"

/**
 * A removable filter value, in the shared pill's tinted `applied` skin — the
 * same chip the other directions draw — or `excluded` when a NOT negates its
 * group, so an exclusion never reads like an inclusion.
 *
 * The shared pill owns its own remove button and takes no handler, so the
 * removal is caught on the way up rather than by forking the component.
 */
export function Chip({
  chip,
  negated = false,
  className,
  onOpen,
  onRemove,
}: {
  chip: FilterChip
  negated?: boolean
  className?: string
  onOpen?: () => void
  onRemove?: () => void
}) {
  const content = (
    <>
      {chip.prefix ? <span className="font-normal opacity-70">{chip.prefix}</span> : null}
      <span className="max-w-[260px] truncate">{chip.label}</span>
      {chip.count !== undefined ? (
        <span className="text-[11px] font-normal tabular-nums opacity-70">{chip.count}</span>
      ) : null}
    </>
  )

  return (
    <span
      className="contents"
      onClick={(event) => {
        if (!onRemove) return
        if ((event.target as HTMLElement).closest('[data-slot="filter-pill-remove"]')) onRemove()
      }}
    >
      <FilterPill
        variant={negated ? "excluded" : "applied"}
        removeLabel={`Remove ${chip.label}`}
        className={className}
      >
        {onOpen ? (
          <button
            type="button"
            data-slot="filter-pill-open"
            onClick={onOpen}
            aria-label={`Open ${chip.label} filter controls`}
            className="focus-visible:ring-ring/50 inline-flex min-w-0 items-center gap-1 rounded-full text-left hover:underline focus-visible:ring-2 focus-visible:outline-none"
          >
            {content}
          </button>
        ) : (
          content
        )}
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
    "text-muted-foreground bg-surface-panel border-border inline-flex h-6 items-center gap-1 rounded-full border px-2 text-[11px] font-medium tracking-[0.08em]",
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
  onOpenChip?: (groupIndex: number, chipIndex: number) => void
  onRemoveChip?: (groupIndex: number, chipIndex: number) => void
  onChipOperator?: (groupIndex: number, chipIndex: number, operator: Operator) => void
  onGroupOperator?: (groupIndex: number, operator: Operator) => void
}

/** The chips of one group, with the operators between them. */
export function GroupChips({
  group,
  groupIndex,
  negated = false,
  onOpenChip,
  onRemoveChip,
  onChipOperator,
}: { group: FilterGroup; groupIndex: number; negated?: boolean } & GroupHandlers) {
  return (
    <>
      {group.chips.map((chip, chipIndex) => (
        <span key={chip.label} className="contents">
          <Chip
            chip={chip}
            negated={negated}
            onOpen={
              onOpenChip && group.area && group.attribute
                ? () => onOpenChip(groupIndex, chipIndex)
                : undefined
            }
            onRemove={onRemoveChip && (() => onRemoveChip(groupIndex, chipIndex))}
          />
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
  negated = false,
  ...handlers
}: { group: FilterGroup; groupIndex: number; negated?: boolean } & GroupHandlers) {
  return (
    <div className="bg-surface-panel border-border w-fit max-w-full rounded-lg border p-3">
      <p className="text-muted-foreground mb-2 text-[10px] font-medium tracking-[0.08em] uppercase">
        {group.label}
      </p>
      <div className="flex flex-wrap items-center gap-1.5">
        <GroupChips group={group} groupIndex={groupIndex} negated={negated} {...handlers} />
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
            <FilterGroupCard
              group={group}
              groupIndex={groupIndex}
              negated={groupNegated(groups, groupIndex)}
              {...handlers}
            />
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
