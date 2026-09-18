"use client"

import * as React from "react"
import { ArrowRightIcon, SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { motion, usePrefersReducedMotion } from "@/components/prototype/motion"
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
  manual,
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
  /** The filter box: once a search or a pill path has built one, and always in Manual. */
  filterBox: React.ReactNode
  /** Manual search in its wide layout, which takes the place of the query field and pills. */
  manual: React.ReactNode
  pending: Resolution | null
  onScanDone: () => void
}) {
  const hasQuery = query.trim().length > 0
  const resolving = Boolean(pending)

  // The title slides between the centred search and the top of Manual rather
  // than jumping: the same element, measured before and after the switch.
  const titleRef = React.useRef<HTMLDivElement>(null)
  const titleTop = React.useRef<number | null>(null)
  const titleMode = React.useRef(mode)
  const reducedMotion = usePrefersReducedMotion()
  React.useLayoutEffect(() => {
    const title = titleRef.current
    if (!title) return
    const top = title.getBoundingClientRect().top
    const from = titleTop.current
    const moved = titleMode.current !== mode
    titleTop.current = top
    titleMode.current = mode
    if (!moved || from === null || from === top || reducedMotion) return
    title.animate([{ transform: `translateY(${from - top}px)` }, { transform: "none" }], {
      duration: motion.reflow,
      easing: getComputedStyle(title).getPropertyValue("--ease-settle-curve").trim() || "ease-out",
    })
  })

  // What a switch brings in fades up under the moving title; nothing fades on arrival.
  const [seenMode, setSeenMode] = React.useState(mode)
  const [switched, setSwitched] = React.useState(false)
  if (seenMode !== mode) {
    setSeenMode(mode)
    setSwitched(true)
  }
  const entrance =
    switched && "animate-in fade-in slide-in-from-bottom-2 duration-300 motion-reduce:animate-none"
  const manualMode = mode === "manual"

  return (
    <main className="bg-surface-page flex min-h-0 flex-1 flex-col overflow-y-auto">
      {/* The tabs head the page rather than the search, which centres in the space below. */}
      <div className="flex shrink-0 justify-center pt-6">
        <SearchTabs mode={mode} onModeChange={onModeChange} />
      </div>

      {/*
        Quick search is centred a little above the middle by padding more below
        than above. It may shrink below its content, so on a short window the
        pills' well gives up its empty space before the page is made to scroll.
        Manual search runs top down instead: the title under the tabs, the Miller
        columns filling the page, and the filter box always beneath them.
      */}
      <section
        className={cn(
          "mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col px-8 pt-6",
          manualMode ? "pb-8" : "items-center justify-center pb-16",
        )}
      >
        <div ref={titleRef} className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Drug Database</h1>
          <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm leading-5 text-balance">
            Describe any key search metrics such as Therapy Area, Classification, Geography,
            Route of Administration etc.
          </p>
        </div>

        {manualMode ? (
          <>
            <div
              className={cn(
                "bg-surface-panel border-border mt-6 flex min-h-72 flex-1 flex-col overflow-hidden rounded-xl border",
                entrance,
              )}
            >
              {manual}
            </div>
            <div className={cn("mt-2 shrink-0", entrance)}>{filterBox}</div>
          </>
        ) : (
          <>
            <form
              className={cn(
                "bg-surface-panel border-border focus-within:border-ring mt-7 flex min-h-16 w-full items-center gap-3 rounded-xl border px-4 transition-colors",
                entrance,
              )}
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
            <div className={cn("relative mt-5 h-72 w-full", entrance)}>
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
          </>
        )}
      </section>
    </main>
  )
}
