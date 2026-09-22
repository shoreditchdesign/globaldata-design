"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import {
  ChevronsDownUpIcon,
  Columns3Icon,
  CornerDownLeftIcon,
  DownloadIcon,
  FolderTreeIcon,
  GripVerticalIcon,
  LoaderCircleIcon,
  MicIcon,
  PinIcon,
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
import { Composer } from "@/flows/sprint-4/idea-2b/components/Composer"
import { ExplorerTree } from "@/flows/sprint-4/idea-2b/components/ExplorerTree"
import { QuickFilters } from "@/flows/sprint-4/idea-2b/components/QuickFilters"
import { RecordDrawer } from "@/flows/sprint-4/idea-2b/components/RecordDrawer"
import { ResultsPane } from "@/flows/sprint-4/idea-2b/components/ResultsPane"
import { exportCsv, lockedColumn, resultColumns } from "@/flows/sprint-4/idea-2b/columns"
import {
  drugAttributeOrder,
  matchingRows,
  sample,
  type Condition,
} from "@/flows/sprint-4/idea-2b/data"
import { insetVars, negationVars } from "@/flows/sprint-4/idea-2b/inset"
import { conditionsToProse } from "@/flows/sprint-4/idea-2b/grammar"
import { resolveQuery, type Resolution } from "@/flows/sprint-4/idea-2b/resolve"
import {
  initialState,
  mergePicks,
  slugFor,
  type ScreenerState,
} from "@/flows/sprint-4/idea-2b/state"

/** The tree's share of the bottom half at the 1440px review viewport. */
const TREE_WIDTH = 560

/**
 * Option 2b: the search bar stays a search bar.
 *
 * Option 2 read a typed query back as a sentence of editable pills, which put
 * the Boolean work in the prose. Here the words are only ever words: what they
 * resolve to shows up as filters — chips on the bar under the box, ticks in the
 * tree beside the results — and the box keeps what was typed, the way a search
 * field does.
 *
 * Two states, and the screen is one or the other. Nothing asked yet: the field
 * in the middle of the page with a few queries under it and the filters people
 * reach for most. Something asked: the field at the top, those filters tucked
 * away, the tree open beside the results.
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
    view,
    recordId,
    pinnedFilter,
    tree,
  } = state
  const { conditions } = query

  const reseed = React.useCallback((next: string) => setState(initialState(next)), [])
  useDeepLink(slugFor(state), reseed)

  const rows = React.useMemo(() => matchingRows(conditions), [conditions])

  /* ------------------------------------------------------------------ */
  /* The results, and the record over them                               */
  /* ------------------------------------------------------------------ */

  const record = React.useMemo(
    () => (recordId ? (rows.find((row) => row.id === recordId) ?? null) : null),
    [rows, recordId],
  )
  if (recordId && !record) setState((current) => ({ ...current, recordId: null }))
  const openRecord = (id: string) => setState((current) => ({ ...current, recordId: id }))
  const closeRecord = () => setState((current) => ({ ...current, recordId: null }))

  const [sortLabel, setSortLabel] = React.useState<string | null>(null)
  const [hidden, setHidden] = React.useState<string[]>([])
  const [order, setOrder] = React.useState<string[]>(() => resultColumns.map((c) => c.key))
  const [pinned, setPinned] = React.useState<string[]>([lockedColumn])
  const dragging = React.useRef<string | null>(null)

  const moveColumn = (from: string, to: string) =>
    setOrder((current) => {
      if (from === to) return current
      const next = current.filter((key) => key !== from)
      next.splice(next.indexOf(to), 0, from)
      return next
    })

  /* ------------------------------------------------------------------ */
  /* Editing the query                                                   */
  /* ------------------------------------------------------------------ */

  /**
   * A typed query, read. What it resolves to is applied at once — there is no
   * sentence to hand back, so there is nothing to confirm — and the screen moves
   * to the working state with the tree open beside the results.
   */
  const submit = (text: string) => {
    const resolution = resolveQuery(text)
    if (!resolution.ok) {
      setState((current) => ({ ...current, failure: resolution }))
      return
    }
    setState((current) => ({
      ...current,
      query: { conditions: resolution.conditions, raw: resolution.raw, resolution },
      past: [...current.past, current.query],
      draft: text,
      phase: "resolved",
      picks: {},
      drops: {},
      railOpen: false,
      view: "explorer",
      failure: null,
    }))
  }

  /**
   * A quick filter ticked. Nothing runs yet: what is ticked is written into the
   * field as the query it stands for, and Search reads that line like any other.
   * So the box always says what the screen is about to look for, whether the
   * words were typed or clicked.
   */
  const pickFilter = React.useCallback(
    (attribute: string, values: string[], dropped: string[]) =>
      setState((current) => {
        const nextPicks = { ...current.picks, [attribute]: values }
        const nextDrops = { ...current.drops, [attribute]: dropped }
        if (dropped.length === 0) delete nextDrops[attribute]
        const built = mergePicks(current.query.conditions, nextPicks, nextDrops)
        return {
          ...current,
          picks: nextPicks,
          drops: nextDrops,
          draft: built.length > 0 ? conditionsToProse(built) : "",
          failure: null,
        }
      }),
    [],
  )

  /**
   * The tree's rail, applied. The field takes the query back as plain words, so
   * a walk through the tree leaves the box saying what the screen is showing,
   * exactly as a typed search would.
   */
  const applyTicks = React.useCallback(
    (next: Condition[]) =>
      setState((current) => {
        const raw = next.length > 0 ? conditionsToProse(next) : ""
        return {
          ...current,
          query: { conditions: next, raw, resolution: null },
          past: [...current.past, current.query],
          phase: next.length === 0 ? "compose" : "resolved",
          draft: raw,
          picks: {},
          drops: {},
          tree: null,
          failure: null,
        }
      }),
    [],
  )

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
      query: { conditions: [], raw: "", resolution: null },
      past: [...current.past, current.query],
      draft: "",
      picks: {},
      drops: {},
      phase: "compose",
      failure: null,
      view: "sentence",
      railOpen: true,
    }))

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
  const asked = phase === "resolved" || !empty
  const explorer = view === "explorer"
  const unplaced = query.resolution?.unplaced ?? []

  const box = (
    <Composer
      value={draft}
      onChange={(value) => setState((current) => ({ ...current, draft: value }))}
      onSubmit={() => submit(draft)}
      onSuggestion={applySuggestion}
      failure={failure}
      showActions={false}
    />
  )

  const filters = (scope: "common" | "all") => (
    <QuickFilters
      conditions={conditions}
      picks={picks}
      drops={drops}
      scope={scope}
      onPick={pickFilter}
      pinned={pinnedFilter}
      onPinnedChange={(attribute) => setState((current) => ({ ...current, pinnedFilter: attribute }))}
    />
  )

  const actions = (
    <div className="flex shrink-0 items-center gap-1">
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
        disabled={empty && !draft.trim()}
        className="text-muted-foreground hover:bg-accent"
      >
        Clear all
      </Button>
      <Dictate
        base={draft}
        onTranscript={(text) => setState((current) => ({ ...current, draft: text, failure: null }))}
      />
      <Button size="sm" onClick={() => submit(draft)} disabled={!draft.trim()}>
        Search
        <CornerDownLeftIcon />
      </Button>
    </div>
  )

  /* Nothing asked yet: the field in the middle of the page, and under it the
     filters people reach for most. No table of everything, and no results
     standing in for an answer nobody has asked for. */
  if (!asked) {
    return (
      <ProductChrome activeArea="Drugs" body="column" className={cn(insetVars, negationVars)}>
        <div className="flex min-h-0 flex-1 items-center justify-center px-(--box-gutter) pb-20">
          <div className="w-[75%] min-w-[640px]">
            <h1 className="text-foreground mb-5 text-center text-[26px] font-medium tracking-tight">
              What are you looking for?
            </h1>

            {/* The same card the working state uses: the field, and the filters
                on their own grey rail under it. */}
            <div className="bg-surface-panel border-border shadow-raised flex flex-col overflow-hidden rounded-xl border">
              <div className="min-w-0 flex-1 px-(--box-pad) pt-4 pb-3.5">
                {box}

                {unplaced.length > 0 ? (
                  <p className="text-muted-foreground mt-3 text-sm">
                    <span className="text-foreground">{unplaced.join(", ")}</span> not found.
                  </p>
                ) : null}

                <div className="mt-3 flex items-center justify-end">{actions}</div>
              </div>

              <div className="bg-surface-chrome border-edge border-t">
                <div className="px-(--box-pad) py-2.5">{filters("common")}</div>
              </div>
            </div>
          </div>
        </div>

        <RecordDrawer row={record} onClose={closeRecord} />
      </ProductChrome>
    )
  }

  /* Something asked: the field at the top with what was typed still in it, the
     quick filters tucked away behind their own control, and the tree open
     beside the rows. */
  return (
    <ProductChrome activeArea="Drugs" body="column" className={cn(insetVars, negationVars)}>
      <section className="shrink-0 px-(--box-gutter) pt-5 pb-4">
        <div className="bg-surface-panel border-border shadow-raised flex flex-col overflow-hidden rounded-xl border">
          <div className="relative min-w-0 flex-1 px-(--box-pad) pt-4 pb-3.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setState((current) => ({
                  ...current,
                  railOpen: !current.railOpen,
                  // A dropdown belongs to the rail it hangs from.
                  pinnedFilter: null,
                }))
              }
              aria-expanded={railOpen}
              className="text-muted-foreground hover:bg-accent aria-expanded:bg-transparent aria-expanded:text-muted-foreground aria-expanded:hover:bg-accent aria-expanded:hover:text-foreground absolute top-2.5 right-3 z-10 text-[13px]"
            >
              {railOpen ? <ChevronsDownUpIcon /> : <SlidersHorizontalIcon />}
              {railOpen ? "Hide filters" : "Show filters"}
            </Button>

            <div className="pr-28">{box}</div>

            <div className="mt-3 flex items-end justify-between gap-4">
              <div className="min-w-0 flex-1">
                {unplaced.length > 0 ? (
                  <p className="text-muted-foreground min-w-0 truncate text-sm">
                    <span className="text-foreground">{unplaced.join(", ")}</span> not found.
                  </p>
                ) : null}
              </div>
              {actions}
            </div>
          </div>

          <div
            inert={!railOpen}
            style={{ transitionDuration: `${motion.reflow}ms` }}
            className={cn(
              "ease-settle bg-surface-chrome border-edge grid overflow-hidden border-t transition-[grid-template-rows,opacity] motion-reduce:transition-none",
              railOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] border-transparent opacity-0",
            )}
          >
            <div className="min-h-0">
              <div className="px-(--box-pad) py-2.5">{filters("all")}</div>
            </div>
          </div>
        </div>
      </section>

      <div className="flex min-h-0 flex-1 px-(--box-gutter) pb-5">
        <section className="bg-surface-panel border-border shadow-raised flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border">
          <div className="bg-surface-panel border-edge flex h-12 shrink-0 items-center justify-between gap-4 border-b px-4">
            <div className="bg-muted flex items-center gap-0.5 rounded-lg p-0.5">
              <ViewTab
                active={!explorer}
                onClick={() => setState((current) => ({ ...current, view: "sentence" }))}
              >
                <TableIcon className="size-3.5" />
                Standard
              </ViewTab>
              <ViewTab
                active={explorer}
                onClick={() => setState((current) => ({ ...current, view: "explorer" }))}
              >
                <FolderTreeIcon className="size-3.5" />
                Explorer
              </ViewTab>
            </div>

            <div className="flex min-w-0 items-center gap-3">
              {empty ? (
                <p className="text-muted-foreground text-xs">No results yet</p>
              ) : (
                <>
                  <p className="text-brand text-[16px] font-medium tabular-nums">
                    {rows.length.toLocaleString("en-GB")}
                  </p>
                  <p className="text-muted-foreground truncate text-xs tabular-nums">
                    of {sample.length.toLocaleString("en-GB")} sampled
                    {sortLabel ? ` · sorted by ${sortLabel}` : ""}
                  </p>
                </>
              )}

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="ml-1">
                    <Columns3Icon className="text-muted-foreground" />
                    Columns
                    <span className="tabular-nums">
                      {resultColumns.length - hidden.length}
                      <span className="text-muted-foreground font-normal">/{resultColumns.length}</span>
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

              <Button size="sm" disabled={empty || rows.length === 0} onClick={() => exportCsv(rows, hidden, order)}>
                <DownloadIcon />
                Export
              </Button>
            </div>
          </div>

          <div className="flex min-h-0 flex-1">
            <div
              inert={!explorer}
              style={{ width: explorer ? TREE_WIDTH : 0, transitionDuration: `${motion.reflow}ms` }}
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
                  onClose={() => setState((current) => ({ ...current, view: "sentence" }))}
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
  )
}

/** One option of the view toggle in the head of the results. */
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
 * Speaking the query instead of typing it. The browser's own recogniser, which
 * Chrome and Safari have and Firefox does not. It stays open until it is
 * pressed again: Chrome ends a session at every pause, so each end builds a
 * fresh one, and only a refused microphone stops it for good.
 *
 * Where Chrome can transcribe on the device it does, installing the language
 * pack on the first press: its cloud service fails with `network` on some
 * machines that are otherwise online, and on-device needs no network at all.
 */
function Dictate({ onTranscript, base }: { onTranscript: (text: string) => void; base: string }) {
  const [listening, setListening] = React.useState(false)
  /** Why it stopped, when it stopped for a reason worth saying. */
  const [problem, setProblem] = React.useState<"blocked" | "offline" | null>(null)
  /** The on-device language pack installing, on the first press. */
  const [preparing, setPreparing] = React.useState(false)
  /** Whether sessions run on the device; decided once per press. */
  const local = React.useRef(false)
  /** Sessions that ended within a second of starting, back to back. */
  const quickEnds = React.useRef(0)
  const engine = React.useRef<SpeechRecognitionLike | null>(null)
  const wanted = React.useRef(false)
  const listenRef = React.useRef<() => void>(() => {})
  /** What was in the field when the microphone opened, and what has been said since. */
  const baseRef = React.useRef("")
  const saidRef = React.useRef("")
  const onTranscriptRef = React.useRef(onTranscript)
  React.useEffect(() => {
    onTranscriptRef.current = onTranscript
  }, [onTranscript])

  const supported = React.useSyncExternalStore(
    () => () => {},
    () => Boolean(speechRecognition()),
    () => true,
  )

  const stop = () => {
    wanted.current = false
    const running = engine.current
    engine.current = null
    setListening(false)
    running?.stop()
  }

  const listen = React.useCallback(() => {
    const Recogniser = speechRecognition()
    if (!Recogniser || !wanted.current) return
    const recogniser: SpeechRecognitionLike = new Recogniser()
    recogniser.lang = LANG
    if (local.current) recogniser.processLocally = true
    const opened = performance.now()
    let spoke = false
    // Interim results, so the words appear as they are said rather than after
    // the recogniser has made its mind up. What is settled is kept; the tail
    // is replaced on every event.
    recogniser.interimResults = true
    recogniser.continuous = true

    let settled = ""

    recogniser.onresult = (event) => {
      spoke = true
      let interim = ""
      for (let i = 0; i < event.results.length; i += 1) {
        const result = event.results[i]
        const said = result[0]?.transcript ?? ""
        if (result.isFinal) settled += `${said.trim()} `
        else interim += said
      }
      const heard = `${settled}${interim}`.replace(/\s+/g, " ").trim()
      saidRef.current = heard
      const lead = baseRef.current.trim()
      onTranscriptRef.current(heard ? (lead ? `${lead} ${heard}` : heard) : lead)
    }

    const fail = (reason: "blocked" | "offline") => {
      wanted.current = false
      engine.current = null
      setProblem(reason)
      setListening(false)
    }

    /*
      `no-speech` and `aborted` are pauses and the session restarts through
      `onend`. The rest are not: the microphone was refused or is missing, or
      the speech service could not be reached — on a VPN or behind a firewall
      that fails every time, so retrying would spin silently.
    */
    recogniser.onerror = (event) => {
      const error = event?.error ?? ""
      if (error === "not-allowed" || error === "service-not-allowed") fail("blocked")
      else if (fatalErrors.has(error)) fail("offline")
    }

    recogniser.onend = () => {
      engine.current = null
      if (!wanted.current) {
        setListening(false)
        return
      }
      // Sessions that die the moment they open, back to back, will not start
      // working; restarting them is what made the microphone blink.
      quickEnds.current = !spoke && performance.now() - opened < 1000 ? quickEnds.current + 1 : 0
      if (quickEnds.current >= 3) {
        fail("offline")
        return
      }
      // A session ends at every pause. What it settled becomes part of the lead
      // for the next one, so the words already in the field are not repeated.
      baseRef.current = `${baseRef.current.trim()} ${saidRef.current}`.trim()
      saidRef.current = ""
      window.setTimeout(() => listenRef.current(), 150)
    }

    engine.current = recogniser
    try {
      recogniser.start()
    } catch {
      fail("offline")
    }
  }, [])

  React.useEffect(() => {
    listenRef.current = listen
  }, [listen])

  React.useEffect(
    () => () => {
      wanted.current = false
      engine.current?.abort()
    },
    [],
  )

  const start = async () => {
    const Recogniser = speechRecognition()
    if (!Recogniser) return
    setProblem(null)
    quickEnds.current = 0
    setPreparing(true)
    const mode = await preferredMode(Recogniser)
    setPreparing(false)
    if (mode === "none") {
      setProblem("offline")
      return
    }
    local.current = mode === "local"
    baseRef.current = base
    saidRef.current = ""
    wanted.current = true
    setListening(true)
    listen()
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={listening ? stop : start}
      disabled={!supported || preparing}
      aria-pressed={listening}
      title={
        !supported
          ? "This browser has no dictation"
          : problem === "offline"
            ? "Dictation could not reach a speech service"
            : problem === "blocked"
              ? "The microphone is blocked for this site"
              : undefined
      }
      className={cn(
        "hover:bg-accent",
        listening ? "text-brand hover:text-brand-strong" : "text-muted-foreground",
        problem && !listening && "text-negative-ink",
      )}
    >
      {listening ? (
        <Level />
      ) : preparing ? (
        <LoaderCircleIcon className="animate-spin motion-reduce:animate-none" />
      ) : (
        <MicIcon />
      )}
      {listening
        ? "Listening"
        : preparing
          ? "Preparing"
        : problem === "offline"
          ? "Dictation unavailable"
          : problem === "blocked"
            ? "Microphone blocked"
            : "Dictate"}
    </Button>
  )
}

/** Three bars keeping time while the recogniser is open. */
function Level() {
  return (
    <span aria-hidden className="flex h-3.5 items-end gap-[2px]">
      {[0, 120, 240].map((delay) => (
        <span
          key={delay}
          style={{ animationDelay: `${delay}ms` }}
          className="bg-brand h-full w-[2px] origin-bottom animate-[levels_900ms_ease-in-out_infinite] rounded-full motion-reduce:h-1/2 motion-reduce:animate-none"
        />
      ))}
    </span>
  )
}

interface SpeechResultLike extends ArrayLike<{ transcript: string }> {
  isFinal: boolean
}

interface SpeechRecognitionLike {
  lang: string
  /** Chrome's on-device recognition, where the language pack is installed. */
  processLocally?: boolean
  interimResults: boolean
  continuous: boolean
  onresult: ((event: { resultIndex: number; results: ArrayLike<SpeechResultLike> }) => void) | null
  onend: (() => void) | null
  onerror: ((event: { error?: string }) => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}

interface AvailabilityOptions {
  langs: string[]
  processLocally: boolean
}

interface RecogniserClass {
  new (): SpeechRecognitionLike
  available?: (options: AvailabilityOptions) => Promise<string>
  install?: (options: AvailabilityOptions) => Promise<boolean>
}

const LANG = "en-GB"

/** Errors that mean no session will work, so restarting would only spin. */
const fatalErrors = new Set(["network", "audio-capture", "language-not-supported"])

/**
 * On the device where Chrome can, installing the pack if it has to; the cloud
 * service where it cannot; nothing where neither is there. Safari has no
 * `available`, and goes straight to its own recogniser.
 */
async function preferredMode(Recogniser: RecogniserClass): Promise<"local" | "cloud" | "none"> {
  if (!Recogniser.available) return "cloud"
  try {
    const onDevice = await Recogniser.available({ langs: [LANG], processLocally: true })
    if (onDevice === "available") return "local"
    if ((onDevice === "downloadable" || onDevice === "downloading") && Recogniser.install) {
      if (await Recogniser.install({ langs: [LANG], processLocally: true })) return "local"
    }
    const cloud = await Recogniser.available({ langs: [LANG], processLocally: false })
    return cloud === "unavailable" ? "none" : "cloud"
  } catch {
    return "cloud"
  }
}

function speechRecognition(): RecogniserClass | undefined {
  if (typeof window === "undefined") return undefined
  const scope = window as unknown as {
    SpeechRecognition?: RecogniserClass
    webkitSpeechRecognition?: RecogniserClass
  }
  return scope.SpeechRecognition ?? scope.webkitSpeechRecognition
}

export type { Resolution }
export { drugAttributeOrder }
