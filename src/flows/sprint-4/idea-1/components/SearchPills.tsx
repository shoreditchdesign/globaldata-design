import { CheckIcon } from "lucide-react"

import type { ProductArea } from "@/components/prototype/ProductChrome"
import {
  commonAttributes,
  pathOf,
  searchAttributeValues,
  type ResolvedFilter,
} from "@/flows/sprint-4/idea-1/data"
import { cn } from "@/lib/utils"

/**
 * The commonly used filters, and the values under whichever one is open.
 *
 * The search areas used to head this as a layer of their own, with an area's
 * attributes beneath it. That made every filter a three-step walk through a
 * tree the reader had to already know. The attributes people actually reach for
 * are a short list, so they are the list — ten of them, taken from across the
 * areas rather than under any one of them, which is why no area pill heads them
 * and why opening one shows its values and nothing else.
 */
export function SearchPills({
  filters,
  activeCategory,
  activeAttribute,
  onAttributeOpen,
  onValuePick,
}: {
  /** The filters in the box, however they were built, counted onto the pills. */
  filters: ResolvedFilter[]
  activeCategory: ProductArea | null
  activeAttribute: string | null
  onAttributeOpen: (area: ProductArea, attribute: string) => void
  onValuePick: (value: string) => void
}) {
  const paths = filters.map((filter) => ({ ...pathOf(filter.id), values: filter.values.length }))
  // A pill counts the values its filter holds.
  const attributeCount = (area: ProductArea, attribute: string) =>
    paths.find((path) => path.area === area && path.attribute === attribute)?.values ?? 0
  const openFilter = filters.find((filter) => {
    const path = pathOf(filter.id)
    return path.area === activeCategory && path.attribute === activeAttribute
  })

  return (
    <div className="w-full">
      <h2 className="text-muted-foreground text-[10px] font-medium tracking-[0.08em] uppercase">
        Commonly used filters
      </h2>

      <nav aria-label="Commonly used filters" className="mt-2 flex flex-wrap gap-2">
        {commonAttributes.map(({ area, attribute }) => {
          const active = activeCategory === area && activeAttribute === attribute
          const inactive = activeAttribute !== null && !active

          return (
            <button
              key={`${area}/${attribute}`}
              type="button"
              aria-expanded={active}
              aria-controls={`search-attribute-${slugify(attribute)}`}
              onClick={() => onAttributeOpen(area, attribute)}
              className={cn(
                "bg-surface-panel border-border hover:bg-accent inline-flex h-8 items-center rounded-full border px-3.5 text-[13px] transition-[color,background-color,border-color,opacity]",
                active && "bg-foreground text-background border-foreground hover:bg-foreground/90",
                inactive && "opacity-35 hover:opacity-70",
              )}
            >
              {attribute}
              <FilterCount count={attributeCount(area, attribute)} noun="value" inverted={active} />
            </button>
          )
        })}
      </nav>

      {/*
        The values cascade straight under the pill that opened them. On the
        landing page the search is held still by the well the pills sit over, so
        these take only the room they need and the page scrolls only once they
        outgrow it.
      */}
      {activeCategory && activeAttribute ? (
        <nav
          key={`${activeCategory}/${activeAttribute}`}
          id={`search-attribute-${slugify(activeAttribute)}`}
          aria-label={`${activeAttribute} values`}
          className="animate-in fade-in slide-in-from-top-2 mt-4 flex flex-wrap gap-2 duration-300"
        >
          {searchAttributeValues(activeCategory, activeAttribute).map((value) => {
            const selected = Boolean(openFilter?.values.includes(value))
            // A value its filter excludes keeps the negation tone, so it never
            // reads as included.
            const excluded = selected && openFilter?.excluded

            return (
              <button
                key={value}
                type="button"
                aria-pressed={selected}
                onClick={() => onValuePick(value)}
                className={cn(
                  "border-border text-foreground inline-flex min-h-8 items-center gap-1.5 rounded-full border py-1.5 text-[13px] transition-colors",
                  selected ? "pr-3.5 pl-2.5" : "px-3.5",
                  !selected && "bg-surface-panel hover:bg-accent",
                  selected && !excluded && "bg-brand-tint border-brand-border hover:bg-brand-border/60",
                  excluded && "bg-negative border-negative-border text-negative-ink",
                )}
              >
                {selected ? <CheckIcon className="size-3.5 shrink-0" aria-hidden /> : null}
                {value}
              </button>
            )
          })}
        </nav>
      ) : null}
    </div>
  )
}

/** A small count on a pill: how much of the filter box sits under it. */
function FilterCount({
  count,
  noun,
  inverted,
}: {
  count: number
  noun: string
  /** On a selected pill's dark fill, the count takes a dark treatment of its own. */
  inverted: boolean
}) {
  if (count === 0) return null
  return (
    <span
      aria-label={`${count} ${noun}${count === 1 ? "" : "s"} applied`}
      className={cn(
        "ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] leading-none font-medium tabular-nums",
        inverted ? "bg-background/20 text-background" : "bg-brand-tint text-brand-ink",
      )}
    >
      {count}
    </span>
  )
}

function slugify(label: string) {
  return label.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-")
}
