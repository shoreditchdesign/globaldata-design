"use client"

import * as React from "react"
import {
  ArrowDownAZIcon,
  ArrowUpAZIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  Columns3Icon,
  DownloadIcon,
  EllipsisVerticalIcon,
  EyeOffIcon,
  FilterIcon,
  FilterXIcon,
  SearchXIcon,
  MoveHorizontalIcon,
  PinIcon,
  PinOffIcon,
  type LucideIcon,
} from "lucide-react"

import type { ProductArea } from "@/components/prototype/ProductChrome"
import { motion } from "@/components/prototype/motion"
import { StageBadge } from "@/components/prototype/StageBadge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Loader } from "@/flows/sprint-4/idea-1c/components/Loader"
import { PanelToggle } from "@/flows/sprint-4/idea-1c/components/PanelToggle"
import { SelectBox } from "@/flows/sprint-4/idea-1c/components/SelectBox"
import { ColumnManager } from "@/flows/sprint-4/idea-1c/components/ColumnManager"
import {
  criterionPhrase,
  definitionFor,
  filterIdFor,
  lastApplied,
  type FilterId,
  type ResolvedFilter,
} from "@/flows/sprint-4/idea-1c/data"
import { RESULT_PAGE_SIZE, type DrugRow } from "@/flows/sprint-4/idea-1c/results"
import {
  columnByKey,
  columnFilterPath,
  columnTrack,
  laneWidth,
  sortRows,
  visibleColumnKeys,
  type ColumnDef,
  type GridAction,
  type GridState,
} from "@/flows/sprint-4/idea-1c/grid"
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
  const blob = new Blob([[header, ...body].join("\n")], {
    type: "text/csv;charset=utf-8",
  })
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
    // The label reads at the grid's own 13px, in the grid's own ink: this menu
    // opens over the rows and belongs to them. The mark beside it stays a step
    // back, because a column of black icons competed with the table underneath.
    <DropdownMenuItem onSelect={onSelect} className="text-[13px]">
      <Icon className="text-muted-foreground size-3" />
      {children}
    </DropdownMenuItem>
  )
}

/** The sort mark: a chevron up over a chevron down, stroke only. */
function SortMark({ sorted }: { sorted: "asc" | "desc" | null }) {
  const chevron = "-my-[2px] size-2.5 shrink-0 transition-opacity"
  return (
    <span
      className="flex shrink-0 flex-col items-center"
      role={sorted ? "img" : undefined}
      aria-label={
        sorted === "asc" ? "Sorted ascending" : sorted === "desc" ? "Sorted descending" : undefined
      }
      aria-hidden={sorted ? undefined : true}
    >
      <ChevronUpIcon strokeWidth={2.5} className={cn(chevron, sorted === "desc" && "opacity-35")} />
      <ChevronDownIcon
        strokeWidth={2.5}
        className={cn(chevron, sorted === "asc" && "opacity-35")}
      />
    </span>
  )
}

function HeaderCell({
  column,
  state,
  lanes,
  filters,
  onAction,
  onEditFilter,
  onClearFilter,
}: {
  column: ColumnDef
  state: GridState
  lanes: Frozen
  filters: ResolvedFilter[]
  onAction: (action: GridAction) => void
  onEditFilter: (area: ProductArea, attribute: string, values: string[]) => void
  onClearFilter: (id: FilterId) => void
}) {
  const sorted = state.sort?.columnKey === column.key ? state.sort.direction : null
  const pinned = state.pinned.includes(column.key)
  const locked = column.key === "name"
  const lane = frozen(column.key, lanes, "bg-surface-panel z-[2]")
  const cellRef = React.useRef<HTMLDivElement>(null)

  // The clause this column's lane is filtered by, if the taxonomy has an
  // attribute for it and the box is holding one.
  const path = columnFilterPath[column.key]
  const definition = path ? definitionFor(filterIdFor(path.area, path.attribute)) : null
  const clause = definition ? filters.find((filter) => filter.id === definition.id) : undefined
  const applied = clause?.values.length ?? 0

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
      onAction({
        kind: "resize",
        columnKey: column.key,
        width: startWidth + next.clientX - startX,
      })
    const stop = () => {
      handle.removeEventListener("pointermove", move)
      handle.removeEventListener("pointerup", stop)
      handle.removeEventListener("pointercancel", stop)
    }
    handle.addEventListener("pointermove", move)
    handle.addEventListener("pointerup", stop)
    handle.addEventListener("pointercancel", stop)
  }

  const cell = (
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
        {/* Every sortable head shows that it sorts, at rest: two outline
            chevrons in the header's own grey. Once sorted, the direction's
            chevron takes full ink and the other dims. A click cycles
            ascending, descending, then back to unsorted. */}
        <SortMark sorted={sorted} />
        {pinned && !locked ? <PinIcon className="size-3 shrink-0" aria-label="Pinned" /> : null}
        {applied > 0 ? (
          // How many values this lane is filtered by. A tint, not the accent
          // itself: it marks a column, it is not the thing being pressed.
          <span
            aria-label={`${applied} ${applied === 1 ? "filter" : "filters"} applied`}
            className="bg-brand-tint text-brand-ink ml-0.5 flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full px-1 tracking-normal tabular-nums"
          >
            {applied}
          </span>
        ) : null}
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
          {path ? (
            <>
              <DropdownMenuSeparator />
              {/* Opens the search panel's columns at this column's attribute,
                  its values ticked, rather than a list of its own: one place
                  to build a filter by hand. */}
              <MenuAction
                icon={FilterIcon}
                onSelect={() => onEditFilter(path.area, path.attribute, clause?.values ?? [])}
              >
                {applied > 0 ? "Edit filters" : "Add filter"}
              </MenuAction>
              {applied > 0 && clause ? (
                // The clause goes, not its values one by one: there is nothing
                // left of a filter whose last value has been unticked anyway.
                <MenuAction icon={FilterXIcon} onSelect={() => onClearFilter(clause.id)}>
                  Clear filters
                </MenuAction>
              ) : null}
            </>
          ) : null}
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

  return cell
}

/**
 * What the table says when the criteria are too narrow for the sample.
 *
 * It is a reading of the query, not an apology for the data: the drugs are
 * there, the criteria have ruled them all out, and the line says which criteria
 * and out of how many. The way back is the thing the reader most likely wants —
 * the criterion they added last — with clearing everything beside it rather
 * than instead of it, because a query five criteria deep took minutes to build
 * and one bad value should not cost the other four.
 *
 * Everything that would let them fix it by hand stays where it was: the filter
 * bar, the chips, the search field and the column heads are all outside this
 * and none of them are disabled.
 */
function NoMatches({
  filters,
  onRemoveCriterion,
  onClearFilters,
}: {
  filters: ResolvedFilter[]
  onRemoveCriterion: (id: FilterId) => void
  onClearFilters: () => void
}) {
  // Clauses still waiting for a value rule nothing out, so they are not part of
  // what the reader is being told narrowed the results to nothing.
  const applied = filters.filter((filter) => filter.values.length > 0)
  const last = lastApplied(filters)

  // No criteria and no rows is a different thing — an empty sample, or a read
  // that placed nothing — and this is not the message for it.
  if (applied.length === 0) {
    return (
      <p className="text-muted-foreground sticky left-0 flex w-full flex-1 items-center justify-center px-6 py-16 text-center text-[13px]">
        No drug matches these filters.
      </p>
    )
  }

  return (
    <div className="sticky left-0 flex w-full flex-1 flex-col items-center justify-center gap-5 px-6 py-20 text-center">
      {/* The mark, the line, the reading, the way out — the order an empty
          state is read in. Quiet enough not to be taken for an error: nothing
          has gone wrong, the criteria are narrower than the data. */}
      <SearchXIcon className="text-muted-foreground size-10" aria-hidden />

      <div className="flex flex-col gap-1.5">
        <h3 aria-live="polite" className="text-foreground text-base font-semibold">
          No drugs match these criteria
        </h3>
        <p
          aria-live="polite"
          className="text-muted-foreground mx-auto max-w-md text-[13px] leading-5"
        >
          {/* Named in the order the buttons below offer them, and only where
              both are offered: with one criterion applied there is nothing to
              step back through. */}
          {applied.length > 1 && last
            ? "Try clearing all filters, or removing the last criterion."
            : "Try clearing all filters."}
        </p>
      </div>

      {/* Stacked, primary first, at one shared width. With one criterion applied
          the two buttons would do the same thing, so only the one that says what
          it does is offered. */}
      <div className="flex flex-col items-stretch gap-2">
        <Button size="sm" onClick={onClearFilters}>
          Clear all filters
        </Button>
        {applied.length > 1 && last ? (
          <Button variant="secondary" size="sm" onClick={() => onRemoveCriterion(last.id)}>
            Remove last criterion: {criterionPhrase(last)}
          </Button>
        ) : null}
      </div>
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
          className={cn(
            "block truncate",
            column.muted ? "text-muted-foreground" : "text-foreground",
          )}
        >
          {value}
        </span>
      )
  }
}

/** The closed panel's rail: room for Show filters and a little air. */
const RAIL_WIDTH = "44px"

/**
 * The results, as an AG Grid-style table: a frozen header, click-to-sort
 * headers with a column menu, draggable column edges, pinned lanes that stay
 * put while the rest scroll sideways, row selection and a status bar. Type
 * follows the shared grid scale — 13px cells, 10px uppercase headers, 12px tags.
 *
 * The search panel is a sibling of the table: the two sit side by side, the
 * table's own toolbar (count, Columns, Export) runs over the table alone so
 * the count sits over the drug names. The footer belongs to the table's column
 * too. Closed, the panel folds down to a rail that holds Show filters.
 */
export function ResultsGrid({
  rows,
  resultCount,
  drugCount,
  state,
  filters,
  onAction,
  onEditFilter,
  onClearFilter,
  onClearFilters,
  loading,
  aside,
  asideOpen,
  asideWidth,
  onToggleAside,
}: {
  /** Every row the filters keep, before sorting. The grid draws a page of them. */
  rows: DrugRow[]
  /** Every row the filters match — the length of `rows`. */
  resultCount: number
  /** The distinct drugs among those rows: the header counts drugs, the footer rows. */
  drugCount: number
  state: GridState
  /** Read by the column headers: which lanes are filtered, and by how much. */
  filters: ResolvedFilter[]
  onAction: (action: GridAction) => void
  /** A column's Edit filters: the search panel's columns at its attribute. */
  onEditFilter: (area: ProductArea, attribute: string, values: string[]) => void
  /** Takes one column's clause out of the box entirely. */
  onClearFilter: (id: FilterId) => void
  onClearFilters: () => void
  /** A search or a filter change is being shown as work in progress. */
  loading: boolean
  /** The chat section, beside the table. */
  aside: React.ReactNode
  asideOpen: boolean
  /** Its width when open, as CSS — it changes with the mode the section is in. */
  asideWidth: string
  onToggleAside: () => void
}) {
  const asideId = React.useId()
  const keys = visibleColumnKeys(state)
  const lanes = frozenLanes(state, keys)
  const template = keys.map((key) => columnTrack(state, key)).join(" ")
  const minWidth = keys.reduce((total, key) => total + laneWidth(state, key), 0)
  // The whole filtered set is sorted, then paged, so a sort reorders every
  // match rather than the hundred on screen.
  const sorted = React.useMemo(() => sortRows(rows, state.sort), [rows, state.sort])

  // The page belongs to one set of rows and one sort: a change to either puts
  // the reader back on the first page. Held beside what it was set against, so
  // the reset is a comparison at render rather than an effect a frame late.
  const [paging, setPaging] = React.useState({
    rows,
    sort: state.sort,
    page: 0,
  })
  const pageCount = Math.max(1, Math.ceil(sorted.length / RESULT_PAGE_SIZE))
  const page =
    paging.rows === rows && paging.sort === state.sort ? Math.min(paging.page, pageCount - 1) : 0
  const pageStart = page * RESULT_PAGE_SIZE
  const pageRows = sorted.slice(pageStart, pageStart + RESULT_PAGE_SIZE)
  const scrollerRef = React.useRef<HTMLDivElement>(null)
  const goToPage = (next: number) => {
    setPaging({ rows, sort: state.sort, page: next })
    scrollerRef.current?.scrollTo({ top: 0 })
  }

  // Selection survives paging: it is kept against every filtered row, so the
  // count and Export see ticks made on other pages. Select all ticks or clears
  // the current page's rows only — the ones the reader can see.
  const rowIds = React.useMemo(() => new Set(rows.map((row) => row.id)), [rows])
  const selected = state.selected.filter((id) => rowIds.has(id))
  const pageIds = pageRows.map((row) => row.id)
  const pageSelected = pageIds.filter((id) => selected.includes(id))
  const allSelected = pageIds.length > 0 && pageSelected.length === pageIds.length
  const someSelected = pageSelected.length > 0 && !allSelected

  return (
    <div className="bg-surface-panel flex min-h-0 flex-1 overflow-hidden">
      {/* The width eases between the open panel and the closed rail; what is
            inside holds its own width, so the section slides away rather than
            squeezing its pills into a column on the way. */}
      <div
        className="ease-settle relative shrink-0 overflow-hidden transition-[width] motion-reduce:transition-none"
        style={{
          width: asideOpen ? asideWidth : RAIL_WIDTH,
          transitionDuration: `${motion.reflow}ms`,
        }}
      >
        {/* Painted at its mode's width straight away, so Quick and Advanced
              never visibly grow and nothing inside rewraps on the way; only
              the wrapper's edge eases, which is what moves the table. */}
        <div id={asideId} inert={!asideOpen} className="h-full" style={{ width: asideWidth }}>
          {aside}
        </div>
        {/* Closed, the panel leaves a rail holding Show filters, on the
              header bar's centre line. It fades over the panel as it folds. */}
        <div
          inert={asideOpen}
          aria-hidden={asideOpen}
          className={cn(
            "bg-surface-chrome border-edge ease-settle absolute inset-y-0 left-0 flex flex-col items-center border-r transition-opacity motion-reduce:transition-none",
            asideOpen ? "pointer-events-none opacity-0" : "opacity-100",
          )}
          style={{ width: RAIL_WIDTH, transitionDuration: `${motion.quick}ms` }}
        >
          <div className="flex h-11 shrink-0 items-center justify-center">
            <PanelToggle open={false} onToggle={onToggleAside} controls={asideId} />
          </div>
        </div>
      </div>

      {/* The table's own column: its toolbar, then the grid. The toolbar
            belongs to the table rather than spanning the panel too, so the
            count sits over the drug names it counts. */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="bg-surface-panel border-edge flex h-11 shrink-0 items-center gap-3 border-b pr-3">
          {/* The select lane's width, so the count after it starts on the
                Drug name column's text edge whether the panel is open or not. */}
          <span
            className="-mr-3 shrink-0"
            style={{ width: laneWidth(state, "select") }}
            aria-hidden
          />
          <p className="pl-3 text-base tabular-nums" aria-live="polite">
            <span className="font-medium">{drugCount.toLocaleString("en-GB")}</span>{" "}
            <span className="text-muted-foreground">{drugCount === 1 ? "drug" : "drugs"}</span>
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
                  Edit columns
                </Button>
              </PopoverTrigger>
              {/* The same box Add filter and the value lists open in. */}
              <PopoverContent align="end" className="w-72 gap-0 p-0">
                <ColumnManager state={state} onAction={onAction} />
              </PopoverContent>
            </Popover>
            {/* Always the primary action of this bar. */}
            <Button
              variant="default"
              size="sm"
              onClick={() =>
                exportCsv(
                  state,
                  selected.length > 0 ? sorted.filter((row) => selected.includes(row.id)) : sorted,
                )
              }
            >
              <DownloadIcon />
              {selected.length > 0 ? "Export selected" : "Export"}
            </Button>
          </div>
        </div>
        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
          {/* A scrim over the rows, opaque enough and blurred so the rows
                behind it read as a texture rather than as text, with the loader
                over the middle of what is on screen rather than the middle of
                the scrolled table. Always mounted so it can fade both ways;
                under reduced motion it simply appears and the loader holds
                still. The column head sits above it (z-40 to its z-30), so only
                the rows are covered and the columns stay readable. */}
          <div
            aria-hidden={!loading}
            className={cn(
              "bg-surface-panel/85 ease-settle pointer-events-none absolute inset-0 z-30 flex items-center justify-center backdrop-blur-sm transition-opacity motion-reduce:transition-none",
              loading ? "opacity-100" : "opacity-0",
            )}
            style={{ transitionDuration: `${motion.quick}ms` }}
          >
            {loading ? <Loader /> : null}
          </div>
          {/* With no rows it becomes a column, so the empty state below the head
                can take the rest of the height and centre in it. */}
          <div
            ref={scrollerRef}
            aria-busy={loading}
            className={cn(
              "min-h-0 min-w-0 flex-1 overflow-auto",
              rows.length === 0 && "flex flex-col",
            )}
          >
            <div className="relative w-full shrink-0 text-[13px]" style={{ minWidth }}>
              <div
                className="bg-surface-panel border-edge sticky top-0 z-40 grid h-10 border-b"
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
                        <SelectBox
                          checked={allSelected ? true : someSelected ? "indeterminate" : false}
                          disabled={rows.length === 0}
                          onCheckedChange={() =>
                            onAction({
                              kind: "setSelection",
                              ids: allSelected
                                ? selected.filter((id) => !pageIds.includes(id))
                                : [...new Set([...selected, ...pageIds])],
                            })
                          }
                          aria-label="Select all rows on this page"
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
                      filters={filters}
                      onAction={onAction}
                      onEditFilter={onEditFilter}
                      onClearFilter={onClearFilter}
                    />
                  )
                })}
              </div>

              {pageRows.map((row) => {
                const isSelected = selected.includes(row.id)
                const fill = isSelected
                  ? "bg-brand-tint"
                  : "bg-surface-panel group-hover/row:bg-accent"
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
                            <SelectBox
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

            {/* Outside the lane track, so it is as wide as the grid is on screen
                  rather than as wide as the columns add up to — which is what lets it
                  centre — and stuck to the left edge so it stays put if the reader
                  scrolls the empty table sideways. */}
            {rows.length === 0 ? (
              <NoMatches
                filters={filters}
                onRemoveCriterion={onClearFilter}
                onClearFilters={onClearFilters}
              />
            ) : null}
          </div>
        </div>

        <div className="bg-surface-chrome border-edge flex h-9 shrink-0 items-center justify-end gap-4 border-t px-3 text-xs tabular-nums">
          <span>
            <span className="text-muted-foreground">Selected </span>
            <span className="font-medium">{selected.length}</span>
          </span>
          {/* Where this page sits in the match. */}
          <span className="ml-4 flex items-center gap-1.5">
            <span aria-live="polite">
              {resultCount === 0 ? (
                <span className="text-muted-foreground">0 rows</span>
              ) : (
                <>
                  <span className="font-medium">
                    {(pageStart + 1).toLocaleString("en-GB")}–
                    {(pageStart + pageRows.length).toLocaleString("en-GB")}
                  </span>
                  <span className="text-muted-foreground">
                    {" "}
                    of {resultCount.toLocaleString("en-GB")}
                  </span>
                </>
              )}
            </span>
          </span>
          {pageCount > 1 ? (
            <span className="-mr-1.5 flex items-center gap-1.5">
              <span className="text-muted-foreground">
                Page {page + 1} of {pageCount}
              </span>
              <span className="flex items-center">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Previous page"
                  disabled={page === 0}
                  onClick={() => goToPage(page - 1)}
                >
                  <ChevronLeftIcon />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Next page"
                  disabled={page >= pageCount - 1}
                  onClick={() => goToPage(page + 1)}
                >
                  <ChevronRightIcon />
                </Button>
              </span>
            </span>
          ) : null}
        </div>
      </div>
    </div>
  )
}
