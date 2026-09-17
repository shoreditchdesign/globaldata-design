import { ArrowRightIcon, SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { ProductArea } from "@/components/prototype/ProductChrome"
import { SearchTabs } from "@/flows/sprint-4/idea-1/components/SearchTabs"
import { SearchPills } from "@/flows/sprint-4/idea-1/components/SearchPills"
import { ScanningQuery } from "@/flows/sprint-4/idea-1/components/ScanningQuery"
import type { Resolution } from "@/flows/sprint-4/idea-1/resolve"
import type { SearchMode } from "@/flows/sprint-4/idea-1/state"
import { cn } from "@/lib/utils"

export function LandingPage({
  mode,
  query,
  activeCategory,
  onModeChange,
  onQueryChange,
  onCategoryChange,
  activeAttribute,
  onAttributeChange,
  onValuePick,
  onResolve,
  hasResolvedFilters,
  filterBox,
  pending,
  onScanDone,
}: {
  mode: SearchMode
  query: string
  activeCategory: ProductArea | null
  onModeChange: (mode: SearchMode) => void
  onQueryChange: (query: string) => void
  onCategoryChange: (category: ProductArea) => void
  activeAttribute: string | null
  onAttributeChange: (attribute: string) => void
  onValuePick: (value: string) => void
  onResolve: () => void
  hasResolvedFilters: boolean
  /** The filter box, when a search or a pill path has built one. It replaces the pills. */
  filterBox: React.ReactNode
  pending: Resolution | null
  onScanDone: () => void
}) {
  const hasQuery = query.trim().length > 0
  const resolving = Boolean(pending)

  return (
    <main className="bg-surface-page min-h-0 flex-1 overflow-y-auto">
      <section className="mx-auto flex min-h-full w-full max-w-4xl translate-y-[18px] flex-col items-center justify-center px-8 py-16">
        <SearchTabs mode={mode} onModeChange={onModeChange} />

        <div className="mt-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Drug Database</h1>
          <p className="text-muted-foreground mt-2 max-w-3xl text-sm leading-6">
            Describe any key search metrics such as Therapy Area, Classification, Geography,
            Route of Administration etc.
          </p>
        </div>

        <form
          className="bg-surface-panel border-border focus-within:border-ring mt-7 flex min-h-16 w-full items-center gap-3 rounded-xl border px-4 transition-colors"
          onSubmit={(event) => {
            event.preventDefault()
            if (hasQuery && !resolving) onResolve()
          }}
        >
          <SearchIcon className="text-muted-foreground size-5 shrink-0" aria-hidden />
          <div className="relative min-w-0 flex-1">
            <input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Ask anything"
              aria-label="Describe the drugs you are looking for"
              aria-hidden={resolving}
              disabled={resolving}
              className={cn(
                "placeholder:text-muted-foreground h-16 w-full min-w-0 bg-transparent text-base outline-none disabled:opacity-100",
                resolving && "text-transparent",
              )}
            />
            {pending ? <ScanningQuery resolution={pending} onDone={onScanDone} /> : null}
          </div>
          <Button
            type="submit"
            size="icon-lg"
            disabled={!hasQuery || resolving}
            aria-label={
              hasResolvedFilters ? "Update filters from this search" : "Build filters from this search"
            }
            className="rounded-full"
          >
            <ArrowRightIcon />
          </Button>
        </form>

        {/*
          The filter box takes over the pills' well, which keeps its height so
          the centred search does not drop when a search resolves.
        */}
        <div className="mt-5 min-h-72 w-full">
          {filterBox ?? (
            <SearchPills
              layout="centered"
              activeCategory={activeCategory}
              activeAttribute={activeAttribute}
              onCategoryChange={onCategoryChange}
              onAttributeChange={onAttributeChange}
              onValuePick={onValuePick}
            />
          )}
        </div>
      </section>
    </main>
  )
}
