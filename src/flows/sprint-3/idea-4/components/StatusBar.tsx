"use client"

import {
  CheckIcon,
  HistoryIcon,
  Loader2Icon,
  PanelRightOpenIcon,
  RotateCcwIcon,
  UndoIcon,
  XIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import type { AgentLogEntry } from "@/flows/sprint-3/idea-4/agent"

function seconds(ms: number) {
  return `${(ms / 1000).toFixed(1)}s`
}

const statusWord: Record<AgentLogEntry["status"], string> = {
  applied: "Applied",
  rejected: "Dismissed",
  undone: "Undone",
}

function Dot() {
  return (
    <span aria-hidden className="text-muted-foreground/50 shrink-0">
      ·
    </span>
  )
}

/**
 * The strip along the bottom, in the manner of Zed's status bar: what the agent
 * is doing while it happens, then what it just did, with the result and how
 * long it took. Undo for that last action sits on it, and the full session
 * history is one click away.
 *
 * This is where the direction's answer to AI-editability actually lives. The
 * panel is the request, the grid is the effect, and this line is the receipt —
 * every change attributable, legible in one line, and reversible without
 * hunting for what it touched.
 */
export function StatusBar({
  running,
  entries,
  onUndo,
  panelOpen,
  onOpenPanel,
}: {
  /** Headline of the action currently being applied, if any. */
  running: string | null
  entries: AgentLogEntry[]
  onUndo: (entryId: string) => void
  panelOpen: boolean
  onOpenPanel: () => void
}) {
  const last = entries[0]
  // The most recent step that actually changed the grid — not simply the most
  // recent line. Dismissing a proposal should not put the previous change out
  // of reach of the undo.
  const undoable = entries.find((entry) => entry.status === "applied") ?? null
  const applied = entries.filter((entry) => entry.status === "applied").length

  return (
    <div className="bg-muted/40 flex h-8 shrink-0 items-center gap-2 border-t px-3 text-[11px]">
      {running ? (
        <>
          <Loader2Icon className="text-muted-foreground size-3 shrink-0 animate-spin" />
          <span className="text-muted-foreground min-w-0 truncate">
            Applying <span className="text-foreground">{running}</span>…
          </span>
        </>
      ) : last ? (
        <>
          {last.status === "applied" ? (
            <CheckIcon className="size-3 shrink-0" />
          ) : last.status === "undone" ? (
            <RotateCcwIcon className="text-muted-foreground size-3 shrink-0" />
          ) : (
            <XIcon className="text-muted-foreground size-3 shrink-0" />
          )}
          <span className="flex min-w-0 items-center gap-2">
            <span className="shrink-0 font-medium">{statusWord[last.status]}</span>
            <Dot />
            <span className="text-muted-foreground min-w-0 truncate">{last.headline}</span>
            <Dot />
            {last.status === "rejected" ? (
              <span className="text-muted-foreground shrink-0">nothing changed</span>
            ) : last.status === "undone" ? (
              <span className="text-muted-foreground shrink-0 tabular-nums">
                back to {last.resultCount} drugs
              </span>
            ) : (
              <>
                <span className="text-muted-foreground shrink-0 tabular-nums">
                  {last.resultCount} drugs
                </span>
                <Dot />
                <span className="text-muted-foreground shrink-0 tabular-nums">
                  {seconds(last.durationMs)}
                </span>
              </>
            )}
          </span>
        </>
      ) : (
        <span className="text-muted-foreground min-w-0 truncate">
          The assistant has not changed anything yet. Every change it makes is logged here.
        </span>
      )}

      <Separator orientation="vertical" className="h-3.5 shrink-0" />

      <div className="flex shrink-0 items-center gap-1">
        <Button
          variant="ghost"
          size="xs"
          disabled={!undoable || Boolean(running)}
          onClick={() => undoable && onUndo(undoable.id)}
        >
          <UndoIcon />
          Undo
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="xs">
              <HistoryIcon />
              History
              <span className="text-muted-foreground tabular-nums">{entries.length}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" side="top" className="w-[340px] gap-0 p-0">
            <div className="flex items-baseline justify-between px-3 pt-2.5 pb-2">
              <span className="text-[12.5px] font-medium">Assistant history</span>
              <span className="text-muted-foreground text-[11px] tabular-nums">
                {applied} applied of {entries.length}
              </span>
            </div>
            <Separator />
            <div className="max-h-[320px] overflow-y-auto p-1.5">
              {entries.length === 0 ? (
                <p className="text-muted-foreground px-2 py-3 text-[12px]">
                  Nothing yet. Ask the assistant for a change and it will be listed here.
                </p>
              ) : null}
              {entries.map((entry) => (
                <div key={entry.id} className="hover:bg-muted rounded-md px-2 py-1.5">
                  <div className="flex items-baseline gap-2">
                    <span
                      className={cn(
                        "shrink-0 text-[10px] font-medium tracking-[0.06em] uppercase",
                        entry.status === "applied"
                          ? "text-foreground"
                          : "text-muted-foreground/70",
                      )}
                    >
                      {statusWord[entry.status]}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[12px]">{entry.headline}</span>
                    <span className="text-muted-foreground shrink-0 text-[10px] tabular-nums">
                      {entry.at}
                    </span>
                  </div>
                  <p className="text-muted-foreground mt-0.5 text-[11px] leading-[1.4]">
                    {entry.changes.join(" · ")}
                  </p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <p className="text-muted-foreground/70 text-[10px] tabular-nums">
                      {entry.status === "rejected"
                        ? "Not applied"
                        : entry.status === "undone"
                          ? `Reverted · back to ${entry.resultCount} drugs`
                          : `${entry.resultCount} drugs · ${seconds(entry.durationMs)}`}
                    </p>
                    {undoable?.id === entry.id ? (
                      <button
                        type="button"
                        onClick={() => onUndo(entry.id)}
                        className="text-muted-foreground hover:text-foreground text-[10px] underline-offset-2 hover:underline"
                      >
                        Undo this
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
            <Separator />
            <p className="text-muted-foreground px-3 py-2 text-[10.5px] leading-[1.45]">
              Undo restores the grid to the state it was in before the most recent applied step,
              including any column or sort changes you made by hand since.
            </p>
          </PopoverContent>
        </Popover>

        {panelOpen ? null : (
          <>
            <Separator orientation="vertical" className="mx-0.5 h-3.5" />
            <Button variant="ghost" size="xs" onClick={onOpenPanel}>
              <PanelRightOpenIcon />
              Assistant
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
