"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import {
  agentPlan,
  attributeSplit,
  defaultPath,
  facetCounts,
  initialFilters,
  matchingRows,
  type AgentStep,
  type AttributeFilter,
} from "@/flows/sprint-3/idea-2/data"
import type { ResultColumnKey } from "@/flows/sprint-3/idea-2/components/ResultsTable"

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

interface AgentState {
  status: AgentStatus
  request: string | null
  steps: StepRecord[]
  /** Which step the sequencer is on, and which beat inside it. */
  stepIndex: number
  beat: number
}

const idleAgent: AgentState = {
  status: "idle",
  request: null,
  steps: [],
  stepIndex: 0,
  beat: 0,
}

/**
 * How long the agent waits between beats. Slow enough that a person watching
 * a demo can follow which control moved — the point of the run is that you
 * see your own interface being driven, and instant application shows nothing.
 */
const NAVIGATE_MS = 520
const TICK_MS = 380

/* -------------------------------------------------------------------------- */
/* The screener                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Every piece of state the screener has, in one place, because the panel, the
 * pill bar, the count and the table all have to be derived from the same
 * filters or they will disagree — and the agent has to drive exactly the same
 * state a click drives, or it is a black box wearing a panel.
 */
export function useScreener() {
  const [filters, setFilters] = useState<AttributeFilter[]>(initialFilters)
  const [path, setPath] = useState<string[]>(defaultPath)
  /*
   * Which column the visible window starts on, clamped on render. Setting a
   * large index always lands on the rightmost window, whichever depth the
   * panel is at, which is how "follow the drill-down" is expressed.
   *
   * It opens on 1 rather than the rightmost, so the first thing on screen is
   * the attribute inventory — the argument this direction is making — instead
   * of the deepest column of the worked example. On a wide window that is the
   * rightmost window anyway; on a narrower one it is the difference between
   * arriving at the data model and arriving three levels inside it.
   */
  const [leftIndex, setLeftIndex] = useState(1)
  const [agent, setAgent] = useState<AgentState>(idleAgent)

  // The sequencer reads the filters as they stand when a beat fires, which is
  // long after render — so the mirror is kept in an effect, not in the body.
  const filtersRef = useRef(filters)
  useEffect(() => {
    filtersRef.current = filters
  }, [filters])

  /* ---------------------------------------------------------------------- */
  /* Derived — the sample, counted                                          */
  /* ---------------------------------------------------------------------- */

  const rows = useMemo(() => matchingRows(filters), [filters])
  const splits = useMemo(() => attributeSplit(filters), [filters])
  const countsFor = useCallback(
    (attribute: string) => facetCounts(filters, attribute),
    [filters],
  )

  /* ---------------------------------------------------------------------- */
  /* Taking over                                                            */
  /* ---------------------------------------------------------------------- */

  const running = agent.status === "running"

  /**
   * Any touch of the controls stops the agent where it stands and yields.
   *
   * A step it was part-way through is marked stopped rather than done — it put
   * some of its values on and not the rest, and saying otherwise would be the
   * one lie this panel cannot afford. It stays undoable and resumable.
   */
  const yieldToUser = useCallback(() => {
    setAgent((current) =>
      current.status === "running"
        ? {
            ...current,
            status: "yielded",
            steps: current.steps.map((record) =>
              record.status === "running" ? { ...record, status: "stopped" } : record,
            ),
          }
        : current,
    )
  }, [])

  /* ---------------------------------------------------------------------- */
  /* Editing the query by hand                                              */
  /* ---------------------------------------------------------------------- */

  const setValues = useCallback(
    (attribute: string, next: (values: string[]) => string[]) => {
      setFilters((current) => {
        const existing = current.find((filter) => filter.attribute === attribute)
        const values = next(existing?.values ?? [])
        if (values.length === 0) {
          return current.filter((filter) => filter.attribute !== attribute)
        }
        if (!existing) {
          return [...current, { attribute, values, join: "or", mode: "is" }]
        }
        return current.map((filter) =>
          filter.attribute === attribute ? { ...filter, values } : filter,
        )
      })
    },
    [],
  )

  const toggleValue = useCallback(
    (attribute: string, value: string) => {
      yieldToUser()
      setValues(attribute, (values) =>
        values.includes(value) ? values.filter((v) => v !== value) : [...values, value],
      )
    },
    [setValues, yieldToUser],
  )

  const removeValue = useCallback(
    (attribute: string, value: string) => {
      yieldToUser()
      setValues(attribute, (values) => values.filter((v) => v !== value))
    },
    [setValues, yieldToUser],
  )

  const setJoin = useCallback(
    (attribute: string, join: AttributeFilter["join"]) => {
      yieldToUser()
      setFilters((current) =>
        current.map((filter) => (filter.attribute === attribute ? { ...filter, join } : filter)),
      )
    },
    [yieldToUser],
  )

  const setMode = useCallback(
    (attribute: string, mode: AttributeFilter["mode"]) => {
      yieldToUser()
      setFilters((current) =>
        current.map((filter) => (filter.attribute === attribute ? { ...filter, mode } : filter)),
      )
    },
    [yieldToUser],
  )

  /** Drop one attribute's condition whole — the pill sentence's own reset. */
  const clearAttribute = useCallback(
    (attribute: string) => {
      yieldToUser()
      setFilters((current) => current.filter((filter) => filter.attribute !== attribute))
    },
    [yieldToUser],
  )

  const clearAll = useCallback(() => {
    yieldToUser()
    setFilters([])
  }, [yieldToUser])

  /* ---------------------------------------------------------------------- */
  /* Navigating the columns                                                 */
  /* ---------------------------------------------------------------------- */

  const openPath = useCallback((next: string[]) => {
    setPath(next)
    setLeftIndex(99)
  }, [])

  /** Opening a column by hand is also taking over. */
  const openAt = useCallback(
    (depth: number, label: string) => {
      yieldToUser()
      setPath((current) => [...current.slice(0, depth), label])
      setLeftIndex(99)
    },
    [yieldToUser],
  )

  const slideTo = useCallback(
    (index: number) => {
      yieldToUser()
      setLeftIndex(index)
    },
    [yieldToUser],
  )

  /* ---------------------------------------------------------------------- */
  /* Reading one row, and choosing which columns to read it by               */
  /* ---------------------------------------------------------------------- */

  /**
   * Which record the drawer is showing, as an id rather than a row.
   *
   * The row itself is looked up in `rows` — the filtered set — so a record
   * cannot outlive the query that surfaced it: untick the value it matched on
   * while it is open and the drawer closes with it, which is the honest
   * behaviour for a panel that claims to be a view of the result set.
   */
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null)
  const openRecord = useCallback((id: string) => setSelectedRecordId(id), [])
  const closeRecord = useCallback(() => setSelectedRecordId(null), [])
  const selectedRow = useMemo(
    () => rows.find((row) => row.id === selectedRecordId) ?? null,
    [rows, selectedRecordId],
  )

  // Closing it that way has to drop the id with it. Held on to, a record that
  // left the set is still selected behind a shut drawer, and the drawer slides
  // back in on its own the moment the query lets the row through again — a
  // re-tick, or an undone agent step. Nothing opens it but `Open`.
  //
  // Adjusted during render rather than in an effect: React re-renders before
  // committing, so the drawer never paints a frame holding a record the query
  // has already dropped. The same pattern `useStagedSequence` uses in
  // `prototype/motion.ts`, and the one the lint rules here allow.
  if (selectedRecordId !== null && selectedRow === null) {
    setSelectedRecordId(null)
  }

  /**
   * The columns the table shows. Three by default — the two or three the client
   * asked for up front — and never fewer than two, because a one-column table
   * of drug names is a list, and the `Columns` menu should not be able to make
   * one by accident. Order is the table's, not the order they were ticked in.
   */
  const [visibleColumns, setVisibleColumns] = useState<ResultColumnKey[]>([
    "name",
    "stage",
    "company",
  ])

  const toggleColumn = useCallback((key: ResultColumnKey) => {
    setVisibleColumns((current) => {
      if (!current.includes(key)) return [...current, key]
      // The name is not one of the two: it carries `Open`, so unticking it is
      // unticking the only route to the fields the table dropped.
      if (key === "name") return current
      if (current.length <= 2) return current
      return current.filter((entry) => entry !== key)
    })
  }, [])

  /* ---------------------------------------------------------------------- */
  /* The agent                                                              */
  /* ---------------------------------------------------------------------- */

  /**
   * The agent has no resident surface, so the overlay is the only way in — and
   * the shortcut and the `Ask` button both come through this one piece of
   * state rather than each holding a copy, which is how they stay one door.
   * ⌘⇧E belongs to the Explorer; plain ⌘K is free.
   */
  const [spotlightOpen, setSpotlightOpen] = useState(false)
  const openSpotlight = useCallback(() => setSpotlightOpen(true), [])
  const closeSpotlight = useCallback(() => setSpotlightOpen(false), [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key !== "k") return
      event.preventDefault()
      setSpotlightOpen((current) => !current)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  const submitRequest = useCallback((request: string) => {
    // The overlay closes in the same tick the run starts, so the first step
    // moves the columns the request was asked of rather than a dimmed copy.
    setSpotlightOpen(false)
    setAgent({
      status: "running",
      request,
      steps: agentPlan.map((step) => ({ step, status: "pending" })),
      stepIndex: 0,
      beat: 0,
    })
  }, [])

  /**
   * Picking the run back up after taking over. The steps left are unchanged,
   * except for one case: a step that was stopped part-way and then undone has
   * had its values reverted, so resuming from the beat it stopped on would
   * write only the values after that beat and still report the step done. An
   * undone step restarts from its first value.
   */
  const resumeAgent = useCallback(() => {
    setAgent((current) => {
      if (current.status !== "yielded") return current
      const left = current.stepIndex < current.steps.length
      const resuming = current.steps[current.stepIndex]
      const beat = resuming?.status === "undone" ? 0 : current.beat
      return { ...current, status: left ? "running" : "done", beat }
    })
  }, [])

  /**
   * Undo and redo are scoped to the one attribute the step touched, so a step
   * in the middle of the list can be reversed on its own without the steps
   * after it silently coming apart.
   */
  const setStepStatus = useCallback((id: string, status: StepRecord["status"]) => {
    setAgent((current) => ({
      ...current,
      steps: current.steps.map((record) =>
        record.step.id === id ? { ...record, status } : record,
      ),
    }))
  }, [])

  const undoStep = useCallback(
    (id: string) => {
      const record = agent.steps.find((entry) => entry.step.id === id)
      if (!record || (record.status !== "done" && record.status !== "stopped")) return
      // Reversing a step is taking over. Without this the run keeps driving
      // while the step it already applied is pulled out from under it, and
      // because the sequencer watches `steps`, every undo restarts the beat it
      // was part-way through — enough clicks and it never finishes.
      yieldToUser()
      const action = record.step.action

      if (action.kind === "clear") {
        const removed = record.removed ?? []
        setFilters((current) => [
          ...removed.filter(
            (filter) => !current.some((entry) => entry.attribute === filter.attribute),
          ),
          ...current,
        ])
      } else {
        const previous = record.previous ?? null
        setFilters((current) => {
          const without = current.filter((filter) => filter.attribute !== action.attribute)
          return previous ? [...without, previous] : without
        })
      }

      setStepStatus(id, "undone")
    },
    [agent.steps, setStepStatus, yieldToUser],
  )

  const redoStep = useCallback(
    (id: string) => {
      const record = agent.steps.find((entry) => entry.step.id === id)
      if (!record || record.status !== "undone") return
      // Redo moves the columns as well as the filters, so it takes over for the
      // same reason undo does — harder, since `openPath` would otherwise pull
      // the view off whatever step the run is mid-way through.
      yieldToUser()
      const action = record.step.action

      if (action.kind === "clear") {
        const removed = record.removed ?? []
        setFilters((current) =>
          current.filter(
            (filter) => !removed.some((entry) => entry.attribute === filter.attribute),
          ),
        )
      } else {
        setFilters((current) => [
          ...current.filter((filter) => filter.attribute !== action.attribute),
          {
            attribute: action.attribute,
            values: action.values,
            join: action.join,
            mode: action.mode,
          },
        ])
      }

      openPath(record.step.path)
      setStepStatus(id, "done")
    },
    [agent.steps, openPath, setStepStatus, yieldToUser],
  )

  /* ---------------------------------------------------------------------- */
  /* The sequencer                                                          */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (agent.status !== "running") return

    // The run ends by the last step marking itself done, so there is never a
    // render where the sequencer is looking for a step that is not there.
    const record = agent.steps[agent.stepIndex]
    if (!record) return

    const step = record.step
    const beat = agent.beat
    const delay = beat === 0 ? NAVIGATE_MS : TICK_MS

    const timer = window.setTimeout(() => {
      // Beat one of every step is the move: the columns travel to the
      // attribute before anything is ticked, so the movement is legible.
      if (beat === 0) {
        setPath(step.path)
        setLeftIndex(99)
        setAgent((current) =>
          current.status !== "running"
            ? current
            : {
                ...current,
                beat: 1,
                steps: current.steps.map((entry) =>
                  entry.step.id === step.id ? { ...entry, status: "running" } : entry,
                ),
              },
        )
        return
      }

      const action = step.action
      const before = filtersRef.current

      if (action.kind === "clear") {
        setFilters([])
        setAgent((current) => {
          if (current.status !== "running") return current
          const next = current.stepIndex + 1
          return {
            ...current,
            status: next >= current.steps.length ? "done" : "running",
            stepIndex: next,
            beat: 0,
            steps: current.steps.map((entry) =>
              entry.step.id === step.id ? { ...entry, status: "done", removed: before } : entry,
            ),
          }
        })
        return
      }

      // Values go on one at a time, so the count moves once per value rather
      // than jumping to the answer in a single frame.
      const valueIndex = beat - 1
      const value = action.values[valueIndex]
      const previous = before.find((filter) => filter.attribute === action.attribute) ?? null

      setFilters((current) => {
        const others = current.filter((filter) => filter.attribute !== action.attribute)
        if (valueIndex === 0) {
          return [
            ...others,
            {
              attribute: action.attribute,
              values: [value],
              join: action.join,
              mode: action.mode,
            },
          ]
        }
        const existing = current.find((filter) => filter.attribute === action.attribute)
        return [
          ...others,
          {
            attribute: action.attribute,
            values: [...(existing?.values ?? []), value],
            join: action.join,
            mode: action.mode,
          },
        ]
      })

      const last = valueIndex === action.values.length - 1

      setAgent((current) => {
        if (current.status !== "running") return current
        const next = last ? current.stepIndex + 1 : current.stepIndex
        return {
          ...current,
          status: last && next >= current.steps.length ? "done" : "running",
          stepIndex: next,
          beat: last ? 0 : current.beat + 1,
          steps: current.steps.map((entry) =>
            entry.step.id === step.id
              ? {
                  ...entry,
                  status: last ? "done" : "running",
                  previous: valueIndex === 0 ? previous : entry.previous,
                }
              : entry,
          ),
        }
      })
    }, delay)

    return () => window.clearTimeout(timer)
  }, [agent.status, agent.stepIndex, agent.beat, agent.steps])

  const appliedCount = agent.steps.filter((record) => record.status === "done").length

  return {
    filters,
    rows,
    splits,
    countsFor,
    path,
    leftIndex,
    setLeftIndex: slideTo,
    openAt,
    openPath,
    toggleValue,
    removeValue,
    setJoin,
    setMode,
    clearAttribute,
    clearAll,
    agent,
    running,
    appliedCount,
    selectedRecordId,
    selectedRow,
    openRecord,
    closeRecord,
    visibleColumns,
    toggleColumn,
    spotlightOpen,
    openSpotlight,
    closeSpotlight,
    submitRequest,
    resumeAgent,
    undoStep,
    redoStep,
  }
}

export type Screener = ReturnType<typeof useScreener>
