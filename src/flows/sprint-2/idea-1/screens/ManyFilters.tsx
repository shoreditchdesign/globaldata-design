import { AppChrome } from "@/flows/sprint-2/idea-1/components/AppChrome"
import { FilterBar } from "@/flows/sprint-2/idea-1/components/FilterBar"
import { ResultsTable } from "@/flows/sprint-2/idea-1/components/ResultsTable"
import { overflowGroups, parsedGroups } from "@/flows/sprint-2/idea-1/data"

/**
 * Past ten filters the bar wraps and overflows into a `+2`. This is the state
 * that decides whether the pattern scales — worth putting in front of the
 * client rather than hiding.
 */
export function ManyFilters() {
  return (
    <AppChrome>
      <FilterBar
        groups={[...parsedGroups, ...overflowGroups]}
        resultCount="245 Drugs"
        overflowCount={2}
      />
      <div className="pt-6">
        <ResultsTable />
      </div>
    </AppChrome>
  )
}
