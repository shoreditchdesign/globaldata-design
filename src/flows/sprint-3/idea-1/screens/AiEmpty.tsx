import { AiPane } from "@/flows/sprint-3/idea-1/components/AiPane"
import { FilterModal } from "@/flows/sprint-3/idea-1/components/FilterModal"
import { Results } from "@/flows/sprint-3/idea-1/screens/Results"

/** Modal opens on the AI tab: suggestions, empty composer, empty builder. */
export function AiEmpty() {
  return (
    <>
      <Results />
      <FilterModal tab="ai">
        <AiPane />
      </FilterModal>
    </>
  )
}
