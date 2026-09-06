import { ChevronDownIcon, ChevronRightIcon, PlusIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { FilterPill } from "@/components/prototype/FilterPill"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { groupRows, type DrugRow, type RowField } from "@/flows/sprint-3/idea-1/data"

export interface Grouping {
  field: RowField
  label: string
}

/**
 * Results collapsed into groups, with room for a second grouping.
 *
 * The buckets are counted off the rows the filters left behind, so the grouped
 * view and the flat table can never disagree about how big the set is.
 */
export function GroupedResults({
  rows,
  grouping,
  options,
  openGroups,
  onToggle,
  onRemove,
  onAdd,
  onClear,
}: {
  rows: DrugRow[]
  grouping: Grouping[]
  /** Columns still available to group by. */
  options: Grouping[]
  openGroups: string[]
  onToggle: (key: string) => void
  onRemove: (index: number) => void
  onAdd: (grouping: Grouping) => void
  onClear: () => void
}) {
  return (
    <>
      <div className="flex items-center gap-3 px-6 py-4">
        <span className="text-muted-foreground text-[10px] font-medium tracking-[0.08em] uppercase">
          Group by
        </span>
        {grouping.map((level, i) => (
          <span
            key={level.field}
            className="contents"
            onClick={(event) => {
              if ((event.target as HTMLElement).closest("button")) onRemove(i)
            }}
          >
            <FilterPill variant="muted" removeLabel={`Remove ${level.label} grouping`}>
              {level.label}
            </FilterPill>
          </span>
        ))}

        {grouping.length < 2 && options.length > 0 ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="Add a grouping"
              className="bg-muted hover:bg-accent flex size-7 items-center justify-center rounded-full transition-colors"
            >
              <PlusIcon className="size-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {options.map((option) => (
                <DropdownMenuItem key={option.field} onSelect={() => onAdd(option)}>
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}

        <Button variant="ghost" size="sm" className="ml-auto" onClick={onClear}>
          Clear all
        </Button>
      </div>

      <div className="px-6 pb-6">
        <div className="overflow-hidden rounded-lg border">
          {rows.length === 0 ? (
            <p className="text-muted-foreground px-4 py-10 text-center text-sm">
              No drugs match these filters.
            </p>
          ) : (
            <Buckets
              rows={rows}
              grouping={grouping}
              depth={0}
              path=""
              openGroups={openGroups}
              onToggle={onToggle}
            />
          )}
        </div>
      </div>
    </>
  )
}

function Buckets({
  rows,
  grouping,
  depth,
  path,
  openGroups,
  onToggle,
}: {
  rows: DrugRow[]
  grouping: Grouping[]
  depth: number
  path: string
  openGroups: string[]
  onToggle: (key: string) => void
}) {
  const level = grouping[depth]
  if (!level) return null

  return (
    <>
      {groupRows(rows, level.field).map((bucket) => {
        const key = `${path}/${bucket.label}`
        const open = openGroups.includes(key)
        return (
          <div key={key} className="border-b last:border-0">
            <button
              type="button"
              onClick={() => onToggle(key)}
              className="hover:bg-brand-wash flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors"
              style={{ paddingLeft: `${16 + depth * 20}px` }}
            >
              {open ? (
                <ChevronDownIcon className="text-muted-foreground size-3.5 shrink-0" />
              ) : (
                <ChevronRightIcon className="text-muted-foreground size-3.5 shrink-0" />
              )}
              <span className="flex-1 truncate">{bucket.label}</span>
              <span className="text-muted-foreground text-xs tabular-nums">
                {bucket.rows.length} {bucket.rows.length === 1 ? "drug" : "drugs"}
              </span>
            </button>

            {open ? (
              grouping[depth + 1] ? (
                <div className="border-t">
                  <Buckets
                    rows={bucket.rows}
                    grouping={grouping}
                    depth={depth + 1}
                    path={key}
                    openGroups={openGroups}
                    onToggle={onToggle}
                  />
                </div>
              ) : (
                <div className="border-t">
                  {bucket.rows.map((row, i) => (
                    <div
                      key={`${row.name}-${i}`}
                      className={cn(
                        "text-muted-foreground flex items-center gap-4 py-2 pr-4 text-sm",
                        "border-b last:border-0",
                      )}
                      style={{ paddingLeft: `${44 + depth * 20}px` }}
                    >
                      <span className="text-foreground w-40 shrink-0 truncate">{row.name}</span>
                      <span className="w-48 shrink-0 truncate">{row.generic}</span>
                      <span className="flex-1 truncate">{row.company}</span>
                      <span className="shrink-0 truncate">{row.geographies.join(", ")}</span>
                    </div>
                  ))}
                </div>
              )
            ) : null}
          </div>
        )
      })}
    </>
  )
}
