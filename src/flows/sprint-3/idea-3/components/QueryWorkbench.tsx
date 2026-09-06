"use client"

import * as React from "react"
import {
  ArrowRightIcon,
  DownloadIcon,
  ListFilterIcon,
  RotateCcwIcon,
  SparklesIcon,
  TextIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { FilterView } from "@/flows/sprint-3/idea-3/components/FilterView"
import { QuerySentence, type SentenceHandlers } from "@/flows/sprint-3/idea-3/components/QuerySentence"
import { ResultsGrid } from "@/flows/sprint-3/idea-3/components/ResultsGrid"
import {
  BASE_COUNT,
  addableClauses,
  exampleClauses,
  matchingRows,
  originalPrompt,
  resultCount,
  suggestedQueries,
  type Clause,
} from "@/flows/sprint-3/idea-3/data"

type View = "sentence" | "filters"

/**
 * The whole screen. One input owns the query; the results own the rest.
 *
 * There is exactly one representation of the query on screen at a time — the
 * sentence, or the same clauses drawn as conventional filter groups. The
 * rejected design showed a chat transcript and a builder panel side by side
 * and made the user reconcile them; this swaps in place.
 */
export function QueryWorkbench() {
  // Query and history in one atom, so every edit pushes exactly one undo step.
  const [{ clauses, past }, setState] = React.useState<{ clauses: Clause[]; past: Clause[][] }>({
    clauses: exampleClauses,
    past: [],
  })
  const [view, setView] = React.useState<View>("sentence")

  const commit = React.useCallback((edit: (current: Clause[]) => Clause[]) => {
    setState((state) => ({ clauses: edit(state.clauses), past: [...state.past, state.clauses] }))
  }, [])

  const undo = React.useCallback(() => {
    setState((state) =>
      state.past.length === 0
        ? state
        : { clauses: state.past[state.past.length - 1], past: state.past.slice(0, -1) },
    )
  }, [])

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
        const clause = addableClauses.find((c) => c.id === clauseId)
        if (clause) commit((current) => [...current, clause])
      },
    }),
    [commit],
  )

  const total = resultCount(clauses)
  // The sample, filtered against the sentence — so an edit never moves the
  // count without moving the table underneath it.
  const rows = matchingRows(clauses)
  const empty = clauses.length === 0

  return (
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
                  active={view === "sentence"}
                  onClick={() => setView("sentence")}
                  icon={<TextIcon className="size-3.5" />}
                  label="Sentence"
                />
                <ViewTab
                  active={view === "filters"}
                  onClick={() => setView("filters")}
                  icon={<ListFilterIcon className="size-3.5" />}
                  label="Filters"
                />
              </div>
            </div>

            {empty ? (
              <ColdStart onPick={() => commit(() => exampleClauses)} />
            ) : view === "sentence" ? (
              <>
                <QuerySentence clauses={clauses} handlers={handlers} />
                <p className="text-muted-foreground mt-3.5 text-xs">
                  Read from{" "}
                  <span className="text-foreground/70">&ldquo;{originalPrompt}&rdquo;</span>{" "}
                  <button type="button" className="underline underline-offset-2">
                    edit as text
                  </button>
                </p>
              </>
            ) : (
              <>
                <FilterView clauses={clauses} handlers={handlers} />
                <p className="text-muted-foreground mt-3.5 text-xs">
                  Same query, drawn as filter groups. Editing here edits the sentence.
                </p>
              </>
            )}
          </div>

          <div className="flex w-[228px] shrink-0 flex-col gap-3 border-l px-5 py-4">
            <div>
              <p
                className={cn(
                  "text-[34px] leading-none font-semibold tracking-tight tabular-nums transition-colors",
                  empty && "text-muted-foreground",
                )}
              >
                {total.toLocaleString()}
              </p>
              <p className="text-muted-foreground mt-1.5 text-xs">
                {empty ? "drugs, no conditions yet" : `drugs of ${BASE_COUNT.toLocaleString()}`}
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
                onClick={() => commit(() => [])}
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
      className={cn(
        "flex h-6 items-center gap-1.5 rounded-md px-2 text-xs font-medium transition-colors",
        active ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {icon}
      {label}
    </button>
  )
}

/**
 * The cold start, in the same box and the same slot as the sentence — so the
 * empty state is the input, not a different screen. Reached from Clear, and
 * one click from being full again.
 */
function ColdStart({ onPick }: { onPick: () => void }) {
  return (
    <div>
      <p className="text-muted-foreground text-[22px] leading-[2.05] tracking-[-0.01em]">
        <span className="bg-foreground/70 mr-0.5 inline-block h-[1.05em] w-px translate-y-[0.16em] animate-pulse" />
        Describe the drugs you&rsquo;re looking for
      </p>
      <div className="mt-4">
        <p className="text-muted-foreground mb-2 text-[10px] font-medium tracking-[0.08em] uppercase">
          Suggested
        </p>
        <div className="flex flex-col items-start gap-1">
          {suggestedQueries.map((query) => (
            <button
              key={query}
              type="button"
              onClick={onPick}
              className="text-foreground/80 hover:bg-muted hover:text-foreground group -mx-1.5 flex items-center gap-2 rounded-md px-1.5 py-1 text-left text-[13px] transition-colors"
            >
              <ArrowRightIcon className="text-muted-foreground size-3.5 shrink-0" />
              {query}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
