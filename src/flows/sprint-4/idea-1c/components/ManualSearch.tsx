"use client"

import * as React from "react"
import { ChevronRightIcon, SearchIcon } from "lucide-react"

import type { ProductArea } from "@/components/prototype/ProductChrome"
import { motion, usePrefersReducedMotion } from "@/components/prototype/motion"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { MillerColumn, type ColumnModel } from "@/flows/sprint-4/idea-1c/components/MillerColumn"
import {
  pathOf,
  searchAttributeLabels,
  searchAttributeValues,
  searchCategories,
  type ResolvedFilter,
} from "@/flows/sprint-4/idea-1c/data"
import {
  childValuesOf,
  rootValuesOf,
  valueCountOf,
} from "@/flows/sprint-4/idea-1c/results"
import { cn } from "@/lib/utils"

/**
 * Advanced search as Miller columns, after Sprint 3 Idea 2's filter panel:
 * filter area, then attribute, then values, then the values under a value as
 * far down its tree as the data goes (therapy area › indication, region ›
 * country). Three columns fit across; past that, as in Finder's column view,
 * the newest column comes in at the right edge and the earlier ones scroll off
 * to the left, where the strip or the breadcrumb brings them back. Drilling in adds a column beside
 * the last rather than replacing it, and ticking a value writes it into the
 * same filters the quick search builds. Its open path is its own, so opening
 * a column never opens the pills.
 *
 * All three levels are on screen at once wherever it sits, each a fixed third
 * filling left to right as the path deepens: across the page on the landing
 * screen, and across the narrower pane the results panel gives it. The panel is
 * sized so those thirds clear the column floor rather than making the strip
 * scroll — the value column is the one being read, and having to slide the
 * areas out of the way to reach it made a three-step path feel like six.
 */
export function ManualSearch({
  filters,
  trail,
  onOpenAt,
  onToggleValue,
  hint,
  hintAt = null,
}: {
  filters: ResolvedFilter[]
  /** The open path: area, attribute, then values down the attribute's tree. */
  trail: string[]
  onOpenAt: (depth: number, label: string) => void
  onToggleValue: (area: ProductArea, attribute: string, value: string) => void
  /** Bumped by Add filter to point at the first row of the newest column. */
  hint?: number
  /** The column whose open row to flash; null flashes the newest's first row. */
  hintAt?: number | null
}) {
  const visibleColumns = 3
  const [query, setQuery] = React.useState("")
  const stripRef = React.useRef<HTMLDivElement>(null)
  const reducedMotion = usePrefersReducedMotion()
  const scrollTo = useStripScroll(stripRef, reducedMotion)

  const activeCategory = (trail[0] as ProductArea | undefined) ?? null
  const activeAttribute = trail[1] ?? null
  const paths = filters.map((filter) => ({ filter, ...pathOf(filter.id) }))
  const openFilter = paths.find(
    (path) => path.area === activeCategory && path.attribute === activeAttribute,
  )?.filter
  const ticked = openFilter?.values ?? []

  const columns: ColumnModel[] = [
    {
      key: "areas",
      level: "Filter area",
      unit: "Attributes",
      items: searchCategories.map((area) => ({
        label: area,
        count: searchAttributeLabels(area).length,
        drillable: true,
      })),
      open: activeCategory ?? undefined,
      selected: paths.map((path) => path.area),
    },
  ]

  if (activeCategory) {
    const attributes = searchAttributeLabels(activeCategory)
    columns.push({
      key: `attributes:${activeCategory}`,
      level: `${attributes.length} attributes`,
      unit: "Values",
      wide: true,
      items: attributes.map((attribute) => ({
        label: attribute,
        count: searchAttributeValues(activeCategory, attribute).length,
        drillable: true,
      })),
      open: activeAttribute ?? undefined,
      selected: paths.filter((path) => path.area === activeCategory).map((path) => path.attribute),
    })
  }

  if (activeCategory && activeAttribute) {
    // One column of values, then a column for each open value that has values
    // under it, as deep as the tree goes. A value with children carries the
    // chevron: its box ticks it, the rest of the row opens what is under it.
    const valueColumn = (key: string, level: string, values: string[], depth: number) => {
      const items = values.map((value) => ({
        label: value,
        count: valueCountOf(activeCategory, activeAttribute, value),
        drillable: childValuesOf(activeCategory, activeAttribute, value).length > 0,
      }))
      columns.push({
        key,
        level,
        unit: activeCategory === "Drugs" ? "Drugs" : "Records",
        items,
        selectable: true,
        selected: ticked,
        // A value with something ticked beneath it reads as holding values,
        // in weight, the way a navigation row does.
        holding: items
          .filter(({ label }) =>
            childValuesOf(activeCategory, activeAttribute, label).some((child) =>
              ticked.includes(child),
            ),
          )
          .map(({ label }) => label),
        open: trail[depth],
      })
    }
    valueColumn(
      `values:${activeCategory}/${activeAttribute}`,
      activeAttribute,
      rootValuesOf(activeCategory, activeAttribute).map(({ value }) => value),
      2,
    )
    for (let depth = 2; depth < trail.length; depth += 1) {
      const children = childValuesOf(activeCategory, activeAttribute, trail[depth])
      if (children.length === 0) break
      valueColumn(
        `values:${trail.slice(0, depth + 1).join("/")}`,
        trail[depth],
        children,
        depth + 1,
      )
    }
  }

  const path = trail.slice(0, columns.length)
  const needle = query.trim().toLowerCase()
  const visible = columns.map((column) =>
    needle
      ? { ...column, items: column.items.filter((item) => item.label.toLowerCase().includes(needle)) }
      : column,
  )

  // Finder's column view: every column stays in the strip, three fit across,
  // and whenever the path changes the newest column is brought in at the
  // right edge, pushing the earlier ones off to the left where they can be
  // scrolled back to. The first placement is a jump, not a glide.
  const pathKey = columns.map((column) => column.key).join("|")
  const placed = React.useRef(false)
  React.useLayoutEffect(() => {
    const strip = stripRef.current
    if (!strip) return
    scrollTo(strip.scrollWidth - strip.clientWidth, placed.current)
    placed.current = true
  }, [pathKey, scrollTo])

  /** A crumb brings its column back to the left edge of the strip. */
  const showColumn = (index: number) => {
    const strip = stripRef.current
    const column = strip?.children[index] as HTMLElement | undefined
    if (strip && column) scrollTo(column.offsetLeft - strip.offsetLeft, true)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 space-y-2 px-3 pt-3 pb-3">
        <div className="flex h-6 items-center gap-1">
          <nav aria-label="Filter path" className="flex min-w-0 items-center gap-1 overflow-hidden">
            <button
              type="button"
              onClick={() => showColumn(0)}
              className={cn(
                "hover:text-foreground truncate rounded px-1 py-0.5 text-[13px]",
                path.length === 0 ? "text-foreground font-semibold" : "text-muted-foreground",
              )}
            >
              All areas
            </button>
            {path.map((crumb, index) => (
              <span key={crumb} className="flex min-w-0 items-center gap-1">
                <ChevronRightIcon className="text-muted-foreground size-3.5 shrink-0" />
                <button
                  type="button"
                  onClick={() => showColumn(index + 1)}
                  className={cn(
                    "hover:text-foreground truncate rounded px-1 py-0.5 text-[13px]",
                    index === path.length - 1
                      ? "text-foreground font-semibold"
                      : "text-muted-foreground",
                  )}
                >
                  {crumb}
                </button>
              </span>
            ))}
          </nav>
        </div>

        <InputGroup className="bg-surface-panel">
          <InputGroupAddon>
            <SearchIcon className="size-4" />
          </InputGroupAddon>
          <InputGroupInput
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search filters"
            aria-label="Search the columns on screen"
            className="md:text-[13px]"
          />
        </InputGroup>
      </div>

      <div
        ref={stripRef}
        className="divide-edge border-edge relative flex min-h-0 flex-1 divide-x overflow-x-auto border-t"
      >
        {visible.map((column, depth) => {
          return (
            <MillerColumn
              key={column.key}
              column={
                hintAt === null
                  ? depth === visible.length - 1
                    ? { ...column, hint }
                    : column
                  : depth === hintAt
                    ? { ...column, hint, hintLabel: trail[depth], hintDelay: true }
                    : column
              }
              className={cn(
                "[&>div:first-child]:border-t-0",
                // A third each, so the first column never stretches across the pane alone.
                "flex-none basis-1/3",
                // Ruled off from the empty thirds still to fill, which share its grey.
                visible.length < visibleColumns && "border-edge last:border-r",
              )}
              onOpen={(label) => onOpenAt(depth, label)}
              onToggle={
                depth >= 2 && activeCategory && activeAttribute
                  ? (label) => onToggleValue(activeCategory, activeAttribute, label)
                  : undefined
              }
            />
          )
        })}
      </div>
    </div>
  )
}

/**
 * Scrolls the column strip to a left offset: eased over `motion.reflow` on the
 * settle curve's shape, or in one step under reduced motion (and when told not
 * to animate). A new scroll cancels one still running.
 */
function useStripScroll(
  stripRef: React.RefObject<HTMLDivElement | null>,
  reducedMotion: boolean,
) {
  const frame = React.useRef<number | null>(null)
  const fallback = React.useRef<number | null>(null)
  const stop = React.useCallback(() => {
    if (frame.current !== null) cancelAnimationFrame(frame.current)
    if (fallback.current !== null) window.clearTimeout(fallback.current)
    frame.current = null
    fallback.current = null
  }, [])
  React.useEffect(() => stop, [stop])
  return React.useCallback(
    (target: number, animate: boolean) => {
      const strip = stripRef.current
      if (!strip) return
      stop()
      const to = Math.max(0, Math.min(target, strip.scrollWidth - strip.clientWidth))
      const from = strip.scrollLeft
      if (!animate || reducedMotion || Math.abs(to - from) < 1) {
        strip.scrollLeft = to
        return
      }
      const started = performance.now()
      const step = (now: number) => {
        const t = Math.min(1, (now - started) / motion.reflow)
        // Decelerates hard, as the settle curve does: it arrives, not slides.
        const eased = 1 - Math.pow(1 - t, 3)
        strip.scrollLeft = from + (to - from) * eased
        frame.current = t < 1 ? requestAnimationFrame(step) : null
      }
      frame.current = requestAnimationFrame(step)
      // Frames stop in a background tab; the strip still has to end up where
      // it was sent, so a timer lands it if the glide has not.
      fallback.current = window.setTimeout(() => {
        stop()
        strip.scrollLeft = to
      }, motion.reflow + 100)
    },
    [stripRef, reducedMotion, stop],
  )
}
