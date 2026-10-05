"use client"

import * as React from "react"
import { ChevronDownIcon, PlusIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  type FilterId,
  type FilterJoin,
  type FilterLink,
  type ResolvedFilter,
} from "@/flows/sprint-4/idea-1c/data"
import { cn } from "@/lib/utils"

/**
 * How many lines of filters the results band shows before the rest fold into a
 * count. Three is where a band stops being a strip above the table and starts
 * being a panel the table has to live under.
 */
const MAX_LINES = 3

/**
 * How many of `count` filters fit in `MAX_LINES` lines of the band.
 *
 * Chips are as wide as the words in them, so how many fit is a question only
 * the layout can answer: the row renders them all, this reads where each one
 * landed, and the ones past the third line come back out. Measured in a layout
 * effect, so the clamp happens before the browser paints and the full row is
 * never seen. The row is re-measured from scratch whenever the filters or the
 * width change — clamping throws away the evidence for how many would fit if
 * there were more room, so it cannot be worked out incrementally.
 */
function useLineClamp(
  rowRef: React.RefObject<HTMLDivElement | null>,
  count: number,
  key: string,
  enabled: boolean,
  /**
   * Held still while the panel of folded filters is open. Re-measuring means
   * rendering every chip for a frame to see where they land, which takes the
   * count out of the row and the panel down with it — and a row that reflows
   * while it is being edited from the panel would pull filters back onto the
   * line under the hand doing the editing. It settles when the panel closes.
   */
  frozen: boolean,
) {
  const [state, setState] = React.useState({ key, visible: count })

  // Back to showing everything, then measured again below. Adjusted during
  // render rather than in an effect so nothing paints the stale clamp first.
  if (!frozen && state.key !== key) setState({ key, visible: count })

  React.useLayoutEffect(() => {
    const row = rowRef.current
    if (!enabled || frozen || !row) return
    const chips = Array.from(row.querySelectorAll<HTMLElement>("[data-filter-chip]"))
    if (chips.length === 0) return

    // A line is a cluster of chips sharing a top edge, within half a chip's
    // height — the row centres items of unequal height, so the tops of two
    // chips on one line are close rather than equal.
    const tolerance = chips[0].offsetHeight / 2
    const tops = chips.map((chip) => chip.offsetTop).sort((a, b) => a - b)
    const lines = tops.filter((top, index) => index === 0 || top - tops[index - 1] > tolerance)
    const overflow = row.querySelector<HTMLElement>("[data-filter-overflow]")
    if (lines.length <= MAX_LINES && !overflow) return

    const lastLine = lines[Math.min(MAX_LINES, lines.length) - 1]
    let fit = chips.filter((chip) => chip.offsetTop <= lastLine + tolerance).length
    // The count itself sits on the end of the last line and has to fit there
    // too; where it does not, the chip it was put after comes out.
    if (overflow && overflow.offsetTop > lastLine + tolerance) fit -= 1
    // One chip always stays, so the band never reads as a bare count.
    fit = Math.max(1, fit)
    if (fit !== state.visible) setState((current) => ({ ...current, visible: fit }))
    // `state` is the dependency that makes this converge: the reset above and
    // each clamp below re-run the measurement, and a measurement that agrees
    // with what is on screen sets nothing and stops the chain.
  }, [rowRef, enabled, frozen, state])

  return enabled ? state.visible : count
}

export function ResolvedFilters({
  filters,
  resultCount,
  onModeChange,
  onJoinChange,
  onLinkChange,
  onEditValues,
  onRemove,
  onAddFilter,
  onClear,
  onSearch,
  onClose,
  variant = "card",
}: {
  filters: ResolvedFilter[]
  resultCount: number
  onModeChange: (id: FilterId, excluded: boolean) => void
  onJoinChange: (id: FilterId, join: FilterJoin) => void
  onLinkChange: (id: FilterId, link: FilterLink) => void
  onEditValues: (id: FilterId) => void
  onRemove: (id: FilterId) => void
  /** Add filter opens Advanced search's columns, at Drugs. */
  onAddFilter: () => void
  onClear: () => void
  /** Runs the search from the landing page. Omitted where results already follow the filters. */
  onSearch?: () => void
  /** Clears the filters and closes the box. Omitted where the box is always shown. */
  onClose?: () => void
  /**
   * `card` on the landing page, with Add filter and the search in a footer.
   * `band` on the results page: a flush strip whose actions, add and clear,
   * sit at the end of the filters themselves.
   */
  variant?: "card" | "band"
}) {
  const band = variant === "band"

  const rowRef = React.useRef<HTMLDivElement>(null)
  // Held here rather than inside the count's own popover, so that editing a
  // filter from the panel — which re-renders this row — cannot close it.
  const [foldedOpen, setFoldedOpen] = React.useState(false)
  // What a re-measure depends on: the chips themselves, and the room they have.
  // Their widths follow the labels and values in them, so both go in the key.
  const [rowWidth, setRowWidth] = React.useState(0)
  const clampKey = `${rowWidth}|${filters
    .map((filter) => `${filter.id}:${filter.values.join(",")}:${filter.excluded}:${filter.link}`)
    .join("|")}`
  const visible = useLineClamp(rowRef, filters.length, clampKey, band, foldedOpen)

  React.useLayoutEffect(() => {
    const row = rowRef.current
    if (!band || !row) return
    const observer = new ResizeObserver(([entry]) => setRowWidth(entry.contentRect.width))
    observer.observe(row)
    return () => observer.disconnect()
  }, [band])

  const shown = filters.slice(0, visible)
  const folded = filters.slice(visible)

  // Taking the last folded filter out leaves the panel with nothing to show and
  // no count to hang off, so it closes itself — and unfreezes the clamp on the
  // way. Adjusted during render, like the clamp above, so the row never paints
  // holding a panel that has nothing in it. While the panel is open the clamp
  // is frozen, so an empty list here is the real end of it rather than a row
  // caught mid-measurement.
  if (foldedOpen && folded.length === 0) setFoldedOpen(false)

  return (
    <div
      className={cn(
        "relative w-full p-4",
        band ? "bg-surface-chrome" : "bg-surface-panel border-border rounded-xl border",
      )}
    >
      {onClose ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={onClose}
          aria-label="Close and clear filters"
          className="text-muted-foreground absolute top-2 right-2"
        >
          <XIcon />
        </Button>
      ) : null}
      <div className="flex items-start gap-4">
        <div
          ref={rowRef}
          className={cn("flex min-h-10 min-w-0 flex-1 flex-wrap items-center gap-2", onClose && "pr-6")}
        >
          {filters.length === 0 ? (
            <p className="text-muted-foreground text-[13px]">No filters selected</p>
          ) : null}

          {shown.map((filter, index) => (
            <div key={filter.id} className="contents">
              {index > 0 ? (
                <FilterLinkControl
                  filter={filter}
                  onChange={(link) => onLinkChange(filter.id, link)}
                />
              ) : null}
              <FilterClause
                filter={filter}
                onModeChange={onModeChange}
                onJoinChange={onJoinChange}
                onEditValues={onEditValues}
                onRemove={onRemove}
              />
            </div>
          ))}

          {folded.length > 0 ? (
            <FoldedFilters
              filters={folded}
              open={foldedOpen}
              onOpenChange={setFoldedOpen}
              onModeChange={onModeChange}
              onJoinChange={onJoinChange}
              onLinkChange={onLinkChange}
              onEditValues={onEditValues}
              onRemove={onRemove}
            />
          ) : null}

          {/* Add filter is the end of the row of filters in both variants: it adds
              one to the line it sits on, which is a thing to say beside them
              rather than an errand in a footer. Clearing is the footer's on the
              landing card, and the far end of the bar on the results page. */}
          <span className="ml-1 flex items-center gap-2">
            {/* Labelled rather than a bare plus: an icon on its own read as too
                quiet to be found at the end of a row of chips. Outline, so it
                rests and hovers the way the commonly used filters do. It opens
                Advanced search's columns at Drugs rather than a cascade of its
                own, so there is one place to build a filter by hand. The
                cascade (AddFilterCascade) is kept, not rendered. */}
            <Button variant="outline" size="sm" onClick={onAddFilter}>
              <PlusIcon />
              Add filter
            </Button>
          </span>
        </div>
        {/* Clearing sits apart from the filters, at the far end of the bar, as
            a link: it acts on all of them rather than adding to the row. */}
        {band && filters.length > 0 ? (
          <Button
            variant="link"
            size="sm"
            onClick={onClear}
            className="text-brand-ink mt-1.5 shrink-0 px-0"
          >
            Clear filters
          </Button>
        ) : null}
      </div>

      {band ? null : (
        <div className="border-hairline mt-4 flex items-center justify-end gap-4 border-t pt-4">
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="default"
              onClick={onClear}
              disabled={filters.length === 0}
            >
              Clear filters
            </Button>
            {onSearch ? (
              <Button type="button" size="default" className="shrink-0 tabular-nums" onClick={onSearch}>
                Search for {resultCount.toLocaleString("en-GB")} drugs
              </Button>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * The filters past the third line, behind the count that stands in for them.
 *
 * They keep their own link words and their own controls, so a filter that has
 * been folded away is still the filter it was — editable, removable, and
 * reading as part of the same query rather than a summary of one. One of them
 * being taken out puts the next one back on the line it came off.
 */
function FoldedFilters({
  filters,
  open,
  onOpenChange,
  onModeChange,
  onJoinChange,
  onLinkChange,
  onEditValues,
  onRemove,
}: {
  filters: ResolvedFilter[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onModeChange: (id: FilterId, excluded: boolean) => void
  onJoinChange: (id: FilterId, join: FilterJoin) => void
  onLinkChange: (id: FilterId, link: FilterLink) => void
  onEditValues: (id: FilterId) => void
  onRemove: (id: FilterId) => void
}) {
  return (
    // Clicking away and Escape close it, as they close any popover. What must
    // not close it is working in it, which is what the rest of this is for.
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          data-filter-overflow
          variant="secondary"
          size="sm"
          aria-label={`Show ${filters.length} more ${filters.length === 1 ? "filter" : "filters"}`}
          className="tabular-nums"
        >
          +{filters.length}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        collisionPadding={16}
        // Sized by what is in it: a clause holding five values is a wide chip,
        // and a fixed width would squeeze it into truncation while the panel
        // sat half empty for the clause holding one. The ceiling is the room
        // the popover actually has beside the trigger, which Radix measures —
        // past that the clauses truncate as they do on the line.
        className="relative w-auto max-w-[var(--radix-popover-content-available-width)] gap-0 p-3"
      >
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={() => onOpenChange(false)}
          aria-label="Close"
          className="text-muted-foreground absolute top-2 right-2"
        >
          <XIcon />
        </Button>
        {/* The rows clear the close button rather than running under it. */}
        <div className="flex flex-col gap-2 pr-7">
          {filters.map((filter) => (
            <div key={filter.id} className="flex items-center gap-2">
              <FilterLinkControl
                filter={filter}
                onChange={(link) => onLinkChange(filter.id, link)}
              />
              <FilterClause
                filter={filter}
                onModeChange={onModeChange}
                onJoinChange={onJoinChange}
                onEditValues={onEditValues}
                onRemove={onRemove}
              />
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function FilterLinkControl({
  filter,
  onChange,
}: {
  filter: ResolvedFilter
  onChange: (link: FilterLink) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Combine ${filter.label} with the previous filter using ${filter.link}`}
        className="text-muted-foreground hover:bg-accent hover:text-foreground flex h-7 items-center gap-1 rounded-md px-1.5 text-[11px] font-medium uppercase transition-colors"
      >
        {filter.link}
        <ChevronDownIcon className="size-3" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-36">
        <DropdownMenuRadioGroup
          value={filter.link}
          onValueChange={(value) => onChange(value as FilterLink)}
        >
          <DropdownMenuRadioItem value="and">AND</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="or">OR</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function FilterClause({
  filter,
  onModeChange,
  onJoinChange,
  onEditValues,
  onRemove,
}: {
  filter: ResolvedFilter
  onModeChange: (id: FilterId, excluded: boolean) => void
  onJoinChange: (id: FilterId, join: FilterJoin) => void
  onEditValues: (id: FilterId) => void
  onRemove: (id: FilterId) => void
}) {
  return (
    <div
      // What the band counts when it works out how many lines the filters run
      // to. The link word before it has no box of its own to measure.
      data-filter-chip
      className={cn(
        "flex min-h-8 max-w-full items-center rounded-lg border text-[12px]",
        filter.excluded
          ? "bg-negative border-negative-border text-negative-ink"
          : "bg-surface-sunken border-border text-foreground",
      )}
    >
      <span className="shrink-0 border-r border-current/10 px-2.5 py-1.5 font-medium">
        {filter.label}
      </span>

      <DropdownMenu>
        <DropdownMenuTrigger className="hover:bg-foreground/5 flex shrink-0 items-center gap-1 border-r border-current/10 px-2 py-1.5 transition-colors">
          {filter.excluded ? "IS NOT" : "IS"}
          <ChevronDownIcon className="size-3" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-32">
          <DropdownMenuRadioGroup
            value={filter.excluded ? "is-not" : "is"}
            onValueChange={(value) => onModeChange(filter.id, value === "is-not")}
          >
            <DropdownMenuRadioItem value="is">is</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="is-not">is not</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Select value stands in the first value's slot rather than beside it, and
          that slot keeps its key once a value lands in it. Ticking the first
          value would otherwise swap the trigger under the open list and take
          the list down with it, which is no way to pick a second. */}
      {(filter.values.length > 0 ? filter.values : [null]).map((value, index) => (
        <div key={index === 0 ? "first" : value} className="contents">
          {index > 0 ? (
            <ValueJoinControl
              filter={filter}
              onChange={(join) => onJoinChange(filter.id, join)}
            />
          ) : null}
          <ValueMenu
            filter={filter}
            onEditValues={onEditValues}
            className={cn(
              value === null && "text-muted-foreground",
              value !== null && index < filter.values.length - 1
                ? "border-r-0"
                : "border-r border-current/10",
            )}
          >
            {value === null ? "Select value" : <span className="max-w-64 truncate">{value}</span>}
          </ValueMenu>
        </div>
      ))}

      <button
        type="button"
        onClick={() => onRemove(filter.id)}
        aria-label={`Remove ${filter.label} filter`}
        className="hover:bg-foreground/5 mr-1 flex size-6 shrink-0 items-center justify-center rounded-md transition-colors"
      >
        <XIcon className="size-3" />
      </button>
    </div>
  )
}

/**
 * One value of a clause. Pressing it no longer drops a checklist under the
 * chip: it opens Advanced search's columns in the panel at this clause's
 * attribute, its values ticked, so values are picked in the one place a
 * filter is built by hand — the same thing a column's Edit filters does.
 */
function ValueMenu({
  filter,
  onEditValues,
  className,
  children,
}: {
  filter: ResolvedFilter
  onEditValues: (id: FilterId) => void
  className?: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={() => onEditValues(filter.id)}
      aria-label={`Choose ${filter.label} in Advanced search`}
      className={cn(
        "hover:bg-foreground/5 flex min-w-0 items-center gap-1.5 px-2.5 py-1.5 text-left transition-colors",
        className,
      )}
    >
      {children}
      <ChevronDownIcon className="size-3 shrink-0" />
    </button>
  )
}

function ValueJoinControl({
  filter,
  onChange,
}: {
  filter: ResolvedFilter
  onChange: (join: FilterJoin) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Match ${filter.label} values using ${filter.join}`}
        className="hover:bg-foreground/5 flex shrink-0 items-center gap-1 border-x border-current/10 px-2 py-1.5 transition-colors"
      >
        {filter.join.toUpperCase()}
        <ChevronDownIcon className="size-3" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-44">
        <DropdownMenuRadioGroup
          value={filter.join}
          onValueChange={(value) => onChange(value as FilterJoin)}
        >
          <DropdownMenuRadioItem value="and">AND — every value</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="or">OR — any value</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
