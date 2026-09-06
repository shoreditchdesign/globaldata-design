import { FilterModal } from "@/flows/sprint-3/idea-1/components/FilterModal"
import {
  CascadePanel,
  CascadeRow,
  ManualPane,
} from "@/flows/sprint-3/idea-1/components/ManualPane"
import { Results } from "@/flows/sprint-3/idea-1/screens/Results"
import { drugAttributes } from "@/flows/sprint-3/idea-1/data"

/** Level two: the attributes inside Drugs, each with a chevron deeper. */
export function ManualAttributes() {
  return (
    <>
      <Results />
      <FilterModal tab="manual">
        <ManualPane
          openArea="Drugs"
          dimOthers
          popover={
            <CascadePanel title="Drugs" className="top-[3.5rem] left-[6.5rem] max-h-[calc(100%-5rem)]">
              {drugAttributes.map((attribute) => (
                <CascadeRow key={attribute} label={attribute} />
              ))}
            </CascadePanel>
          }
        />
      </FilterModal>
    </>
  )
}
