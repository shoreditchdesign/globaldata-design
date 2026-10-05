"use client"

import * as React from "react"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  sortableKeyboardCoordinates,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVerticalIcon } from "lucide-react"

import { motion, usePrefersReducedMotion } from "@/components/prototype/motion"
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
import { cn } from "@/lib/utils"
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
 * can be shown, hidden or moved, and the grid changes as you do it. A shown
 * column is moved by its grip: dragged, it lifts off the list on the raised
 * surface while the others make way, and settles where it is dropped. The
 * grip also takes the keyboard — Space to pick up, the arrows to move, Space
 * to drop, Escape to put it back — through dnd-kit's keyboard sensor.
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

  const sensors = useSensors(
    // A few pixels of travel before a drag starts, so a click on the grip is
    // still a click.
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    onAction({ kind: "reorderColumn", columnKey: String(active.id), overKey: String(over.id) })
  }

  return (
    <Command>
      <div className="text-muted-foreground flex items-center px-3 py-2 text-[10px] font-medium tracking-[0.08em] uppercase">
        Columns
      </div>

      <CommandInput value={query} onValueChange={setQuery} placeholder="Search Columns" />

      <CommandList className="max-h-[400px]">
        <CommandEmpty>No matches</CommandEmpty>

        <CommandGroup heading={`In the grid · ${shown.length}`} className={GROUP_CLASS}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
            accessibility={{ screenReaderInstructions: { draggable: dragInstructions } }}
          >
            <SortableContext items={shown} strategy={verticalListSortingStrategy}>
              {shown.map((key) => {
                const column = columnByKey[key]
                // The row's name is what the grid is keyed on and cannot be
                // taken out, so its box is drawn ticked and does nothing.
                const fixed = key === "name"
                return (
                  <SortableColumnRow
                    key={key}
                    id={key}
                    label={column.label}
                    // Moving while the list is filtered would move a column
                    // past one that is not on screen.
                    dragDisabled={Boolean(query)}
                    disabled={fixed}
                    onSelect={() => {
                      if (!fixed) onAction({ kind: "removeColumn", columnKey: key })
                    }}
                  />
                )
              })}
            </SortableContext>
          </DndContext>
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
                // The lane the shown rows keep for their grip, so both groups'
                // labels start on the same line.
                move={<span className="w-4 shrink-0" />}
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

const dragInstructions =
  "To move a column, press Space on its grip, use the arrow keys to move it, then Space to drop it or Escape to cancel."

/**
 * A shown column's row, sortable by its grip. While dragged it lifts onto the
 * raised surface with its shadow; the rows around it ease aside on
 * `motion.settle`, and under reduced motion they jump instead.
 */
function SortableColumnRow({
  id,
  label,
  disabled,
  dragDisabled,
  onSelect,
}: {
  id: string
  label: string
  disabled: boolean
  dragDisabled: boolean
  onSelect: () => void
}) {
  const reducedMotion = usePrefersReducedMotion()
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({
      id,
      disabled: dragDisabled,
      transition: reducedMotion
        ? null
        : { duration: motion.settle, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
    })

  return (
    <div
      ref={setNodeRef}
      style={{
        // Held to the list's own axis: the row moves up and down, not out.
        transform: CSS.Translate.toString(transform ? { ...transform, x: 0 } : null),
        transition: reducedMotion ? undefined : transition,
      }}
      className={cn(
        "relative rounded-sm",
        isDragging && "bg-surface-raised shadow-raised z-10",
      )}
    >
      <ColumnRow
        label={label}
        checked
        disabled={disabled}
        onSelect={onSelect}
        move={
          <button
            type="button"
            ref={setActivatorNodeRef}
            aria-label={`Move ${label}`}
            disabled={dragDisabled}
            {...attributes}
            {...listeners}
            // The row selects on click; the grip is its own target.
            onClick={(event) => event.stopPropagation()}
            // Its keys belong to the drag, not to the list's highlight. They
            // are marked handled rather than stopped: cmdk skips a handled
            // key, and dnd-kit still hears it on the document.
            onKeyDown={(event) => {
              listeners?.onKeyDown?.(event)
              if (isDragging || event.key === " " || event.key === "Enter") {
                event.preventDefault()
              }
            }}
            className={cn(
              "text-muted-foreground hover:text-foreground -my-1 flex w-4 shrink-0 touch-none items-center justify-center rounded-sm py-1 disabled:opacity-25",
              dragDisabled ? "cursor-not-allowed" : isDragging ? "cursor-grabbing" : "cursor-grab",
            )}
          >
            <GripVerticalIcon className="size-3.5" />
          </button>
        }
      />
    </div>
  )
}
