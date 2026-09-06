import { Fragment } from "react"
import { PlusIcon } from "lucide-react"

import { FilterPill, OperatorWord } from "@/components/prototype/FilterPill"
import { appliedRuns } from "@/flows/sprint-3/idea-2/data"

/**
 * The query, above the results, as a sentence made of removable objects.
 *
 * Values from one attribute share a subject rather than repeating it, so the
 * bar reads `Therapy area is Dermatology or Cardiovascular and Drug geography
 * is Europe` — plain language, but every value still has its own cross.
 */
export function AppliedPills() {
  return (
    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1.5">
      {appliedRuns.map((run, i) => (
        <Fragment key={run.attribute}>
          {i > 0 ? <OperatorWord>and</OperatorWord> : null}
          <OperatorWord>{`${run.subject} is`}</OperatorWord>
          {run.values.map((value, j) => (
            <Fragment key={value}>
              {j > 0 ? <OperatorWord>{run.join}</OperatorWord> : null}
              <FilterPill removeLabel={`Remove ${value}`}>{value}</FilterPill>
            </Fragment>
          ))}
        </Fragment>
      ))}

      <button
        type="button"
        className="text-muted-foreground hover:text-foreground hover:border-foreground/30 ml-0.5 inline-flex h-6 items-center gap-1 rounded-full border border-dashed px-2 text-[12px]"
      >
        <PlusIcon className="size-3" />
        Add filter
      </button>
    </div>
  )
}
