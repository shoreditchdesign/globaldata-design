"use client"

import * as React from "react"
import { ChevronDownIcon, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { FilterPill } from "@/components/prototype/FilterPill"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { attributeDefs, sample, type Condition } from "@/flows/sprint-4/idea-1/data"
import { gateOf, type Gate } from "@/flows/sprint-4/idea-1/state"
import type { QueryHandlers } from "@/flows/sprint-4/idea-1/components/QuerySentence"

/**
 * An operator, as a pill with a dropdown. Idea 1's shape; `NOT` takes the
 * negation tone so the node that drops rows cannot be mistaken for one that
 * keeps them.
 */
function OperatorPill<T extends string>({
  value,
  options,
  label,
  onChange,
}: {
  value: T
  options: T[]
  label: string
  onChange: (value: T) => void
}) {
  const negated = value === "NOT" || value === "OR NOT"
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`${label}, currently ${value}`}
        className={cn(
          "inline-flex h-6 items-center gap-1 rounded-full border px-2 text-[11px] font-medium tracking-[0.08em] transition-colors",
          negated
            ? "bg-negative border-negative-border text-negative-ink hover:border-negative-ink/40"
            : "text-muted-foreground bg-surface-panel border-border hover:text-foreground hover:bg-accent",
        )}
      >
        {value}
        <ChevronDownIcon className="size-3" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="min-w-24">
        {options.map((option) => (
          <DropdownMenuItem key={option} onSelect={() => onChange(option)}>
            {option}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** The wire between two nodes. */
function Wire() {
  return <span aria-hidden className="bg-edge h-2.5 w-px" />
}

/**
 * One condition as a node: its attribute, its values as chips with the join
 * between them, and how many drugs are still in the set once it has run.
 */
function GroupNode({
  condition,
  remaining,
  handlers,
}: {
  condition: Condition
  remaining: number
  handlers: QueryHandlers
}) {
  const negated = condition.mode === "is not"
  const subject = attributeDefs[condition.attribute]?.subject ?? condition.attribute

  return (
    <div className="bg-surface-panel border-border w-full rounded-lg border p-3">
      <div className="mb-2 flex items-baseline gap-2">
        <button
          type="button"
          onClick={() => handlers.onShowInColumns(condition.attribute)}
          className="text-muted-foreground hover:text-foreground min-w-0 truncate text-left text-[10px] font-medium tracking-[0.08em] uppercase"
        >
          {subject}
        </button>
        <span
          className={cn(
            "ml-auto shrink-0 text-[12px] tabular-nums",
            remaining === 0 ? "text-muted-foreground" : "text-foreground",
          )}
        >
          {remaining.toLocaleString("en-GB")} left
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {condition.values.map((value, i) => (
          <React.Fragment key={value}>
            {i > 0 ? (
              <OperatorPill
                value={condition.join === "and" ? "AND" : "OR"}
                options={["OR", "AND"]}
                label={`Between ${subject.toLowerCase()} values`}
                onChange={(next) =>
                  handlers.onSetJoin(condition.attribute, next === "AND" ? "and" : "or")
                }
              />
            ) : null}
            {/* The shared pill owns its own remove button and takes no handler,
                so the removal is caught on the way up, as Idea 1 does. */}
            <span
              className="contents"
              onClick={(event) => {
                if ((event.target as HTMLElement).closest('[data-slot="filter-pill-remove"]')) {
                  handlers.onToggleValue(condition.attribute, value)
                }
              }}
            >
              <FilterPill variant={negated ? "excluded" : "applied"} removeLabel={`Remove ${value}`}>
                <button
                  type="button"
                  onClick={() => handlers.onShowInColumns(condition.attribute, value)}
                  className="max-w-[200px] truncate text-left hover:underline"
                >
                  {value}
                </button>
              </FilterPill>
            </span>
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

/**
 * The logic gate: Idea 1's filter-builder stack, opened as a sidebar on the
 * same query the sentence reads.
 *
 * It starts from the whole sample, and every condition is a node joined to
 * what came before by an operator you can flip. Flipping one here changes the
 * word in the sentence, because it is the same field: `NOT` is a condition set
 * to drop rows, `OR` and `AND` are how a keeping condition meets the rest. The
 * count on each node is the set after that node has run, read top to bottom.
 */
export function LogicGate({
  conditions,
  running,
  handlers,
  onSetGate,
  onClose,
}: {
  conditions: Condition[]
  /** Rows left after each condition, in order. */
  running: number[]
  handlers: QueryHandlers
  onSetGate: (attribute: string, gate: Gate) => void
  onClose: () => void
}) {
  return (
    <aside
      aria-label="Logic gate"
      className="bg-surface-page border-edge flex h-full w-[320px] shrink-0 flex-col border-r"
    >
      <div className="bg-surface-chrome border-edge flex h-11 shrink-0 items-center gap-2 border-b pr-2 pl-4">
        <span className="text-muted-foreground text-[10px] font-medium tracking-[0.08em] uppercase">
          Logic gate
        </span>
        <Button
          size="icon"
          variant="ghost"
          className="text-muted-foreground ml-auto size-7"
          onClick={onClose}
          aria-label="Close the logic gate"
        >
          <XIcon className="size-3.5" />
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="flex flex-col items-center">
          <div className="bg-surface-panel border-border flex w-full items-baseline gap-2 rounded-lg border px-3 py-2.5">
            <span className="text-muted-foreground text-[10px] font-medium tracking-[0.08em] uppercase">
              All drugs
            </span>
            <span className="text-foreground ml-auto text-[12px] tabular-nums">
              {sample.length.toLocaleString("en-GB")} in sample
            </span>
          </div>

          {conditions.length === 0 ? (
            <p className="text-muted-foreground mt-4 text-[13px]">No conditions yet.</p>
          ) : null}

          {conditions.map((condition, i) => (
            <React.Fragment key={condition.attribute}>
              <Wire />
              <OperatorPill<Gate>
                value={gateOf(condition)}
                // `OR` against the whole sample keeps everything, so the first
                // node can only narrow the set or drop from it.
                options={i === 0 ? ["AND", "NOT"] : ["AND", "OR", "NOT", "OR NOT"]}
                label="Operator"
                onChange={(gate) => onSetGate(condition.attribute, gate)}
              />
              <Wire />
              <GroupNode condition={condition} remaining={running[i] ?? 0} handlers={handlers} />
            </React.Fragment>
          ))}
        </div>
      </div>
    </aside>
  )
}
