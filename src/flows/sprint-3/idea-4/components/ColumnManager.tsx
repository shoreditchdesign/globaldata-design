"use client"

import { useState } from "react"
import { ChevronDownIcon, ChevronUpIcon, PlusIcon, SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { columnByKey, unpopulatedAttributes } from "@/flows/sprint-3/idea-4/data"
import {
  hiddenColumnKeys,
  type GridAction,
  type GridState,
} from "@/flows/sprint-3/idea-4/grid-state"

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-muted-foreground px-3 pt-2.5 pb-1 text-sm font-medium">{children}</p>
}

/**
 * Column management, which the live product does not have: eight locked
 * columns and twenty-eight more you cannot reach. Here every column can be
 * hidden or moved, and the change lands in the grid immediately. Pinning lives
 * in the column's own header menu.
 *
 * Reordering is two buttons rather than a drag handle. A handle that does not
 * drag is a worse lie than a pair of chevrons that plainly work, and in a
 * fourteen-item list the chevrons are also fewer interactions.
 */
export function ColumnManager({
  state,
  onAction,
}: {
  state: GridState
  onAction: (action: GridAction) => void
}) {
  const [query, setQuery] = useState("")
  const matches = (label: string) =>
    !query || label.toLowerCase().includes(query.toLowerCase())

  const shown = state.order.filter((key) => key !== "select")
  const hidden = hiddenColumnKeys(state)
  const shownVisible = shown.filter((key) => matches(columnByKey[key].label))
  const hiddenVisible = hidden.filter((key) => matches(columnByKey[key].label))
  const unpopulatedVisible = unpopulatedAttributes.filter(matches)
  const total = shown.length + hidden.length + unpopulatedAttributes.length

  return (
    <div className="flex flex-col">
      <div className="p-1.5">
        <div className="border-border focus-within:border-ring focus-within:ring-ring/40 flex h-8 items-center gap-2 rounded-md border px-2 transition-shadow focus-within:ring-3">
          <SearchIcon className="text-muted-foreground size-4 shrink-0" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Find a column"
            className="w-full bg-transparent text-base outline-none"
          />
        </div>
      </div>

      <Separator />

      <div className="max-h-[400px] overflow-y-auto pb-1.5">
        <SectionLabel>In the grid — {shown.length}</SectionLabel>
        <div className="px-1.5">
          {shownVisible.map((key) => {
            const column = columnByKey[key]
            const index = state.order.indexOf(key)
            const locked = key === "drugName"
            return (
              <div
                key={key}
                className="hover:bg-accent flex h-8 items-center gap-2 rounded-md px-1 text-sm transition-colors"
              >
                <span className="flex shrink-0 flex-col leading-none">
                  <button
                    type="button"
                    aria-label={`Move ${column.label} up`}
                    disabled={index <= 1 || Boolean(query)}
                    onClick={() => onAction({ kind: "moveColumn", columnKey: key, by: -1 })}
                    className="text-muted-foreground/70 hover:text-foreground -mb-px disabled:opacity-25"
                  >
                    <ChevronUpIcon className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Move ${column.label} down`}
                    disabled={index >= state.order.length - 1 || Boolean(query)}
                    onClick={() => onAction({ kind: "moveColumn", columnKey: key, by: 1 })}
                    className="text-muted-foreground/70 hover:text-foreground -mt-px disabled:opacity-25"
                  >
                    <ChevronDownIcon className="size-3.5" />
                  </button>
                </span>
                <Checkbox
                  checked
                  disabled={locked}
                  aria-label={`Hide ${column.label}`}
                  onCheckedChange={() => onAction({ kind: "removeColumn", columnKey: key })}
                />
                <span className="min-w-0 flex-1 truncate">{column.label}</span>
              </div>
            )
          })}
        </div>

        <SectionLabel>Available — {hidden.length}</SectionLabel>
        <div className="px-1.5">
          {hiddenVisible.map((key) => {
            const column = columnByKey[key]
            return (
              <div
                key={key}
                className="hover:bg-accent group/row flex h-8 items-center gap-2 rounded-md px-1 text-sm transition-colors"
              >
                <span className="w-3.5 shrink-0" />
                <Checkbox
                  checked={false}
                  aria-label={`Add ${column.label}`}
                  onCheckedChange={() => onAction({ kind: "addColumn", columnKey: key })}
                />
                <span className="min-w-0 flex-1 truncate">{column.label}</span>
                <PlusIcon className="text-muted-foreground size-4 shrink-0 opacity-0 group-hover/row:opacity-100" />
              </div>
            )
          })}
          {hiddenVisible.length === 0 ? (
            <p className="text-muted-foreground px-2 py-1 text-sm">
              {query ? "Nothing here matches." : "Every available column is in the grid."}
            </p>
          ) : null}
        </div>

        <SectionLabel>No data in this sample — {unpopulatedAttributes.length}</SectionLabel>
        <div className="px-1.5">
          {unpopulatedVisible.map((label) => (
            <div
              key={label}
              className="text-muted-foreground/60 flex h-8 items-center gap-2 rounded-md px-1 text-sm"
            >
              <span className="w-3.5 shrink-0" />
              <Checkbox checked={false} disabled />
              <span className="min-w-0 flex-1 truncate">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <p className="text-muted-foreground text-sm tabular-nums">
          {shown.length} of {total} columns shown
        </p>
        <Button
          variant="ghost"
          size="xs"
          className="text-sm"
          onClick={() => onAction({ kind: "resetColumns" })}
        >
          Reset
        </Button>
      </div>
    </div>
  )
}
