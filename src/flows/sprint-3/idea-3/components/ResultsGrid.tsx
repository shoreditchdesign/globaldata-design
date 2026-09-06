import { ArrowUpDownIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { resultRows } from "@/flows/sprint-3/idea-3/data"

const columns = [
  { key: "name", label: "Drug name" },
  { key: "generic", label: "Generic name" },
  { key: "company", label: "Company" },
  { key: "target", label: "Target" },
  { key: "stage", label: "Development stage" },
  { key: "route", label: "Route" },
  { key: "geography", label: "Drug geography" },
] as const

/**
 * Results sit under the sentence on the same screen — the query and its answer
 * are never on separate pages. The header row is sticky so the columns stay
 * readable as the set is scrolled.
 */
export function ResultsGrid({ total }: { total: number }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="text-muted-foreground flex shrink-0 items-center justify-between px-6 py-2.5 text-xs">
        <span className="tabular-nums">
          Showing 1–{resultRows.length} of {total.toLocaleString()}
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
            {resultRows.map((row, i) => (
              <tr key={`${row.name}-${i}`} className="hover:bg-muted/40 border-b last:border-0">
                <td className="px-4 py-2.5 font-medium whitespace-nowrap">{row.name}</td>
                <td className="text-muted-foreground px-4 py-2.5 whitespace-nowrap">{row.generic}</td>
                <td className="text-muted-foreground px-4 py-2.5 whitespace-nowrap">{row.company}</td>
                <td className="text-muted-foreground px-4 py-2.5 whitespace-nowrap">{row.target}</td>
                <td className="px-4 py-2.5">
                  <Badge variant="outline" className="font-normal">
                    {row.stage}
                  </Badge>
                </td>
                <td className="text-muted-foreground px-4 py-2.5 whitespace-nowrap">{row.route}</td>
                <td className="text-muted-foreground px-4 py-2.5 whitespace-nowrap">{row.geography}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
