import { cn } from "@/lib/utils"

/**
 * Where a stage sits in the pipeline, and therefore what it looks like.
 *
 * Development stage is not a label, it is an ordering, and an analyst reads it
 * constantly — which of these is furthest along, how much of this column is
 * still preclinical. Rendering all thirteen values as the same grey outline
 * threw that away and made the reader parse the words one row at a time.
 *
 * So the colour encodes position rather than identity: one hue — the product's
 * own accent — deepening as the drug advances, which makes maturity scannable
 * straight down a column without anyone learning a key. Two values leave the
 * ramp because they mean something the ramp cannot say. Green is a drug that
 * arrived. Rose is one that stopped.
 *
 * Phase IV and Pre-registration share the last rung on purpose. Five steps of
 * one hue is more than an eleven-pixel badge can hold apart, and both of them
 * mean the same thing to the ordering: late.
 */
const tiers = {
  pre: "bg-stage-pre text-stage-pre-ink border-stage-pre-edge",
  early: "bg-stage-early text-stage-early-ink border-stage-early-edge",
  mid: "bg-stage-mid text-stage-mid-ink border-stage-mid-edge",
  late: "bg-stage-late text-stage-late-ink border-stage-late-edge",
  final: "bg-stage-final text-stage-final-ink border-stage-final-edge",
  live: "bg-stage-live text-stage-live-ink border-stage-live-edge",
  stopped: "bg-stage-stopped text-stage-stopped-ink border-stage-stopped-edge",
  dormant: "bg-stage-dormant text-stage-dormant-ink border-stage-dormant-edge",
} as const

type Tier = keyof typeof tiers

/**
 * The vocabulary the four directions actually use, in pipeline order. A stage
 * that is not here falls back to `pre`, which reads as "early and unremarkable"
 * rather than as an error — a prototype should not shout about its own data.
 */
const stageTier: Record<string, Tier> = {
  Discovery: "pre",
  Preclinical: "pre",
  "Pre-clinical": "pre",
  "Phase I": "early",
  "Phase II": "mid",
  "Phase III": "late",
  "Phase IV": "final",
  // Idea 2's data writes `Pre-registration`, Idea 4's writes `Pre-Registration`.
  // Both are in the sample and both have to land on the same rung.
  "Pre-registration": "final",
  "Pre-Registration": "final",
  Approved: "live",
  Marketed: "live",
  Launched: "live",
  Withdrawn: "stopped",
  Discontinued: "stopped",
  Suspended: "stopped",
  Archived: "dormant",
}

/** Exported so a direction can tint something else — a legend, a count — to match. */
export function stageTone(stage: string): string {
  return tiers[stageTier[stage] ?? "pre"]
}

/**
 * A development stage. Used by the results grids in Ideas 2, 3 and 4.
 *
 * Deliberately one size. If a grid needs it tighter, pass spacing through
 * `className` rather than adding a variant here.
 *
 * Idea 1's incumbent table shows the stage as a plain cell instead, which is
 * correct — it is a faithful port of the design being argued against, and the
 * live product has no status colour at all.
 */
export function StageBadge({ stage, className }: { stage: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-[22px] shrink-0 items-center rounded-md border px-2 text-[11px] font-medium whitespace-nowrap tabular-nums",
        stageTone(stage),
        className,
      )}
    >
      {stage}
    </span>
  )
}
