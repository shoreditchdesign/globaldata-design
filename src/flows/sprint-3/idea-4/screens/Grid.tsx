"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { SparklesIcon } from "lucide-react"

import { ProductChrome } from "@/components/prototype/ProductChrome"
import { Button } from "@/components/ui/button"
import { AgentPanel } from "@/flows/sprint-3/idea-4/components/AgentPanel"
import { AppliedFilterBar, GridToolbar } from "@/flows/sprint-3/idea-4/components/GridToolbar"
import { ResultsGrid } from "@/flows/sprint-3/idea-4/components/ResultsGrid"
import { StatusBar } from "@/flows/sprint-3/idea-4/components/StatusBar"
import { respond, type AgentLogEntry, type AgentMessage } from "@/flows/sprint-3/idea-4/agent"
import { filterRows, groupRows, rows, sortRows } from "@/flows/sprint-3/idea-4/data"
import {
  applyAction,
  applyActions,
  initialGridState,
  type GridAction,
  type GridState,
} from "@/flows/sprint-3/idea-4/grid-state"

/** Simulated round trip for an accepted proposal. Long enough to read. */
const APPLY_DELAY_MS = 620

/**
 * The whole direction on one screen.
 *
 * Two things are being argued at once. The grid is the interface — you land in
 * data, filter from the column headers, and one drug stays one row however many
 * indications or geographies it carries. And the agent acts on that grid: the
 * panel on the right proposes `GridAction`s, the analyst accepts them, and the
 * strip along the bottom is the receipt for every one.
 *
 * Everything on screen is derived from the 46 fixed records in `data.ts`. The
 * filters run in memory, the counts, the column-menu tallies and the footer
 * aggregates are all computed from the rows that survive them, so the number
 * above the grid and the rows in it cannot drift apart.
 */
export function Grid() {
  const [state, setState] = useState<GridState>(initialGridState)
  const [openColumn, setOpenColumn] = useState<string | null>(null)
  const [expandedRows, setExpandedRows] = useState<string[]>(["rocatinlimab"])
  const [selectedRows, setSelectedRows] = useState<string[]>([])

  const [panelOpen, setPanelOpen] = useState(true)
  const [messages, setMessages] = useState<AgentMessage[]>([])
  const [entries, setEntries] = useState<AgentLogEntry[]>([])
  const [running, setRunning] = useState<string | null>(null)

  // Ids for messages and log rows. Kept in a ref rather than a module counter
  // so a hot reload cannot restart the sequence underneath messages already on
  // screen and hand two of them the same React key.
  const idCounter = useRef(0)
  const nextId = (prefix: string) => `${prefix}-${(idCounter.current += 1)}`

  // The staged apply reads the grid a beat after the click, so it needs the
  // state as it stands then rather than as it stood when the timer was set.
  const stateRef = useRef(state)
  useEffect(() => {
    stateRef.current = state
  }, [state])

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
  }, [])

  const matching = useMemo(() => filterRows(rows, state.filters), [state.filters])
  const ordered = useMemo(() => sortRows(matching, state.sort), [matching, state.sort])
  const groups = useMemo(() => groupRows(ordered, state.group), [ordered, state.group])
  const visibleIds = useMemo(() => new Set(ordered.map((row) => row.id)), [ordered])
  const selectedVisible = useMemo(
    () => selectedRows.filter((id) => visibleIds.has(id)),
    [selectedRows, visibleIds],
  )

  const runAction = (action: GridAction) => setState((current) => applyAction(current, action))

  const toggleRow = (id: string) =>
    setExpandedRows((current) =>
      current.includes(id) ? current.filter((rowId) => rowId !== id) : [...current, id],
    )

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

  const submit = (text: string) => {
    const reply = respond(text, stateRef.current)
    setMessages((current) => [
      ...current,
      { id: nextId("analyst"), role: "analyst", text },
      reply.kind === "proposal"
        ? {
            id: nextId("agent"),
            role: "agent",
            text: reply.message,
            proposal: reply.proposal,
          }
        : {
            id: nextId("agent"),
            role: "agent",
            text: reply.message,
            suggestions: reply.suggestions,
          },
    ])
  }

  const accept = (messageId: string) => {
    const message = messages.find((entry) => entry.id === messageId)
    const proposal = message?.proposal
    if (!proposal || running) return

    const started = Date.now()
    setRunning(proposal.headline)

    timer.current = setTimeout(() => {
      const before = stateRef.current
      const next = applyActions(before, proposal.actions)
      setState(next)
      setMessages((current) =>
        current.map((entry) =>
          entry.id === messageId ? { ...entry, outcome: "accepted" } : entry,
        ),
      )
      setEntries((current) => [
        {
          id: nextId("log"),
          status: "applied",
          headline: proposal.headline,
          changes: proposal.changes,
          resultCount: filterRows(rows, next.filters).length,
          durationMs: Date.now() - started,
          at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          before,
        },
        ...current,
      ])
      setRunning(null)
    }, APPLY_DELAY_MS)
  }

  const reject = (messageId: string) => {
    const message = messages.find((entry) => entry.id === messageId)
    const proposal = message?.proposal
    if (!proposal) return
    setMessages((current) =>
      current.map((entry) => (entry.id === messageId ? { ...entry, outcome: "rejected" } : entry)),
    )
    setEntries((current) => [
      {
        id: nextId("log"),
        status: "rejected",
        headline: proposal.headline,
        changes: proposal.changes,
        resultCount: matching.length,
        durationMs: 0,
        at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        before: null,
      },
      ...current,
    ])
  }

  const undo = (entryId: string) => {
    const entry = entries.find((item) => item.id === entryId)
    if (!entry?.before) return
    const restored = entry.before
    setState(restored)
    // The undo is itself the newest thing that happened, so the entry moves to
    // the front of the log rather than being quietly restyled halfway down it.
    setEntries((current) => [
      {
        ...entry,
        status: "undone",
        resultCount: filterRows(rows, restored.filters).length,
        at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
      ...current.filter((item) => item.id !== entryId),
    ])
  }

  return (
    <ProductChrome
      activeArea="Drugs"
      actions={
        <Button
          variant={panelOpen ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setPanelOpen((open) => !open)}
        >
          <SparklesIcon className="text-muted-foreground" />
          Assistant
        </Button>
      }
    >
      <div className="flex min-h-0 flex-1">
        <div className="flex min-w-0 min-h-0 flex-1 flex-col">
          <GridToolbar state={state} visibleRows={ordered} onAction={runAction} />
          <AppliedFilterBar state={state} matchCount={matching.length} onAction={runAction} />
          <ResultsGrid
            state={state}
            groups={groups}
            matchCount={matching.length}
            visibleRows={ordered}
            openColumn={openColumn}
            onOpenColumnChange={setOpenColumn}
            expandedRows={expandedRows}
            onToggleRow={toggleRow}
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
            running={Boolean(running)}
            onSubmit={submit}
            onAccept={accept}
            onReject={reject}
            onClose={() => setPanelOpen(false)}
          />
        ) : null}
      </div>

      <StatusBar
        running={running}
        entries={entries}
        onUndo={undo}
        panelOpen={panelOpen}
        onOpenPanel={() => setPanelOpen(true)}
      />
    </ProductChrome>
  )
}
