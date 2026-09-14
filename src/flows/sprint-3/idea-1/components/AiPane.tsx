import { ArrowRightIcon, SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { PaneHeading } from "@/flows/sprint-3/idea-1/components/FilterModal"
import { aiSuggestions } from "@/flows/sprint-3/idea-1/data"
import type { Transcript } from "@/flows/sprint-3/idea-1/state"

/**
 * Left pane of the AI tab. `transcript` swaps the suggestion chips for the
 * exchange once a query has been submitted.
 *
 * One canned resolution, matched to the worked example in the data — the
 * parsing is not what is being tested here, the shape of the surface is.
 */
export function AiPane({
  query,
  transcript,
  onQuery,
  onSubmit,
}: {
  /** Text sitting in the composer. */
  query: string
  transcript?: Transcript | null
  onQuery: (query: string) => void
  onSubmit: () => void
}) {
  const filled = query.trim().length > 0

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PaneHeading title="Drug Search" />

      <div className="flex min-h-0 flex-1 flex-col justify-end gap-6 px-6 pb-6">
        {transcript ? (
          <div className="flex flex-col gap-4 overflow-y-auto">
            <div className="flex flex-col items-end gap-1">
              <p className="bg-muted text-foreground max-w-[340px] rounded-2xl px-4 py-3 text-sm">
                {transcript.user}
              </p>
              <span className="text-muted-foreground text-xs">{transcript.time}</span>
            </div>
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
            {aiSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => onQuery(suggestion)}
                className="bg-muted hover:bg-accent rounded-full px-4 py-2 text-sm transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={(event) => {
            event.preventDefault()
            if (filled) onSubmit()
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
                if (filled) onSubmit()
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
            disabled={!filled}
            className="shrink-0 rounded-full"
          >
            <ArrowRightIcon />
          </Button>
        </form>
      </div>
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
