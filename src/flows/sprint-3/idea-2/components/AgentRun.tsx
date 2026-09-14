"use client"

import { CheckIcon, PlayIcon, Undo2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { tintClass } from "@/components/prototype/motion"
import { cn } from "@/lib/utils"
import { agentReading } from "@/flows/sprint-3/idea-2/data"
import type { Screener, StepRecord } from "@/flows/sprint-3/idea-2/use-screener"

/**
 * The mark at the head of a step: where the agent is, in one glyph.
 *
 * Four states, read as one ladder, and none of them the accent. A step the
 * agent has already taken is a report on what happened, not something to press,
 * so the ladder is built from the neutral rungs — filled and inked for done,
 * an edged ring for the one in hand, a dashed edge for what has not happened
 * yet, and the lightest rule the ladder has for a step that was undone.
 */
function StepMark({ status }: { status: StepRecord["status"] }) {
  if (status === "done") {
    return (
      <span className="bg-muted border-border text-foreground mt-1 flex size-4 shrink-0 items-center justify-center rounded-full border">
        <CheckIcon className="size-2.5" strokeWidth={3} />
      </span>
    )
  }
  if (status === "running" || status === "stopped") {
    return (
      <span className="border-border mt-1 flex size-4 shrink-0 items-center justify-center rounded-full border">
        <span
          className={cn(
            "bg-muted-foreground size-1.5 rounded-full",
            status === "running" && "animate-pulse motion-reduce:animate-none",
          )}
        />
      </span>
    )
  }
  return (
    <span
      className={cn(
        "border-border mt-1 size-4 shrink-0 rounded-full border border-dashed",
        status === "undone" && "border-hairline",
      )}
    />
  )
}

/**
 * What the agent did, in the foot of the panel it did it to.
 *
 * There is no run until there is a request, so this is absent from the screen
 * until the composer below it sends one — the steps are the only trace the
 * agent leaves, and they sit directly above the line that asked for them.
 *
 * It is not a transcript. It shows the request, what the plan read it as, and
 * then the list of things it did to the columns above, each one a discrete
 * step that can be undone on its own without disturbing the others.
 */
export function AgentRun({ screener }: { screener: Screener }) {
  const { agent, rows } = screener

  // Absent, not empty: an idle agent has nothing honest to say here.
  if (agent.status === "idle") return null

  const total = agent.steps.length
  const done = agent.steps.filter((record) => record.status === "done").length

  return (
    <div className="border-hairline mb-2.5 border-b pb-2.5">
      <p className="text-[16px] leading-snug font-medium">
        &ldquo;{agent.request}&rdquo;
      </p>
      <p className="text-muted-foreground mt-1 text-[14px] leading-relaxed">
        Read as {agentReading.join(" · ")}
      </p>

      <ol className="mt-2 space-y-1">
        {agent.steps.map((record) => {
          const undone = record.status === "undone"
          return (
            <li
              key={record.step.id}
              className={cn(
                "flex items-start gap-2 rounded-md px-1.5 py-1",
                tintClass,
                // The step in hand is marked by position, not by colour: grey
                // says "here" without putting a second blue on a screen whose
                // one blue is the tick box the agent is about to move.
                record.status === "running" && "bg-accent",
              )}
            >
              <StepMark status={record.status} />
              <span
                className={cn(
                  "min-w-0 flex-1 text-[16px] leading-snug",
                  record.status === "pending" && "text-muted-foreground",
                  undone && "text-muted-foreground line-through",
                )}
              >
                {record.step.label}
                {record.status === "stopped" ? (
                  <span className="text-muted-foreground"> — stopped part-way</span>
                ) : null}
              </span>

              {record.status === "done" || record.status === "stopped" ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => screener.undoStep(record.step.id)}
                  className="text-muted-foreground -my-1 h-8 shrink-0 px-2 text-[14px]"
                >
                  <Undo2Icon className="size-4" />
                  Undo
                </Button>
              ) : null}
              {undone ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => screener.redoStep(record.step.id)}
                  className="text-muted-foreground -my-1 h-8 shrink-0 px-2 text-[14px]"
                >
                  Redo
                </Button>
              ) : null}
            </li>
          )
        })}
      </ol>

      <div className="mt-2 flex items-center gap-2">
        <p className="text-muted-foreground min-w-0 flex-1 text-[14px] leading-relaxed">
          {agent.status === "running"
            ? `Applying step ${Math.min(agent.stepIndex + 1, total)} of ${total}`
            : agent.status === "yielded"
              ? `Stopped — you took over. ${done} of ${total} steps applied.`
              : `${done} of ${total} steps applied · ${rows.length.toLocaleString("en-GB")} drugs`}
        </p>
        {agent.status === "yielded" && done < total ? (
          <Button
            variant="outline"
            size="sm"
            onClick={screener.resumeAgent}
            className="h-8 shrink-0 px-2.5 text-[14px]"
          >
            <PlayIcon className="size-4" />
            Let it finish
          </Button>
        ) : null}
      </div>
    </div>
  )
}
