"use client"

import * as React from "react"
import { ArrowRightIcon, SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { motion, usePrefersReducedMotion } from "@/components/prototype/motion"
import { DictateButton } from "@/flows/sprint-4/idea-1c/components/DictateButton"
import type { ProductArea } from "@/components/prototype/ProductChrome"
import { ReadNotice } from "@/flows/sprint-4/idea-1c/components/ReadNotice"
import { SearchPills } from "@/flows/sprint-4/idea-1c/components/SearchPills"
import { SearchTabs } from "@/flows/sprint-4/idea-1c/components/SearchTabs"
import { ScanningQuery } from "@/flows/sprint-4/idea-1c/components/ScanningQuery"
import type { ResolvedFilter } from "@/flows/sprint-4/idea-1c/data"
import type { Resolution } from "@/flows/sprint-4/idea-1c/resolve"
import type { SearchMode } from "@/flows/sprint-4/idea-1c/state"
import { cn } from "@/lib/utils"

export function LandingPage({
  mode,
  query,
  onModeChange,
  onQueryChange,
  onDictate,
  onToggleFilter,
  onResolve,
  hasResolvedFilters,
  filters,
  filterBox,
  manual,
  pending,
  unread,
  onScanDone,
}: {
  mode: SearchMode
  query: string
  onModeChange: (mode: SearchMode) => void
  onQueryChange: (query: string) => void
  /** Dictated speech, appended to whatever is already in the field. */
  onDictate: (text: string) => void
  onToggleFilter: (area: ProductArea, attribute: string) => void
  onResolve: () => void
  hasResolvedFilters: boolean
  filters: ResolvedFilter[]
  /** The filter box: once a search or a pill path has built one, and always in Advanced. */
  filterBox: React.ReactNode
  /** Advanced search in its wide layout, which takes the place of the query field and pills. */
  manual: React.ReactNode
  pending: Resolution | null
  /** What the last read could not place, said under the field. */
  unread: Resolution | null
  onScanDone: () => void
}) {
  const hasQuery = query.trim().length > 0
  const resolving = Boolean(pending)

  // Switching between Quick and Advanced is a crossfade, not a move. Quick
  // has the query field, the filter box and the pills; Advanced the columns
  // card and the filter box at the page's full width. Whatever sits under the
  // tabs fades out a few pixels downward, the layout swaps (and the width
  // changes) while it is clear, and the new set fades in where it rests: the columns card at its
  // final height, the filter box at its new place, together. Only the title
  // block eases into its new place, since Quick centres it and Advanced runs
  // top down; the incoming set waits a beat for it so the two never overlap.
  // Reduced motion swaps at once.
  const sectionRef = React.useRef<HTMLElement>(null)
  const reducedMotion = usePrefersReducedMotion()
  const [shown, setShown] = React.useState(mode)
  // The layout on screen. It trails the tabs by the fade-out, so the outgoing
  // set is what fades rather than the incoming one appearing and vanishing.
  const shownMode = reducedMotion ? mode : shown

  const easing = (name: "settle" | "lift") =>
    (sectionRef.current &&
      getComputedStyle(sectionRef.current).getPropertyValue(`--ease-${name}-curve`).trim()) ||
    "ease-out"
  const fading = () =>
    Array.from(sectionRef.current?.querySelectorAll<HTMLElement>("[data-fade]") ?? [])

  React.useEffect(() => {
    if (reducedMotion || shown === mode) return
    const outgoing = fading().map((element) => {
      element.getAnimations().forEach((animation) => animation.cancel())
      return element.animate(
        [
          { opacity: 1, transform: "none" },
          { opacity: 0, transform: "translateY(4px)" },
        ],
        { duration: motion.quick, easing: easing("lift"), fill: "forwards" },
      )
    })
    const timer = window.setTimeout(() => setShown(mode), motion.quick)
    // Flipped back before the swap: the outgoing set simply returns.
    return () => {
      window.clearTimeout(timer)
      outgoing.forEach((animation) => animation.cancel())
    }
  }, [mode, shown, reducedMotion])

  const lastTitleTop = React.useRef<number | undefined>(undefined)
  const lastShown = React.useRef(shownMode)
  React.useLayoutEffect(() => {
    const title = sectionRef.current?.querySelector<HTMLElement>("[data-flip='title']")
    if (!title) return
    // Where the title rests, leaving out any move still running.
    const transform = getComputedStyle(title).transform
    const moving = transform === "none" ? 0 : new DOMMatrix(transform).m42
    const now = title.getBoundingClientRect().top - moving
    const was = lastTitleTop.current
    const swapped = lastShown.current !== shownMode
    lastTitleTop.current = now
    lastShown.current = shownMode
    if (!swapped || reducedMotion || was === undefined) return

    const offset = was - now
    if (offset !== 0) {
      title.getAnimations().forEach((animation) => animation.cancel())
      // The title travels furthest of anything here, so it gets the longer
      // reflow beat: at the settle beat its ~86px read as a lurch.
      title.animate([{ transform: `translateY(${offset}px)` }, { transform: "none" }], {
        duration: motion.reflow,
        easing: easing("settle"),
      })
    }
    fading().forEach((element) => {
      element.getAnimations().forEach((animation) => animation.cancel())
      element.animate(
        [
          { opacity: 0, transform: "translateY(4px)" },
          { opacity: 1, transform: "none" },
        ],
        {
          duration: motion.settle,
          easing: easing("settle"),
          // Held clear while the title is still on its way.
          delay: offset === 0 ? 0 : motion.handover,
          fill: "backwards",
        },
      )
    })
  }, [shownMode, reducedMotion])

  const manualMode = shownMode === "manual"

  // The one search field, in both modes, so it is never swapped out: only what
  // sits under it changes. The tabs above it pick which.
  const field = (
    <form
      className="bg-surface-panel border-ring mx-auto mt-3 flex min-h-16 w-full items-center gap-3 rounded-xl border px-4 transition-colors"
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
      {/* The Advanced switch (AdvancedToggle) sat here. Hidden, not deleted:
          the tabs above the field carry the mode for now. */}
      <DictateButton onText={onDictate} disabled={resolving} />
      <Button
        type="submit"
        size="icon-lg"
        disabled={!hasQuery || resolving}
        aria-label={
          hasResolvedFilters ? "Update filters from this search" : "Build filters from this search"
        }
        className="rounded-md"
      >
        <ArrowRightIcon />
      </Button>
    </form>
  )

  return (
    <main className="bg-surface-page flex min-h-0 flex-1 flex-col overflow-y-auto">
      {/*
        Quick search is centred a little above the middle by padding more below
        than above. It may shrink below its content, so on a short window the
        pills' well gives up its empty space before the page is made to scroll.
        Advanced search runs top down instead: the title and the field, the
        Miller columns filling the page, and the filter box always beneath them.
      */}
      <section
        ref={sectionRef}
        className={cn(
          "mx-auto flex min-h-0 w-full flex-1 flex-col px-8 pt-12",
          // Advanced takes the page's full width, gutters aside, for its
          // columns; Quick keeps the narrower measure. The width changes
          // only while the outgoing set is faded clear.
          manualMode ? "pb-8" : "max-w-7xl items-center justify-center pb-16",
        )}
      >
        {/* The title, the tabs and the field move as one, so the tab the
            reader just pressed travels with the field under it. */}
        <div data-flip="title" className="w-full shrink-0">
          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Drug Database</h1>
            <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm leading-5 text-balance">
              Describe any key search metrics such as Therapy Area, Classification, Geography,
              Route of Administration etc.
            </p>
          </div>
          <div className="mt-6 flex justify-center">
            <SearchTabs mode={mode} onModeChange={onModeChange} className="border-edge" />
          </div>
          {/* The query field is Quick search's alone: Advanced is the columns.
              It fades with the rest of the outgoing set. */}
          {manualMode ? null : <div data-fade>{field}</div>}
        </div>

        {manualMode ? (
          <>
            <div
              data-fade
              // Capped at 60vh, each column scrolling inside it, so on a
              // laptop the filter box underneath stays on screen.
              className="bg-surface-panel border-ring mt-5 flex max-h-[60vh] min-h-72 flex-1 flex-col overflow-hidden rounded-xl border"
            >
              {manual}
            </div>
            {/* As wide as the columns card above it, edge to edge, and only
                once there is a filter to show. */}
            {filterBox ? (
              <div data-fade className="mt-2 w-full shrink-0">
                {filterBox}
              </div>
            ) : null}
          </>
        ) : (
          /*
            The well keeps the pills' height so the centred search never moves,
            and is the one thing that shrinks when the window is too short for it.
            Once a filter exists its box sits above the pills and the stack hangs
            past the well, scrolling the page rather than pushing the search up.
          */
          <div className="relative mt-5 h-72 w-full">
            {/* A filter box sits 8px under the query that built it, pulled up inside the
                well rather than moving it, so the search stays put. */}
            <div
              className={cn(
                "absolute inset-x-0 flex flex-col gap-5 pb-16",
                filterBox || unread ? "-top-3" : "top-0",
              )}
            >
              {unread ? (
                <div data-fade className={cn(filterBox && "-mb-2")}>
                  <ReadNotice resolution={unread} className="w-full px-4 text-sm" />
                </div>
              ) : null}
              {filterBox ? (
                <div data-fade className="w-full">
                  {filterBox}
                </div>
              ) : null}
              {/* The pills keep the narrower measure, so their rows wrap as before. */}
              <div data-fade className="mx-auto w-full max-w-5xl">
                <SearchPills layout="centered" filters={filters} onToggleFilter={onToggleFilter} />
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}
