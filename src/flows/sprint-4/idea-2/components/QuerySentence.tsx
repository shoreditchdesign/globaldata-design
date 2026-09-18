"use client"

import * as React from "react"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { liftClass, tintClass } from "@/components/prototype/motion"
import {
  applyDrop,
  canMerge,
  type DragPayload,
  type DropTarget,
} from "@/flows/sprint-4/idea-2/arrange"
import { type Condition } from "@/flows/sprint-4/idea-2/data"
import { attributeWord, clauseWords, continues, operatorWord } from "@/flows/sprint-4/idea-2/grammar"
import {
  type Resolved,
  useArrange,
  useDropSurface,
  useReflow,
} from "@/flows/sprint-4/idea-2/components/Arrange"
import { type QueryHandlers } from "@/flows/sprint-4/idea-2/components/ValueMenu"

/**
 * Whether a pill or a clause can be dragged to regroup the query.
 *
 * Off for this round: the sentence is read and cleared, not rearranged. The
 * drag itself, its drop targets and the settle after it are all still here and
 * still wired — the flag is the only thing holding them shut — so turning
 * arranging back on is this line and nothing else.
 */
export const ARRANGE_ENABLED = false

/** The whole condition, as a line of words, for the ghost that follows the pointer. */
const clauseLabel = (condition: Condition) => clauseWords(condition)

/**
 * A value. Filled, so it reads as an object in its own right, and with
 * `ARRANGE_ENABLED` it is one you can pick up. In a group of values it carries
 * just itself, to be pulled out into
 * a condition of its own or merged into another group on the same attribute.
 * Alone in its condition it carries the whole condition, which can be
 * reordered or merged but has nothing to be pulled out of.
 *
 * It opens nothing. Values are picked on the logic gate canvas; the sentence
 * shows how the conditions group, and lets them be regrouped and cleared.
 */
function ValuePill({
  condition,
  value,
  handlers,
  arrangeable,
}: {
  condition: Condition
  value: string
  handlers: QueryHandlers
  arrangeable: boolean
}) {
  const context = useArrange()
  const single = condition.values.length < 2
  const payload: DragPayload = single
    ? { kind: "condition", id: condition.id }
    : { kind: "value", id: condition.id, value }
  const dragged =
    context?.drag?.payload.kind === "value" &&
    context.drag.payload.id === condition.id &&
    context.drag.payload.value === value
  const grabbable = arrangeable && context !== null

  return (
    <span
      className={cn(
        "group/pill relative mr-1 -ml-0.5 inline-flex align-baseline transition-opacity",
        dragged && "opacity-40",
      )}
    >
      <span
        onPointerDown={
          grabbable ? (event) => context.beginDrag(event, payload, single ? clauseLabel(condition) : value) : undefined
        }
        className={cn(
          // Its own line height, not the sentence's. Inheriting it made the pill
          // as tall as the line box it sits in, so opening the lines up opened
          // the pills with them and two lines of values still touched.
          "text-foreground bg-brand-tint border-brand-border group-hover/pill:shadow-panel inline-flex items-center gap-1 rounded-md border px-1.5 leading-[1.9] font-medium transition-[background-color,box-shadow] select-none",
          grabbable && "cursor-grab active:cursor-grabbing",
        )}
      >
        {value}
        {/* Holds the room the clear button appears in, so hovering a value
            never reflows the sentence. */}
        <span aria-hidden className="size-[0.55em]" />
      </span>
      {/* The last value takes its condition with it. */}
      <button
        type="button"
        aria-label={`Remove ${value}`}
        onClick={() => handlers.onToggleValue(condition.id, condition.attribute, value)}
        className={cn(
          "focus-visible:ring-ring/50 absolute top-1/2 right-[3px] flex size-[0.8em] -translate-y-1/2 items-center justify-center rounded-sm opacity-0 outline-none group-focus-within/pill:opacity-100 group-hover/pill:opacity-100 focus-visible:opacity-100 focus-visible:ring-2",
          liftClass,
          "text-brand-ink hover:bg-brand-border",
        )}
      >
        <XIcon className="size-[0.55em]" />
      </button>
    </span>
  )
}

/**
 * A logic word, read rather than set: operators are changed on the canvas.
 * An excluded value wears the same pill as an included one, so the word that
 * drops rows is the whole of the difference — full-strength text at a heavier
 * weight beside the muted words around it.
 */
function LogicWord({
  children,
  negated,
  lit,
  onDragStart,
}: {
  children: React.ReactNode
  negated?: boolean
  /** Just made by a drop, and lit for a beat so it is obvious what changed. */
  lit?: boolean
  /** Present when the word is also the handle that drags its whole condition. */
  onDragStart?: (event: React.PointerEvent<HTMLSpanElement>) => void
}) {
  return (
    <span
      onPointerDown={
        onDragStart
          ? (event) => {
              event.preventDefault()
              onDragStart(event)
            }
          : undefined
      }
      className={cn(
        "-mx-0.5 rounded-md px-0.5",
        tintClass,
        negated ? "text-foreground font-semibold" : "text-muted-foreground",
        onDragStart && "hover:bg-accent cursor-grab select-none active:cursor-grabbing",
        lit && "bg-brand-tint text-brand-ink ring-brand-border ring-1",
      )}
    >
      {children}
    </span>
  )
}

/**
 * One condition, and the whole of the wrapping rule: the clause never splits
 * across a line, so the only break opportunities are the gaps between clauses.
 * Those gaps are also where a dragged condition or value can land, drawn as a
 * caret in the space rather than a box that would reflow the line.
 */
function ClauseSpan({
  condition,
  carriesOn,
  first,
  comma,
  handlers,
  removable,
  arrangeable,
  track,
}: {
  condition: Condition
  /** The clause before was the same attribute, kept where this one drops. */
  carriesOn: boolean
  first: boolean
  /** Another condition follows. The comma rides inside this clause's nowrap unit. */
  comma: boolean
  handlers: QueryHandlers
  removable: boolean
  arrangeable: boolean
  track: (element: HTMLElement | null) => void
}) {
  const negated = condition.mode === "is not"
  const context = useArrange()
  const drag = context?.drag
  const landed = context?.landed?.id === condition.id ? context.landed.part : null
  const dragged = drag?.payload.kind === "condition" && drag.payload.id === condition.id
  const mergeTarget = drag?.target?.kind === "merge" && drag.target.id === condition.id

  return (
    // The join and the clause it introduces wrap as one unit, so a line never
    // ends on a dangling `and` with its condition on the next. Inline-block, so
    // the settle after a drop can move it as one piece.
    <span
      ref={track}
      data-condition={condition.id}
      className={cn("inline-block whitespace-nowrap transition-opacity", dragged && "opacity-40")}
    >
      {first ? null : (
        <>
          {/* How this condition meets the ones before it. A clause on the same
              attribute is the same breath, so it reads `but` and does not name
              the attribute again. */}
          <LogicWord lit={landed === "link"}>{carriesOn ? "but" : condition.link}</LogicWord>{" "}
        </>
      )}
      <span
        className={cn(
          "group/clause relative -mx-1 rounded-md px-1 whitespace-nowrap",
          tintClass,
          (mergeTarget || landed === "clause") && "bg-brand-wash ring-brand-border ring-1",
        )}
      >
        {/*
          The head of the clause — the attribute and whether it keeps or drops —
          is one control: hovering underlines it, pressing it flips `is` and
          `is not`. Underlined rather than filled, so the only fill in the
          sentence stays the values, and padded so the rule stops short of the
          pill beside it. It is also the handle the whole condition drags by.
        */}
        <button
          type="button"
          onClick={() => handlers.onSetMode(condition.id, negated ? "is" : "is not")}
          onPointerDown={
            arrangeable && context
              ? (event) => {
                  event.preventDefault()
                  context.beginDrag(event, { kind: "condition", id: condition.id }, clauseLabel(condition))
                }
              : undefined
          }
          aria-label={`${condition.attribute}: ${negated ? "excluding" : "including"} these values`}
          className={cn(
            // Hovering brings the attribute up to full strength rather than
            // underlining it: the rule sat too close to the pill beside it, and
            // a control the pointer is on should read as more, not less. The
            // operator keeps its own colour throughout.
            "text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 -mx-1 cursor-pointer rounded-md px-1 outline-none focus-visible:ring-3",
            tintClass,
          )}
        >
          {carriesOn ? null : <>{attributeWord(condition)} </>}
          {/*
            The operator carries the meaning in colour rather than in weight:
            the brand for a clause that keeps rows, the negation tone for one
            that drops them. Bolding it made the clause shout across the line.
          */}
          <span className={negated ? "text-negative-ink" : "text-brand-ink"}>
            {operatorWord(condition)}
          </span>
        </button>{" "}
        {condition.values.map((value, i) => (
          <React.Fragment key={value}>
            {i > 0 ? (
              <>
                {" "}
                <LogicWord lit={landed === "join"}>{condition.join}</LogicWord>{" "}
              </>
            ) : null}
            <ValuePill condition={condition} value={value} handlers={handlers} arrangeable={arrangeable} />
          </React.Fragment>
        ))}
        {comma ? <span className="-ml-0.5">,</span> : null}

        {removable ? (
          <button
            type="button"
            aria-label={`Remove ${condition.attribute} condition`}
            onClick={() => handlers.onRemoveCondition(condition.id)}
            className="text-muted-foreground hover:text-foreground hover:border-edge bg-surface-raised border-border shadow-panel absolute -top-2.5 -right-1 z-10 flex size-4 items-center justify-center rounded-full border opacity-0 transition-opacity group-hover/clause:opacity-100 focus-visible:opacity-100"
          >
            <XIcon className="size-2.5" />
          </button>
        ) : null}
      </span>
    </span>
  )
}

/**
 * Where a drag over the sentence would land. The pointer picks the line it is
 * on, then the clause under it: the outer third of a clause (at least 14px) is
 * the gap on that side, and the middle is the clause itself — a merge if it is
 * a group on the same attribute, refused otherwise. Refused and no-op drops
 * return null, so no caret shows and the drag springs back.
 */
function resolveSentence(
  x: number,
  y: number,
  payload: DragPayload,
  conditions: Condition[],
  container: HTMLElement | null,
): Resolved | null {
  if (!container) return null
  const rects = conditions.map(
    (condition) =>
      container.querySelector<HTMLElement>(`[data-condition="${CSS.escape(condition.id)}"]`)?.getBoundingClientRect() ??
      null,
  )
  if (rects.length === 0 || rects.some((rect) => !rect)) return null
  const boxes = rects as DOMRect[]

  let nearest = 0
  let distance = Infinity
  boxes.forEach((rect, i) => {
    const d = y < rect.top ? rect.top - y : y > rect.bottom ? y - rect.bottom : 0
    if (d < distance) {
      distance = d
      nearest = i
    }
  })
  const lineTop = boxes[nearest].top
  const line = boxes
    .map((rect, i) => ({ rect, i }))
    .filter(({ rect }) => Math.abs(rect.top - lineTop) < rect.height / 2)

  let gap: number | null = null
  let merge: number | null = null
  const head = line[0]
  const tail = line[line.length - 1]
  if (x < head.rect.left) gap = head.i
  else if (x > tail.rect.right) gap = tail.i + 1
  else {
    const hit = line.find(({ rect }) => x >= rect.left && x <= rect.right)
    if (!hit) {
      // In the space between two clauses.
      gap = line.find(({ rect }) => rect.left > x)?.i ?? tail.i + 1
    } else {
      const zone = Math.min(Math.max(hit.rect.width * 0.3, 14), hit.rect.width / 2)
      if (x < hit.rect.left + zone) gap = hit.i
      else if (x > hit.rect.right - zone) gap = hit.i + 1
      else merge = hit.i
    }
  }

  if (merge !== null) {
    const target = conditions[merge]
    if (!canMerge(conditions, payload, target.id)) return null
    const rect = boxes[merge]
    return {
      target: { kind: "merge", id: target.id },
      indicator: { kind: "merge", x: rect.left + rect.width / 2, y: rect.top + rect.height * 0.15 },
    }
  }

  const index = gap as number
  const target: DropTarget = { kind: "gap", index }
  if (!applyDrop(conditions, payload, target)) return null

  // Midway through the space when both sides share the line; otherwise just
  // outside whichever side is on the pointer's line.
  const before = boxes[index - 1]
  const after = boxes[index]
  const onLine = (rect?: DOMRect) => rect && Math.abs(rect.top - lineTop) < rect.height / 2
  let caretX: number
  let rect: DOMRect
  if (before && after && Math.abs(before.top - after.top) < after.height / 2) {
    caretX = (before.right + after.left) / 2
    rect = after
  } else if (after && (onLine(after) || !before)) {
    caretX = after.left - 3
    rect = after
  } else {
    caretX = before.right + 3
    rect = before
  }
  return {
    target,
    indicator: {
      kind: "caret",
      orientation: "vertical",
      x: caretX,
      y: rect.top + rect.height * 0.2,
      length: rect.height * 0.6,
    },
  }
}

export function QuerySentence({
  conditions,
  handlers,
  arrangeable = true,
  suggestions = [],
  onAddSuggestion,
}: {
  conditions: Condition[]
  handlers: QueryHandlers
  /** Off for the resolve animation, which draws the sentence but must not edit it. */
  arrangeable?: boolean
  /** Nearest values for phrases the reading could not place, offered in place. */
  suggestions?: { attribute: string; value: string }[]
  onAddSuggestion?: (attribute: string, value: string) => void
}) {
  const context = useArrange()
  const { container, track } = useReflow(context?.landed?.token)
  // The one place the flag meets the prop: nothing below this line asks whether
  // arranging is switched on, only whether this sentence is arrangeable.
  const arrange = ARRANGE_ENABLED && arrangeable
  useDropSurface(
    "sentence",
    container,
    (x, y, payload) => resolveSentence(x, y, payload, conditions, container.current),
    arrange,
  )

  return (
    <p
      ref={container as React.RefObject<HTMLParagraphElement | null>}
      className="max-w-[74ch] text-[22px] leading-[2.23] font-normal tracking-[-0.01em]"
    >
      {conditions.map((condition, i) => (
        <React.Fragment key={condition.id}>
          {/* Outside the clause's nowrap unit: the only place a line may break. */}
          {i > 0 ? " " : null}
          <ClauseSpan
            condition={condition}
            carriesOn={continues(condition, conditions[i - 1])}
            first={i === 0}
            comma={i < conditions.length - 1 && !continues(conditions[i + 1], condition)}
            handlers={handlers}
            removable={conditions.length > 1}
            arrangeable={arrange}
            track={track(condition.id)}
          />
        </React.Fragment>
      ))}
      {/*
        A phrase the reading could not place, offered as the clause it would
        have been: faded into the line rather than listed under it, the way the
        composer ghosts the rest of a query. Pressing it makes it real.
      */}
      {suggestions.map((suggestion) => (
        <span key={`${suggestion.attribute}:${suggestion.value}`} className="whitespace-nowrap">
          {" "}
          <button
            type="button"
            onClick={() => onAddSuggestion?.(suggestion.attribute, suggestion.value)}
            className="text-muted-foreground/70 hover:text-foreground focus-visible:ring-ring/50 -mx-1 cursor-pointer rounded-md px-1 transition-colors outline-none focus-visible:ring-3"
          >
            and {suggestion.attribute} is{" "}
            <span className="text-brand-ink/60 font-medium">{suggestion.value}</span>
          </button>
        </span>
      ))}
    </p>
  )
}
