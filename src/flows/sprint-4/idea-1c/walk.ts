"use client"

import * as React from "react"

import type { ProductArea } from "@/components/prototype/ProductChrome"
import { motion, usePrefersReducedMotion } from "@/components/prototype/motion"
import { pathOf, type ResolvedFilter } from "@/flows/sprint-4/idea-1c/data"

/**
 * The Miller columns walking to what a query resolved into.
 *
 * Ported from Sprint 3 Idea 2's agent run, and only its walk: there the agent
 * travelled the columns to each attribute and then ticked the values one by
 * one, a step at a time, with a log of what it did. Here the filters are
 * already applied when the walk starts — the table does not wait on it — so
 * all it does is drive the columns through each filter's path in the order
 * the sentence named them, opening the area and then the attribute, and come
 * to rest on the last one, its values ticked. It shows the reader where the
 * read put things, in the interface they would use to put them there.
 *
 * Faster than Sprint 3's 520ms move and 380ms tick: a beat of `motion.quick`
 * to open an area and `motion.settle` on each attribute, so a five-filter
 * query walks in a little over two seconds. Reduced motion skips the walk and
 * opens the last filter's path directly.
 */
interface Walk {
  paths: { area: ProductArea; attribute: string }[]
  /** Which path, and whether its area (0) or attribute (1) is next to open. */
  index: number
  beat: 0 | 1
}

export function useMillerWalk({
  openCategory,
  openAttribute,
}: {
  openCategory: (area: ProductArea) => void
  openAttribute: (attribute: string) => void
}) {
  const reducedMotion = usePrefersReducedMotion()
  const [walk, setWalk] = React.useState<Walk | null>(null)

  const start = React.useCallback(
    (filters: ResolvedFilter[]) => {
      const seen = new Set<string>()
      const paths = filters
        .map((filter) => pathOf(filter.id))
        .filter((path) => {
          const key = `${path.area}/${path.attribute}`
          if (!path.area || seen.has(key)) return false
          seen.add(key)
          return true
        })
      if (paths.length === 0) return
      if (reducedMotion) {
        const last = paths[paths.length - 1]
        openCategory(last.area)
        openAttribute(last.attribute)
        return
      }
      setWalk({ paths, index: 0, beat: 0 })
    },
    [reducedMotion, openCategory, openAttribute],
  )

  /** The reader taking over: their next click is theirs, not the walk's. */
  const stop = React.useCallback(() => setWalk(null), [])

  React.useEffect(() => {
    if (!walk) return
    const path = walk.paths[walk.index]
    // The first area opens straight away; every later move waits a beat, so
    // the previous attribute has been seen before the columns leave it.
    const delay = walk.beat === 0 ? (walk.index === 0 ? 0 : motion.settle) : motion.quick
    const timer = window.setTimeout(() => {
      if (walk.beat === 0) {
        openCategory(path.area)
        setWalk({ ...walk, beat: 1 })
        return
      }
      openAttribute(path.attribute)
      const next = walk.index + 1
      setWalk(next < walk.paths.length ? { ...walk, index: next, beat: 0 } : null)
    }, delay)
    return () => window.clearTimeout(timer)
  }, [walk, openCategory, openAttribute])

  return { start, stop, walking: walk !== null }
}
