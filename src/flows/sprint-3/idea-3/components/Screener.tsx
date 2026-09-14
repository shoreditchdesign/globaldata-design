"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { DownloadIcon, ListFilterIcon, RotateCcwIcon, TextIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { useDeepLink } from "@/hooks/use-deep-link"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ProductChrome } from "@/components/prototype/ProductChrome"
import { Composer } from "@/flows/sprint-3/idea-3/components/Composer"
import { FilterView } from "@/flows/sprint-3/idea-3/components/FilterView"
import { GlobalSearch } from "@/flows/sprint-3/idea-3/components/GlobalSearch"
import { QuerySentence, type SentenceHandlers } from "@/flows/sprint-3/idea-3/components/QuerySentence"
import { Resolving } from "@/flows/sprint-3/idea-3/components/Resolving"
import { ResultsGrid } from "@/flows/sprint-3/idea-3/components/ResultsGrid"
import {
  BASE_COUNT,
  clauseTemplates,
  screenDrugs,
  type Clause,
} from "@/flows/sprint-3/idea-3/data"
import { clausesToProse } from "@/flows/sprint-3/idea-3/grammar"
import { resolveQuery, type Resolution } from "@/flows/sprint-3/idea-3/resolve"
import {
  blankQuery,
  initialState,
  slugFor,
  type Idea3State,
  type OpenPill,
  type View,
} from "@/flows/sprint-3/idea-3/state"

const order = new Map(clauseTemplates.map((clause, index) => [clause.id, index]))
const inOrder = (clauses: Clause[]) =>
  [...clauses].sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0))

/**
 * The whole screen: one input that owns the query, the results underneath.
 *
 * The query has three states and they are the same object throughout — the
 * text as typed, the sentence it resolves to, and that sentence drawn as
 * conventional filters. There is never more than one on screen at a time. The
 * rejected Sprint 2 design put a chat transcript beside a builder panel and
 * asked the user to reconcile them; this swaps in place, and `Edit` runs
 * the trip backwards.
 *
 * The ten frames the direction was reviewed as are states of this one screen.
 * The slug in the URL seeds the state on arrival; from then on the state leads
 * and the address bar follows it, so a link can open on the failure or on a
 * sentence nothing matches without anyone being walked there.
 */
export function Screener() {
  const slug = usePathname().split("/").pop() ?? ""

  // One atom, so every edit pushes exactly one undo step and a link seeds the
  // whole screen rather than half of it.
  const [state, setState] = React.useState<Idea3State>(() => initialState(slug))
  const { query, past, phase, draft, failure, pending, view, openPill } = state

  // Held in a ref as well as state: `settle` must keep the same identity for
  // the whole transition, or the animation would restart under the reviewer.
  // Seeded from the state, so a link that opens mid-resolve settles on the
  // query it was reading rather than on nothing.
  const resolvedRef = React.useRef<Resolution | null>(state.pending)

  const reseed = React.useCallback((next: string) => {
    const seeded = initialState(next)
    resolvedRef.current = seeded.pending
    setState(seeded)
  }, [])

  const setDraft = React.useCallback(
    (value: string) => setState((current) => ({ ...current, draft: value })),
    [],
  )

  const setOpenPill = React.useCallback(
    (pill: OpenPill | null) => setState((current) => ({ ...current, openPill: pill })),
    [],
  )

  const { clauses } = query
  const empty = clauses.length === 0

  /* ------------------------------------------------------------------ */
  /* Editing the query in place                                          */
  /* ------------------------------------------------------------------ */

  const commit = React.useCallback((edit: (current: Clause[]) => Clause[]) => {
    setState((state) => {
      const clauses = edit(state.query.clauses)
      const pill = state.openPill
      return {
        ...state,
        query: { ...state.query, clauses, edited: true },
        past: [...state.past, state.query],
        // A pill whose value has just gone takes its dropdown with it, and the
        // URL must not go on naming it.
        openPill:
          pill &&
          clauses.some(
            (clause) => clause.id === pill.clauseId && clause.selected.includes(pill.value),
          )
            ? pill
            : null,
      }
    })
  }, [])

  const undo = React.useCallback(() => {
    setState((state) =>
      state.past.length === 0
        ? state
        : {
            ...state,
            query: state.past[state.past.length - 1],
            past: state.past.slice(0, -1),
            phase: "resolved",
            openPill: null,
          },
    )
  }, [])

  const addValue = React.useCallback(
    (clauseId: string, value: string) =>
      commit((current) => {
        const existing = current.find((clause) => clause.id === clauseId)
        if (existing) {
          return current.map((clause) =>
            clause.id === clauseId && !clause.selected.includes(value)
              ? { ...clause, selected: [...clause.selected, value] }
              : clause,
          )
        }
        const template = clauseTemplates.find((clause) => clause.id === clauseId)
        if (!template) return current
        return inOrder([...current, { ...template, selected: [value] }])
      }),
    [commit],
  )

  const handlers: SentenceHandlers = React.useMemo(
    () => ({
      onToggleValue: (clauseId, value) =>
        commit((current) =>
          current
            .map((clause) => {
              if (clause.id !== clauseId) return clause
              const selected = clause.selected.includes(value)
                ? clause.selected.filter((v) => v !== value)
                : [...clause.selected, value]
              return { ...clause, selected }
            })
            // A clause with no values left says nothing — drop it, rather than
            // leaving a dangling operator in the middle of the sentence.
            .filter((clause) => clause.selected.length > 0),
        ),
      onSetOperator: (clauseId, word) =>
        commit((current) =>
          current.map((clause) =>
            clause.id === clauseId && clause.operator
              ? { ...clause, operator: { ...clause.operator, selected: word } }
              : clause,
          ),
        ),
      onSetJoin: (clauseId, join) =>
        commit((current) =>
          current.map((clause) => (clause.id === clauseId ? { ...clause, join } : clause)),
        ),
      onRemoveClause: (clauseId) =>
        commit((current) => current.filter((clause) => clause.id !== clauseId)),
      onAddClause: (clauseId) => {
        const template = clauseTemplates.find((clause) => clause.id === clauseId)
        // Inserted where the sentence reads it, not appended — an adjective
        // arriving after the operators would break the grammar.
        if (template) commit((current) => inOrder([...current, template]))
      },
    }),
    [commit],
  )

  /* ------------------------------------------------------------------ */
  /* Typing, resolving, and back again                                   */
  /* ------------------------------------------------------------------ */

  const submit = React.useCallback((text: string) => {
    const resolution = resolveQuery(text)
    if (!resolution.ok) {
      // Nothing understood, so nothing is built. Staying in the composer with
      // the words intact is the honest outcome; guessing is the failure this
      // direction cannot afford.
      setState((state) => ({ ...state, failure: resolution }))
      return
    }
    resolvedRef.current = resolution
    setState((state) => ({
      ...state,
      failure: null,
      pending: resolution,
      phase: "resolving",
    }))
  }, [])

  const settle = React.useCallback(() => {
    setState((state) => {
      const resolution = resolvedRef.current
      return {
        ...state,
        query: resolution
          ? { clauses: resolution.clauses, raw: resolution.raw, resolution, edited: false }
          : state.query,
        // A re-resolve is undoable too: an `Edit` that reads badly should
        // cost one click to reverse, not a retyped query.
        past: state.query.clauses.length > 0 ? [...state.past, state.query] : state.past,
        pending: null,
        phase: "resolved",
        view: "sentence",
        openPill: null,
      }
    })
  }, [])

  const editAsText = () => {
    // What comes back is the query as it stands. Untouched, that is the text
    // they typed; after pill edits, it is those edits written back as prose —
    // which resolves again to exactly the same clauses.
    setState((state) => ({
      ...state,
      draft: state.query.edited ? clausesToProse(state.query.clauses) : state.query.raw,
      failure: null,
      phase: "compose",
      openPill: null,
    }))
  }

  // The toggle is always offered, even before anything is typed. While a query
  // is being edited, picking a view abandons the edit and shows the query as it
  // stands; with nothing to show, or mid-resolve, the click does nothing.
  const selectView = (next: View) => {
    setState((state) => {
      if (state.phase === "resolving") return state
      if (state.phase === "compose") {
        if (state.query.clauses.length === 0) return state
        return { ...state, failure: null, phase: "resolved", view: next }
      }
      return { ...state, view: next }
    })
  }

  const handOff = (text: string) => {
    setDraft(text)
    submit(text)
  }

  const clearAll = () => {
    setState((state) => ({
      ...state,
      query: blankQuery,
      past: [...state.past, state.query],
      draft: "",
      failure: null,
      phase: "compose",
      openPill: null,
    }))
  }

  const applySuggestion = (phrase: string, value: string) => {
    const pattern = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")
    setState((state) => ({
      ...state,
      draft: pattern.test(state.draft)
        ? state.draft.replace(pattern, value)
        : `${state.draft} ${value}`,
      failure: null,
    }))
  }

  /* ------------------------------------------------------------------ */

  // One call for both, so the count and the table can never disagree: the rows
  // are the sample filtered against the sentence, and the number above them is
  // reconciled against those rows rather than computed beside them.
  const { rows, total } = screenDrugs(clauses)

  // The frame this state is nearest to, and the URL walking after it. The row
  // count goes in because it is the only thing separating a sentence that
  // works from one nothing in the sample satisfies.
  useDeepLink(slugFor(state, rows.length), reseed)

  const composing = phase === "compose"
  const resolving = phase === "resolving"
  // What the reading missed, kept in front of the reviewer until they act on
  // it. Editing a pill answers it, so it clears on the first edit rather than
  // sitting there stale beside a query it no longer describes.
  const notes =
    query.resolution && !query.edited
      ? [...query.resolution.notes, ...unplacedNote(query.resolution)]
      : []

  return (
    <ProductChrome activeArea="Drugs" search={<GlobalSearch onScreen={handOff} />}>
      <div className="flex min-h-0 flex-1 flex-col">
        <section className="shrink-0 px-6 pt-5 pb-4">
          <div className="bg-surface-panel border-border shadow-raised flex items-stretch rounded-xl border">
            <div className="min-w-0 flex-1 px-5 py-4">
              <div className="mb-3 flex items-center gap-3">
                <span className="text-muted-foreground text-[10px] font-medium tracking-[0.08em] uppercase">
                  Drug screener
                </span>
                <div className="border-border bg-surface-sunken ml-auto flex items-center gap-0.5 rounded-lg border p-0.5">
                  <ViewTab
                    active={view === "sentence"}
                    onClick={() => selectView("sentence")}
                    icon={<TextIcon className="size-3.5" />}
                    label="Sentence"
                  />
                  <ViewTab
                    active={view === "filters"}
                    onClick={() => selectView("filters")}
                    icon={<ListFilterIcon className="size-3.5" />}
                    label="Filters"
                  />
                </div>
              </div>

              {composing ? (
                <Composer
                  value={draft}
                  onChange={setDraft}
                  onSubmit={() => submit(draft)}
                  onCancel={
                    empty
                      ? undefined
                      : () => setState((current) => ({ ...current, phase: "resolved" }))
                  }
                  onSuggestion={applySuggestion}
                  failure={failure}
                  showSuggestions={empty}
                  note={
                    // Not a caption on the field — the provenance of what is in
                    // it, which is the one thing the field cannot say itself.
                    empty || query.edited ? undefined : "The text this query was read from."
                  }
                />
              ) : resolving && pending ? (
                <Resolving resolution={pending} onDone={settle} />
              ) : view === "sentence" ? (
                <QuerySentence
                  clauses={clauses}
                  handlers={handlers}
                  openPill={openPill}
                  onPillOpenChange={setOpenPill}
                />
              ) : (
                <FilterView clauses={clauses} handlers={handlers} />
              )}

              {!composing && !resolving && notes.length > 0 ? (
                <Notes notes={notes} resolution={query.resolution} onAdd={addValue} />
              ) : null}

              {!composing && !resolving ? (
                <div className="mt-3.5 flex items-baseline justify-between gap-4">
                  {view === "sentence" ? (
                    <p className="text-muted-foreground min-w-0 text-xs">
                      Read from <span className="text-foreground/70">&ldquo;{query.raw}&rdquo;</span>
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

            <div className="border-edge flex w-[228px] shrink-0 flex-col gap-3 border-l px-5 py-4">
              <div>
                <p
                  className={cn(
                    "ease-settle text-[34px] leading-none font-semibold tracking-tight tabular-nums transition-colors duration-300 motion-reduce:transition-none",
                    empty || resolving ? "text-muted-foreground" : "text-foreground",
                  )}
                >
                  {total.toLocaleString()}
                </p>
                <p className="text-muted-foreground mt-1.5 text-xs">
                  {resolving
                    ? "resolving…"
                    : empty
                      ? "drugs, no conditions yet"
                      : composing
                        ? "drugs, before this edit"
                        : `drugs of ${BASE_COUNT.toLocaleString()}`}
                </p>
              </div>

              <Separator />

              <Button size="sm" className="w-full" disabled={empty}>
                <DownloadIcon />
                Export to Excel
              </Button>

              <div className="-mx-1.5 flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={undo}
                  disabled={past.length === 0}
                  className="text-muted-foreground hover:bg-accent"
                >
                  <RotateCcwIcon />
                  Undo
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                  disabled={empty}
                  className="text-muted-foreground hover:bg-accent"
                >
                  Clear all
                </Button>
              </div>
            </div>
          </div>
        </section>

        <ResultsGrid rows={rows} total={total} />
      </div>
    </ProductChrome>
  )
}

/** What the resolver skipped, said out loud rather than left in the drawer. */
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
  onAdd: (clauseId: string, value: string) => void
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
              onClick={() => onAdd(suggestion.clauseId, suggestion.value)}
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
        "flex h-6 items-center gap-1.5 rounded-md px-2 text-xs font-medium transition-colors",
        active
          ? "bg-surface-panel text-foreground shadow-panel"
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
      )}
    >
      {icon}
      {label}
    </button>
  )
}
