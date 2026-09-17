"use client"

import * as React from "react"
import { usePathname } from "next/navigation"

import { ProductChrome } from "@/components/prototype/ProductChrome"
import { useDeepLink } from "@/hooks/use-deep-link"
import { LandingPage } from "@/flows/sprint-4/idea-1/components/LandingPage"
import {
  activeProductArea,
  definitionFor,
  initialResolvedFilters,
  resultCountFor,
  type FilterId,
  type FilterJoin,
} from "@/flows/sprint-4/idea-1/data"
import {
  initialState,
  slugFor,
  type SearchMode,
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

  const setMode = (mode: SearchMode) => setState((current) => ({ ...current, mode }))
  const setQuery = (query: string) => setState((current) => ({ ...current, query }))
  const resolveQuery = () =>
    setState((current) =>
      current.query.trim()
        ? {
            ...current,
            submittedQuery: current.query.trim(),
            filters: initialResolvedFilters(),
          }
        : current,
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
      const { label, values, excluded, join } = definitionFor(id)
      return {
        ...current,
        filters: [...current.filters, { id, label, values: [...values], excluded, join }],
      }
    })
  const clearFilters = () => setState((current) => ({ ...current, filters: [] }))

  return (
    <ProductChrome activeArea={activeProductArea}>
      <LandingPage
        mode={state.mode}
        query={state.query}
        onModeChange={setMode}
        onQueryChange={setQuery}
        onResolve={resolveQuery}
        hasResolvedFilters={Boolean(state.submittedQuery)}
        filters={state.filters}
        resultCount={resultCountFor(state.filters)}
        onFilterModeChange={setFilterMode}
        onFilterJoinChange={setFilterJoin}
        onToggleFilterValue={toggleFilterValue}
        onRemoveFilter={removeFilter}
        onAddFilter={addFilter}
        onClearFilters={clearFilters}
      />
    </ProductChrome>
  )
}
