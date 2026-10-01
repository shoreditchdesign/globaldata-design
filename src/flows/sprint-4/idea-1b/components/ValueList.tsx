"use client"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { TickBox } from "@/flows/sprint-4/idea-1b/components/TickBox"

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
 */
export function ValueList({
  label,
  options,
  selected,
  onToggle,
  onPickOnly,
}: {
  /** The attribute, as the filter box names it. */
  label: string
  options: string[]
  selected: string[]
  /** The tick box. */
  onToggle: (value: string) => void
  /** The row. Closing the list, if it should close, is the caller's. */
  onPickOnly: (value: string) => void
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
            return (
              <CommandItem
                key={option}
                value={option}
                onSelect={() => onPickOnly(option)}
                // The item's own trailing check would sit beside the box and
                // say the same thing twice, so this list draws its own.
                className="gap-2 [&>svg:last-child]:hidden"
              >
                <span className="truncate">{option}</span>
                <span className="ml-auto flex">
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
