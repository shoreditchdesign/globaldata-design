import { CheckIcon, ChevronRightIcon, SearchIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import type { ColumnItem } from "@/flows/sprint-3/idea-2/data"

/**
 * Counts above ten thousand compact so the number lane stays one width. Zero
 * is an em dash rather than a `0` — the only rows that carry it are free-text
 * attributes, which have no value list to count, and `0` would read as a dead
 * end rather than a different kind of row.
 */
export function formatCount(n: number) {
  if (n === 0) return "—"
  if (n < 10_000) return n.toLocaleString("en-GB")
  return `${(n / 1000).toFixed(1)}k`
}

export interface ColumnModel {
  /** Stable key — also the parent node this column hangs off. */
  key: string
  /** What the rows are, e.g. `Attribute`, `Therapy area`, `Indication`. */
  level: string
  items: ColumnItem[]
  /** Values ticked in this column. */
  selected?: string[]
  /** The row whose children are open in the column to the right. */
  open?: string
  /** Per-row count of values applied inside that row, shown in the lead lane. */
  badges?: Record<string, number>
  /** Free-text attributes have no list — the column is a search field. */
  search?: boolean
  placeholder?: string
  /** What the number lane counts. The filter areas are whole records, not drugs. */
  unit?: string
  /** Columns carrying the long labels take a larger share of the panel. */
  wide?: boolean
}

/** The number lane is sized to the widest count in the column, not globally. */
function countLane(items: ColumnItem[]) {
  const longest = items.reduce((n, item) => Math.max(n, formatCount(item.count).length), 0)
  if (longest <= 3) return "w-8"
  if (longest <= 5) return "w-10"
  return "w-12"
}

/**
 * One level of the drill-down. Rows use fixed-width lanes — lead, label,
 * count, chevron — and the column header sits on the same lanes, so the
 * numbers line up down the panel and the headings line up across it.
 */
export function MillerColumn({
  column,
  onOpen,
  className,
}: {
  column: ColumnModel
  onOpen: (item: ColumnItem) => void
  className?: string
}) {
  const selected = new Set(column.selected ?? [])
  const lane = countLane(column.items)
  const hasDrill = column.items.some((item) => item.drillable)

  return (
    <div
      className={cn(
        // A floor on the column width — below it the labels stop being
        // readable, and the strip scrolls the way Finder's does instead.
        "flex min-w-[176px] flex-col",
        column.wide ? "flex-[1.25]" : "flex-1",
        className,
      )}
    >
      <div className="flex h-7 shrink-0 items-center gap-1.5 border-b pr-1.5 pl-2">
        <span className="w-4 shrink-0" aria-hidden />
        <span className="text-muted-foreground min-w-0 flex-1 truncate text-[10px] font-medium tracking-[0.09em] uppercase">
          {column.level}
        </span>
        {column.search ? null : (
          <>
            <span className="text-muted-foreground/70 shrink-0 text-right text-[10px] font-medium tracking-[0.09em] uppercase">
              {column.unit ?? "Drugs"}
            </span>
            {hasDrill ? <span className="w-3 shrink-0" aria-hidden /> : null}
          </>
        )}
      </div>

      <div className="shrink-0 px-2 py-1.5">
        <div className="bg-background text-muted-foreground flex h-7 items-center gap-1.5 rounded-md border px-2">
          <SearchIcon className="size-3 shrink-0" />
          <span className="truncate text-[11px]">{column.placeholder ?? "Search"}</span>
        </div>
      </div>

      {column.search ? (
        <p className="text-muted-foreground px-3 py-1 text-[11px] leading-relaxed">
          Free text — type a value to match against, or paste a list.
        </p>
      ) : (
        <ul className="min-h-0 flex-1 overflow-y-auto px-1 pb-2">
          {column.items.map((item) => {
            const isSelected = selected.has(item.label)
            const isOpen = column.open === item.label
            const badge = column.badges?.[item.label]

            return (
              <li key={item.label}>
                <button
                  type="button"
                  onClick={() => onOpen(item)}
                  title={item.label}
                  aria-current={isOpen ? "true" : undefined}
                  className={cn(
                    "relative flex h-7 w-full items-center gap-1.5 rounded-md pr-1.5 pl-2 text-left transition-colors",
                    "hover:bg-accent",
                    (isSelected || isOpen) && "bg-accent",
                    isOpen &&
                      "before:bg-foreground before:absolute before:top-1 before:bottom-1 before:left-0 before:w-[2px] before:rounded-full",
                  )}
                >
                  {/* Lead lane: how many values are applied inside this row, or a tick. */}
                  <span className="flex w-4 shrink-0 justify-center">
                    {badge ? (
                      <span className="bg-foreground text-background flex size-4 items-center justify-center rounded-full text-[9px] font-medium tabular-nums">
                        {badge}
                      </span>
                    ) : isSelected ? (
                      <CheckIcon className="size-3" strokeWidth={3} />
                    ) : null}
                  </span>
                  <span
                    className={cn(
                      "min-w-0 flex-1 truncate text-[12px]",
                      isSelected ? "font-medium" : "text-foreground/90",
                    )}
                  >
                    {item.label}
                  </span>
                  <span
                    className={cn(
                      "shrink-0 text-right text-[11px] tabular-nums",
                      lane,
                      isSelected ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {formatCount(item.count)}
                  </span>
                  {hasDrill ? (
                    <span className="flex w-3 shrink-0 justify-center">
                      {item.drillable ? (
                        <ChevronRightIcon
                          className={cn(
                            "size-3",
                            isOpen ? "text-foreground" : "text-muted-foreground/50",
                          )}
                        />
                      ) : null}
                    </span>
                  ) : null}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
