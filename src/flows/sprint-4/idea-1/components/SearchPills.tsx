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
 * Pressing one starts its clause in the filter box and opens that clause's own
 * value selector. Nothing opens under the pills: the filter is the thing being
 * built, so it is the thing that should be under the cursor while the value is
 * chosen, and a pill whose clause is already in the box reopens it rather than
 * starting a second one.
 */
export function SearchPills({
  layout,
  filters,
  onStartFilter,
}: {
  layout: "centered" | "panel"
  /** The filters in the box, however they were built, counted onto the pills. */
  filters: ResolvedFilter[]
  onStartFilter: (area: ProductArea, attribute: string) => void
}) {
  const centred = layout === "centered"
  const headType = "text-[10px] font-medium tracking-[0.08em] uppercase"
  const applied = (area: ProductArea, attribute: string) =>
    filters.find((filter) => filter.id === filterIdFor(area, attribute))

  return (
    <div className="w-full">
      {/*
        Centred, the head sits outside the pills rather than among them: it is
        one side of the row, the pills take the middle, and a copy of the head
        holds the other side open. Without that copy the pills would centre on
        the space the head leaves rather than on the row, and sit visibly right
        of the search above them. In the panel there is no room beside a 316px
        column, so the head goes over the pills instead.
      */}
      <div className={cn("flex items-start gap-2", centred ? "justify-center" : "flex-col")}>
        <h2
          id="common-filters"
          className={cn("text-muted-foreground flex h-8 shrink-0 items-center", headType)}
        >
          Commonly used filters
        </h2>
        <nav
          aria-labelledby="common-filters"
          className={cn(
            "flex flex-wrap items-center gap-2",
            centred ? "flex-1 justify-center" : "justify-start",
          )}
        >
          {commonAttributes.map(({ area, attribute }) => {
            const filter = applied(area, attribute)

            return (
              <button
                key={`${area}/${attribute}`}
                type="button"
                onClick={() => onStartFilter(area, attribute)}
                className={cn(
                  "bg-surface-panel border-border hover:bg-accent inline-flex h-8 items-center rounded-full border px-3.5 text-[13px] transition-[color,background-color,border-color]",
                  filter &&
                    "bg-foreground text-background border-foreground hover:bg-foreground/90",
                )}
              >
                {attribute}
                <FilterCount count={filter?.values.length ?? 0} inverted={Boolean(filter)} />
              </button>
            )
          })}
        </nav>
        {centred ? (
          <span aria-hidden className={cn("invisible h-8 shrink-0", headType)}>
            Commonly used filters
          </span>
        ) : null}
      </div>
    </div>
  )
}

/**
 * A small count on a pill: how many values its clause holds.
 *
 * The slot is there whether or not there is a count in it. A pill that widens
 * when its first value lands can push the pill after it onto the next line, and
 * the row rewraps under the cursor — so every pill carries the space for a
 * count from the start and none of them change width when one arrives.
 */
function FilterCount({
  count,
  inverted,
}: {
  count: number
  /** On a started clause's dark fill, the count takes a dark treatment of its own. */
  inverted: boolean
}) {
  const empty = count === 0
  return (
    <span
      aria-hidden={empty}
      aria-label={empty ? undefined : `${count} value${count === 1 ? "" : "s"} applied`}
      className={cn(
        "ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] leading-none font-medium tabular-nums",
        empty && "invisible",
        !empty && (inverted ? "bg-background/20 text-background" : "bg-brand-tint text-brand-ink"),
      )}
    >
      {count}
    </span>
  )
}
