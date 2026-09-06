import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

/**
 * A development stage — Discovery, Preclinical, Phase I/II/III, Marketed,
 * Launched, Withdrawn. Three of the four directions put one of these in a
 * results grid, and a client would read four different stage treatments as
 * four different products.
 *
 * Deliberately one size. If a grid needs it tighter, pass spacing through
 * `className` rather than adding a variant here.
 */
export function StageBadge({ stage, className }: { stage: string; className?: string }) {
  return (
    <Badge variant="outline" className={cn("px-2 text-[11px] font-normal", className)}>
      {stage}
    </Badge>
  )
}
