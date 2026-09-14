"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

import { Button } from "@/components/ui/button"
import { ProductChrome } from "@/components/prototype/ProductChrome"
import { motion, usePrefersReducedMotion } from "@/components/prototype/motion"
import { AiPane } from "@/flows/sprint-3/idea-1/components/AiPane"
import { FilterBar } from "@/flows/sprint-3/idea-1/components/FilterBar"
import { FilterModal } from "@/flows/sprint-3/idea-1/components/FilterModal"
import { GroupedResults, type Grouping } from "@/flows/sprint-3/idea-1/components/GroupedResults"
import {
  CascadePanel,
  CascadeRow,
  CascadeValueRow,
  ManualPane,
} from "@/flows/sprint-3/idea-1/components/ManualPane"
import { ResultsTable, resultColumns } from "@/flows/sprint-3/idea-1/components/ResultsTable"
import {
  areaAttributes,
  findAttribute,
  formatCount,
  matchingRows,
  resolveQuery,
  resultCount,
  type AttributeSpec,
  type FilterGroup,
  type Operator,
  type RowField,
  type ValueOption,
} from "@/flows/sprint-3/idea-1/data"
import {
  finishResolving,
  initialState,
  isValueSelected,
  removeChip,
  selectedCountFor,
  setChipOperator,
  setGroupOperator,
  slugFor,
  toggleValue,
  type Idea1State,
  type Tab,
} from "@/flows/sprint-3/idea-1/state"

const PANEL_CLASS = "top-0 left-full z-20 ml-2 max-h-[min(26rem,46svh)]"
const BAR_PANEL_CLASS = "top-full left-0 z-30 mt-2 max-h-[min(26rem,50svh)]"

/** Quiet disclosure for an attribute the sample cannot evaluate. */
const UNEVALUATED_NOTE = "Not in this sample; the table ignores it"

/**
 * The slug this screen last wrote into the URL itself.
 *
 * A URL change that matches it is the screen's own echo coming back through
 * the router, not a jump, so it must not reseed. Module scope rather than a
 * ref because it is read during render, and it only ever describes this one
 * window's history.
 */
let lastWrittenSlug: string | null = null

function splitPath(pathname: string) {
  const cut = pathname.lastIndexOf("/")
  return { base: pathname.slice(0, cut), slug: pathname.slice(cut + 1) }
}

function valueLabel(value: ValueOption) {
  return value.prefix ? `${value.prefix} ${value.label}` : value.label
}

/**
 * The incumbent, as one screen.
 *
 * The reviewed design was twelve fixed frames; this is the same design with the
 * frames joined up, so a client can walk it rather than be walked through it.
 * Nothing has been made nicer on the way — the three levels of cascade, the
 * separate `Apply filters` commit and the modal that hides the table are all
 * still here, because they are the evidence.
 *
 * The slug in the URL seeds the state on arrival. From then on the state leads
 * and the URL follows it with `replaceState`, which the App Router folds into
 * `usePathname` without re-rendering the route — so the screen keeps its state
 * while the address bar and the Explorer name the frame it is nearest to. A
 * URL change the screen did not write is a jump, and reseeds.
 */
export function IncumbentScreen() {
  const pathname = usePathname()
  const { base, slug } = splitPath(pathname)

  const [state, setState] = useState<Idea1State>(() => initialState(slug))
  const [search, setSearch] = useState("")
  const reducedMotion = usePrefersReducedMotion()

  const liveSlug = slugFor(state)

  // A jump to another frame that React did not remount for — the Explorer
  // linking to the slug this route was first rendered with — arrives only as a
  // new pathname. Adjusted during render so the old state never paints first.
  const [seenSlug, setSeenSlug] = useState(slug)
  if (seenSlug !== slug) {
    setSeenSlug(slug)
    if (slug !== liveSlug && slug !== lastWrittenSlug) {
      setState(initialState(slug))
      setSearch("")
    }
  }

  // Replace, not push. The state cannot be rebuilt from history, so a pushed
  // entry per click would make Back change the address and nothing else. Back
  // leaves the flow for wherever you were before it, which is what it did when
  // these were twelve separate pages.
  useEffect(() => {
    const target = `${base}/${liveSlug}`
    if (window.location.pathname === target) return
    lastWrittenSlug = liveSlug
    window.history.replaceState(null, "", target)
  }, [base, liveSlug])

  // The resolving beat. A pause, not a computation — the parse is already
  // chosen; this is only how long it takes to become visible.
  useEffect(() => {
    if (!state.resolving) return
    const timer = window.setTimeout(() => setState(finishResolving), motion.hold)
    return () => window.clearTimeout(timer)
  }, [state.resolving])

  const update = (patch: Partial<Idea1State>) => setState((current) => ({ ...current, ...patch }))

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setState((current) => ({ ...current, modal: null, barPopover: null }))
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      const target = event.target
      if (!(target instanceof Element)) return
      if (
        target.closest(
          '[data-slot="filter-cascade-panel"], [data-slot="filter-pill-open"], [data-slot="filter-bar-group-trigger"]',
        )
      ) {
        return
      }
      setState((current) =>
        current.barPopover === null ? current : { ...current, barPopover: null },
      )
    }
    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [])

  const rows = matchingRows(state.applied)
  const count = resultCount(state.applied)
  const hasFilters = state.applied.length > 0

  const filterCounts: Partial<Record<RowField, number>> = {}
  for (const group of state.applied) {
    if (!group.field) continue
    filterCounts[group.field] = (filterCounts[group.field] ?? 0) + group.chips.length
  }

  const areaCounts: Record<string, number> = {}
  for (const group of state.builder) {
    if (!group.area) continue
    areaCounts[group.area] = (areaCounts[group.area] ?? 0) + group.chips.length
  }

  const appliedAreaCounts: Record<string, number> = {}
  for (const group of state.applied) {
    if (!group.area) continue
    appliedAreaCounts[group.area] = (appliedAreaCounts[group.area] ?? 0) + group.chips.length
  }

  /* ---------------------------------------------------------------- modal */

  function openModal(tab: Tab) {
    setState((current) => ({
      ...current,
      modal: tab,
      tab,
      barPopover: null,
      builder: current.applied.length > 0 ? current.applied : current.builder,
    }))
  }

  function applyFilters() {
    setState((current) => ({
      ...current,
      applied: current.builder,
      modal: null,
      openArea: null,
      openAttribute: null,
    }))
  }

  function submitQuery() {
    const query = state.composer.trim()
    if (!query || state.resolving) return
    const parseId = resolveQuery(query).id

    setState((current) => {
      const pending: Idea1State = { ...current, composer: "", resolving: { query, parseId } }
      // Reduced motion skips the beat rather than holding a still frame.
      return reducedMotion ? finishResolving(pending) : pending
    })
  }

  /** Reopen the manual cascade at the area and attribute that produced a pill. */
  function openFilterPath(group: FilterGroup) {
    if (!group.area || !group.attribute || !findAttribute(group.area, group.attribute)) return

    setSearch("")
    setState((current) => ({
      ...current,
      modal: "manual",
      tab: "manual",
      builder:
        current.modal === null && current.applied.length > 0 ? current.applied : current.builder,
      openArea: group.area ?? null,
      openAttribute: group.attribute ?? null,
      barPopover: null,
    }))
  }

  function openBarFilter(groupIndex: number) {
    const group = state.applied[groupIndex]
    if (!group?.area || !group.attribute || !findAttribute(group.area, group.attribute)) return

    setSearch("")
    setState((current) => ({
      ...current,
      modal: null,
      barPopover: current.barPopover === groupIndex ? null : groupIndex,
      openArea: group.area ?? null,
      openAttribute: group.attribute ?? null,
    }))
  }

  /* -------------------------------------------------------------- builder */

  const builderHandlers = {
    onOpenChip: (groupIndex: number) => openFilterPath(state.builder[groupIndex]),
    onRemoveChip: (groupIndex: number, chipIndex: number) =>
      update({ builder: removeChip(state.builder, groupIndex, chipIndex) }),
    onChipOperator: (groupIndex: number, chipIndex: number, operator: Operator) =>
      update({ builder: setChipOperator(state.builder, groupIndex, chipIndex, operator) }),
    onGroupOperator: (groupIndex: number, operator: Operator) =>
      update({ builder: setGroupOperator(state.builder, groupIndex, operator) }),
  }

  /* ------------------------------------------------------------------ bar */

  /** The bar edits the live query, so the builder follows it rather than drifting. */
  function editApplied(groups: FilterGroup[]) {
    setState((current) => {
      const anchor =
        current.barPopover === null ? null : current.applied[current.barPopover]
      const nextAnchor = anchor
        ? groups.findIndex(
            (group) => group.area === anchor.area && group.attribute === anchor.attribute,
          )
        : -1

      return {
        ...current,
        applied: groups,
        builder: groups,
        barPopover: nextAnchor >= 0 ? nextAnchor : null,
      }
    })
  }

  const barHandlers = {
    onOpenChip: (groupIndex: number) => openBarFilter(groupIndex),
    onRemoveChip: (groupIndex: number, chipIndex: number) =>
      editApplied(removeChip(state.applied, groupIndex, chipIndex)),
    onChipOperator: (groupIndex: number, chipIndex: number, operator: Operator) =>
      editApplied(setChipOperator(state.applied, groupIndex, chipIndex, operator)),
    onGroupOperator: (groupIndex: number, operator: Operator) =>
      editApplied(setGroupOperator(state.applied, groupIndex, operator)),
  }

  /* -------------------------------------------------------------- cascade */

  const openSpec =
    state.openArea && state.openAttribute ? findAttribute(state.openArea, state.openAttribute) : null

  function selectArea(area: string | null) {
    setSearch("")
    update({ openArea: area, openAttribute: null })
  }

  function selectAttribute(label: string | null) {
    setSearch("")
    update({ openAttribute: label })
  }

  function tickValue(area: string, spec: AttributeSpec, value: ValueOption) {
    update({ builder: toggleValue(state.builder, area, spec, value) })
  }

  const matches = (label: string) => label.toLowerCase().includes(search.trim().toLowerCase())

  function cascade() {
    if (!state.openArea) return null
    const area = state.openArea

    if (openSpec) {
      const values = openSpec.values.filter((value) => matches(valueLabel(value)))
      return (
        <CascadePanel
          breadcrumb={[area, openSpec.label]}
          searchPlaceholder={`Search ${openSpec.label}`}
          className={PANEL_CLASS}
          selectedCount={selectedCountFor(state.builder, area, openSpec)}
          search={search}
          onSearch={setSearch}
          onBack={() => selectAttribute(null)}
          onDone={() => selectArea(null)}
        >
          {openSpec.field ? null : <CascadeRow label={UNEVALUATED_NOTE} muted />}
          {values.length === 0 ? (
            <CascadeRow label="No matching values" muted />
          ) : (
            values.map((value) => (
              <CascadeValueRow
                key={value.label}
                label={valueLabel(value)}
                count={value.count}
                checked={isValueSelected(state.builder, area, openSpec, value.label)}
                onClick={() => tickValue(area, openSpec, value)}
              />
            ))
          )}
        </CascadePanel>
      )
    }

    const attributes = (areaAttributes[area] ?? []).filter((spec) => matches(spec.label))
    return (
      <CascadePanel
        title={area}
        searchPlaceholder={`Search ${area}`}
        className={PANEL_CLASS}
        selectedCount={areaCounts[area] ?? 0}
        search={search}
        onSearch={setSearch}
        onDone={() => selectArea(null)}
      >
        {attributes.length === 0 ? (
          <CascadeRow label="No matching attributes" muted />
        ) : (
          attributes.map((spec) => (
            <CascadeRow key={spec.label} label={spec.label} onClick={() => selectAttribute(spec.label)} />
          ))
        )}
      </CascadePanel>
    )
  }

  /* ------------------------------------------------------------- grouping */

  const groupingOptions: Grouping[] = resultColumns
    .filter((column) => !state.grouping.some((level) => level.field === column.field))
    .map((column) => ({ field: column.field, label: column.label }))

  function toggleGrouping(field: RowField, label: string) {
    setState((current) => ({
      ...current,
      openGroups: [],
      grouping:
        current.grouping[0]?.field === field ? current.grouping.slice(1) : [{ field, label }],
    }))
  }

  /* --------------------------------------------------------------- render */

  return (
    <>
      <ProductChrome activeArea="Drugs" body="scroll">
        {hasFilters ? (
          <FilterBar
            groups={state.applied}
            resultCount={`${formatCount(count)} Drugs`}
            onOpenGroup={openBarFilter}
            onAddFilter={() => openModal("manual")}
            onClearFilters={() => update({ applied: [], builder: [], barPopover: null })}
            onEditFilters={() => openModal(state.tab)}
            renderPopover={(index) => {
              if (state.barPopover !== index) return null
              if (!state.openArea) return null

              const area = state.openArea
              const spec = state.openAttribute
                ? findAttribute(area, state.openAttribute)
                : null

              if (!spec) {
                const attributes = (areaAttributes[area] ?? []).filter((attribute) =>
                  matches(attribute.label),
                )
                return (
                  <CascadePanel
                    title={area}
                    searchPlaceholder={`Search ${area}`}
                    className={BAR_PANEL_CLASS}
                    selectedCount={appliedAreaCounts[area] ?? 0}
                    search={search}
                    onSearch={setSearch}
                    onDone={() => update({ barPopover: null })}
                  >
                    {attributes.length === 0 ? (
                      <CascadeRow label="No matching attributes" muted />
                    ) : (
                      attributes.map((attribute) => (
                        <CascadeRow
                          key={attribute.label}
                          label={attribute.label}
                          onClick={() => selectAttribute(attribute.label)}
                        />
                      ))
                    )}
                  </CascadePanel>
                )
              }

              const values = spec.values.filter((value) => matches(valueLabel(value)))
              return (
                <CascadePanel
                  breadcrumb={[area, spec.label]}
                  searchPlaceholder={`Search ${spec.label}`}
                  className={BAR_PANEL_CLASS}
                  selectedCount={selectedCountFor(state.applied, area, spec)}
                  search={search}
                  onSearch={setSearch}
                  onBack={() => selectAttribute(null)}
                  onDone={() => update({ barPopover: null })}
                >
                  {spec.field ? null : <CascadeRow label={UNEVALUATED_NOTE} muted />}
                  {values.length === 0 ? (
                    <CascadeRow label="No matching values" muted />
                  ) : (
                    values.map((value) => (
                      <CascadeValueRow
                        key={value.label}
                        label={valueLabel(value)}
                        count={value.count}
                        checked={isValueSelected(state.applied, area, spec, value.label)}
                        onClick={() => editApplied(toggleValue(state.applied, area, spec, value))}
                      />
                    ))
                  )}
                </CascadePanel>
              )
            }}
            {...barHandlers}
          />
        ) : (
          <div className="flex items-center justify-between px-6 py-5">
            <p className="text-muted-foreground text-sm tabular-nums">
              1–{rows.length} of {formatCount(count)} Drugs
            </p>
            <Button size="sm" onClick={() => openModal("ai")}>
              Apply filter
            </Button>
          </div>
        )}

        <div className={hasFilters ? "pt-6" : undefined}>
          {state.grouping.length > 0 ? (
            <GroupedResults
              rows={rows}
              grouping={state.grouping}
              options={groupingOptions}
              openGroups={state.openGroups}
              onToggle={(key) =>
                update({
                  openGroups: state.openGroups.includes(key)
                    ? state.openGroups.filter((open) => open !== key)
                    : [...state.openGroups, key],
                })
              }
              onRemove={(index) =>
                update({
                  grouping: state.grouping.filter((_, i) => i !== index),
                  openGroups: [],
                })
              }
              onAdd={(level) => update({ grouping: [...state.grouping, level], openGroups: [] })}
              onClear={() => update({ grouping: [], openGroups: [] })}
            />
          ) : (
            <ResultsTable
              rows={rows}
              filterCounts={filterCounts}
              onGroupBy={toggleGrouping}
            />
          )}
        </div>
      </ProductChrome>

      {state.modal ? (
        <FilterModal
          tab={state.modal}
          groups={state.builder}
          onTab={(tab) => update({ modal: tab, tab })}
          onClose={() => update({ modal: null })}
          onClear={() => update({ builder: [] })}
          onApply={applyFilters}
          {...builderHandlers}
        >
          {state.modal === "ai" ? (
            <AiPane
              query={state.composer}
              transcript={state.transcript}
              pending={state.resolving?.query}
              onQuery={(composer) => update({ composer })}
              onSubmit={submitQuery}
            />
          ) : (
            <ManualPane
              openArea={state.openArea}
              areaCounts={areaCounts}
              breadcrumbPill={openSpec?.label}
              onSelectArea={selectArea}
              popover={cascade()}
            />
          )}
        </FilterModal>
      ) : null}
    </>
  )
}
