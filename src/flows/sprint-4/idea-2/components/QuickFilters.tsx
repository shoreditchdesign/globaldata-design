"use client"

import * as React from "react"
import { ChevronDownIcon, SearchIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  childrenByValue,
  facetCounts,
  valuesByAttribute,
  type Condition,
} from "@/flows/sprint-4/idea-2/data"

/**
 * The quick way in, under the box: the filters people reach for first, each a
 * dropdown of counted values.
 *
 * It writes rather than applies. Every value ticked is added to the line in the
 * box, in the same words a typed query resolves to, and the query itself does
 * not move until Resolve. So the three ways in are one: this builds a sentence,
 * typing writes one directly, and the explorer ticks the same values in the
 * taxonomy.
 */

/** The eight the bar carries, in the product's own order. */
const quickAttributes = [
  "Therapy Area / Indication",
  "Development Stage",
  "Drug Geography",
  "Molecule Type",
  "Route of Administration",
  "Drug Descriptor",
  "Mechanism of Action",
  "Target",
]

export function QuickFilters({
  conditions,
  picks,
  onPick,
  className,
}: {
  /** The query as it stands, so a chip shows what is already in it. */
  conditions: Condition[]
  /** What has been ticked into the line in the box but not resolved yet. */
  picks: Record<string, string[]>
  onPick: (attribute: string, values: string[]) => void
  className?: string
}) {
  const held = React.useMemo(() => {
    const values: Record<string, string[]> = {}
    for (const condition of conditions) {
      values[condition.attribute] = [...(values[condition.attribute] ?? []), ...condition.values]
    }
    return values
  }, [conditions])

  // A chip shows what is being built, and falls back to what the query already
  // holds, so the bar never contradicts the sentence above it.
  const shownFor = (attribute: string) => picks[attribute] ?? held[attribute] ?? []
  const total = quickAttributes.reduce((sum, attribute) => sum + shownFor(attribute).length, 0)

  return (
    <div
      className={cn("flex flex-wrap items-center gap-1.5", className)}
    >
      {quickAttributes.map((attribute) => (
        <FilterChip
          key={attribute}
          attribute={attribute}
          conditions={conditions}
          values={shownFor(attribute)}
          onPick={(values) => onPick(attribute, values)}
        />
      ))}
      {total > 0 ? (
        <span className="text-muted-foreground text-xs tabular-nums">
          {total} {total === 1 ? "filter" : "filters"}
        </span>
      ) : null}
    </div>
  )
}

function FilterChip({
  attribute,
  conditions,
  values,
  onPick,
}: {
  attribute: string
  conditions: Condition[]
  /** This attribute's values, whether ticked here or already in the query. */
  values: string[]
  onPick: (values: string[]) => void
}) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")

  const counts = React.useMemo(
    () => facetCounts(conditions, attribute, attribute),
    [conditions, attribute],
  )

  /** Every value of the attribute, with the children of any that has them. */
  const options = React.useMemo(() => {
    const top = valuesByAttribute[attribute] ?? []
    return top.flatMap((value) => [
      { label: value.label, child: false },
      ...(childrenByValue[value.label] ?? []).map((child) => ({ label: child.label, child: true })),
    ])
  }, [attribute])

  const shown = search.trim()
    ? options.filter((option) => option.label.toLowerCase().includes(search.toLowerCase()))
    : options

  const tick = (value: string) =>
    onPick(values.includes(value) ? values.filter((entry) => entry !== value) : [...values, value])

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setSearch("")
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-7 items-center gap-1.5 rounded-md border px-2 text-xs font-medium transition-colors",
            // A chip holding values is the thing you pressed and it is on, so it
            // takes the primary fill rather than a tint with a badge on it.
            values.length > 0
              ? "bg-brand border-brand text-primary-foreground hover:bg-brand-strong hover:border-brand-strong"
              : "bg-surface-panel border-border text-muted-foreground hover:text-foreground hover:border-edge",
          )}
        >
          {attribute}
          {values.length > 0 ? <span className="tabular-nums">({values.length})</span> : null}
          <ChevronDownIcon className="size-3.5 opacity-70" />
        </button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-[300px] p-0">
        <div className="border-hairline border-b p-2">
          <div className="relative">
            <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={attribute}
              className="bg-surface-sunken h-7 pl-8 text-[13px]"
            />
          </div>
        </div>

        <div className="max-h-[280px] overflow-auto p-1">
          {shown.length === 0 ? (
            <p className="text-muted-foreground px-2 py-6 text-center text-xs">No values match that.</p>
          ) : (
            shown.map((option) => (
              <label
                key={option.label}
                className="hover:bg-accent flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-[13px]"
              >
                <Checkbox
                  checked={values.includes(option.label)}
                  onCheckedChange={() => tick(option.label)}
                  className="border-muted-foreground/50 bg-background shrink-0"
                />
                <span className={cn("min-w-0 flex-1 truncate", option.child && "text-muted-foreground pl-3")}>
                  {option.label}
                </span>
                <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                  {(counts[option.label] ?? 0).toLocaleString("en-GB")}
                </span>
              </label>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
