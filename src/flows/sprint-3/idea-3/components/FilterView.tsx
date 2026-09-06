"use client"

import * as React from "react"
import { PlusIcon, XIcon } from "lucide-react"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { Clause } from "@/flows/sprint-3/idea-3/data"
import {
  AddCondition,
  OperatorWord,
  ValueMenu,
  type SentenceHandlers,
} from "@/flows/sprint-3/idea-3/components/QuerySentence"

/**
 * The same query, rendered the conventional way — one labelled group per
 * attribute, values as chips with counts, the operator as a pill. Not a second
 * representation held alongside the sentence: a swap, in the same slot, of the
 * same object, editable through the same handlers. Sprint 2 asked the user to
 * read a transcript and a builder at once; this asks them to pick one.
 *
 * Everything the sentence can do, this can do, through the identical controls:
 * the `+` opens the same value menu a pill opens, the operator opens the same
 * dropdown an operator word opens, and `+ condition` is the same menu. If one
 * view could express something the other could not, they would be two screens
 * rather than two readings, and the toggle would be lossy.
 *
 * Worth noticing when the two are compared: this rendering takes roughly twice
 * the vertical space to say the same thing.
 */
export function FilterView({
  clauses,
  handlers,
}: {
  clauses: Clause[]
  handlers: SentenceHandlers
}) {
  return (
    <div className="flex flex-wrap items-start gap-x-4 gap-y-3">
      {clauses.map((clause, i) => (
        <React.Fragment key={clause.id}>
          {i > 0 ? (
            <div className="flex flex-col gap-1.5">
              <span className="h-[13px]" aria-hidden />
              <span className="text-muted-foreground/70 flex h-7 items-center text-[11px] font-medium tracking-[0.08em] uppercase">
                and
              </span>
            </div>
          ) : null}

          <div className="flex flex-col gap-1.5">
            <p className="text-muted-foreground text-[10px] leading-[13px] font-medium tracking-[0.08em] uppercase">
              {clause.attribute}
            </p>
            <div className="flex h-7 flex-wrap items-center gap-1.5">
              {clause.operator ? (
                <OperatorWord
                  word={clause.operator.selected}
                  options={clause.operator.options}
                  label={clause.attribute}
                  onSelect={(word) => handlers.onSetOperator(clause.id, word)}
                  chevron
                  className="bg-background hover:bg-muted text-foreground mx-0 inline-flex h-7 items-center gap-1 rounded-md border px-2 text-[13px] font-medium no-underline"
                />
              ) : null}

              {clause.options
                .filter((o) => clause.selected.includes(o.value))
                .map((option, index) => (
                  <React.Fragment key={option.value}>
                    {index > 0 ? (
                      <OperatorWord
                        word={clause.join}
                        options={[
                          { word: "or", hint: "Either value matches" },
                          { word: "and", hint: "Both values must match" },
                        ]}
                        label={`${clause.attribute} — between values`}
                        onSelect={(word) => handlers.onSetJoin(clause.id, word as "or" | "and")}
                        className="mx-0 px-1 text-[11px] font-medium tracking-[0.08em] uppercase no-underline"
                      />
                    ) : null}
                    <span className="bg-secondary inline-flex h-7 items-center gap-1.5 rounded-md py-1 pr-1 pl-2 text-[13px]">
                      {option.value}
                      <span className="text-muted-foreground text-[11px] tabular-nums">
                        {option.count.toLocaleString()}
                      </span>
                      <button
                        type="button"
                        aria-label={`Remove ${option.value}`}
                        onClick={() => handlers.onToggleValue(clause.id, option.value)}
                        className="text-muted-foreground hover:text-foreground hover:bg-background flex size-4 items-center justify-center rounded-sm transition-colors"
                      >
                        <XIcon className="size-3" />
                      </button>
                    </span>
                  </React.Fragment>
                ))}

              <AddValue clause={clause} handlers={handlers} />
            </div>
          </div>
        </React.Fragment>
      ))}

      <div className="flex flex-col gap-1.5">
        <span className="h-[13px]" aria-hidden />
        <AddCondition
          clauses={clauses}
          onAddClause={handlers.onAddClause}
          className="h-7 px-2"
        />
      </div>
    </div>
  )
}

/** The same value menu the pills open, reached from the filter group instead. */
function AddValue({ clause, handlers }: { clause: Clause; handlers: SentenceHandlers }) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Add a ${clause.attribute} value`}
          className="border-border text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring/50 flex size-7 items-center justify-center rounded-md border border-dashed transition-colors outline-none focus-visible:ring-3"
        >
          <PlusIcon className="size-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[320px] p-0 text-sm">
        <ValueMenu
          clause={clause}
          onToggleValue={handlers.onToggleValue}
          onRemoveClause={handlers.onRemoveClause}
          onClose={() => setOpen(false)}
        />
      </PopoverContent>
    </Popover>
  )
}
