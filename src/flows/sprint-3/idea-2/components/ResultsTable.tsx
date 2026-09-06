import { ChevronsUpDownIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { resultRows } from "@/flows/sprint-3/idea-2/data"

const columns = [
  { key: "name", label: "Drug name", width: "w-[19%]" },
  { key: "company", label: "Company", width: "w-[16%]" },
  { key: "therapyArea", label: "Therapy area", width: "w-[15%]" },
  { key: "indication", label: "Indication", width: "w-[23%]" },
  { key: "stage", label: "Stage", width: "w-[13%]" },
  { key: "geography", label: "Geography", width: "w-[14%]" },
] as const

/**
 * The result set. Hand-rolled rather than the shadcn table so the header can
 * stick inside a single scroll container.
 *
 * Generic name rides under the brand rather than taking a column of its own —
 * the live grid runs eight locked columns and scrolls sideways at 1600px.
 */
export function ResultsTable() {
  return (
    <div className="min-h-0 flex-1 overflow-auto">
      <table className="w-full table-fixed border-collapse text-[12.5px]">
        <thead className="sticky top-0 z-10">
          <tr className="bg-background">
            {columns.map((column) => (
              <th
                key={column.key}
                className={`text-muted-foreground border-b px-3 py-2 text-left text-[10px] font-medium tracking-[0.09em] whitespace-nowrap uppercase ${column.width}`}
              >
                <span className="flex items-center gap-1">
                  {column.label}
                  <ChevronsUpDownIcon className="text-muted-foreground/40 size-3" />
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {resultRows.map((row) => (
            <tr key={row.name} className="hover:bg-muted/40 border-b last:border-0">
              <td className="px-3 py-1.5">
                <span className="block truncate font-medium">{row.name}</span>
                <span className="text-muted-foreground block truncate text-[11px]">
                  {row.generic}
                </span>
              </td>
              <td className="text-muted-foreground px-3 py-1.5">
                <span className="block truncate">{row.company}</span>
              </td>
              <td className="text-muted-foreground px-3 py-1.5">
                <span className="block truncate">{row.therapyArea}</span>
              </td>
              <td className="text-muted-foreground px-3 py-1.5">
                <span className="block truncate">{row.indication}</span>
              </td>
              <td className="px-3 py-1.5">
                <Badge variant="outline" className="text-[11px] font-normal">
                  {row.stage}
                </Badge>
              </td>
              <td className="text-muted-foreground px-3 py-1.5">
                <span className="block truncate">{row.geography}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
