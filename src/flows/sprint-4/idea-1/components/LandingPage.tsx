"use client"

import * as React from "react"
import { ArrowRightIcon, SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { motion, usePrefersReducedMotion } from "@/components/prototype/motion"
import { DictateButton } from "@/flows/sprint-4/idea-1/components/DictateButton"
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
  onDictate,
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
  /** Dictated speech, appended to whatever is already in the field. */
  onDictate: (text: string) => void
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

  // Switching between Quick and Manual moves things rather than swapping them.
  // Each tracked element is measured either side of the switch and eased from
  // where it was: the title slides; the filter box glides between its place
  // under the field and its place under the columns; and whatever the switch
  // brings in starts where the title's move puts it, travelling up or down with
  // the title as it fades in, so it never lands on top of the title mid-move.
  // The pills are the exception: they wait until the move has all but settled
  // before fading in, so the filter box gliding up past them never crosses them.
  const sectionRef = React.useRef<HTMLElement>(null)
  const lastTops = React.useRef<{ title?: number; summary?: number }>({})
  const lastMode = React.useRef(mode)
  const reducedMotion = usePrefersReducedMotion()
  React.useLayoutEffect(() => {
    const section = sectionRef.current
    if (!section) return
    // Where each element rests, leaving out any move still running: a render
    // mid-move (the address bar catching up) must not record the start of the
    // move as where the element sits.
    const top = (selector: string) => {
      const element = section.querySelector<HTMLElement>(selector)
      if (!element) return undefined
      const transform = getComputedStyle(element).transform
      const moving = transform === "none" ? 0 : new DOMMatrix(transform).m42
      return element.getBoundingClientRect().top - moving
    }
    const was = lastTops.current
    const now = { title: top("[data-flip='title']"), summary: top("[data-flip='summary']") }
    const switched = lastMode.current !== mode
    lastTops.current = now
    lastMode.current = mode
    if (!switched || reducedMotion || was.title === undefined || now.title === undefined) return

    const timing = {
      duration: motion.reflow,
      easing: getComputedStyle(section).getPropertyValue("--ease-settle-curve").trim() || "ease-out",
    }
    const slide = (element: Element, offset: number, fade = false) => {
      // A switch made mid-move starts again from where things rest.
      element.getAnimations().forEach((animation) => animation.cancel())
      element.animate(
        [
          { transform: `translateY(${offset}px)`, ...(fade ? { opacity: 0 } : {}) },
          { transform: "none", ...(fade ? { opacity: 1 } : {}) },
        ],
        timing,
      )
    }

    const titleOffset = was.title - now.title
    const title = section.querySelector("[data-flip='title']")
    if (title && titleOffset !== 0) slide(title, titleOffset)
    section.querySelectorAll("[data-flip='stack']").forEach((element) => slide(element, titleOffset, true))
    section.querySelectorAll("[data-flip='after']").forEach((element) => {
      element.getAnimations().forEach((animation) => animation.cancel())
      element.animate([{ opacity: 0 }, { opacity: 1 }], {
        ...timing,
        // The move reads as settled well before it formally ends, so the pills
        // come back at the settle mark and quickly, rather than after all of it.
        delay: motion.settle,
        duration: motion.quick,
        // Held clear through the move, so they never show before their turn.
        fill: "backwards",
      })
    })

    const summary = section.querySelector("[data-flip='summary']")
    if (summary && now.summary !== undefined) {
      // A box that was already on screen glides from its old place; one that
      // was not arrives with the rest of what the switch brings in.
      if (was.summary !== undefined) slide(summary, was.summary - now.summary)
      else slide(summary, titleOffset, true)
    }
  })

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
        ref={sectionRef}
        className={cn(
          "mx-auto flex min-h-0 w-full flex-1 flex-col px-8 pt-6",
          // Manual widens so the three Miller columns span more of the page.
          manualMode ? "max-w-7xl pb-8" : "max-w-4xl items-center justify-center pb-16",
        )}
      >
        <div data-flip="title" className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Drug Database</h1>
          <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm leading-5 text-balance">
            Describe any key search metrics such as Therapy Area, Classification, Geography,
            Route of Administration etc.
          </p>
        </div>

        {manualMode ? (
          <>
            <div
              data-flip="stack"
              className="bg-surface-panel border-border mt-6 flex min-h-72 flex-1 flex-col overflow-hidden rounded-xl border"
            >
              {manual}
            </div>
            {/* Held at Quick's width (52rem) as the columns widen, so it only glides. */}
            <div data-flip="summary" className="mx-auto mt-2 w-full max-w-208 shrink-0">
              {filterBox}
            </div>
          </>
        ) : (
          <>
            <form
              data-flip="stack"
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
              <DictateButton onText={onDictate} disabled={resolving} />
            </form>

            {/*
              The well keeps the pills' height so the centred search never moves,
              and is the one thing that shrinks when the window is too short for it.
              Once a filter exists its box sits above the pills and the stack hangs
              past the well, scrolling the page rather than pushing the search up.
            */}
            <div className="relative mt-5 h-72 w-full">
              {/* A filter box sits 8px under the query that built it, pulled up inside the
                  well rather than moving it, so the search stays put. */}
              <div
                className={cn(
                  "absolute inset-x-0 flex flex-col gap-5 pb-16",
                  filterBox ? "-top-3" : "top-0",
                )}
              >
                {filterBox ? <div data-flip="summary">{filterBox}</div> : null}
                <div data-flip="after">
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
            </div>
          </>
        )}
      </section>
    </main>
  )
}
