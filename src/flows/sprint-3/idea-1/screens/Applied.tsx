import { ProductChrome } from "@/components/prototype/ProductChrome"
import { FilterBar } from "@/flows/sprint-3/idea-1/components/FilterBar"
import { ResultsTable } from "@/flows/sprint-3/idea-1/components/ResultsTable"
import { parsedGroups } from "@/flows/sprint-3/idea-1/data"

/** Filters applied. Same chips, now horizontal, above a narrowed result set. */
export function Applied() {
  return (
    <ProductChrome activeArea="Drugs" body="scroll">
      <FilterBar groups={parsedGroups} resultCount="245 Drugs" />
      <div className="pt-6">
        <ResultsTable />
      </div>
    </ProductChrome>
  )
}
