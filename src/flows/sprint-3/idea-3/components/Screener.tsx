"use client"

import * as React from "react"
import {
  DownloadIcon,
  ListFilterIcon,
  PencilLineIcon,
  RotateCcwIcon,
  SparklesIcon,
  TextIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
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
  exampleClauses,
  originalPrompt,
  screenDrugs,
  type Clause,
} from "@/flows/sprint-3/idea-3/data"
import { clausesToProse } from "@/flows/sprint-3/idea-3/grammar"
import { resolveQuery, type Resolution } from "@/flows/sprint-3/idea-3/resolve"

type View = "sentence" | "filters"
type Phase = "compose" | "resolving" | "resolved"

/** One query and everything known about where it came from. */
interface Query {
  clauses: Clause[]
  /** The text it was read from, as typed. */
  raw: string
  /** What the resolver made of that text — kept for the honesty notes. */
  resolution: Resolution | null
  /** Whether pills have been edited since it resolved. */
  edited: boolean
}

/**
 * The worked example, produced by the resolver rather than authored beside it,
 * so the screen a reviewer opens on is the same object typing would have made.
 */
const seeded = resolveQuery(originalPrompt)
const seed: Query = {
  clauses: seeded.ok ? seeded.clauses : exampleClauses,
  raw: originalPrompt,
  resolution: seeded.ok ? seeded : null,
  edited: false,
}

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
 * asked the user to reconcile them; this swaps in place, and `edit as text`
 * runs the trip backwards.
 */
export function Screener({ start = false }: { start?: boolean }) {
  // Query and history in one atom, so every edit pushes exactly one undo step.
  const [{ query, past }, setState] = React.useState<{ query: Query; past: Query[] }>({
    query: start ? { clauses: [], raw: "", resolution: null, edited: false } : seed,
    past: [],
  })
  const [phase, setPhase] = React.useState<Phase>(start ? "compose" : "resolved")
  const [draft, setDraft] = React.useState("")
  const [failure, setFailure] = React.useState<Resolution | null>(null)
  const [pending, setPending] = React.useState<Resolution | null>(null)
  const [view, setView] = React.useState<View>("sentence")

  const { clauses } = query
  const empty = clauses.length === 0

  /* ------------------------------------------------------------------ */
  /* Editing the query in place                                          */
  /* ------------------------------------------------------------------ */

  const commit = React.useCallback((edit: (current: Clause[]) => Clause[]) => {
    setState((state) => ({
      query: { ...state.query, clauses: edit(state.query.clauses), edited: true },
      past: [...state.past, state.query],
    }))
  }, [])

  const undo = React.useCallback(() => {
    setState((state) =>
      state.past.length === 0
        ? state
        : { query: state.past[state.past.length - 1], past: state.past.slice(0, -1) },
    )
    setPhase("resolved")
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

  // Held in a ref as well as state: `settle` must keep the same identity for
  // the whole transition, or the animation would restart under the reviewer.
  const resolvedRef = React.useRef<Resolution | null>(null)

  const submit = React.useCallback((text: string) => {
    const resolution = resolveQuery(text)
    if (!resolution.ok) {
      // Nothing understood, so nothing is built. Staying in the composer with
      // the words intact is the honest outcome; guessing is the failure this
      // direction cannot afford.
      setFailure(resolution)
      return
    }
    setFailure(null)
    resolvedRef.current = resolution
    setPending(resolution)
    setPhase("resolving")
  }, [])

  const settle = React.useCallback(() => {
    setState((state) => {
      const resolution = resolvedRef.current
      if (!resolution) return state
      return {
        query: { clauses: resolution.clauses, raw: resolution.raw, resolution, edited: false },
        // A re-resolve is undoable too: `edit as text` that reads badly should
        // cost one click to reverse, not a retyped query.
        past: state.query.clauses.length > 0 ? [...state.past, state.query] : state.past,
      }
    })
    setPending(null)
    setPhase("resolved")
    setView("sentence")
  }, [])

  const editAsText = () => {
    // What comes back is the query as it stands. Untouched, that is the text
    // they typed; after pill edits, it is those edits written back as prose —
    // which resolves again to exactly the same clauses.
    setDraft(query.edited ? clausesToProse(clauses) : query.raw)
    setFailure(null)
    setPhase("compose")
  }

  const handOff = (text: string) => {
    setDraft(text)
    submit(text)
  }

  const clearAll = () => {
    setState((state) => ({
      query: { clauses: [], raw: "", resolution: null, edited: false },
      past: [...state.past, state.query],
    }))
    setDraft("")
    setFailure(null)
    setPhase("compose")
  }

  const applySuggestion = (phrase: string, value: string) => {
    const pattern = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")
    setDraft((text) => (pattern.test(text) ? text.replace(pattern, value) : `${text} ${value}`))
    setFailure(null)
  }

  /* ------------------------------------------------------------------ */

  // One call for both, so the count and the table can never disagree: the rows
  // are the sample filtered against the sentence, and the number above them is
  // reconciled against those rows rather than computed beside them.
  const { rows, total } = screenDrugs(clauses)
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
          <div className="bg-card flex items-stretch rounded-xl border shadow-xs">
            <div className="min-w-0 flex-1 px-5 py-4">
              <div className="mb-3 flex items-center gap-3">
                <span className="text-muted-foreground flex items-center gap-1.5 text-[10px] font-medium tracking-[0.08em] uppercase">
                  <SparklesIcon className="size-3.5" />
                  Drug screener
                </span>
                <div className="ml-auto flex items-center gap-0.5 rounded-lg border p-0.5">
                  <ViewTab
                    active={view === "sentence" && phase === "resolved"}
                    disabled={phase !== "resolved"}
                    onClick={() => setView("sentence")}
                    icon={<TextIcon className="size-3.5" />}
                    label="Sentence"
                  />
                  <ViewTab
                    active={view === "filters" && phase === "resolved"}
                    disabled={phase !== "resolved"}
                    onClick={() => setView("filters")}
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
                  onCancel={empty ? undefined : () => setPhase("resolved")}
                  onSuggestion={applySuggestion}
                  failure={failure}
                  showSuggestions={empty}
                  note={
                    empty
                      ? undefined
                      : query.edited
                        ? "Your query, written back as the sentence you can edit. Change it and it resolves again."
                        : "The text this query was read from. Change it and it resolves again."
                  }
                />
              ) : resolving && pending ? (
                <Resolving resolution={pending} onDone={settle} />
              ) : view === "sentence" ? (
                <>
                  <QuerySentence clauses={clauses} handlers={handlers} />
                  <p className="text-muted-foreground mt-3.5 text-xs">
                    Read from <span className="text-foreground/70">&ldquo;{query.raw}&rdquo;</span>{" "}
                    <button
                      type="button"
                      onClick={editAsText}
                      className="text-foreground/70 hover:text-foreground -mx-0.5 inline-flex items-center gap-1 rounded-md px-0.5 underline underline-offset-2"
                    >
                      <PencilLineIcon className="size-3" />
                      edit as text
                    </button>
                  </p>
                </>
              ) : (
                <>
                  <FilterView clauses={clauses} handlers={handlers} />
                  <p className="text-muted-foreground mt-3.5 text-xs">
                    The same conditions, drawn as filter groups. Editing here edits the sentence.{" "}
                    <button
                      type="button"
                      onClick={editAsText}
                      className="text-foreground/70 hover:text-foreground -mx-0.5 inline-flex items-center gap-1 rounded-md px-0.5 underline underline-offset-2"
                    >
                      <PencilLineIcon className="size-3" />
                      edit as text
                    </button>
                  </p>
                </>
              )}

              {!composing && !resolving && notes.length > 0 ? (
                <Notes notes={notes} resolution={query.resolution} onAdd={addValue} />
              ) : null}
            </div>

            <div className="flex w-[228px] shrink-0 flex-col gap-3 border-l px-5 py-4">
              <div>
                <p
                  className={cn(
                    "text-[34px] leading-none font-semibold tracking-tight tabular-nums transition-colors",
                    (empty || resolving) && "text-muted-foreground",
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
                  className="text-muted-foreground"
                >
                  <RotateCcwIcon />
                  Undo
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                  disabled={empty}
                  className="text-muted-foreground"
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
    <div className="border-border bg-muted/40 mt-3 rounded-lg border px-3 py-2.5">
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
              className="bg-background hover:bg-accent inline-flex h-6 items-center gap-1.5 rounded-md border px-2 text-xs transition-colors"
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
  disabled,
  onClick,
  icon,
  label,
}: {
  active: boolean
  disabled?: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex h-6 items-center gap-1.5 rounded-md px-2 text-xs font-medium transition-colors disabled:opacity-40",
        active ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {icon}
      {label}
    </button>
  )
}
