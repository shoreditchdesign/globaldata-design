"use client"

import * as React from "react"
import { ChevronRightIcon, ChevronsLeftIcon, SearchIcon } from "lucide-react"

import type { ProductArea } from "@/components/prototype/ProductChrome"
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
 * country). Three columns show at a time; past that the strip slides, with
 * the back chevron and the breadcrumb to step back. Drilling in adds a column beside
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
}: {
  filters: ResolvedFilter[]
  /** The open path: area, attribute, then values down the attribute's tree. */
  trail: string[]
  onOpenAt: (depth: number, label: string) => void
  onToggleValue: (area: ProductArea, attribute: string, value: string) => void
}) {
  const visibleColumns = 3
  const [query, setQuery] = React.useState("")
  // Follows the path to its deepest column unless a crumb slides it back.
  const [leftIndex, setLeftIndex] = React.useState(Number.POSITIVE_INFINITY)

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
        negated: Boolean(openFilter?.excluded),
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
  const maxLeft = Math.max(0, columns.length - visibleColumns)
  const start = Math.min(leftIndex, maxLeft)
  const needle = query.trim().toLowerCase()
  const visible = columns.slice(start, start + visibleColumns).map((column) =>
    needle
      ? { ...column, items: column.items.filter((item) => item.label.toLowerCase().includes(needle)) }
      : column,
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 space-y-2 px-3 pt-3 pb-3">
        <div className="flex h-6 items-center gap-1">
          {start > 0 ? (
            <button
              type="button"
              onClick={() => setLeftIndex(start - 1)}
              aria-label="Show the previous column"
              className="text-muted-foreground hover:text-foreground hover:bg-accent -ml-1 flex size-6 shrink-0 items-center justify-center rounded"
            >
              <ChevronsLeftIcon className="size-4" />
            </button>
          ) : null}
          <nav aria-label="Filter path" className="flex min-w-0 items-center gap-1 overflow-hidden">
            <button
              type="button"
              onClick={() => setLeftIndex(0)}
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
                  onClick={() => setLeftIndex(Math.min(index + 1, maxLeft))}
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

      <div className="divide-edge border-edge flex min-h-0 flex-1 divide-x overflow-x-auto border-t">
        {visible.map((column, index) => {
          const depth = start + index
          return (
            <MillerColumn
              key={column.key}
              column={column}
              className={cn(
                "[&>div:first-child]:border-t-0",
                // A third each, so the first column never stretches across the pane alone.
                "flex-none basis-1/3",
                // Ruled off from the empty thirds still to fill, which share its grey.
                visible.length < visibleColumns && "border-edge last:border-r",
              )}
              onOpen={(label) => {
                setLeftIndex(Number.POSITIVE_INFINITY)
                onOpenAt(depth, label)
              }}
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
