import { FilterIcon, SearchIcon, type LucideIcon } from "lucide-react"

import type { SearchMode } from "@/flows/sprint-4/idea-1b/state"
import { cn } from "@/lib/utils"

/** Quick search or advanced search, as a segmented control. */
export function SearchTabs({
  mode,
  onModeChange,
  className,
}: {
  mode: SearchMode
  onModeChange: (mode: SearchMode) => void
  className?: string
}) {
  return (
    <div
      role="tablist"
      aria-label="Search method"
      className={cn(
        "bg-surface-sunken border-border inline-flex w-fit items-center gap-0.5 rounded-lg border p-0.5",
        className,
      )}
    >
      <SearchTab
        active={mode === "quick"}
        onClick={() => onModeChange("quick")}
        icon={SearchIcon}
      >
        Quick search
      </SearchTab>
      <SearchTab
        active={mode === "manual"}
        onClick={() => onModeChange("manual")}
        icon={FilterIcon}
      >
        Advanced search
      </SearchTab>
    </div>
  )
}

function SearchTab({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean
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
      onClick={onClick}
      className={cn(
        "flex h-7 items-center justify-center gap-1.5 rounded-md px-3 text-[13px] font-medium transition-colors",
        active
          // The accent the arrow in the search field is filled with, on the
          // mode the field is in: the two are the same decision seen twice.
          ? "bg-primary text-primary-foreground shadow-panel"
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
      )}
    >
      <Icon className="size-3 shrink-0" />
      {children}
    </button>
  )
}
