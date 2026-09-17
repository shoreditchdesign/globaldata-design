"use client"

import * as React from "react"
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  CheckIcon,
  MergeIcon,
  SplitIcon,
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
import { type DragPayload, type DropTarget } from "@/flows/sprint-4/idea-2/arrange"
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
 * leave, ticked where it is already in the query. Idea 1's pill menu, used by
 * both the sentence and the canvas. The attribute need not be in the query yet
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
export function arrangeActions({
  conditions,
  condition,
  value,
  arrange,
  vertical,
}: {
  conditions: Condition[]
  condition: Condition
  /** The pill the menu was opened from, if any. */
  value?: string
  arrange: (payload: DragPayload, target: DropTarget) => void
  vertical?: boolean
}): MenuAction[] {
  const index = conditions.findIndex((c) => c.id === condition.id)
  if (index === -1) return []
  const whole: DragPayload = { kind: "condition", id: condition.id }
  const single = condition.values.length < 2
  const actions: MenuAction[] = []

  if (value !== undefined && !single) {
    actions.push({
      label: "Move to its own condition",
      icon: SplitIcon,
      onSelect: () => arrange({ kind: "value", id: condition.id, value }, { kind: "gap", index: index + 1 }),
    })
  }
  actions.push(
    {
      label: vertical ? "Move up" : "Move left",
      icon: vertical ? ArrowUpIcon : ArrowLeftIcon,
      disabled: index === 0,
      onSelect: () => arrange(whole, { kind: "gap", index: index - 1 }),
    },
    {
      label: vertical ? "Move down" : "Move right",
      icon: vertical ? ArrowDownIcon : ArrowRightIcon,
      disabled: index === conditions.length - 1,
      onSelect: () => arrange(whole, { kind: "gap", index: index + 2 }),
    },
  )
  const moving: DragPayload = value !== undefined && !single ? { kind: "value", id: condition.id, value } : whole
  for (const other of conditions) {
    if (other.id === condition.id || other.attribute !== condition.attribute) continue
    actions.push({
      label: `Merge with ${other.values.join(", ")}`,
      icon: MergeIcon,
      onSelect: () => arrange(moving, { kind: "merge", id: other.id }),
    })
  }
  return actions
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
