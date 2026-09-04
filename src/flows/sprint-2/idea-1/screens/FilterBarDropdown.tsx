import { AppChrome } from "@/flows/sprint-2/idea-1/components/AppChrome"
import { FilterBar } from "@/flows/sprint-2/idea-1/components/FilterBar"
import { CascadePanel, CascadeValueRow } from "@/flows/sprint-2/idea-1/components/ManualPane"
import { ResultsTable } from "@/flows/sprint-2/idea-1/components/ResultsTable"
import { developmentalStages, parsedGroups } from "@/flows/sprint-2/idea-1/data"

/**
 * Filters stay editable from the bar — the same value popover reopens inline,
 * so refining does not mean going back into the modal.
 */
export function FilterBarDropdown() {
  return (
    <AppChrome>
      <FilterBar groups={parsedGroups} resultCount="245 Drugs">
        <CascadePanel
          title="Developmental stage"
          searchPlaceholder="Search Developmental Stage"
          className="top-[4.5rem] left-6 z-10"
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
    </AppChrome>
  )
}
