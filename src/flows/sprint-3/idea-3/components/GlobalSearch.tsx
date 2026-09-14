"use client"

import * as React from "react"
import { ArrowRightIcon, SearchIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover"
import { resultRows } from "@/flows/sprint-3/idea-3/data"

/**
 * The global search, wired up.
 *
 * The live platform already ships a fast cross-entity natural-language search
 * in this exact slot, and the strongest single argument for this direction is
 * that nothing found in it can be carried into a screener. So rather than
 * asserting that on a slide, the last row of this dropdown hands the typed text
 * to the sentence below and it resolves there.
 *
 * The entity results are a fixed list filtered by substring — this is a
 * prototype and nothing is fetched. The row that matters is the last one.
 */
const companies = [
  "Zydus Lifesciences",
  "Sandoz",
  "Teva Pharmaceutical",
  "Glenmark Pharmaceuticals",
  "Boehringer Ingelheim",
]

const indications = [
  "Rheumatoid Arthritis",
  "Osteoarthritis",
  "Ankylosing Spondylitis",
  "Acute Pain",
  "Psoriatic Arthritis",
]

export function GlobalSearch({ onScreen }: { onScreen: (query: string) => void }) {
  const [value, setValue] = React.useState("")
  const [focused, setFocused] = React.useState(false)

  const term = value.trim().toLowerCase()
  const open = focused && term.length > 1

  const drugs = React.useMemo(() => {
    if (term.length < 2) return []
    return resultRows
      .filter(
        (row) =>
          row.name.toLowerCase().includes(term) || row.generic.toLowerCase().includes(term),
      )
      .slice(0, 3)
  }, [term])

  const matchedCompanies = companies.filter((name) => name.toLowerCase().includes(term)).slice(0, 3)
  const matchedIndications = indications
    .filter((name) => name.toLowerCase().includes(term))
    .slice(0, 3)

  const hand = () => {
    const query = value.trim()
    if (query.length === 0) return
    setValue("")
    setFocused(false)
    onScreen(query)
  }

  return (
    <Popover open={open}>
      <PopoverAnchor asChild>
        <div className="border-border bg-surface-sunken focus-within:border-ring focus-within:ring-ring/40 flex h-8 w-full items-center gap-2 rounded-lg border px-2.5 transition-colors focus-within:ring-3">
          <SearchIcon className="text-muted-foreground size-3.5 shrink-0" />
          <input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => window.setTimeout(() => setFocused(false), 120)}
            onKeyDown={(event) => {
              if (event.key === "Enter") hand()
              if (event.key === "Escape") setFocused(false)
            }}
            placeholder="Search all of GlobalData"
            aria-label="Search all of GlobalData"
            className="placeholder:text-muted-foreground w-full min-w-0 bg-transparent text-[13px] outline-none"
          />
        </div>
      </PopoverAnchor>

      <PopoverContent
        align="end"
        sideOffset={6}
        onOpenAutoFocus={(event) => event.preventDefault()}
        className="w-[380px] p-0"
      >
        <Group label="Drugs" items={drugs.map((row) => `${row.name} · ${row.generic}`)} />
        <Group label="Companies" items={matchedCompanies} />
        <Group label="Indications" items={matchedIndications} />

        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={hand}
          className="hover:bg-accent border-edge flex w-full items-start gap-2.5 border-t px-3 py-2.5 text-left transition-colors"
        >
          <ArrowRightIcon className="text-muted-foreground mt-0.5 size-3.5 shrink-0" />
          <span className="min-w-0">
            <span className="block truncate text-[13px] font-medium">
              Screen drugs matching &ldquo;{value.trim()}&rdquo;
            </span>
          </span>
        </button>
      </PopoverContent>
    </Popover>
  )
}

function Group({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) return null
  return (
    <div className="border-hairline border-b p-1.5 last-of-type:border-b-0">
      <p className="text-muted-foreground px-1.5 py-1 text-[10px] font-medium tracking-[0.08em] uppercase">
        {label}
      </p>
      {items.map((item) => (
        <p
          key={item}
          className={cn("truncate rounded-md px-1.5 py-1 text-[13px]", "text-foreground/80")}
        >
          {item}
        </p>
      ))}
    </div>
  )
}
