"use client"

import * as React from "react"
import { CheckIcon, ChevronDownIcon, PlusIcon, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { Clause } from "@/flows/sprint-3/idea-3/data"
import { clauseTemplates } from "@/flows/sprint-3/idea-3/data"
import { clauseTerms, sentenceLayout } from "@/flows/sprint-3/idea-3/grammar"

export interface SentenceHandlers {
  onToggleValue: (clauseId: string, value: string) => void
  onSetOperator: (clauseId: string, word: string) => void
  onSetJoin: (clauseId: string, join: "or" | "and") => void
  onRemoveClause: (clauseId: string) => void
  onAddClause: (clauseId: string) => void
}

/* -------------------------------------------------------------------------- */
/* Parts                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * The value list behind a pill: every value of the attribute, ticked or not,
 * with its count, and the way to drop the condition altogether.
 *
 * Exported because the `Filters` view opens the identical menu. The two views
 * are the same query, so they have to be the same controls — a filter surface
 * that could do something the sentence could not would make them two screens
 * rather than two readings.
 */
export function ValueMenu({
  clause,
  onToggleValue,
  onRemoveClause,
  onClose,
}: {
  clause: Clause
  onToggleValue: SentenceHandlers["onToggleValue"]
  onRemoveClause: SentenceHandlers["onRemoveClause"]
  onClose: () => void
}) {
  return (
    <Command>
      <div className="border-b px-3 py-2">
        <p className="text-muted-foreground text-[10px] font-medium tracking-[0.08em] uppercase">
          {clause.attribute}
        </p>
      </div>
      <CommandInput placeholder={`Search ${clause.attribute.toLowerCase()}…`} />
      <CommandList className="max-h-[260px]">
        <CommandEmpty>No values.</CommandEmpty>
        <CommandGroup>
          {clause.options.map((o) => {
            const selected = clause.selected.includes(o.value)
            return (
              <CommandItem
                key={o.value}
                value={o.value}
                onSelect={() => onToggleValue(clause.id, o.value)}
                className="gap-2"
              >
                <span
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center rounded-[4px] border",
                    selected ? "bg-primary border-primary text-primary-foreground" : "border-border",
                  )}
                >
                  {selected ? <CheckIcon className="size-3" /> : null}
                </span>
                <span className="truncate">{o.value}</span>
                <span className="text-muted-foreground ml-auto text-xs tabular-nums">
                  {o.count.toLocaleString()}
                </span>
              </CommandItem>
            )
          })}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup>
          <CommandItem
            onSelect={() => {
              onClose()
              onRemoveClause(clause.id)
            }}
            className="text-muted-foreground gap-2"
          >
            <XIcon className="size-3.5" />
            Remove this condition
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  )
}

/**
 * A value. Filled, so it reads as an object you can grab — principle 1, the
 * pill is the primary control. Its dropdown names the attribute, because the
 * sentence deliberately does not.
 */
function ValuePill({
  clause,
  value,
  onToggleValue,
  onRemoveClause,
}: {
  clause: Clause
  value: string
  onToggleValue: SentenceHandlers["onToggleValue"]
  onRemoveClause: SentenceHandlers["onRemoveClause"]
}) {
  const [open, setOpen] = React.useState(false)
  const option = clause.options.find((o) => o.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "border-border/80 bg-secondary text-foreground hover:bg-accent focus-visible:ring-ring/50 -mx-0.5 inline-flex items-center gap-1 rounded-md border px-1.5 align-baseline font-medium transition-colors outline-none focus-visible:ring-3",
            open && "bg-accent ring-ring/40 ring-3",
          )}
        >
          {option?.term ?? value}
          <ChevronDownIcon className="text-muted-foreground size-[0.55em] opacity-70" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[320px] p-0 text-sm">
        <ValueMenu
          clause={clause}
          onToggleValue={onToggleValue}
          onRemoveClause={onRemoveClause}
          onClose={() => setOpen(false)}
        />
      </PopoverContent>
    </Popover>
  )
}

/**
 * A logic word. Dotted-underlined rather than filled, so the sentence has two
 * legible classes of control: values you pick, operators you flip. This is
 * where the Boolean lives — no AND/OR/NOT radio anywhere on the screen.
 */
export function OperatorWord({
  word,
  options,
  onSelect,
  label,
  className,
  chevron,
}: {
  word: string
  options: { word: string; hint: string }[]
  onSelect: (word: string) => void
  label: string
  /** Overrides the sentence styling when the same control is drawn as a pill. */
  className?: string
  /** Explicit affordance, for the pill rendering that has no dotted underline. */
  chevron?: boolean
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "text-muted-foreground hover:text-foreground decoration-muted-foreground/50 hover:decoration-foreground focus-visible:ring-ring/50 aria-expanded:text-foreground aria-expanded:bg-accent -mx-0.5 rounded-md px-0.5 underline decoration-dotted underline-offset-[5px] transition-colors outline-none focus-visible:ring-3",
            className,
          )}
        >
          {word}
          {chevron ? <ChevronDownIcon className="text-muted-foreground size-3" /> : null}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[280px]">
        <DropdownMenuLabel className="text-muted-foreground text-[10px] font-medium tracking-[0.08em] uppercase">
          {label}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={word} onValueChange={onSelect}>
          {options.map((o) => (
            <DropdownMenuRadioItem key={o.word} value={o.word} className="items-start">
              <span className="flex flex-col gap-0.5">
                <span className="font-medium">{o.word}</span>
                <span className="text-muted-foreground text-xs">{o.hint}</span>
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/* -------------------------------------------------------------------------- */
/* Clause                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * One clause, and the whole of the wrapping rule: the clause is the atomic
 * unit. `whitespace-nowrap` means a condition — operator, values, joining
 * words, its trailing comma — never splits across a line, so the only break
 * opportunities in the sentence are the gaps *between* conditions. At six or
 * seven clauses the paragraph reflows one condition at a time and no line ever
 * opens on a stray comma or a dangling `or`.
 *
 * Hovering lights the whole clause and offers a dismiss, so a long sentence
 * stays reversible one condition at a time rather than only by retyping.
 */
function ClauseSpan({
  clause,
  handlers,
  removable,
  punctuation,
}: {
  clause: Clause
  handlers: SentenceHandlers
  removable: boolean
  /** Trailing prose kept inside the nowrap unit, e.g. `drugs` or a comma. */
  punctuation?: string
}) {
  const operator = clause.operator
  const selected = clauseTerms(clause)

  return (
    <span className="group/clause hover:bg-muted hover:ring-border relative -mx-1 rounded-md px-1 whitespace-nowrap transition-colors hover:ring-1">
      {operator ? (
        <>
          <OperatorWord
            word={operator.selected}
            options={operator.options}
            label={clause.attribute}
            onSelect={(word) => handlers.onSetOperator(clause.id, word)}
          />
          {" "}
        </>
      ) : null}

      {selected.map((option, i) => (
        <React.Fragment key={option.value}>
          {i > 0 ? (
            <>
              {" "}
              <OperatorWord
                word={clause.join}
                options={[
                  { word: "or", hint: "Either value matches" },
                  { word: "and", hint: "Both values must match" },
                ]}
                label={`${clause.attribute} — between values`}
                onSelect={(word) => handlers.onSetJoin(clause.id, word as "or" | "and")}
              />{" "}
            </>
          ) : null}
          <ValuePill
            clause={clause}
            value={option.value}
            onToggleValue={handlers.onToggleValue}
            onRemoveClause={handlers.onRemoveClause}
          />
        </React.Fragment>
      ))}

      {punctuation ? <span>{punctuation}</span> : null}

      {removable ? (
        <button
          type="button"
          aria-label={`Remove ${clause.attribute} condition`}
          onClick={() => handlers.onRemoveClause(clause.id)}
          // Absolutely placed, in the leading above the clause: the dismiss
          // must not take inline space, or hovering a condition would reflow
          // the whole sentence under the pointer.
          className="text-muted-foreground hover:text-foreground hover:border-foreground/30 bg-background absolute -top-2.5 -right-1 z-10 flex size-4 items-center justify-center rounded-full border opacity-0 transition-opacity group-hover/clause:opacity-100 focus-visible:opacity-100"
        >
          <XIcon className="size-2.5" />
        </button>
      ) : null}
    </span>
  )
}

/* -------------------------------------------------------------------------- */
/* Sentence                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * `+ condition`. Shared with the `Filters` view for the same reason the value
 * menu is: whatever one view can add, the other has to be able to add too.
 */
export function AddCondition({
  clauses,
  onAddClause,
  className,
}: {
  clauses: Clause[]
  onAddClause: SentenceHandlers["onAddClause"]
  className?: string
}) {
  const used = new Set(clauses.map((c) => c.id))
  // Every attribute the sentence can hold, not only the three the worked
  // example left over — a typed query can land anywhere in the vocabulary, so
  // what it can be extended with has to be the whole of it.
  const available = clauseTemplates.filter((c) => !used.has(c.id))
  if (available.length === 0) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn("text-muted-foreground gap-1 px-1.5 text-[13px]", className)}
        >
          <PlusIcon className="size-3.5" />
          condition
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[260px]">
        <DropdownMenuLabel className="text-muted-foreground text-[10px] font-medium tracking-[0.08em] uppercase">
          Add to the query
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {available.map((clause) => (
          <DropdownMenuItem key={clause.id} onSelect={() => onAddClause(clause.id)}>
            {clause.attribute}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function QuerySentence({
  clauses,
  handlers,
}: {
  clauses: Clause[]
  handlers: SentenceHandlers
}) {
  // Punctuation belongs to the clause that ends, not the one that starts, and
  // rides inside its nowrap unit — otherwise a wrap drops a comma to the head
  // of the next line. The rules live in `grammar`, so the prose that
  // `edit as text` hands back is built from the same ones.
  const { prefix, pieces } = sentenceLayout(clauses)

  return (
    <p className="max-w-[74ch] text-[22px] leading-[2.05] font-normal tracking-[-0.01em]">
      {prefix ? <span>{prefix}</span> : null}
      {pieces.map(({ clause, conjunction, punctuation }, i) => (
        <React.Fragment key={clause.id}>
          {i > 0 ? <span> </span> : null}
          {conjunction ? <span>and </span> : null}
          <ClauseSpan
            clause={clause}
            handlers={handlers}
            removable={clauses.length > 1}
            punctuation={punctuation}
          />
        </React.Fragment>
      ))}

      {" "}
      <AddCondition
        clauses={clauses}
        onAddClause={handlers.onAddClause}
        className="-translate-y-[0.1em] align-middle"
      />
    </p>
  )
}
