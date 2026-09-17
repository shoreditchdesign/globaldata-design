"use client"

import * as React from "react"
import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { StageBadge } from "@/components/prototype/StageBadge"
import { stageOrder, type DrugRow } from "@/flows/sprint-4/idea-2/data"

const columns = [
  { key: "name", label: "Drug Name" },
  { key: "company", label: "Company" },
  { key: "indication", label: "Indication" },
  { key: "stage", label: "Development Stage" },
  { key: "country", label: "Drug Geography" },
  { key: "moleculeType", label: "Molecule Type" },
  { key: "route", label: "Route of Administration" },
  { key: "descriptor", label: "Drug Descriptor" },
] as const

type ColumnKey = (typeof columns)[number]["key"]
type Sort = { key: ColumnKey; dir: "asc" | "desc" }

/** Rows drawn at once. The count above says how many there are in all. */
const PAGE = 100

function compareRows(a: DrugRow, b: DrugRow, key: ColumnKey) {
  if (key === "stage") {
    return (stageOrder.get(a.stage) ?? Infinity) - (stageOrder.get(b.stage) ?? Infinity)
  }
  return a[key].localeCompare(b[key])
}

/** `Antiinflammatory Therapy` in a cell is mostly the word Therapy. */
const shortDescriptor = (descriptor: string) => descriptor.replace(/ Therapy$/, "")

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
  className,
}: {
  rows: DrugRow[]
  /** Whether the query holds anything yet. */
  active: boolean
  className?: string
}) {
  const [sort, setSort] = React.useState<Sort | null>(null)

  const sorted = React.useMemo(() => {
    if (!sort) return rows
    const factor = sort.dir === "asc" ? 1 : -1
    return [...rows].sort((a, b) => factor * compareRows(a, b, sort.key))
  }, [rows, sort])

  const cycle = (key: ColumnKey) =>
    setSort((current) =>
      current?.key !== key ? { key, dir: "asc" } : current.dir === "asc" ? { key, dir: "desc" } : null,
    )
  const shown = sorted.slice(0, PAGE)
  const sortedLabel = sort ? columns.find((column) => column.key === sort.key)?.label : null

  const head = (
    <thead className="sticky top-0 z-20">
      <tr className="bg-surface-panel">
        {columns.map((column, i) => {
          const isSorted = active && sort?.key === column.key
          return (
            <th
              key={column.key}
              aria-sort={isSorted ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}
              className={cn(
                "bg-surface-panel text-muted-foreground border-edge border-b px-3 py-2.5 text-left text-[10px] font-medium tracking-[0.08em] whitespace-nowrap uppercase",
                i === 0 && "sticky left-0 z-10 border-r pl-(--text-inset)",
                i === columns.length - 1 && "pr-(--text-inset)",
              )}
            >
              {active ? (
                <button
                  type="button"
                  onClick={() => cycle(column.key)}
                  className={cn(
                    "group/sort inline-flex items-center gap-1 uppercase",
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
    <section className={cn("bg-surface-page flex min-h-0 min-w-0 flex-col", className)}>
      <div className="bg-surface-panel text-muted-foreground flex h-11 shrink-0 items-center justify-between gap-4 px-(--text-inset) text-xs">
        <span className="tabular-nums">
          {rows.length === 0
            ? "No drugs in the sample match this query"
            : `Showing 1–${shown.length} of ${rows.length.toLocaleString("en-GB")} sampled drugs`}
        </span>
        {sort && sortedLabel ? (
          <span className="truncate">
            Sorted by {sortedLabel}, {sort.dir === "asc" ? "A–Z" : "Z–A"}
          </span>
        ) : null}
      </div>

      <div className="bg-surface-chrome border-edge min-h-0 flex-1 overflow-auto border-t">
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
              shown.map((row) => (
                <tr key={row.id} className="group/row border-hairline border-b last:border-0">
                  <td className="bg-surface-chrome group-hover/row:bg-surface-page border-edge sticky left-0 z-10 border-r py-2.5 pr-3 pl-(--text-inset) font-medium whitespace-nowrap transition-colors">
                    {row.name}
                  </td>
                  <Cell>{row.company}</Cell>
                  <Cell>{row.indication}</Cell>
                  <td className="group-hover/row:bg-surface-page px-3 py-2.5 transition-colors">
                    <StageBadge stage={row.stage} />
                  </td>
                  <Cell>{row.country}</Cell>
                  <Cell>{row.moleculeType}</Cell>
                  <Cell>{row.route}</Cell>
                  <Cell className="pr-(--text-inset)">{shortDescriptor(row.descriptor)}</Cell>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function Cell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <td
      className={cn(
        "text-muted-foreground group-hover/row:bg-surface-page px-3 py-2.5 whitespace-nowrap transition-colors",
        className,
      )}
    >
      {children}
    </td>
  )
}
