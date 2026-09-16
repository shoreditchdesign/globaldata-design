"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { RotateCcwIcon, TextIcon, WorkflowIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { useDeepLink } from "@/hooks/use-deep-link"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ProductChrome } from "@/components/prototype/ProductChrome"
import { ColumnsPanel } from "@/flows/sprint-4/idea-1/components/ColumnsPanel"
import { Composer } from "@/flows/sprint-4/idea-1/components/Composer"
import { LogicGate } from "@/flows/sprint-4/idea-1/components/LogicGate"
import { QuerySentence, type QueryHandlers } from "@/flows/sprint-4/idea-1/components/QuerySentence"
import { Resolving } from "@/flows/sprint-4/idea-1/components/Resolving"
import { ResultsPane } from "@/flows/sprint-4/idea-1/components/ResultsPane"
import {
  attributeSplit,
  childrenByValue,
  facetCounts,
  matchingRows,
  parentOf,
  runningCounts,
  sample,
  type Condition,
} from "@/flows/sprint-4/idea-1/data"
import { conditionsToProse } from "@/flows/sprint-4/idea-1/grammar"
import { resolveQuery, type Resolution } from "@/flows/sprint-4/idea-1/resolve"
import {
  blankQuery,
  initialState,
  normaliseConditions,
  RIGHTMOST,
  slugFor,
  toggleValue,
  withGate,
  type Gate,
  type HybridState,
} from "@/flows/sprint-4/idea-1/state"

/**
 * The hybrid, as one screen: Idea 3's text box across the top, Idea 2's Miller
 * columns bottom left, the results bottom right, and Idea 1's filter-builder
 * stack as a logic gate that opens down the left edge.
 *
 * All four are views of one list of conditions held in one atom. A tick in a
 * column, a pill dismissed from the sentence, an operator flipped in the gate
 * and a line of typed English all end in `commit` or `settle`, and the counts,
 * the pills, the nodes and the rows are all read off the result — so a change
 * made in any view is already true in the other three by the next paint.
 *
 * The slug in the URL seeds the state on arrival; from then on the state leads
 * and the address bar follows it.
 */
export function Screener() {
  const slug = usePathname().split("/").pop() ?? ""
  const [state, setState] = React.useState<HybridState>(() => initialState(slug))
  const { query, past, phase, draft, failure, pending, gate, path, leftIndex } = state
  const { conditions } = query

  const reseed = React.useCallback((next: string) => setState(initialState(next)), [])
  useDeepLink(slugFor(state), reseed)

  /* ------------------------------------------------------------------ */
  /* Derived — the sample, counted once per query                        */
  /* ------------------------------------------------------------------ */

  const rows = React.useMemo(() => matchingRows(conditions), [conditions])
  const splits = React.useMemo(() => attributeSplit(conditions), [conditions])
  const running = React.useMemo(() => runningCounts(conditions), [conditions])
  const countsFor = React.useCallback(
    (attribute: string) => facetCounts(conditions, attribute),
    [conditions],
  )

  /* ------------------------------------------------------------------ */
  /* Editing the query, from any view                                    */
  /* ------------------------------------------------------------------ */

  const commit = React.useCallback((edit: (current: Condition[]) => Condition[]) => {
    setState((current) => {
      const next = normaliseConditions(edit(current.query.conditions))
      const empty = next.length === 0
      return {
        ...current,
        query: { ...current.query, conditions: next, edited: true },
        past: [...current.past, current.query],
        // An edit made anywhere lands as a query, so the box shows the sentence
        // it now reads as. Emptied, the box goes back to being somewhere to type.
        phase: empty ? "compose" : "resolved",
        draft: empty ? "" : current.draft,
        failure: null,
      }
    })
  }, [])

  const update = React.useCallback(
    (attribute: string, change: (condition: Condition) => Condition) =>
      commit((current) =>
        current.map((condition) => (condition.attribute === attribute ? change(condition) : condition)),
      ),
    [commit],
  )

  const showInColumns = React.useCallback((attribute: string, value?: string) => {
    const parent = value ? parentOf(value) : undefined
    const next = parent
      ? [attribute, parent]
      : value && childrenByValue[value]
        ? [attribute, value]
        : [attribute]
    setState((current) => ({ ...current, path: next, leftIndex: RIGHTMOST }))
  }, [])

  const handlers: QueryHandlers = React.useMemo(
    () => ({
      onToggleValue: (attribute, value) =>
        commit((current) => toggleValue(current, attribute, value)),
      onSetMode: (attribute, mode) => update(attribute, (condition) => ({ ...condition, mode })),
      onSetJoin: (attribute, join) => update(attribute, (condition) => ({ ...condition, join })),
      onSetLink: (attribute, link) => update(attribute, (condition) => ({ ...condition, link })),
      onRemoveCondition: (attribute) =>
        commit((current) => current.filter((condition) => condition.attribute !== attribute)),
      onShowInColumns: showInColumns,
      countsFor,
    }),
    [commit, update, showInColumns, countsFor],
  )

  const setGate = (attribute: string, next: Gate) =>
    update(attribute, (condition) => withGate(condition, next))

  const undo = () =>
    setState((current) => {
      const previous = current.past[current.past.length - 1]
      if (!previous) return current
      return {
        ...current,
        query: previous,
        past: current.past.slice(0, -1),
        phase: previous.conditions.length === 0 ? "compose" : "resolved",
        failure: null,
      }
    })

  const clearAll = () =>
    setState((current) => ({
      ...current,
      query: blankQuery,
      past: [...current.past, current.query],
      draft: "",
      failure: null,
      phase: "compose",
    }))

  /* ------------------------------------------------------------------ */
  /* Typing, resolving, and back again                                   */
  /* ------------------------------------------------------------------ */

  const submit = (text: string) => {
    const resolution = resolveQuery(text)
    if (!resolution.ok) {
      // Nothing understood, so nothing is built and the words stay put.
      setState((current) => ({ ...current, failure: resolution }))
      return
    }
    setState((current) => ({ ...current, failure: null, pending: resolution, phase: "resolving" }))
  }

  // Stable for the whole transition, or the animation would restart under the
  // reviewer: it reads the pending reading from state rather than closing over it.
  const settle = React.useCallback(() => {
    setState((current) => {
      const resolution = current.pending
      if (!resolution) return { ...current, phase: "resolved" }
      const attributes = resolution.conditions.map((condition) => condition.attribute)
      return {
        ...current,
        query: { conditions: resolution.conditions, raw: resolution.raw, resolution, edited: false },
        past: current.query.conditions.length > 0 ? [...current.past, current.query] : current.past,
        pending: null,
        phase: "resolved",
        // The columns follow the reading onto an attribute it filled, unless
        // they are already on one.
        path: attributes.includes(current.path[0]) ? current.path : attributes.slice(0, 1),
        leftIndex: RIGHTMOST,
      }
    })
  }, [])

  const editAsText = () =>
    setState((current) => ({
      ...current,
      draft: current.query.edited ? conditionsToProse(current.query.conditions) : current.query.raw,
      failure: null,
      phase: "compose",
    }))

  const addSuggestion = (attribute: string, value: string) =>
    commit((current) =>
      current.some((condition) => condition.attribute === attribute && condition.values.includes(value))
        ? current
        : toggleValue(current, attribute, value),
    )

  const applySuggestion = (phrase: string, value: string) => {
    const pattern = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")
    setState((current) => ({
      ...current,
      draft: pattern.test(current.draft) ? current.draft.replace(pattern, value) : `${current.draft} ${value}`,
      failure: null,
    }))
  }

  /* ------------------------------------------------------------------ */

  const empty = conditions.length === 0
  const composing = phase === "compose"
  const resolving = phase === "resolving"
  const notes =
    query.resolution && !query.edited ? [...query.resolution.notes, ...unplacedNote(query.resolution)] : []

  return (
    <ProductChrome activeArea="Drugs" body="row">
      {gate ? (
        <LogicGate
          conditions={conditions}
          running={running}
          handlers={handlers}
          onSetGate={setGate}
          onClose={() => setState((current) => ({ ...current, gate: false }))}
        />
      ) : null}

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <section className="shrink-0 px-6 pt-5 pb-4">
          <div className="bg-surface-panel border-border shadow-raised flex items-stretch rounded-xl border">
            <div className="min-w-0 flex-1 px-5 py-4">
              <div className="mb-3 flex items-center gap-3">
                <span className="text-muted-foreground text-[10px] font-medium tracking-[0.08em] uppercase">
                  Drug screener
                </span>
                <div className="border-border bg-surface-sunken ml-auto flex items-center gap-0.5 rounded-lg border p-0.5">
                  <ViewTab
                    active={!gate}
                    onClick={() => setState((current) => ({ ...current, gate: false }))}
                    icon={<TextIcon className="size-3.5" />}
                    label="Sentence"
                  />
                  <ViewTab
                    active={gate}
                    onClick={() => setState((current) => ({ ...current, gate: true }))}
                    icon={<WorkflowIcon className="size-3.5" />}
                    label="Logic gate"
                  />
                </div>
              </div>

              {composing ? (
                <Composer
                  value={draft}
                  onChange={(value) => setState((current) => ({ ...current, draft: value }))}
                  onSubmit={() => submit(draft)}
                  onCancel={
                    empty ? undefined : () => setState((current) => ({ ...current, phase: "resolved" }))
                  }
                  onSuggestion={applySuggestion}
                  failure={failure}
                  showSuggestions={empty && !draft.trim()}
                />
              ) : resolving && pending ? (
                <Resolving resolution={pending} onDone={settle} />
              ) : (
                <QuerySentence conditions={conditions} handlers={handlers} />
              )}

              {!composing && !resolving && notes.length > 0 ? (
                <Notes notes={notes} resolution={query.resolution} onAdd={addSuggestion} />
              ) : null}

              {!composing && !resolving ? (
                <div className="mt-3.5 flex items-baseline justify-between gap-4">
                  {query.raw ? (
                    <p className="text-muted-foreground min-w-0 truncate text-xs">
                      {query.edited ? "Edited since it was read from" : "Read from"}{" "}
                      <span className="text-foreground/70">&ldquo;{query.raw}&rdquo;</span>
                    </p>
                  ) : (
                    <span />
                  )}
                  <button
                    type="button"
                    onClick={editAsText}
                    className="text-brand hover:text-brand-strong shrink-0 text-xs font-medium underline-offset-2 hover:underline"
                  >
                    Edit
                  </button>
                </div>
              ) : null}
            </div>

            <div className="border-edge flex w-[200px] shrink-0 flex-col gap-3 border-l px-5 py-4">
              <div>
                <p
                  className={cn(
                    "ease-settle text-[34px] leading-none font-semibold tracking-tight tabular-nums transition-colors duration-300 motion-reduce:transition-none",
                    empty || resolving ? "text-muted-foreground" : "text-foreground",
                  )}
                >
                  {rows.length.toLocaleString("en-GB")}
                </p>
                <p className="text-muted-foreground mt-1.5 text-xs">
                  {resolving ? "resolving…" : `drugs of ${sample.length.toLocaleString("en-GB")} sampled`}
                </p>
              </div>

              <Separator />

              <div className="-mx-1.5 flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={undo}
                  disabled={past.length === 0 || resolving}
                  className="text-muted-foreground hover:bg-accent"
                >
                  <RotateCcwIcon />
                  Undo
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                  disabled={empty || resolving}
                  className="text-muted-foreground hover:bg-accent"
                >
                  Clear all
                </Button>
              </div>
            </div>
          </div>
        </section>

        <div className="border-edge flex min-h-0 flex-1 border-t">
          {/*
            Two columns normally, one while the logic gate is open. The gate
            pushes rather than covers, and it is the columns that give up the
            room — folding into the breadcrumb, which is what Idea 2 built the
            breadcrumb for — so the results keep roughly the same width either
            way at the 1440px review viewport.
          */}
          <ColumnsPanel
            conditions={conditions}
            path={path}
            leftIndex={leftIndex}
            maxColumns={gate ? 1 : 2}
            splits={splits}
            countsFor={countsFor}
            onOpenAt={(depth, label) =>
              setState((current) => ({
                ...current,
                path: [...current.path.slice(0, depth), label],
                leftIndex: RIGHTMOST,
              }))
            }
            onSlide={(index) => setState((current) => ({ ...current, leftIndex: index }))}
            onToggle={handlers.onToggleValue}
            className={cn("border-edge shrink-0 border-r", gate ? "w-[300px]" : "w-[600px]")}
          />
          <ResultsPane rows={rows} active={!empty} className="flex-1" />
        </div>
      </div>
    </ProductChrome>
  )
}

/** What the resolver skipped, said out loud. */
function unplacedNote(resolution: Resolution) {
  if (resolution.unplaced.length === 0) return []
  const phrases = resolution.unplaced.map((phrase) => `“${phrase}”`).join(", ")
  return [`${phrases} — no condition in this screener matches that, so it was left out.`]
}

function Notes({
  notes,
  resolution,
  onAdd,
}: {
  notes: string[]
  resolution: Resolution | null
  onAdd: (attribute: string, value: string) => void
}) {
  const suggestions = resolution?.suggestions ?? []

  return (
    <div className="border-border bg-surface-sunken mt-3 rounded-lg border px-3 py-2.5">
      {notes.map((note) => (
        <p key={note} className="text-muted-foreground text-xs">
          {note}
        </p>
      ))}
      {suggestions.length > 0 ? (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-muted-foreground text-xs">Nearest condition it does have:</span>
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.value}
              type="button"
              onClick={() => onAdd(suggestion.attribute, suggestion.value)}
              className="bg-surface-panel border-border hover:border-edge hover:bg-accent hover:text-foreground inline-flex h-6 items-center gap-1.5 rounded-md border px-2 text-xs transition-colors"
            >
              Add {suggestion.value}
              <span className="text-muted-foreground">{suggestion.attribute}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

/**
 * One option of the view toggle. Selected takes the washed brand, per the
 * design system's rule for segmented options.
 */
function ViewTab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex h-6 items-center gap-1.5 rounded-md border px-2 text-xs font-medium transition-colors",
        active
          ? "bg-brand-tint border-brand-border text-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-foreground border-transparent",
      )}
    >
      {icon}
      {label}
    </button>
  )
}
