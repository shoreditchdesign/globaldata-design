import { ArrowUpDownIcon } from "lucide-react"

import { StageBadge } from "@/components/prototype/StageBadge"
import type { ResultRow } from "@/flows/sprint-3/idea-3/data"

const columns = [
  { key: "name", label: "Drug Name" },
  { key: "generic", label: "Generic Name" },
  { key: "company", label: "Company" },
  { key: "target", label: "Target" },
  { key: "stage", label: "Development Stage" },
  { key: "route", label: "Route of Administration" },
  { key: "geography", label: "Drug Geography" },
] as const

/**
 * Results sit under the sentence on the same screen — the query and its answer
 * are never on separate pages. The header row is sticky so the columns stay
 * readable as the set is scrolled.
 *
 * The rows are the sample filtered against the sentence, not a fixed page: an
 * edit that moves the count moves the table with it. When the sentence rules
 * out every row in the sample the table says so rather than padding itself out
 * with drugs the sentence excludes.
 */
export function ResultsGrid({ rows, total }: { rows: ResultRow[]; total: number }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="text-muted-foreground flex shrink-0 items-center justify-between px-6 py-2.5 text-xs">
        <span className="tabular-nums">
          {rows.length === 0
            ? `No drugs on this page match · ${total.toLocaleString()} in the set`
            : `Showing 1–${rows.length} of ${total.toLocaleString()}`}
        </span>
        <span>Sorted by relevance</span>
      </div>
      <div className="min-h-0 flex-1 overflow-auto border-t">
        <table className="w-full border-collapse text-[13px] [&_td:first-child]:pl-6 [&_td:last-child]:pr-6 [&_th:first-child]:pl-6 [&_th:last-child]:pr-6">
          <thead className="sticky top-0 z-10">
            <tr className="bg-muted/70 backdrop-blur">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="text-muted-foreground border-b px-4 py-2.5 text-left text-[10px] font-medium tracking-[0.08em] whitespace-nowrap uppercase"
                >
                  <span className="flex items-center gap-1.5">
                    {column.label}
                    <ArrowUpDownIcon className="text-muted-foreground/40 size-3" />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center">
                  <p className="text-[13px] font-medium">No drugs on this page match the sentence</p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Widen a condition, or undo the last edit.
                  </p>
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr key={`${row.name}-${i}`} className="hover:bg-muted/40 border-b last:border-0">
                  <td className="px-4 py-2.5 font-medium whitespace-nowrap">{row.name}</td>
                  <td className="text-muted-foreground px-4 py-2.5 whitespace-nowrap">{row.generic}</td>
                  <td className="text-muted-foreground px-4 py-2.5 whitespace-nowrap">{row.company}</td>
                  <td className="text-muted-foreground px-4 py-2.5 whitespace-nowrap">{row.target}</td>
                  <td className="px-4 py-2.5">
                    <StageBadge stage={row.stage} />
                  </td>
                  <td className="text-muted-foreground px-4 py-2.5 whitespace-nowrap">{row.route}</td>
                  <td className="text-muted-foreground px-4 py-2.5 whitespace-nowrap">
                    {row.geographies.join(", ")}
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
