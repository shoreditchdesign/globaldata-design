import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * An applied filter, with its own remove control.
 *
 * Every direction shows the query back as removable objects, so the pill is the
 * one shape a client sees on all four screens. It takes children rather than a
 * label because what goes inside differs: a bare value in Idea 2, a whole
 * subject–operator–value phrase in Idea 4, a value and its count in Idea 1.
 *
 * The variants say what the pill *means*, not what it looks like:
 *
 *   applied  — a condition that is on. Carries the accent, because the accent
 *              is what "on" looks like everywhere in this product.
 *   excluded — a condition that takes rows away. It cannot look identical to
 *              one that keeps them; a bar of grey chips where half are `is not`
 *              is a bar you have to read word by word.
 *   muted    — the incumbent's plainer chip, kept so Idea 1 can read as the
 *              current product without forking the component.
 */
export function FilterPill({
  children,
  variant = "applied",
  removable = true,
  removeLabel = "Remove filter",
  className,
}: {
  children: React.ReactNode
  variant?: "applied" | "excluded" | "muted"
  removable?: boolean
  /** Accessible name for the remove control, e.g. `Remove therapy area filter`. */
  removeLabel?: string
  className?: string
}) {
  const negative = variant === "excluded"
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full",
        variant === "muted"
          ? "bg-muted text-foreground py-1 pr-1.5 pl-3 text-sm"
          : "h-6 border pr-1 pl-2.5 text-[12px] font-medium",
        variant === "applied" && "bg-brand-tint border-brand-border text-brand-ink",
        negative && "bg-negative border-negative-border text-negative-ink",
        className,
      )}
    >
      {children}
      {removable ? (
        <button
          type="button"
          data-slot="filter-pill-remove"
          aria-label={removeLabel}
          className={cn(
            "ml-0.5 flex size-4 shrink-0 items-center justify-center rounded-full transition-colors",
            variant === "muted"
              ? "text-muted-foreground hover:bg-accent hover:text-foreground"
              : negative
                ? "text-negative-ink/60 hover:bg-negative-border hover:text-negative-ink"
                : "text-brand-ink/60 hover:bg-brand-border hover:text-brand-ink",
          )}
        >
          <XIcon className="size-3" />
        </button>
      ) : null}
    </span>
  )
}

/**
 * A plain-language connective between pills — `is`, `and`, `or`, `is not`.
 *
 * Muted and unstyled on purpose: the values are the objects you grab, the words
 * are the grammar holding them together. Idea 3's operator words are a
 * different animal — they are the direction's whole argument and are
 * interactive — so that one stays local to Idea 3.
 */
export function OperatorWord({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <span className={cn("text-muted-foreground text-[12px]", className)}>{children}</span>
}
