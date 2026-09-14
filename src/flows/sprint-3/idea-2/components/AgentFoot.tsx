"use client"

import { AgentComposer } from "@/flows/sprint-3/idea-2/components/AgentComposer"
import { AgentRun } from "@/flows/sprint-3/idea-2/components/AgentRun"
import type { Screener } from "@/flows/sprint-3/idea-2/use-screener"

/**
 * The foot of the filter panel: the agent, and nothing else.
 *
 * The count and the applied-filter sentence sat here, under the columns that
 * produced them. They now head the results pane, which is what the client asked
 * for — the answer belongs at the top of the thing it is an answer about — so
 * the foot is left to the one surface the agent has.
 *
 * The order is the order it happens in: the run reports above the line that
 * asked for it, and both sit under the columns they drive.
 */
export function AgentFoot({ screener }: { screener: Screener }) {
  return (
    <div className="bg-surface-chrome border-edge shrink-0 border-t px-3 py-2.5">
      <AgentRun screener={screener} />
      <AgentComposer screener={screener} />
    </div>
  )
}
