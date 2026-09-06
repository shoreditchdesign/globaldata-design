"use client"

import { useState } from "react"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  FunnelIcon,
  PinIcon,
} from "lucide-react"

import { StageBadge } from "@/components/prototype/StageBadge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { ColumnHeaderMenu } from "@/flows/sprint-3/idea-4/components/ColumnHeaderMenu"
import { ValuePills } from "@/flows/sprint-3/idea-4/components/ValuePills"
import {
  aggregateLabels,
  aggregateValue,
  columnByKey,
  type ColumnDef,
  type DrugRecord,
  type RowGroup,
} from "@/flows/sprint-3/idea-4/data"
import {
  visibleColumnKeys,
  type GridAction,
  type GridState,
} from "@/flows/sprint-3/idea-4/grid-state"

function HeaderCell({
  column,
  state,
  matchCount,
  open,
  onOpenChange,
  onAction,
}: {
  column: ColumnDef
  state: GridState
  matchCount: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onAction: (action: GridAction) => void
}) {
  const filtered = state.filters[column.key]?.length ?? 0
  const sorted = state.sort?.columnKey === column.key ? state.sort.direction : null
  const pinned = state.pinned.includes(column.key)

  // The state icons float inside the label rather than sitting beside it, so a
  // long column name wraps around them and still gets the full second line.
  const trigger = (
    <button
      type="button"
      className={cn(
        "hover:bg-muted group flex h-full w-full items-center px-2.5 py-2 text-left transition-colors",
        open && "bg-muted",
      )}
    >
      <span className="text-muted-foreground block w-full text-[10px] leading-[1.3] font-medium tracking-[0.07em] uppercase">
        <span className="float-right ml-1 flex items-center gap-1 pt-px">
          {pinned ? <PinIcon className="fill-muted-foreground text-muted-foreground size-3" /> : null}
          {sorted === "asc" ? <ArrowDownIcon className="text-foreground size-3" /> : null}
          {sorted === "desc" ? <ArrowUpIcon className="text-foreground size-3" /> : null}
          {filtered ? <FunnelIcon className="fill-foreground text-foreground size-2.5" /> : null}
          <ChevronDownIcon
            className={cn(
              "size-3 transition-opacity",
              open ? "opacity-100" : "opacity-30 group-hover:opacity-100",
            )}
          />
        </span>
        {column.label}
      </span>
    </button>
  )

  return (
    <div className={cn("border-border/60 border-r last:border-r-0", pinned && "border-border")}>
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>
        <PopoverContent align="start" sideOffset={1} className="w-[272px] gap-0 p-0">
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
  pinned,
  expanded,
  selected,
  onExpand,
  onSelect,
}: {
  column: ColumnDef
  row: DrugRecord
  /** Pinned lanes keep a divider so the frozen block reads as a block. */
  pinned: boolean
  expanded: boolean
  selected: boolean
  onExpand: () => void
  onSelect: () => void
}) {
  const base = cn("min-w-0 px-2.5 py-2", pinned && "border-border/60 border-r")

  switch (column.kind) {
    case "select":
      return (
        <div className={cn(base, "flex items-start gap-1 px-1.5")}>
          <Checkbox
            checked={selected}
            onCheckedChange={onSelect}
            aria-label={`Select ${row.name}`}
            className="mt-0.5 size-3.5"
          />
          <button
            type="button"
            onClick={onExpand}
            aria-label={expanded ? "Collapse record" : "Expand record"}
            className="text-muted-foreground hover:text-foreground -mt-0.5 flex size-4 items-center justify-center transition-colors"
          >
            {expanded ? (
              <ChevronDownIcon className="size-3.5" />
            ) : (
              <ChevronRightIcon className="size-3.5" />
            )}
          </button>
        </div>
      )
    case "primary":
      return (
        <div className={base}>
          <span className="block text-[12.5px] leading-[16px] font-medium">{row.name}</span>
        </div>
      )
    case "badge":
      return (
        <div className={base}>
          <StageBadge stage={row.stage} className="h-[18px] px-1.5" />
        </div>
      )
    case "number":
      return (
        <div className={cn(base, "text-right")}>
          <span className="block text-[12.5px] leading-[16px] tabular-nums">
            {row.npv > 0 ? row.npv.toLocaleString() : <span className="text-muted-foreground">—</span>}
          </span>
        </div>
      )
    case "pills":
      return (
        <div className={base}>
          <ValuePills
            values={column.values(row)}
            limit={column.pillLimit ?? 2}
            expanded={expanded}
            onExpand={onExpand}
            muted={column.muted}
          />
        </div>
      )
    case "text":
    default: {
      const value = column.key === "brand" ? row.brand : column.values(row)[0]
      return (
        <div className={base}>
          <span
            className={cn(
              "block text-[12.5px] leading-[16px]",
              column.key === "brand" ? "" : "text-muted-foreground",
            )}
          >
            {value ?? <span className="text-muted-foreground">—</span>}
          </span>
        </div>
      )
    }
  }
}

/**
 * The expanded record. Rather than growing a 132px lane to nine lines, the
 * detail opens as a band across the full width of the row — the reason one drug
 * never takes more than a few lines however many values it carries.
 */
function ExpandedDetail({ row, keys }: { row: DrugRecord; keys: string[] }) {
  const groups = keys
    .map((key) => columnByKey[key])
    .filter((column) => column && column.kind === "pills")
    .map((column) => ({ label: column.label, values: column.values(row) }))
    .filter((group) => group.values.length > 1)

  if (groups.length === 0) {
    return (
      <div className="border-border/60 text-muted-foreground border-t py-2.5 pr-2.5 pl-12 text-[11.5px]">
        One value in every lane — this record is already shown in full.
      </div>
    )
  }

  return (
    <div className="border-border/60 border-t py-2.5 pr-2.5 pl-12">
      <div className="flex flex-col gap-2">
        {groups.map((group) => (
          <div key={group.label} className="flex gap-3">
            <span className="text-muted-foreground w-[142px] shrink-0 pt-1 text-[10px] leading-[1.25] font-medium tracking-[0.07em] uppercase">
              {group.label} <span className="tabular-nums">{group.values.length}</span>
            </span>
            <div className="flex min-w-0 flex-wrap items-center gap-1">
              {group.values.map((value) => (
                <span
                  key={value}
                  className="bg-background border-border/70 rounded-md border px-1.5 py-0.5 text-[11px] leading-[16px]"
                >
                  {value}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * One reusable grid, not a bespoke table. Fixed lanes so every row lines up,
 * multi-valued lanes taking the slack, and the ten default lanes summing to
 * 866px of minimum width — so the grid compresses beside the agent panel
 * rather than running off the side of the screen, which is what the live
 * results view does at 1600px.
 */
export function ResultsGrid({
  state,
  groups,
  matchCount,
  visibleRows,
  openColumn,
  onOpenColumnChange,
  expandedRows,
  onToggleRow,
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
  expandedRows: string[]
  onToggleRow: (id: string) => void
  selectedRows: string[]
  onToggleSelect: (id: string) => void
  onToggleSelectAll: () => void
  onAction: (action: GridAction) => void
}) {
  const [collapsed, setCollapsed] = useState<string[]>([])
  const keys = visibleColumnKeys(state)
  const template = keys.map((key) => columnByKey[key].width).join(" ")
  const allSelected = visibleRows.length > 0 && selectedRows.length === visibleRows.length

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-auto">
        <div
          className="bg-background sticky top-0 z-10 grid border-b"
          style={{ gridTemplateColumns: template }}
        >
          <div className="border-border/60 border-r px-1.5 py-2">
            <Checkbox
              checked={allSelected}
              onCheckedChange={onToggleSelectAll}
              aria-label="Select all rows"
              className="size-3.5"
            />
          </div>
          {keys.slice(1).map((key) => (
            <HeaderCell
              key={key}
              column={columnByKey[key]}
              state={state}
              matchCount={matchCount}
              open={openColumn === key}
              onOpenChange={(open) => onOpenColumnChange(open ? key : null)}
              onAction={onAction}
            />
          ))}
        </div>

        {matchCount === 0 ? (
          <div className="flex flex-col items-start gap-2 px-4 py-10">
            <p className="text-[13px] font-medium">No drug in this sample matches all of it.</p>
            <p className="text-muted-foreground max-w-[52ch] text-[12px] leading-[1.5]">
              Values inside one column are joined with “or”, and the columns are joined with “and”,
              so every filter you add can only take rows away. Drop one of the pills above, or clear
              them all and start again.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-1"
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
                  className="bg-muted/60 hover:bg-muted border-border/60 sticky top-[33px] z-[5] flex w-full items-center gap-2 border-b px-2.5 py-1.5 text-left"
                >
                  {isCollapsed ? (
                    <ChevronRightIcon className="text-muted-foreground size-3.5" />
                  ) : (
                    <ChevronDownIcon className="text-muted-foreground size-3.5" />
                  )}
                  <span className="text-[12px] font-medium">{group.label}</span>
                  <span className="text-muted-foreground text-[11px] tabular-nums">
                    {group.rows.length}
                  </span>
                </button>
              ) : null}

              {isCollapsed
                ? null
                : group.rows.map((row) => {
                    const expanded = expandedRows.includes(row.id)
                    return (
                      <div
                        key={row.id}
                        className={cn("border-border/60 border-b", expanded && "bg-muted/30")}
                      >
                        <div
                          className="hover:bg-muted/40 grid transition-colors"
                          style={{ gridTemplateColumns: template }}
                        >
                          {keys.map((key) => (
                            <Cell
                              key={key}
                              column={columnByKey[key]}
                              row={row}
                              pinned={state.pinned.includes(key)}
                              expanded={expanded}
                              selected={selectedRows.includes(row.id)}
                              onExpand={() => onToggleRow(row.id)}
                              onSelect={() => onToggleSelect(row.id)}
                            />
                          ))}
                        </div>
                        {expanded ? <ExpandedDetail row={row} keys={keys} /> : null}
                      </div>
                    )
                  })}
            </div>
          )
        })}
      </div>

      <div className="flex h-9 shrink-0 items-center gap-4 overflow-x-auto border-t px-4">
        <span className="text-muted-foreground shrink-0 text-[11px] tabular-nums">
          {matchCount === 0 ? "0 drugs" : `1–${matchCount} of ${matchCount} drugs`}
        </span>
        {selectedRows.length > 0 ? (
          <>
            <Separator orientation="vertical" className="h-3.5" />
            <span className="text-[11px] tabular-nums">
              <span className="font-medium">{selectedRows.length}</span>
              <span className="text-muted-foreground"> selected</span>
            </span>
          </>
        ) : null}
        <Separator orientation="vertical" className="h-3.5" />
        {state.aggregates.map((key) => (
          <span key={key} className="shrink-0 text-[11px] whitespace-nowrap">
            <span className="text-muted-foreground">{aggregateLabels[key]} </span>
            <span className="font-medium tabular-nums">{aggregateValue(key, visibleRows)}</span>
          </span>
        ))}
        {state.aggregates.length === 0 ? (
          <span className="text-muted-foreground text-[11px]">No aggregates</span>
        ) : null}
      </div>
    </div>
  )
}
