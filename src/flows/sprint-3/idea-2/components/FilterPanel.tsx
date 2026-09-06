"use client"

import { useEffect, useState } from "react"
import { ChevronRightIcon, ChevronsLeftIcon, SparklesIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  areaItems,
  attributeDefs,
  attributeItems,
  childrenByValue,
  searchAttributes,
  valuesByAttribute,
} from "@/flows/sprint-3/idea-2/data"
import { MillerColumn, type ColumnModel } from "@/flows/sprint-3/idea-2/components/MillerColumn"
import { AgentPanel } from "@/flows/sprint-3/idea-2/components/AgentPanel"
import type { Screener } from "@/flows/sprint-3/idea-2/use-screener"

/**
 * How many columns are on screen at once before the rest go to the breadcrumb.
 *
 * The panel is 40% of the window, so the arithmetic is fixed: three columns
 * split it 1.25 : 1 : 1, and the attribute column needs about 240px before
 * `Therapy Area / Indication` stops ellipsising — 625px of panel, so 1560px of
 * window, taken to 1600 for a little headroom. Below that the panel drops to
 * two columns, each wide enough for the longest label in the set, and the
 * breadcrumb carries the extra depth — which is what the breadcrumb is for.
 * Three columns of ellipses say less than two readable ones.
 */
const THREE_COLUMN_MIN_WIDTH = 1600
const WIDE_COLUMNS = 3
const NARROW_COLUMNS = 2

function useMaxColumns() {
  // Server-render the wide case, then correct on mount — the prototype is
  // opened on a desktop, so the wide case is the right first paint.
  const [maxColumns, setMaxColumns] = useState(WIDE_COLUMNS)

  useEffect(() => {
    const query = window.matchMedia(`(min-width: ${THREE_COLUMN_MIN_WIDTH}px)`)
    const apply = () => setMaxColumns(query.matches ? WIDE_COLUMNS : NARROW_COLUMNS)
    apply()
    query.addEventListener("change", apply)
    return () => query.removeEventListener("change", apply)
  }, [])

  return maxColumns
}

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
 * The screener's left region — Miller columns, not a replacing tree, with the
 * agent docked under them.
 *
 * Drilling in adds a column beside the one you were on instead of wiping it,
 * so the path you took stays on screen and the branches either side of it stay
 * open. Past three columns the leftmost fold into the breadcrumb, which is
 * still a live control: clicking a crumb slides that column back into view
 * without discarding anything to the right of it.
 *
 * Every number in here is counted off the sample against the filters currently
 * applied, so a value's count says what picking it would leave rather than
 * what the query already holds.
 */
export function FilterPanel({
  screener,
  className,
}: {
  screener: Screener
  className?: string
}) {
  const maxColumns = useMaxColumns()
  const { filters, path, leftIndex, splits, countsFor, agent } = screener

  const [area, attribute, value, leaf] = path
  const openFilter = filters.find((filter) => filter.attribute === attribute)
  const valuesOfAttribute = openFilter?.values ?? []
  const negated = openFilter?.mode === "is not"
  // One facet pass per open attribute, reused by its value column and by the
  // column of children underneath it — indications and countries are values of
  // the same attribute, so they are counted the same way.
  const openCounts = attribute ? countsFor(attribute) : {}

  const columns: ColumnModel[] = [
    {
      key: "areas",
      level: "Filter area",
      unit: "Records",
      placeholder: "Search areas",
      items: areaItems,
      open: area,
      badges: filters.length > 0 ? { Drugs: filters.length } : undefined,
    },
  ]

  if (area === "Drugs") {
    columns.push({
      key: "attributes",
      // Not "Attribute". This column is an inventory of everything the set can
      // be cut by — 27 of them on the live platform — and saying how many
      // there are is the difference between a menu you get past and a data
      // model you can read.
      level: `${attributeItems.length} attributes`,
      placeholder: "Search attributes",
      items: attributeItems.map((item) => ({
        ...item,
        // Free-text attributes have no value list, so they carry no number.
        count: attributeDefs[item.label] ? (splits[item.label] ?? 0) : null,
      })),
      unit: "Values",
      wide: true,
      open: attribute,
      selected: filters.map((filter) => filter.attribute),
      badges: Object.fromEntries(
        filters.map((filter) => [filter.attribute, filter.values.length]),
      ),
    })
  }

  if (attribute) {
    columns.push({
      key: `values:${attribute}`,
      level: valueLevel[attribute] ?? attribute,
      placeholder: `Search ${attribute}`,
      items: (valuesByAttribute[attribute] ?? []).map((item) => ({
        ...item,
        count: openCounts[item.label] ?? 0,
      })),
      search: searchAttributes.has(attribute),
      selectable: Boolean(attributeDefs[attribute]),
      negated,
      selected: valuesOfAttribute,
      open: value,
    })
  }

  if (value && childrenByValue[value]) {
    const child = childLevel[attribute] ?? { level: "Value", placeholder: "Search values" }
    columns.push({
      key: `children:${value}`,
      level: child.level,
      placeholder: child.placeholder,
      items: childrenByValue[value].map((item) => ({
        ...item,
        count: openCounts[item.label] ?? 0,
      })),
      selectable: Boolean(attributeDefs[attribute]),
      negated,
      selected: valuesOfAttribute,
      open: leaf,
    })
  }

  const maxLeft = Math.max(0, columns.length - maxColumns)
  const start = Math.min(leftIndex, maxLeft)
  const visible = columns.slice(start, start + maxColumns)

  /** The attribute a column at this depth is ticking values into. */
  const attributeAt = (depth: number) => (depth >= 2 ? attribute : undefined)

  const appliedValues = filters.reduce((n, filter) => n + filter.values.length, 0)

  return (
    <aside className={cn("bg-surface-page flex h-full min-h-0 flex-col", className)}>
      <div className="bg-surface-chrome border-edge shrink-0 border-b px-3 pt-2.5 pb-2">
        <div className="flex items-center gap-2">
          <h2 className="text-[13px] font-semibold tracking-tight">Filters</h2>
          <span className="text-muted-foreground text-[11px] tabular-nums">
            {filters.length} attributes · {appliedValues} values
          </span>

          {agent.visible ? null : (
            <Button
              variant="outline"
              size="sm"
              onClick={screener.recallAgent}
              className="ml-auto h-6 px-2 text-[11px]"
            >
              <SparklesIcon className="size-3" />
              Agent
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={screener.clearAll}
            disabled={filters.length === 0}
            className={cn("text-muted-foreground h-6 px-2 text-[11px]", agent.visible && "ml-auto")}
          >
            Clear all
          </Button>
        </div>

        <div className="mt-1.5 flex items-center gap-1">
          {start > 0 ? (
            <button
              type="button"
              onClick={() => screener.setLeftIndex(start - 1)}
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
                    onClick={() => screener.setLeftIndex(Math.max(0, Math.min(i, maxLeft)))}
                    className={cn(
                      "hover:text-foreground truncate rounded px-1 py-0.5 text-[11px]",
                      isLast ? "text-brand-ink font-medium" : "text-muted-foreground",
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
      </div>

      <div className="divide-hairline flex min-h-0 flex-1 divide-x overflow-x-auto">
        {visible.map((column, i) => {
          const depth = start + i
          const ticksInto = attributeAt(depth)
          return (
            <MillerColumn
              key={column.key}
              column={column}
              onOpen={(label) => screener.openAt(depth, label)}
              onToggle={
                ticksInto ? (label) => screener.toggleValue(ticksInto, label) : undefined
              }
            />
          )
        })}
      </div>

      {agent.visible ? <AgentPanel screener={screener} /> : null}
    </aside>
  )
}
