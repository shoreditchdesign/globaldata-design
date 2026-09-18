"use client"

import * as React from "react"
import {
  ArrowDownIcon,
  ArrowDownAZIcon,
  ArrowUpIcon,
  ArrowUpAZIcon,
  Columns3Icon,
  DownloadIcon,
  EllipsisVerticalIcon,
  EyeOffIcon,
  MoveHorizontalIcon,
  PinIcon,
  PinOffIcon,
  type LucideIcon,
} from "lucide-react"

import { StageBadge } from "@/components/prototype/StageBadge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ColumnManager } from "@/flows/sprint-4/idea-1/components/ColumnManager"
import type { DrugRow } from "@/flows/sprint-4/idea-1/results"
import {
  columnByKey,
  columnTrack,
  hiddenColumnKeys,
  laneWidth,
  sortRows,
  visibleColumnKeys,
  type ColumnDef,
  type GridAction,
  type GridState,
} from "@/flows/sprint-4/idea-1/grid"
import { cn } from "@/lib/utils"

/** Frozen lanes: the select lane and anything pinned, with their left offsets. */
interface Frozen {
  left: Record<string, number>
  last: string | null
}

function frozenLanes(state: GridState, keys: string[]): Frozen {
  const left: Record<string, number> = {}
  let offset = 0
  let last: string | null = null
  for (const key of keys) {
    if (key !== "select" && !state.pinned.includes(key)) continue
    left[key] = offset
    offset += laneWidth(state, key)
    last = key
  }
  return { left, last }
}

/**
 * Class and style for a cell in a frozen lane. It needs a fill of its own, or
 * the lanes scrolling underneath would show through.
 */
function frozen(key: string, lanes: Frozen, fill: string) {
  if (!(key in lanes.left)) return { className: undefined, style: undefined }
  return {
    className: cn("sticky z-[1]", fill, key === lanes.last && "border-edge border-r"),
    style: { left: lanes.left[key] },
  }
}

/** Static data, so an export is a real file rather than a button that lies. */
function exportCsv(state: GridState, rows: DrugRow[]) {
  const keys = visibleColumnKeys(state).filter((key) => key !== "select")
  const cell = (value: string) => `"${value.replace(/"/g, '""')}"`
  const header = keys.map((key) => cell(columnByKey[key].label)).join(",")
  const body = rows.map((row) =>
    keys.map((key) => cell(columnByKey[key].values(row).join("; "))).join(","),
  )
  const blob = new Blob([[header, ...body].join("\n")], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = "globaldata-drugs.csv"
  link.click()
  URL.revokeObjectURL(url)
}

function MenuAction({
  icon: Icon,
  children,
  onSelect,
}: {
  icon: LucideIcon
  children: React.ReactNode
  onSelect: () => void
}) {
  return (
    <DropdownMenuItem onSelect={onSelect}>
      <Icon />
      {children}
    </DropdownMenuItem>
  )
}

function HeaderCell({
  column,
  state,
  lanes,
  onAction,
}: {
  column: ColumnDef
  state: GridState
  lanes: Frozen
  onAction: (action: GridAction) => void
}) {
  const sorted = state.sort?.columnKey === column.key ? state.sort.direction : null
  const pinned = state.pinned.includes(column.key)
  const locked = column.key === "name"
  const lane = frozen(column.key, lanes, "bg-surface-panel z-[2]")
  const cellRef = React.useRef<HTMLDivElement>(null)

  // Drag the right edge to resize, as in AG Grid. Double-click returns the lane
  // to its natural width.
  const startResize = (event: React.PointerEvent<HTMLSpanElement>) => {
    event.preventDefault()
    event.stopPropagation()
    const startX = event.clientX
    const startWidth = cellRef.current?.getBoundingClientRect().width ?? column.minPx
    const handle = event.currentTarget
    handle.setPointerCapture(event.pointerId)
    const move = (next: PointerEvent) =>
      onAction({ kind: "resize", columnKey: column.key, width: startWidth + next.clientX - startX })
    const stop = () => {
      handle.removeEventListener("pointermove", move)
      handle.removeEventListener("pointerup", stop)
      handle.removeEventListener("pointercancel", stop)
    }
    handle.addEventListener("pointermove", move)
    handle.addEventListener("pointerup", stop)
    handle.addEventListener("pointercancel", stop)
  }

  return (
    <div
      ref={cellRef}
      className={cn(
        "group/header border-hairline relative flex min-w-0 items-center border-r",
        lane.className,
      )}
      style={lane.style}
    >
      <button
        type="button"
        onClick={() => onAction({ kind: "cycleSort", columnKey: column.key })}
        aria-label={`Sort by ${column.label}`}
        className={cn(
          "hover:bg-accent flex h-full min-w-0 flex-1 items-center gap-1.5 pl-3 text-left text-[10px] font-medium tracking-[0.08em] whitespace-nowrap uppercase transition-colors",
          sorted ? "text-foreground" : "text-muted-foreground",
        )}
      >
        <span className="truncate">{column.label}</span>
        {sorted === "asc" ? <ArrowUpIcon className="size-3 shrink-0" aria-label="Sorted ascending" /> : null}
        {sorted === "desc" ? <ArrowDownIcon className="size-3 shrink-0" aria-label="Sorted descending" /> : null}
        {pinned && !locked ? <PinIcon className="size-3 shrink-0" aria-label="Pinned" /> : null}
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={`${column.label} column menu`}
          className="text-muted-foreground hover:bg-accent hover:text-foreground data-[state=open]:bg-accent data-[state=open]:text-foreground mr-1.5 flex size-6 shrink-0 items-center justify-center rounded-md opacity-0 transition-[opacity,color,background-color] group-hover/header:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100"
        >
          <EllipsisVerticalIcon className="size-3.5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-52">
          <MenuAction
            icon={ArrowDownAZIcon}
            onSelect={() =>
              onAction({
                kind: "setSort",
                sort: sorted === "asc" ? null : { columnKey: column.key, direction: "asc" },
              })
            }
          >
            {sorted === "asc" ? "Clear sort" : "Sort ascending"}
          </MenuAction>
          <MenuAction
            icon={ArrowUpAZIcon}
            onSelect={() =>
              onAction({
                kind: "setSort",
                sort: sorted === "desc" ? null : { columnKey: column.key, direction: "desc" },
              })
            }
          >
            {sorted === "desc" ? "Clear sort" : "Sort descending"}
          </MenuAction>
          <DropdownMenuSeparator />
          <MenuAction
            icon={pinned ? PinOffIcon : PinIcon}
            onSelect={() => onAction({ kind: "togglePin", columnKey: column.key })}
          >
            {pinned ? "Unpin column" : "Pin to left"}
          </MenuAction>
          <MenuAction
            icon={MoveHorizontalIcon}
            onSelect={() => onAction({ kind: "autosize", columnKey: column.key })}
          >
            Reset width
          </MenuAction>
          {locked ? null : (
            <MenuAction
              icon={EyeOffIcon}
              onSelect={() => onAction({ kind: "removeColumn", columnKey: column.key })}
            >
              Hide column
            </MenuAction>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <span
        role="separator"
        aria-orientation="vertical"
        aria-label={`Resize ${column.label}`}
        onPointerDown={startResize}
        onDoubleClick={() => onAction({ kind: "autosize", columnKey: column.key })}
        className="hover:bg-ring/60 absolute inset-y-0 -right-[3px] z-[3] w-1.5 cursor-col-resize transition-colors"
      />
    </div>
  )
}

function Tags({ values, muted }: { values: string[]; muted?: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-1 overflow-hidden">
      {values.map((value) => (
        <span
          key={value}
          title={value}
          className={cn(
            "bg-muted min-w-0 shrink-0 truncate rounded-md px-1.5 text-xs leading-5",
            muted ? "text-muted-foreground" : "text-foreground",
          )}
        >
          {value}
        </span>
      ))}
    </div>
  )
}

function Cell({ column, row }: { column: ColumnDef; row: DrugRow }) {
  const [value] = column.values(row)
  switch (column.kind) {
    case "primary":
      return (
        <span title={value} className="block truncate font-medium">
          {value}
        </span>
      )
    case "badge":
      return <StageBadge stage={value} />
    case "tags":
      return <Tags values={column.values(row)} muted={column.muted} />
    default:
      return (
        <span
          title={value}
          className={cn("block truncate", column.muted ? "text-muted-foreground" : "text-foreground")}
        >
          {value}
        </span>
      )
  }
}

/**
 * The results, as an AG Grid-style table: a frozen header, click-to-sort
 * headers with a column menu, draggable column edges, pinned lanes that stay
 * put while the rest scroll sideways, row selection and a status bar. Type
 * follows the shared grid scale — 13px cells, 10px uppercase headers, 12px tags.
 */
export function ResultsGrid({
  rows,
  resultCount,
  state,
  onAction,
}: {
  /** Rows the filters keep, before sorting — at most the first 100. */
  rows: DrugRow[]
  /** Every drug the filters match, of which `rows` are the first. */
  resultCount: number
  state: GridState
  onAction: (action: GridAction) => void
}) {
  const keys = visibleColumnKeys(state)
  const lanes = frozenLanes(state, keys)
  const template = keys.map((key) => columnTrack(state, key)).join(" ")
  const minWidth = keys.reduce((total, key) => total + laneWidth(state, key), 0)
  const sorted = sortRows(rows, state.sort)

  const rowIds = rows.map((row) => row.id)
  const selected = state.selected.filter((id) => rowIds.includes(id))
  const allSelected = rows.length > 0 && selected.length === rows.length
  const someSelected = selected.length > 0 && !allSelected
  const shownColumns = keys.length - 1
  const totalColumns = shownColumns + hiddenColumnKeys(state).length

  return (
    <div className="bg-surface-panel flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="border-edge flex h-11 shrink-0 items-center gap-3 border-b px-3">
        <p className="text-[13px] tabular-nums" aria-live="polite">
          <span className="font-medium">{resultCount.toLocaleString("en-GB")}</span>{" "}
          <span className="text-muted-foreground">{resultCount === 1 ? "drug" : "drugs"}</span>
        </p>
        {selected.length > 0 ? (
          <>
            <span className="bg-hairline h-4 w-px" aria-hidden />
            <span className="text-[13px] tabular-nums">
              <span className="font-medium">{selected.length}</span>{" "}
              <span className="text-muted-foreground">selected</span>
            </span>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => onAction({ kind: "setSelection", ids: [] })}
            >
              Clear
            </Button>
          </>
        ) : null}

        <div className="ml-auto flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Columns3Icon className="text-muted-foreground" />
                Columns
                <span className="tabular-nums">
                  {shownColumns}
                  <span className="text-muted-foreground font-normal">/{totalColumns}</span>
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[300px] gap-0 p-0">
              <ColumnManager state={state} onAction={onAction} />
            </PopoverContent>
          </Popover>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              exportCsv(
                state,
                selected.length > 0 ? sorted.filter((row) => selected.includes(row.id)) : sorted,
              )
            }
          >
            <DownloadIcon className="text-muted-foreground" />
            {selected.length > 0 ? "Export selected" : "Export"}
          </Button>
        </div>
      </div>

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
                      disabled={rows.length === 0}
                      onCheckedChange={() =>
                        onAction({ kind: "setSelection", ids: allSelected ? [] : rowIds })
                      }
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
                  lanes={lanes}
                  onAction={onAction}
                />
              )
            })}
          </div>

          {rows.length === 0 ? (
            <p className="text-muted-foreground sticky left-0 w-fit px-4 py-10 text-[13px]">
              No drug matches these filters.
            </p>
          ) : null}

          {sorted.map((row) => {
            const isSelected = selected.includes(row.id)
            const fill = isSelected ? "bg-brand-tint" : "bg-surface-panel group-hover/row:bg-accent"
            return (
              <div
                key={row.id}
                aria-selected={isSelected}
                className={cn(
                  "group/row border-hairline grid border-b transition-colors",
                  isSelected ? "bg-brand-tint" : "hover:bg-accent",
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
                        lane.className,
                      )}
                      style={lane.style}
                    >
                      {key === "select" ? (
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => onAction({ kind: "toggleRow", id: row.id })}
                          aria-label={`Select ${row.name}`}
                        />
                      ) : (
                        <div className="min-w-0 flex-1">
                          <Cell column={columnByKey[key]} row={row} />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>

      <div className="bg-surface-chrome border-edge flex h-9 shrink-0 items-center gap-4 border-t px-3 text-xs tabular-nums">
        <span>
          <span className="text-muted-foreground">Rows </span>
          <span className="font-medium">{rows.length}</span>
        </span>
        <span>
          <span className="text-muted-foreground">Selected </span>
          <span className="font-medium">{selected.length}</span>
        </span>
        <span className="text-muted-foreground ml-auto">
          {resultCount > rows.length
            ? `Illustrative data · first ${rows.length} of ${resultCount.toLocaleString("en-GB")}`
            : "Illustrative data"}
        </span>
      </div>
    </div>
  )
}
