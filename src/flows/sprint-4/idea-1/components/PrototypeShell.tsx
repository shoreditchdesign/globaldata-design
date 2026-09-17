"use client"

import * as React from "react"
import { usePathname } from "next/navigation"

import { ProductChrome } from "@/components/prototype/ProductChrome"
import type { ProductArea } from "@/components/prototype/ProductChrome"
import { useDeepLink } from "@/hooks/use-deep-link"
import { LandingPage } from "@/flows/sprint-4/idea-1/components/LandingPage"
import { ResolvedFilters } from "@/flows/sprint-4/idea-1/components/ResolvedFilters"
import { ResultsPage } from "@/flows/sprint-4/idea-1/components/ResultsPage"
import { SearchPanel } from "@/flows/sprint-4/idea-1/components/SearchPanel"
import {
  activeProductArea,
  definitionFor,
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
  const toggleCategory = (category: ProductArea) =>
    setState((current) => ({
      ...current,
      activeCategory: current.activeCategory === category ? null : category,
      activeAttribute: null,
    }))
  const toggleAttribute = (attribute: string) =>
    setState((current) => ({
      ...current,
      activeAttribute: current.activeAttribute === attribute ? null : attribute,
    }))
  const pickValue = (value: string) =>
    setState((current) => {
      if (!current.activeCategory || !current.activeAttribute) return current
      const path = {
        area: current.activeCategory,
        attribute: current.activeAttribute,
        value,
      }
      const picked = pathFilter(path.area, path.attribute, value)

      // On the landing page a path starts the filters; on the results page it
      // refines the ones already there, joining a clause that tests the same thing.
      if (!current.showResults) return { ...current, path, filters: [picked] }
      const existing = current.filters.find((filter) => filter.id === picked.id)
      const filters = existing
        ? current.filters.map((filter) =>
            filter.id === picked.id && !filter.values.includes(value)
              ? { ...filter, values: [...filter.values, value] }
              : filter,
          )
        : [...current.filters, picked]
      return { ...current, path, filters }
    })
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
        return values.length > 0 ? [{ ...filter, values }] : []
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
  const clearFilters = () =>
    setState((current) =>
      current.showResults ? { ...current, filters: [] } : initialState("start"),
    )
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
      // On the results page the box is a band above the grid, not a card.
      className={state.showResults ? "bg-surface-chrome rounded-none border-0" : undefined}
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
              activeCategory={state.activeCategory}
              activeAttribute={state.activeAttribute}
              pending={state.pending}
              onModeChange={setMode}
              onQueryChange={setQuery}
              onResolve={submitQuery}
              onScanDone={settleQuery}
              onCategoryChange={toggleCategory}
              onAttributeChange={toggleAttribute}
              onValuePick={pickValue}
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
        activeCategory={state.activeCategory}
        onModeChange={setMode}
        onQueryChange={setQuery}
        onCategoryChange={toggleCategory}
        activeAttribute={state.activeAttribute}
        onAttributeChange={toggleAttribute}
        onValuePick={pickValue}
        onResolve={submitQuery}
        hasResolvedFilters={Boolean(state.submittedQuery || state.path)}
        filterBox={state.submittedQuery || state.path ? filterBox : null}
        pending={state.pending}
        onScanDone={settleQuery}
      />
    </ProductChrome>
  )
}
