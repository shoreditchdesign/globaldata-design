"use client"

import * as React from "react"
import { ChevronDownIcon, PlusIcon, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { liftClass } from "@/components/prototype/motion"
import { FilterPill } from "@/components/prototype/FilterPill"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover"
import { attributeDefs, sample, type Condition } from "@/flows/sprint-4/idea-2/data"
import {
  availableAttributes,
  ValueMenu,
  type QueryHandlers,
} from "@/flows/sprint-4/idea-2/components/ValueMenu"
import { gateOf, suggestionsFor, type Gate } from "@/flows/sprint-4/idea-2/state"

const subjectOf = (attribute: string) => attributeDefs[attribute]?.subject ?? attribute

/**
 * An operator, as a pill with a dropdown. Idea 1's shape. The chips of a node
 * that drops rows wear the same blue as any other, so `NOT` carries the
 * exclusion on its own: full-strength text, a heavier weight and a firmer edge
 * than the quiet `AND` and `OR` beside it.
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
            ? "text-foreground bg-surface-panel border-foreground/40 hover:bg-accent font-semibold"
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
function Wire({ dashed }: { dashed?: boolean }) {
  return (
    <span
      aria-hidden
      className={cn("h-3 w-0", dashed ? "border-edge border-l border-dashed" : "border-edge border-l")}
    />
  )
}

/**
 * A suggested condition. It wears the same washed brand as the pills in the
 * sentence, at Austin's direction, and keeps the leading plus so it still reads
 * as something to add. Hover is one calm step within that family.
 */
function SuggestionChip({ attribute, onAdd }: { attribute: string; onAdd: (attribute: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onAdd(attribute)}
      className={cn(
        "bg-brand-tint border-brand-border text-brand-ink hover:border-brand-ink/40 hover:shadow-panel inline-flex h-7 items-center gap-1 rounded-full border pr-2.5 pl-2 text-[12px] font-medium",
        liftClass,
      )}
    >
      <PlusIcon className="size-3.5" />
      {subjectOf(attribute)}
    </button>
  )
}

/** Every other attribute, one menu away. */
function MoreAttributes({ attributes, onAdd }: { attributes: string[]; onAdd: (attribute: string) => void }) {
  if (attributes.length === 0) return null
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground h-7 gap-1 px-2 text-[12px]">
          More
          <ChevronDownIcon className="size-3" />
        </Button>
      </DropdownMenuTrigger>
      {/* No focus handed back to the trigger on close: the value picker is
          opening as this closes, and taking focus away would dismiss it. */}
      <DropdownMenuContent
        align="start"
        className="max-h-80 w-[240px] overflow-y-auto"
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        {attributes.map((attribute) => (
          <DropdownMenuItem key={attribute} onSelect={() => onAdd(attribute)}>
            {subjectOf(attribute)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * One condition as a node: its attribute, its values as chips with the join
 * between them, and how many drugs are still in the set once it has run. A node
 * that has just been added has no values yet, and stays a dashed outline with
 * its picker open until one is chosen.
 */
function GroupNode({
  attribute,
  condition,
  remaining,
  picking,
  onPicking,
  handlers,
}: {
  attribute: string
  condition?: Condition
  remaining?: number
  picking: boolean
  onPicking: (open: boolean) => void
  handlers: QueryHandlers
}) {
  const anchor = React.useRef<HTMLDivElement>(null)
  const subject = subjectOf(attribute)
  const added = picking && !condition

  // A node added from the foot of a long canvas lands below the fold; bring it
  // into view so the picker opens beside it rather than over the nodes above.
  React.useEffect(() => {
    if (added) anchor.current?.scrollIntoView({ block: "nearest" })
  }, [added])

  return (
    <Popover open={picking} onOpenChange={onPicking}>
      <PopoverAnchor asChild>
        <div
          ref={anchor}
          className={cn(
            "group/node bg-surface-panel relative w-full rounded-lg border p-3",
            condition ? "border-border" : "border-edge border-dashed",
            picking && "shadow-panel",
          )}
        >
          <div className="mb-2 flex items-baseline gap-2">
            <button
              type="button"
              onClick={() => onPicking(true)}
              className="text-muted-foreground hover:text-foreground min-w-0 truncate text-left text-[10px] font-medium tracking-[0.08em] uppercase"
            >
              {subject}
            </button>
            {condition && remaining !== undefined ? (
              <span
                className={cn(
                  "ml-auto shrink-0 text-[12px] tabular-nums",
                  remaining === 0 ? "text-muted-foreground" : "text-foreground",
                )}
              >
                {remaining.toLocaleString("en-GB")} left
              </span>
            ) : null}
            {condition ? (
              <button
                type="button"
                aria-label={`Remove ${subject.toLowerCase()} condition`}
                onClick={() => handlers.onRemoveCondition(attribute)}
                className={cn(
                  "text-muted-foreground hover:text-foreground hover:bg-accent -mr-1 flex size-5 shrink-0 items-center justify-center self-center rounded-md opacity-0 group-hover/node:opacity-100 focus-visible:opacity-100",
                  liftClass,
                )}
              >
                <XIcon className="size-3" />
              </button>
            ) : null}
          </div>

          {condition ? (
            <div className="flex flex-wrap items-center gap-1.5">
              {condition.values.map((value, i) => (
                <React.Fragment key={value}>
                  {i > 0 ? (
                    <OperatorPill
                      value={condition.join === "and" ? "AND" : "OR"}
                      options={["OR", "AND"]}
                      label={`Between ${subject.toLowerCase()} values`}
                      onChange={(next) => handlers.onSetJoin(attribute, next === "AND" ? "and" : "or")}
                    />
                  ) : null}
                  {/* The shared pill owns its own remove button and takes no
                      handler, so the removal is caught on the way up. */}
                  <span
                    className="contents"
                    onClick={(event) => {
                      if ((event.target as HTMLElement).closest('[data-slot="filter-pill-remove"]')) {
                        handlers.onToggleValue(attribute, value)
                      }
                    }}
                  >
                    <FilterPill variant="applied" removeLabel={`Remove ${value}`}>
                      <button
                        type="button"
                        onClick={() => onPicking(true)}
                        className="max-w-[200px] truncate text-left hover:underline"
                      >
                        {value}
                      </button>
                    </FilterPill>
                  </span>
                </React.Fragment>
              ))}
              <button
                type="button"
                aria-label={`Add a ${subject.toLowerCase()} value`}
                onClick={() => onPicking(true)}
                className="text-muted-foreground hover:text-foreground hover:bg-accent flex size-6 items-center justify-center rounded-full transition-colors"
              >
                <PlusIcon className="size-3.5" />
              </button>
            </div>
          ) : (
            <p className="text-muted-foreground text-[12px]">Pick a value</p>
          )}
        </div>
      </PopoverAnchor>
      <PopoverContent
        align="start"
        className="w-[320px] p-0 text-sm"
        // A click inside the node is choosing within it, not leaving it.
        onInteractOutside={(event) => {
          if (anchor.current?.contains(event.target as Node)) event.preventDefault()
        }}
      >
        <ValueMenu
          attribute={attribute}
          condition={condition}
          handlers={handlers}
          onClose={() => onPicking(false)}
        />
      </PopoverContent>
    </Popover>
  )
}

/**
 * The logic gate, as a canvas in the bottom half rather than a sidebar.
 *
 * Empty, it offers the filters most often used together as suggestions to
 * build on. A suggestion becomes a node the moment it is clicked, with its
 * value picker already open; it joins the query with its first value. From
 * there the canvas is Idea 1's stack — all drugs, then each condition joined to
 * what came before by an operator you can flip — with the suggestions that are
 * left reordered underneath by what pairs with the nodes already there.
 */
export function LogicCanvas({
  open,
  conditions,
  running,
  handlers,
  onSetGate,
  onClose,
  className,
}: {
  /** Whether the canvas is showing. Closing it drops a node with no value yet. */
  open: boolean
  conditions: Condition[]
  /** Rows left after each condition, in order. */
  running: number[]
  handlers: QueryHandlers
  onSetGate: (attribute: string, gate: Gate) => void
  onClose: () => void
  className?: string
}) {
  const [picking, setPicking] = React.useState<string | null>(null)

  // Tucked away, nothing on the canvas stays open. Adjusted during render so a
  // stale popover never paints over the sentence view.
  if (!open && picking) setPicking(null)

  const pendingAttribute =
    picking && !conditions.some((condition) => condition.attribute === picking) ? picking : null
  const used = [...conditions.map((condition) => condition.attribute), ...(pendingAttribute ? [pendingAttribute] : [])]
  const suggestions = suggestionsFor(used)
  const others = availableAttributes(conditions).filter(
    (attribute) => attribute !== pendingAttribute && !suggestions.includes(attribute),
  )
  const empty = used.length === 0

  const pick = (attribute: string) => setPicking(attribute)
  const nodes: { attribute: string; condition?: Condition }[] = [
    ...conditions.map((condition) => ({ attribute: condition.attribute, condition })),
    ...(pendingAttribute ? [{ attribute: pendingAttribute }] : []),
  ]

  return (
    <section aria-label="Logic gate" className={cn("flex min-h-0 flex-col", className)}>
      <div className="bg-surface-chrome border-edge flex h-11 shrink-0 items-center gap-2 border-b px-(--text-inset)">
        <span className="text-muted-foreground text-[10px] font-medium tracking-[0.08em] uppercase">
          Logic gate
        </span>
        <Button
          size="icon"
          variant="ghost"
          // The icon, not the button's hit area, sits on the inset.
          className="text-muted-foreground -mr-[7px] ml-auto size-7"
          onClick={onClose}
          aria-label="Close the logic gate"
        >
          <XIcon className="size-3.5" />
        </Button>
      </div>

      <div className="bg-surface-page min-h-0 flex-1 overflow-y-auto bg-[radial-gradient(var(--color-hairline)_1px,transparent_1px)] [background-size:16px_16px] px-(--text-inset) py-6">
        {empty ? (
          <div className="flex flex-col items-start">
            <div className="flex max-w-[400px] flex-col items-start">
              <p className="text-[13px] font-medium">Build a logic gate</p>
              <p className="text-muted-foreground mt-1 text-xs">Start from a common filter.</p>
              <div className="mt-4 flex flex-wrap items-center gap-1.5">
                {suggestions.map((attribute) => (
                  <SuggestionChip key={attribute} attribute={attribute} onAdd={pick} />
                ))}
                <MoreAttributes attributes={others} onAdd={pick} />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex w-full flex-col items-center">
            <div className="bg-surface-panel border-border flex w-full items-baseline gap-2 rounded-lg border px-3 py-2.5">
              <span className="text-muted-foreground text-[10px] font-medium tracking-[0.08em] uppercase">
                All drugs
              </span>
              <span className="text-foreground ml-auto text-[12px] tabular-nums">
                {sample.length.toLocaleString("en-GB")} in sample
              </span>
            </div>

            {nodes.map(({ attribute, condition }, i) => {
              return (
                <React.Fragment key={attribute}>
                  <Wire />
                  {condition ? (
                    <OperatorPill<Gate>
                      value={gateOf(condition)}
                      // `OR` against the whole sample keeps everything, so the
                      // first node can only narrow the set or drop from it.
                      options={i === 0 ? ["AND", "NOT"] : ["AND", "OR", "NOT", "OR NOT"]}
                      label="Operator"
                      onChange={(gate) => onSetGate(attribute, gate)}
                    />
                  ) : (
                    <span className="text-muted-foreground border-border inline-flex h-6 items-center rounded-full border border-dashed px-2 text-[11px] font-medium tracking-[0.08em]">
                      AND
                    </span>
                  )}
                  <Wire />
                  <GroupNode
                    attribute={attribute}
                    condition={condition}
                    remaining={condition ? running[i] : undefined}
                    picking={picking === attribute}
                    onPicking={(next) =>
                      setPicking((current) => (next ? attribute : current === attribute ? null : current))
                    }
                    handlers={handlers}
                  />
                </React.Fragment>
              )
            })}

            {suggestions.length > 0 || others.length > 0 ? (
              <>
                <Wire dashed />
                <div className="border-edge flex w-full flex-col items-center rounded-lg border border-dashed px-3 py-3">
                  <p className="text-muted-foreground text-[10px] font-medium tracking-[0.08em] uppercase">
                    Add a condition
                  </p>
                  <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5">
                    {suggestions.map((attribute) => (
                      <SuggestionChip key={attribute} attribute={attribute} onAdd={pick} />
                    ))}
                    <MoreAttributes attributes={others} onAdd={pick} />
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}
      </div>
    </section>
  )
}
