import { ArrowRightIcon, SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motion } from "@/components/prototype/motion"
import { PaneHeading } from "@/flows/sprint-3/idea-1/components/FilterModal"
import { aiParses } from "@/flows/sprint-3/idea-1/data"
import type { Transcript } from "@/flows/sprint-3/idea-1/state"

/**
 * Left pane of the AI tab. `transcript` swaps the suggestion chips for the
 * exchange once a query has been submitted; `pending` holds the query while
 * it resolves.
 *
 * Every chip has a canned resolution and free text is matched to the nearest
 * one — the parsing is not what is being tested here, the shape of the surface
 * is.
 */
export function AiPane({
  query,
  transcript,
  pending,
  onQuery,
  onSubmit,
}: {
  /** Text sitting in the composer. */
  query: string
  transcript?: Transcript | null
  /** A submitted query still resolving. */
  pending?: string | null
  onQuery: (query: string) => void
  onSubmit: () => void
}) {
  const filled = query.trim().length > 0
  const busy = Boolean(pending)

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PaneHeading title="Drug Search" />

      <div className="flex min-h-0 flex-1 flex-col justify-end gap-6 px-6 pb-6">
        {pending ? (
          <div className="flex flex-col gap-4 overflow-y-auto">
            <UserBubble text={pending} />
            <p role="status" aria-label="Resolving your query" className="flex items-center gap-1 py-1">
              {[0, 1, 2].map((dot) => (
                <span
                  key={dot}
                  className="bg-muted-foreground/60 size-1.5 animate-pulse rounded-full motion-reduce:animate-none"
                  style={{ animationDelay: `${dot * motion.stagger * 2}ms` }}
                />
              ))}
            </p>
          </div>
        ) : transcript ? (
          <div className="flex flex-col gap-4 overflow-y-auto">
            <UserBubble text={transcript.user} time={transcript.time} />
            <div className="flex flex-col items-start gap-1">
              <p className="max-w-[380px] text-sm">{transcript.assistant}</p>
              <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
                <CheckMark /> Filters updated
              </p>
              <span className="text-muted-foreground text-xs">{transcript.time}</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {aiParses.map((parse) => (
              <button
                key={parse.id}
                type="button"
                onClick={() => onQuery(parse.query)}
                className="bg-muted hover:bg-accent rounded-full px-4 py-2 text-sm transition-colors"
              >
                {parse.suggestion}
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={(event) => {
            event.preventDefault()
            if (filled && !busy) onSubmit()
          }}
          className={cn(
            "bg-background flex gap-3 rounded-2xl border px-4",
            filled ? "items-end py-3" : "items-center py-2.5",
          )}
        >
          <SearchIcon className="text-muted-foreground mb-2 size-4 shrink-0 self-end" />
          <textarea
            value={query}
            onChange={(event) => onQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault()
                if (filled && !busy) onSubmit()
              }
            }}
            rows={1}
            placeholder="Ask anything"
            aria-label="Ask anything to create a filter"
            className="placeholder:text-muted-foreground field-sizing-content max-h-32 min-h-8 flex-1 resize-none self-end bg-transparent py-1.5 text-sm leading-5 outline-none"
          />
          <Button
            type="submit"
            size="icon-sm"
            aria-label="Create filters from this query"
            disabled={!filled || busy}
            className="shrink-0 rounded-full"
          >
            <ArrowRightIcon />
          </Button>
        </form>
      </div>
    </div>
  )
}

function UserBubble({ text, time }: { text: string; time?: string }) {
  return (
    <div className="flex flex-col items-end gap-1">
      <p className="bg-muted text-foreground max-w-[340px] rounded-2xl px-4 py-3 text-sm">{text}</p>
      {time ? <span className="text-muted-foreground text-xs">{time}</span> : null}
    </div>
  )
}

function CheckMark() {
  return (
    <svg viewBox="0 0 12 12" className="size-3.5" aria-hidden>
      <path d="M2 6.5 L4.6 9 L10 3" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}
