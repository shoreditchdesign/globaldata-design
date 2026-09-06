import { Button } from "@/components/ui/button"
import { ProductChrome } from "@/components/prototype/ProductChrome"
import { ResultsTable } from "@/flows/sprint-3/idea-1/components/ResultsTable"

/** Starting point: the unfiltered database, one button into the filter modal. */
export function Results() {
  return (
    <ProductChrome activeArea="Drugs" body="scroll">
      <div className="flex items-center justify-between px-6 py-5">
        <p className="text-muted-foreground text-sm tabular-nums">1–15 of 285,529 Drugs</p>
        <Button size="sm">Apply filter</Button>
      </div>
      <ResultsTable variant="unfiltered" />
    </ProductChrome>
  )
}
