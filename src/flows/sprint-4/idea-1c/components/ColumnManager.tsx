"use client"

import * as React from "react"
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { TickBox } from "@/flows/sprint-4/idea-1c/components/TickBox"
import {
  columnByKey,
  hiddenColumnKeys,
  type GridAction,
  type GridState,
} from "@/flows/sprint-4/idea-1c/grid"

/** Group headings in the panel's own label treatment rather than cmdk's. */
const GROUP_CLASS =
  "**:[[cmdk-group-heading]]:px-3 **:[[cmdk-group-heading]]:text-[10px] **:[[cmdk-group-heading]]:tracking-[0.08em] **:[[cmdk-group-heading]]:uppercase"

/**
 * AG Grid's columns tool panel, after Sprint 3 Idea 4's manager: every column
 * can be shown, hidden or moved, and the grid changes as you do it. Reordering
 * is a pair of chevrons rather than a drag handle that does not drag.
 *
 * Built out of the same `Command` as Add filter and the filter box's value
 * lists, so every list this idea opens from a button is the same list: a label
 * over a field, rows at one size, and the tick box on the right. The search is
 * cmdk's, which is what makes the rows keyboard-navigable.
 */
export function ColumnManager({
  state,
  onAction,
}: {
  state: GridState
  onAction: (action: GridAction) => void
}) {
  const [query, setQuery] = React.useState("")

  const shown = state.order.filter((key) => key !== "select")
  const hidden = hiddenColumnKeys(state)

  return (
    <Command>
      <div className="text-muted-foreground flex items-center px-3 py-2 text-[10px] font-medium tracking-[0.08em] uppercase">
        Columns
      </div>

      <CommandInput value={query} onValueChange={setQuery} placeholder="Search Columns" />

      <CommandList className="max-h-[400px]">
        <CommandEmpty>No matches</CommandEmpty>

        <CommandGroup heading={`In the grid · ${shown.length}`} className={GROUP_CLASS}>
          {shown.map((key) => {
            const column = columnByKey[key]
            const index = state.order.indexOf(key)
            // The row's name is what the grid is keyed on and cannot be taken
            // out, so its box is drawn ticked and does nothing.
            const fixed = key === "name"
            return (
              <ColumnRow
                key={key}
                label={column.label}
                checked
                disabled={fixed}
                onSelect={() => {
                  if (!fixed) onAction({ kind: "removeColumn", columnKey: key })
                }}
                move={
                  <span className="flex shrink-0 flex-col leading-none">
                    <MoveButton
                      label={`Move ${column.label} up`}
                      // Moving while the list is filtered would move a column
                      // past one that is not on screen.
                      disabled={index <= 1 || Boolean(query)}
                      onClick={() => onAction({ kind: "moveColumn", columnKey: key, by: -1 })}
                    >
                      <ChevronUpIcon className="size-3.5" />
                    </MoveButton>
                    <MoveButton
                      label={`Move ${column.label} down`}
                      disabled={index >= state.order.length - 1 || Boolean(query)}
                      onClick={() => onAction({ kind: "moveColumn", columnKey: key, by: 1 })}
                    >
                      <ChevronDownIcon className="size-3.5" />
                    </MoveButton>
                  </span>
                }
              />
            )
          })}
        </CommandGroup>

        <CommandGroup
          heading={`Available · ${hidden.length}`}
          className={GROUP_CLASS}
          // Kept on screen with nothing in it, so the panel can say that every
          // column is already in the grid rather than ending on a heading.
          forceMount={hidden.length === 0}
        >
          {hidden.length === 0 ? (
            <p className="text-muted-foreground px-3 py-1.5 text-sm">
              Every column is in the grid.
            </p>
          ) : (
            hidden.map((key) => (
              <ColumnRow
                key={key}
                label={columnByKey[key].label}
                checked={false}
                onSelect={() => onAction({ kind: "addColumn", columnKey: key })}
                // The lane the shown rows keep for their move chevrons, so both
                // groups' labels start on the same line.
                move={<span className="w-3.5 shrink-0" />}
              />
            ))
          )}
        </CommandGroup>
      </CommandList>

      {/* Pulled back out of the `Command` padding so the rule spans the panel. */}
      <div className="border-hairline -mx-1 mt-1 flex items-center justify-end border-t px-2 py-1.5">
        <Button variant="ghost" size="xs" onClick={() => onAction({ kind: "resetColumns" })}>
          Reset columns
        </Button>
      </div>
    </Command>
  )
}

function ColumnRow({
  label,
  checked,
  disabled = false,
  onSelect,
  move,
}: {
  label: string
  checked: boolean
  disabled?: boolean
  onSelect: () => void
  move: React.ReactNode
}) {
  return (
    <CommandItem
      value={label}
      onSelect={onSelect}
      aria-disabled={disabled || undefined}
      // As in Add filter and the value lists: this draws its own tick box.
      className="gap-2 [&>svg:last-child]:hidden"
    >
      {move}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {/* Drawn, not clickable: a column has nothing to pick on its own, so the
          whole row is the one target and the box reports what it did. */}
      <TickBox checked={checked} disabled={disabled} />
    </CommandItem>
  )
}

/** One half of the reorder control. Its click is its own, not the row's. */
function MoveButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string
  disabled: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation()
        onClick()
      }}
      className="text-muted-foreground hover:text-foreground -my-px disabled:opacity-25"
    >
      {children}
    </button>
  )
}
