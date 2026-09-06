import { EllipsisVerticalIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { drugRows, unfilteredGeographies, unfilteredNames } from "@/flows/sprint-3/idea-1/data"

const columns = [
  { key: "name", label: "Drug name" },
  { key: "generic", label: "Generic name" },
  { key: "company", label: "Company" },
  { key: "therapyArea", label: "Therapy area" },
  { key: "indication", label: "Indication", badge: 1 },
  { key: "stage", label: "Developmental stage", badge: 2 },
  { key: "geography", label: "Drug geography", badge: 2 },
] as const

/**
 * The results table. `variant="unfiltered"` is the pre-filter state that sits
 * behind the modal — drug codes, no badges on the headers.
 */
export function ResultsTable({ variant = "filtered" }: { variant?: "filtered" | "unfiltered" }) {
  const unfiltered = variant === "unfiltered"

  return (
    <div className="px-6 pb-6">
      <div className="overflow-hidden rounded-lg border">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-muted/50">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="text-muted-foreground border-b px-4 py-3 text-left text-[11px] font-medium tracking-[0.08em] uppercase"
                >
                  <span className="flex items-center gap-1.5">
                    {column.label}
                    <EllipsisVerticalIcon className="text-muted-foreground/50 size-3.5" />
                    {!unfiltered && "badge" in column ? (
                      <Badge
                        variant="secondary"
                        className="ml-auto h-4 min-w-4 rounded-full px-1 text-[10px] tabular-nums"
                      >
                        {column.badge}
                      </Badge>
                    ) : null}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {drugRows.map((row, i) => (
              <tr key={`${row.name}-${i}`} className="border-b last:border-0">
                <td className="px-4 py-3">{unfiltered ? unfilteredNames[i] : row.name}</td>
                <td className="text-muted-foreground px-4 py-3">{row.generic}</td>
                <td className="text-muted-foreground px-4 py-3">{row.company}</td>
                <td className="text-muted-foreground px-4 py-3">{row.therapyArea}</td>
                <td className="text-muted-foreground px-4 py-3">{row.indication}</td>
                <td className="text-muted-foreground px-4 py-3">{row.stage}</td>
                <td className="text-muted-foreground px-4 py-3">
                  {unfiltered ? unfilteredGeographies[i] : row.geography}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
