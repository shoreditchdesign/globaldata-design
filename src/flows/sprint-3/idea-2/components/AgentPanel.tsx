"use client"

import { useState } from "react"
import {
  ArrowUpIcon,
  CheckIcon,
  PlayIcon,
  RotateCcwIcon,
  SparklesIcon,
  Undo2Icon,
  XIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { agentReading, agentRequest } from "@/flows/sprint-3/idea-2/data"
import type { Screener, StepRecord } from "@/flows/sprint-3/idea-2/use-screener"

/** The mark at the head of a step: where the agent is, in one glyph. */
function StepMark({ status }: { status: StepRecord["status"] }) {
  if (status === "done") {
    return (
      <span className="bg-foreground text-background mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full">
        <CheckIcon className="size-2.5" strokeWidth={3} />
      </span>
    )
  }
  if (status === "running" || status === "stopped") {
    return (
      <span className="border-foreground mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border">
        <span
          className={cn("bg-foreground size-1.5 rounded-full", status === "running" && "animate-pulse")}
        />
      </span>
    )
  }
  return (
    <span
      className={cn(
        "border-muted-foreground/40 mt-0.5 size-4 shrink-0 rounded-full border border-dashed",
        status === "undone" && "border-muted-foreground/25",
      )}
    />
  )
}

/**
 * The agent, docked inside the filter region.
 *
 * It is a third region of this screen's layout, not an overlay: it sits under
 * the columns, at the same width, and nothing it does covers anything. That is
 * the whole argument of this direction — the agent works the controls a person
 * works, in full view, and the person can put a hand on the wheel at any point.
 *
 * So the panel is not a transcript. It shows one request, what the agent read
 * it as, and then the list of things it did to the filter panel above — each
 * one a discrete step that can be undone on its own without disturbing the
 * others.
 */
export function AgentPanel({ screener }: { screener: Screener }) {
  const { agent, rows } = screener
  const [draft, setDraft] = useState("")

  const total = agent.steps.length
  const done = agent.steps.filter((record) => record.status === "done").length
  const started = agent.status !== "idle"

  function run(request: string) {
    setDraft(request)
    screener.submitRequest(request)
  }

  return (
    <section className="bg-background flex max-h-[38%] shrink-0 flex-col border-t">
      <div className="flex shrink-0 items-center gap-2 px-3 pt-2">
        <SparklesIcon className="size-3.5" />
        <h2 className="text-[13px] font-semibold tracking-tight">Agent</h2>
        <span className="text-muted-foreground text-[11px]">
          {agent.status === "running" ? "Driving your filters…" : "Works the filters above"}
        </span>

        {started ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={screener.resetAgent}
            className="text-muted-foreground ml-auto h-6 px-2 text-[11px]"
          >
            <RotateCcwIcon className="size-3" />
            New request
          </Button>
        ) : null}

        <button
          type="button"
          onClick={screener.dismissAgent}
          aria-label="Dismiss the agent panel"
          className={cn(
            "text-muted-foreground hover:text-foreground hover:bg-accent flex size-6 shrink-0 items-center justify-center rounded",
            started ? "" : "ml-auto",
          )}
        >
          <XIcon className="size-3.5" />
        </button>
      </div>

      <form
        className="flex shrink-0 items-center gap-1.5 px-3 pt-2"
        onSubmit={(event) => {
          event.preventDefault()
          run(draft.trim() || agentRequest)
        }}
      >
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Describe the set you want"
          aria-label="Ask the agent for a set of drugs"
          className="h-8 text-[12px]"
        />
        <Button type="submit" size="sm" className="h-8 w-8 shrink-0 p-0" aria-label="Send">
          <ArrowUpIcon className="size-3.5" />
        </Button>
      </form>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 pt-2 pb-2.5">
        {!started ? (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-muted-foreground text-[11px]">Try</span>
            <button
              type="button"
              onClick={() => run(agentRequest)}
              className="hover:bg-accent rounded-full border border-dashed px-2 py-0.5 text-left text-[11.5px]"
            >
              {agentRequest}
            </button>
          </div>
        ) : (
          <>
            <p className="text-[12px] leading-snug font-medium">
              &ldquo;{agent.request}&rdquo;
            </p>
            <p className="text-muted-foreground mt-1 text-[11px] leading-relaxed">
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
                      record.status === "running" && "bg-accent",
                    )}
                  >
                    <StepMark status={record.status} />
                    <span
                      className={cn(
                        "min-w-0 flex-1 text-[11.5px] leading-snug",
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
                        className="text-muted-foreground -my-0.5 h-6 shrink-0 px-1.5 text-[11px]"
                      >
                        <Undo2Icon className="size-3" />
                        Undo
                      </Button>
                    ) : null}
                    {undone ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => screener.redoStep(record.step.id)}
                        className="text-muted-foreground -my-0.5 h-6 shrink-0 px-1.5 text-[11px]"
                      >
                        Redo
                      </Button>
                    ) : null}
                  </li>
                )
              })}
            </ol>

            <div className="mt-2 flex items-center gap-2">
              <p className="text-muted-foreground min-w-0 flex-1 text-[11px] leading-relaxed">
                {agent.status === "running"
                  ? `Applying step ${Math.min(agent.stepIndex + 1, total)} of ${total} — take a column and it stops.`
                  : agent.status === "yielded"
                    ? `Stopped — you took over. ${done} of ${total} steps applied.`
                    : `${done} of ${total} steps applied · ${rows.length.toLocaleString("en-GB")} drugs. Undo any of them.`}
              </p>
              {agent.status === "yielded" && done < total ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={screener.resumeAgent}
                  className="h-6 shrink-0 px-2 text-[11px]"
                >
                  <PlayIcon className="size-3" />
                  Let it finish
                </Button>
              ) : null}
            </div>
          </>
        )}

        <p className="text-muted-foreground/70 mt-2 text-[10px] leading-relaxed">
          Prototype: one request is wired, and its plan is authored rather than parsed. What the
          steps do to the filters, the counts and the table is real.
        </p>
      </div>
    </section>
  )
}
