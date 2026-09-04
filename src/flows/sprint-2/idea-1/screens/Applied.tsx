import { AppChrome } from "@/flows/sprint-2/idea-1/components/AppChrome"
import { FilterBar } from "@/flows/sprint-2/idea-1/components/FilterBar"
import { ResultsTable } from "@/flows/sprint-2/idea-1/components/ResultsTable"
import { parsedGroups } from "@/flows/sprint-2/idea-1/data"

/** Filters applied. Same chips, now horizontal, above a narrowed result set. */
export function Applied() {
  return (
    <AppChrome>
      <FilterBar groups={parsedGroups} resultCount="245 Drugs" />
      <div className="pt-6">
        <ResultsTable />
      </div>
    </AppChrome>
  )
}
