import { FilterIcon, SearchIcon, type LucideIcon } from "lucide-react"

import type { SearchMode } from "@/flows/sprint-4/idea-1c/state"
import { cn } from "@/lib/utils"

/**
 * Search or Advanced filter, as a segmented control. Back in place of the
 * Advanced switch, which testers missed: two named tabs say there are two ways
 * in without the reader having to guess what a switch turns on.
 *
 * A tab is not a checked control, so the mode it is on takes the washed brand
 * (tint, brand edge, foreground text) rather than the solid accent the first
 * version of these tabs used. Hover is grey.
 */
export function SearchTabs({
  mode,
  onModeChange,
  disabled,
  className,
}: {
  mode: SearchMode
  onModeChange: (mode: SearchMode) => void
  disabled?: boolean
  className?: string
}) {
  return (
    <div
      role="tablist"
      aria-label="Search method"
      className={cn(
        "bg-surface-sunken border-border inline-flex w-fit shrink-0 items-center gap-0.5 rounded-lg border p-0.5",
        className,
      )}
    >
      <SearchTab
        active={mode === "quick"}
        disabled={disabled}
        onClick={() => onModeChange("quick")}
        icon={SearchIcon}
      >
        Search
      </SearchTab>
      <SearchTab
        active={mode === "manual"}
        disabled={disabled}
        onClick={() => onModeChange("manual")}
        icon={FilterIcon}
      >
        Advanced filter
      </SearchTab>
    </div>
  )
}

function SearchTab({
  active,
  disabled,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean
  disabled?: boolean
  onClick: () => void
  /** What the tab searches with: the field, or the filters themselves. */
  icon: LucideIcon
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex h-7 items-center justify-center gap-1.5 rounded-md border px-3 text-[13px] font-medium transition-colors disabled:cursor-not-allowed",
        active
          ? "bg-brand-tint border-brand-border text-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-foreground disabled:hover:text-muted-foreground border-transparent disabled:hover:bg-transparent",
      )}
    >
      <Icon className="size-3 shrink-0" aria-hidden />
      {children}
    </button>
  )
}
