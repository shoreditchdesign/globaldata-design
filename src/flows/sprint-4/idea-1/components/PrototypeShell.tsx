"use client"

import * as React from "react"
import { usePathname } from "next/navigation"

import { ProductChrome } from "@/components/prototype/ProductChrome"
import { useDeepLink } from "@/hooks/use-deep-link"
import { activeProductArea } from "@/flows/sprint-4/idea-1/data"
import {
  initialState,
  slugFor,
  type Sprint4Idea1State,
} from "@/flows/sprint-4/idea-1/state"

/**
 * The living shell for Sprint 4 Idea 1. Content will be composed inside the
 * body as the direction develops; the shared product chrome stays constant.
 */
export function PrototypeShell() {
  const slug = usePathname().split("/").pop() ?? "start"
  const [state, setState] = React.useState<Sprint4Idea1State>(() => initialState(slug))
  const reseed = React.useCallback((next: string) => setState(initialState(next)), [])

  useDeepLink(slugFor(state), reseed)

  return (
    <ProductChrome activeArea={activeProductArea}>
      <main className="bg-surface-page min-h-0 flex-1" />
    </ProductChrome>
  )
}
