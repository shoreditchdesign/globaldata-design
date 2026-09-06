import { FilterModal } from "@/flows/sprint-3/idea-1/components/FilterModal"
import { ManualPane } from "@/flows/sprint-3/idea-1/components/ManualPane"
import { Results } from "@/flows/sprint-3/idea-1/screens/Results"

/** Manual tab: the eight filter areas, nothing selected. */
export function ManualAreas() {
  return (
    <>
      <Results />
      <FilterModal tab="manual">
        <ManualPane />
      </FilterModal>
    </>
  )
}
