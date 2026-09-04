import { cn } from "@/lib/utils"

const widths = {
  desktop: "max-w-[1280px]",
  tablet: "max-w-[834px]",
  mobile: "max-w-[420px]",
} as const

/**
 * Neutral canvas the screen designs sit inside. Keeps every prototype at a
 * consistent width so two ideas can be compared without visual noise.
 */
export function ScreenFrame({
  viewport = "desktop",
  className,
  children,
}: {
  viewport?: keyof typeof widths
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex justify-center">
      <div
        className={cn(
          "bg-background w-full overflow-hidden rounded-xl border shadow-sm",
          widths[viewport],
          className,
        )}
      >
        {children}
      </div>
    </div>
  )
}
