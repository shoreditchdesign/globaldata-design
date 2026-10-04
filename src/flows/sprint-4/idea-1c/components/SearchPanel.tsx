import * as React from "react"
import { ArrowRightIcon } from "lucide-react"

import type { ProductArea } from "@/components/prototype/ProductChrome"
import { Button } from "@/components/ui/button"
import { AdvancedToggle } from "@/flows/sprint-4/idea-1c/components/AdvancedToggle"
import { DictateButton } from "@/flows/sprint-4/idea-1c/components/DictateButton"
import { ManualSearch } from "@/flows/sprint-4/idea-1c/components/ManualSearch"
import { ReadNotice } from "@/flows/sprint-4/idea-1c/components/ReadNotice"
import { ScanningQuery } from "@/flows/sprint-4/idea-1c/components/ScanningQuery"
import { commonFiltersId, SearchPills } from "@/flows/sprint-4/idea-1c/components/SearchPills"
import type { ResolvedFilter } from "@/flows/sprint-4/idea-1c/data"
import type { Resolution } from "@/flows/sprint-4/idea-1c/resolve"
import type { SearchMode } from "@/flows/sprint-4/idea-1c/state"
import { cn } from "@/lib/utils"

/**
 * The results page's chat section: the commonly used filters at its head, and
 * the query field at its foot, where a chat composer sits. Between them,
 * Advanced search's Miller columns when the switch is on. The switch sits in
 * the composer's bottom-left corner, as it sits in the start screen's field,
 * because that is where the eye already is when a search is being written;
 * testers missed it at the panel's head. All of it feeds the filter box
 * beside it.
 *
 * It fills whatever width the results page gives it, which is the same in
 * both modes, and collapsing it is the results page's business too, from the
 * toggle in the table's footer.
 */
export function SearchPanel({
  mode,
  query,
  filters,
  pending,
  unread,
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
  /** What the last read could not place, said under the field. */
  unread: Resolution | null
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

  const composer = (
    <div className="border-hairline shrink-0 border-t p-3">
      {unread ? <ReadNotice resolution={unread} className="mb-2 px-1 text-xs" /> : null}
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
            rows={2}
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
              "placeholder:text-muted-foreground block max-h-40 w-full resize-none overflow-y-auto bg-transparent p-0 text-[13px] leading-5 wrap-break-word outline-none disabled:opacity-100",
              resolving && "text-transparent",
            )}
          />
          {pending ? <ScanningQuery resolution={pending} onDone={onScanDone} multiline /> : null}
        </div>
        <div className="mt-5 flex items-center gap-1">
          <AdvancedToggle
            mode={mode}
            onModeChange={onModeChange}
            disabled={resolving}
            className="mr-auto"
          />
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
    </div>
  )

  return (
    <aside
      aria-label="Search"
      className="bg-surface-chrome border-edge flex h-full w-full flex-col border-r pt-2"
    >
      {mode === "quick" ? (
        <div className="flex min-h-0 flex-1 flex-col">
          {/* The same header block as Advanced's, row for row: where the
              columns put their path, the pills put their name, in the same
              place and the same type, so flipping the switch changes what is
              under the header and nothing about the header itself. No search
              field, which ten pills do not need. */}
          <div className="shrink-0 px-3 pt-3 pb-3">
            <div className="flex h-6 items-center">
              <h2
                id={commonFiltersId}
                className="text-foreground truncate px-1 py-0.5 text-[13px] font-semibold"
              >
                Commonly used filters
              </h2>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
            <SearchPills
              layout="panel"
              heading={false}
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
      {composer}
    </aside>
  )
}
