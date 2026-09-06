import { AiPane } from "@/flows/sprint-3/idea-1/components/AiPane"
import { FilterModal } from "@/flows/sprint-3/idea-1/components/FilterModal"
import { Results } from "@/flows/sprint-3/idea-1/screens/Results"
import { exampleQuery } from "@/flows/sprint-3/idea-1/data"

/** Query typed. The composer grows with the text; the builder is still empty. */
export function AiTyped() {
  return (
    <>
      <Results />
      <FilterModal tab="ai">
        <AiPane query={exampleQuery} />
      </FilterModal>
    </>
  )
}
