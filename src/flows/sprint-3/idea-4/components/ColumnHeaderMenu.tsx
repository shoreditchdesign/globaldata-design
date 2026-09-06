"use client"

import { useMemo, useState } from "react"
import {
  ArrowDownAZIcon,
  ArrowUpAZIcon,
  LayersIcon,
  PinIcon,
  PinOffIcon,
  SearchIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { columnValues, rows, scopeFor, type ColumnDef } from "@/flows/sprint-3/idea-4/data"
import type { GridAction, GridState } from "@/flows/sprint-3/idea-4/grid-state"

function MenuAction({
  icon: Icon,
  label,
  active,
  disabled,
  hint,
  onClick,
}: {
  icon: typeof PinIcon
  label: string
  active?: boolean
  disabled?: boolean
  hint?: string
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={hint}
      className={cn(
        "flex h-7 w-full items-center gap-2 rounded-md px-2 text-left text-[12.5px] transition-colors",
        disabled
          ? "text-muted-foreground/50 cursor-not-allowed"
          : "hover:bg-muted cursor-default",
        active && "bg-muted font-medium",
      )}
    >
      <Icon className={cn("size-3.5", disabled ? "opacity-50" : "text-muted-foreground")} />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {disabled && hint ? (
        <span className="text-muted-foreground/60 shrink-0 text-[10px]">{hint}</span>
      ) : null}
    </button>
  )
}

/**
 * The filter surface, such as it is: one menu per column header, opened from
 * the grid. Sort and group sit at the top because the users are
 * Excel-habituated and expect them there.
 *
 * Every value carries its count inside the current scope — that is, with every
 * other column's filter applied but not this one's — so the number says what
 * you would get if you ticked one more box, not what you already ticked.
 * Ticking changes the grid behind the menu immediately; there is no Apply.
 */
export function ColumnHeaderMenu({
  column,
  state,
  matchCount,
  onAction,
  onClose,
}: {
  column: ColumnDef
  state: GridState
  matchCount: number
  onAction: (action: GridAction) => void
  onClose: () => void
}) {
  const [query, setQuery] = useState("")

  const values = useMemo(
    () => columnValues(rows, state.filters, column.key),
    [state.filters, column.key],
  )
  // Rows this column's menu is counting against: everything the other columns
  // still allow. Ticking a box here moves `matchCount`, never `scopeCount`.
  const scopeCount = useMemo(
    () => scopeFor(rows, state.filters, column.key).length,
    [state.filters, column.key],
  )

  const selected = values.filter((value) => value.checked)
  const visible = query
    ? values.filter((value) => value.label.toLowerCase().includes(query.toLowerCase()))
    : values

  const sorted = state.sort?.columnKey === column.key ? state.sort.direction : undefined
  const grouped = state.group === column.key
  const pinned = state.pinned.includes(column.key)

  return (
    <div className="flex flex-col">
      <div className="flex items-baseline justify-between px-3 pt-2.5 pb-2">
        <span className="text-[12.5px] font-medium">{column.label}</span>
        <span className="text-muted-foreground text-[11px] tabular-nums">
          {column.filterable ? `${values.length} values` : "no value list"}
        </span>
      </div>

      <div className="px-1.5 pb-1.5">
        <MenuAction
          icon={ArrowDownAZIcon}
          label="Sort ascending"
          active={sorted === "asc"}
          onClick={() => {
            onAction({
              kind: "setSort",
              sort: sorted === "asc" ? null : { columnKey: column.key, direction: "asc" },
            })
            onClose()
          }}
        />
        <MenuAction
          icon={ArrowUpAZIcon}
          label="Sort descending"
          active={sorted === "desc"}
          onClick={() => {
            onAction({
              kind: "setSort",
              sort: sorted === "desc" ? null : { columnKey: column.key, direction: "desc" },
            })
            onClose()
          }}
        />
        <MenuAction
          icon={LayersIcon}
          label={grouped ? "Ungroup rows" : "Group rows by this column"}
          active={grouped}
          disabled={!column.groupable}
          hint={column.groupable ? undefined : "multi-valued"}
          onClick={() => {
            onAction({ kind: "setGroup", columnKey: grouped ? null : column.key })
            onClose()
          }}
        />
        <MenuAction
          icon={pinned ? PinOffIcon : PinIcon}
          label={pinned ? "Unpin column" : "Pin column left"}
          active={pinned}
          onClick={() => {
            onAction({ kind: "togglePin", columnKey: column.key })
            onClose()
          }}
        />
      </div>

      {column.filterable ? (
        <>
          <Separator />

          <div className="p-1.5">
            <div className="border-input focus-within:border-ring flex h-7 items-center gap-2 rounded-md border px-2">
              <SearchIcon className="text-muted-foreground size-3.5 shrink-0" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="placeholder:text-muted-foreground w-full bg-transparent text-[12.5px] outline-none"
                placeholder={`Search ${values.length} values`}
              />
            </div>
          </div>

          <div className="flex items-center justify-between px-3 pb-1.5">
            <span className="text-muted-foreground text-[11px] tabular-nums">
              {selected.length} of {values.length} selected
            </span>
            <button
              type="button"
              disabled={selected.length === 0}
              onClick={() => onAction({ kind: "clearColumnFilter", columnKey: column.key })}
              className="text-muted-foreground hover:text-foreground text-[11px] underline-offset-2 hover:underline disabled:opacity-40 disabled:hover:no-underline"
            >
              Clear
            </button>
          </div>

          <div className="max-h-[264px] overflow-y-auto px-1.5 pb-1.5">
            {visible.length === 0 ? (
              <p className="text-muted-foreground px-2 py-3 text-[12px]">
                No value matches “{query}”.
              </p>
            ) : null}
            {visible.map((value) => (
              <label
                key={value.label}
                className={cn(
                  "hover:bg-muted flex h-7 cursor-default items-center gap-2 rounded-md px-2 text-[12.5px] transition-colors",
                  value.checked && "bg-muted/60",
                )}
              >
                <Checkbox
                  checked={value.checked}
                  onCheckedChange={() =>
                    onAction({ kind: "toggleValue", columnKey: column.key, value: value.label })
                  }
                  className="size-3.5"
                />
                <span className={cn("min-w-0 flex-1 truncate", value.checked && "font-medium")}>
                  {value.label}
                </span>
                <span
                  className={cn(
                    "text-[11px] tabular-nums",
                    value.count === 0 ? "text-muted-foreground/50" : "text-muted-foreground",
                  )}
                >
                  {value.count.toLocaleString()}
                </span>
              </label>
            ))}
          </div>
        </>
      ) : (
        <>
          <Separator />
          <p className="text-muted-foreground px-3 py-2.5 text-[11.5px] leading-[1.45]">
            {column.kind === "number"
              ? "A numeric lane. Sort it, or filter on a column that holds categories."
              : "Every drug carries its own value here, so a value list would be one line per row. Sort or pin instead."}
          </p>
        </>
      )}

      <Separator />

      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <p className="text-muted-foreground text-[11px] tabular-nums">
          <span className="text-foreground font-medium">{matchCount}</span> of {scopeCount} in scope
        </p>
        <Button
          variant="ghost"
          size="xs"
          disabled={selected.length === 0 && !sorted && !pinned && !grouped}
          onClick={() => {
            onAction({ kind: "clearColumnFilter", columnKey: column.key })
            if (sorted) onAction({ kind: "setSort", sort: null })
            if (grouped) onAction({ kind: "setGroup", columnKey: null })
            if (pinned && column.key !== "drugName") {
              onAction({ kind: "togglePin", columnKey: column.key })
            }
          }}
        >
          Reset column
        </Button>
      </div>
    </div>
  )
}
