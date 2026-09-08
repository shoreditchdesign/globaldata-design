import { EllipsisVerticalIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { DrugRow, RowField } from "@/flows/sprint-3/idea-1/data"

/** The columns the incumbent's results table draws, and what each one filters on. */
export const resultColumns: { key: string; label: string; field: RowField }[] = [
  { key: "name", label: "Drug name", field: "name" },
  { key: "generic", label: "Generic name", field: "generic" },
  { key: "company", label: "Company", field: "company" },
  { key: "therapyArea", label: "Therapy area", field: "therapyArea" },
  { key: "indication", label: "Indication", field: "indication" },
  { key: "stage", label: "Developmental stage", field: "stage" },
  { key: "geography", label: "Drug geography", field: "geography" },
]

/**
 * The results table.
 *
 * The header badge is the number of filters standing on that column, so it
 * moves with the query rather than being drawn on. The column menu is the only
 * way into the grouped view, which is where the source puts it.
 */
export function ResultsTable({
  rows,
  filterCounts,
  onGroupBy,
}: {
  rows: DrugRow[]
  filterCounts: Partial<Record<RowField, number>>
  onGroupBy?: (field: RowField, label: string) => void
}) {
  return (
    <div className="px-6 pb-6">
      <div className="overflow-hidden rounded-lg border">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-surface-sunken">
              {resultColumns.map((column) => {
                const count = filterCounts[column.field]
                return (
                  <th
                    key={column.key}
                    className="text-muted-foreground border-b px-4 py-3 text-left text-[11px] font-medium tracking-[0.08em] uppercase"
                  >
                    <span className="flex items-center gap-1.5">
                      {column.label}
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          aria-label={`${column.label} column options`}
                          className="text-muted-foreground/50 hover:text-foreground transition-colors"
                        >
                          <EllipsisVerticalIcon className="size-3.5" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-64 p-1.5">
                          <DropdownMenuItem className="px-3 py-2.5">
                            Sort Ascending
                          </DropdownMenuItem>
                          <DropdownMenuItem className="px-3 py-2.5">
                            Sort Descending
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="-mx-1.5 my-1.5" />
                          <DropdownMenuItem className="px-3 py-2.5">
                            Edit filters
                            {count ? (
                              <Badge
                                variant="destructive"
                                className="ml-auto h-5 min-w-5 rounded-full px-1.5 text-[10px] tabular-nums"
                              >
                                {count}
                              </Badge>
                            ) : null}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="-mx-1.5 my-1.5" />
                          <DropdownMenuItem className="px-3 py-2.5">
                            Pin column
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="-mx-1.5 my-1.5" />
                          <DropdownMenuItem
                            className="px-3 py-2.5"
                            onSelect={() => onGroupBy?.(column.field, column.label)}
                          >
                            Group by {column.label}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="-mx-1.5 my-1.5" />
                          <DropdownMenuItem className="px-3 py-2.5">
                            Choose columns
                          </DropdownMenuItem>
                          <DropdownMenuItem className="px-3 py-2.5">
                            Reset columns
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      {count ? (
                        <Badge
                          variant="destructive"
                          className="ml-auto h-4 min-w-4 rounded-full px-1 text-[10px] tabular-nums"
                        >
                          {count}
                        </Badge>
                      ) : null}
                    </span>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={resultColumns.length} className="text-muted-foreground px-4 py-10 text-center">
                  No drugs match these filters.
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr key={`${row.name}-${i}`} className="border-b last:border-0">
                  <td className="px-4 py-3">{row.name}</td>
                  <td className="text-muted-foreground px-4 py-3">{row.generic}</td>
                  <td className="text-muted-foreground px-4 py-3">{row.company}</td>
                  <td className="text-muted-foreground px-4 py-3">{row.therapyArea}</td>
                  <td className="text-muted-foreground px-4 py-3">{row.indication}</td>
                  <td className="text-muted-foreground px-4 py-3">{row.stage}</td>
                  <td className="text-muted-foreground px-4 py-3">{row.geographies.join(", ")}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
