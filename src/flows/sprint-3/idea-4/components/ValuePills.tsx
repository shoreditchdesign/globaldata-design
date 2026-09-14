"use client"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

function Tag({ value, muted }: { value: string; muted?: boolean }) {
  return (
    <span
      title={value}
      className={cn(
        "bg-muted min-w-0 truncate rounded-md px-1.5 text-xs leading-5",
        muted ? "text-muted-foreground" : "text-foreground",
      )}
    >
      {value}
    </span>
  )
}

/**
 * A multi-valued cell. The whole point of this direction: a drug with nine
 * indications is still one row. Values render as tags on one line, capped at
 * `limit`, with a `+N` that opens every value in a popover — so the row never
 * grows and the columns never lose alignment, instead of the live product's
 * merged rows, where the same drug becomes nine table rows.
 */
export function ValuePills({
  label,
  values,
  limit,
  muted = false,
}: {
  /** Column label, for the popover heading. */
  label: string
  values: string[]
  limit: number
  /** Secondary lanes sit back a step so the primary ones read first. */
  muted?: boolean
}) {
  const capped = values.length > limit
  const shown = capped ? values.slice(0, limit) : values

  return (
    <div className="flex min-w-0 items-center gap-1 overflow-hidden">
      {shown.map((value, i) => (
        <Tag key={`${value}-${i}`} value={value} muted={muted} />
      ))}
      {capped ? (
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label={`All ${values.length} values for ${label}`}
              className="text-muted-foreground hover:text-foreground hover:bg-accent border-border data-[state=open]:bg-accent data-[state=open]:text-foreground shrink-0 rounded-md border border-dashed px-1.5 text-xs leading-[18px] tabular-nums transition-colors"
            >
              +{values.length - limit}
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-72 gap-2 p-3">
            <p className="flex items-baseline justify-between gap-2 text-sm font-medium">
              {label}
              <span className="text-muted-foreground font-normal tabular-nums">{values.length}</span>
            </p>
            <div className="flex flex-wrap gap-1">
              {values.map((value, i) => (
                <Tag key={`${value}-${i}`} value={value} muted={muted} />
              ))}
            </div>
          </PopoverContent>
        </Popover>
      ) : null}
    </div>
  )
}
