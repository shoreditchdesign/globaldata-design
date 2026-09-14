"use client"

import { useState } from "react"
import { EllipsisVerticalIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { readField, type DrugRow, type RowField } from "@/flows/sprint-3/idea-1/data"

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

const MENU_ITEM_CLASS = "h-7 px-2 py-0 text-[12.5px]"

type SortDirection = "ascending" | "descending"

const valueCollator = new Intl.Collator("en-GB", { numeric: true, sensitivity: "base" })

function compareValues(left: string, right: string) {
  const leftNumber = Number(left)
  const rightNumber = Number(right)
  const numeric =
    left.trim() !== "" &&
    right.trim() !== "" &&
    Number.isFinite(leftNumber) &&
    Number.isFinite(rightNumber)

  return numeric ? leftNumber - rightNumber : valueCollator.compare(left, right)
}

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
  const [sort, setSort] = useState<{ field: RowField; direction: SortDirection } | null>(null)

  const displayedRows = sort
    ? [...rows].sort((left, right) => {
        const comparison = compareValues(
          readField(left, sort.field).join(", "),
          readField(right, sort.field).join(", "),
        )
        return sort.direction === "ascending" ? comparison : -comparison
      })
    : rows

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
                        <DropdownMenuContent align="start" className="w-52">
                          <DropdownMenuItem
                            className={cn(
                              MENU_ITEM_CLASS,
                              sort?.field === column.field &&
                                sort.direction === "ascending" &&
                                "bg-brand-tint ring-brand-border text-foreground ring-1 ring-inset",
                            )}
                            onSelect={() =>
                              setSort({ field: column.field, direction: "ascending" })
                            }
                          >
                            Sort Ascending
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className={cn(
                              MENU_ITEM_CLASS,
                              sort?.field === column.field &&
                                sort.direction === "descending" &&
                                "bg-brand-tint ring-brand-border text-foreground ring-1 ring-inset",
                            )}
                            onSelect={() =>
                              setSort({ field: column.field, direction: "descending" })
                            }
                          >
                            Sort Descending
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className={MENU_ITEM_CLASS}>
                            Edit filters
                            {count ? (
                              <Badge
                                variant="destructive"
                                className="ml-auto h-4 min-w-4 rounded-full px-1 text-[10px] tabular-nums"
                              >
                                {count}
                              </Badge>
                            ) : null}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className={MENU_ITEM_CLASS}>
                            Pin column
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className={MENU_ITEM_CLASS}
                            onSelect={() => onGroupBy?.(column.field, column.label)}
                          >
                            Group by {column.label}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className={MENU_ITEM_CLASS}>
                            Choose columns
                          </DropdownMenuItem>
                          <DropdownMenuItem className={MENU_ITEM_CLASS}>
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
            {displayedRows.length === 0 ? (
              <tr>
                <td colSpan={resultColumns.length} className="text-muted-foreground px-4 py-10 text-center">
                  No drugs in this 16-row sample match these filters.
                </td>
              </tr>
            ) : (
              displayedRows.map((row, i) => (
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
