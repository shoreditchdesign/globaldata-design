import type { ProductArea } from "@/components/prototype/ProductChrome"
import {
  commonAttributes,
  filterIdFor,
  type ResolvedFilter,
} from "@/flows/sprint-4/idea-1c/data"
import { cn } from "@/lib/utils"

/** What the pills are labelled by, wherever their heading is drawn. */
export const commonFiltersId = "common-filters"

/**
 * The commonly used filters.
 *
 * The search areas headed these as a layer of their own, with an area's
 * attributes beneath it and that attribute's values beneath those, so every
 * filter was a three-step walk down a tree the reader had to already know. The
 * attributes people reach for are a short list, so they are the list — ten of
 * them, taken from across the areas rather than under any one.
 *
 * Pressing one puts its clause in the filter box, waiting for a value, and
 * pressing it again takes the clause out. Nothing opens under the pills: the
 * filter is the thing being built, so the value is chosen from the clause's own
 * selector, when the reader is ready, rather than from a further layer here.
 */
export function SearchPills({
  layout,
  filters,
  onToggleFilter,
  heading = true,
}: {
  layout: "centered" | "panel"
  /**
   * Whether the pills name themselves. The results panel names them in its own
   * header row instead, giving the heading the id the pills are labelled by.
   */
  heading?: boolean
  /** The filters in the box, however they were built, counted onto the pills. */
  filters: ResolvedFilter[]
  onToggleFilter: (area: ProductArea, attribute: string) => void
}) {
  const centred = layout === "centered"
  const headType = "text-[10px] font-medium tracking-[0.08em] uppercase"
  const applied = (area: ProductArea, attribute: string) =>
    filters.find((filter) => filter.id === filterIdFor(area, attribute))

  const head = (
    <h2
      id={commonFiltersId}
      className={cn("text-muted-foreground/70", headType, centred && "text-center")}
    >
      Commonly used filters
    </h2>
  )

  const pills = commonAttributes.map(({ area, attribute }) => {
    const filter = applied(area, attribute)

    return (
      <button
        key={`${area}/${attribute}`}
        type="button"
        aria-pressed={Boolean(filter)}
        onClick={() => onToggleFilter(area, attribute)}
        className={cn(
          "bg-surface-panel border-border hover:bg-surface-sunken inline-flex h-8 items-center rounded-full border px-3.5 text-[13px] transition-[color,background-color,border-color]",
          // Three states: white, then a hover a clear step darker (sunken, so
          // it never blends into the grey behind the pills), then selected —
          // the blue wash with a doubled brand stroke (border plus a 1px ring,
          // so the pill doesn't change size), so a pill that is on reads at a
          // glance.
          //
          // The wash is also what the system reserves for a selection that is
          // not a checked control. Solid brand is the arrow in the search
          // field and a checked Advanced switch; the pills are a step under
          // both, which is the order they should be read in.
          filter &&
            "bg-brand-tint border-brand ring-brand text-foreground ring-1 hover:bg-brand-tint hover:border-brand-strong hover:ring-brand-strong",
        )}
      >
        {attribute}
        <FilterCount count={filter?.values.length ?? 0} selected={Boolean(filter)} />
      </button>
    )
  })

  // The head names the group from above it, so the pills have the row to
  // themselves and centre on it — centred under the landing search, left-aligned
  // down the results panel.
  return (
    <div className="flex w-full flex-col gap-2">
      {heading ? head : null}
      <nav
        aria-labelledby={commonFiltersId}
        className={cn(
          "flex flex-wrap items-center gap-2",
          centred ? "justify-center" : "justify-start",
        )}
      >
        {pills}
      </nav>
    </div>
  )
}

/**
 * How many values a pill's clause holds, as plain text after the name:
 * "Development Stage (2)". No badge — the number is part of the label. It
 * takes the pill's own edge family as its colour, darkened to text strength:
 * brand-ink on a pill that is on (brand-border is too pale to read), and
 * muted-foreground on one that is off.
 */
function FilterCount({ count, selected }: { count: number; selected: boolean }) {
  if (count === 0) return null
  return (
    <span
      aria-label={`${count} value${count === 1 ? "" : "s"} applied`}
      className={cn(
        "ml-1 font-medium tabular-nums",
        selected ? "text-brand-ink" : "text-muted-foreground",
      )}
    >
      ({count})
    </span>
  )
}
