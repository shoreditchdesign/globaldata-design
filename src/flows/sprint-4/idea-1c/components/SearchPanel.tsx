import * as React from "react"
import { ArrowRightIcon, PanelLeftCloseIcon } from "lucide-react"

import type { ProductArea } from "@/components/prototype/ProductChrome"
import { Button } from "@/components/ui/button"
import { DictateButton } from "@/flows/sprint-4/idea-1c/components/DictateButton"
import { ManualSearch } from "@/flows/sprint-4/idea-1c/components/ManualSearch"
import { ReadNotice } from "@/flows/sprint-4/idea-1c/components/ReadNotice"
import { ScanningQuery } from "@/flows/sprint-4/idea-1c/components/ScanningQuery"
import { commonFiltersId, SearchPills } from "@/flows/sprint-4/idea-1c/components/SearchPills"
import { SearchTabs } from "@/flows/sprint-4/idea-1c/components/SearchTabs"
import type { ResolvedFilter } from "@/flows/sprint-4/idea-1c/data"
import type { Resolution } from "@/flows/sprint-4/idea-1c/resolve"
import type { SearchMode } from "@/flows/sprint-4/idea-1c/state"
import { cn } from "@/lib/utils"

/**
 * The results page's search panel. Quick search puts the query field at its
 * head, under the tabs, with the commonly used filters beneath it. Advanced
 * search has no field here, only the Miller columns: the client read a field
 * on this page as an assistant to talk to, and the columns are the way in.
 * The tabs and the close button share a row of their own over both modes, so
 * they never move when flipped. All of it feeds the filter box above.
 *
 * It fills whatever width the results page gives it, which is the same in
 * both modes.
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
  manualTrail,
  onOpenAt,
  onValuePickAt,
  onClosePanel,
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
  manualTrail: string[]
  onOpenAt: (depth: number, label: string) => void
  onValuePickAt: (area: ProductArea, attribute: string, value: string) => void
  /** Folds the panel away so the table takes the full width. */
  onClosePanel: () => void
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

  // The query field, at the head of Quick search under the tabs, as it sat
  // before the composer moved to the panel's foot (6aab10b) and as Idea 1b's
  // results panel has it. Advanced search has no field on this page: there the
  // columns are the way in.
  const composer = (
    <div className="shrink-0 px-3 pt-3">
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
              "placeholder:text-muted-foreground block max-h-40 w-full resize-none overflow-y-auto bg-transparent p-0 text-[13px] leading-5 wrap-break-word outline-none disabled:opacity-100",
              resolving && "text-transparent",
            )}
          />
          {pending ? <ScanningQuery resolution={pending} onDone={onScanDone} multiline /> : null}
        </div>
        <div className="mt-2 flex items-center justify-end gap-1">
          {/* The Advanced switch (AdvancedToggle) sat here. Hidden, not
              deleted: the tabs at the panel's head carry the mode for now. */}
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
      {unread ? <ReadNotice resolution={unread} className="mt-2 px-1 text-xs" /> : null}
    </div>
  )

  return (
    <aside
      aria-label="Search"
      className="bg-surface-chrome border-edge flex h-full w-full flex-col border-r pt-2"
    >
      <div className="flex shrink-0 items-center justify-end gap-2 px-3 pt-1">
        <SearchTabs mode={mode} onModeChange={onModeChange} />
        {/* Closing sits at the panel's own head, where it is seen, rather than
            in the table's footer, where nobody found it. */}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Close the search panel"
          aria-expanded
          onClick={onClosePanel}
          className="text-muted-foreground"
        >
          <PanelLeftCloseIcon />
        </Button>
      </div>
      {mode === "quick" ? (
        <div className="flex min-h-0 flex-1 flex-col">
          {composer}
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
          trail={manualTrail}
          onOpenAt={onOpenAt}
          onToggleValue={onValuePickAt}
        />
      )}
    </aside>
  )
}
