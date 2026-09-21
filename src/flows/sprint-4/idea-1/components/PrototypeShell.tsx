"use client"

import * as React from "react"
import { usePathname } from "next/navigation"

import { ProductChrome } from "@/components/prototype/ProductChrome"
import type { ProductArea } from "@/components/prototype/ProductChrome"
import { useDeepLink } from "@/hooks/use-deep-link"
import { LandingPage } from "@/flows/sprint-4/idea-1/components/LandingPage"
import { ManualSearch } from "@/flows/sprint-4/idea-1/components/ManualSearch"
import { ResolvedFilters } from "@/flows/sprint-4/idea-1/components/ResolvedFilters"
import { ResultsPage } from "@/flows/sprint-4/idea-1/components/ResultsPage"
import { SearchPanel } from "@/flows/sprint-4/idea-1/components/SearchPanel"
import {
  activeProductArea,
  definitionFor,
  emptyPathFilter,
  pathFilter,
  type FilterId,
  type FilterJoin,
  type FilterLink,
} from "@/flows/sprint-4/idea-1/data"
import { resultsFor } from "@/flows/sprint-4/idea-1/results"
import { resolveQuery as resolveNaturalLanguage } from "@/flows/sprint-4/idea-1/resolve"
import {
  initialState,
  slugFor,
  type SearchMode,
  type Sprint4Idea1State,
} from "@/flows/sprint-4/idea-1/state"

/**
 * Ticks one value of a pill or Miller column path into the filters, or takes
 * it out again when it is already there.
 */
function toggleValueAt(
  current: Sprint4Idea1State,
  area: ProductArea,
  attribute: string,
  value: string,
): Sprint4Idea1State {
  const path = { area, attribute, value }
  const picked = pathFilter(area, attribute, value)

  // The first path starts the filters; once there are filters, on either page,
  // a path refines them, joining a clause that tests the same thing.
  const hasFilters = current.showResults || current.submittedQuery || current.path
  if (!hasFilters) return { ...current, path, filters: [picked] }
  const existing = current.filters.find((filter) => filter.id === picked.id)

  // A value already in its filter is selected, so a second click takes it out
  // again — and the filter with it, once it holds nothing.
  if (existing?.values.includes(value)) {
    return {
      ...current,
      filters: current.filters.flatMap((filter) => {
        if (filter.id !== picked.id) return [filter]
        const values = filter.values.filter((item) => item !== value)
        return values.length > 0 ? [{ ...filter, values }] : []
      }),
    }
  }

  const filters = existing
    ? current.filters.map((filter) =>
        filter.id === picked.id ? { ...filter, values: [...filter.values, value] } : filter,
      )
    : [...current.filters, picked]
  return { ...current, path, filters }
}

/**
 * The living shell for Sprint 4 Idea 1: the landing search until a search
 * runs, then the results page. The shared product chrome stays constant.
 */
export function PrototypeShell() {
  const slug = usePathname().split("/").pop() ?? "start"
  const [state, setState] = React.useState<Sprint4Idea1State>(() => initialState(slug))
  const reseed = React.useCallback((next: string) => setState(initialState(next)), [])

  useDeepLink(slugFor(state), reseed)

  const setMode = (mode: SearchMode) => setState((current) => ({ ...current, mode }))
  const setQuery = (query: string) => setState((current) => ({ ...current, query }))
  // Dictation adds to the query rather than replacing it, so a session spoken
  // in several goes builds one request — the arrow still resolves it.
  const appendQuery = (text: string) =>
    setState((current) => ({
      ...current,
      query: current.query.trim() ? `${current.query.trim()} ${text}` : text,
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
          : [...current.filters, started],
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
  const submitQuery = () =>
    setState((current) => {
      const resolution = resolveNaturalLanguage(current.query)
      return resolution.ok ? { ...current, pending: resolution } : current
    })
  const settleQuery = React.useCallback(
    () =>
      setState((current) =>
        current.pending
          ? {
              ...current,
              submittedQuery: current.pending.raw,
              filterBoxOpen: true,
              filters: current.pending.filters,
              path: null,
              pending: null,
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
        return [{ ...filter, values }]
      }),
    }))
  const removeFilter = (id: FilterId) =>
    setState((current) => ({
      ...current,
      filters: current.filters.filter((filter) => filter.id !== id),
    }))
  const addFilter = (id: FilterId) =>
    setState((current) => {
      if (current.filters.some((filter) => filter.id === id)) return current
      const { label, values, excluded, join, link } = definitionFor(id)
      return {
        ...current,
        filters: [...current.filters, { id, label, values: [...values], excluded, join, link }],
      }
    })
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
      onAdd={addFilter}
      onClear={clearFilters}
      onSearch={state.showResults ? undefined : search}
      // Manual always shows the box, so it has nothing to close back to.
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
          filterBox={filterBox}
          panel={
            <SearchPanel
              mode={state.mode}
              query={state.query}
              filters={state.filters}
              pending={state.pending}
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
            layout="wide"
            filters={state.filters}
            activeCategory={state.manualCategory}
            activeAttribute={state.manualAttribute}
            onOpenCategory={openCategory}
            onOpenAttribute={openAttribute}
            onToggleValue={pickValueAt}
          />
        }
        pending={state.pending}
        onScanDone={settleQuery}
      />
    </ProductChrome>
  )
}
