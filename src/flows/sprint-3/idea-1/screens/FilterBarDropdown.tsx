import { ProductChrome } from "@/components/prototype/ProductChrome"
import { FilterBar } from "@/flows/sprint-3/idea-1/components/FilterBar"
import { CascadePanel, CascadeValueRow } from "@/flows/sprint-3/idea-1/components/ManualPane"
import { ResultsTable } from "@/flows/sprint-3/idea-1/components/ResultsTable"
import { developmentalStages, parsedGroups } from "@/flows/sprint-3/idea-1/data"

/**
 * Filters stay editable from the bar — the same value popover reopens inline,
 * so refining does not mean going back into the modal.
 */
export function FilterBarDropdown() {
  return (
    <ProductChrome activeArea="Drugs" body="scroll">
      <FilterBar groups={parsedGroups} resultCount="245 Drugs">
        <CascadePanel
          title="Developmental stage"
          searchPlaceholder="Search Developmental Stage"
          className="top-[4.5rem] left-6 z-30 max-h-[calc(100svh-16rem)]"
          selectedCount={2}
        >
          {developmentalStages.map((stage) => (
            <CascadeValueRow key={stage.label} label={stage.label} count={stage.count} />
          ))}
        </CascadePanel>
      </FilterBar>
      <div className="pt-6">
        <ResultsTable />
      </div>
    </ProductChrome>
  )
}
