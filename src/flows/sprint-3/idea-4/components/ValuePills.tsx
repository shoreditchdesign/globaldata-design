"use client"

import { cn } from "@/lib/utils"

/**
 * A multi-valued cell. The whole point of this direction: a drug with nine
 * indications is still one row. Values render as pills that wrap inside the
 * lane, capped at `limit` with a `+N` that expands the record in place —
 * instead of the live product's merged rows, where the same drug becomes nine
 * table rows and one drug can fill the viewport.
 */
export function ValuePills({
  values,
  limit,
  expanded,
  onExpand,
  muted = false,
}: {
  values: string[]
  limit: number
  expanded: boolean
  onExpand: () => void
  /** Secondary lanes sit back a step so the primary ones read first. */
  muted?: boolean
}) {
  // Expanding does not grow the lane — it opens the detail band under the row,
  // so the lane stays the same height and the columns never lose alignment.
  const capped = values.length > limit
  const shown = capped ? values.slice(0, limit) : values

  return (
    <div className="flex flex-wrap items-center gap-1">
      {shown.map((value, i) => (
        <span
          key={`${value}-${i}`}
          title={value}
          className={cn(
            "bg-muted max-w-full truncate rounded-md px-1.5 py-0.5 text-[11px] leading-[16px]",
            muted ? "text-muted-foreground" : "text-foreground/80"
          )}
        >
          {value}
        </span>
      ))}
      {capped && !expanded ? (
        <button
          type="button"
          onClick={onExpand}
          className="text-muted-foreground hover:border-foreground/30 hover:text-foreground border-border rounded-md border border-dashed px-1.5 py-0.5 text-[11px] leading-[16px] tabular-nums transition-colors"
        >
          +{values.length - limit}
        </button>
      ) : null}
    </div>
  )
}
