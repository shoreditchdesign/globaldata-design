import { ArrowRightIcon, SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { ProductArea } from "@/components/prototype/ProductChrome"
import { SearchTabs } from "@/flows/sprint-4/idea-1/components/SearchTabs"
import { SearchPills } from "@/flows/sprint-4/idea-1/components/SearchPills"
import { ScanningQuery } from "@/flows/sprint-4/idea-1/components/ScanningQuery"
import type { ResolvedFilter } from "@/flows/sprint-4/idea-1/data"
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
  filters,
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
  filters: ResolvedFilter[]
  /** The filter box, when a search or a pill path has built one. It replaces the pills. */
  filterBox: React.ReactNode
  pending: Resolution | null
  onScanDone: () => void
}) {
  const hasQuery = query.trim().length > 0
  const resolving = Boolean(pending)

  return (
    <main className="bg-surface-page flex min-h-0 flex-1 flex-col overflow-y-auto">
      {/* The tabs head the page rather than the search, which centres in the space below. */}
      <div className="flex shrink-0 justify-center pt-6">
        <SearchTabs mode={mode} onModeChange={onModeChange} />
      </div>

      {/*
        Centred a little above the middle by padding more below than above. It
        may shrink below its content, so on a short window the pills' well
        gives up its empty space before the page is made to scroll.
      */}
      <section className="mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col items-center justify-center px-8 pt-6 pb-16">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Drug Database</h1>
          <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm leading-5 text-balance">
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
              placeholder="What are you looking for?"
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
          The well keeps the pills' height so the centred search never moves,
          and is the one thing that shrinks when the window is too short for it.
          Once a filter exists its box sits above the pills and the stack hangs
          past the well, scrolling the page rather than pushing the search up.
        */}
        <div className="relative mt-5 h-72 w-full">
          {/* A filter box sits 8px under the query that built it, pulled up inside the
              well rather than moving it, so the search stays put. */}
          <div
            className={cn(
              "absolute inset-x-0 flex flex-col gap-5 pb-16",
              filterBox ? "-top-3" : "top-0",
            )}
          >
            {filterBox}
            <SearchPills
              filters={filters}
              layout="centered"
              activeCategory={activeCategory}
              activeAttribute={activeAttribute}
              onCategoryChange={onCategoryChange}
              onAttributeChange={onAttributeChange}
              onValuePick={onValuePick}
            />
          </div>
        </div>
      </section>
    </main>
  )
}
