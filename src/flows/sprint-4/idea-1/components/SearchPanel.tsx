import { ArrowRightIcon } from "lucide-react"

import type { ProductArea } from "@/components/prototype/ProductChrome"
import { Button } from "@/components/ui/button"
import { ScanningQuery } from "@/flows/sprint-4/idea-1/components/ScanningQuery"
import { SearchPills } from "@/flows/sprint-4/idea-1/components/SearchPills"
import { SearchTabs } from "@/flows/sprint-4/idea-1/components/SearchTabs"
import type { ResolvedFilter } from "@/flows/sprint-4/idea-1/data"
import type { Resolution } from "@/flows/sprint-4/idea-1/resolve"
import type { SearchMode } from "@/flows/sprint-4/idea-1/state"
import { cn } from "@/lib/utils"

/**
 * The results page's left panel: the landing search, narrowed. Quick search
 * keeps the natural-language field and the pill cascade; both feed the filter
 * box to the right rather than replacing the results.
 */
export function SearchPanel({
  mode,
  query,
  activeCategory,
  activeAttribute,
  filters,
  pending,
  onModeChange,
  onQueryChange,
  onResolve,
  onScanDone,
  onCategoryChange,
  onAttributeChange,
  onValuePick,
}: {
  mode: SearchMode
  query: string
  activeCategory: ProductArea | null
  activeAttribute: string | null
  filters: ResolvedFilter[]
  pending: Resolution | null
  onModeChange: (mode: SearchMode) => void
  onQueryChange: (query: string) => void
  onResolve: () => void
  onScanDone: () => void
  onCategoryChange: (category: ProductArea) => void
  onAttributeChange: (attribute: string) => void
  onValuePick: (value: string) => void
}) {
  const hasQuery = query.trim().length > 0
  const resolving = Boolean(pending)
  const submit = () => {
    if (hasQuery && !resolving) onResolve()
  }

  return (
    <aside
      aria-label="Search"
      className="bg-surface-chrome border-edge flex w-[340px] shrink-0 flex-col border-r"
    >
      <div className="shrink-0 px-3 pt-3">
        <SearchTabs
          mode={mode}
          onModeChange={onModeChange}
          className="flex w-full [&>button]:flex-1"
        />
      </div>

      {mode === "quick" ? (
        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          <form
            className="bg-surface-panel border-border focus-within:border-ring rounded-xl border p-3 transition-colors"
            onSubmit={(event) => {
              event.preventDefault()
              submit()
            }}
          >
            <div className="relative">
              <textarea
                value={query}
                rows={5}
                onChange={(event) => onQueryChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                    event.preventDefault()
                    submit()
                  }
                }}
                placeholder="Ask anything"
                aria-label="Describe the drugs you are looking for"
                aria-hidden={resolving}
                disabled={resolving}
                className={cn(
                  "placeholder:text-muted-foreground block min-h-20 w-full resize-none field-sizing-content bg-transparent p-0 text-[13px] leading-5 wrap-break-word outline-none disabled:opacity-100",
                  resolving && "text-transparent",
                )}
              />
              {pending ? <ScanningQuery resolution={pending} onDone={onScanDone} multiline /> : null}
            </div>
            <div className="mt-2 flex justify-end">
              <Button
                type="submit"
                size="icon-sm"
                disabled={!hasQuery || resolving}
                aria-label="Update filters from this search"
                className="rounded-full"
              >
                <ArrowRightIcon />
              </Button>
            </div>
          </form>

          <div className="mt-4">
            <SearchPills
              filters={filters}
              layout="panel"
              activeCategory={activeCategory}
              activeAttribute={activeAttribute}
              onCategoryChange={onCategoryChange}
              onAttributeChange={onAttributeChange}
              onValuePick={onValuePick}
            />
          </div>
        </div>
      ) : null}
    </aside>
  )
}
