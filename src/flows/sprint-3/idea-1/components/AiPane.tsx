import { ArrowRightIcon, SearchIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { PaneHeading } from "@/flows/sprint-3/idea-1/components/FilterModal"
import { aiSuggestions } from "@/flows/sprint-3/idea-1/data"

/**
 * Left pane of the AI tab. `transcript` swaps the suggestion chips for the
 * exchange once a query has been parsed.
 */
export function AiPane({
  query,
  transcript,
}: {
  /** Text sitting in the composer. */
  query?: string
  transcript?: { user: string; assistant: string; time: string }
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PaneHeading title="Drug Search" subtitle="Start typing to create a filter" />

      <div className="flex min-h-0 flex-1 flex-col justify-end gap-6 px-6 pb-6">
        {transcript ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col items-end gap-1">
              <p className="bg-primary/10 text-primary max-w-[340px] rounded-2xl px-4 py-3 text-sm">
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
              <span key={suggestion} className="bg-muted rounded-full px-4 py-2 text-sm">
                {suggestion}
              </span>
            ))}
          </div>
        )}

        <div
          className={cn(
            "bg-background flex items-center gap-3 rounded-2xl border px-4 shadow-xs",
            query ? "items-end py-3" : "py-2.5",
          )}
        >
          <SearchIcon className="text-muted-foreground mb-2 size-4 shrink-0 self-end" />
          <p className={cn("flex-1 text-sm", query ? "" : "text-muted-foreground")}>
            {query ?? "Ask anything to create a filter"}
          </p>
          <span className="bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-full">
            <ArrowRightIcon className="size-4" />
          </span>
        </div>
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
