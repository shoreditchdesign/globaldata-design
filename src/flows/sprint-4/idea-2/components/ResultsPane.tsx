"use client"

import * as React from "react"
import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { StageBadge } from "@/components/prototype/StageBadge"
import { Button } from "@/components/ui/button"
import { stageOrder, type DrugRow } from "@/flows/sprint-4/idea-2/data"
import { lockedColumn, resultColumns } from "@/flows/sprint-4/idea-2/columns"

type Sort = { key: string; dir: "asc" | "desc" }

/** Rows drawn at once. The count above says how many there are in all. */
const PAGE = 100

function compareRows(a: DrugRow, b: DrugRow, key: string) {
  if (key === "stage") {
    return (stageOrder.get(a.stage) ?? Infinity) - (stageOrder.get(b.stage) ?? Infinity)
  }
  const column = resultColumns.find((entry) => entry.key === key)
  return column ? column.value(a).localeCompare(column.value(b)) : 0
}

/**
 * Before anything is asked. The heads stay, so the grid is recognisably the
 * place results will land, and the body is one quiet line rather than all
 * 1,440 rows — a table of everything would look like an answer to a question
 * no one has put.
 */
function EmptyState() {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center px-8 py-10">
      <div className="text-center">
        <p className="text-[13px] font-medium">No results yet</p>
        <p className="text-muted-foreground mt-1 text-xs">Start filtering to see matching drugs.</p>
      </div>
    </div>
  )
}

/**
 * The results: an empty state until the query holds a condition, then the grid
 * at the sprint's scale — 13px cells, 10px headers, `py-2.5`.
 *
 * Full width in Sentence, the right-hand side of the split in Logic gate. Past
 * its minimum the grid scrolls sideways with the drug name pinned to the left,
 * rather than wrapping a header or clipping a column. Every header sorts; stage
 * sorts by pipeline position.
 *
 * The first and last columns and the toolbar pad by `--text-inset`, so the drug
 * names start on the same line as the sentence in the box above, and the grid
 * holds that inset inside its own half when the canvas is open.
 */
export function ResultsPane({
  rows,
  active,
  hidden,
  order,
  pinned,
  onOpenRecord,
  onSortChange,
  className,
}: {
  rows: DrugRow[]
  /** Whether the query holds anything yet. */
  active: boolean
  /** `Open` on a drug name: the whole record, in a drawer over a scrim. */
  onOpenRecord: (id: string) => void
  /** Columns the Columns menu has switched off. */
  hidden: string[]
  /** The order the Columns menu has them in. */
  order: string[]
  /** Columns held against the left edge while the grid scrolls sideways. */
  pinned: string[]
  /** Reported so the card's head can say what the rows are sorted by. */
  onSortChange?: (label: string | null) => void
  className?: string
}) {
  const [sort, setSort] = React.useState<Sort | null>(null)
  // Pinned columns lead, in the order they were pinned; the rest follow in the
  // order the Columns menu holds them.
  const columns = React.useMemo(() => {
    const shownColumns = order
      .map((key) => resultColumns.find((column) => column.key === key))
      .filter((column): column is (typeof resultColumns)[number] => Boolean(column))
      .filter((column) => !hidden.includes(column.key))
    const held = shownColumns.filter((column) => pinned.includes(column.key))
    return [...held, ...shownColumns.filter((column) => !pinned.includes(column.key))]
  }, [hidden, order, pinned])

  /*
    A pinned column sticks at the width of everything pinned before it, and the
    table lays itself out, so the offsets have to be measured rather than
    assumed. Read after layout and kept in state, so the lanes hold while the
    grid scrolls sideways.
  */
  const headRow = React.useRef<HTMLTableRowElement>(null)
  const [offsets, setOffsets] = React.useState<number[]>([])
  const pinnedCount = columns.filter((column) => pinned.includes(column.key)).length
  React.useLayoutEffect(() => {
    const cells = headRow.current?.children
    if (!cells) return
    const next: number[] = []
    let left = 0
    for (let i = 0; i < pinnedCount; i += 1) {
      next.push(left)
      left += (cells[i] as HTMLElement).getBoundingClientRect().width
    }
    setOffsets((current) =>
      current.length === next.length && current.every((value, i) => value === next[i]) ? current : next,
    )
  }, [columns, pinnedCount, rows])

  const lane = (i: number) =>
    i < pinnedCount
      ? { className: "sticky z-10", style: { left: offsets[i] ?? 0 } }
      : { className: undefined, style: undefined }

  React.useEffect(() => {
    const label = sort ? (resultColumns.find((column) => column.key === sort.key)?.label ?? null) : null
    onSortChange?.(label && `${label}, ${sort?.dir === "asc" ? "A–Z" : "Z–A"}`)
  }, [sort, onSortChange])

  const sorted = React.useMemo(() => {
    if (!sort) return rows
    const factor = sort.dir === "asc" ? 1 : -1
    return [...rows].sort((a, b) => factor * compareRows(a, b, sort.key))
  }, [rows, sort])

  const cycle = (key: string) =>
    setSort((current) =>
      current?.key !== key ? { key, dir: "asc" } : current.dir === "asc" ? { key, dir: "desc" } : null,
    )
  const shown = sorted.slice(0, PAGE)

  const head = (
    <thead className="sticky top-0 z-20">
      <tr className="bg-surface-panel" ref={headRow}>
        {columns.map((column, i) => {
          const isSorted = active && sort?.key === column.key
          const held = lane(i)
          return (
            <th
              key={column.key}
              aria-sort={isSorted ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}
              style={held.style}
              className={cn(
                "bg-surface-panel text-muted-foreground border-edge h-11 border-b px-3 text-left text-[10px] font-medium tracking-[0.08em] whitespace-nowrap uppercase",
                held.className,
                i === 0 && "pl-(--text-inset)",
                i === pinnedCount - 1 && "border-r",
                i === columns.length - 1 && "pr-(--text-inset)",
              )}
            >
              {active ? (
                <button
                  type="button"
                  onClick={() => cycle(column.key)}
                  className={cn(
                    "group/sort inline-flex cursor-pointer items-center gap-1 uppercase",
                    isSorted ? "text-foreground" : "hover:text-foreground",
                  )}
                >
                  {column.label}
                  {isSorted ? (
                    sort.dir === "asc" ? (
                      <ArrowUpIcon className="size-3" />
                    ) : (
                      <ArrowDownIcon className="size-3" />
                    )
                  ) : (
                    <ChevronsUpDownIcon className="size-3 opacity-0 group-hover/sort:opacity-100" />
                  )}
                </button>
              ) : (
                // Nothing to sort yet. The label keeps the arrow's width so the
                // heads do not shift when the first result lands.
                <span className="inline-flex items-center gap-1">
                  {column.label}
                  <span className="size-3" />
                </span>
              )}
            </th>
          )
        })}
      </tr>
    </thead>
  )

  if (!active) {
    return (
      <section className={cn("bg-surface-chrome flex min-h-0 min-w-0 flex-col", className)}>
        <div className="shrink-0 overflow-hidden">
          <table className="w-full border-collapse text-[13px]">{head}</table>
        </div>
        <EmptyState />
      </section>
    )
  }

  return (
    <section className={cn("bg-surface-panel flex min-h-0 min-w-0 flex-col", className)}>

      <div className="bg-surface-chrome min-h-0 flex-1 overflow-auto">
        <table className="w-full border-collapse text-[13px]">
          {head}
          <tbody>
            {shown.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-(--text-inset) py-10 text-center">
                  <p className="text-[13px] font-medium">No drugs match this query</p>
                </td>
              </tr>
            ) : (
              shown.map((row, i) => (
                <tr
                  key={row.id}
                  className={cn(
                    "group/row border-hairline hover:bg-accent border-b transition-colors last:border-0",
                    i % 2 === 1 ? "bg-surface-page" : "bg-surface-chrome",
                  )}
                >
                  {columns.map((column, c) =>
                    column.key === lockedColumn ? (
                      <td
                        key={column.key}
                        style={lane(c).style}
                        className={cn(
                          "border-hairline bg-inherit py-2.5 pr-3 font-medium whitespace-nowrap",
                          lane(c).className,
                          c === 0 && "pl-(--text-inset)",
                          c === pinnedCount - 1 && "border-r",
                          c > 0 && "pl-3",
                        )}
                      >
                        {/*
                          The name keeps the button's width permanently rather
                          than on hover: making room on hover reflowed the row
                          under the cursor and swallowed the click.
                        */}
                        <span className="block pr-16">{column.value(row)}</span>
                        {/*
                          The centring lives on this span, never on the button.
                          The button presses by a transform of its own, and a
                          transform replaces rather than adds to one already
                          there.
                        */}
                        <span className="absolute top-1/2 right-3 flex -translate-y-1/2 items-center">
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => onOpenRecord(row.id)}
                            className={cn(
                              "h-6 opacity-0 transition-opacity duration-100",
                              "pointer-events-none group-hover/row:pointer-events-auto group-hover/row:opacity-100",
                              "focus-visible:pointer-events-auto focus-visible:opacity-100",
                              "motion-reduce:transition-none",
                            )}
                          >
                            Open
                          </Button>
                        </span>
                      </td>
                    ) : column.key === "stage" ? (
                      <td
                        key={column.key}
                        style={lane(c).style}
                        className={cn(
                          "bg-inherit px-3 py-2.5",
                          lane(c).className,
                          c === pinnedCount - 1 && "border-hairline border-r",
                        )}
                      >
                        <StageBadge stage={row.stage} />
                      </td>
                    ) : (
                      <Cell
                        key={column.key}
                        style={lane(c).style}
                        className={cn(
                          lane(c).className,
                          c === pinnedCount - 1 && "border-hairline border-r",
                          c === columns.length - 1 && "pr-(--text-inset)",
                        )}
                      >
                        {column.value(row)}
                      </Cell>
                    ),
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function Cell({
  children,
  className,
  style,
}: {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <td
      style={style}
      className={cn(
        "text-muted-foreground bg-inherit px-3 py-2.5 whitespace-nowrap",
        className,
      )}
    >
      {children}
    </td>
  )
}
