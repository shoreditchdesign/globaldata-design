"use client"

import * as React from "react"
import { usePathname } from "next/navigation"

import { ProductChrome } from "@/components/prototype/ProductChrome"
import type { ProductArea } from "@/components/prototype/ProductChrome"
import { useDeepLink } from "@/hooks/use-deep-link"
import { LandingPage } from "@/flows/sprint-4/idea-1b/components/LandingPage"
import { ManualSearch } from "@/flows/sprint-4/idea-1b/components/ManualSearch"
import { ResolvedFilters } from "@/flows/sprint-4/idea-1b/components/ResolvedFilters"
import { ResultsPage } from "@/flows/sprint-4/idea-1b/components/ResultsPage"
import { SearchPanel } from "@/flows/sprint-4/idea-1b/components/SearchPanel"
import {
  activeProductArea,
  nextAppliedAt,
  stampInOrder,
  emptyPathFilter,
  pathFilter,
  type FilterId,
  type FilterJoin,
  type FilterLink,
} from "@/flows/sprint-4/idea-1b/data"
import { resultsFor } from "@/flows/sprint-4/idea-1b/results"
import {
  resolveQuery as resolveNaturalLanguage,
  type Resolution,
} from "@/flows/sprint-4/idea-1b/resolve"
import {
  initialState,
  slugFor,
  type SearchMode,
  type Sprint4Idea1bState,
} from "@/flows/sprint-4/idea-1b/state"

/**
 * Ticks one value of a pill or Miller column path into the filters, or takes
 * it out again when it is already there.
 */
function toggleValueAt(
  current: Sprint4Idea1bState,
  area: ProductArea,
  attribute: string,
  value: string,
): Sprint4Idea1bState {
  const path = { area, attribute, value }
  const picked = pathFilter(area, attribute, value)

  // The first path starts the filters; once there are filters, on either page,
  // a path refines them, joining a clause that tests the same thing.
  const hasFilters = current.showResults || current.submittedQuery || current.path
  // Every branch below stamps the clause it touches: adding one and changing
  // one are both "the most recent thing the reader did", which is what the
  // empty state needs to be able to offer the one step back.
  const at = nextAppliedAt(current.filters)
  if (!hasFilters) return { ...current, path, filters: [{ ...picked, appliedAt: at }] }
  const existing = current.filters.find((filter) => filter.id === picked.id)

  // A value already in its filter is selected, so a second click takes it out
  // again — and the filter with it, once it holds nothing.
  if (existing?.values.includes(value)) {
    return {
      ...current,
      filters: current.filters.flatMap((filter) => {
        if (filter.id !== picked.id) return [filter]
        const values = filter.values.filter((item) => item !== value)
        return values.length > 0 ? [{ ...filter, values, appliedAt: at }] : []
      }),
    }
  }

  const filters = existing
    ? current.filters.map((filter) =>
        filter.id === picked.id
          ? { ...filter, values: [...filter.values, value], appliedAt: at }
          : filter,
      )
    : [...current.filters, { ...picked, appliedAt: at }]
  return { ...current, path, filters }
}

/**
 * One value, in place of whatever that clause held.
 *
 * What clicking the row of a list does, as against clicking its tick box: a
 * list is most often read to pick one thing, and picking it should not mean
 * first clearing what a previous read left behind.
 */
function onlyValueAt(
  current: Sprint4Idea1bState,
  area: ProductArea,
  attribute: string,
  value: string,
): Sprint4Idea1bState {
  const picked = pathFilter(area, attribute, value)
  const existing = current.filters.some((filter) => filter.id === picked.id)
  const at = nextAppliedAt(current.filters)
  return {
    ...current,
    path: { area, attribute, value },
    // An existing clause keeps everything but its values — whether it includes
    // or excludes, and how it joins the clause before it, were decided in the
    // box and are not this list's to reset.
    filters: existing
      ? current.filters.map((filter) =>
          filter.id === picked.id ? { ...filter, values: [value], appliedAt: at } : filter,
        )
      : [...current.filters, { ...picked, appliedAt: at }],
  }
}

/** Whether a read left words it could not place, or asked for something unbuilt. */
function leftOver(resolution: Resolution) {
  return resolution.unplaced.length > 0 || resolution.notes.length > 0
}

/**
 * The living shell for Sprint 4 Idea 1: the landing search until a search
 * runs, then the results page. The shared product chrome stays constant.
 */
export function PrototypeShell() {
  const slug = usePathname().split("/").pop() ?? "start"
  const [state, setState] = React.useState<Sprint4Idea1bState>(() => initialState(slug))
  const reseed = React.useCallback((next: string) => setState(initialState(next)), [])

  useDeepLink(slugFor(state), reseed)

  const setMode = (mode: SearchMode) => setState((current) => ({ ...current, mode }))
  // A changed query is a new question, so what the last one left unread goes.
  const setQuery = (query: string) =>
    setState((current) => ({ ...current, query, unread: null }))
  // Dictation adds to the query rather than replacing it, so a session spoken
  // in several goes builds one request — the arrow still resolves it.
  const appendQuery = (text: string) =>
    setState((current) => ({
      ...current,
      query: current.query.trim() ? `${current.query.trim()} ${text}` : text,
      unread: null,
    }))
  // A pill puts its clause in the filter box, waiting for a value, and takes it
  // out again when pressed a second time. The value is chosen from the clause's
  // own selector, which the reader opens when they are ready.
  const togglePillFilter = (area: ProductArea, attribute: string) =>
    setState((current) => {
      const started = emptyPathFilter(area, attribute)
      const existing = current.filters.some((filter) => filter.id === started.id)
      return {
        ...current,
        // The box opens with the first clause and stays open once it has: a
        // pill taken off again empties the box, it does not close it.
        filterBoxOpen: true,
        filters: existing
          ? current.filters.filter((filter) => filter.id !== started.id)
          : [...current.filters, { ...started, appliedAt: nextAppliedAt(current.filters) }],
      }
    })
  // Miller columns open rather than toggle: clicking the open row keeps it open.
  const openCategory = (category: ProductArea) =>
    setState((current) => ({
      ...current,
      manualCategory: category,
      manualAttribute: current.manualCategory === category ? current.manualAttribute : null,
    }))
  const openAttribute = (attribute: string) =>
    setState((current) => ({ ...current, manualAttribute: attribute }))
  const pickValueAt = (area: ProductArea, attribute: string, value: string) =>
    setState((current) => toggleValueAt(current, area, attribute, value))
  const pickOnlyValueAt = (area: ProductArea, attribute: string, value: string) =>
    setState((current) => onlyValueAt(current, area, attribute, value))
  const submitQuery = () =>
    setState((current) => {
      const resolution = resolveNaturalLanguage(current.query)
      // A read that placed nothing leaves the filters alone and says why,
      // rather than swallowing the request.
      return resolution.ok
        ? { ...current, pending: resolution, unread: null }
        : { ...current, unread: resolution }
    })
  const settleQuery = React.useCallback(
    () =>
      setState((current) =>
        current.pending
          ? {
              ...current,
              submittedQuery: current.pending.raw,
              filterBoxOpen: true,
              // A read replaces the set, so the clauses are stamped in the order
              // the sentence named them — the last phrase read is the last
              // criterion applied.
              filters: stampInOrder(current.pending.filters),
              path: null,
              pending: null,
              // Anything the read could not place is said once it has settled.
              unread: leftOver(current.pending) ? current.pending : null,
            }
          : current,
      ),
    [],
  )
  const setFilterMode = (id: FilterId, excluded: boolean) =>
    setState((current) => ({
      ...current,
      filters: current.filters.map((filter) =>
        filter.id === id ? { ...filter, excluded } : filter,
      ),
    }))
  const setFilterJoin = (id: FilterId, join: FilterJoin) =>
    setState((current) => ({
      ...current,
      filters: current.filters.map((filter) =>
        filter.id === id ? { ...filter, join } : filter,
      ),
    }))
  const setFilterLink = (id: FilterId, link: FilterLink) =>
    setState((current) => ({
      ...current,
      filters: current.filters.map((filter) =>
        filter.id === id ? { ...filter, link } : filter,
      ),
    }))
  const toggleFilterValue = (id: FilterId, value: string) =>
    setState((current) => ({
      ...current,
      filters: current.filters.flatMap((filter) => {
        if (filter.id !== id) return [filter]
        const values = filter.values.includes(value)
          ? filter.values.filter((item) => item !== value)
          : [...filter.values, value]
        // An emptied clause stays, back at Select value. Its pill is what puts
        // it in the box and what takes it out, so unticking a value must not.
        return [{ ...filter, values, appliedAt: nextAppliedAt(current.filters) }]
      }),
    }))
  const removeFilter = (id: FilterId) =>
    setState((current) => ({
      ...current,
      filters: current.filters.filter((filter) => filter.id !== id),
    }))
  const clearFilters = () => setState((current) => ({ ...current, filters: [] }))
  const closeFilters = () => setState(initialState("start"))
  const search = () =>
    setState((current) => ({
      ...current,
      pending: null,
      showResults: true,
    }))

  const filterBox = (
    <ResolvedFilters
      filters={state.filters}
      resultCount={resultsFor(state.filters).count}
      onModeChange={setFilterMode}
      onJoinChange={setFilterJoin}
      onLinkChange={setFilterLink}
      onToggleValue={toggleFilterValue}
      onRemove={removeFilter}
      onPickValue={pickValueAt}
      onPickOnlyValue={pickOnlyValueAt}
      onClear={clearFilters}
      onSearch={state.showResults ? undefined : search}
      // Advanced always shows the box, so it has nothing to close back to.
      onClose={state.showResults || state.mode === "manual" ? undefined : closeFilters}
      // On the results page the box is a band above the grid, not a card.
      variant={state.showResults ? "band" : "card"}
    />
  )

  if (state.showResults) {
    return (
      <ProductChrome activeArea={activeProductArea} body="row">
        <ResultsPage
          filters={state.filters}
          onToggleFilterValue={pickValueAt}
          onPickOnlyFilterValue={pickOnlyValueAt}
          onClearFilter={removeFilter}
          onClearFilters={clearFilters}
          filterBox={filterBox}
          panel={
            <SearchPanel
              mode={state.mode}
              query={state.query}
              filters={state.filters}
              pending={state.pending}
              unread={state.unread}
              onModeChange={setMode}
              onQueryChange={setQuery}
              onDictate={appendQuery}
              onResolve={submitQuery}
              onScanDone={settleQuery}
              onToggleFilter={togglePillFilter}
              manualCategory={state.manualCategory}
              manualAttribute={state.manualAttribute}
              onOpenCategory={openCategory}
              onOpenAttribute={openAttribute}
              onValuePickAt={pickValueAt}
            />
          }
        />
      </ProductChrome>
    )
  }

  return (
    <ProductChrome activeArea={activeProductArea}>
      <LandingPage
        mode={state.mode}
        query={state.query}
        onModeChange={setMode}
        onQueryChange={setQuery}
        onDictate={appendQuery}
        onToggleFilter={togglePillFilter}
        onResolve={submitQuery}
        filters={state.filters}
        hasResolvedFilters={Boolean(state.submittedQuery || state.path)}
        filterBox={
          state.mode === "manual" || state.submittedQuery || state.filterBoxOpen
            ? filterBox
            : null
        }
        manual={
          <ManualSearch
            filters={state.filters}
            activeCategory={state.manualCategory}
            activeAttribute={state.manualAttribute}
            onOpenCategory={openCategory}
            onOpenAttribute={openAttribute}
            onToggleValue={pickValueAt}
          />
        }
        pending={state.pending}
        unread={state.unread}
        onScanDone={settleQuery}
      />
    </ProductChrome>
  )
}
