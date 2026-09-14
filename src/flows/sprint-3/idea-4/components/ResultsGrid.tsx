"use client"

import { useState } from "react"
import { ArrowDownIcon, ArrowUpIcon, ChevronDownIcon, ChevronRightIcon } from "lucide-react"

import { StageBadge } from "@/components/prototype/StageBadge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { ColumnHeaderMenu } from "@/flows/sprint-3/idea-4/components/ColumnHeaderMenu"
import { ValuePills } from "@/flows/sprint-3/idea-4/components/ValuePills"
import {
  aggregateColumn,
  aggregateLabels,
  aggregateValue,
  columnByKey,
  columnTrack,
  rows,
  type ColumnDef,
  type DrugRecord,
  type RowGroup,
} from "@/flows/sprint-3/idea-4/data"
import {
  visibleColumnKeys,
  type GridAction,
  type GridState,
} from "@/flows/sprint-3/idea-4/grid-state"

/** Frozen lanes: the select lane and anything pinned, with their left offsets. */
interface Frozen {
  left: Record<string, number>
  last: string | null
}

function frozenLanes(keys: string[], pinned: string[]): Frozen {
  const left: Record<string, number> = {}
  let offset = 0
  let last: string | null = null
  for (const key of keys) {
    if (key !== "select" && !pinned.includes(key)) continue
    left[key] = offset
    offset += columnByKey[key].minPx
    last = key
  }
  return { left, last }
}

/**
 * Class and style for a cell in a frozen lane. It needs a fill of its own, or
 * the lanes scrolling underneath would show through, so the row's hover and
 * checked fills are repeated on it.
 */
function frozen(key: string, lanes: Frozen, fill: string) {
  if (!(key in lanes.left)) return { className: undefined, style: undefined }
  return {
    className: cn("sticky z-[1]", fill, key === lanes.last && "border-edge border-r"),
    style: { left: lanes.left[key] },
  }
}

function HeaderCell({
  column,
  state,
  matchCount,
  open,
  lanes,
  onOpenChange,
  onAction,
}: {
  column: ColumnDef
  state: GridState
  matchCount: number
  open: boolean
  lanes: Frozen
  onOpenChange: (open: boolean) => void
  onAction: (action: GridAction) => void
}) {
  const filtered = state.filters[column.key]?.length ?? 0
  const sorted = state.sort?.columnKey === column.key ? state.sort.direction : null
  const active = filtered > 0 || sorted !== null
  const lane = frozen(column.key, lanes, "bg-surface-panel z-[2]")

  return (
    <div className={cn("border-hairline border-r last:border-r-0", lane.className)} style={lane.style}>
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "group flex h-full w-full items-center gap-1.5 px-3 text-left text-[10px] font-medium tracking-[0.08em] whitespace-nowrap uppercase transition-colors",
              open ? "bg-muted" : "hover:bg-accent",
              active || open ? "text-foreground" : "text-muted-foreground",
            )}
          >
            <span>{column.label}</span>
            {sorted === "asc" ? <ArrowDownIcon className="size-3 shrink-0" aria-label="Sorted ascending" /> : null}
            {sorted === "desc" ? <ArrowUpIcon className="size-3 shrink-0" aria-label="Sorted descending" /> : null}
            {filtered ? (
              <Badge
                variant="secondary"
                className="h-5 rounded-md px-1.5 text-xs tabular-nums"
                aria-label={`${filtered} values filtered`}
              >
                {filtered}
              </Badge>
            ) : null}
            <ChevronDownIcon
              className={cn(
                "text-muted-foreground ml-auto size-3 shrink-0 transition-opacity",
                open ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100",
              )}
            />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" sideOffset={1} className="w-[288px] gap-0 p-0">
          <ColumnHeaderMenu
            column={column}
            state={state}
            matchCount={matchCount}
            onAction={onAction}
            onClose={() => onOpenChange(false)}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

function Cell({
  column,
  row,
  selected,
  onSelect,
}: {
  column: ColumnDef
  row: DrugRecord
  selected: boolean
  onSelect: () => void
}) {
  switch (column.kind) {
    case "select":
      return (
        <div className="flex h-full items-center justify-center">
          <Checkbox checked={selected} onCheckedChange={onSelect} aria-label={`Select ${row.name}`} />
        </div>
      )
    case "primary":
      return (
        <span title={row.name} className="block truncate font-medium">
          {row.name}
        </span>
      )
    case "badge":
      return <StageBadge stage={row.stage} />
    case "number":
      return (
        <span className="block text-right tabular-nums">
          {row.npv > 0 ? row.npv.toLocaleString() : <span className="text-muted-foreground">—</span>}
        </span>
      )
    case "pills":
      return (
        <ValuePills
          label={column.label}
          values={column.values(row)}
          limit={column.pillLimit ?? 2}
          muted={column.muted}
        />
      )
    case "text":
    default: {
      const value = column.key === "brand" ? row.brand : column.values(row)[0]
      return value ? (
        <span
          title={value}
          className={cn(
            "block truncate",
            column.muted ? "text-muted-foreground" : "text-foreground",
          )}
        >
          {value}
        </span>
      ) : (
        <span className="text-muted-foreground block">—</span>
      )
    }
  }
}

/**
 * One reusable grid, not a bespoke table. Every lane has a minimum wide enough
 * for its header on one line and a 13px value; spare width is shared out by
 * `grow`. Past the sum of the minimums the grid scrolls sideways, with the
 * select lane and any pinned lane frozen on the left and the header frozen on
 * top. Legibility beats fitting.
 *
 * Type is Idea 3's table verbatim — 13px cells, 10px uppercase headers, 12px
 * tags — so the two directions read as one product rather than two prototypes.
 * The body sets 13px once and the cells inherit it; only the header row, the
 * summary row and the count rail name a size of their own.
 */
export function ResultsGrid({
  state,
  groups,
  matchCount,
  visibleRows,
  openColumn,
  onOpenColumnChange,
  selectedRows,
  onToggleSelect,
  onToggleSelectAll,
  onAction,
}: {
  state: GridState
  groups: RowGroup[]
  matchCount: number
  visibleRows: DrugRecord[]
  openColumn: string | null
  onOpenColumnChange: (key: string | null) => void
  selectedRows: string[]
  onToggleSelect: (id: string) => void
  onToggleSelectAll: () => void
  onAction: (action: GridAction) => void
}) {
  const [collapsed, setCollapsed] = useState<string[]>([])
  const keys = visibleColumnKeys(state)
  const lanes = frozenLanes(keys, state.pinned)
  const template = keys
    .map((key) => columnTrack(columnByKey[key], key in lanes.left))
    .join(" ")
  const minWidth = keys.reduce((total, key) => total + columnByKey[key].minPx, 0)
  const allSelected = visibleRows.length > 0 && selectedRows.length === visibleRows.length
  const someSelected = selectedRows.length > 0 && !allSelected

  const summary = state.aggregates.length > 0 && matchCount > 0

  return (
    <div className="bg-surface-panel flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-auto">
        <div className="relative w-full text-[13px]" style={{ minWidth }}>
          <div
            className="bg-surface-panel border-edge sticky top-0 z-20 grid h-10 border-b"
            style={{ gridTemplateColumns: template }}
          >
            {keys.map((key) => {
              if (key === "select") {
                const lane = frozen(key, lanes, "bg-surface-panel z-[2]")
                return (
                  <div
                    key={key}
                    className={cn("flex items-center justify-center", lane.className)}
                    style={lane.style}
                  >
                    <Checkbox
                      checked={allSelected ? true : someSelected ? "indeterminate" : false}
                      onCheckedChange={onToggleSelectAll}
                      aria-label="Select all rows"
                    />
                  </div>
                )
              }
              return (
                <HeaderCell
                  key={key}
                  column={columnByKey[key]}
                  state={state}
                  matchCount={matchCount}
                  open={openColumn === key}
                  lanes={lanes}
                  onOpenChange={(open) => onOpenColumnChange(open ? key : null)}
                  onAction={onAction}
                />
              )
            })}
          </div>

          {matchCount === 0 ? (
            <div className="sticky left-0 flex w-fit flex-col items-start gap-3 px-4 py-10">
              <p className="text-base font-medium">No drug in this sample matches all of it.</p>
              <Button
                variant="outline"
                size="sm"
                className="text-sm"
                onClick={() => onAction({ kind: "clearFilters" })}
              >
                Clear all filters
              </Button>
            </div>
          ) : null}

          {groups.map((group) => {
            const isCollapsed = collapsed.includes(group.key)
            return (
              <div key={group.key}>
                {state.group ? (
                  <button
                    type="button"
                    onClick={() =>
                      setCollapsed((current) =>
                        current.includes(group.key)
                          ? current.filter((key) => key !== group.key)
                          : [...current, group.key],
                      )
                    }
                    className="bg-surface-sunken hover:bg-accent border-hairline sticky top-10 z-10 flex h-9 w-full items-center border-b text-left transition-colors"
                  >
                    <span className="sticky left-0 flex items-center gap-2 px-3">
                      {isCollapsed ? (
                        <ChevronRightIcon className="text-muted-foreground size-4" />
                      ) : (
                        <ChevronDownIcon className="text-muted-foreground size-4" />
                      )}
                      <span className="font-medium">{group.label}</span>
                      <span className="text-muted-foreground tabular-nums">
                        {group.rows.length}
                      </span>
                    </span>
                  </button>
                ) : null}

                {isCollapsed
                  ? null
                  : group.rows.map((row) => {
                      const selected = selectedRows.includes(row.id)
                      const fill = selected
                        ? "bg-accent"
                        : "bg-surface-panel group-hover/row:bg-accent"
                      return (
                        <div
                          key={row.id}
                          className={cn(
                            "group/row border-hairline grid border-b transition-colors",
                            selected ? "bg-accent" : "hover:bg-accent",
                          )}
                          style={{ gridTemplateColumns: template }}
                        >
                          {keys.map((key) => {
                            const lane = frozen(key, lanes, fill)
                            return (
                              <div
                                key={key}
                                className={cn(
                                  "flex h-10 min-w-0 items-center transition-colors",
                                  key === "select" ? "justify-center" : "px-3",
                                  columnByKey[key].kind === "number" && "justify-end",
                                  lane.className,
                                )}
                                style={lane.style}
                              >
                                <div className="min-w-0 flex-1">
                                  <Cell
                                    column={columnByKey[key]}
                                    row={row}
                                    selected={selected}
                                    onSelect={() => onToggleSelect(row.id)}
                                  />
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )
                    })}
              </div>
            )
          })}

          {summary ? (
            <div
              className="bg-surface-chrome border-edge sticky bottom-0 z-20 grid border-t"
              style={{ gridTemplateColumns: template }}
            >
              {keys.map((key) => {
                const figures = state.aggregates.filter((aggregate) => aggregateColumn[aggregate] === key)
                const lane = frozen(key, lanes, "bg-surface-chrome z-[2]")
                return (
                  <div
                    key={key}
                    className={cn(
                      "flex min-h-10 min-w-0 flex-col justify-center gap-0.5 px-3 py-1.5 text-xs",
                      columnByKey[key].kind === "number" && "items-end",
                      lane.className,
                    )}
                    style={lane.style}
                  >
                    {figures.map((aggregate) => (
                      <span key={aggregate} className="truncate whitespace-nowrap">
                        <span className="text-muted-foreground">{aggregateLabels[aggregate]} </span>
                        <span className="font-medium tabular-nums">
                          {aggregateValue(aggregate, visibleRows)}
                        </span>
                      </span>
                    ))}
                    {key === "drugName" && figures.length === 0 ? (
                      <span className="text-muted-foreground">Summary</span>
                    ) : null}
                  </div>
                )
              })}
            </div>
          ) : null}
        </div>
      </div>

      <div className="bg-surface-chrome border-edge flex h-10 shrink-0 items-center justify-end gap-1.5 border-t px-4">
        <span className="text-xs font-medium tabular-nums">{matchCount}</span>
        <span className="text-muted-foreground text-xs tabular-nums">
          {matchCount === 1 ? "drug matches" : "drugs match"} · of {rows.length} in sample
        </span>
      </div>
    </div>
  )
}
