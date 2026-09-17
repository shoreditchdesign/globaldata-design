"use client"

import * as React from "react"
import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon, FolderTreeIcon, TableIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { StageBadge } from "@/components/prototype/StageBadge"
import { Button } from "@/components/ui/button"
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
  onOpenRecord,
  explorerOpen,
  onToggleExplorer,
  className,
}: {
  rows: DrugRow[]
  /** Whether the query holds anything yet. */
  active: boolean
  /** `Open` on a drug name: the whole record, in a drawer over a scrim. */
  onOpenRecord: (id: string) => void
  explorerOpen: boolean
  /** `Explorer` splits the tree in beside the results, and closes it again. */
  onToggleExplorer: () => void
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
                "bg-surface-panel text-muted-foreground border-edge h-9 border-b px-3 text-left text-[10px] font-medium tracking-[0.08em] whitespace-nowrap uppercase",
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

  // The explorer is reached from the head of the results in both states, so a
  // cold start has a way into the taxonomy without typing anything first.
  const toolbar = (
    <div className="bg-surface-panel text-muted-foreground flex h-12 shrink-0 items-center justify-between gap-4 px-(--text-inset) text-xs">
      {/*
        Two views of the results rather than a switch with an on state: standard
        is the grid on its own, explorer brings the tree in beside it. The
        selected segment is white on a muted track, as the box's own toggle was.
      */}
      <div className="bg-muted -ml-1 flex items-center gap-0.5 rounded-lg p-0.5">
        <ViewTab active={!explorerOpen} onClick={() => (explorerOpen ? onToggleExplorer() : undefined)}>
          <TableIcon className="size-3.5" />
          Standard
        </ViewTab>
        <ViewTab active={explorerOpen} onClick={() => (explorerOpen ? undefined : onToggleExplorer())}>
          <FolderTreeIcon className="size-3.5" />
          Explorer
        </ViewTab>
      </div>
      {active ? (
        <span className="ml-auto tabular-nums">
          {rows.length === 0
            ? "No drugs in the sample match this query"
            : `Showing 1–${shown.length} of ${rows.length.toLocaleString("en-GB")} sampled drugs`}
        </span>
      ) : null}
      {active && sort && sortedLabel ? (
        <span className="truncate">
          Sorted by {sortedLabel}, {sort.dir === "asc" ? "A–Z" : "Z–A"}
        </span>
      ) : null}
    </div>
  )

  if (!active) {
    return (
      <section className={cn("bg-surface-panel flex min-h-0 min-w-0 flex-col", className)}>
        {toolbar}
        <div className="shrink-0 overflow-hidden">
          <table className="w-full border-collapse text-[13px]">{head}</table>
        </div>
        <EmptyState />
      </section>
    )
  }

  return (
    <section className={cn("bg-surface-panel flex min-h-0 min-w-0 flex-col", className)}>
      {toolbar}

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
                  <td className="border-hairline sticky left-0 z-10 border-r bg-inherit py-2.5 pr-3 pl-(--text-inset) font-medium whitespace-nowrap">
                    {/*
                      The name keeps the button's width permanently rather than
                      on hover. Sprint 3 Idea 2 animated that room in and the
                      row reflowed under a moving cursor, dropping the hover
                      between the mouse arriving and the click landing.
                    */}
                    <span className="block pr-14">{row.name}</span>
                    {/* Shown on hover anywhere in the row, but focusable at all
                        times, so the record is never a mouse-only door. */}
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => onOpenRecord(row.id)}
                      className={cn(
                        "absolute top-1/2 right-3 -translate-y-1/2 opacity-0 transition-opacity duration-100",
                        "group-hover/row:opacity-100 focus-visible:opacity-100",
                        "motion-reduce:transition-none",
                      )}
                    >
                      Open
                    </Button>
                  </td>
                  <Cell>{row.company}</Cell>
                  <Cell>{row.indication}</Cell>
                  <td className="px-3 py-2.5">
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

function ViewTab({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex h-6 items-center gap-1.5 rounded-md px-2 text-xs font-medium transition-[background-color,color,box-shadow]",
        active ? "bg-surface-panel text-foreground shadow-panel" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  )
}

function Cell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <td
      className={cn(
        "text-muted-foreground px-3 py-2.5 whitespace-nowrap",
        className,
      )}
    >
      {children}
    </td>
  )
}
