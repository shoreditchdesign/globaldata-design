import type { ProductArea } from "@/components/prototype/ProductChrome"
import {
  commonAttributes,
  filterIdFor,
  type ResolvedFilter,
} from "@/flows/sprint-4/idea-1/data"
import { cn } from "@/lib/utils"

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
}: {
  layout: "centered" | "panel"
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
      id="common-filters"
      className={cn("text-muted-foreground/70 flex h-8 shrink-0 items-center", headType)}
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
          "bg-surface-panel border-border hover:bg-accent inline-flex h-8 items-center rounded-full border px-3.5 text-[13px] transition-[color,background-color,border-color]",
          filter && "bg-foreground text-background border-foreground hover:bg-foreground/90",
        )}
      >
        {attribute}
        <FilterCount count={filter?.values.length ?? 0} inverted={Boolean(filter)} />
      </button>
    )
  })

  /*
    Centred, the head runs in the row beside the first pill, and a copy of it
    closes the row. The copy is what keeps the pills centred: without it they
    would centre on what is left of the row after the head and sit visibly right
    of the search above them. In the panel there is no room beside a 316px
    column, so the head goes over the pills instead.
  */
  if (centred) {
    return (
      <nav
        aria-labelledby="common-filters"
        className="flex w-full flex-wrap items-center justify-center gap-2"
      >
        {head}
        {pills}
        <span aria-hidden className={cn("invisible h-8 shrink-0", headType)}>
          Commonly used filters
        </span>
      </nav>
    )
  }

  return (
    <div className="flex w-full flex-col gap-1">
      {head}
      <nav aria-labelledby="common-filters" className="flex flex-wrap items-center gap-2">
        {pills}
      </nav>
    </div>
  )
}

/** A small count on a pill: how many values its clause holds. */
function FilterCount({
  count,
  inverted,
}: {
  count: number
  /** On a started clause's dark fill, the count takes a dark treatment of its own. */
  inverted: boolean
}) {
  if (count === 0) return null
  return (
    <span
      aria-label={`${count} value${count === 1 ? "" : "s"} applied`}
      className={cn(
        "ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] leading-none font-medium tabular-nums",
        inverted ? "bg-background/20 text-background" : "bg-brand-tint text-brand-ink",
      )}
    >
      {count}
    </span>
  )
}
