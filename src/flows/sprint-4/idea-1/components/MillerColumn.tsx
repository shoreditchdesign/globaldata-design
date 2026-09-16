"use client"

import { ChevronRightIcon } from "lucide-react"

import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { motion, tintClass, useSettle } from "@/components/prototype/motion"

/**
 * Counts above ten thousand compact so the number lane stays one width. A row
 * with no number at all — a free-text attribute, which has no value list to
 * count — shows an em dash; a row with a real zero shows `0`, because zero is
 * an answer and a dash is not.
 */
export function formatCount(n: number) {
  if (n < 10_000) return n.toLocaleString("en-GB")
  return `${(n / 1000).toFixed(1)}k`
}

/** One row of a column: a label, what it would yield, and whether it opens. */
export interface ColumnRow {
  label: string
  /** Rows this label would leave, in the context of the rest of the query. */
  count: number | null
  /** True when the row opens a further column rather than only being ticked. */
  drillable?: boolean
}

export interface ColumnModel {
  /** Stable key — also the parent node this column hangs off. */
  key: string
  /** What the rows are, e.g. `Attribute`, `Therapy area`, `Indication`. */
  level: string
  items: ColumnRow[]
  /** Values ticked in this column. */
  selected?: string[]
  /** The row whose children are open in the column to the right. */
  open?: string
  /** Whether rows carry a tick box. Areas and attributes are navigation only. */
  selectable?: boolean
  /**
   * The attribute this column ticks into is excluded rather than kept, so its
   * numbers say what a value would drop, not what it would leave.
   */
  negated?: boolean
  /** Free-text attributes have no value list, so the column has no rows. */
  search?: boolean
  /** What the number lane counts. The filter areas are whole records, not drugs. */
  unit?: string
  /** Columns carrying the long labels take a larger share of the panel. */
  wide?: boolean
}

/** The number lane is sized to the widest count in the column, not globally. */
function countLane(items: ColumnRow[], negated = false) {
  const longest = items.reduce(
    (n, item) =>
      Math.max(n, item.count === null ? 1 : formatCount(item.count).length + (negated ? 1 : 0)),
    0,
  )
  if (longest <= 3) return "w-8"
  if (longest <= 5) return "w-12"
  return "w-14"
}

/**
 * One level of the drill-down. Rows use fixed-width lanes — lead, label,
 * count, chevron — and the column header sits on the same lanes, so the
 * numbers line up down the panel and the headings line up across it.
 *
 * Every row in every column reads the same way: control, label, count. The lead
 * lane holds exactly one thing and is never empty — a tick box where the column
 * ticks values into the query, a radio mark where it only navigates — so a
 * number appears once per row, on the right, and never on both sides of a label.
 *
 * A value row is two controls in one line: the box ticks the value into the
 * query, the rest of the row opens what is underneath it. Rows with nothing
 * underneath tick from anywhere along the row, since there is nothing else
 * for a click to mean.
 */
export function MillerColumn({
  column,
  onOpen,
  onToggle,
  className,
}: {
  column: ColumnModel
  onOpen: (label: string) => void
  onToggle?: (label: string) => void
  className?: string
}) {
  const selected = new Set(column.selected ?? [])
  const lane = countLane(column.items, column.negated)
  const hasDrill = column.items.some((item) => item.drillable)

  return (
    <div
      className={cn(
        // A floor on the column width — below it the labels stop being
        // readable, and the strip scrolls the way Finder's does instead. At
        // 260px a leaf column has 188px of label lane and a drillable one
        // 172px, and the rows read at 13px now rather than 16px, so the floor
        // buys a three-word indication where it used to buy two; the panel is
        // sized so it is only reached on a window narrower than any desk.
        "flex min-w-[260px] flex-col",
        // Every column body is the same grey. The split that used to put the
        // navigation columns on chrome and the value columns on the panel plane
        // read as arbitrary from across the screen — some columns grey, some
        // white, for a reason no one could see — so the white is now the header
        // block above and the colour is the columns, uniformly.
        "bg-surface-page",
        column.wide ? "flex-[1.25]" : "flex-1",
        className,
      )}
    >
      {/* The caption band is the head of the columns, not the last line of the
          search block, so it is ruled off on both sides: `border-edge` above it
          separates it from the breadcrumb and the field, and `border-edge`
          below closes the white header block off against the column grey.
          Without the top rule it floated between the two. */}
      <div className="bg-surface-panel border-edge flex h-8 shrink-0 items-center gap-1.5 border-y pr-1.5 pl-2">
        <span className="w-3 shrink-0" aria-hidden />
        {/* One ink for every caption. Which column you are ticking into is said
            by the tick boxes in it, not by a heading two shades darker than its
            neighbour's. */}
        <span className="text-muted-foreground min-w-0 flex-1 truncate text-[10px] font-medium tracking-[0.08em] uppercase">
          {column.level}
        </span>
        {column.search ? null : (
          <>
            <span
              className={cn(
                "shrink-0 text-right text-[10px] font-medium tracking-[0.08em] uppercase",
                // An excluding column counts what a value would take away, so
                // it says so in the tone that means "out" rather than in the
                // same grey as a column that adds.
                column.negated ? "text-negative-ink" : "text-muted-foreground",
              )}
            >
              {column.negated ? "Excludes" : (column.unit ?? "Drugs")}
            </span>
            {hasDrill ? <span className="w-4 shrink-0" aria-hidden /> : null}
          </>
        )}
      </div>

      {column.search ? (
        <p className="text-muted-foreground px-3 py-1 text-xs leading-relaxed">
          Free text — no value list.
        </p>
      ) : (
        <ul className="min-h-0 flex-1 overflow-y-auto px-1 pt-1 pb-2">
          {/* Only reachable from the panel search: every column has rows of its
              own, so an empty list means the query matched none of them. */}
          {column.items.length === 0 ? (
            <li className="text-muted-foreground px-2 py-1 text-xs">No matches</li>
          ) : null}
          {column.items.map((item) => (
            <ColumnItem
              key={item.label}
              item={item}
              column={column}
              lane={lane}
              hasDrill={hasDrill}
              isSelected={selected.has(item.label)}
              onOpen={onOpen}
              onToggle={onToggle}
            />
          ))}
        </ul>
      )}
    </div>
  )
}

/**
 * One row of a column.
 *
 * Its own component so it can hold a beat of state: when a value goes from off
 * to on it lights, then settles. That matters most when the agent is driving —
 * the columns travel to an attribute and then values start ticking on their
 * own, and without the flash the only tell that anything happened is a tick box
 * changing colour four rows down. It is the same beat Idea 3 uses when a phrase
 * hardens, spent here on a value being taken into the query.
 *
 * Nothing about it is load-bearing: the tick box, the count and the label are
 * all correct the instant the value changes, whether or not the flash is drawn.
 */
function ColumnItem({
  item,
  column,
  lane,
  hasDrill,
  isSelected,
  onOpen,
  onToggle,
}: {
  item: ColumnRow
  column: ColumnModel
  lane: string
  hasDrill: boolean
  isSelected: boolean
  onOpen: (label: string) => void
  onToggle?: (label: string) => void
}) {
  const isOpen = column.open === item.label
  const empty = item.count === 0
  // With nothing underneath it, the row body has only one job.
  const bodyTicks = Boolean(column.selectable && onToggle && !item.drillable)
  const negated = Boolean(column.negated)
  // Lit for a beat after this value is taken into the query — never on the way
  // out, because a value leaving does not need to be found on screen.
  const justTicked = useSettle(isSelected, motion.hold) && isSelected

  return (
    <li
      className={cn(
        // The transparent edge is carried by every row so that the open row can
        // colour one in without insetting its lanes a pixel further than its
        // neighbours' — the count lane has to stay plumb down the column.
        "relative flex h-8 items-center rounded-md border border-transparent",
        tintClass,
        // Hover is grey on every row you can still move to, a ticked one
        // included — a `hover:` class outranks a flat one, so no row is left
        // dead under the cursor. An excluding column hovers in its own tone,
        // because grey there would read as the row stepping out of the
        // exclusion it is part of.
        !isOpen && (negated && isSelected ? "hover:bg-negative" : "hover:bg-accent"),
        // Ticked into the query, not drilled into: an including row carries no
        // fill at all. The tick box is solid brand the moment it is checked and
        // that is the whole signal — a pale wash under it said the same thing a
        // second time, more faintly. An excluding row keeps its rose fill,
        // because the tone is the only thing separating a value being dropped
        // from one being kept, and that distinction outranks the tidying.
        isSelected && !isOpen && negated && "bg-negative/60",
        // Just taken into the query: a grey beat, then it settles. The flash
        // says *something moved here*, which is a position rather than a state,
        // so it does not spend the accent.
        justTicked && !isOpen && (negated ? "bg-negative" : "bg-accent"),
        // Drilled into: the washed brand with an edge of its own. The edge is
        // what the 2px brand rail used to do, and it draws the whole row rather
        // than one side of it, so the open column reads as open from across the
        // panel without a second, louder blue on screen.
        isOpen && (negated ? "bg-negative" : "bg-brand-tint border-brand-border"),
        // The rail survives on an excluding row only: rose at 0.026 chroma is a
        // paler fill than the brand tint, so the exclusion keeps the harder
        // marker it already had.
        isOpen &&
          negated &&
          "before:bg-negative-ink before:absolute before:top-1 before:bottom-1 before:left-0 before:w-[2px] before:rounded-full",
      )}
    >
      {/* Lead lane: one control, always. A tick box where the column ticks, a
          radio mark where it only navigates. Never a number — the count lane on
          the right is the only place a number belongs. */}
      <span className="flex w-5 shrink-0 items-center justify-center">
        {column.selectable && onToggle ? (
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggle(item.label)}
            aria-label={`${isSelected ? "Remove" : "Add"} ${item.label}`}
            className={cn(
              // 14px, with the tick inside it cut to 12px: the box comes down
              // with the type it sits beside rather than staying the one thing
              // in the column still sized for the 16px round.
              "size-3.5 [&>[data-slot=checkbox-indicator]>svg]:size-3",
              // White, not the column's grey. An unticked box on
              // `bg-surface-page` was an outline on a fill a shade off it and
              // all but disappeared; the client chose to light the box rather
              // than to lift the column. Ticked is untouched — the brand fill
              // carries its own attribute variant, so it outranks this.
              "bg-surface-panel",
              // Ticking a value into an excluding attribute takes rows away.
              // It cannot look like ticking one into an attribute that keeps
              // them — that is the whole difference between the two filters.
              negated &&
                "data-checked:border-negative-ink data-checked:bg-negative-ink data-checked:text-background",
            )}
          />
        ) : (
          // A navigation column ticks nothing, so the lane says where the path
          // is instead: one mark per row, filled on the row whose children are
          // open to the right. Its core is `selected`, the same token the tick
          // boxes one column over resolve to, so the two lead lanes read as one
          // family of controls rather than a blue box beside a black dot.
          //
          // Not a `RadioGroup`. The row already has two click targets, the box
          // and the label, and a real radio input would compete with the label
          // button for the same gesture to say the same thing.
          //
          // Decorative: the row's `aria-current` below is what a screen reader
          // hears, so the mark is hidden from it rather than announced twice.
          <span
            aria-hidden
            className={cn(
              "border-border flex size-3.5 items-center justify-center rounded-full border",
              tintClass,
            )}
          >
            {isOpen ? (
              <span className={cn("bg-selected size-1.5 rounded-full", tintClass)} />
            ) : null}
          </span>
        )}
      </span>

      <button
        type="button"
        onClick={() => {
          if (bodyTicks) onToggle?.(item.label)
          else if (item.drillable) onOpen(item.label)
        }}
        title={item.label}
        aria-current={isOpen ? "true" : undefined}
        // `h-full`, not `h-8`: the row owns the 32px now that it carries a
        // border, and a second fixed 32px inside a 30px content box would
        // overflow it.
        className="flex h-full min-w-0 flex-1 items-center gap-1.5 pr-1.5 text-left"
      >
        <span
          className={cn(
            "min-w-0 flex-1 truncate text-[13px] text-foreground",
            // Weight is what `selected` means in both kinds of column: in a
            // value column the value is in the query, in a navigation column
            // the branch under the row holds values. That second reading is the
            // job the lead-lane count badge used to do, and weight does it
            // without putting a second number on the row or spending a colour.
            isSelected && "font-medium",
            // A zero is an answer: this value would leave nothing, so the row
            // recedes rather than reading as an equal option. It recedes by a
            // whole named rung, not a fraction of one — the label is where the
            // zero is read, so it is the label that steps back.
            empty && !isSelected && "text-muted-foreground",
          )}
        >
          {item.label}
        </span>
        <span
          className={cn(
            "shrink-0 text-right text-xs tabular-nums",
            lane,
            // The number is read, not pressed, so it is not the accent's to
            // spend: a value in the query states its count in full ink, an
            // excluded one in the tone that says what it drops, and everything
            // else sits at `muted-foreground`.
            isSelected
              ? negated
                ? "text-negative-ink"
                : "text-foreground"
              : "text-muted-foreground",
          )}
        >
          {item.count === null
            ? "—"
            : negated && item.count > 0
              ? `−${formatCount(item.count)}`
              : formatCount(item.count)}
        </span>
        {hasDrill ? (
          <span className="flex w-4 shrink-0 justify-center">
            {item.drillable ? (
              <ChevronRightIcon
                // Full ink on the row that is open, muted on the rest. Two
                // named rungs rather than the accent and a fraction of grey.
                className={cn("size-4", isOpen ? "text-foreground" : "text-muted-foreground")}
              />
            ) : null}
          </span>
        ) : null}
      </button>
    </li>
  )
}
