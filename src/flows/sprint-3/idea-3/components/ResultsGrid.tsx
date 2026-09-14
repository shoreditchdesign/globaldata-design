"use client"

import * as React from "react"
import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon } from "lucide-react"

import { StageBadge } from "@/components/prototype/StageBadge"
import { clauseTemplates, type ResultRow } from "@/flows/sprint-3/idea-3/data"

const columns = [
  { key: "name", label: "Drug Name" },
  { key: "generic", label: "Generic Name" },
  { key: "company", label: "Company" },
  { key: "descriptor", label: "Drug Descriptor" },
  { key: "target", label: "Target" },
  { key: "stage", label: "Development Stage" },
  { key: "route", label: "Route of Administration" },
  { key: "geography", label: "Drug Geography" },
] as const

type ColumnKey = (typeof columns)[number]["key"]
type Sort = { key: ColumnKey; dir: "asc" | "desc" }

/**
 * Stage sorts by where it sits in the pipeline, not alphabetically — `Phase III`
 * before `Pre-registration` before `Marketed`. The order is the one the
 * Development Stage clause already lists its values in.
 */
const stageOrder = new Map(
  (clauseTemplates.find((clause) => clause.id === "stage")?.options ?? []).map(
    (option, index) => [option.value, index],
  ),
)

function compareRows(a: ResultRow, b: ResultRow, key: ColumnKey) {
  switch (key) {
    case "stage":
      return (stageOrder.get(a.stage) ?? Infinity) - (stageOrder.get(b.stage) ?? Infinity)
    case "geography":
      return a.geographies.join(", ").localeCompare(b.geographies.join(", "))
    default:
      return a[key].localeCompare(b[key])
  }
}

/**
 * `Antineoplastic Therapy` in a cell is mostly the word Therapy. The column
 * carries the part that varies; the dropdown and the filter view still name the
 * value in full.
 */
const shortDescriptor = (descriptor: string) => descriptor.replace(/ Therapy$/, "")

/**
 * Two columns carry values long enough to set the width of the whole table —
 * `Human Epidermal Growth Factor Receptor 2` is forty characters. Capping them
 * keeps eight columns inside a 1440px window without a horizontal scrollbar,
 * which is the incumbent's failing and not one worth repeating. The full value
 * is on the cell's title, and in the pill dropdown that filters on it.
 */
function Clipped({ children, width }: { children: string; width: string }) {
  return (
    <span className={`block truncate ${width}`} title={children}>
      {children}
    </span>
  )
}

/**
 * Results sit under the sentence on the same screen — the query and its answer
 * are never on separate pages. The header row is sticky so the columns stay
 * readable as the set is scrolled.
 *
 * Every header sorts, and that is the only table control. A click cycles
 * ascending, descending, then back to relevance; the arrow shows only on the
 * column in charge, with a quiet affordance on hover elsewhere, so the header
 * row stays as narrow as it was without them and eight columns still fit a
 * 1440px window. Stage sorts by pipeline position rather than by spelling.
 *
 * The rows are the sample filtered against the sentence, not a fixed page: an
 * edit that moves the count moves the table with it. When the sentence rules
 * out every row the table says so and the count above reads zero — the two can
 * never disagree, which is what `screenDrugs` is for.
 *
 * Its first and last cells sit 45px in from the window edge — the section's
 * 24px gutter, the card's 1px border and its 20px inner padding — so the table
 * text lines up with the typed query above it and ends where Export ends.
 */
export function ResultsGrid({ rows, total }: { rows: ResultRow[]; total: number }) {
  const [sort, setSort] = React.useState<Sort | null>(null)

  const sorted = React.useMemo(() => {
    if (!sort) return rows
    const factor = sort.dir === "asc" ? 1 : -1
    return [...rows].sort((a, b) => factor * compareRows(a, b, sort.key))
  }, [rows, sort])

  const cycle = (key: ColumnKey) =>
    setSort((current) =>
      current?.key !== key
        ? { key, dir: "asc" }
        : current.dir === "asc"
          ? { key, dir: "desc" }
          : null,
    )

  const sortedLabel = sort ? columns.find((column) => column.key === sort.key)?.label : null

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="text-muted-foreground flex shrink-0 items-center justify-between px-[45px] py-2.5 text-xs">
        <span className="tabular-nums">
          {rows.length === 0
            ? "No drugs match this query"
            : `Showing 1–${rows.length} of ${total.toLocaleString()}`}
        </span>
        <span>
          {sort && sortedLabel
            ? `Sorted by ${sortedLabel}, ${sort.dir === "asc" ? "A–Z" : "Z–A"}`
            : "Sorted by relevance"}
        </span>
      </div>
      <div className="bg-surface-chrome border-edge min-h-0 flex-1 overflow-auto border-t">
        <table className="w-full border-collapse text-[13px] [&_td:first-child]:pl-[45px] [&_td:last-child]:pr-[45px] [&_th:first-child]:pl-[45px] [&_th:last-child]:pr-[45px]">
          <thead className="sticky top-0 z-10">
            <tr className="bg-surface-panel">
              {columns.map((column) => {
                const active = sort?.key === column.key
                return (
                  <th
                    key={column.key}
                    aria-sort={
                      active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"
                    }
                    className="text-muted-foreground border-edge border-b px-3 py-2.5 text-left text-[10px] font-medium tracking-[0.08em] whitespace-nowrap uppercase"
                  >
                    <button
                      type="button"
                      onClick={() => cycle(column.key)}
                      className={
                        active
                          ? "group/sort text-foreground inline-flex items-center gap-1 uppercase"
                          : "group/sort hover:text-foreground inline-flex items-center gap-1 uppercase"
                      }
                    >
                      {column.label}
                      {active ? (
                        sort.dir === "asc" ? (
                          <ArrowUpIcon className="text-foreground size-3" />
                        ) : (
                          <ArrowDownIcon className="text-foreground size-3" />
                        )
                      ) : (
                        <ChevronsUpDownIcon className="size-3 opacity-0 group-hover/sort:opacity-100" />
                      )}
                    </button>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-3 py-10 text-center">
                  <p className="text-[13px] font-medium">No drugs match the sentence</p>
                </td>
              </tr>
            ) : (
              sorted.map((row, i) => (
                <tr key={`${row.name}-${i}`} className="hover:bg-surface-page border-hairline border-b transition-colors last:border-0">
                  <td className="px-3 py-2.5 font-medium whitespace-nowrap">{row.name}</td>
                  <td className="text-muted-foreground px-3 py-2.5 whitespace-nowrap">{row.generic}</td>
                  <td className="text-muted-foreground px-3 py-2.5 whitespace-nowrap">{row.company}</td>
                  <td className="text-muted-foreground px-3 py-2.5 whitespace-nowrap">
                    {shortDescriptor(row.descriptor)}
                  </td>
                  <td className="text-muted-foreground px-3 py-2.5">
                    <Clipped width="max-w-[230px]">{row.target}</Clipped>
                  </td>
                  <td className="px-3 py-2.5">
                    <StageBadge stage={row.stage} />
                  </td>
                  <td className="text-muted-foreground px-3 py-2.5 whitespace-nowrap">{row.route}</td>
                  <td className="text-muted-foreground px-3 py-2.5">
                    <Clipped width="max-w-[180px]">{row.geographies.join(", ")}</Clipped>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
