"use client"

import { CheckIcon, MinusIcon } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * The tick box on the right of a row in any of this idea's lists.
 *
 * Given `onClick` it is a control of its own, and the click stops there rather
 * than reaching the row underneath: the row says "this one and nothing else",
 * the box says "this one as well". Two targets in one row only work if the
 * smaller one is unmistakably a target, so it answers to hover, and it takes
 * clicks from a larger area than it draws.
 *
 * Without `onClick` it is the same mark, drawn: the row it sits in is the only
 * thing being clicked, and a screen reader hears that row's own state.
 */
export function TickBox({
  checked,
  label,
  onClick,
  disabled = false,
  negated = false,
}: {
  checked: boolean
  /**
   * The value sits in an IS NOT clause: ticked, the box takes the negation
   * tone with a minus, so a dropped value never looks like a kept one.
   */
  negated?: boolean
  /** What ticking this box would do. Required where the box is clickable. */
  label?: string
  onClick?: () => void
  disabled?: boolean
}) {
  const className = cn(
    "flex size-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors",
    // Unticked takes `ring`, the grid's resting edge, so the box is
    // visible before it is ticked rather than only after.
    checked
      ? negated
        ? "bg-negative-ink border-negative-ink text-primary-foreground"
        : "bg-selected border-selected text-selected-foreground"
      : "border-ring",
    disabled && "opacity-50",
  )
  const mark = checked ? (
    negated ? (
      <MinusIcon className="size-3" />
    ) : (
      <CheckIcon className="size-3" />
    )
  ) : null

  if (!onClick) {
    return (
      <span aria-hidden className={className}>
        {mark}
      </span>
    )
  }

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation()
        onClick()
      }}
      className={cn(
        className,
        // The hit area is 32px square around the 16px mark, drawn by a
        // pseudo-element that belongs to the button, so a near miss still
        // lands on the box instead of falling through to the row and
        // replacing the clause's values. 8px out on every side meets the
        // edges of a 32px list row exactly, so it never reaches the rows
        // above or below, and on the left it stops in the gap before the count.
        "relative after:absolute after:-inset-2",
        !disabled &&
          (checked
            ? negated
              ? "hover:opacity-90"
              : "hover:bg-selected-hover hover:border-selected-hover"
            : "hover:border-muted-foreground"),
      )}
    >
      {mark}
    </button>
  )
}
