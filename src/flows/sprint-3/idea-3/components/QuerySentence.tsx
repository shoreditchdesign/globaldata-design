"use client"

import * as React from "react"
import { CheckIcon, ChevronDownIcon, PlusIcon, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { liftClass } from "@/components/prototype/motion"
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
import { clauseMode, clauseTemplates } from "@/flows/sprint-3/idea-3/data"
import { clauseTerms, sentenceLayout } from "@/flows/sprint-3/idea-3/grammar"
import type { OpenPill } from "@/flows/sprint-3/idea-3/state"

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
                    selected ? "bg-brand border-brand text-brand-foreground" : "border-border",
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
  open,
  onOpenChange,
  onToggleValue,
  onRemoveClause,
}: {
  clause: Clause
  value: string
  /** Which pill is open is held above the sentence, so a link can name one. */
  open: boolean
  onOpenChange: (open: boolean) => void
  onToggleValue: SentenceHandlers["onToggleValue"]
  onRemoveClause: SentenceHandlers["onRemoveClause"]
}) {
  const option = clause.options.find((o) => o.value === value)
  const excluded = clauseMode(clause) === "exclude"

  return (
    // The group, so the dismiss can sit beside the trigger rather than inside
    // it — a button cannot hold a button.
    <span className="group/pill relative mr-1 -ml-0.5 inline-flex align-baseline">
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "text-foreground focus-visible:ring-ring/50 inline-flex items-center gap-1 rounded-md border px-1.5 font-medium transition-[background-color,box-shadow] outline-none focus-visible:ring-3",
              // Hover lifts the chip rather than deepening it: a darker blue
              // under the pointer shouted louder than the chip at rest. Keyed
              // to the group so hovering the dismiss keeps the lift.
              excluded
                ? "bg-negative border-negative-border group-hover/pill:shadow-panel"
                : "bg-brand-tint border-brand-border group-hover/pill:shadow-panel",
              // The open pill takes the hover lift rather than a ring, so it
              // cannot be mistaken for focus.
              open && "shadow-panel",
            )}
          >
            {option?.term ?? value}
            <ChevronDownIcon
              className={cn(
                "size-[0.55em] opacity-70 group-focus-within/pill:opacity-0 group-hover/pill:opacity-0",
                liftClass,
                excluded ? "text-negative-ink" : "text-brand-ink",
              )}
            />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[320px] p-0 text-sm">
          <ValueMenu
            clause={clause}
            onToggleValue={onToggleValue}
            onRemoveClause={onRemoveClause}
            onClose={() => onOpenChange(false)}
          />
        </PopoverContent>
      </Popover>
      {/* Laid over the chevron, which fades as this appears: no inline space
          taken, so hovering a value never reflows the sentence. */}
      <button
        type="button"
        aria-label={`Remove ${value}`}
        onClick={() => onToggleValue(clause.id, value)}
        className={cn(
          "focus-visible:ring-ring/50 absolute top-1/2 right-[3px] flex size-[0.8em] -translate-y-1/2 items-center justify-center rounded-sm opacity-0 outline-none group-focus-within/pill:opacity-100 group-hover/pill:opacity-100 focus-visible:opacity-100 focus-visible:ring-2",
          liftClass,
          excluded
            ? "text-negative-ink hover:bg-negative-border"
            : "text-brand-ink hover:bg-brand-border",
        )}
      >
        <XIcon className="size-[0.55em]" />
      </button>
    </span>
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
  negated,
}: {
  word: string
  options: { word: string }[]
  onSelect: (word: string) => void
  label: string
  /** Overrides the sentence styling when the same control is drawn as a pill. */
  className?: string
  /** Explicit affordance, for the pill rendering that has no dotted underline. */
  chevron?: boolean
  /**
   * This word drops rows rather than keeping them. It has to look different
   * from one that keeps them, or the whole Boolean is carried by three
   * characters of English in the same grey as everything around it.
   */
  negated?: boolean
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "focus-visible:ring-ring/50 -mx-0.5 rounded-md px-0.5 underline decoration-dotted underline-offset-[5px] transition-colors outline-none focus-visible:ring-3",
            negated
              ? "text-negative-ink decoration-negative-ink/60 hover:bg-negative aria-expanded:bg-negative font-medium"
              : "text-muted-foreground hover:text-foreground decoration-muted-foreground/50 hover:decoration-foreground aria-expanded:text-foreground aria-expanded:bg-accent",
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
            <DropdownMenuRadioItem key={o.word} value={o.word}>
              <span className="font-medium">{o.word}</span>
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
  openPill,
  onPillOpenChange,
  noun,
  comma,
}: {
  clause: Clause
  handlers: SentenceHandlers
  removable: boolean
  openPill: OpenPill | null
  onPillOpenChange: (pill: OpenPill | null) => void
  /** ` drugs`, when the adjectival run ends here. Kept inside the nowrap unit. */
  noun?: string
  /** A trailing comma, also kept inside the nowrap unit. */
  comma?: string
}) {
  const operator = clause.operator
  const selected = clauseTerms(clause)

  return (
    <span className="group/clause hover:bg-accent hover:ring-border relative -mx-1 rounded-md px-1 whitespace-nowrap transition-colors hover:ring-1">
      {operator ? (
        <>
          <OperatorWord
            word={operator.selected}
            options={operator.options}
            label={clause.attribute}
            negated={clauseMode(clause) === "exclude"}
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
                  { word: "or" }, { word: "and" },
                ]}
                label={`${clause.attribute} — between values`}
                onSelect={(word) => handlers.onSetJoin(clause.id, word as "or" | "and")}
              />{" "}
            </>
          ) : null}
          <ValuePill
            clause={clause}
            value={option.value}
            open={openPill?.clauseId === clause.id && openPill.value === option.value}
            onOpenChange={(next) =>
              onPillOpenChange(next ? { clauseId: clause.id, value: option.value } : null)
            }
            onToggleValue={handlers.onToggleValue}
            onRemoveClause={handlers.onRemoveClause}
          />
        </React.Fragment>
      ))}

      {noun ? <span>{noun}</span> : null}
      {/* Its own margin, so a comma after a chip is not jammed against the next condition. */}
      {comma ? <span className="mr-1">{comma}</span> : null}

      {removable ? (
        <button
          type="button"
          aria-label={`Remove ${clause.attribute} condition`}
          onClick={() => handlers.onRemoveClause(clause.id)}
          // Absolutely placed, in the leading above the clause: the dismiss
          // must not take inline space, or hovering a condition would reflow
          // the whole sentence under the pointer.
          className="text-muted-foreground hover:text-foreground hover:border-edge bg-surface-raised border-border shadow-panel absolute -top-2.5 -right-1 z-10 flex size-4 items-center justify-center rounded-full border opacity-0 transition-opacity group-hover/clause:opacity-100 focus-visible:opacity-100"
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
  openPill,
  onPillOpenChange,
}: {
  clauses: Clause[]
  handlers: SentenceHandlers
  /**
   * The pill whose menu is open, when the screen owns that — which it does so
   * a link can open on one. Left out, the sentence keeps it to itself.
   */
  openPill?: OpenPill | null
  onPillOpenChange?: (pill: OpenPill | null) => void
}) {
  const [localPill, setLocalPill] = React.useState<OpenPill | null>(null)
  const pill = onPillOpenChange ? (openPill ?? null) : localPill
  const setPill = onPillOpenChange ?? setLocalPill

  // Punctuation belongs to the clause that ends, not the one that starts, and
  // rides inside its nowrap unit — otherwise a wrap drops a comma to the head
  // of the next line. The rules live in `grammar`, so the prose that
  // `Edit` hands back is built from the same ones.
  const { prefix, pieces } = sentenceLayout(clauses)

  return (
    <p className="max-w-[74ch] text-[22px] leading-[2.05] font-normal tracking-[-0.01em]">
      {prefix ? <span>{prefix}</span> : null}
      {pieces.map(({ clause, conjunction, noun, comma }, i) => (
        <React.Fragment key={clause.id}>
          {i > 0 ? <span> </span> : null}
          {conjunction ? <span>and </span> : null}
          <ClauseSpan
            clause={clause}
            handlers={handlers}
            removable={clauses.length > 1}
            openPill={pill}
            onPillOpenChange={setPill}
            noun={noun}
            comma={comma}
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
