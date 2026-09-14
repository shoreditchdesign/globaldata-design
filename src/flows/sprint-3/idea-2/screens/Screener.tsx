"use client"

import { usePathname } from "next/navigation"

import { ProductChrome } from "@/components/prototype/ProductChrome"
import { useDeepLink } from "@/hooks/use-deep-link"
import { FilterPanel } from "@/flows/sprint-3/idea-2/components/FilterPanel"
import { ResultsPane } from "@/flows/sprint-3/idea-2/components/ResultsPane"
import { initialState } from "@/flows/sprint-3/idea-2/state"
import { useScreener } from "@/flows/sprint-3/idea-2/use-screener"

/**
 * The primary working state: three filters applied, the drill-down open two
 * levels into Therapy Area, and the results reflowing beside it.
 *
 * The panel is a region of the layout, not an overlay. The objection to Sprint
 * 2 was being covered, not the panel being small, so the columns are never
 * replaced and the filtering itself never puts anything on top of them. One
 * thing arrives over the screen, and only when it is asked for: `Open` on a
 * drug name slides the record in from the right behind a scrim — the client
 * wanted a record dismissable rather than docked. The agent covers nothing at
 * all; it is asked for in the foot of the panel and works the columns above it,
 * in view.
 *
 * All of the screen's state lives in one hook, because the columns, the pills,
 * the count and the table have to be derived from the same filters — and the
 * agent has to drive that state rather than a copy of it.
 *
 * That one state is also what the URL names. The slug seeds the screener on
 * arrival — a cold start, a run mid-flight, a finished run with its steps
 * still undoable — and from then on the state leads and the address follows it,
 * so a link opens on a frame rather than only at the beginning of the flow.
 */
export function Screener() {
  const pathname = usePathname()
  const screener = useScreener(initialState(pathname.slice(pathname.lastIndexOf("/") + 1)))

  useDeepLink(screener.liveSlug, (slug) => screener.reseed(initialState(slug)))

  return (
    <ProductChrome activeArea="Drugs" body="row">
      {/*
        Half the window each. The columns are still the work, but four fifths of
        the screen bought a third column rather than a better one, and it left
        the results as a strip. The floors are what the two regions stop at
        rather than what they aim for: two Miller columns at their 260px minimum
        plus the rule between them and the panel's own border is 522px, and the
        results pane holds its name column at 260px, so the body scrolls
        sideways below 782px of window instead of the 1,160px it used to.
      */}
      <FilterPanel
        screener={screener}
        className="border-edge w-[50%] max-w-none min-w-[522px] shrink-0 border-r"
      />
      <ResultsPane screener={screener} className="min-w-[260px] flex-1" />
    </ProductChrome>
  )
}
