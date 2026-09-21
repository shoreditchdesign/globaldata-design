import type { SearchMode } from "@/flows/sprint-4/idea-1/state"
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
      <SearchTab active={mode === "quick"} onClick={() => onModeChange("quick")}>
        Quick search
      </SearchTab>
      <SearchTab active={mode === "manual"} onClick={() => onModeChange("manual")}>
        Advanced search
      </SearchTab>
    </div>
  )
}

function SearchTab({
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
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "flex h-7 items-center justify-center rounded-md px-3 text-[13px] font-medium transition-colors",
        active
          ? "bg-surface-panel text-foreground shadow-panel"
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
      )}
    >
      {children}
    </button>
  )
}
