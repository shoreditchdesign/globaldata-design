"use client"

import { ChevronsUpDownIcon } from "lucide-react"

import { liftClass } from "@/components/prototype/motion"
import { StageBadge } from "@/components/prototype/StageBadge"
import { Button } from "@/components/ui/button"
import type { DrugRow } from "@/flows/sprint-3/idea-2/data"
import { cn } from "@/lib/utils"

/**
 * Every column the result set can show, in the order it shows them.
 *
 * The first three are the default set and the reason this list is ordered
 * rather than keyed: the client asked for two or three columns up front and
 * everything else behind a panel, so name / stage / company lead and the rest
 * are opt-in from the `Columns` menu. Widths are shares, not absolutes — the
 * table is `table-fixed`, so turning a fourth column on renormalises the row
 * instead of overflowing it.
 */
export const resultColumns = [
  { key: "name", label: "Drug name", width: "w-[58%]" },
  { key: "stage", label: "Stage", width: "w-[22%]" },
  { key: "company", label: "Company", width: "w-[20%]" },
  { key: "therapyArea", label: "Therapy area", width: "w-[22%]" },
  { key: "indication", label: "Indication", width: "w-[26%]" },
  { key: "geography", label: "Geography", width: "w-[20%]" },
] as const

export type ResultColumnKey = (typeof resultColumns)[number]["key"]

/**
 * The result set. Hand-rolled rather than the shadcn table so the header can
 * stick inside a single scroll container.
 *
 * Three columns by default, because the pane is a fifth of the window and a
 * six-column grid at that width is six ellipses. The rest of the record is not
 * cut, it is moved: hovering a name surfaces `Open`, which is the whole row in
 * a drawer. Generic name rides under the brand for the same reason — it is
 * identification, not a field worth a column.
 */
export function ResultsTable({
  rows,
  visibleColumns,
  onOpenRecord,
}: {
  rows: DrugRow[]
  visibleColumns: readonly ResultColumnKey[]
  onOpenRecord: (id: string) => void
}) {
  const shown = resultColumns.filter((column) => visibleColumns.includes(column.key))

  return (
    <div className="min-h-0 flex-1 overflow-auto">
      <table className="w-full table-fixed border-collapse text-[16px]">
        <thead className="sticky top-0 z-10">
          <tr className="bg-surface-panel">
            {shown.map((column) => (
              <th
                key={column.key}
                className={`text-muted-foreground border-edge border-b px-3 py-2 text-left text-[12px] font-medium tracking-[0.09em] whitespace-nowrap uppercase ${column.width}`}
              >
                <span className="flex items-center gap-1">
                  {column.label}
                  <ChevronsUpDownIcon className="text-muted-foreground size-3" />
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className="group/row border-hairline hover:bg-accent border-b transition-colors last:border-0"
            >
              {shown.map((column) =>
                column.key === "name" ? (
                  <td key={column.key} className="relative px-3 py-2.5">
                    {/*
                      The pane is a fifth of the window, so `Open` cannot simply
                      sit on top of the name — it would cover the last third of
                      a string that is already truncating. The text yields to it
                      instead: on hover the name reserves the button's width and
                      truncates earlier, so nothing is ever hidden behind it.
                    */}
                    <span className="block truncate pr-0 font-medium transition-[padding] group-hover/row:pr-16">
                      {row.name}
                    </span>
                    <span className="text-muted-foreground block truncate pr-0 text-[14px] transition-[padding] group-hover/row:pr-16">
                      {row.generic}
                    </span>
                    {/*
                      Hidden until the row is hovered — anywhere in the row, not
                      just this cell — but focusable at all times, because the
                      drawer cannot be a mouse-only door. Pointer events follow
                      the opacity so an invisible button never swallows a click.
                    */}
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => onOpenRecord(row.id)}
                      className={cn(
                        "pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 opacity-0",
                        "group-hover/row:pointer-events-auto group-hover/row:opacity-100",
                        "focus-visible:pointer-events-auto focus-visible:opacity-100",
                        liftClass,
                      )}
                    >
                      Open
                    </Button>
                  </td>
                ) : column.key === "stage" ? (
                  <td key={column.key} className="px-3 py-2.5">
                    <StageBadge stage={row.stage} />
                  </td>
                ) : (
                  <td key={column.key} className="text-muted-foreground px-3 py-2.5">
                    <span className="block truncate">{cellValue(row, column.key)}</span>
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Geography is the country, not the region — the region is a drawer field. */
function cellValue(row: DrugRow, key: ResultColumnKey): string {
  switch (key) {
    case "company":
      return row.company
    case "therapyArea":
      return row.therapyArea
    case "indication":
      return row.indication
    case "geography":
      return row.country
    default:
      return ""
  }
}
