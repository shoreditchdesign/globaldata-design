/**
 * The one state Idea 2 is, and the twelve frames it can be opened on.
 *
 * The screener is a single live surface rather than a deck of screens, so the
 * slugs are states of it: a slug seeds the screener on arrival, and from there
 * every click moves the same state. The URL follows it the other way —
 * `slugFor` names the frame the live state is nearest to, and the screen
 * replaces the address with it.
 *
 * Nothing in here is authored twice. A seed is produced by the same functions
 * the interface itself runs — `replayPlan` walks the agent's plan through
 * `applyStep`, an undone step is taken back by `reverseStep`, the open record
 * is the first row `matchingRows` actually returns — so a deep link cannot
 * show a count, a filter set or an undoable step the prototype would not have
 * produced on its own.
 */

import {
  agentPlan,
  agentRequest,
  childrenByValue,
  defaultPath,
  initialFilters,
  matchingRows,
  suggestedRequests,
  type AgentStep,
  type AttributeFilter,
} from "@/flows/sprint-3/idea-2/data"

/* -------------------------------------------------------------------------- */
/* The agent's run                                                             */
/* -------------------------------------------------------------------------- */

export type AgentStatus = "idle" | "running" | "done" | "yielded"

export interface StepRecord {
  step: AgentStep
  status: "pending" | "running" | "stopped" | "done" | "undone"
  /**
   * What the step has to put back if it is undone. Both are scoped to the one
   * attribute the step touched — undoing step 2 cannot disturb step 4.
   */
  previous?: AttributeFilter | null
  removed?: AttributeFilter[]
}

export interface AgentState {
  status: AgentStatus
  request: string | null
  steps: StepRecord[]
  /** Which step the sequencer is on, and which beat inside it. */
  stepIndex: number
  beat: number
}

export const idleAgent: AgentState = {
  status: "idle",
  request: null,
  steps: [],
  stepIndex: 0,
  beat: 0,
}

/**
 * What one step does to the query, and what it would have to put back to be
 * undone.
 *
 * Pure, and outside the sequencer, which is the whole point: the live run and
 * a seeded one are then the same arithmetic. A link that opens on a finished
 * run can offer Undo because its step records came out of the code the run
 * uses rather than being typed out beside it.
 *
 * The run calls it once per beat with the values ticked so far — a step whose
 * `values` have been cut short — which is how the count moves one value at a
 * time instead of jumping to the answer.
 */
export function applyStep(
  filters: AttributeFilter[],
  step: AgentStep,
): { filters: AttributeFilter[]; previous: AttributeFilter | null; removed: AttributeFilter[] } {
  const action = step.action

  if (action.kind === "clear") {
    return { filters: [], previous: null, removed: filters }
  }

  return {
    filters: [
      ...filters.filter((filter) => filter.attribute !== action.attribute),
      {
        attribute: action.attribute,
        values: action.values,
        join: action.join,
        mode: action.mode,
      },
    ],
    previous: filters.find((filter) => filter.attribute === action.attribute) ?? null,
    removed: [],
  }
}

/** One applied step taken back, scoped to the attribute it touched. */
export function reverseStep(
  filters: AttributeFilter[],
  record: StepRecord,
): AttributeFilter[] {
  const action = record.step.action

  if (action.kind === "clear") {
    const removed = record.removed ?? []
    return [
      ...removed.filter(
        (filter) => !filters.some((entry) => entry.attribute === filter.attribute),
      ),
      ...filters,
    ]
  }

  const without = filters.filter((filter) => filter.attribute !== action.attribute)
  const previous = record.previous ?? null
  return previous ? [...without, previous] : without
}

/**
 * The plan walked from the screen's opening query, as the sequencer walks it,
 * with however many steps already applied.
 *
 * `applied` is how far in the run got: `replayPlan(1)` is the state a moment
 * after the clear, `replayPlan()` the finished run. The records it returns
 * carry the same `previous` and `removed` the run captures, so every step it
 * marks done is genuinely undoable.
 */
export function replayPlan(applied: number = agentPlan.length): {
  filters: AttributeFilter[]
  steps: StepRecord[]
} {
  let filters = initialFilters

  const steps = agentPlan.map((step, index): StepRecord => {
    if (index >= applied) return { step, status: "pending" }
    const result = applyStep(filters, step)
    filters = result.filters
    return step.action.kind === "clear"
      ? { step, status: "done", removed: result.removed }
      : { step, status: "done", previous: result.previous }
  })

  return { filters, steps }
}

/** A finished run with one step taken back, by the reversal the button runs. */
function runWithStepUndone(id: string) {
  const run = replayPlan()
  const record = run.steps.find((entry) => entry.step.id === id)
  if (!record) return run
  return {
    filters: reverseStep(run.filters, record),
    steps: run.steps.map((entry) =>
      entry.step.id === id ? { ...entry, status: "undone" as const } : entry,
    ),
  }
}

/* -------------------------------------------------------------------------- */
/* The screener's state                                                        */
/* -------------------------------------------------------------------------- */

export interface Idea2State {
  /** The query. Every count on screen is read off the sample against it. */
  filters: AttributeFilter[]
  /** The open path through the Miller columns, area first. */
  path: string[]
  /** Which column the visible window starts on; clamped to the rightmost. */
  leftIndex: number
  agent: AgentState
  /** The line in the composer — what the agent is *about* to be asked. */
  request: string
  /** The record the drawer is showing, as an id rather than a row. */
  selectedRecordId: string | null
}

/**
 * The state the screen has always opened on: four attributes filtered, the
 * drill-down two levels into Therapy Area, the agent idle with its one wired
 * request sitting in the composer.
 */
const base: Idea2State = {
  filters: initialFilters,
  path: defaultPath,
  leftIndex: 1,
  agent: idleAgent,
  request: agentRequest,
  selectedRecordId: null,
}

/** The rightmost window, whichever depth the panel is at. */
const RIGHTMOST = 99

/** Geography turned from a region you are in to two countries you are not. */
const excludedFilters: AttributeFilter[] = initialFilters.map((filter) =>
  filter.attribute === "Drug Geography"
    ? { ...filter, values: ["Austria", "Italy"], mode: "is not" }
    : filter,
)

/**
 * The same attribute's values intersected rather than unioned: dermatology
 * *and* one of its own indications, which is the only honest AND this sample
 * can carry — a row holds one therapy area and one indication, so two areas
 * joined with `and` would match nothing and the frame would be the empty one
 * wearing a different name. 25 rows with `or`, 11 with `and`.
 */
const intersectedFilters: AttributeFilter[] = initialFilters.map((filter) =>
  filter.attribute === "Therapy Area / Indication"
    ? { ...filter, values: ["Dermatology", "Plaque Psoriasis"], join: "and" }
    : filter,
)

/**
 * A combination the sample cannot satisfy, and one an analyst can see is
 * impossible rather than merely unlucky: a cell therapy taken by mouth. Both
 * halves are well populated on their own — 52 cell therapies, 418 oral drugs —
 * so the zero is the join, which is what the frame is for. Verified against
 * `matchingRows`, not guessed.
 */
const emptyFilters: AttributeFilter[] = [
  { attribute: "Molecule Type", values: ["Cell Therapy"], join: "or", mode: "is" },
  { attribute: "Route of Administration", values: ["Oral"], join: "or", mode: "is" },
]

const midRun = replayPlan(1)
const finishedRun = replayPlan()
const undoneRun = runWithStepUndone("geography")

const lastStep = agentPlan[agentPlan.length - 1]
const geographyStep = agentPlan.find((step) => step.id === "geography") ?? lastStep

/** Level four of the open branch, taken from the taxonomy rather than typed. */
const deepestPath = [...defaultPath, childrenByValue[defaultPath[2]][0].label]

export const initialStates: Record<string, Idea2State> = {
  "cold-start": { ...base, filters: [], path: ["Drugs"], leftIndex: 0 },
  values: {
    ...base,
    filters: [],
    path: ["Drugs", "Therapy Area / Indication"],
    leftIndex: RIGHTMOST,
  },
  screener: base,
  excluded: {
    ...base,
    filters: excludedFilters,
    path: ["Drugs", "Drug Geography", "Europe"],
    leftIndex: RIGHTMOST,
  },
  intersected: { ...base, filters: intersectedFilters, leftIndex: RIGHTMOST },
  "agent-running": {
    ...base,
    filters: midRun.filters,
    path: agentPlan[0].path,
    leftIndex: RIGHTMOST,
    agent: {
      status: "running",
      request: agentRequest,
      steps: midRun.steps,
      stepIndex: 1,
      beat: 0,
    },
  },
  "agent-done": {
    ...base,
    filters: finishedRun.filters,
    path: lastStep.path,
    leftIndex: RIGHTMOST,
    agent: {
      status: "done",
      request: agentRequest,
      steps: finishedRun.steps,
      stepIndex: agentPlan.length,
      beat: 0,
    },
  },
  "agent-undone": {
    ...base,
    filters: undoneRun.filters,
    path: geographyStep.path,
    leftIndex: RIGHTMOST,
    agent: {
      status: "done",
      request: agentRequest,
      steps: undoneRun.steps,
      stepIndex: agentPlan.length,
      beat: 0,
    },
  },
  record: { ...base, selectedRecordId: matchingRows(initialFilters)[0]?.id ?? null },
  empty: {
    ...base,
    filters: emptyFilters,
    path: ["Drugs", "Route of Administration"],
    leftIndex: RIGHTMOST,
  },
  "agent-unwired": { ...base, request: suggestedRequests[1].text },
  breadcrumb: { ...base, path: deepestPath, leftIndex: RIGHTMOST },
}

export function initialState(slug: string): Idea2State {
  return initialStates[slug] ?? base
}

/**
 * The frame a live state is nearest to, so the URL can follow the click-through.
 *
 * Every seed maps back to its own slug, so landing on a deep link never
 * rewrites it; anything between two frames names the one it is on the way to.
 * A run that is part-way through — whether it is still going or the user has
 * taken over mid-way — is `agent-running`, which is why arriving on that link
 * does not flicker as the sequencer advances past the beat it was seeded at.
 *
 * The row count comes in rather than being counted here: the hook already
 * memoises it, and counting the sample twice per render to name a URL would be
 * the tail wagging the dog.
 */
export function slugFor(state: Idea2State, rowCount: number): string {
  if (state.selectedRecordId) return "record"

  const { status, steps } = state.agent
  if (status !== "idle") {
    if (steps.some((record) => record.status === "undone")) return "agent-undone"
    if (steps.every((record) => record.status === "done")) return "agent-done"
    return "agent-running"
  }

  // An edited line is a disarmed Send, whatever else is on screen.
  if (state.request.trim() !== agentRequest) return "agent-unwired"

  if (rowCount === 0) return "empty"
  if (state.filters.some((filter) => filter.mode === "is not")) return "excluded"
  if (state.filters.some((filter) => filter.join === "and")) return "intersected"
  if (state.path.length >= 4) return "breadcrumb"
  if (state.filters.length === 0) return state.path.length >= 2 ? "values" : "cold-start"
  return "screener"
}
