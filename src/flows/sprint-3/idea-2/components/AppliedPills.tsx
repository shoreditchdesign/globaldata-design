"use client"

import { Fragment } from "react"
import { PlusIcon } from "lucide-react"

import { FilterPill, OperatorWord } from "@/components/prototype/FilterPill"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { attributeDefs, drugAttributeOrder } from "@/flows/sprint-3/idea-2/data"
import type { Screener } from "@/flows/sprint-3/idea-2/use-screener"

/**
 * A word in the sentence that is also a control. Deliberately quiet: the
 * values are the objects you grab, the words are the grammar holding them
 * together, and the grammar only announces itself on hover.
 */
function WordButton({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <DropdownMenuTrigger
      aria-label={label}
      className="hover:bg-accent hover:text-foreground rounded px-1 py-0.5 decoration-dotted underline-offset-4 hover:underline"
    >
      <OperatorWord>{children}</OperatorWord>
    </DropdownMenuTrigger>
  )
}

/**
 * The query, above the results, as a sentence made of removable objects.
 *
 * Values from one attribute share a subject rather than repeating it, so the
 * bar reads `Therapy area is Dermatology or Cardiovascular and Drug geography
 * is not Austria or Italy` — plain language, but every value has its own cross
 * and every connective is a control. Nothing here is a label: removing a pill,
 * flipping `is` to `is not` or `or` to `and` moves the count and the table in
 * the same tick.
 */
export function AppliedPills({ screener }: { screener: Screener }) {
  const { filters } = screener
  const unused = drugAttributeOrder.filter(
    (attribute) =>
      attributeDefs[attribute] && !filters.some((filter) => filter.attribute === attribute),
  )

  return (
    <div className="flex flex-wrap items-center gap-x-1 gap-y-1.5">
      {filters.length === 0 ? (
        <OperatorWord className="py-0.5">
          No filters applied — the whole sample is in the table.
        </OperatorWord>
      ) : null}

      {filters.map((filter, i) => {
        const def = attributeDefs[filter.attribute]
        return (
          <Fragment key={filter.attribute}>
            {i > 0 ? <OperatorWord className="px-1">and</OperatorWord> : null}

            <DropdownMenu>
              <WordButton label={`Change how ${def.subject} is applied`}>
                {`${def.subject} ${filter.mode}`}
              </WordButton>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem onSelect={() => screener.setMode(filter.attribute, "is")}>
                  is
                  <span className="text-muted-foreground ml-auto text-[11px]">keep matches</span>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => screener.setMode(filter.attribute, "is not")}>
                  is not
                  <span className="text-muted-foreground ml-auto text-[11px]">drop matches</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => screener.openPath(["Drugs", filter.attribute])}
                >
                  Show in the filter panel
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => screener.clearAttribute(filter.attribute)}
                >
                  Remove this filter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {filter.values.map((value, j) => (
              <Fragment key={value}>
                {j > 0 ? (
                  <DropdownMenu>
                    <WordButton label={`Change how ${def.subject} values combine`}>
                      {filter.join}
                    </WordButton>
                    <DropdownMenuContent align="start" className="w-56">
                      <DropdownMenuItem onSelect={() => screener.setJoin(filter.attribute, "or")}>
                        or
                        <span className="text-muted-foreground ml-auto text-[11px]">
                          any of these
                        </span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => screener.setJoin(filter.attribute, "and")}>
                        and
                        <span className="text-muted-foreground ml-auto text-[11px]">
                          all of these
                        </span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : null}

                {/*
                 * `FilterPill` is shared across the four directions and owns its
                 * own cross, so the click is caught on the way up rather than by
                 * forking the component for one screen.
                 */}
                <span
                  role="presentation"
                  onClick={(event) => {
                    if ((event.target as HTMLElement).closest("button")) {
                      screener.removeValue(filter.attribute, value)
                    }
                  }}
                >
                  <FilterPill removeLabel={`Remove ${value}`}>{value}</FilterPill>
                </span>
              </Fragment>
            ))}
          </Fragment>
        )
      })}

      <DropdownMenu>
        <DropdownMenuTrigger className="text-muted-foreground hover:text-foreground hover:border-foreground/30 ml-0.5 inline-flex h-6 items-center gap-1 rounded-full border border-dashed px-2 text-[12px]">
          <PlusIcon className="size-3" />
          Add filter
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="max-h-80 w-64 overflow-y-auto">
          {unused.length === 0 ? (
            <DropdownMenuItem disabled>Every attribute is already in the query</DropdownMenuItem>
          ) : (
            unused.map((attribute) => (
              <DropdownMenuItem
                key={attribute}
                onSelect={() => screener.openPath(["Drugs", attribute])}
              >
                {attribute}
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
