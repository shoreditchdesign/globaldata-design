import { ChevronDownIcon, PlusIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  definitionFor,
  filterDefinitions,
  type FilterId,
  type FilterJoin,
  type FilterLink,
  type ResolvedFilter,
} from "@/flows/sprint-4/idea-1/data"
import { cn } from "@/lib/utils"

export function ResolvedFilters({
  filters,
  resultCount,
  onModeChange,
  onJoinChange,
  onLinkChange,
  onToggleValue,
  onRemove,
  onAdd,
  onClear,
}: {
  filters: ResolvedFilter[]
  resultCount: number
  onModeChange: (id: FilterId, excluded: boolean) => void
  onJoinChange: (id: FilterId, join: FilterJoin) => void
  onLinkChange: (id: FilterId, link: FilterLink) => void
  onToggleValue: (id: FilterId, value: string) => void
  onRemove: (id: FilterId) => void
  onAdd: (id: FilterId) => void
  onClear: () => void
}) {
  const unused = filterDefinitions.filter(
    (definition) => !filters.some((filter) => filter.id === definition.id),
  )

  return (
    <div className="bg-surface-panel border-border w-full rounded-xl border p-4">
      <div className="flex min-h-10 flex-wrap items-center gap-2">
        {filters.length === 0 ? (
          <p className="text-muted-foreground text-[13px]">No filters selected.</p>
        ) : null}

        {filters.map((filter, index) => (
          <div key={filter.id} className="contents">
            {index > 0 ? (
              <FilterLinkControl
                filter={filter}
                onChange={(link) => onLinkChange(filter.id, link)}
              />
            ) : null}
            <FilterClause
              filter={filter}
              onModeChange={onModeChange}
              onJoinChange={onJoinChange}
              onToggleValue={onToggleValue}
              onRemove={onRemove}
            />
          </div>
        ))}
      </div>

      <div className="border-hairline mt-4 flex items-center justify-between gap-4 border-t pt-4">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={unused.length === 0}>
                <PlusIcon />
                Add filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Filter by</DropdownMenuLabel>
              {unused.map((definition) => (
                <DropdownMenuItem key={definition.id} onSelect={() => onAdd(definition.id)}>
                  {definition.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="default"
            onClick={onClear}
            disabled={filters.length === 0}
          >
            Clear filters
          </Button>
          <Button type="button" size="default" className="shrink-0 tabular-nums">
            Search for {resultCount.toLocaleString("en-GB")} drugs
          </Button>
        </div>
      </div>
    </div>
  )
}

function FilterLinkControl({
  filter,
  onChange,
}: {
  filter: ResolvedFilter
  onChange: (link: FilterLink) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Combine ${filter.label} with the previous filter using ${filter.link}`}
        className="text-muted-foreground hover:bg-accent hover:text-foreground flex h-7 items-center gap-1 rounded-md px-1.5 text-[11px] font-medium uppercase transition-colors"
      >
        {filter.link}
        <ChevronDownIcon className="size-3" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-36">
        <DropdownMenuRadioGroup
          value={filter.link}
          onValueChange={(value) => onChange(value as FilterLink)}
        >
          <DropdownMenuRadioItem value="and">AND</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="or">OR</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function FilterClause({
  filter,
  onModeChange,
  onJoinChange,
  onToggleValue,
  onRemove,
}: {
  filter: ResolvedFilter
  onModeChange: (id: FilterId, excluded: boolean) => void
  onJoinChange: (id: FilterId, join: FilterJoin) => void
  onToggleValue: (id: FilterId, value: string) => void
  onRemove: (id: FilterId) => void
}) {
  const definition = definitionFor(filter.id)

  return (
    <div
      className={cn(
        "flex min-h-8 max-w-full items-center rounded-lg border text-[12px]",
        filter.excluded
          ? "bg-negative border-negative-border text-negative-ink"
          : "bg-surface-sunken border-border text-foreground",
      )}
    >
      <span className="shrink-0 border-r border-current/10 px-2.5 py-1.5 font-medium">
        {filter.label}
      </span>

      <DropdownMenu>
        <DropdownMenuTrigger className="hover:bg-foreground/5 flex shrink-0 items-center gap-1 border-r border-current/10 px-2 py-1.5 transition-colors">
          {filter.excluded ? "IS NOT" : "IS"}
          <ChevronDownIcon className="size-3" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-32">
          <DropdownMenuRadioGroup
            value={filter.excluded ? "is-not" : "is"}
            onValueChange={(value) => onModeChange(filter.id, value === "is-not")}
          >
            <DropdownMenuRadioItem value="is">is</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="is-not">is not</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {filter.values.map((value, index) => (
        <div key={value} className="contents">
          {index > 0 ? (
            <ValueJoinControl
              filter={filter}
              onChange={(join) => onJoinChange(filter.id, join)}
            />
          ) : null}
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                "hover:bg-foreground/5 flex min-w-0 items-center gap-1.5 px-2.5 py-1.5 text-left transition-colors",
                index < filter.values.length - 1
                  ? "border-r-0"
                  : "border-r border-current/10",
              )}
            >
              <span className="max-w-64 truncate">{value}</span>
              <ChevronDownIcon className="size-3 shrink-0" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-72">
              <DropdownMenuLabel>{filter.label}</DropdownMenuLabel>
              {definition.options.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option}
                  checked={filter.values.includes(option)}
                  onSelect={(event) => event.preventDefault()}
                  onCheckedChange={() => onToggleValue(filter.id, option)}
                >
                  {option}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}

      <button
        type="button"
        onClick={() => onRemove(filter.id)}
        aria-label={`Remove ${filter.label} filter`}
        className="hover:bg-foreground/5 mr-1 flex size-6 shrink-0 items-center justify-center rounded-md transition-colors"
      >
        <XIcon className="size-3" />
      </button>
    </div>
  )
}

function ValueJoinControl({
  filter,
  onChange,
}: {
  filter: ResolvedFilter
  onChange: (join: FilterJoin) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Match ${filter.label} values using ${filter.join}`}
        className="hover:bg-foreground/5 flex shrink-0 items-center gap-1 border-x border-current/10 px-2 py-1.5 transition-colors"
      >
        {filter.join.toUpperCase()}
        <ChevronDownIcon className="size-3" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-44">
        <DropdownMenuRadioGroup
          value={filter.join}
          onValueChange={(value) => onChange(value as FilterJoin)}
        >
          <DropdownMenuRadioItem value="and">AND — every value</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="or">OR — any value</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
