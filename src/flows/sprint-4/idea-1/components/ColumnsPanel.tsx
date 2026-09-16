"use client"

import { ChevronRightIcon, ChevronsLeftIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  attributeDefs,
  attributeItems,
  childrenByValue,
  searchAttributes,
  valuesByAttribute,
  type Condition,
} from "@/flows/sprint-4/idea-1/data"
import { MillerColumn, type ColumnModel } from "@/flows/sprint-4/idea-1/components/MillerColumn"

/** What the rows of a value column are called, where the attribute name is too long. */
const valueLevel: Record<string, string> = {
  "Therapy Area / Indication": "Therapy area",
  "Drug Geography": "Region",
  "Mono/Combination Drug": "Mono / combination",
}

/** What sits one level under a value. */
const childLevel: Record<string, string> = {
  "Therapy Area / Indication": "Indication",
  "Drug Geography": "Country",
}

/**
 * Idea 2's Miller columns, as the bottom-left of the hybrid.
 *
 * What came across is the drill-down itself — a column added beside the one
 * you were on rather than replacing it, a breadcrumb that folds what does not
 * fit and slides it back on a click, and a count on every row read off the
 * sample against the query as it stands. What stayed behind is the filter-area
 * column, the panel's own search field and the agent in its foot: the text box
 * above is the search, and the columns open straight on the attributes of
 * Drugs.
 *
 * How many columns show is the screen's call, not the panel's. Two normally;
 * one while the logic gate is open beside it, with the breadcrumb carrying the
 * rest, so the results keep their width.
 */
export function ColumnsPanel({
  conditions,
  path,
  leftIndex,
  maxColumns,
  splits,
  countsFor,
  onOpenAt,
  onSlide,
  onToggle,
  className,
}: {
  conditions: Condition[]
  path: string[]
  leftIndex: number
  maxColumns: number
  splits: Record<string, number>
  countsFor: (attribute: string) => Record<string, number>
  onOpenAt: (depth: number, label: string) => void
  onSlide: (index: number) => void
  onToggle: (attribute: string, value: string) => void
  className?: string
}) {
  const [attribute, value, leaf] = path
  const open = conditions.find((condition) => condition.attribute === attribute)
  const negated = open?.mode === "is not"
  const openCounts = attribute ? countsFor(attribute) : {}

  const columns: ColumnModel[] = [
    {
      key: "attributes",
      level: `${attributeItems.length} attributes`,
      items: attributeItems.map((item) => ({
        ...item,
        count: attributeDefs[item.label] ? (splits[item.label] ?? 0) : null,
      })),
      unit: "Values",
      wide: true,
      open: attribute,
      selected: conditions.map((condition) => condition.attribute),
    },
  ]

  if (attribute) {
    columns.push({
      key: `values:${attribute}`,
      level: valueLevel[attribute] ?? attribute,
      items: (valuesByAttribute[attribute] ?? []).map((item) => ({
        ...item,
        count: openCounts[item.label] ?? 0,
      })),
      search: searchAttributes.has(attribute),
      selectable: Boolean(attributeDefs[attribute]),
      negated,
      selected: open?.values ?? [],
      open: value,
    })
  }

  if (value && childrenByValue[value]) {
    columns.push({
      key: `children:${value}`,
      level: childLevel[attribute] ?? "Value",
      items: childrenByValue[value].map((item) => ({
        ...item,
        count: openCounts[item.label] ?? 0,
      })),
      selectable: Boolean(attributeDefs[attribute]),
      negated,
      selected: open?.values ?? [],
      open: leaf,
    })
  }

  const maxLeft = Math.max(0, columns.length - maxColumns)
  const start = Math.min(leftIndex, maxLeft)
  const visible = columns.slice(start, start + maxColumns)
  const crumbs = ["Drugs", ...path]

  return (
    <aside className={cn("bg-surface-page flex h-full min-h-0 flex-col", className)}>
      <div className="bg-surface-panel flex h-11 shrink-0 items-center gap-1 px-3">
        {start > 0 ? (
          <button
            type="button"
            onClick={() => onSlide(start - 1)}
            aria-label="Show the previous column"
            className="text-muted-foreground hover:text-foreground hover:bg-accent -ml-1 flex size-6 shrink-0 items-center justify-center rounded"
          >
            <ChevronsLeftIcon className="size-4" />
          </button>
        ) : null}

        <nav aria-label="Filter path" className="flex min-w-0 items-center gap-1 overflow-hidden">
          {crumbs.map((crumb, i) => {
            const isLast = i === crumbs.length - 1
            // Crumb and column line up one to one: `Drugs` lists the
            // attributes, an attribute lists its values, a value its children.
            const column = i
            const hidden = column < start
            return (
              <span key={`${i}-${crumb}`} className="flex min-w-0 items-center gap-1">
                {i > 0 ? (
                  <ChevronRightIcon className="text-muted-foreground size-3.5 shrink-0" />
                ) : null}
                <button
                  type="button"
                  onClick={() => onSlide(Math.min(column, maxLeft))}
                  className={cn(
                    "hover:text-foreground truncate rounded px-1 py-0.5 text-[13px]",
                    isLast ? "text-foreground font-semibold" : "text-muted-foreground",
                    hidden && "bg-surface-sunken",
                  )}
                >
                  {crumb}
                </button>
              </span>
            )
          })}
        </nav>
      </div>

      <div className="divide-edge flex min-h-0 flex-1 divide-x overflow-x-auto">
        {visible.map((column, i) => {
          const depth = start + i
          return (
            <MillerColumn
              key={column.key}
              column={column}
              onOpen={(label) => onOpenAt(depth, label)}
              onToggle={depth >= 1 ? (label) => onToggle(attribute, label) : undefined}
            />
          )
        })}
      </div>
    </aside>
  )
}
