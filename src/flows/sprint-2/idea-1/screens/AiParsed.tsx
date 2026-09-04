import { AiPane } from "@/flows/sprint-2/idea-1/components/AiPane"
import { FilterModal } from "@/flows/sprint-2/idea-1/components/FilterModal"
import { Results } from "@/flows/sprint-2/idea-1/screens/Results"
import { assistantReply, exampleQuery, parsedGroups } from "@/flows/sprint-2/idea-1/data"

/**
 * The payload screen. The exchange becomes a transcript and the builder fills
 * with editable groups — the AI's output is the same object the manual path
 * produces.
 */
export function AiParsed() {
  return (
    <>
      <Results />
      <FilterModal tab="ai" groups={parsedGroups}>
        <AiPane
          transcript={{ user: exampleQuery, assistant: assistantReply, time: "03:04 PM" }}
        />
      </FilterModal>
    </>
  )
}
