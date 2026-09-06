import { Fragment } from "react"
import { PlusIcon, XIcon } from "lucide-react"

import { appliedRuns } from "@/flows/sprint-3/idea-2/data"

/** One applied value. Individually removable, whatever it is grouped with. */
function Pill({ label }: { label: string }) {
  return (
    <span className="bg-background inline-flex h-6 items-center gap-1 rounded-full border pr-1 pl-2.5 text-[12px]">
      {label}
      <span className="text-muted-foreground hover:bg-accent hover:text-foreground flex size-4 items-center justify-center rounded-full">
        <XIcon className="size-3" />
      </span>
    </span>
  )
}

/** The connecting words between and inside runs — `is`, `or`, `and`. */
function Word({ children }: { children: string }) {
  return <span className="text-muted-foreground text-[12px]">{children}</span>
}

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
          {i > 0 ? <Word>and</Word> : null}
          <Word>{`${run.subject} is`}</Word>
          {run.values.map((value, j) => (
            <Fragment key={value}>
              {j > 0 ? <Word>{run.join}</Word> : null}
              <Pill label={value} />
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
