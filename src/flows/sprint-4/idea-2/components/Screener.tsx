"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { CornerDownLeftIcon, RotateCcwIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { useDeepLink } from "@/hooks/use-deep-link"
import { motion } from "@/components/prototype/motion"
import { ProductChrome } from "@/components/prototype/ProductChrome"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Composer } from "@/flows/sprint-4/idea-2/components/Composer"
import { ExplorerTree } from "@/flows/sprint-4/idea-2/components/ExplorerTree"
import { QuerySentence } from "@/flows/sprint-4/idea-2/components/QuerySentence"
import { QuickFilters } from "@/flows/sprint-4/idea-2/components/QuickFilters"
import { Resolving } from "@/flows/sprint-4/idea-2/components/Resolving"
import { RecordDrawer } from "@/flows/sprint-4/idea-2/components/RecordDrawer"
import { ResultsPane } from "@/flows/sprint-4/idea-2/components/ResultsPane"
import { type QueryHandlers } from "@/flows/sprint-4/idea-2/components/ValueMenu"
import {
  drugAttributeOrder,
  facetCounts,
  matchingRows,

  sample,
  type Condition,
} from "@/flows/sprint-4/idea-2/data"
import { conditionsToProse } from "@/flows/sprint-4/idea-2/grammar"
import { insetVars } from "@/flows/sprint-4/idea-2/inset"
import { resolveQuery, type Resolution } from "@/flows/sprint-4/idea-2/resolve"
import { ArrangeProvider } from "@/flows/sprint-4/idea-2/components/Arrange"
import {
  addValue,
  blankQuery,
  initialState,
  normaliseConditions,
  slugFor,
  toggleValue,
  type ScreenerState,
  type View,
} from "@/flows/sprint-4/idea-2/state"

/**
 * The tree's share of the bottom half at the 1440px review viewport: 560px,
 * which leaves the results about 880px. Fixed rather than a percentage so the
 * rows inside do not reflow while the split is opening.
 */
const TREE_WIDTH = 560

/**
 * Idea 2, as one screen: Idea 3's text box across the top with the view toggle,
 * and underneath it either the results at full width (Sentence) or the logic
 * gate canvas beside them (Logic gate). There are no Miller columns; the canvas
 * takes the slot they held in the Sprint 4 hybrid, and it is tucked away until asked for.
 *
 * The sentence, the canvas and the results are views of one list of conditions
 * held in one atom. A node added on the canvas, a pill dismissed from the
 * sentence and a line of typed English all end in `commit` or `settle`, and the
 * pills, the nodes, the counts and the rows are all read off the result.
 *
 * The slug in the URL seeds the state on arrival; from then on the state leads
 * and the address bar follows it.
 */
export function Screener() {
  const slug = usePathname().split("/").pop() ?? ""
  const [state, setState] = React.useState<ScreenerState>(() => initialState(slug))
  const { query, past, phase, draft, picks, failure, pending, view, recordId, pinnedFilter, tree } = state
  const { conditions } = query

  const reseed = React.useCallback((next: string) => setState(initialState(next)), [])
  useDeepLink(slugFor(state), reseed)

  /* ------------------------------------------------------------------ */
  /* Derived — the sample, counted once per query                        */
  /* ------------------------------------------------------------------ */

  const rows = React.useMemo(() => matchingRows(conditions), [conditions])
  // The open record is looked up in the filtered set, never the sample. An edit
  // anywhere that drops the drug — a pill, a node, a drag, Undo — drops the id
  // with it, so the drawer closes rather than showing a drug the query excludes,
  // and cannot slide back in by itself if a later edit lets the row through.
  // Adjusted during render, so no frame paints a record the query has dropped.
  const record = React.useMemo(
    () => (recordId ? (rows.find((row) => row.id === recordId) ?? null) : null),
    [rows, recordId],
  )
  if (recordId && !record) setState((current) => ({ ...current, recordId: null }))
  const openRecord = (id: string) => setState((current) => ({ ...current, recordId: id }))
  const closeRecord = () => setState((current) => ({ ...current, recordId: null }))

  const countsFor = React.useCallback(
    (id: string, attribute: string) => facetCounts(conditions, id, attribute),
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
    (id: string, change: (condition: Condition) => Condition) =>
      commit((current) => current.map((condition) => (condition.id === id ? change(condition) : condition))),
    [commit],
  )

  const handlers: QueryHandlers = React.useMemo(
    () => ({
      onToggleValue: (id, attribute, value) => commit((current) => toggleValue(current, id, attribute, value)),
      onSetMode: (id, mode) => update(id, (condition) => ({ ...condition, mode })),
      onSetJoin: (id, join) => update(id, (condition) => ({ ...condition, join })),
      onSetLink: (id, link) => update(id, (condition) => ({ ...condition, link })),
      onRemoveCondition: (id) => commit((current) => current.filter((condition) => condition.id !== id)),
      countsFor,
    }),
    [commit, update, countsFor],
  )

  // A drop or a move from a menu, already worked out against the query on
  // screen. One entry in `past`, like any other edit, so Undo reverses it.
  const commitArrangement = React.useCallback(
    (next: Condition[]) => commit(() => next),
    [commit],
  )


  /**
   * What the quick filter bar has ticked but not resolved. It is the line in
   * the box, in pieces: every change rewrites the draft in the same words a
   * resolved query reads in, and Resolve then reads that line like any other.
   */
  const pickFilter = React.useCallback(
    (attribute: string, values: string[]) =>
      setState((current) => {
        const next = { ...current.picks, [attribute]: values }
        if (values.length === 0) next[attribute] = []

        // The bar adds to the query rather than replacing it: the line it writes
        // is what the query already holds with this attribute's values swapped
        // in, and Resolve reads that line like any other.
        const built = mergePicks(current.query.conditions, next)
        return {
          ...current,
          picks: next,
          draft: built.length > 0 ? conditionsToProse(built) : "",
          phase: "compose",
          failure: null,
        }
      }),
    [],
  )

  // The explorer's rail, applied. One entry in `past` like any other edit, and
  // the box takes the query back as plain words, since a walk through the tree
  // never went through a sentence in the first place.
  const applyTicks = React.useCallback(
    (next: Condition[]) =>
      setState((current) => {
        const conditions = normaliseConditions(next)
        const raw = conditions.length > 0 ? conditionsToProse(conditions) : ""
        return {
          ...current,
          query: { conditions, raw, resolution: null, edited: false },
          past: [...current.past, current.query],
          phase: conditions.length === 0 ? "compose" : "resolved",
          draft: raw,
          picks: {},
          tree: null,
          failure: null,
        }
      }),
    [],
  )

  /**
   * True once the tree has finished opening, so its shadow is not clipped. A
   * screen seeded with the explorer already open never animates, so it starts
   * settled rather than waiting for a transition that will not come.
   */
  const [treeSettled, setTreeSettled] = React.useState(view === "explorer")

  const setView = (next: View) =>
    setState((current) => {
      setTreeSettled(false)
      return { ...current, view: next }
    })

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
      picks: {},
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
      return {
        ...current,
        query: { conditions: resolution.conditions, raw: resolution.raw, resolution, edited: false },
        past: current.query.conditions.length > 0 ? [...current.past, current.query] : current.past,
        pending: null,
        phase: "resolved",
        picks: {},
        pinnedFilter: null,
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
    commit((current) => addValue(current, attribute, value))

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
  const explorer = view === "explorer"
  const notes: NoteLine[] =
    query.resolution && !query.edited
      ? [
          ...query.resolution.notes.map((note) => ({ phrases: [note.phrase], text: note.text })),
          ...unplacedNote(query.resolution),
        ]
      : []

  return (
    <ArrangeProvider conditions={conditions} onCommit={commitArrangement}>
      <ProductChrome activeArea="Drugs" body="column" className={insetVars}>
        <section className="shrink-0 px-(--box-gutter) pt-5 pb-4">
          <div className="bg-surface-panel border-border shadow-raised flex flex-col overflow-hidden rounded-xl border">
            <div className="min-w-0 flex-1 px-(--box-pad) pt-4 pb-3.5">
              <div className="mb-3 flex items-center gap-3">
                <span className="text-muted-foreground text-[10px] font-medium tracking-[0.08em] uppercase">
                  Drug screener
                </span>
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
                  showActions={false}
                />
              ) : resolving && pending ? (
                <Resolving resolution={pending} onDone={settle} />
              ) : (
                <QuerySentence
                  conditions={conditions}
                  handlers={handlers}
                  suggestions={query.edited ? [] : (query.resolution?.suggestions ?? [])}
                  onAddSuggestion={addSuggestion}
                />
              )}



              {!composing && !resolving && query.raw ? (
                <p className="text-muted-foreground mt-3.5 min-w-0 truncate text-xs">
                  {query.edited ? "Edited since it was read from" : "Read from"}{" "}
                  <span className="text-brand-ink">{query.raw}</span>
                </p>
              ) : null}

              {!composing && !resolving && notes.length > 0 ? (
                <Notes notes={notes} />
              ) : null}
            </div>

            {/*
              The rail: the filters on the left, and what the query costs and
              what can be done about it on the right. One grey band across the
              foot of the card, so the three ways in all end in the same place.
            */}
            <div className="bg-surface-chrome border-edge flex items-center gap-3 border-t px-(--box-pad) py-2.5">
              <QuickFilters
                conditions={conditions}
                picks={picks}
                onPick={pickFilter}
                pinned={pinnedFilter}
                onPinnedChange={(attribute) =>
                  setState((current) => ({ ...current, pinnedFilter: attribute }))
                }
                className="min-w-0 flex-1"
              />

              <div className="flex shrink-0 items-center gap-2">
                <p className="text-muted-foreground text-xs tabular-nums">
                  {resolving ? (
                    "resolving…"
                  ) : (
                    <>
                      <span className="text-foreground font-medium">
                        {rows.length.toLocaleString("en-GB")}
                      </span>{" "}
                      of {sample.length.toLocaleString("en-GB")} sampled
                    </>
                  )}
                </p>

                <Separator orientation="vertical" className="h-5" />

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
                  disabled={(empty && !draft.trim()) || resolving}
                  className="text-muted-foreground hover:bg-accent"
                >
                  Clear all
                </Button>
                {composing ? (
                  <Button size="sm" onClick={() => submit(draft)} disabled={!draft.trim() || resolving}>
                    Resolve
                    <CornerDownLeftIcon />
                  </Button>
                ) : (
                  <button
                    type="button"
                    onClick={editAsText}
                    disabled={resolving}
                    className="text-brand hover:text-brand-strong px-2 text-xs font-medium underline-offset-2 hover:underline"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/*
          The split, as two cards on the page rather than two halves of one
          plane: the explorer is always mounted and opens by width, so it closes
          as smoothly as it opens, and the results take whatever is left. The
          inner tree holds its width throughout, so its rows slide into view
          rather than reflowing. Reduced motion gets the end state at once.
        */}
        <div className="flex min-h-0 flex-1 gap-4 px-(--box-gutter) pb-5">
          <div
            inert={!explorer}
            onTransitionEnd={(event) => {
              if (event.propertyName === "width") setTreeSettled(explorer)
            }}
            style={{
              width: explorer ? TREE_WIDTH : 0,
              marginRight: explorer ? 0 : "-1rem",
              transitionDuration: `${motion.reflow}ms`,
            }}
            className={cn(
              "ease-settle shrink-0 transition-[width] motion-reduce:transition-none",
              // The width is animated by clipping, which clips the card's shadow
              // with it. Once the pane has arrived there is nothing to clip, so
              // the clip is lifted and the shadow reads.
              treeSettled ? "overflow-visible" : "overflow-hidden",
            )}
          >
            <div
              style={{
                width: TREE_WIDTH,
                transitionDuration: `${motion.settle}ms`,
                transitionDelay: explorer ? `${motion.handover}ms` : "0ms",
              }}
              className={cn(
                "ease-settle h-full transition-opacity motion-reduce:transition-none",
                explorer ? "opacity-100" : "opacity-0",
              )}
            >
              <ExplorerTree
                seed={tree}
                conditions={conditions}
                onApply={applyTicks}
                onClose={() => setView("sentence")}
                className="border-edge shadow-float h-full overflow-hidden rounded-xl border"
              />
            </div>
          </div>

          <ResultsPane
            rows={rows}
            active={!empty}
            onOpenRecord={openRecord}
            explorerOpen={explorer}
            onToggleExplorer={() => setView(explorer ? "sentence" : "explorer")}
            className="border-border shadow-raised min-w-0 flex-1 overflow-hidden rounded-xl border"
          />
        </div>

        <RecordDrawer row={record} onClose={closeRecord} />
      </ProductChrome>
    </ArrangeProvider>
  )
}

/**
 * The query with the bar's ticks folded in. A condition already in the query
 * keeps its own words and only its values change, so ticking a value under an
 * excluded attribute adds to the exclusion rather than flipping it; one left
 * with nothing ticked leaves. Anything new joins the end with a plain `and`, in
 * the order the product lists its attributes, so the line reads the way a typed
 * query resolves.
 */
function mergePicks(conditions: Condition[], picks: Record<string, string[]>): Condition[] {
  const kept = conditions
    .map((condition) => {
      const picked = picks[condition.attribute]
      if (!picked) return condition
      if (picked.length === 0) return null
      return { ...condition, values: picked }
    })
    .filter((condition): condition is Condition => condition !== null)

  const held = new Set(conditions.map((condition) => condition.attribute))
  const added = Object.entries(picks)
    .filter(([attribute, values]) => values.length > 0 && !held.has(attribute))
    .sort(([a], [b]) => drugAttributeOrder.indexOf(a) - drugAttributeOrder.indexOf(b))
    .map(([attribute, values]): Condition => ({
      id: attribute,
      attribute,
      values,
      join: "or" as const,
      mode: "is" as const,
      link: "and" as const,
    }))

  return [...kept, ...added]
}

/** One line under the sentence: the reviewer's own words, then what became of them. */
interface NoteLine {
  phrases: string[]
  text: string
}

/** What the resolver skipped, said out loud. */
function unplacedNote(resolution: Resolution): NoteLine[] {
  if (resolution.unplaced.length === 0) return []
  return [
    { phrases: resolution.unplaced, text: "no condition in this screener matches that, so it was left out." },
  ]
}

/**
 * What the reading missed, in one line under the line it was read from. It was
 * a grey card explaining itself in a sentence; no interface talks like that.
 * The nearest value it does have is offered in the sentence itself, faded into
 * the clause it would become, rather than listed here.
 */
function Notes({ notes }: { notes: NoteLine[] }) {
  const phrases = Array.from(new Set(notes.flatMap((note) => note.phrases)))
  if (phrases.length === 0) return null

  return (
    <p className="text-muted-foreground mt-1.5 text-xs">
      {phrases.map((phrase, i) => (
        <React.Fragment key={phrase}>
          {i > 0 ? ", " : null}
          <span className="text-foreground">{phrase}</span>
        </React.Fragment>
      ))}{" "}
      not found.
    </p>
  )
}

