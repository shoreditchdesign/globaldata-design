"use client"

import { useState } from "react"
import { ChevronRightIcon, ChevronsLeftIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  areaItems,
  attributeItems,
  childrenByValue,
  defaultPath,
  searchAttributes,
  selectedValues,
  valuesByAttribute,
  type ColumnItem,
} from "@/flows/sprint-3/idea-2/data"
import { MillerColumn, type ColumnModel } from "@/flows/sprint-3/idea-2/components/MillerColumn"

/** How many columns are on screen at once before the rest go to the breadcrumb. */
const MAX_COLUMNS = 3

/** What the rows of a value column are called, where the attribute name is too long. */
const valueLevel: Record<string, string> = {
  "Therapy Area / Indication": "Therapy area",
  "Drug Geography": "Region",
  "Mono/Combination Drug": "Mono / combination",
}

/** What sits one level under a value. */
const childLevel: Record<string, { level: string; placeholder: string }> = {
  "Therapy Area / Indication": { level: "Indication", placeholder: "Search indications" },
  "Drug Geography": { level: "Country", placeholder: "Search countries" },
}

/**
 * The screener's left region — Miller columns, not a replacing tree.
 *
 * Drilling in adds a column beside the one you were on instead of wiping it,
 * so the path you took stays on screen and the branches either side of it stay
 * open. Past three columns the leftmost fold into the breadcrumb, which is
 * still a live control: clicking a crumb slides that column back into view
 * without discarding anything to the right of it.
 *
 * Selection itself is fixed — this is a still frame of one applied query. Only
 * the navigation is live.
 */
export function FilterPanel({ className }: { className?: string }) {
  const [path, setPath] = useState<string[]>(defaultPath)
  const [leftIndex, setLeftIndex] = useState(1)

  const [area, attribute, value, leaf] = path

  const columns: ColumnModel[] = [
    {
      key: "areas",
      level: "Filter area",
      unit: "Records",
      placeholder: "Search areas",
      items: areaItems,
      open: area,
      badges: area === "Drugs" ? { Drugs: Object.keys(selectedValues).length } : undefined,
    },
  ]

  if (area === "Drugs") {
    columns.push({
      key: "attributes",
      level: "Attribute",
      placeholder: "Search attributes",
      items: attributeItems,
      wide: true,
      open: attribute,
      selected: Object.keys(selectedValues),
      badges: Object.fromEntries(
        Object.entries(selectedValues).map(([key, values]) => [key, values.length]),
      ),
    })
  }

  if (attribute) {
    columns.push({
      key: `values:${attribute}`,
      level: valueLevel[attribute] ?? attribute,
      placeholder: `Search ${attribute}`,
      items: valuesByAttribute[attribute] ?? [],
      search: searchAttributes.has(attribute),
      selected: selectedValues[attribute],
      open: value,
    })
  }

  if (value && childrenByValue[value]) {
    const child = childLevel[attribute] ?? { level: "Value", placeholder: "Search values" }
    columns.push({
      key: `children:${value}`,
      level: child.level,
      placeholder: child.placeholder,
      items: childrenByValue[value],
      open: leaf,
    })
  }

  const maxLeft = Math.max(0, columns.length - MAX_COLUMNS)
  const start = Math.min(leftIndex, maxLeft)
  const visible = columns.slice(start, start + MAX_COLUMNS)

  function openAt(depth: number, item: ColumnItem) {
    // The filter areas other than Drugs have no attribute set in this prototype.
    if (depth === 0 && !item.drillable) return

    setPath([...path.slice(0, depth), item.label])
    // Always land on the rightmost window — clamped on render, so overshooting
    // is how "follow the drill-down" is expressed.
    setLeftIndex(MAX_COLUMNS)
  }

  const appliedAttributes = Object.keys(selectedValues).length
  const appliedValues = Object.values(selectedValues).reduce((n, v) => n + v.length, 0)

  return (
    <aside className={cn("bg-muted/30 flex h-full min-h-0 flex-col", className)}>
      <div className="shrink-0 border-b px-3 pt-2.5 pb-2">
        <div className="flex items-center gap-2">
          <h2 className="text-[13px] font-semibold tracking-tight">Filters</h2>
          <span className="text-muted-foreground text-[11px] tabular-nums">
            {appliedAttributes} attributes · {appliedValues} values
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground ml-auto h-6 px-2 text-[11px]"
          >
            Clear all
          </Button>
        </div>

        <div className="mt-1.5 flex items-center gap-1">
          {start > 0 ? (
            <button
              type="button"
              onClick={() => setLeftIndex(start - 1)}
              aria-label="Show the previous column"
              className="text-muted-foreground hover:text-foreground hover:bg-accent -ml-1 flex size-5 shrink-0 items-center justify-center rounded"
            >
              <ChevronsLeftIcon className="size-3.5" />
            </button>
          ) : null}

          <nav aria-label="Filter path" className="flex min-w-0 items-center gap-1 overflow-hidden">
            {path.map((crumb, i) => {
              const isLast = i === path.length - 1
              const hidden = i < start
              return (
                <span key={crumb} className="flex min-w-0 items-center gap-1">
                  {i > 0 ? (
                    <ChevronRightIcon className="text-muted-foreground/50 size-3 shrink-0" />
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setLeftIndex(Math.max(0, Math.min(i, maxLeft)))}
                    className={cn(
                      "hover:text-foreground truncate rounded px-1 py-0.5 text-[11px]",
                      isLast ? "text-foreground font-medium" : "text-muted-foreground",
                      hidden && "bg-accent",
                    )}
                  >
                    {crumb}
                  </button>
                </span>
              )
            })}
          </nav>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 divide-x overflow-x-auto">
        {visible.map((column, i) => (
          <MillerColumn
            key={column.key}
            column={column}
            onOpen={(item) => openAt(start + i, item)}
          />
        ))}
      </div>
    </aside>
  )
}
