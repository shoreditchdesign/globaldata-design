"use client"

import { useEffect, useState } from "react"
import { ChevronRightIcon, ChevronsLeftIcon, SearchIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  areaItems,
  attributeDefs,
  attributeItems,
  childrenByValue,
  searchAttributes,
  valuesByAttribute,
} from "@/flows/sprint-3/idea-2/data"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { MillerColumn, type ColumnModel } from "@/flows/sprint-3/idea-2/components/MillerColumn"
import { AgentFoot } from "@/flows/sprint-3/idea-2/components/AgentFoot"
import type { Screener } from "@/flows/sprint-3/idea-2/use-screener"

/**
 * How many columns are on screen at once before the rest go to the breadcrumb.
 *
 * Re-derived at the 13px the columns now read at. The Miller type has come down
 * onto the table's scale, so every label is 0.8125 of the width it was measured
 * at and the threshold comes down with it.
 *
 * A row spends its lanes before it spends anything on the label. Lead control
 * 20px, the gaps and the row's own padding 20px, then the count lane and, where
 * a column drills, a 16px chevron: 104px of furniture in the filter-area column
 * (a five-character count lane, now 48px), 88px in a drillable column with a
 * three-digit one, 72px in a leaf column. The labels, measured off Geist at the
 * 16px the rows used to render at and scaled to 13px, at the medium weight a
 * ticked value takes: `Advanced Company Watchlist` 182px, `Musculoskeletal
 * Disorders` 165px, `Therapy Area / Indication` 156px, `Pulmonary Arterial
 * Hypertension` 202px, `Cutaneous Lupus Erythematosus` 206px.
 *
 * Add the two together and a column wants 286px for the filter areas, 278px for
 * the deepest indication, 253px for a therapy area, and 244px for the attribute
 * inventory — which takes 1.25 shares of the panel rather than 1, so it asks
 * 195px of the share. The binding column is the widest of those over 1 share:
 * 286px.
 *
 * Two columns are 2.25 shares plus the rule between them and the panel's own
 * border, so they want 1,292px of window at the widest pair (filter areas
 * beside attributes) and 1,142px at the pair the screen opens on (attributes
 * beside therapy areas). Three columns are 3.25 shares and want 1,866px, which
 * is still a wide desktop rather than a laptop — so three remains the wide case
 * and two the ordinary one, and the breadcrumb carries the rest of the depth,
 * which is what the breadcrumb is for.
 *
 * What the smaller type buys at the sprint's 1440px review viewport: both pairs
 * now fit whole. `Advanced Company Watchlist` used to overrun its lane by 29px
 * and lean on the row's `title` until the window reached 1,570px; at 13px it is
 * inside the lane, so nothing in the panel truncates at the review size.
 */
const THREE_COLUMN_MIN_WIDTH = 1880
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
const childLevel: Record<string, string> = {
  "Therapy Area / Indication": "Indication",
  "Drug Geography": "Country",
}

/**
 * The screener's left region — Miller columns, not a replacing tree.
 *
 * Drilling in adds a column beside the one you were on instead of wiping it,
 * so the path you took stays on screen and the branches either side of it stay
 * open. Past the two or three the window fits, the leftmost fold into the
 * breadcrumb, which is still a live control: clicking a crumb slides that
 * column back into view without discarding anything to the right of it.
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
  const [query, setQuery] = useState("")
  const { filters, path, leftIndex, splits, countsFor } = screener

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
      items: areaItems,
      open: area,
      // No lead-lane count of applied filters: it put a number on both sides of
      // one label, which is the thing this column was most obviously doing
      // wrong. Nothing replaces it here, because there is nothing to compare
      // against — `Drugs` is the only area you can open, the radio mark already
      // says the path is on it, and how many filters it holds is stated in
      // words on the pills heading the results.
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
      items: attributeItems.map((item) => ({
        ...item,
        // Free-text attributes have no value list, so they carry no number.
        count: attributeDefs[item.label] ? (splits[item.label] ?? 0) : null,
      })),
      unit: "Values",
      wide: true,
      open: attribute,
      // An attribute with values in the query is `selected`, and that is the
      // whole of the signal: how many values it holds is on the pills heading
      // the results, said once, in words.
      selected: filters.map((filter) => filter.attribute),
    })
  }

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
      selected: valuesOfAttribute,
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
      selected: valuesOfAttribute,
      open: leaf,
    })
  }

  const maxLeft = Math.max(0, columns.length - maxColumns)
  const start = Math.min(leftIndex, maxLeft)
  const visible = columns.slice(start, start + maxColumns)

  // One field for the whole panel rather than one per column: a label is found
  // without first working out which column holds it. It narrows what is on
  // screen and nothing else — the path, the ticks and the counts are untouched.
  const needle = query.trim().toLowerCase()
  const onScreen = needle
    ? visible.map((column) => ({
        ...column,
        items: column.items.filter((item) => item.label.toLowerCase().includes(needle)),
      }))
    : visible

  /** The attribute a column at this depth is ticking values into. */
  const attributeAt = (depth: number) => (depth >= 2 ? attribute : undefined)

  return (
    <aside className={cn("bg-surface-page flex h-full min-h-0 flex-col", className)}>
      {/* The breadcrumb, the search field and the column captions are one white
          block: the panel has a header, and under it the columns are the only
          coloured thing in the region. The one rule inside it is above the
          captions, which belong to the columns rather than to the field.

          The rail takes its own room top and bottom. Crammed against the search
          field under it, the path read as a label on the field rather than as
          the thing the columns are currently showing. */}
      <div className="bg-surface-panel shrink-0 px-3 pt-3 pb-3">
        <div className="flex items-center gap-1">
          {start > 0 ? (
            <button
              type="button"
              onClick={() => screener.setLeftIndex(start - 1)}
              aria-label="Show the previous column"
              className="text-muted-foreground hover:text-foreground hover:bg-accent -ml-1 flex size-6 shrink-0 items-center justify-center rounded"
            >
              <ChevronsLeftIcon className="size-4" />
            </button>
          ) : null}

          <nav aria-label="Filter path" className="flex min-w-0 items-center gap-1 overflow-hidden">
            {path.map((crumb, i) => {
              const isLast = i === path.length - 1
              const hidden = i < start
              return (
                <span key={crumb} className="flex min-w-0 items-center gap-1">
                  {i > 0 ? (
                    <ChevronRightIcon className="text-muted-foreground size-3.5 shrink-0" />
                  ) : null}
                  <button
                    type="button"
                    onClick={() => screener.setLeftIndex(Math.max(0, Math.min(i, maxLeft)))}
                    className={cn(
                      "hover:text-foreground truncate rounded px-1 py-0.5 text-[13px]",
                      // One size for every crumb: a trail where the last step
                      // is four pixels taller than the one before it reads as
                      // two different kinds of thing rather than one path. The
                      // crumb you are on is marked by weight and full ink,
                      // which leaves the accent to the controls.
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
      </div>

      <div className="bg-surface-panel shrink-0 px-3 pt-2 pb-2">
        {/* The field keeps its well. It is the one thing in the white block you
            type into, and a sunken input is how that is said everywhere else in
            the product — a white field on a white block would be an outline
            drawn for no reason. */}
        <InputGroup className="bg-surface-sunken">
          <InputGroupAddon>
            <SearchIcon className="size-4" />
          </InputGroupAddon>
          {/* `Input` lands on `md:text-sm` — 14px, a pixel over the 13px the
              columns and the table beside them read at, so the field states its
              own size rather than sitting a step above everything it filters. */}
          <InputGroupInput
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search filters"
            aria-label="Search the columns on screen"
            className="md:text-[13px]"
          />
        </InputGroup>
      </div>

      {/* `divide-edge`, not `divide-hairline`: the columns are separate planes,
          and the rule between two surfaces is the structural weight. */}
      <div className="divide-edge flex min-h-0 flex-1 divide-x overflow-x-auto">
        {onScreen.map((column, i) => {
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

      <AgentFoot screener={screener} />
    </aside>
  )
}
