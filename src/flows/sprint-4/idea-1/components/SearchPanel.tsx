import * as React from "react"
import { ArrowRightIcon, PanelLeftCloseIcon, PanelLeftOpenIcon } from "lucide-react"

import type { ProductArea } from "@/components/prototype/ProductChrome"
import { Button } from "@/components/ui/button"
import { DictateButton } from "@/flows/sprint-4/idea-1/components/DictateButton"
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
 * the natural-language field and the pill cascade. Advanced search is Miller
 * columns. All three feed the filter box to the right.
 *
 * It collapses to a rail, because reading the grid and refining the search are
 * two different sittings: the panel is 420px of a 1440px screen, and once the
 * filters are right the reader wants the columns, not the controls that built
 * them. Collapsed is a view preference, not part of the query, so it is held
 * here rather than in the prototype state and no screen seeds into it.
 */
export function SearchPanel({
  mode,
  query,
  filters,
  pending,
  onModeChange,
  onQueryChange,
  onDictate,
  onResolve,
  onScanDone,
  onToggleFilter,
  manualCategory,
  manualAttribute,
  onOpenCategory,
  onOpenAttribute,
  onValuePickAt,
}: {
  mode: SearchMode
  query: string
  filters: ResolvedFilter[]
  pending: Resolution | null
  onModeChange: (mode: SearchMode) => void
  onQueryChange: (query: string) => void
  /** Dictated speech, appended to whatever is already in the field. */
  onDictate: (text: string) => void
  onResolve: () => void
  onScanDone: () => void
  onToggleFilter: (area: ProductArea, attribute: string) => void
  manualCategory: ProductArea | null
  manualAttribute: string | null
  onOpenCategory: (category: ProductArea) => void
  onOpenAttribute: (attribute: string) => void
  onValuePickAt: (area: ProductArea, attribute: string, value: string) => void
}) {
  const hasQuery = query.trim().length > 0
  const resolving = Boolean(pending)
  const [collapsed, setCollapsed] = React.useState(false)
  const fieldRef = React.useRef<HTMLTextAreaElement>(null)

  // The field hugs its text, growing a line at a time as the query wraps.
  // Measured rather than left to `field-sizing`, which Safari does not support.
  React.useLayoutEffect(() => {
    const field = fieldRef.current
    if (!field) return
    field.style.height = "auto"
    field.style.height = `${field.scrollHeight}px`
  }, [query])
  const submit = () => {
    if (hasQuery && !resolving) onResolve()
  }

  // Collapsed, the panel keeps its surface and its edge so the grid still reads
  // as sitting beside something, and holds nothing but the way back.
  if (collapsed) {
    return (
      <aside
        aria-label="Search"
        className="bg-surface-chrome border-edge flex w-11 shrink-0 flex-col items-center border-r px-2 pt-3"
      >
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Show the search panel"
          onClick={() => setCollapsed(false)}
          className="text-muted-foreground"
        >
          <PanelLeftOpenIcon />
        </Button>
      </aside>
    )
  }

  return (
    <aside
      aria-label="Search"
      // Advanced search widens the panel to hold two Miller columns side by side.
      // Quick is wider than the rail needs for its field, so the commonly used
      // filters pair up on a line and have room to take a count without the row
      // rewrapping — the same slack the landing page's column gives them.
      className={cn(
        "bg-surface-chrome border-edge flex shrink-0 flex-col border-r",
        mode === "manual" ? "w-[528px]" : "w-[420px]",
      )}
    >
      <div className="flex shrink-0 items-center gap-2 px-3 pt-3">
        <SearchTabs
          mode={mode}
          onModeChange={onModeChange}
          // The quick panel's inner width less the collapse button beside them,
          // held when manual search widens the panel so the tabs stay put,
          // left-aligned, rather than stretching.
          className="flex w-[360px] [&>button]:flex-1"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Hide the search panel"
          onClick={() => setCollapsed(true)}
          className="text-muted-foreground ml-auto"
        >
          <PanelLeftCloseIcon />
        </Button>
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
                rows={1}
                onChange={(event) => onQueryChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                    event.preventDefault()
                    submit()
                  }
                }}
                placeholder="What are you looking for?"
                aria-label="Describe the drugs you are looking for"
                aria-hidden={resolving}
                disabled={resolving}
                className={cn(
                  "placeholder:text-muted-foreground block w-full resize-none overflow-hidden bg-transparent p-0 text-[13px] leading-5 wrap-break-word outline-none disabled:opacity-100",
                  resolving && "text-transparent",
                )}
              />
              {pending ? <ScanningQuery resolution={pending} onDone={onScanDone} multiline /> : null}
            </div>
            <div className="mt-2 flex items-center justify-end gap-1">
              <DictateButton onText={onDictate} disabled={resolving} size="icon-sm" />
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
              layout="panel"
              filters={filters}
              onToggleFilter={onToggleFilter}
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
