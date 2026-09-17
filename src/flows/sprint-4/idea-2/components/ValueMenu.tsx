"use client"

import * as React from "react"
import { CheckIcon, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  attributeDefs,
  drugAttributeOrder,
  valueOptions,
  type Condition,
} from "@/flows/sprint-4/idea-2/data"

/**
 * Everything a view can do to the query. The sentence and the canvas make the
 * same edits by the same functions, so neither can do something the other
 * cannot show.
 */
export interface QueryHandlers {
  onToggleValue: (attribute: string, value: string) => void
  onSetMode: (attribute: string, mode: Condition["mode"]) => void
  onSetJoin: (attribute: string, join: Condition["join"]) => void
  onSetLink: (attribute: string, link: Condition["link"]) => void
  onRemoveCondition: (attribute: string) => void
  /** Per-value counts for one attribute, with its own condition lifted. */
  countsFor: (attribute: string) => Record<string, number>
}

/** Exported for the resolve animation, which draws the sentence but must not edit it. */
export const inertHandlers: QueryHandlers = {
  onToggleValue: () => {},
  onSetMode: () => {},
  onSetJoin: () => {},
  onSetLink: () => {},
  onRemoveCondition: () => {},
  countsFor: () => ({}),
}

/**
 * The value list for one attribute: every value with what picking it would
 * leave, ticked where it is already in the query. Idea 1's pill menu, used by
 * both the sentence and the canvas. The attribute need not be in the query yet
 * — a node that has just been added has no values until one is picked here.
 */
export function ValueMenu({
  attribute,
  condition,
  handlers,
  onClose,
}: {
  attribute: string
  condition?: Condition
  handlers: QueryHandlers
  onClose: () => void
}) {
  const counts = handlers.countsFor(attribute)
  const selected = condition?.values ?? []
  const options = valueOptions(attribute, selected)
  const negated = condition?.mode === "is not"

  return (
    <Command>
      <div className="border-b px-3 py-2">
        <p className="text-muted-foreground text-[10px] font-medium tracking-[0.08em] uppercase">
          {attribute}
        </p>
      </div>
      <CommandInput placeholder={`Search ${attribute.toLowerCase()}…`} />
      <CommandList className="max-h-[260px]">
        <CommandEmpty>No values.</CommandEmpty>
        <CommandGroup>
          {options.map((value) => {
            const ticked = selected.includes(value)
            const count = counts[value] ?? 0
            return (
              <CommandItem
                key={value}
                value={value}
                onSelect={() => handlers.onToggleValue(attribute, value)}
                // The item's own trailing check would share the free space with
                // the count; this list draws its own checkbox on the left.
                className="gap-2 [&>svg:last-child]:hidden"
              >
                <span
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center rounded-[4px] border",
                    ticked
                      ? negated
                        ? "bg-negative-ink border-negative-ink text-background"
                        : "bg-selected border-selected text-selected-foreground"
                      : "border-border",
                  )}
                >
                  {ticked ? <CheckIcon className="size-3" /> : null}
                </span>
                <span className="truncate">{value}</span>
                <span
                  className={cn(
                    "ml-auto text-xs tabular-nums",
                    count === 0 ? "text-muted-foreground/60" : "text-muted-foreground",
                  )}
                >
                  {count.toLocaleString("en-GB")}
                </span>
              </CommandItem>
            )
          })}
        </CommandGroup>
        {condition ? (
          <>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  onClose()
                  handlers.onRemoveCondition(attribute)
                }}
                className="text-muted-foreground gap-2"
              >
                <XIcon className="size-3.5" />
                Remove this condition
              </CommandItem>
            </CommandGroup>
          </>
        ) : null}
      </CommandList>
    </Command>
  )
}

/** The attributes that can be picked and are not in the query yet. */
export function availableAttributes(conditions: Condition[]) {
  const used = new Set(conditions.map((condition) => condition.attribute))
  return drugAttributeOrder.filter((attribute) => attributeDefs[attribute] && !used.has(attribute))
}

/** A list of attributes, the first step of adding a condition from the sentence. */
export function AttributeMenu({
  attributes,
  onPick,
}: {
  attributes: string[]
  onPick: (attribute: string) => void
}) {
  return (
    <Command>
      <CommandInput placeholder="Search attributes…" />
      <CommandList className="max-h-[300px]">
        <CommandEmpty>No attributes.</CommandEmpty>
        <CommandGroup>
          {attributes.map((attribute) => (
            <CommandItem key={attribute} value={attribute} onSelect={() => onPick(attribute)}>
              {attribute}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  )
}
