import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { FilterBuilderPane } from "@/flows/sprint-2/idea-1/components/FilterBuilderPane"
import type { FilterGroup } from "@/flows/sprint-2/idea-1/data"

/**
 * The modal shell: dimmed backdrop, segmented tab control, left construction
 * pane, right filter builder. Tabs are rendered, not interactive — each screen
 * is one fixed state.
 */
export function FilterModal({
  tab,
  groups,
  children,
}: {
  tab: "ai" | "manual"
  groups?: FilterGroup[]
  children: React.ReactNode
}) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/25 px-6">
      <div className="bg-background relative flex h-[750px] w-full max-w-[1055px] overflow-hidden rounded-2xl shadow-2xl">
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="px-6 pt-6">
            <div className="bg-muted inline-flex rounded-full p-1">
              <Tab active={tab === "ai"}>AI filter</Tab>
              <Tab active={tab === "manual"}>Manual filter</Tab>
            </div>
          </div>
          {children}
        </div>

        <FilterBuilderPane groups={groups} />

        <button
          type="button"
          aria-label="Close"
          className="text-muted-foreground hover:text-foreground absolute top-5 right-5"
        >
          <XIcon className="size-4" />
        </button>
      </div>
    </div>
  )
}

function Tab({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "rounded-full px-4 py-1.5 text-sm",
        active ? "bg-background shadow-xs" : "text-muted-foreground",
      )}
    >
      {children}
    </span>
  )
}

/** Heading block shared by both tabs. */
export function PaneHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="px-6 pt-6">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <p className="text-muted-foreground text-sm">{subtitle}</p>
    </div>
  )
}
