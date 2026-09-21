"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import {
  ChevronsDownUpIcon,
  Columns3Icon,
  CornerDownLeftIcon,
  DownloadIcon,
  GripVerticalIcon,
  MicIcon,
  PinIcon,
  FolderTreeIcon,
  RotateCcwIcon,
  SlidersHorizontalIcon,
  TableIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { useDeepLink } from "@/hooks/use-deep-link"
import { motion } from "@/components/prototype/motion"
import { ProductChrome } from "@/components/prototype/ProductChrome"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
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
import { insetVars, negationVars } from "@/flows/sprint-4/idea-2/inset"
import { exportCsv, lockedColumn, resultColumns } from "@/flows/sprint-4/idea-2/columns"
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
  const {
    query,
    past,
    phase,
    draft,
    picks,
    drops,
    railOpen,
    failure,
    pending,
    view,
    recordId,
    pinnedFilter,
    tree,
  } = state
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
    (attribute: string, values: string[], dropped: string[]) =>
      setState((current) => {
        const next = { ...current.picks, [attribute]: values }
        const nextDrops = { ...current.drops, [attribute]: dropped }
        if (dropped.length === 0) delete nextDrops[attribute]

        // The bar adds to the query rather than replacing it: the line it writes
        // is what the query already holds with this attribute's values swapped
        // in, and Resolve reads that line like any other.
        const built = mergePicks(current.query.conditions, next, nextDrops)
        return {
          ...current,
          picks: next,
          drops: nextDrops,
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
          drops: {},
          tree: null,
          failure: null,
        }
      }),
    [],
  )

  /** What the grid is sorted by, said in the head both panes share. */
  const [sortLabel, setSortLabel] = React.useState<string | null>(null)
  /** Columns switched off from the head's own menu. */
  const [hidden, setHidden] = React.useState<string[]>([])
  /** The order they are drawn in, and which of them hold the left edge. */
  const [order, setOrder] = React.useState<string[]>(() => resultColumns.map((c) => c.key))
  const [pinned, setPinned] = React.useState<string[]>([lockedColumn])
  /** The column a drag in the menu picked up. */
  const dragging = React.useRef<string | null>(null)

  const moveColumn = (from: string, to: string) =>
    setOrder((current) => {
      if (from === to) return current
      const next = current.filter((key) => key !== from)
      next.splice(next.indexOf(to), 0, from)
      return next
    })

  const setView = (next: View) => setState((current) => ({ ...current, view: next }))

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
      drops: {},
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
        drops: {},
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
      <ProductChrome activeArea="Drugs" body="column" className={cn(insetVars, negationVars)}>
        <section className="shrink-0 px-(--box-gutter) pt-5 pb-4">
          <div className="bg-surface-panel border-border shadow-raised flex flex-col overflow-hidden rounded-xl border">
            <div className="relative min-w-0 flex-1 px-(--box-pad) pt-4 pb-3.5">
              {/* The rail can be tucked away when the query grows tall, so the
                  chips do not push the sentence up the screen. */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setState((current) => ({ ...current, railOpen: !current.railOpen }))}
                aria-expanded={railOpen}
                // A ghost button fills while it reports itself expanded, and this
                // one reports the rail. It says its state in its label instead,
                // so it rests like Undo and Clear all and fills only on hover.
                className="text-muted-foreground hover:bg-accent aria-expanded:bg-transparent aria-expanded:text-muted-foreground aria-expanded:hover:bg-accent aria-expanded:hover:text-foreground absolute top-2.5 right-3 z-10 text-[13px]"
              >
                {railOpen ? <ChevronsDownUpIcon /> : <SlidersHorizontalIcon />}
                {railOpen ? "Collapse filters" : "Show filters"}
              </Button>

              {/*
                The collapse control floats in this corner, so what is being
                typed or read stops short of it rather than running under it on
                the first line.
              */}
              <div className="pr-32">
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
              </div>

              {/*
                What the query was read from on the left, what can be done about
                it on the right, on one line — the two stacked left a band of
                empty space under whichever was shorter.
              */}
              <div className="mt-3 flex items-end justify-between gap-4">
                <div className="min-w-0 flex-1">
                  {!composing && !resolving && (query.raw || notes.length > 0) ? (
                    <p className="text-muted-foreground min-w-0 truncate text-sm">
                      {query.raw ? (
                        <>
                          {query.edited ? "Edited since it was read from" : "Read from"}{" "}
                          <span className="text-brand-ink">{query.raw}</span>
                        </>
                      ) : null}
                      {query.raw && notes.length > 0 ? <span className="px-1.5">·</span> : null}
                      <Notes notes={notes} />
                    </p>
                  ) : null}
                </div>

                <div className="flex shrink-0 items-center gap-1">
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
                  <Dictate
                    disabled={resolving}
                    onText={(text) =>
                      setState((current) => ({
                        ...current,
                        draft: current.draft.trim() ? `${current.draft.trim()} ${text}` : text,
                        phase: "compose",
                        failure: null,
                      }))
                    }
                  />
                  {composing ? (
                    <Button size="sm" onClick={() => submit(draft)} disabled={!draft.trim() || resolving}>
                      Resolve
                      <CornerDownLeftIcon />
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={editAsText}
                      disabled={resolving}
                      className="text-brand hover:text-brand-strong hover:bg-accent"
                    >
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/*
              The rail: the filters, and nothing else. It opens and closes by
              height from the button in the corner of the field above, because a
              query withseven chips on two rows pushes the sentence up the page.
            */}
            <div
              inert={!railOpen}
              style={{ transitionDuration: `${motion.reflow}ms` }}
              className={cn(
                "ease-settle bg-surface-chrome border-edge grid overflow-hidden border-t transition-[grid-template-rows,opacity] motion-reduce:transition-none",
                railOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] border-transparent opacity-0",
              )}
            >
              <div className="min-h-0">
                <div className="px-(--box-pad) py-2.5">
                  <QuickFilters
                    conditions={conditions}
                    picks={picks}
                    drops={drops}
                    onPick={pickFilter}
                    pinned={pinnedFilter}
                    onPinnedChange={(attribute) =>
                      setState((current) => ({ ...current, pinnedFilter: attribute }))
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/*
          One card, two panes. The head belongs to both: it says what the query
          found and which view is showing it, and the explorer and the grid are
          siblings underneath. Two cards each with their own head put the
          control that opens the tree inside the pane it was not opening.

          The tree is always mounted and opens by width, so it closes as
          smoothly as it opens; it holds its own width throughout, so its rows
          slide into view rather than reflowing. Reduced motion gets the end
          state at once.
        */}
        <div className="flex min-h-0 flex-1 px-(--box-gutter) pb-5">
          <section className="bg-surface-panel border-border shadow-raised flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border">
            <div className="bg-surface-panel border-edge flex h-12 shrink-0 items-center justify-between gap-4 border-b px-4">
              <div className="bg-muted flex items-center gap-0.5 rounded-lg p-0.5">
                <ViewTab active={!explorer} onClick={() => setView("sentence")}>
                  <TableIcon className="size-3.5" />
                  Standard
                </ViewTab>
                <ViewTab active={explorer} onClick={() => setView("explorer")}>
                  <FolderTreeIcon className="size-3.5" />
                  Explorer
                </ViewTab>
              </div>

              <div className="flex min-w-0 items-center gap-3">
                {empty ? (
                  <p className="text-muted-foreground text-[16px]">No results yet</p>
                ) : (
                  <>
                    <p className="text-foreground text-[16px] font-medium tabular-nums">
                      {rows.length.toLocaleString("en-GB")}
                    </p>
                    <p className="text-muted-foreground truncate text-xs tabular-nums">
                      of {sample.length.toLocaleString("en-GB")} sampled
                      {sortLabel ? ` · sorted by ${sortLabel}` : ""}
                    </p>
                  </>
                )}

                {/* Which columns are shown, and the rows as a file. Both belong
                    to the results rather than to either pane, so they sit at
                    the end of the head the two panes share. */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="ml-1">
                      <Columns3Icon className="text-muted-foreground" />
                      Columns
                      <span className="tabular-nums">
                        {resultColumns.length - hidden.length}
                        <span className="text-muted-foreground font-normal">
                          /{resultColumns.length}
                        </span>
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-[280px] px-1 py-2">
                    {order.map((key) => {
                      const column = resultColumns.find((entry) => entry.key === key)
                      if (!column) return null
                      const locked = column.key === lockedColumn
                      const isPinned = pinned.includes(column.key)
                      return (
                        <div
                          key={column.key}
                          draggable={!locked}
                          onDragStart={() => (dragging.current = column.key)}
                          onDragOver={(event) => event.preventDefault()}
                          onDrop={() => {
                            if (dragging.current && !locked) moveColumn(dragging.current, column.key)
                            dragging.current = null
                          }}
                          className="hover:bg-accent group/column flex items-center gap-1.5 rounded-md py-0.5 pr-1 pl-0.5 text-[13px]"
                        >
                          <GripVerticalIcon
                            className={cn(
                              "size-3.5 shrink-0",
                              locked
                                ? "text-transparent"
                                : "text-muted-foreground/60 cursor-grab active:cursor-grabbing",
                            )}
                          />
                          <label
                            className={cn(
                              "flex min-w-0 flex-1 items-center gap-2 py-1",
                              locked ? "text-muted-foreground" : "cursor-pointer",
                            )}
                          >
                            <Checkbox
                              checked={!hidden.includes(column.key)}
                              disabled={locked}
                              onCheckedChange={() =>
                                setHidden((current) =>
                                  current.includes(column.key)
                                    ? current.filter((entry) => entry !== column.key)
                                    : [...current, column.key],
                                )
                              }
                              className="border-muted-foreground/50 bg-background shrink-0"
                            />
                            <span className="truncate">{column.label}</span>
                          </label>
                          <button
                            type="button"
                            disabled={locked}
                            aria-pressed={isPinned}
                            aria-label={isPinned ? `Unpin ${column.label}` : `Pin ${column.label}`}
                            onClick={() =>
                              setPinned((current) =>
                                current.includes(column.key)
                                  ? current.filter((entry) => entry !== column.key)
                                  : [...current, column.key],
                              )
                            }
                            className={cn(
                              "flex size-6 shrink-0 cursor-pointer items-center justify-center rounded",
                              isPinned
                                ? "text-brand-ink"
                                : "text-muted-foreground/50 hover:text-foreground opacity-0 group-hover/column:opacity-100 disabled:opacity-0",
                            )}
                          >
                            <PinIcon className={cn("size-3.5", isPinned && "fill-current")} />
                          </button>
                        </div>
                      )
                    })}
                  </PopoverContent>
                </Popover>

                {/* The one thing on this rail that takes something away with
                    it, so it is the one that carries the brand. */}
                <Button size="sm" disabled={empty || rows.length === 0} onClick={() => exportCsv(rows, hidden, order)}>
                  <DownloadIcon />
                  Export
                </Button>
              </div>
            </div>

            <div className="flex min-h-0 flex-1">
              <div
                inert={!explorer}
                style={{
                  width: explorer ? TREE_WIDTH : 0,
                  transitionDuration: `${motion.reflow}ms`,
                }}
                className={cn(
                  "ease-settle border-edge shrink-0 overflow-hidden transition-[width] motion-reduce:transition-none",
                  explorer && "border-r",
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
                    className="h-full"
                  />
                </div>
              </div>

              <ResultsPane
                rows={rows}
                active={!empty}
                onOpenRecord={openRecord}
                hidden={hidden}
                order={order}
                pinned={pinned}
                onSortChange={setSortLabel}
                className="min-w-0 flex-1"
              />
            </div>
          </section>
        </div>

        <RecordDrawer row={record} onClose={closeRecord} />
      </ProductChrome>
    </ArrangeProvider>
  )
}

/**
 * Speaking the query instead of typing it.
 *
 * The browser's own recogniser, which Chrome and Safari have and Firefox does
 * not, so the control says it is unavailable there rather than sitting dead.
 * What comes back is appended to whatever is in the box, and the query is still
 * resolved by hand — dictation replaces the keyboard, not the Resolve press.
 */
function Dictate({ onText, disabled }: { onText: (text: string) => void; disabled?: boolean }) {
  const [listening, setListening] = React.useState(false)
  const engine = React.useRef<SpeechRecognitionLike | null>(null)
  const supported = React.useSyncExternalStore(
    () => () => {},
    () => Boolean(speechRecognition()),
    () => true,
  )

  const stop = () => {
    engine.current?.stop()
    engine.current = null
    setListening(false)
  }

  const start = () => {
    const Recogniser = speechRecognition()
    if (!Recogniser) return
    const recogniser: SpeechRecognitionLike = new Recogniser()
    recogniser.lang = "en-GB"
    recogniser.interimResults = false
    recogniser.continuous = false
    recogniser.onresult = (event) => {
      const said = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? "")
        .join(" ")
        .trim()
      if (said) onText(said.toLowerCase())
    }
    recogniser.onend = () => {
      engine.current = null
      setListening(false)
    }
    recogniser.onerror = recogniser.onend
    engine.current = recogniser
    setListening(true)
    recogniser.start()
  }

  React.useEffect(() => () => engine.current?.abort(), [])

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={listening ? stop : start}
      disabled={disabled || !supported}
      aria-pressed={listening}
      title={supported ? undefined : "This browser has no dictation"}
      className={cn(
        "hover:bg-accent aria-expanded:bg-transparent",
        listening ? "text-brand hover:text-brand-strong" : "text-muted-foreground",
      )}
    >
      <MicIcon className={listening ? "animate-pulse" : undefined} />
      {listening ? "Listening" : "Dictate"}
    </Button>
  )
}

/** The browser's recogniser, under either of the names it goes by. */
interface SpeechRecognitionLike {
  lang: string
  interimResults: boolean
  continuous: boolean
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null
  onend: (() => void) | null
  onerror: (() => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}

function speechRecognition(): (new () => SpeechRecognitionLike) | undefined {
  if (typeof window === "undefined") return undefined
  const scope = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike
    webkitSpeechRecognition?: new () => SpeechRecognitionLike
  }
  return scope.SpeechRecognition ?? scope.webkitSpeechRecognition
}

/**
 * One option of the view toggle in the head of the results. Selected is a white
 * segment lifted off a muted track, with no brand in it.
 */
function ViewTab({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex h-6 cursor-pointer items-center gap-1.5 rounded-md px-2 text-xs font-medium transition-[background-color,color,box-shadow]",
        active ? "bg-surface-panel text-foreground shadow-panel" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  )
}

/**
 * The query with the bar's ticks folded in. An attribute can keep some values
 * and drop others, so it writes up to two clauses — what it keeps, then what it
 * drops — the same shape the explorer applies. A clause the query already holds
 * keeps its own join and link; a new one joins the end with a plain `and`, in
 * the order the product lists its attributes.
 */
function mergePicks(
  conditions: Condition[],
  picks: Record<string, string[]>,
  drops: Record<string, string[]>,
): Condition[] {
  const held = new Map(conditions.map((condition) => [condition.id, condition]))
  const attributes = Array.from(
    new Set([...conditions.map((condition) => condition.attribute), ...Object.keys(picks)]),
  ).sort((a, b) => drugAttributeOrder.indexOf(a) - drugAttributeOrder.indexOf(b))

  const next: Condition[] = []
  for (const attribute of attributes) {
    const picked = picks[attribute]
    const values =
      picked ??
      conditions.filter((condition) => condition.attribute === attribute).flatMap((c) => c.values)
    if (values.length === 0) continue

    const dropped = picked
      ? (drops[attribute] ?? [])
      : conditions
          .filter((condition) => condition.attribute === attribute && condition.mode === "is not")
          .flatMap((c) => c.values)
    const kept = values.filter((value) => !dropped.includes(value))
    const excluded = values.filter((value) => dropped.includes(value))

    if (kept.length > 0) {
      const before = held.get(attribute)
      next.push({
        ...(before ?? { join: "or" as const, link: "and" as const }),
        id: attribute,
        attribute,
        mode: "is" as const,
        values: kept,
      })
    }
    if (excluded.length > 0) {
      const before = held.get(`${attribute}~not`)
      next.push({
        ...(before ?? { join: "or" as const, link: "and" as const }),
        id: `${attribute}~not`,
        attribute,
        mode: "is not" as const,
        values: excluded,
      })
    }
  }
  return next
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
 * What the reading missed, on the end of the line it was read from. It was a
 * grey card explaining itself in a sentence, then a line of its own under the
 * query; both were more room than one unplaced phrase deserves. The nearest
 * value it does have is offered in the sentence itself, faded into the clause
 * it would become, rather than named here.
 */
function Notes({ notes }: { notes: NoteLine[] }) {
  const phrases = Array.from(new Set(notes.flatMap((note) => note.phrases)))
  if (phrases.length === 0) return null

  return (
    <>
      {phrases.map((phrase, i) => (
        <React.Fragment key={phrase}>
          {i > 0 ? ", " : null}
          <span className="text-foreground">{phrase}</span>
        </React.Fragment>
      ))}{" "}
      not found.
    </>
  )
}

