"use client"

import { createElement, useEffect, useMemo, useRef, useState } from "react"
import {
  ArrowUpIcon,
  BrainIcon,
  CheckIcon,
  ChevronRightIcon,
  CircleDashedIcon,
  CornerDownRightIcon,
  Loader2Icon,
  RotateCcwIcon,
  SparklesIcon,
  XIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import {
  motion,
  resolveMarks,
  settleClass,
  staggerDelay,
  tintClass,
  useSettle,
  useStagedSequence,
} from "@/components/prototype/motion"
import {
  describeStep,
  examplePrompts,
  missSuggestions,
  previewCount,
  respond,
  stepIcon,
  type AgentMessage,
  type StepTense,
  type ThreadMessage,
} from "@/flows/sprint-3/idea-4/agent"
import { rows } from "@/flows/sprint-3/idea-4/data"
import type { GridAction, GridState } from "@/flows/sprint-3/idea-4/grid-state"

/** Docked width. */
export const AGENT_PANEL_WIDTH = "w-[380px]"

function seconds(ms: number) {
  return `${Math.max(0.1, ms / 1000).toFixed(1)}s`
}

function counts(before: number, after: number) {
  return before === after ? `${after} drugs` : `${before} → ${after} drugs`
}

function RoleLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-muted-foreground text-sm font-medium">{children}</p>
}

/* -------------------------------------------------------------------------- */
/* Progress                                                                    */
/* -------------------------------------------------------------------------- */

const thinkMarks = [resolveMarks.highlight, resolveMarks.structure - motion.quick] as const
const thinkValues = [12, 35, 85]

const barClass =
  "h-0.5 rounded-none bg-transparent *:data-[slot=progress-indicator]:duration-300 *:data-[slot=progress-indicator]:ease-settle motion-reduce:*:data-[slot=progress-indicator]:transition-none"

/** Mounted once per thinking turn, so the staged sequence starts from zero. */
function ThinkingProgress() {
  const stage = useStagedSequence({ marks: thinkMarks })
  return <Progress value={thinkValues[stage]} aria-label="Thinking" className={barClass} />
}

/* -------------------------------------------------------------------------- */
/* Turn parts                                                                  */
/* -------------------------------------------------------------------------- */

function ThinkingRow({ message }: { message: AgentMessage }) {
  if (message.phase === "thinking") {
    return (
      <div className="text-muted-foreground flex h-7 items-center gap-2 text-sm" role="status">
        <Loader2Icon className="size-4 animate-spin motion-reduce:animate-none" />
        Thinking
      </div>
    )
  }

  const matched = message.phase !== "missed"

  return (
    <Collapsible>
      <CollapsibleTrigger className="group/think text-muted-foreground hover:text-foreground flex h-7 items-center gap-2 rounded-md text-sm transition-colors">
        <BrainIcon className="size-4" />
        Thought for {seconds(message.thoughtMs)}
        <ChevronRightIcon className="size-3.5 transition-transform group-data-[state=open]/think:rotate-90 motion-reduce:transition-none" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ul className="border-border text-muted-foreground mt-1 ml-2 flex flex-col gap-1 border-l pl-4 text-sm">
          {matched ? null : <li>No rule matched “{message.prompt}”</li>}
          {message.trace.map((line) => (
            <li key={line} className="break-words">
              {line}
            </li>
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  )
}

type StepStatus = "pending" | "running" | "done" | "undone" | "skipped"

function stepStatus(message: AgentMessage, index: number): StepStatus {
  switch (message.phase) {
    case "applying":
      return index < message.stepsDone ? "done" : index === message.stepsDone ? "running" : "pending"
    case "applied":
      return "done"
    case "undone":
      return "undone"
    case "dismissed":
      return "skipped"
    default:
      return "pending"
  }
}

const tenseFor: Record<StepStatus, StepTense> = {
  pending: "todo",
  running: "doing",
  done: "done",
  undone: "done",
  skipped: "todo",
}

function StepRow({ action, status, index }: { action: GridAction; status: StepStatus; index: number }) {
  const quiet = status === "undone" || status === "skipped"
  return (
    <li
      style={staggerDelay(index)}
      className={cn("flex min-h-8 items-start gap-2 py-1.5 text-sm leading-5", settleClass)}
    >
      {/* The icon is a static lucide component picked by action kind. */}
      {createElement(stepIcon(action), {
        className: "text-muted-foreground mt-0.5 size-4 shrink-0",
        "aria-hidden": true,
      })}
      <span
        className={cn(
          "min-w-0 flex-1",
          quiet && "text-muted-foreground",
          status === "undone" && "line-through",
          status === "pending" && "text-foreground/80",
        )}
      >
        {describeStep(action, tenseFor[status])}
      </span>
      <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center">
        {status === "pending" ? <CircleDashedIcon className="text-muted-foreground size-4" /> : null}
        {status === "running" ? (
          <Loader2Icon className="size-4 animate-spin motion-reduce:animate-none" />
        ) : null}
        {status === "done" ? <CheckIcon className="size-4" /> : null}
        {status === "undone" ? <RotateCcwIcon className="text-muted-foreground size-4" /> : null}
      </span>
    </li>
  )
}

function PlanCard({
  message,
  state,
  matchCount,
  stale,
  busy,
  undoable,
  onAccept,
  onDismiss,
  onUndo,
  onRerun,
}: {
  message: AgentMessage
  state: GridState
  matchCount: number
  stale: boolean
  busy: boolean
  undoable: boolean
  onAccept: () => void
  onDismiss: () => void
  onUndo: () => void
  onRerun: () => void
}) {
  // Hooked before the early return, or the hook order changes with the message.
  const lit = useSettle(message.phase, motion.hold) && message.phase === "applied"
  const proposal = message.proposal
  if (!proposal) return null

  const { phase } = message
  const next = phase === "proposed" && !stale ? previewCount(state, proposal.actions) : 0
  const restored = message.before ? previewCount(message.before, []) : message.countBefore

  return (
    <div
      className={cn(
        "border-border overflow-hidden rounded-lg border",
        tintClass,
        lit ? "bg-accent" : "bg-surface-panel",
      )}
    >
      <p className="border-hairline border-b px-3 py-2 text-sm font-medium">{proposal.headline}</p>

      <ul className="px-3 py-1">
        {proposal.actions.map((action, index) => (
          <StepRow
            key={`${action.kind}-${index}`}
            action={action}
            index={index}
            status={stepStatus(message, index)}
          />
        ))}
      </ul>

      <div className="border-hairline flex min-h-11 items-center gap-2 border-t px-3 py-1.5 text-sm">
        {phase === "proposed" && stale ? (
          <>
            <span className="text-muted-foreground min-w-0 flex-1">
              The grid changed since this was proposed
            </span>
            <Button variant="ghost" size="sm" className="text-sm" disabled={busy} onClick={onRerun}>
              Run again
            </Button>
          </>
        ) : null}

        {phase === "proposed" && !stale ? (
          <>
            <span className="text-muted-foreground min-w-0 flex-1 tabular-nums">
              {next === matchCount ? (
                <>
                  <span className="text-foreground font-medium">{matchCount}</span> drugs, unchanged
                </>
              ) : (
                <>
                  <span className="text-foreground font-medium">{matchCount}</span> →{" "}
                  <span className="text-foreground font-medium">{next}</span> drugs
                </>
              )}
            </span>
            <Button variant="ghost" size="sm" className="text-sm" disabled={busy} onClick={onDismiss}>
              Dismiss
            </Button>
            <Button size="sm" className="text-sm" disabled={busy} onClick={onAccept}>
              Accept
            </Button>
          </>
        ) : null}

        {phase === "applying" ? (
          <span className="text-muted-foreground tabular-nums">
            Applying {Math.min(message.stepsDone + 1, proposal.actions.length)} of{" "}
            {proposal.actions.length}
          </span>
        ) : null}

        {phase === "applied" ? (
          <>
            <CheckIcon className="size-4 shrink-0" />
            <span className="min-w-0 flex-1 tabular-nums">
              Applied · {counts(message.countBefore, message.countAfter)} ·{" "}
              {seconds(message.appliedMs)}
            </span>
            {undoable ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-sm" disabled={busy} onClick={onUndo}>
                    <RotateCcwIcon />
                    Undo
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-sm">
                  Also reverts hand edits made since.
                </TooltipContent>
              </Tooltip>
            ) : null}
          </>
        ) : null}

        {phase === "dismissed" ? (
          <>
            <XIcon className="text-muted-foreground size-4 shrink-0" />
            <span className="text-muted-foreground">Dismissed · nothing changed</span>
          </>
        ) : null}

        {phase === "undone" ? (
          <>
            <RotateCcwIcon className="text-muted-foreground size-4 shrink-0" />
            <span className="text-muted-foreground tabular-nums">Undone · back to {restored} drugs</span>
          </>
        ) : null}
      </div>
    </div>
  )
}

function SuggestionRow({ text, onPick }: { text: string; onPick: () => void }) {
  return (
    <button
      type="button"
      onClick={onPick}
      className="hover:bg-accent flex min-h-9 w-full items-center gap-2 rounded-md px-2 text-left text-sm transition-colors"
    >
      <CornerDownRightIcon className="text-muted-foreground size-4 shrink-0" />
      <span className="min-w-0 flex-1">{text}</span>
    </button>
  )
}

function AgentTurn({
  message,
  state,
  matchCount,
  version,
  busy,
  undoable,
  onSend,
  onAccept,
  onDismiss,
  onUndo,
  onRerun,
}: {
  message: AgentMessage
  state: GridState
  matchCount: number
  version: number
  busy: boolean
  undoable: boolean
  onSend: (text: string) => void
  onAccept: () => void
  onDismiss: () => void
  onUndo: () => void
  onRerun: () => void
}) {
  const stale = message.phase === "proposed" && message.stateVersion !== version

  return (
    <section className="flex flex-col gap-2" aria-label="Assistant response">
      <ThinkingRow message={message} />

      {message.phase === "thinking" ? null : (
        <div className={cn("flex flex-col gap-2", settleClass)}>
          <RoleLabel>Response</RoleLabel>
          {message.message ? <p className="text-sm leading-5">{message.message}</p> : null}
          {message.proposal ? (
            <PlanCard
              message={message}
              state={state}
              matchCount={matchCount}
              stale={stale}
              busy={busy}
              undoable={undoable}
              onAccept={onAccept}
              onDismiss={onDismiss}
              onUndo={onUndo}
              onRerun={onRerun}
            />
          ) : null}
          {message.suggestions?.length ? (
            <div className="-mx-2 flex flex-col">
              {message.suggestions.map((suggestion) => (
                <SuggestionRow
                  key={suggestion}
                  text={suggestion}
                  onPick={() => !busy && onSend(suggestion)}
                />
              ))}
            </div>
          ) : null}
        </div>
      )}
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/* Panel                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * The docked agent, in the manner of the first Copilot panel: it sits beside
 * the work rather than over it, and it proposes rather than acts.
 *
 * The thread is the only place that says what the assistant did. Each turn
 * reads top to bottom as the work happened: the request, what it matched
 * ("Thought for 0.8s", open to see the rules), the plan as steps, and — once
 * accepted — the steps ticking as each `GridAction` lands in the grid, closed
 * by a receipt with the row count, the time taken and an undo.
 */
export function AgentPanel({
  state,
  matchCount,
  messages,
  version,
  onSubmit,
  onAccept,
  onDismiss,
  onUndo,
  onRerun,
  onClose,
}: {
  state: GridState
  matchCount: number
  messages: ThreadMessage[]
  /** Grid version, bumped on every change — a proposal behind it is stale. */
  version: number
  onSubmit: (text: string) => void
  onAccept: (messageId: string) => void
  onDismiss: (messageId: string) => void
  onUndo: (messageId: string) => void
  onRerun: (messageId: string) => void
  onClose: () => void
}) {
  const [draft, setDraft] = useState("")
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" })
  }, [messages])

  const agentTurns = messages.filter((message): message is AgentMessage => message.role === "agent")
  const active = agentTurns.find(
    (message) => message.phase === "thinking" || message.phase === "applying",
  )
  const busy = Boolean(active)
  const undoableId = [...agentTurns].reverse().find((message) => message.phase === "applied")?.id

  // Offered only when they would change something on the grid as it stands.
  const suggestions = useMemo(
    () =>
      [...new Set([...examplePrompts, ...missSuggestions])]
        .filter((prompt) => respond(prompt, state).kind === "proposal")
        .slice(0, 3),
    [state],
  )

  const send = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || busy) return
    onSubmit(trimmed)
    setDraft("")
  }

  return (
    <aside
      className={cn(
        "bg-surface-chrome border-edge flex min-h-0 shrink-0 flex-col border-l",
        AGENT_PANEL_WIDTH,
      )}
      aria-label="Grid assistant"
    >
      <div className="border-edge flex h-11 shrink-0 items-center gap-2 border-b px-3">
        <SparklesIcon className="size-4" />
        <span className="flex-1 text-sm font-medium">Assistant</span>
        <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close assistant">
          <XIcon />
        </Button>
      </div>

      <div className="h-0.5 shrink-0">
        {active?.phase === "thinking" ? <ThinkingProgress key={active.id} /> : null}
        {active?.phase === "applying" && active.proposal ? (
          <Progress
            aria-label="Applying"
            value={Math.max(8, (active.stepsDone / active.proposal.actions.length) * 100)}
            className={barClass}
          />
        ) : null}
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <div className="mt-auto flex flex-col gap-5 p-4">
          {messages.map((message) =>
            message.role === "analyst" ? (
              <section key={message.id} className="flex flex-col gap-1.5" aria-label="Your request">
                <RoleLabel>You</RoleLabel>
                <p className="bg-surface-panel border-border rounded-lg border px-3 py-2 text-sm leading-5">
                  {message.text}
                </p>
              </section>
            ) : (
              <AgentTurn
                key={message.id}
                message={message}
                state={state}
                matchCount={matchCount}
                version={version}
                busy={busy}
                undoable={message.id === undoableId}
                onSend={send}
                onAccept={() => onAccept(message.id)}
                onDismiss={() => onDismiss(message.id)}
                onUndo={() => onUndo(message.id)}
                onRerun={() => onRerun(message.id)}
              />
            ),
          )}
          <div ref={endRef} />
        </div>
      </div>

      {!draft.trim() && !busy && suggestions.length ? (
        <div className="shrink-0 px-2 pt-1 pb-1.5">
          <p className="text-muted-foreground px-2 pb-1 text-sm font-medium">Suggestions</p>
          {suggestions.map((prompt) => (
            <SuggestionRow key={prompt} text={prompt} onPick={() => send(prompt)} />
          ))}
        </div>
      ) : null}

      <div className="shrink-0 px-3 pb-3">
        <form
          className="border-border bg-surface-panel focus-within:border-ring focus-within:ring-ring/40 rounded-xl border transition-shadow focus-within:ring-3"
          onSubmit={(event) => {
            event.preventDefault()
            send(draft)
          }}
        >
          <Textarea
            value={draft}
            rows={1}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault()
                send(draft)
              }
            }}
            aria-label="Ask the assistant to change the grid"
            className="max-h-28 min-h-0 resize-none rounded-none border-0 bg-transparent px-3 pt-2.5 pb-1 text-base shadow-none focus-visible:ring-0 md:text-base"
          />
          <div className="flex items-center gap-2 px-2 pb-2">
            <Badge
              variant="outline"
              className="text-muted-foreground h-6 rounded-md px-2 text-sm font-normal tabular-nums"
            >
              Drugs grid · {matchCount} rows
            </Badge>
            <Button
              type="submit"
              size="icon-sm"
              className="ml-auto"
              disabled={!draft.trim() || busy}
              aria-label="Send"
            >
              <ArrowUpIcon />
            </Button>
          </div>
        </form>
        <p className="text-muted-foreground mt-2 px-1 text-sm">
          Keyword rules over the {rows.length}-drug sample — no model.
        </p>
      </div>
    </aside>
  )
}
