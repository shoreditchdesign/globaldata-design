"use client"

import { Button } from "@/components/ui/button"
import { AgentComposer } from "@/flows/sprint-3/idea-2/components/AgentComposer"
import { AgentRun } from "@/flows/sprint-3/idea-2/components/AgentRun"
import { AppliedPills } from "@/flows/sprint-3/idea-2/components/AppliedPills"
import { platformTotal, sample } from "@/flows/sprint-3/idea-2/data"
import type { Screener } from "@/flows/sprint-3/idea-2/use-screener"

/**
 * The foot of the filter panel: what the query is, and what it leaves.
 *
 * The count and the sentence belong to the thing that produced them, so they
 * sit under the columns rather than over the table. Ticking a value moves the
 * number a few pixels from the box you ticked, and the sentence directly
 * underneath says the whole query in one line — the panel answers its own
 * question without you looking away from it.
 *
 * `AppliedPills` is the same component the results header used to hold; it
 * already shares a subject across the values of one attribute, which is why
 * the query reads as a sentence rather than a heap of chips.
 *
 * The agent lands here too, and only here: the composer is its one resident
 * surface, and `AgentRun` appears above it once there is a run to report — the
 * steps sit between the request that produced them and the count they moved.
 */
export function FilterFoot({ screener }: { screener: Screener }) {
  const { filters, rows } = screener

  return (
    <div className="bg-surface-chrome border-edge shrink-0 border-t px-3 py-2.5">
      <AgentRun screener={screener} />
      <AgentComposer screener={screener} />

      <div className="mt-2.5 flex items-baseline gap-1.5">
        {/* The count is the answer, not a control: it earns its prominence
            from thirty pixels and a weight, and leaves the accent to the
            things on this row that are actually a press. */}
        <span className="text-[30px] leading-none font-semibold tracking-tight tabular-nums">
          {rows.length.toLocaleString("en-GB")}
        </span>
        <span className="text-[17px] font-medium">drugs</span>
        <span
          className="text-muted-foreground text-[16px] tabular-nums"
          title={`This prototype filters a fixed sample of ${sample.length.toLocaleString("en-GB")} rows in memory. The live platform holds ${platformTotal.toLocaleString("en-GB")}.`}
        >
          of {sample.length.toLocaleString("en-GB")} in the sample
        </span>
      </div>

      <div className="mt-2 flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <AppliedPills screener={screener} />
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={screener.clearAll}
          disabled={filters.length === 0}
          className="text-muted-foreground h-8 shrink-0 px-2.5 text-[14px]"
        >
          Clear all
        </Button>
      </div>
    </div>
  )
}
