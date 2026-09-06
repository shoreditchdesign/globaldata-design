"use client"

import * as React from "react"
import { ArrowRightIcon, CornerDownLeftIcon, TriangleAlertIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { suggestedQueries } from "@/flows/sprint-3/idea-3/data"
import { knownAttributes, type Resolution } from "@/flows/sprint-3/idea-3/resolve"

/**
 * Where the query is typed — the cold start, and the far end of `edit as text`.
 *
 * It is the same slot, at the same size, in the same box as the sentence it
 * becomes. That is the argument: the reviewer is not moving between a search
 * mode and a filter mode, they are looking at one line of English that is
 * sometimes raw and sometimes structured.
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
  showSuggestions?: boolean
}) {
  const field = React.useRef<HTMLTextAreaElement>(null)

  React.useEffect(() => {
    const node = field.current
    if (!node) return
    node.focus()
    node.setSelectionRange(node.value.length, node.value.length)
    // Mount only. Re-running would fight the caret while the reviewer types.
  }, [])

  return (
    <div>
      {note ? <p className="text-muted-foreground mb-2 text-xs">{note}</p> : null}

      <Textarea
        ref={field}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault()
            onSubmit()
          }
          if (event.key === "Escape" && onCancel) onCancel()
        }}
        placeholder="Describe the drugs you're looking for"
        spellCheck={false}
        aria-label="Describe the drugs you're looking for"
        className="min-h-[2.05em] resize-none rounded-none border-0 px-0 py-0 text-[22px] leading-[2.05] tracking-[-0.01em] shadow-none focus-visible:border-0 focus-visible:ring-0 md:text-[22px]"
      />

      {failure ? <Failure failure={failure} onSuggestion={onSuggestion} /> : null}

      {showSuggestions ? (
        <div className="mt-4">
          <p className="text-muted-foreground mb-2 text-[10px] font-medium tracking-[0.08em] uppercase">
            Or start from one of these
          </p>
          <div className="flex flex-col items-start gap-1">
            {suggestedQueries.map((query) => (
              <button
                key={query}
                type="button"
                onClick={() => onChange(query)}
                className="text-foreground/80 hover:bg-muted hover:text-foreground -mx-1.5 flex items-center gap-2 rounded-md px-1.5 py-1 text-left text-[13px] transition-colors"
              >
                <ArrowRightIcon className="text-muted-foreground size-3.5 shrink-0" />
                {query}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-4 flex items-center gap-2">
        <Button size="sm" onClick={onSubmit} disabled={value.trim().length === 0}>
          Resolve
          <CornerDownLeftIcon />
        </Button>
        {onCancel ? (
          <Button size="sm" variant="ghost" onClick={onCancel} className="text-muted-foreground">
            Cancel
          </Button>
        ) : null}
        <p className="text-muted-foreground ml-auto text-xs">
          Plain English, however loose. Enter to resolve.
        </p>
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
    <div className="border-border bg-muted/40 mt-4 rounded-lg border p-3.5">
      <p className="flex items-center gap-2 text-[13px] font-medium">
        <TriangleAlertIcon className="text-muted-foreground size-3.5" />
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
        <p key={note} className="text-muted-foreground mt-2 text-xs">
          {note}
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
              className="bg-background hover:bg-accent inline-flex h-6 items-center gap-1.5 rounded-md border px-2 text-xs transition-colors"
            >
              {suggestion.value}
              <span className="text-muted-foreground">{suggestion.attribute}</span>
            </button>
          ))}
        </div>
      ) : null}

      <p className="text-muted-foreground mt-3 text-xs leading-relaxed">
        <span className="text-foreground/70">It can read:</span> {knownAttributes.join(" · ")} — by
        value, abbreviation or plural, with <span className="text-foreground/70">not</span> or{" "}
        <span className="text-foreground/70">excluding</span> in front of anything to drop it.
      </p>
    </div>
  )
}
