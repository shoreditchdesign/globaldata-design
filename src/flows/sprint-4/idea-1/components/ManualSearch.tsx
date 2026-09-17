"use client"

import * as React from "react"
import { ChevronRightIcon, ChevronsLeftIcon, SearchIcon } from "lucide-react"

import type { ProductArea } from "@/components/prototype/ProductChrome"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { MillerColumn, type ColumnModel } from "@/flows/sprint-4/idea-1/components/MillerColumn"
import {
  pathOf,
  searchAttributeLabels,
  searchAttributeValueCounts,
  searchCategories,
  type ResolvedFilter,
} from "@/flows/sprint-4/idea-1/data"
import { cn } from "@/lib/utils"

/** The panel fits two columns; deeper paths fold into the breadcrumb. */
const VISIBLE_COLUMNS = 2

/**
 * Manual search as Miller columns, after Sprint 3 Idea 2's filter panel:
 * filter area, then attribute, then values. Drilling in adds a column beside
 * the last rather than replacing it, and ticking a value writes it into the
 * same filter box the quick search builds. The open area and attribute are the
 * pills' own, so switching tabs keeps your place.
 */
export function ManualSearch({
  filters,
  activeCategory,
  activeAttribute,
  onOpenCategory,
  onOpenAttribute,
  onToggleValue,
}: {
  filters: ResolvedFilter[]
  activeCategory: ProductArea | null
  activeAttribute: string | null
  onOpenCategory: (category: ProductArea) => void
  onOpenAttribute: (attribute: string) => void
  onToggleValue: (area: ProductArea, attribute: string, value: string) => void
}) {
  const [query, setQuery] = React.useState("")
  // Follows the path to its deepest column unless a crumb slides it back.
  const [leftIndex, setLeftIndex] = React.useState(Number.POSITIVE_INFINITY)

  const paths = filters.map((filter) => ({ filter, ...pathOf(filter.id) }))
  const openFilter = paths.find(
    (path) => path.area === activeCategory && path.attribute === activeAttribute,
  )?.filter

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
        count: searchAttributeValueCounts(activeCategory, attribute).length,
        drillable: true,
      })),
      open: activeAttribute ?? undefined,
      selected: paths.filter((path) => path.area === activeCategory).map((path) => path.attribute),
    })
  }

  if (activeCategory && activeAttribute) {
    columns.push({
      key: `values:${activeCategory}/${activeAttribute}`,
      level: activeAttribute,
      unit: activeCategory === "Drugs" ? "Drugs" : "Records",
      items: searchAttributeValueCounts(activeCategory, activeAttribute).map(({ value, count }) => ({
        label: value,
        count,
      })),
      selectable: true,
      negated: Boolean(openFilter?.excluded),
      selected: openFilter?.values ?? [],
    })
  }

  const path = [activeCategory, activeAttribute].filter(Boolean) as string[]
  const maxLeft = Math.max(0, columns.length - VISIBLE_COLUMNS)
  const start = Math.min(leftIndex, maxLeft)
  const needle = query.trim().toLowerCase()
  const visible = columns.slice(start, start + VISIBLE_COLUMNS).map((column) =>
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
              className="[&>div:first-child]:border-t-0"
              onOpen={(label) => {
                setLeftIndex(Number.POSITIVE_INFINITY)
                if (depth === 0) onOpenCategory(label as ProductArea)
                else onOpenAttribute(label)
              }}
              onToggle={
                depth === 2 && activeCategory && activeAttribute
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
