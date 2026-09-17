"use client"

import * as React from "react"
import { ChevronDownIcon, PlusIcon, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { liftClass } from "@/components/prototype/motion"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { type Condition } from "@/flows/sprint-4/idea-2/data"
import { operatorWords } from "@/flows/sprint-4/idea-2/grammar"
import {
  AttributeMenu,
  availableAttributes,
  ValueMenu,
  type QueryHandlers,
} from "@/flows/sprint-4/idea-2/components/ValueMenu"

/** A value. Filled, so it reads as an object you can grab. */
function ValuePill({
  condition,
  value,
  handlers,
}: {
  condition: Condition
  value: string
  handlers: QueryHandlers
}) {
  const [open, setOpen] = React.useState(false)
  const excluded = condition.mode === "is not"

  return (
    <span className="group/pill relative mr-1 -ml-0.5 inline-flex align-baseline">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "text-foreground focus-visible:ring-ring/50 inline-flex items-center gap-1 rounded-md border px-1.5 font-medium transition-[background-color,box-shadow] outline-none focus-visible:ring-3",
              excluded
                ? "bg-negative border-negative-border group-hover/pill:shadow-panel"
                : "bg-brand-tint border-brand-border group-hover/pill:shadow-panel",
              open && "shadow-panel",
            )}
          >
            {value}
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
            attribute={condition.attribute}
            condition={condition}
            handlers={handlers}
            onClose={() => setOpen(false)}
          />
        </PopoverContent>
      </Popover>
      {/* Laid over the chevron, which fades as this appears, so hovering a value
          never reflows the sentence. */}
      <button
        type="button"
        aria-label={`Remove ${value}`}
        onClick={() => handlers.onToggleValue(condition.attribute, value)}
        className={cn(
          "focus-visible:ring-ring/50 absolute top-1/2 right-[3px] flex size-[0.8em] -translate-y-1/2 items-center justify-center rounded-sm opacity-0 outline-none group-focus-within/pill:opacity-100 group-hover/pill:opacity-100 focus-visible:opacity-100 focus-visible:ring-2",
          liftClass,
          excluded ? "text-negative-ink hover:bg-negative-border" : "text-brand-ink hover:bg-brand-border",
        )}
      >
        <XIcon className="size-[0.55em]" />
      </button>
    </span>
  )
}

/**
 * A logic word. Dotted-underlined rather than filled, so the sentence has two
 * legible classes of control: values you pick, operators you flip. A word that
 * drops rows is drawn in the negation tone.
 */
function OperatorWord<T extends string>({
  word,
  options,
  onSelect,
  label,
  negated,
}: {
  word: T
  options: { value: T; word: string }[]
  onSelect: (value: T) => void
  label: string
  negated?: boolean
}) {
  const current = options.find((option) => option.value === word)?.word ?? word
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
          )}
        >
          {current}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[240px]">
        <DropdownMenuLabel className="text-muted-foreground text-[10px] font-medium tracking-[0.08em] uppercase">
          {label}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={word} onValueChange={(value) => onSelect(value as T)}>
          {options.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              <span className="font-medium">{option.word}</span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const joinOptions = [
  { value: "or" as const, word: "or" },
  { value: "and" as const, word: "and" },
]

/**
 * One condition, and the whole of the wrapping rule: the clause never splits
 * across a line, so the only break opportunities are the gaps between clauses.
 */
function ClauseSpan({
  condition,
  first,
  comma,
  handlers,
  removable,
}: {
  condition: Condition
  first: boolean
  /** Another condition follows. The comma rides inside this clause's nowrap unit. */
  comma: boolean
  handlers: QueryHandlers
  removable: boolean
}) {
  const words = operatorWords[condition.attribute]
  const negated = condition.mode === "is not"

  return (
    // The join and the clause it introduces wrap as one unit, so a line never
    // ends on a dangling `and` with its condition on the next.
    <span className="whitespace-nowrap">
      {first ? null : (
        <>
          {/* How this condition meets the ones before it — the join the logic
              gate draws as a node. */}
          <OperatorWord
            word={condition.link}
            options={[
              { value: "and", word: "and" },
              { value: "or", word: "or" },
            ]}
            label="Joins the conditions before"
            onSelect={(link) => handlers.onSetLink(condition.attribute, link)}
          />{" "}
        </>
      )}
      <span className="group/clause hover:bg-accent hover:ring-border relative -mx-1 rounded-md px-1 whitespace-nowrap transition-colors hover:ring-1">
        <OperatorWord
          word={condition.mode}
          options={
            words
              ? [
                  { value: "is", word: words.is },
                  { value: "is not", word: words["is not"] },
                ]
              : [
                  { value: "is", word: "is" },
                  { value: "is not", word: "is not" },
                ]
          }
          label={condition.attribute}
          negated={negated}
          onSelect={(mode) => handlers.onSetMode(condition.attribute, mode)}
        />{" "}
        {condition.values.map((value, i) => (
          <React.Fragment key={value}>
            {i > 0 ? (
              <>
                {" "}
                <OperatorWord
                  word={condition.join}
                  options={joinOptions}
                  label={`${condition.attribute} — between values`}
                  onSelect={(join) => handlers.onSetJoin(condition.attribute, join)}
                />{" "}
              </>
            ) : null}
            <ValuePill condition={condition} value={value} handlers={handlers} />
          </React.Fragment>
        ))}
        {comma ? <span className="-ml-0.5">,</span> : null}

        {removable ? (
          <button
            type="button"
            aria-label={`Remove ${condition.attribute} condition`}
            onClick={() => handlers.onRemoveCondition(condition.attribute)}
            className="text-muted-foreground hover:text-foreground hover:border-edge bg-surface-raised border-border shadow-panel absolute -top-2.5 -right-1 z-10 flex size-4 items-center justify-center rounded-full border opacity-0 transition-opacity group-hover/clause:opacity-100 focus-visible:opacity-100"
          >
            <XIcon className="size-2.5" />
          </button>
        ) : null}
      </span>
    </span>
  )
}

/**
 * `+ condition`. Pick an attribute, then its values, counted, in the same
 * popover — the same value list a node on the canvas opens.
 */
function AddCondition({ conditions, handlers }: { conditions: Condition[]; handlers: QueryHandlers }) {
  const [open, setOpen] = React.useState(false)
  const [attribute, setAttribute] = React.useState<string | null>(null)
  const available = availableAttributes(conditions)
  // Kept mounted while open, so picking the last attribute's first value does
  // not pull the popover out from under the reviewer.
  if (available.length === 0 && !open) return null

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setAttribute(null)
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground -translate-y-[0.1em] gap-1 px-1.5 align-middle text-[13px]"
        >
          <PlusIcon className="size-3.5" />
          condition
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[320px] p-0 text-sm">
        {attribute ? (
          <ValueMenu
            attribute={attribute}
            condition={conditions.find((condition) => condition.attribute === attribute)}
            handlers={handlers}
            onClose={() => setOpen(false)}
          />
        ) : (
          <AttributeMenu attributes={available} onPick={setAttribute} />
        )}
      </PopoverContent>
    </Popover>
  )
}

export function QuerySentence({
  conditions,
  handlers,
}: {
  conditions: Condition[]
  handlers: QueryHandlers
}) {
  return (
    <p className="max-w-[74ch] text-[22px] leading-[2.05] font-normal tracking-[-0.01em]">
      <span>Drugs </span>
      {conditions.map((condition, i) => (
        <React.Fragment key={condition.attribute}>
          {/* Outside the clause's nowrap unit: the only place a line may break. */}
          {i > 0 ? " " : null}
          <ClauseSpan
            condition={condition}
            first={i === 0}
            comma={i < conditions.length - 1}
            handlers={handlers}
            removable={conditions.length > 1}
          />
        </React.Fragment>
      ))}{" "}
      <AddCondition conditions={conditions} handlers={handlers} />
    </p>
  )
}
