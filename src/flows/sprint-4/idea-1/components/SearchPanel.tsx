import * as React from "react"
import { ArrowRightIcon } from "lucide-react"

import type { ProductArea } from "@/components/prototype/ProductChrome"
import { Button } from "@/components/ui/button"
import { ManualSearch } from "@/flows/sprint-4/idea-1/components/ManualSearch"
import { ScanningQuery } from "@/flows/sprint-4/idea-1/components/ScanningQuery"
import { SearchPills } from "@/flows/sprint-4/idea-1/components/SearchPills"
import { SearchTabs } from "@/flows/sprint-4/idea-1/components/SearchTabs"
import type { ResolvedFilter } from "@/flows/sprint-4/idea-1/data"
import type { Resolution } from "@/flows/sprint-4/idea-1/resolve"
import type { SearchMode } from "@/flows/sprint-4/idea-1/state"
import { cn } from "@/lib/utils"

/**
 * The results page's left panel. Quick search is the landing search, narrowed:
 * the natural-language field and the pill cascade. Manual search is Miller
 * columns. All three feed the filter box to the right.
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
  manualCategory,
  manualAttribute,
  onOpenCategory,
  onOpenAttribute,
  onValuePickAt,
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
  manualCategory: ProductArea | null
  manualAttribute: string | null
  onOpenCategory: (category: ProductArea) => void
  onOpenAttribute: (attribute: string) => void
  onValuePickAt: (area: ProductArea, attribute: string, value: string) => void
}) {
  const hasQuery = query.trim().length > 0
  const resolving = Boolean(pending)
  const fieldRef = React.useRef<HTMLTextAreaElement>(null)

  // The field shows three lines and scrolls past them. The reading overlay is
  // drawn from the top, so the field returns there while a query is read.
  React.useEffect(() => {
    if (resolving && fieldRef.current) fieldRef.current.scrollTop = 0
  }, [resolving])
  const submit = () => {
    if (hasQuery && !resolving) onResolve()
  }

  return (
    <aside
      aria-label="Search"
      // Manual search widens the panel to hold two Miller columns side by side.
      className={cn(
        "bg-surface-chrome border-edge flex shrink-0 flex-col border-r",
        mode === "manual" ? "w-[528px]" : "w-[340px]",
      )}
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
                ref={fieldRef}
                value={query}
                rows={3}
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
                  "placeholder:text-muted-foreground block h-15 w-full resize-none overflow-y-auto bg-transparent p-0 text-[13px] leading-5 wrap-break-word outline-none [scrollbar-width:none] disabled:opacity-100 [&::-webkit-scrollbar]:hidden",
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
      ) : (
        <ManualSearch
          filters={filters}
          activeCategory={manualCategory}
          activeAttribute={manualAttribute}
          onOpenCategory={onOpenCategory}
          onOpenAttribute={onOpenAttribute}
          onToggleValue={onValuePickAt}
        />
      )}
    </aside>
  )
}
