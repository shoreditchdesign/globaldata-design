"use client"

/**
 * The one state the Idea 4 frames turned out to be.
 *
 * Every slug is an entry point into the same screen: it seeds a starting state,
 * and from there every click moves that live state. The URL follows the other
 * way, `slugFor` naming the frame the live state is nearest to.
 *
 * Nothing here is hand-authored. A seeded thread turn is built by calling the
 * same `respond` the panel calls and the same `applyActions` the accept calls,
 * so a receipt in a deep link carries the counts the run would really have
 * produced. Everything runs at module scope, which is build time — so no clock
 * and no randomness, and the counts are whatever `filterRows` says they are.
 */

import { motion, resolveMarks } from "@/components/prototype/motion"
import {
  examplePrompts,
  respond,
  seedPrompt,
  type AgentMessage,
  type ThreadMessage,
} from "@/flows/sprint-3/idea-4/agent"
import { defaultColumnOrder, filterRows, rows } from "@/flows/sprint-3/idea-4/data"
import {
  applyAction,
  applyActions,
  hiddenColumnKeys,
  initialGridState,
  type GridAction,
  type GridState,
} from "@/flows/sprint-3/idea-4/grid-state"

export interface Idea4State {
  grid: GridState
  /** Bumped on every grid change. A proposal behind it is stale. */
  version: number
  /** Column header whose menu is open. */
  openColumn: string | null
  selectedRows: string[]
  panelOpen: boolean
  messages: ThreadMessage[]
  /** What is sitting in the composer, unsent. */
  draft: string
}

/* -------------------------------------------------------------------------- */
/* Thread turns                                                                */
/* -------------------------------------------------------------------------- */

/**
 * How far a seeded turn got.
 *
 * `thinking` and `applying` are deliberately absent. Only `submit()` schedules
 * the resolution, so a turn seeded mid-flight would spin for ever; `proposed`
 * is the in-flight frame a reviewer gets, and Accept takes it the rest of the
 * way for real.
 *
 * `missed` is derived rather than chosen — a request no rule matches lands
 * there whatever was asked for.
 */
export type SeedPhase = "proposed" | "applied" | "undone" | "missed"

let seq = 0

/**
 * One turn of the thread — the request, then the answer — built the way the
 * screen builds it: `respond` does the matching, `applyActions` does the work,
 * `filterRows` does the counting.
 */
export function turn(prompt: string, before: GridState, phase: SeedPhase): ThreadMessage[] {
  seq += 1
  const reply = respond(prompt, before)
  const countBefore = filterRows(rows, before.filters).length

  const analyst: ThreadMessage = { id: `seed-analyst-${seq}`, role: "analyst", text: prompt }
  const common = {
    id: `seed-agent-${seq}`,
    role: "agent" as const,
    prompt,
    message: reply.message,
    trace: reply.trace,
    thoughtMs: resolveMarks.structure,
    countBefore,
    stateVersion: 0,
  }

  if (reply.kind === "miss") {
    const missed: AgentMessage = {
      ...common,
      phase: "missed",
      suggestions: reply.suggestions,
      appliedMs: 0,
      stepsDone: 0,
      countAfter: countBefore,
      before: null,
    }
    return [analyst, missed]
  }

  const { actions } = reply.proposal
  // `undone` is a turn that landed and was then taken back, so it carries the
  // same receipt as `applied` — the grid is what moved, not the record of it.
  const landed = phase === "applied" || phase === "undone"
  const after = applyActions(before, actions)
  const agent: AgentMessage = {
    ...common,
    phase: phase === "missed" ? "proposed" : phase,
    proposal: reply.proposal,
    appliedMs: landed ? actions.length * motion.reflow + motion.quick : 0,
    stepsDone: landed ? actions.length : 0,
    countAfter: landed ? filterRows(rows, after.filters).length : countBefore,
    before: landed ? before : null,
  }
  return [analyst, agent]
}

/** The grid a request leaves behind, for a seed whose turn has already landed. */
function gridAfter(prompt: string, before: GridState): GridState {
  const reply = respond(prompt, before)
  return reply.kind === "proposal" ? applyActions(before, reply.proposal.actions) : before
}

/* -------------------------------------------------------------------------- */
/* The frames                                                                  */
/* -------------------------------------------------------------------------- */

/** The grid before anything has been asked of it. */
const coldGrid: GridState = { ...initialGridState, filters: {} }

/** The opening request, and the grid it leaves — which is where a reviewer lands. */
const openingThread = turn(seedPrompt, coldGrid, "applied")
const workingGrid = gridAfter(seedPrompt, coldGrid)

/** A request with no rule behind it. */
const missedPrompt = "what's pfizer's pipeline"

/** Verified against `filterRows`: no drug in the sample survives it. */
const emptyPrompt = "Also only vaccines"

/** A hand edit under a standing proposal — the thing that makes it stale. */
const movedOnGrid = applyAction(workingGrid, {
  kind: "toggleValue",
  columnKey: "stage",
  value: "Phase II",
})

/** Every lane the sample has, which is more than the grid is wide enough for. */
const wideGrid = applyActions(
  workingGrid,
  hiddenColumnKeys(workingGrid).map(
    (columnKey): GridAction => ({ kind: "addColumn", columnKey }),
  ),
)

const base: Idea4State = {
  grid: workingGrid,
  version: 0,
  openColumn: null,
  selectedRows: [],
  panelOpen: true,
  messages: openingThread,
  draft: "",
}

export const initialStates: Record<string, Idea4State> = {
  grid: base,
  "cold-grid": { ...base, grid: coldGrid, messages: [] },
  typed: { ...base, draft: examplePrompts[0] },
  proposed: {
    ...base,
    messages: [...openingThread, ...turn(examplePrompts[4], workingGrid, "proposed")],
  },
  undone: { ...base, grid: coldGrid, messages: turn(seedPrompt, coldGrid, "undone") },
  missed: {
    ...base,
    messages: [...openingThread, ...turn(missedPrompt, workingGrid, "missed")],
  },
  "column-menu": { ...base, openColumn: "stage" },
  grouped: {
    ...base,
    grid: applyAction(workingGrid, { kind: "setGroup", columnKey: "company" }),
  },
  wide: { ...base, grid: wideGrid },
  // The proposal was computed against the working grid; the analyst then took
  // Phase II off by hand, which is the version bump that strands it.
  stale: {
    ...base,
    grid: movedOnGrid,
    version: 1,
    messages: [...openingThread, ...turn(examplePrompts[0], workingGrid, "proposed")],
  },
  "panel-closed": { ...base, panelOpen: false },
  empty: {
    ...base,
    grid: gridAfter(emptyPrompt, workingGrid),
    messages: [...openingThread, ...turn(emptyPrompt, workingGrid, "applied")],
  },
}

export function initialState(slug: string): Idea4State {
  return initialStates[slug] ?? base
}

/**
 * The frame a live state is nearest to, so the URL can follow the click-through.
 *
 * Every seed maps back to its own slug, so landing on a deep link never
 * rewrites it. The row count is passed in because the screen has already
 * memoised it, and `empty` cannot be named without it.
 */
export function slugFor(state: Idea4State, rowCount: number): string {
  if (state.openColumn) return "column-menu"
  if (!state.panelOpen) return "panel-closed"

  const last = [...state.messages]
    .reverse()
    .find((message): message is AgentMessage => message.role === "agent")

  if (last?.phase === "proposed") {
    return last.stateVersion === state.version ? "proposed" : "stale"
  }
  if (last?.phase === "missed") return "missed"
  if (last?.phase === "undone") return "undone"

  if (state.draft.trim()) return "typed"
  if (rowCount === 0) return "empty"
  if (state.grid.group) return "grouped"
  // One extra lane is not the complaint; a grid past its own width is.
  if (state.grid.order.length >= defaultColumnOrder.length + 3) return "wide"
  if (state.messages.length === 0) return "cold-grid"
  return "grid"
}
