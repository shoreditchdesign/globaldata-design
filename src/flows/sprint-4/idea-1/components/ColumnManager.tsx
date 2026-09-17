"use client"

import * as React from "react"
import { ChevronDownIcon, ChevronUpIcon, SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import {
  columnByKey,
  hiddenColumnKeys,
  type GridAction,
  type GridState,
} from "@/flows/sprint-4/idea-1/grid"

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-muted-foreground px-3 pt-2.5 pb-1 text-xs font-medium">{children}</p>
}

/**
 * AG Grid's columns tool panel, after Sprint 3 Idea 4's manager: every column
 * can be shown, hidden or moved, and the grid changes as you do it. Reordering
 * is a pair of chevrons rather than a drag handle that does not drag.
 */
export function ColumnManager({
  state,
  onAction,
}: {
  state: GridState
  onAction: (action: GridAction) => void
}) {
  const [query, setQuery] = React.useState("")
  const matches = (key: string) =>
    !query || columnByKey[key].label.toLowerCase().includes(query.toLowerCase())

  const shown = state.order.filter((key) => key !== "select")
  const hidden = hiddenColumnKeys(state)

  return (
    <div className="flex flex-col">
      <div className="p-1.5">
        <div className="border-border focus-within:border-ring flex h-8 items-center gap-2 rounded-md border px-2 transition-colors">
          <SearchIcon className="text-muted-foreground size-4 shrink-0" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Find a column"
            className="w-full bg-transparent text-[13px] outline-none"
          />
        </div>
      </div>

      <Separator />

      <div className="max-h-[400px] overflow-y-auto pb-1.5">
        <SectionLabel>In the grid · {shown.length}</SectionLabel>
        <div className="px-1.5">
          {shown.filter(matches).map((key) => {
            const column = columnByKey[key]
            const index = state.order.indexOf(key)
            return (
              <div
                key={key}
                className="hover:bg-accent flex h-8 items-center gap-2 rounded-md px-1 text-[13px] transition-colors"
              >
                <span className="flex shrink-0 flex-col leading-none">
                  <button
                    type="button"
                    aria-label={`Move ${column.label} up`}
                    disabled={index <= 1 || Boolean(query)}
                    onClick={() => onAction({ kind: "moveColumn", columnKey: key, by: -1 })}
                    className="text-muted-foreground hover:text-foreground -mb-px disabled:opacity-25"
                  >
                    <ChevronUpIcon className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Move ${column.label} down`}
                    disabled={index >= state.order.length - 1 || Boolean(query)}
                    onClick={() => onAction({ kind: "moveColumn", columnKey: key, by: 1 })}
                    className="text-muted-foreground hover:text-foreground -mt-px disabled:opacity-25"
                  >
                    <ChevronDownIcon className="size-3.5" />
                  </button>
                </span>
                <Checkbox
                  checked
                  disabled={key === "name"}
                  aria-label={`Hide ${column.label}`}
                  onCheckedChange={() => onAction({ kind: "removeColumn", columnKey: key })}
                />
                <span className="min-w-0 flex-1 truncate">{column.label}</span>
              </div>
            )
          })}
        </div>

        <SectionLabel>Available · {hidden.length}</SectionLabel>
        <div className="px-1.5">
          {hidden.filter(matches).map((key) => (
            <div
              key={key}
              className="hover:bg-accent flex h-8 items-center gap-2 rounded-md px-1 text-[13px] transition-colors"
            >
              <span className="w-3.5 shrink-0" />
              <Checkbox
                checked={false}
                aria-label={`Show ${columnByKey[key].label}`}
                onCheckedChange={() => onAction({ kind: "addColumn", columnKey: key })}
              />
              <span className="min-w-0 flex-1 truncate">{columnByKey[key].label}</span>
            </div>
          ))}
          {hidden.filter(matches).length === 0 ? (
            <p className="text-muted-foreground px-2 py-1 text-[13px]">
              {query ? "No column matches." : "Every column is in the grid."}
            </p>
          ) : null}
        </div>
      </div>

      <Separator />

      <div className="flex items-center justify-end px-3 py-2">
        <Button variant="ghost" size="xs" onClick={() => onAction({ kind: "resetColumns" })}>
          Reset columns
        </Button>
      </div>
    </div>
  )
}
