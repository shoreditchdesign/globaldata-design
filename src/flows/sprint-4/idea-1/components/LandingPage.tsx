import { ArrowRightIcon, SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ResolvedFilters } from "@/flows/sprint-4/idea-1/components/ResolvedFilters"
import {
  searchCategories,
  workedResultCount,
} from "@/flows/sprint-4/idea-1/data"
import type { SearchMode } from "@/flows/sprint-4/idea-1/state"
import { cn } from "@/lib/utils"

export function LandingPage({
  mode,
  query,
  onModeChange,
  onQueryChange,
  onResolve,
  hasResolvedFilters,
}: {
  mode: SearchMode
  query: string
  onModeChange: (mode: SearchMode) => void
  onQueryChange: (query: string) => void
  onResolve: () => void
  hasResolvedFilters: boolean
}) {
  const hasQuery = query.trim().length > 0

  return (
    <main className="bg-surface-page min-h-0 flex-1 overflow-y-auto">
      <section className="mx-auto flex min-h-full w-full max-w-4xl -translate-y-[46px] flex-col items-center justify-center px-8 py-16">
        <div
          role="tablist"
          aria-label="Search method"
          className="bg-surface-sunken border-border inline-flex w-fit items-center gap-0.5 rounded-lg border p-0.5"
        >
          <SearchTab active={mode === "quick"} onClick={() => onModeChange("quick")}>
            Quick search
          </SearchTab>
          <SearchTab active={mode === "manual"} onClick={() => onModeChange("manual")}>
            Manual search
          </SearchTab>
        </div>

        <div className="mt-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Drug Database</h1>
          <p className="text-muted-foreground mt-2 max-w-3xl text-sm leading-6">
            Describe any key search metrics such as Therapy Area, Classification, Geography,
            Route of Administration etc.
          </p>
        </div>

        <form
          className="bg-surface-panel border-border focus-within:border-ring mt-7 flex min-h-16 w-full items-center gap-3 rounded-xl border px-4 transition-colors"
          onSubmit={(event) => event.preventDefault()}
        >
          <SearchIcon className="text-muted-foreground size-5 shrink-0" aria-hidden />
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Ask anything"
            aria-label="Describe the drugs you are looking for"
            className="placeholder:text-muted-foreground h-16 min-w-0 flex-1 bg-transparent text-base outline-none"
          />
          <Button
            type="button"
            size={hasResolvedFilters ? "default" : "icon-lg"}
            onClick={onResolve}
            disabled={!hasQuery}
            aria-label={
              hasResolvedFilters
                ? `Search ${workedResultCount.toLocaleString("en-GB")} matching drugs`
                : "Build filters from this search"
            }
            className="rounded-full tabular-nums"
          >
            {hasResolvedFilters ? workedResultCount.toLocaleString("en-GB") : null}
            <ArrowRightIcon />
          </Button>
        </form>

        {hasResolvedFilters ? (
          <ResolvedFilters />
        ) : (
          <nav aria-label="Search categories" className="mt-5 flex flex-wrap justify-center gap-2">
            {searchCategories.map((category) => (
              <button
                key={category}
                type="button"
                className="bg-surface-panel border-border hover:bg-accent inline-flex h-8 items-center rounded-full border px-3.5 text-[13px] transition-colors"
              >
                {category}
              </button>
            ))}
          </nav>
        )}
      </section>
    </main>
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
        "flex h-7 items-center rounded-md px-3 text-[13px] font-medium transition-colors",
        active
          ? "bg-surface-panel text-foreground shadow-panel"
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
      )}
    >
      {children}
    </button>
  )
}
