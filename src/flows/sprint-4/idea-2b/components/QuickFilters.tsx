"use client"

import * as React from "react"
import { ChevronDownIcon, SearchIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { TickBox } from "@/flows/sprint-4/idea-2b/components/TickBox"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { excludeModifier, useExcludeModifierLabel } from "@/flows/sprint-4/idea-2b/modifier"
import {
  childrenByValue,
  facetCounts,
  valuesByAttribute,
  type Condition,
} from "@/flows/sprint-4/idea-2b/data"

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

/**
 * The five the bar carries, in the product's own order.
 *
 * Eight was the whole of the pairing analysis, which made the bar a second
 * filter panel. Five is the ones people reach for first, and the rest of the
 * taxonomy is a click away in the tree.
 */
const quickAttributes = [
  "Therapy Area / Indication",
  "Development Stage",
  "Drug Geography",
  "Molecule Type",
  "Route of Administration",
]

export function QuickFilters({
  conditions,
  picks,
  drops,
  onPick,
  pinned,
  onPinnedChange,
  className,
}: {
  /** The query as it stands, so a chip shows what is already in it. */
  conditions: Condition[]
  /** What has been ticked into the line in the box but not resolved yet. */
  picks: Record<string, string[]>
  /** Which ticked values are exclusions, before they are resolved. */
  drops: Record<string, string[]>
  onPick: (attribute: string, values: string[], dropped: string[]) => void
  /**
   * The one dropdown a frame is holding open. A popover that shuts the moment
   * the pointer leaves cannot be captured, and these screens are reviewed as
   * screenshots as much as in the browser.
   */
  pinned?: string | null
  onPinnedChange?: (attribute: string | null) => void
  className?: string
}) {
  const held = React.useMemo(() => {
    const values: Record<string, string[]> = {}
    for (const condition of conditions) {
      values[condition.attribute] = [...(values[condition.attribute] ?? []), ...condition.values]
    }
    return values
  }, [conditions])

  /** Which of an attribute's values the query drops rather than keeps. */
  const dropped = React.useMemo(() => {
    const values: Record<string, string[]> = {}
    for (const condition of conditions) {
      if (condition.mode !== "is not") continue
      values[condition.attribute] = [...(values[condition.attribute] ?? []), ...condition.values]
    }
    return values
  }, [conditions])

  // A chip shows what is being built, and falls back to what the query already
  // holds, so the bar never contradicts the sentence above it.
  const shownFor = (attribute: string) => picks[attribute] ?? held[attribute] ?? []
  const droppedFor = (attribute: string) => drops[attribute] ?? dropped[attribute] ?? []
  const total = quickAttributes.reduce((sum, attribute) => sum + shownFor(attribute).length, 0)
  const modifierLabel = useExcludeModifierLabel()

  return (
    <div className={cn("flex flex-wrap items-center gap-x-2 gap-y-1.5", className)}>
      <span className="text-muted-foreground mr-1 text-[10px] font-medium tracking-[0.08em] uppercase">
        Commonly used filters
      </span>
      {quickAttributes.map((attribute) => (
        <FilterChip
          key={attribute}
          attribute={attribute}
          conditions={conditions}
          dropped={droppedFor(attribute)}
          values={shownFor(attribute)}
          onPick={(values, droppedValues) => onPick(attribute, values, droppedValues)}
          pinned={pinned === attribute}
          onOpenChange={(open) => onPinnedChange?.(open ? attribute : null)}
        />
      ))}
      {total > 0 ? (
        // Pushed to the far end of the rail, so the chips read as one run and
        // the count is not mistaken for another of them.
        <span className="text-muted-foreground ml-auto pl-2 text-xs">
          <span className="tabular-nums">
            {total} {total === 1 ? "filter" : "filters"}
          </span>
          <span className="text-muted-foreground/70"> · {modifierLabel}</span>
        </span>
      ) : null}
    </div>
  )
}

function FilterChip({
  attribute,
  conditions,
  values,
  dropped,
  onPick,
  pinned,
  onOpenChange,
}: {
  attribute: string
  conditions: Condition[]
  /** Which of this attribute's values the query drops rather than keeps. */
  dropped: string[]
  /** This attribute's values, whether ticked here or already in the query. */
  values: string[]
  onPick: (values: string[], dropped: string[]) => void
  /** Held open by the frame, so a screenshot can catch it. */
  pinned?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  // The chip holds its own open state so the popover can close the way any
  // popover does, and a frame can still hold one open by naming it.
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

  // Read on the way down, since the change event drops the modifier — the same
  // gesture the explorer uses, so one thing means exclude wherever a box is
  // ticked.
  const altDown = React.useRef(false)

  const tick = (value: string) => {
    const on = values.includes(value)
    const nextValues = on ? values.filter((entry) => entry !== value) : [...values, value]
    const nextDropped = on
      ? dropped.filter((entry) => entry !== value)
      : altDown.current
        ? [...dropped, value]
        : dropped.filter((entry) => entry !== value)
    onPick(nextValues, nextDropped)
  }

  return (
    <Popover
      open={open || Boolean(pinned)}
      onOpenChange={(next) => {
        setOpen(next)
        onOpenChange?.(next)
        if (!next) setSearch("")
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-7 cursor-pointer items-center gap-1.5 rounded-md border px-2 text-xs font-medium transition-colors",
            // A chip holding values is the thing you pressed and it is on, so it
            // takes the primary fill rather than a tint with a badge on it. An
            // excluding chip takes the washed negation instead: solid red beside
            // solid blue was two strong colours arguing across one rail.
            values.length > 0 && dropped.length === values.length
              ? "bg-negative border-negative-border text-negative-ink hover:border-negative-ink/40"
              : values.length > 0
              ? "bg-brand border-brand text-primary-foreground hover:bg-brand-strong hover:border-brand-strong"
              : "bg-surface-panel border-border text-muted-foreground hover:text-foreground hover:border-edge",
          )}
        >
          {attribute}
          {values.length > 0 ? <span className="tabular-nums">({values.length})</span> : null}
          <ChevronDownIcon className="size-3.5 opacity-70" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-[300px] p-0"
      >
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
                <TickBox
                  checked={values.includes(option.label)}
                  excluded={dropped.includes(option.label)}
                  onPointerDown={(event) => (altDown.current = excludeModifier(event))}
                  onKeyDown={(event) => (altDown.current = excludeModifier(event))}
                  onCheckedChange={() => tick(option.label)}
                  className="shrink-0"
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
