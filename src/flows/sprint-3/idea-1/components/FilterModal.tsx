import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { FilterBuilderPane } from "@/flows/sprint-3/idea-1/components/FilterBuilderPane"
import type { GroupHandlers } from "@/flows/sprint-3/idea-1/components/FilterChips"
import type { FilterGroup } from "@/flows/sprint-3/idea-1/data"

/**
 * The modal shell: dimmed backdrop, segmented tab control, left construction
 * pane, right filter builder.
 *
 * The tabs swap the left pane and leave the builder alone, so whatever one tab
 * wrote is still there when you come back — the shared builder is the one thing
 * this design gets unambiguously right, and it only shows if you can switch.
 */
export function FilterModal({
  tab,
  groups = [],
  onTab,
  onClose,
  onClear,
  onApply,
  children,
  ...handlers
}: {
  tab: "ai" | "manual"
  groups?: FilterGroup[]
  onTab: (tab: "ai" | "manual") => void
  onClose: () => void
  onClear: () => void
  onApply: () => void
  children: React.ReactNode
} & GroupHandlers) {
  // `z-40` puts the overlay above the sticky filter bar it has to cover.
  return (
    <div className="bg-foreground/25 absolute inset-0 z-40 flex items-center justify-center px-6 py-6">
      <div className="bg-surface-raised border-edge relative flex h-full max-h-[750px] w-full max-w-[1055px] overflow-hidden rounded-2xl border shadow-2xl">
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="px-6 pt-6">
            <div className="bg-surface-sunken border-border inline-flex rounded-full border p-1">
              <Tab active={tab === "ai"} onClick={() => onTab("ai")}>
                AI filter
              </Tab>
              <Tab active={tab === "manual"} onClick={() => onTab("manual")}>
                Manual filter
              </Tab>
            </div>
          </div>
          {children}
        </div>

        <FilterBuilderPane groups={groups} onClear={onClear} onApply={onApply} {...handlers} />

        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground absolute top-5 right-5"
        >
          <XIcon className="size-4" />
        </button>
      </div>
    </div>
  )
}

function Tab({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-4 py-1.5 text-sm transition-colors",
        active
          ? "bg-brand-tint border-brand-border text-foreground"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  )
}

/** Heading block shared by both tabs. */
export function PaneHeading({ title }: { title: string }) {
  return (
    <div className="px-6 pt-6">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
    </div>
  )
}
