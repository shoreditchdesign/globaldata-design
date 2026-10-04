import { cn } from "@/lib/utils"

/**
 * The table's loading mark: a ring in the brand accent whose tail fades out
 * behind its head, so it reads as something turning rather than an icon
 * spinning. A conic gradient from clear to brand, cut to a ring by a mask —
 * the mask only reads alpha, so the colour it is given is immaterial.
 *
 * Under reduced motion it holds still, and the arc alone still says "working".
 */
export function Loader({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        "block size-9 animate-spin rounded-full motion-reduce:animate-none",
        "bg-[conic-gradient(from_0deg,transparent_10%,var(--color-brand))]",
        "[mask:radial-gradient(farthest-side,transparent_calc(100%-3.5px),var(--color-foreground)_calc(100%-3px))]",
        className,
      )}
    />
  )
}
