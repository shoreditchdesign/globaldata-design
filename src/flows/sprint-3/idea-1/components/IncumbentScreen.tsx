"use client"

import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { ProductChrome } from "@/components/prototype/ProductChrome"
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
  assistantReply,
  findAttribute,
  formatCount,
  matchingRows,
  parsedGroups,
  resultCount,
  type AttributeSpec,
  type FilterGroup,
  type Operator,
  type RowField,
  type ValueOption,
} from "@/flows/sprint-3/idea-1/data"
import {
  initialState,
  isValueSelected,
  mergeGroups,
  removeChip,
  selectedCountFor,
  setChipOperator,
  setGroupOperator,
  toggleValue,
  type Idea1State,
  type Tab,
} from "@/flows/sprint-3/idea-1/state"

const PANEL_CLASS = "top-0 left-full z-20 ml-2 max-h-[min(26rem,46svh)]"
const BAR_PANEL_CLASS = "top-full left-0 z-30 mt-2 max-h-[min(26rem,50svh)]"

function timestamp() {
  return new Date().toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
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
 * Every original slug seeds a starting state, so the deep links and the
 * Explorer's stepper still land where they used to.
 */
export function IncumbentScreen({ slug }: { slug: string }) {
  const [state, setState] = useState<Idea1State>(() => initialState(slug))
  const [search, setSearch] = useState("")

  const update = (patch: Partial<Idea1State>) => setState((current) => ({ ...current, ...patch }))

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setState((current) => ({ ...current, modal: null }))
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
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
      overflowCount: 0,
    }))
  }

  function submitQuery() {
    setState((current) => ({
      ...current,
      transcript: {
        user: current.composer.trim(),
        assistant: assistantReply,
        time: timestamp(),
      },
      builder: mergeGroups(current.builder, parsedGroups),
      composer: "",
    }))
  }

  /* -------------------------------------------------------------- builder */

  const builderHandlers = {
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
    update({ applied: groups, builder: groups, overflowCount: 0 })
  }

  const barHandlers = {
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
      const values = openSpec.values.filter((value) => matches(value.label))
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
          {values.length === 0 ? (
            <CascadeRow label="No matching values" muted />
          ) : (
            values.map((value) => (
              <CascadeValueRow
                key={value.label}
                label={value.label}
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
            overflowCount={state.overflowCount || undefined}
            onOpenGroup={(index) => {
              const group = state.applied[index]
              const spec =
                group.area && group.attribute ? findAttribute(group.area, group.attribute) : null
              if (!spec) return
              setSearch("")
              update({ barPopover: state.barPopover === index ? null : index })
            }}
            onAddFilter={() => openModal("manual")}
            onClearFilters={() => update({ applied: [], builder: [], overflowCount: 0, barPopover: null })}
            onEditFilters={() => openModal(state.tab)}
            renderPopover={(index) => {
              if (state.barPopover !== index) return null
              const group = state.applied[index]
              const spec =
                group.area && group.attribute ? findAttribute(group.area, group.attribute) : null
              if (!spec || !group.area) return null
              const area = group.area
              const values = spec.values.filter((value) => matches(value.label))
              return (
                <CascadePanel
                  title={group.label}
                  searchPlaceholder={`Search ${spec.label}`}
                  className={BAR_PANEL_CLASS}
                  selectedCount={group.chips.length}
                  search={search}
                  onSearch={setSearch}
                  onDone={() => update({ barPopover: null })}
                >
                  {values.length === 0 ? (
                    <CascadeRow label="No matching values" muted />
                  ) : (
                    values.map((value) => (
                      <CascadeValueRow
                        key={value.label}
                        label={value.label}
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
