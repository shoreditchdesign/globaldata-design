import { ArrowRightIcon, SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { ProductArea } from "@/components/prototype/ProductChrome"
import { ResolvedFilters } from "@/flows/sprint-4/idea-1/components/ResolvedFilters"
import { ScanningQuery } from "@/flows/sprint-4/idea-1/components/ScanningQuery"
import {
  searchCategories,
  searchAttributeLabels,
  searchAttributeValues,
  type FilterId,
  type FilterJoin,
  type FilterLink,
  type ResolvedFilter,
} from "@/flows/sprint-4/idea-1/data"
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
  resultCount,
  onFilterModeChange,
  onFilterJoinChange,
  onFilterLinkChange,
  onToggleFilterValue,
  onRemoveFilter,
  onAddFilter,
  onClearFilters,
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
  resultCount: number
  onFilterModeChange: (id: FilterId, excluded: boolean) => void
  onFilterJoinChange: (id: FilterId, join: FilterJoin) => void
  onFilterLinkChange: (id: FilterId, link: FilterLink) => void
  onToggleFilterValue: (id: FilterId, value: string) => void
  onRemoveFilter: (id: FilterId) => void
  onAddFilter: (id: FilterId) => void
  onClearFilters: () => void
  pending: Resolution | null
  onScanDone: () => void
}) {
  const hasQuery = query.trim().length > 0
  const resolving = Boolean(pending)

  return (
    <main className="bg-surface-page min-h-0 flex-1 overflow-y-auto">
      <section className="mx-auto flex min-h-full w-full max-w-4xl translate-y-[18px] flex-col items-center justify-center px-8 py-16">
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

        {hasResolvedFilters ? (
          <ResolvedFilters
            filters={filters}
            resultCount={resultCount}
            onModeChange={onFilterModeChange}
            onJoinChange={onFilterJoinChange}
            onLinkChange={onFilterLinkChange}
            onToggleValue={onToggleFilterValue}
            onRemove={onRemoveFilter}
            onAdd={onAddFilter}
            onClear={onClearFilters}
          />
        ) : (
          <div className="mt-5 w-full">
            <nav aria-label="Search categories" className="flex flex-wrap justify-center gap-2">
              {searchCategories.map((category) => {
                const active = activeCategory === category
                const inactive = activeCategory !== null && !active

                return (
                  <button
                    key={category}
                    type="button"
                    aria-expanded={active}
                    aria-controls={`search-category-${slugify(category)}`}
                    onClick={() => onCategoryChange(category)}
                    className={cn(
                      "bg-surface-panel border-border hover:bg-accent inline-flex h-8 items-center rounded-full border px-3.5 text-[13px] transition-[color,background-color,border-color,opacity]",
                      active && "bg-foreground text-background border-foreground hover:bg-foreground/90",
                      inactive && "opacity-35 hover:opacity-70",
                    )}
                  >
                    {category}
                  </button>
                )
              })}
            </nav>

            {/* One fixed well for both layers, so each cascades straight under the last. */}
            <div className="mt-4 h-60">
              {activeCategory ? (
                <nav
                  key={activeCategory}
                  id={`search-category-${slugify(activeCategory)}`}
                  aria-label={`${activeCategory} filters`}
                  className="animate-in fade-in slide-in-from-top-2 flex flex-wrap justify-center gap-2 duration-300"
                >
                  {searchAttributeLabels(activeCategory).map((child) => {
                    const active = activeAttribute === child
                    const inactive = activeAttribute !== null && !active

                    return (
                      <button
                        key={child}
                        type="button"
                        aria-expanded={active}
                        aria-controls={`search-attribute-${slugify(child)}`}
                        onClick={() => onAttributeChange(child)}
                        className={cn(
                          "bg-surface-sunken border-border text-foreground hover:bg-accent inline-flex min-h-8 items-center rounded-full border px-3.5 py-1.5 text-[13px] transition-[color,background-color,border-color,opacity]",
                          active && "bg-foreground text-background border-foreground hover:bg-foreground/90",
                          inactive && "opacity-35 hover:opacity-70",
                        )}
                      >
                        {child}
                      </button>
                    )
                  })}
                </nav>
              ) : null}

              {activeCategory && activeAttribute ? (
                <nav
                  key={`${activeCategory}/${activeAttribute}`}
                  id={`search-attribute-${slugify(activeAttribute)}`}
                  aria-label={`${activeAttribute} values`}
                  className="mt-4 animate-in fade-in slide-in-from-top-2 flex flex-wrap justify-center gap-2 duration-300"
                >
                  {searchAttributeValues(activeCategory, activeAttribute).map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => onValuePick(value)}
                      className="bg-surface-panel border-border text-foreground hover:bg-accent inline-flex min-h-8 items-center rounded-full border px-3.5 py-1.5 text-[13px] transition-colors"
                    >
                      {value}
                    </button>
                  ))}
                </nav>
              ) : null}
            </div>
          </div>
        )}
      </section>
    </main>
  )
}

function slugify(label: string) {
  return label.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-")
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
