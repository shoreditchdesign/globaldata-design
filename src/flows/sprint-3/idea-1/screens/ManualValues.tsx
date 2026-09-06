import { FilterModal } from "@/flows/sprint-3/idea-1/components/FilterModal"
import {
  CascadePanel,
  CascadeValueRow,
  ManualPane,
} from "@/flows/sprint-3/idea-1/components/ManualPane"
import { Results } from "@/flows/sprint-3/idea-1/screens/Results"
import { therapyAreas } from "@/flows/sprint-3/idea-1/data"

/** Level three: values with result counts, and a breadcrumb back up. */
export function ManualValues() {
  return (
    <>
      <Results />
      <FilterModal tab="manual">
        <ManualPane
          openArea="Drugs"
          dimOthers
          breadcrumbPill="Therapy Area / Indication"
          popover={
            <CascadePanel
              breadcrumb={["Drugs", "Therapy Area / Indication"]}
              searchPlaceholder="Search Therapy Area / Indication"
              className="top-[5rem] left-[6.5rem] max-h-[calc(100%-6.5rem)]"
            >
              {therapyAreas.map((area) => (
                <CascadeValueRow key={area.label} label={area.label} count={area.count} />
              ))}
            </CascadePanel>
          }
        />
      </FilterModal>
    </>
  )
}
