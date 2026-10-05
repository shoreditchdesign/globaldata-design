"use client"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { formatCount } from "@/flows/sprint-4/idea-1c/components/MillerColumn"
import { TickBox } from "@/flows/sprint-4/idea-1c/components/TickBox"
import { cn } from "@/lib/utils"

/**
 * The values of one attribute, ticked where they are already in the filters.
 *
 * The list the whole idea opens when a filter is being given its values —
 * from a clause in the filter box, and from a column's own menu in the grid.
 * One component, because the two have to be the same list: a reader who ticks
 * Generic in the box and then opens Drug type from the column should find the
 * list they left, not a second opinion about it.
 *
 * Two targets per row. The row is the single pick — this value in place of the
 * others, which is what a list is most often read for. The tick box is the
 * other half: this value as well, with the list left open for the next.
 *
 * With `countOf`, each row carries the same count the Miller columns print
 * beside it, in the same format, and a value that would leave nothing recedes.
 * The counts are the whole sample's, not the query's in context.
 */
export function ValueList({
  label,
  options,
  selected,
  onToggle,
  onPickOnly,
  countOf,
}: {
  /** The attribute, as the filter box names it. */
  label: string
  options: string[]
  selected: string[]
  /** The tick box. */
  onToggle: (value: string) => void
  /** The row. Closing the list, if it should close, is the caller's. */
  onPickOnly: (value: string) => void
  /** The rows a value would keep, when the list should say so. */
  countOf?: (value: string) => number
}) {
  return (
    <Command>
      <div className="text-muted-foreground flex items-center px-3 py-2 text-[10px] font-medium tracking-[0.08em] uppercase">
        {label}
      </div>
      <CommandInput placeholder={`Search ${label}`} />
      <CommandList>
        <CommandEmpty>No matches</CommandEmpty>
        <CommandGroup>
          {options.map((option) => {
            const ticked = selected.includes(option)
            const count = countOf?.(option)
            const empty = count === 0 && !ticked
            return (
              <CommandItem
                key={option}
                value={option}
                onSelect={() => onPickOnly(option)}
                // The item's own trailing check would sit beside the box and
                // say the same thing twice, so this list draws its own.
                className="gap-2 [&>svg:last-child]:hidden"
              >
                <span className={cn("truncate", empty && "text-muted-foreground")}>{option}</span>
                {count === undefined ? null : (
                  <span className="text-muted-foreground ml-auto shrink-0 text-xs tabular-nums">
                    {formatCount(count)}
                  </span>
                )}
                <span className={cn("flex", count === undefined && "ml-auto")}>
                  <TickBox
                    checked={ticked}
                    label={`${ticked ? "Remove" : "Add"} ${option}`}
                    onClick={() => onToggle(option)}
                  />
                </span>
              </CommandItem>
            )
          })}
        </CommandGroup>
      </CommandList>
    </Command>
  )
}
