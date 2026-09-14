"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { SparklesIcon } from "lucide-react"

import { ProductChrome } from "@/components/prototype/ProductChrome"
import { motion, resolveMarks, usePrefersReducedMotion } from "@/components/prototype/motion"
import { Button } from "@/components/ui/button"
import { useDeepLink } from "@/hooks/use-deep-link"
import { cn } from "@/lib/utils"
import { AgentPanel } from "@/flows/sprint-3/idea-4/components/AgentPanel"
import { AppliedFilterBar, GridToolbar } from "@/flows/sprint-3/idea-4/components/GridToolbar"
import { ResultsGrid } from "@/flows/sprint-3/idea-4/components/ResultsGrid"
import {
  respond,
  type AgentMessage,
  type AgentReply,
  type ThreadMessage,
} from "@/flows/sprint-3/idea-4/agent"
import { filterRows, groupRows, rows, sortRows } from "@/flows/sprint-3/idea-4/data"
import {
  applyAction,
  applyActions,
  type GridAction,
  type GridState,
} from "@/flows/sprint-3/idea-4/grid-state"
import { initialState, slugFor } from "@/flows/sprint-3/idea-4/state"

function replyFields(reply: AgentReply): Partial<AgentMessage> {
  return reply.kind === "proposal"
    ? {
        phase: "proposed",
        message: reply.message,
        proposal: reply.proposal,
        suggestions: undefined,
        trace: reply.trace,
      }
    : {
        phase: "missed",
        message: reply.message,
        proposal: undefined,
        suggestions: reply.suggestions,
        trace: reply.trace,
      }
}

/**
 * The whole direction on one screen.
 *
 * Two things are being argued at once. The grid is the interface — you land in
 * data, filter from the column headers, and one drug stays one row however many
 * indications or geographies it carries. And the agent acts on that grid: the
 * panel on the right proposes `GridAction`s, the analyst accepts them, and the
 * thread shows each step land, with a receipt and an undo.
 *
 * Everything on screen is derived from the fixed records in `data.ts`. The
 * filters run in memory, and the counts, the column-menu tallies and the
 * summary row are all computed from the rows that survive them.
 */
export function Grid() {
  const reduced = usePrefersReducedMotion()

  // The slug the route was rendered with seeds the whole screen; from there the
  // state leads and `useDeepLink` walks the address bar along behind it.
  const pathname = usePathname()
  const seed = initialState(pathname.slice(pathname.lastIndexOf("/") + 1))

  const [state, setState] = useState<GridState>(seed.grid)
  // Bumped on every change to the grid, by hand or by the agent. A proposal
  // computed against an older version is stale and cannot be accepted.
  const [version, setVersion] = useState(seed.version)
  const [openColumn, setOpenColumn] = useState<string | null>(seed.openColumn)
  const [selectedRows, setSelectedRows] = useState<string[]>(seed.selectedRows)

  const [panelOpen, setPanelOpen] = useState(seed.panelOpen)
  const [messages, setMessages] = useState<ThreadMessage[]>(seed.messages)
  const [draft, setDraft] = useState(seed.draft)

  // Ids kept in a ref rather than a module counter so a hot reload cannot
  // restart the sequence underneath messages already on screen.
  const idCounter = useRef(0)
  const nextId = (prefix: string) => `${prefix}-${(idCounter.current += 1)}`

  // Staged steps read the grid a beat after the click, so they need the state
  // as it stands then rather than as it stood when the timer was set.
  const stateRef = useRef(state)
  useEffect(() => {
    stateRef.current = state
  }, [state])

  const timers = useRef<number[]>([])
  useEffect(() => {
    const pending = timers.current
    return () => pending.forEach(window.clearTimeout)
  }, [])
  const schedule = (run: () => void, ms: number) => {
    timers.current.push(window.setTimeout(run, ms))
  }

  const matching = useMemo(() => filterRows(rows, state.filters), [state.filters])
  const ordered = useMemo(() => sortRows(matching, state.sort), [matching, state.sort])
  const groups = useMemo(() => groupRows(ordered, state.group), [ordered, state.group])
  const visibleIds = useMemo(() => new Set(ordered.map((row) => row.id)), [ordered])
  const selectedVisible = useMemo(
    () => selectedRows.filter((id) => visibleIds.has(id)),
    [selectedRows, visibleIds],
  )

  const liveSlug = slugFor(
    { grid: state, version, openColumn, selectedRows, panelOpen, messages, draft },
    matching.length,
  )

  useDeepLink(liveSlug, (slug) => {
    const next = initialState(slug)
    setState(next.grid)
    setVersion(next.version)
    setOpenColumn(next.openColumn)
    setSelectedRows(next.selectedRows)
    setPanelOpen(next.panelOpen)
    setMessages(next.messages)
    setDraft(next.draft)
  })

  const commit = (next: GridState | ((current: GridState) => GridState)) => {
    setState(next)
    setVersion((current) => current + 1)
  }

  const runAction = (action: GridAction) => commit((current) => applyAction(current, action))

  const toggleSelect = (id: string) =>
    setSelectedRows((current) =>
      current.includes(id) ? current.filter((rowId) => rowId !== id) : [...current, id],
    )

  const toggleSelectAll = () =>
    setSelectedRows((current) =>
      current.length >= ordered.length ? [] : ordered.map((row) => row.id),
    )

  /* ---------------------------------------------------------------------- */
  /* The agent                                                               */
  /* ---------------------------------------------------------------------- */

  const patch = (id: string, changes: Partial<AgentMessage>) =>
    setMessages((current) =>
      current.map((message) =>
        message.id === id && message.role === "agent" ? { ...message, ...changes } : message,
      ),
    )

  const agentMessage = (id: string) =>
    messages.find((message): message is AgentMessage => message.id === id && message.role === "agent")

  const busy = messages.some(
    (message) =>
      message.role === "agent" && (message.phase === "thinking" || message.phase === "applying"),
  )

  /** Match now, show it after the think beat. Nothing is computed during the wait. */
  const think = (id: string, prompt: string) => {
    const started = Date.now()
    const reply = respond(prompt, stateRef.current)
    const resolve = () => patch(id, { ...replyFields(reply), thoughtMs: Date.now() - started })
    if (reduced) resolve()
    else schedule(resolve, resolveMarks.structure)
  }

  const submit = (text: string) => {
    if (busy) return
    const id = nextId("agent")
    setMessages((current) => [
      ...current,
      { id: nextId("analyst"), role: "analyst", text },
      {
        id,
        role: "agent",
        prompt: text,
        phase: "thinking",
        message: "",
        trace: [],
        thoughtMs: 0,
        appliedMs: 0,
        stepsDone: 0,
        countBefore: matching.length,
        countAfter: matching.length,
        before: null,
        stateVersion: version,
      },
    ])
    think(id, text)
  }

  const accept = (id: string) => {
    const message = agentMessage(id)
    const actions = message?.proposal?.actions
    if (!message || !actions || busy || message.stateVersion !== version) return

    const before = stateRef.current
    const started = Date.now()
    const final = applyActions(before, actions)
    patch(id, {
      phase: "applying",
      stepsDone: 0,
      before,
      countBefore: filterRows(rows, before.filters).length,
    })

    const finish = () =>
      patch(id, {
        phase: "applied",
        stepsDone: actions.length,
        appliedMs: Date.now() - started,
        countAfter: filterRows(rows, final.filters).length,
      })

    if (reduced) {
      commit(final)
      finish()
      return
    }

    // One action per reflow beat, each landing in the grid as its step ticks.
    actions.forEach((_, index) =>
      schedule(() => {
        commit(applyActions(before, actions.slice(0, index + 1)))
        patch(id, { stepsDone: index + 1 })
      }, motion.reflow * (index + 1)),
    )
    schedule(finish, motion.reflow * actions.length + motion.quick)
  }

  const dismiss = (id: string) => patch(id, { phase: "dismissed" })

  const undo = (id: string) => {
    const message = agentMessage(id)
    if (!message?.before || busy) return
    commit(message.before)
    patch(id, { phase: "undone" })
  }

  const rerun = (id: string) => {
    const message = agentMessage(id)
    if (!message || busy) return
    patch(id, { phase: "thinking", stateVersion: version, proposal: undefined, trace: [] })
    think(id, message.prompt)
  }

  return (
    <ProductChrome
      activeArea="Drugs"
      actions={
        <Button
          variant="ghost"
          size="sm"
          aria-pressed={panelOpen}
          onClick={() => setPanelOpen((open) => !open)}
          className={cn(
            "h-8 border text-sm",
            panelOpen
              ? "bg-brand-tint border-brand-border text-foreground hover:bg-brand-tint hover:text-foreground"
              : "border-transparent",
          )}
        >
          <SparklesIcon className={panelOpen ? "text-foreground" : "text-muted-foreground"} />
          Assistant
        </Button>
      }
    >
      <div className="flex min-h-0 flex-1">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <GridToolbar state={state} visibleRows={ordered} onAction={runAction} />
          <AppliedFilterBar state={state} onAction={runAction} />
          <ResultsGrid
            state={state}
            groups={groups}
            matchCount={matching.length}
            visibleRows={ordered}
            openColumn={openColumn}
            onOpenColumnChange={setOpenColumn}
            selectedRows={selectedVisible}
            onToggleSelect={toggleSelect}
            onToggleSelectAll={toggleSelectAll}
            onAction={runAction}
          />
        </div>

        {panelOpen ? (
          <AgentPanel
            state={state}
            matchCount={matching.length}
            messages={messages}
            version={version}
            draft={draft}
            onDraftChange={setDraft}
            onSubmit={submit}
            onAccept={accept}
            onDismiss={dismiss}
            onUndo={undo}
            onRerun={rerun}
            onClose={() => setPanelOpen(false)}
          />
        ) : null}
      </div>
    </ProductChrome>
  )
}
