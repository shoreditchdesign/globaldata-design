"use client"

import * as React from "react"
import {
  CheckIcon,
  XIcon,
  type LucideIcon,
} from "lucide-react"

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
} from "@/flows/sprint-4/idea-2b/data"

/**
 * Everything a view can do to the query. The sentence and the canvas make the
 * same edits by the same functions, so neither can do something the other
 * cannot show.
 */
export interface QueryHandlers {
  /**
   * Every edit names its condition by `id`, since a value pulled out of a group
   * leaves the same attribute in two conditions. A condition not in the query
   * yet is named by its attribute, and starts there.
   */
  onToggleValue: (id: string, attribute: string, value: string) => void
  onSetMode: (id: string, mode: Condition["mode"]) => void
  onSetJoin: (id: string, join: Condition["join"]) => void
  onSetLink: (id: string, link: Condition["link"]) => void
  onRemoveCondition: (id: string) => void
  /** Per-value counts for one condition's attribute, with that condition lifted. */
  countsFor: (id: string, attribute: string) => Record<string, number>
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

/** A menu item that moves the condition or value the menu was opened from. */
export interface MenuAction {
  label: string
  icon: LucideIcon
  onSelect: () => void
  disabled?: boolean
}

/**
 * The value list for one attribute: every value with what picking it would
 * leave, ticked where it is already in the query. The hybrid screener's pill
 * menu, now opened from the canvas only. The attribute need not be in the query yet
 * — a node that has just been added has no values until one is picked here.
 */
export function ValueMenu({
  attribute,
  condition,
  handlers,
  onClose,
  actions = [],
}: {
  attribute: string
  condition?: Condition
  handlers: QueryHandlers
  onClose: () => void
  /** Moves, the route that does not need a drag. */
  actions?: MenuAction[]
}) {
  const id = condition?.id ?? attribute
  const counts = handlers.countsFor(id, attribute)
  const selected = condition?.values ?? []
  const options = valueOptions(attribute, selected)

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
                onSelect={() => handlers.onToggleValue(id, attribute, value)}
                // The item's own trailing check would share the free space with
                // the count; this list draws its own checkbox on the left.
                className="gap-2 [&>svg:last-child]:hidden"
              >
                <span
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center rounded-[4px] border",
                    ticked ? "bg-selected border-selected text-selected-foreground" : "border-border",
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
            <CommandSeparator alwaysRender />
            <CommandGroup forceMount>
              {actions.map((action) => (
                <CommandItem
                  key={action.label}
                  // Values are searched by label; moves stay put whatever is typed.
                  value={`__action ${action.label}`}
                  forceMount
                  disabled={action.disabled}
                  onSelect={() => {
                    onClose()
                    action.onSelect()
                  }}
                  className="text-muted-foreground gap-2"
                >
                  <action.icon className="size-3.5" />
                  {action.label}
                </CommandItem>
              ))}
              <CommandItem
                value="__action remove"
                forceMount
                onSelect={() => {
                  onClose()
                  handlers.onRemoveCondition(condition.id)
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

/**
 * The moves a pill or a node offers from its menu, so drag is never the only
 * way. A value in a group can go to its own condition, straight after the
 * group. Left and right (up and down on the canvas) move the whole condition.
 * Where another condition shares the attribute, the value — or the whole
 * condition, if it has one value — can merge into it.
 */

/** The attributes that can be picked and are not in the query yet. */
export function availableAttributes(conditions: Condition[]) {
  const used = new Set(conditions.map((condition) => condition.attribute))
  return drugAttributeOrder.filter((attribute) => attributeDefs[attribute] && !used.has(attribute))
}
