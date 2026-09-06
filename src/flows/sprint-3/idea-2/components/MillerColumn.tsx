"use client"

import { ChevronRightIcon, SearchIcon } from "lucide-react"

import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

/**
 * Counts above ten thousand compact so the number lane stays one width. A row
 * with no number at all — a free-text attribute, which has no value list to
 * count — shows an em dash; a row with a real zero shows `0`, because zero is
 * an answer and a dash is not.
 */
export function formatCount(n: number) {
  if (n < 10_000) return n.toLocaleString("en-GB")
  return `${(n / 1000).toFixed(1)}k`
}

/** One row of a column: a label, what it would yield, and whether it opens. */
export interface ColumnRow {
  label: string
  /** Rows this label would leave, in the context of the rest of the query. */
  count: number | null
  /** True when the row opens a further column rather than only being ticked. */
  drillable?: boolean
}

export interface ColumnModel {
  /** Stable key — also the parent node this column hangs off. */
  key: string
  /** What the rows are, e.g. `Attribute`, `Therapy area`, `Indication`. */
  level: string
  items: ColumnRow[]
  /** Values ticked in this column. */
  selected?: string[]
  /** The row whose children are open in the column to the right. */
  open?: string
  /** Per-row count of values applied inside that row, shown in the lead lane. */
  badges?: Record<string, number>
  /** Whether rows carry a tick box. Areas and attributes are navigation only. */
  selectable?: boolean
  /**
   * The attribute this column ticks into is excluded rather than kept, so its
   * numbers say what a value would drop, not what it would leave.
   */
  negated?: boolean
  /** Free-text attributes have no list — the column is a search field. */
  search?: boolean
  placeholder?: string
  /** What the number lane counts. The filter areas are whole records, not drugs. */
  unit?: string
  /** Columns carrying the long labels take a larger share of the panel. */
  wide?: boolean
}

/** The number lane is sized to the widest count in the column, not globally. */
function countLane(items: ColumnRow[], negated = false) {
  const longest = items.reduce(
    (n, item) =>
      Math.max(n, item.count === null ? 1 : formatCount(item.count).length + (negated ? 1 : 0)),
    0,
  )
  if (longest <= 3) return "w-8"
  if (longest <= 5) return "w-10"
  return "w-12"
}

/**
 * One level of the drill-down. Rows use fixed-width lanes — lead, label,
 * count, chevron — and the column header sits on the same lanes, so the
 * numbers line up down the panel and the headings line up across it.
 *
 * A value row is two controls in one line: the box ticks the value into the
 * query, the rest of the row opens what is underneath it. Rows with nothing
 * underneath tick from anywhere along the row, since there is nothing else
 * for a click to mean.
 */
export function MillerColumn({
  column,
  onOpen,
  onToggle,
  className,
}: {
  column: ColumnModel
  onOpen: (label: string) => void
  onToggle?: (label: string) => void
  className?: string
}) {
  const selected = new Set(column.selected ?? [])
  const lane = countLane(column.items, column.negated)
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
              {column.negated ? "Excludes" : (column.unit ?? "Drugs")}
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
            const empty = item.count === 0
            // With nothing underneath it, the row body has only one job.
            const bodyTicks = Boolean(column.selectable && onToggle && !item.drillable)

            return (
              <li
                key={item.label}
                className={cn(
                  "relative flex h-7 items-center rounded-md transition-colors",
                  "hover:bg-accent",
                  (isSelected || isOpen) && "bg-accent",
                  isOpen &&
                    "before:bg-foreground before:absolute before:top-1 before:bottom-1 before:left-0 before:w-[2px] before:rounded-full",
                )}
              >
                {/* Lead lane: the tick box, or how many values are applied inside this row. */}
                <span className="flex w-6 shrink-0 items-center justify-center">
                  {column.selectable && onToggle ? (
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onToggle(item.label)}
                      aria-label={`${isSelected ? "Remove" : "Add"} ${item.label}`}
                      className="size-3.5"
                    />
                  ) : badge ? (
                    <span className="bg-foreground text-background flex size-4 items-center justify-center rounded-full text-[9px] font-medium tabular-nums">
                      {badge}
                    </span>
                  ) : null}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    if (bodyTicks) onToggle?.(item.label)
                    else if (item.drillable) onOpen(item.label)
                  }}
                  title={item.label}
                  aria-current={isOpen ? "true" : undefined}
                  className="flex h-7 min-w-0 flex-1 items-center gap-1.5 pr-1.5 text-left"
                >
                  <span
                    className={cn(
                      "min-w-0 flex-1 truncate text-[12px]",
                      isSelected ? "font-medium" : "text-foreground/90",
                      empty && !isSelected && "text-muted-foreground/60",
                    )}
                  >
                    {item.label}
                  </span>
                  <span
                    className={cn(
                      "shrink-0 text-right text-[11px] tabular-nums",
                      lane,
                      isSelected
                        ? "text-foreground"
                        : empty
                          ? "text-muted-foreground/50"
                          : "text-muted-foreground",
                    )}
                  >
                    {item.count === null
                      ? "—"
                      : column.negated && item.count > 0
                        ? `−${formatCount(item.count)}`
                        : formatCount(item.count)}
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
