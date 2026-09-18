"use client"

import * as React from "react"
import { ArrowRightIcon, CornerDownLeftIcon, TriangleAlertIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { nextExample } from "@/flows/sprint-4/idea-2/examples"
import { knownAttributes, type Resolution } from "@/flows/sprint-4/idea-2/resolve"
import { suggestedQueries } from "@/flows/sprint-4/idea-2/state"

/** The demo shortcut. Typed anywhere in the box, it becomes the next example. */
const trigger = "$$"

/**
 * Queries the box completes to while a reviewer types. Written down rather
 * than generated, and deliberately short: the resolver reads every one of
 * them, so a completion the reviewer accepts always builds a query instead of
 * handing back a failure. `suggestedQueries` in `state.ts` seeds the top three
 * — the list it draws below the box — and the rest cover the other attributes
 * the screener can read.
 */
const commonQueries = [
  "anti-inflammatories for dermatology or immunology, phase 2/3, not in austria or italy",
  "oral small molecules in europe or north america",
  "marketed monoclonal antibodies for plaque psoriasis",
  "phase 3 jak inhibitors for rheumatoid arthritis",
  "subcutaneous glp-1 agonists for type 2 diabetes",
  "topical antiinflammatories for atopic dermatitis",
  "antineoplastics in phase 2 or 3, not oral",
  "biosimilars in japan or china",
  "gene therapies in phase 1 or 2",
  "small molecules not in the united states",
]

/**
 * The rest of the query the reviewer has started. A plain prefix match, the
 * way a shell completes from its history — nothing to learn, and it is silent
 * the moment the typing leaves the list behind.
 */
function completionFor(typed: string) {
  if (typed.trim().length === 0) return ""
  const prefix = typed.toLowerCase()
  const match = commonQueries.find((query) => query.length > typed.length && query.startsWith(prefix))
  return match ? match.slice(typed.length) : ""
}

/**
 * Where the query is typed — the cold start, and the far end of `Edit`.
 *
 * Idea 3's composer, at the same size and in the same box as the sentence it
 * becomes, with one thing added: what is typed carries a ghost of the rest of
 * the query, which Tab or Right Arrow takes.
 */
export function Composer({
  value,
  onChange,
  onSubmit,
  onCancel,
  onSuggestion,
  failure,
  note,
  showSuggestions,
  showActions = true,
}: {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  /** Present when an existing query is being edited rather than started. */
  onCancel?: () => void
  /** Puts a near miss into the text, for the reviewer to accept or not. */
  onSuggestion: (phrase: string, term: string) => void
  /** The last attempt, when it produced no query at all. */
  failure?: Resolution | null
  /** Said above the field when the prose was written back from pill edits. */
  note?: string
  /** Off when Resolve lives in the card's own footer rather than under the field. */
  showActions?: boolean
  showSuggestions?: boolean
}) {
  const field = React.useRef<HTMLTextAreaElement>(null)
  const [caret, setCaret] = React.useState(0)
  /** Escape closes the ghost without touching what is in the box. */
  const [dismissed, setDismissed] = React.useState(false)

  React.useEffect(() => {
    const node = field.current
    if (!node) return
    node.focus()
    node.setSelectionRange(node.value.length, node.value.length)
    setCaret(node.value.length)
    // Mount only. Re-running would fight the caret while the reviewer types.
  }, [])

  // Only ever a tail, so it only shows with the caret at the end of the text.
  const completion = dismissed || caret !== value.length ? "" : completionFor(value)

  const accept = () => {
    const node = field.current
    if (!node || completion.length === 0) return
    const next = value + completion
    setCaret(next.length)
    onChange(next)
    requestAnimationFrame(() => node.setSelectionRange(node.value.length, node.value.length))
  }

  return (
    <div>
      {note ? <p className="text-muted-foreground mb-2 text-xs">{note}</p> : null}

      {/* Both in one grid cell, so the ghost sits exactly under the text and
          the box is as tall as whichever of the two runs longer. */}
      <div className="grid grid-cols-1">
        {/*
         * The ghost. A textarea cannot hold text it does not own, so the rest
         * of the query is drawn behind it in a box that mirrors the field —
         * same type, same tracking, same wrapping, same zero padding. The
         * typed half is rendered invisible rather than skipped, so the
         * suggestion starts where the caret is however the line has wrapped.
         */}
        <div
          aria-hidden
          className="text-muted-foreground pointer-events-none col-start-1 row-start-1 px-0 py-0 text-[22px] leading-[2.23] tracking-[-0.01em] break-words whitespace-pre-wrap"
        >
          <span className="invisible">{value}</span>
          {completion}
          {/* Holds the last line open when the text ends on a newline. */}
          {"​"}
        </div>

        <Textarea
          ref={field}
          value={value}
          onChange={(event) => {
            const typed = event.target.value
            /*
             * `$$` swaps itself for the next worked example and leaves the
             * caret after it, so the box reads as if the whole thing had been
             * typed. The ghost is stood down for that keystroke rather than
             * left to complete a query that is already complete; the next
             * character typed brings it back.
             */
            const at = typed.indexOf(trigger)
            if (at !== -1) {
              const example = nextExample()
              const end = at + example.length
              setDismissed(true)
              setCaret(end)
              onChange(typed.slice(0, at) + example + typed.slice(at + trigger.length))
              requestAnimationFrame(() => field.current?.setSelectionRange(end, end))
              return
            }
            setDismissed(false)
            setCaret(event.target.selectionStart ?? typed.length)
            onChange(typed)
          }}
          onSelect={(event) => setCaret(event.currentTarget.selectionStart ?? 0)}
          onKeyDown={(event) => {
            // Taking the suggestion. Right Arrow only at the very end of the
            // text, where it has nowhere else to go.
            if (completion.length > 0 && (event.key === "Tab" || (event.key === "ArrowRight" && !event.shiftKey))) {
              event.preventDefault()
              accept()
              return
            }
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault()
              onSubmit()
              return
            }
            if (event.key === "Escape") {
              if (completion.length > 0) {
                event.preventDefault()
                setDismissed(true)
                return
              }
              onCancel?.()
            }
          }}
          /*
           * Kept, unlike the other placeholders that went. This field has no
           * border, no label and no icon — at 22px in a card it is indis-
           * tinguishable from empty space until something is in it. The
           * placeholder is the only thing naming the one control the whole
           * direction rests on.
           */
          placeholder="Describe the drugs you're looking for"
          spellCheck={false}
          aria-label="Describe the drugs you're looking for"
          className="col-start-1 row-start-1 min-h-[2.23em] resize-none rounded-none border-0 bg-transparent px-0 py-0 text-[22px] leading-[2.23] tracking-[-0.01em] shadow-none focus-visible:border-0 focus-visible:ring-0 md:text-[22px]"
        />
      </div>

      {failure ? <Failure failure={failure} onSuggestion={onSuggestion} /> : null}

      {showSuggestions ? (
        <div className="mt-4">
          <div className="flex flex-col items-start gap-1">
            {suggestedQueries.map((query) => (
              <button
                key={query}
                type="button"
                onClick={() => onChange(query)}
                className="text-foreground/80 hover:bg-accent hover:text-foreground group -mx-1.5 flex items-center gap-2 rounded-md px-1.5 py-1 text-left text-[13px] transition-colors"
              >
                <ArrowRightIcon className="text-muted-foreground group-hover:text-foreground size-3.5 shrink-0" />
                {query}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-4 flex items-center gap-2">
        {showActions ? (
          <>
            <Button size="sm" onClick={onSubmit} disabled={value.trim().length === 0}>
              Resolve
              <CornerDownLeftIcon />
            </Button>
            {onCancel ? (
              <Button size="sm" variant="ghost" onClick={onCancel} className="text-muted-foreground">
                Cancel
              </Button>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  )
}

/**
 * The honest failure. Nothing was understood, so nothing is produced — the one
 * outcome this direction cannot survive is a confidently wrong query, and a
 * screener that guesses at an unreadable request is exactly that.
 *
 * It says which words it could not place, offers the nearest thing it does
 * know rather than applying it, and lists what it can read at all.
 */
function Failure({
  failure,
  onSuggestion,
}: {
  failure: Resolution
  onSuggestion: (phrase: string, term: string) => void
}) {
  return (
    <div className="border-negative-border bg-negative mt-4 rounded-lg border p-3.5">
      <p className="flex items-center gap-2 text-[13px] font-medium">
        <TriangleAlertIcon className="text-negative-ink size-3.5" />
        Nothing in that maps to a condition, so no query was built.
      </p>

      {failure.unplaced.length > 0 ? (
        <p className="text-muted-foreground mt-2 text-xs">
          Could not place{" "}
          {failure.unplaced.map((phrase, i) => (
            <React.Fragment key={phrase}>
              {i > 0 ? ", " : ""}
              <span className="text-foreground/80">&ldquo;{phrase}&rdquo;</span>
            </React.Fragment>
          ))}
          .
        </p>
      ) : null}

      {failure.notes.map((note) => (
        <p key={`${note.phrase}:${note.text}`} className="text-muted-foreground mt-2 text-xs">
          &ldquo;{note.phrase}&rdquo; — {note.text}
        </p>
      ))}

      {failure.suggestions.length > 0 ? (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="text-muted-foreground text-xs">Did you mean</span>
          {failure.suggestions.map((suggestion) => (
            <button
              key={suggestion.value}
              type="button"
              onClick={() => onSuggestion(suggestion.phrase, suggestion.value)}
              className="bg-surface-panel border-border hover:border-edge hover:bg-accent hover:text-foreground inline-flex h-6 items-center gap-1.5 rounded-md border px-2 text-xs transition-colors"
            >
              {suggestion.value}
              <span className="text-muted-foreground">{suggestion.attribute}</span>
            </button>
          ))}
        </div>
      ) : null}

      <p className="text-muted-foreground mt-3 text-xs leading-relaxed">
        <span className="text-foreground/70">It can read:</span> {knownAttributes.join(" · ")}
      </p>
    </div>
  )
}
