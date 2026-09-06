"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowUpIcon, CheckIcon, Loader2Icon, SparklesIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { examplePrompts, previewCount, type AgentMessage } from "@/flows/sprint-3/idea-4/agent"
import type { GridState } from "@/flows/sprint-3/idea-4/grid-state"

/** Docked width. The grid's ten default lanes still fit beside it at 1190px. */
export const AGENT_PANEL_WIDTH = "w-[312px]"

function ProposalCard({
  message,
  state,
  matchCount,
  running,
  onAccept,
  onReject,
}: {
  message: AgentMessage
  state: GridState
  matchCount: number
  running: boolean
  onAccept: () => void
  onReject: () => void
}) {
  const proposal = message.proposal
  if (!proposal) return null
  const next = previewCount(state, proposal.actions)
  const resolved = message.outcome

  return (
    <div
      className={cn(
        "bg-background rounded-lg border p-2.5",
        resolved === "rejected" && "opacity-60",
      )}
    >
      <p className="text-[12.5px] leading-[1.35] font-medium">{proposal.headline}</p>

      <ul className="mt-1.5 flex flex-col gap-1">
        {proposal.changes.map((change) => (
          <li key={change} className="text-muted-foreground flex gap-1.5 text-[11.5px] leading-[1.4]">
            <span aria-hidden className="text-muted-foreground/60 pt-px">
              ·
            </span>
            <span className="min-w-0 flex-1">{change}</span>
          </li>
        ))}
      </ul>

      {next !== matchCount ? (
        <p className="text-muted-foreground mt-2 text-[11px] tabular-nums">
          <span className="text-foreground font-medium">{matchCount}</span> →{" "}
          <span className="text-foreground font-medium">{next}</span> drugs
        </p>
      ) : (
        <p className="text-muted-foreground mt-2 text-[11px] tabular-nums">
          Row count unchanged — {matchCount} drugs
        </p>
      )}

      {resolved ? (
        <p
          className={cn(
            "mt-2 flex items-center gap-1.5 text-[11px]",
            resolved === "accepted" ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {resolved === "accepted" ? (
            <CheckIcon className="size-3" />
          ) : (
            <XIcon className="size-3" />
          )}
          {resolved === "accepted" ? "Applied to the grid" : "Dismissed — nothing changed"}
        </p>
      ) : (
        <div className="mt-2.5 flex items-center gap-1.5">
          <Button size="xs" disabled={running} onClick={onAccept}>
            {running ? <Loader2Icon className="animate-spin" /> : null}
            Accept
          </Button>
          <Button size="xs" variant="ghost" disabled={running} onClick={onReject}>
            Dismiss
          </Button>
        </div>
      )}
    </div>
  )
}

/**
 * The docked agent, in the manner of the first Copilot panel: it sits beside
 * the work rather than over it, and it proposes rather than acts.
 *
 * The distinction this direction is arguing is what the agent operates on. It
 * does not build a query object and hand it over — it queues the same
 * `GridAction`s a person's clicks produce, on the columns, filters, sort and
 * aggregates of the grid already on screen. Accepting is one click; every
 * accepted change lands in the status bar with an undo.
 */
export function AgentPanel({
  state,
  matchCount,
  messages,
  running,
  onSubmit,
  onAccept,
  onReject,
  onClose,
}: {
  state: GridState
  matchCount: number
  messages: AgentMessage[]
  running: boolean
  onSubmit: (text: string) => void
  onAccept: (messageId: string) => void
  onReject: (messageId: string) => void
  onClose: () => void
}) {
  const [draft, setDraft] = useState("")
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" })
  }, [messages.length, running])

  const send = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return
    onSubmit(trimmed)
    setDraft("")
  }

  return (
    <aside
      className={cn(
        "bg-muted/20 flex min-h-0 shrink-0 flex-col border-l",
        AGENT_PANEL_WIDTH,
      )}
      aria-label="Grid assistant"
    >
      <div className="flex h-10 shrink-0 items-center gap-2 border-b px-3">
        <SparklesIcon className="text-muted-foreground size-3.5" />
        <span className="flex-1 text-[12.5px] font-medium">Assistant</span>
        <Button variant="ghost" size="xs" onClick={onClose} aria-label="Close assistant">
          <XIcon />
        </Button>
      </div>

      <p className="text-muted-foreground border-b px-3 py-2 text-[11px] leading-[1.45]">
        Ask in plain language. It proposes a change to this grid and nothing moves until you
        accept it.
      </p>

      <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto p-3">
        {messages.length === 0 ? (
          <div className="flex flex-col gap-1.5">
            <p className="text-muted-foreground text-[11px] tracking-[0.06em] uppercase">
              Try
            </p>
            {examplePrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => send(prompt)}
                className="bg-background hover:border-foreground/30 rounded-md border px-2.5 py-1.5 text-left text-[12px] transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        ) : null}

        {messages.map((message) =>
          message.role === "analyst" ? (
            <p
              key={message.id}
              className="bg-background self-end rounded-lg border px-2.5 py-1.5 text-[12.5px] leading-[1.4]"
            >
              {message.text}
            </p>
          ) : (
            <div key={message.id} className="flex flex-col gap-2">
              <p className="text-[12.5px] leading-[1.45]">{message.text}</p>
              {message.proposal ? (
                <ProposalCard
                  message={message}
                  state={state}
                  matchCount={matchCount}
                  running={running}
                  onAccept={() => onAccept(message.id)}
                  onReject={() => onReject(message.id)}
                />
              ) : null}
              {message.suggestions?.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {message.suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => send(suggestion)}
                      className="bg-background text-muted-foreground hover:text-foreground hover:border-foreground/30 rounded-full border px-2 py-0.5 text-[11px] transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ),
        )}
        <div ref={endRef} />
      </div>

      <Separator />

      <form
        className="flex shrink-0 items-end gap-1.5 p-2.5"
        onSubmit={(event) => {
          event.preventDefault()
          send(draft)
        }}
      >
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Ask for a change to the grid"
          className="border-input focus-within:border-ring bg-background placeholder:text-muted-foreground h-8 min-w-0 flex-1 rounded-md border px-2.5 text-[12.5px] outline-none"
        />
        <Button type="submit" size="icon-sm" disabled={!draft.trim()} aria-label="Send">
          <ArrowUpIcon />
        </Button>
      </form>
    </aside>
  )
}
