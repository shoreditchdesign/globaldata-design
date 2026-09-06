import { FilterModal } from "@/flows/sprint-3/idea-1/components/FilterModal"
import {
  CascadePanel,
  CascadeValueRow,
  ManualPane,
} from "@/flows/sprint-3/idea-1/components/ManualPane"
import { Results } from "@/flows/sprint-3/idea-1/screens/Results"
import { therapyAreas } from "@/flows/sprint-3/idea-1/data"

/**
 * Ticking a value writes it straight into the builder — the popover does not
 * have to be dismissed first.
 */
export function ManualSelected() {
  return (
    <>
      <Results />
      <FilterModal
        tab="manual"
        groups={[
          {
            label: "Therapy area / indication",
            chips: [{ label: "Cardiovascular", count: 20 }],
          },
        ]}
      >
        <ManualPane
          openArea="Drugs"
          dimOthers
          breadcrumbPill="Therapy Area / Indication"
          popover={
            <CascadePanel
              breadcrumb={["Drugs", "Therapy Area / Indication"]}
              searchPlaceholder="Search Therapy Area / Indication"
              className="top-[5rem] left-[6.5rem] max-h-[calc(100%-6.5rem)]"
              selectedCount={20}
            >
              {therapyAreas.map((area, i) => (
                <CascadeValueRow
                  key={area.label}
                  label={area.label}
                  count={area.count}
                  checked={i === 0}
                />
              ))}
            </CascadePanel>
          }
        />
      </FilterModal>
    </>
  )
}
