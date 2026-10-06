import * as React from "react"
import { ArrowRightIcon } from "lucide-react"

import type { ProductArea } from "@/components/prototype/ProductChrome"
import { Button } from "@/components/ui/button"
import { DictateButton } from "@/flows/sprint-4/idea-1c/components/DictateButton"
import { ManualSearch } from "@/flows/sprint-4/idea-1c/components/ManualSearch"
import { ReadNotice } from "@/flows/sprint-4/idea-1c/components/ReadNotice"
import { ScanningQuery } from "@/flows/sprint-4/idea-1c/components/ScanningQuery"
import { PanelToggle } from "@/flows/sprint-4/idea-1c/components/PanelToggle"
import { SearchTabs } from "@/flows/sprint-4/idea-1c/components/SearchTabs"
import type { ResolvedFilter } from "@/flows/sprint-4/idea-1c/data"
import type { Resolution } from "@/flows/sprint-4/idea-1c/resolve"
import type { HintTarget, SearchMode } from "@/flows/sprint-4/idea-1c/state"
import { cn } from "@/lib/utils"

/**
 * The results page's search panel. Quick search holds only the query field,
 * under the tabs. Advanced
 * search has no field here, only the Miller columns: the client read a field
 * on this page as an assistant to talk to, and the columns are the way in.
 * The tabs sit at the panel's top left on a row of their own over both
 * modes, so they never move when flipped, with the panel's close button at the
 * row's right end. All of it feeds the filter box above.
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
  manualTrail,
  onOpenAt,
  trayHint,
  trayHintAt,
  onValuePickAt,
  onHidePanel,
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
  manualTrail: string[]
  onOpenAt: (depth: number, label: string) => void
  /** Bumped by Add filter: the columns flash the row to click next. */
  trayHint: number
  /** The row the hint points at, or null for the newest column's first. */
  trayHintAt: HintTarget | null
  onValuePickAt: (area: ProductArea, attribute: string, value: string) => void
  /** Folds the panel away; the table's header bar holds the way back. */
  onHidePanel: () => void
}) {
  const hasQuery = query.trim().length > 0
  const resolving = Boolean(pending)
  const fieldRef = React.useRef<HTMLTextAreaElement>(null)

  // The field hugs its text, growing a line at a time as the query wraps, up
  // to its max height and then scrolling. Measured rather than left to
  // `field-sizing`, which Safari does not support — and measured again
  // whenever its width changes (first layout, a mode switch, the panel
  // opening), since the same text wraps to a different height at a
  // different width.
  React.useLayoutEffect(() => {
    const field = fieldRef.current
    if (!field) return
    field.style.height = "auto"
    field.style.height = `${field.scrollHeight}px`
  }, [query])
  React.useEffect(() => {
    const field = fieldRef.current
    if (!field) return
    let width = field.clientWidth
    const fit = () => {
      field.style.height = "auto"
      field.style.height = `${field.scrollHeight}px`
    }
    fit()
    const observer = new ResizeObserver(() => {
      // Only a change of width re-wraps the text; the height is ours.
      if (field.clientWidth === width) return
      width = field.clientWidth
      fit()
    })
    observer.observe(field)
    return () => observer.disconnect()
    // The field only exists in Quick search, so it is found again on a switch.
  }, [mode])
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
      {/* Left-aligned, in line with the content under them. */}
      <div className="flex shrink-0 items-center justify-start gap-2 px-3 pt-1">
        <SearchTabs mode={mode} onModeChange={onModeChange} />
        <span className="ml-auto">
          <PanelToggle open onToggle={onHidePanel} />
        </span>
      </div>
      {mode === "quick" ? (
        <div className="flex min-h-0 flex-1 flex-col">
          {/* Only the query field: the commonly used filters stay on the
              start page. */}
          {composer}
        </div>
      ) : (
        <ManualSearch
          inlineSearch
          filters={filters}
          trail={manualTrail}
          onOpenAt={onOpenAt}
          onToggleValue={onValuePickAt}
          hint={trayHint}
          hintAt={trayHintAt}
        />
      )}
    </aside>
  )
}
