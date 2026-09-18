"use client"

import * as React from "react"
import {
  AtomIcon,
  ChevronRightIcon,
  ChevronsDownUpIcon,
  ChevronsUpDownIcon,
  CombineIcon,
  CrosshairIcon,
  DnaIcon,
  FileTextIcon,
  FlaskConicalIcon,
  GlobeIcon,
  HashIcon,
  LayersIcon,
  PillIcon,
  SearchIcon,
  StethoscopeIcon,
  SyringeIcon,
  TagIcon,
  TypeIcon,
  WorkflowIcon,
  XIcon,
  type LucideIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { motion, usePrefersReducedMotion } from "@/components/prototype/motion"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  attributeDefs,
  childrenByValue,
  drugAttributeOrder,
  facetCounts,
  valuesByAttribute,
  type Condition,
} from "@/flows/sprint-4/idea-2/data"

/**
 * The manual way into the query, beside typing a sentence: the Drugs taxonomy
 * as a file tree, opened from `Explorer` in the head of the results. Attributes
 * are the first level, their values the second, and a value with children — a
 * therapy area, a region — opens onto a third.
 *
 * Tick values, then apply. Nothing moves until the rail at the foot is used, so
 * a walk through the tree is free and the count only changes when it is asked
 * to. Applying writes the ticks into the query as plain conditions, which the
 * box above reads back in words.
 *
 * It reads the other way too: whatever the sentence resolves to arrives here as
 * ticks, in the branches they belong to, so the two are never out of step.
 *
 * Only Drugs is here. The other product areas are their own screeners with
 * their own taxonomies, so putting all eight at the first level would have made
 * the top of the tree the platform's nav rather than this screen's filters.
 */

/**
 * An icon per attribute. The argument for a tree over a row of dropdowns is
 * that you recognise where a filter lives before you read the label, and that
 * only holds if the mark is particular to the attribute.
 */
const attributeIcons: Record<string, LucideIcon> = {
  "Therapy Area / Indication": StethoscopeIcon,
  "Development Stage": FlaskConicalIcon,
  "Drug Geography": GlobeIcon,
  "Molecule Type": AtomIcon,
  "Route of Administration": SyringeIcon,
  "Drug Descriptor": TagIcon,
  "Mechanism of Action": WorkflowIcon,
  Target: CrosshairIcon,
  "ATC Classification": LayersIcon,
  "Drug Type": PillIcon,
  "Mono/Combination Drug": CombineIcon,
  "Application Type": FileTextIcon,
  "Gene Therapy Vector": DnaIcon,
  "Drug Name": TypeIcon,
  "CAS Number": HashIcon,
}

/** A node's key, unique across the tree: `attribute` or `attribute/value`. */
const keyOf = (...parts: string[]) => parts.join("/")

const matches = (label: string, query: string) => label.toLowerCase().includes(query.toLowerCase())

/** The attributes the sample can actually filter on, in the product's order. */
const attributes = drugAttributeOrder.filter((attribute) => attributeDefs[attribute])

export function ExplorerTree({
  conditions,
  seed: frame,
  onApply,
  onClose,
  className,
}: {
  /** The query as applied. Ticks are seeded from it and reset to it when it changes. */
  conditions: Condition[]
  /**
   * Branches open and values ticked before anything is applied, when a frame
   * arrives mid-walk. Only the first render reads it; from there the tree leads.
   */
  seed?: { expanded: string[]; ticks: Record<string, string[]> } | null
  onApply: (next: Condition[]) => void
  onClose: () => void
  className?: string
}) {
  const [expanded, setExpanded] = React.useState<Set<string>>(() => new Set(frame?.expanded ?? []))
  const [search, setSearch] = React.useState("")

  /** Ticked values per attribute, before they are applied. */
  const seed = React.useMemo(() => ticksFrom(conditions), [conditions])
  const [draft, setDraft] = React.useState<Record<string, string[]>>(frame?.ticks ?? seed)
  // The query moved somewhere else — a sentence resolved, a pill cleared, Undo.
  // The tree follows it rather than holding ticks the screen no longer shows.
  // Adjusted during render, so no frame paints ticks from the query before.
  const [syncedTo, setSyncedTo] = React.useState(seed)
  if (syncedTo !== seed) {
    setSyncedTo(seed)
    setDraft(seed)
  }

  /*
    A query arriving from somewhere else lands here as ticks, and it lands the
    way the sentence does: the branches it touched open, then the values tick
    one after another rather than appearing already done. It is the same claim
    the resolve animation makes above — this is what your words became — made
    where the taxonomy can show which branch each one came from.
  */
  const reduced = usePrefersReducedMotion()
  const order = React.useMemo(
    () =>
      attributes.flatMap((attribute) =>
        (seed[attribute] ?? []).map((value) => keyOf(attribute, value)),
      ),
    [seed],
  )
  const [revealed, setRevealed] = React.useState(order.length)
  const [reveals, setReveals] = React.useState(order)
  if (reveals !== order) {
    setReveals(order)
    // Ticks that arrived from a resolve are counted in; ones the reviewer just
    // made are already on screen and must not blink back off.
    setRevealed(reduced || order.length === 0 ? order.length : 0)
    if (order.length > 0 && !reduced) {
      setExpanded((current) => {
        const next = new Set(current)
        for (const key of order) next.add(key.split("/")[0])
        return next
      })
    }
  }

  React.useEffect(() => {
    if (revealed >= order.length) return
    const timer = window.setTimeout(() => setRevealed((count) => count + 1), motion.stagger)
    return () => window.clearTimeout(timer)
  }, [revealed, order.length])

  /**
   * Whether a box is drawn ticked. The draft is the answer; the sequence only
   * decides *when* a tick that arrived with a resolved query is drawn, so a box
   * the reviewer unticks goes straight away rather than waiting for its turn.
   */
  const tickShown = React.useCallback(
    (attribute: string, value: string) => {
      if (!draft[attribute]?.includes(value)) return false
      const index = order.indexOf(keyOf(attribute, value))
      return index === -1 || index < revealed
    },
    [draft, order, revealed],
  )

  // Every branch there is, so expand-all opens the values under each attribute
  // as well as the attributes themselves.
  const everyKey = React.useMemo(
    () =>
      attributes.flatMap((attribute) => [
        attribute,
        ...(valuesByAttribute[attribute] ?? [])
          .filter((value) => (childrenByValue[value.label] ?? []).length > 0)
          .map((value) => keyOf(attribute, value.label)),
      ]),
    [],
  )
  const allOpen = everyKey.every((key) => expanded.has(key))

  const dirty = !sameTicks(draft, seed)
  const ticked = Object.values(draft).reduce((sum, values) => sum + values.length, 0)

  const toggle = (key: string) =>
    setExpanded((current) => {
      const next = new Set(current)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

  const tick = (attribute: string, value: string) =>
    setDraft((current) => {
      const values = current[attribute] ?? []
      const next = values.includes(value)
        ? values.filter((entry) => entry !== value)
        : [...values, value]
      const updated = { ...current, [attribute]: next }
      if (next.length === 0) delete updated[attribute]
      return updated
    })

  return (
    <section className={cn("bg-surface-chrome flex min-h-0 flex-col", className)}>
      {/*
        The head of the tree is built to the same line as the head of the
        results across the split: the toolbar's 44px and the column heads' 36px,
        as a title row and a search row. Change one height and change the other.
      */}
      <div className="bg-surface-panel border-edge h-21 shrink-0 border-b">
        <div className="flex h-12 items-center gap-1 px-(--text-inset)">
          <p className="text-muted-foreground text-[10px] font-medium tracking-[0.08em] uppercase">
            Explorer
          </p>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => (allOpen ? setExpanded(new Set()) : setExpanded(new Set(everyKey)))}
            aria-label={allOpen ? "Collapse every branch" : "Expand every branch"}
            className="text-muted-foreground hover:text-foreground ml-auto"
          >
            {allOpen ? <ChevronsDownUpIcon className="size-4" /> : <ChevronsUpDownIcon className="size-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Close the explorer"
            className="text-muted-foreground hover:text-foreground"
          >
            <XIcon className="size-4" />
          </Button>
        </div>

        <div className="flex flex-1 items-start px-(--text-inset) pb-2">
          <div className="relative w-full">
            <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search"
              className="bg-surface-sunken h-7 pr-7 pl-8 text-[13px]"
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear the search"
                className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 absolute top-1/2 right-1.5 flex size-5 -translate-y-1/2 items-center justify-center rounded outline-none focus-visible:ring-2"
              >
                <XIcon className="size-3.5" />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto px-(--text-inset) pt-2 pb-2">
        {attributes.map((attribute) => {
          const values = valuesByAttribute[attribute] ?? []
          const hit = searchHit(attribute, values, search)
          if (search.trim() && !hit.direct && !hit.nested) return null

          // A nested hit is only reachable through its branch, so the search
          // opens it rather than leaving the reviewer to find it.
          const isOpen = expanded.has(attribute) || (hit.nested && !hit.direct)
          const Icon = attributeIcons[attribute] ?? LayersIcon
          const picked = draft[attribute]?.length ?? 0
          const counts = facetCounts(conditions, attribute, attribute)
          const shown = hit.values ? values.filter((value) => hit.values?.includes(value.label)) : values

          return (
            <div key={attribute} className="mb-1 last:mb-0">
              <Row
                tall
                open={isOpen}
                onToggle={() => toggle(attribute)}
                active={picked > 0}
                // The attribute itself did not match; a value under it did.
                nested={hit.nested && !hit.direct}
                label={attribute}
                icon={<Icon className="text-muted-foreground size-4 shrink-0" />}
                meta={picked > 0 ? `${picked} picked` : null}
              />

              {isOpen ? (
                <Branch>
                  {shown.map((value) => {
                    const all = childrenByValue[value.label] ?? []
                    const matched = hit.children?.[value.label] ?? null
                    const children = matched ? all.filter((child) => matched.includes(child.label)) : all
                    const valueKey = keyOf(attribute, value.label)
                    // A match this deep is only reachable through its value, so
                    // the search opens that too rather than stopping a level short.
                    const valueOpen = expanded.has(valueKey) || matched !== null
                    return (
                      <div key={value.label}>
                        <Row
                          open={children.length > 0 ? valueOpen : undefined}
                          onToggle={children.length > 0 ? () => toggle(valueKey) : undefined}
                          label={value.label}
                          nested={matched !== null}
                          count={counts[value.label] ?? 0}
                          checked={tickShown(attribute, value.label)}
                          onCheck={() => tick(attribute, value.label)}
                        />
                        {children.length > 0 && valueOpen ? (
                          <Branch>
                            {children.map((child) => (
                              <Row
                                key={child.label}
                                label={child.label}
                                count={counts[child.label] ?? 0}
                                checked={tickShown(attribute, child.label)}
                                onCheck={() => tick(attribute, child.label)}
                              />
                            ))}
                          </Branch>
                        ) : null}
                      </div>
                    )
                  })}
                </Branch>
              ) : null}
            </div>
          )
        })}
      </div>

      {/*
        Nothing the tree does reaches the table until this rail is used, so the
        count under the sentence never moves while a branch is being read.
      */}
      <div className="border-edge bg-surface-panel flex h-12 shrink-0 items-center justify-between gap-3 border-t px-(--text-inset)">
        <span className="text-muted-foreground text-xs tabular-nums">
          {ticked === 0 ? "Nothing ticked" : `${ticked} ticked`}
        </span>
        <div className="flex items-center gap-2">
          {dirty ? (
            <Button variant="ghost" size="sm" onClick={() => setDraft(seed)}>
              Reset
            </Button>
          ) : null}
          <Button size="sm" disabled={!dirty} onClick={() => onApply(applyTicks(conditions, draft))}>
            Apply filters
          </Button>
        </div>
      </div>
    </section>
  )
}

/**
 * What a search term finds under one attribute: the attribute's own name, or a
 * value beneath it. A nested-only hit still shows the attribute, marked,
 * because the branch is the only way to reach what matched.
 */
function searchHit(attribute: string, values: { label: string }[], query: string) {
  if (!query.trim()) {
    return { direct: false, nested: false, values: null as string[] | null, children: null as Record<string, string[]> | null }
  }
  const direct = matches(attribute, query)
  const hits: string[] = []
  // A match can be three levels down — Austria under Europe under Drug
  // Geography — so a value is kept when it matches or when one of its children
  // does, and the children it keeps are recorded so the branch can open on them.
  const children: Record<string, string[]> = {}
  for (const value of values) {
    const own = matches(value.label, query)
    const under = (childrenByValue[value.label] ?? [])
      .filter((child) => matches(child.label, query))
      .map((child) => child.label)
    if (!own && under.length === 0) continue
    hits.push(value.label)
    // A value that matches on its own keeps every child; one that only holds a
    // match shows the children that matched.
    if (!own && under.length > 0) children[value.label] = under
  }
  return { direct, nested: hits.length > 0, values: direct ? null : hits, children: direct ? null : children }
}

/**
 * One level of nesting, with the rule that traces it back to its parent — the
 * line a file tree is read by once the labels are long enough to lose the eye.
 */
function Branch({ children }: { children: React.ReactNode }) {
  // The rule is the whole of the nesting. A fill under an open branch was one
  // plane too many next to the tinted row of the attribute it belongs to.
  return <div className="border-border ml-[9px] border-l pl-2">{children}</div>
}

function Row({
  label,
  tall,
  count,
  meta,
  icon,
  open,
  onToggle,
  active,
  nested,
  checked,
  onCheck,
}: {
  label: string
  /** A first-level row, which carries more height than the values under it. */
  tall?: boolean
  count?: number
  /** A word beside the label rather than a number, as in `2 picked`. */
  meta?: string | null
  icon?: React.ReactNode
  /** Undefined for a leaf, which has nothing to open. */
  open?: boolean
  onToggle?: () => void
  active?: boolean
  /** The search matched something inside this branch rather than the row itself. */
  nested?: boolean
  checked?: boolean
  onCheck?: () => void
}) {
  return (
    <div
      className={cn(
        "hover:bg-accent relative flex items-center gap-1.5 rounded-md pr-2 transition-colors",
        active && "bg-brand-tint hover:bg-brand-tint",
        // Clear of the stroke that marks a branch holding a match.
        nested && "pl-1.5",
      )}
    >
      {/* The branch this row sits in holds a match further down. */}
      {nested ? <span className="bg-brand absolute inset-y-0.5 left-0 w-0.5 rounded-full" /> : null}

      <button
        type="button"
        onClick={onToggle}
        disabled={!onToggle}
        aria-expanded={open}
        aria-label={open === undefined ? undefined : `${open ? "Collapse" : "Expand"} ${label}`}
        className="flex size-5 shrink-0 items-center justify-center rounded disabled:cursor-default"
      >
        <ChevronRightIcon
          className={cn(
            "text-muted-foreground size-3.5 transition-transform",
            open === undefined && "invisible",
            open && "rotate-90",
          )}
          style={{ transitionDuration: `${motion.quick}ms` }}
        />
      </button>

      {/* Beside the label it belongs to, not out at the panel's edge. */}
      {onCheck ? (
        <Checkbox
          checked={checked}
          onCheckedChange={onCheck}
          aria-label={label}
          className="border-muted-foreground/50 bg-background shrink-0"
        />
      ) : null}

      <button
        type="button"
        onClick={onCheck ?? onToggle}
        className={cn(
          "flex min-w-0 flex-1 items-center gap-1.5 text-left text-[13px]",
          tall ? "py-2.5" : "py-1.5",
        )}
      >
        {icon}
        <span className={cn("truncate", active && "font-medium")}>{label}</span>
      </button>

      {meta ? <span className="text-brand-ink shrink-0 text-xs">{meta}</span> : null}
      {count !== undefined ? (
        <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
          {count.toLocaleString("en-GB")}
        </span>
      ) : null}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Ticks in, conditions out                                                    */
/* -------------------------------------------------------------------------- */

/** The query as ticks: one list of values per attribute, whatever their logic. */
function ticksFrom(conditions: Condition[]): Record<string, string[]> {
  const ticks: Record<string, string[]> = {}
  for (const condition of conditions) {
    ticks[condition.attribute] = [...(ticks[condition.attribute] ?? []), ...condition.values]
  }
  return ticks
}

function sameTicks(a: Record<string, string[]>, b: Record<string, string[]>) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)])
  for (const key of keys) {
    const left = [...(a[key] ?? [])].sort()
    const right = [...(b[key] ?? [])].sort()
    if (left.length !== right.length || left.some((value, i) => value !== right[i])) return false
  }
  return true
}

/**
 * Ticks written back into the query, on top of what is already there. A
 * condition the query holds keeps its own words — its join, whether it excludes,
 * how it meets the rest — and only its values change, so unticking `Austria`
 * under an excluded geography removes that value and leaves the exclusion
 * standing. An attribute the query did not have joins the end as a plain `and`,
 * in the order the product lists its attributes, and one left with nothing
 * ticked leaves the query.
 */
function applyTicks(conditions: Condition[], draft: Record<string, string[]>): Condition[] {
  const seen = new Set<string>()
  const kept = conditions
    .map((condition) => {
      const values = draft[condition.attribute]
      if (!values || values.length === 0) return null
      // Several conditions can share an attribute. The first takes the ticks;
      // the rest go, since the tree draws one branch per attribute.
      if (seen.has(condition.attribute)) return null
      seen.add(condition.attribute)
      return { ...condition, values }
    })
    .filter((condition): condition is Condition => condition !== null)

  const added = Object.entries(draft)
    .filter(([attribute, values]) => values.length > 0 && !seen.has(attribute))
    .sort(([a], [b]) => drugAttributeOrder.indexOf(a) - drugAttributeOrder.indexOf(b))
    .map(([attribute, values]): Condition => ({
      id: attribute,
      attribute,
      values,
      join: "or",
      mode: "is",
      link: "and",
    }))

  return [...kept, ...added]
}
