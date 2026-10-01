"use client"

import * as React from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import type { ProductArea } from "@/components/prototype/ProductChrome"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  pathOf,
  searchAttributeLabels,
  searchAttributeValues,
  searchCategories,
  type ResolvedFilter,
} from "@/flows/sprint-4/idea-1c/data"
import { TickBox } from "@/flows/sprint-4/idea-1c/components/TickBox"

/**
 * Add filter, as Sprint 3 Idea 1's cascading panel: a breadcrumb that walks
 * back up the levels, a field that searches the level on screen, and the level
 * itself as a list — the Miller columns one column at a time, for a panel that
 * hangs off a button rather than a pane that owns the width of a page.
 *
 * Built out of the same `Command` the value lists in the filter box are built
 * out of, so the two read as one control opened from two places: the same
 * label over the field, the same rows, the same tick box on the right. The
 * search is cmdk's rather than a field of its own, which is also what makes the
 * list keyboard-navigable at every level. The source drew a chevron on a value
 * row as well as a tick box; values are the end of the path, so the chevron has
 * gone and the box has the lane it was using.
 *
 * A value's row is the single pick — that value in place of whatever the clause
 * held, and the panel closes, because Add filter has added a filter. Its tick
 * box is the other half: it adds the value to what is there and leaves the
 * panel open, for the reader who already knows they want three.
 *
 * Ticking writes through the same handler the Advanced columns use, so a filter
 * built here and a filter built there are the same filter.
 */
export function AddFilterCascade({
  filters,
  onPickValue,
  onPickOnlyValue,
  onDone,
}: {
  filters: ResolvedFilter[]
  /** The tick box: this value as well as the clause's others. */
  onPickValue: (area: ProductArea, attribute: string, value: string) => void
  /** The row: this value in place of them. */
  onPickOnlyValue: (area: ProductArea, attribute: string, value: string) => void
  /** Closes the panel, which a row picked does. */
  onDone: () => void
}) {
  const [area, setArea] = React.useState<ProductArea | null>(null)
  const [attribute, setAttribute] = React.useState<string | null>(null)
  // Cleared on every move, because it searches the level on screen rather than
  // the tree — a query left behind would hide the level arrived at.
  const [search, setSearch] = React.useState("")

  const openFilter = filters.find((filter) => {
    const path = pathOf(filter.id)
    return path.area === area && path.attribute === attribute
  })

  const move = (next: { area?: ProductArea | null; attribute?: string | null }) => {
    if (next.area !== undefined) setArea(next.area)
    if (next.attribute !== undefined) setAttribute(next.attribute)
    setSearch("")
  }

  return (
    <Command className="min-h-0">
      <div className="text-muted-foreground flex items-center px-3 py-2 text-[10px] font-medium tracking-[0.08em] uppercase">
        {area === null ? (
          "Filter area"
        ) : (
          <button
            type="button"
            onClick={() =>
              attribute ? move({ attribute: null }) : move({ area: null, attribute: null })
            }
            aria-label={`Back to ${attribute ? area : "Filter area"}`}
            // A button does not inherit the row's `uppercase`, so the
            // breadcrumb has to ask for it or the header changes case the
            // moment it becomes a path.
            className="hover:text-foreground flex min-w-0 items-center gap-1.5 uppercase transition-colors"
          >
            <ChevronLeftIcon className="size-3 shrink-0" />
            {/* The first level is called the same thing whether it is the
                title or the crumb being walked back to. */}
            <span className="truncate">{attribute ? area : "Filter area"}</span>
            <ChevronRightIcon className="size-3 shrink-0" />
            <span className="text-foreground truncate">{attribute ?? area}</span>
          </button>
        )}
      </div>

      <CommandInput
        value={search}
        onValueChange={setSearch}
        // Named exactly as the line above it names it. Lowercasing the label
        // here put the panel in two cases at once.
        placeholder={`Search ${attribute ?? area ?? "Filter area"}`}
      />

      <CommandList className="max-h-none min-h-0 flex-1">
        <CommandEmpty>No matches</CommandEmpty>
        <CommandGroup>
          {area === null
            ? searchCategories.map((item) => (
                <DrillItem
                  key={item}
                  label={item}
                  onSelect={() => move({ area: item as ProductArea })}
                />
              ))
            : attribute === null
              ? searchAttributeLabels(area).map((item) => (
                  <DrillItem key={item} label={item} onSelect={() => move({ attribute: item })} />
                ))
              : searchAttributeValues(area, attribute).map((value) => (
                  <ValueItem
                    key={value}
                    label={value}
                    checked={Boolean(openFilter?.values.includes(value))}
                    onSelect={() => {
                      onPickOnlyValue(area, attribute, value)
                      onDone()
                    }}
                    onTick={() => onPickValue(area, attribute, value)}
                  />
                ))}
        </CommandGroup>
      </CommandList>
    </Command>
  )
}

/** A row that goes a level deeper. */
function DrillItem({ label, onSelect }: { label: string; onSelect: () => void }) {
  return (
    <CommandItem
      value={label}
      onSelect={onSelect}
      // The item's own trailing check means nothing on a row that drills in.
      className="gap-2 [&>svg:last-child]:hidden"
    >
      <span className="truncate">{label}</span>
      <ChevronRightIcon className="text-muted-foreground ml-auto size-3.5 shrink-0" />
    </CommandItem>
  )
}

/** A row that puts a value in the filters, and a box that adds one to them. */
function ValueItem({
  label,
  checked,
  onSelect,
  onTick,
}: {
  label: string
  checked: boolean
  onSelect: () => void
  onTick: () => void
}) {
  return (
    <CommandItem
      value={label}
      onSelect={onSelect}
      // As in the filter box's own value lists: this draws its own tick box.
      className="gap-2 [&>svg:last-child]:hidden"
    >
      <span className="truncate">{label}</span>
      <span className="ml-auto flex">
        <TickBox
          checked={checked}
          label={`${checked ? "Remove" : "Add"} ${label}`}
          onClick={onTick}
        />
      </span>
    </CommandItem>
  )
}
