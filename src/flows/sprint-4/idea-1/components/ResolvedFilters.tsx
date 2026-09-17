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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  definitionFor,
  filterDefinitions,
  type FilterId,
  type FilterJoin,
  type ResolvedFilter,
} from "@/flows/sprint-4/idea-1/data"
import { cn } from "@/lib/utils"

export function ResolvedFilters({
  filters,
  resultCount,
  onModeChange,
  onJoinChange,
  onToggleValue,
  onRemove,
  onAdd,
  onClear,
}: {
  filters: ResolvedFilter[]
  resultCount: number
  onModeChange: (id: FilterId, excluded: boolean) => void
  onJoinChange: (id: FilterId, join: FilterJoin) => void
  onToggleValue: (id: FilterId, value: string) => void
  onRemove: (id: FilterId) => void
  onAdd: (id: FilterId) => void
  onClear: () => void
}) {
  const unused = filterDefinitions.filter(
    (definition) => !filters.some((filter) => filter.id === definition.id),
  )

  return (
    <div className="bg-surface-panel border-border mt-5 w-full rounded-xl border p-4">
      <div className="flex min-h-10 flex-wrap items-center gap-2">
        {filters.length === 0 ? (
          <p className="text-muted-foreground text-[13px]">No filters selected.</p>
        ) : null}

        {filters.map((filter, index) => (
          <div key={filter.id} className="contents">
            {index > 0 ? (
              <span className="text-muted-foreground px-0.5 text-[11px] font-medium">AND</span>
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
          {filter.excluded ? "is not" : "is"}
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

      <DropdownMenu>
        <DropdownMenuTrigger className="hover:bg-foreground/5 flex min-w-0 items-center gap-1.5 px-2.5 py-1.5 text-left transition-colors">
          <span className="max-w-64 truncate">
            {filter.values.join(` ${filter.join} `)}
          </span>
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
          {filter.values.length > 1 ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Match values with</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={filter.join}
                onValueChange={(value) => onJoinChange(filter.id, value as FilterJoin)}
              >
                <DropdownMenuRadioItem value="or">OR — any value</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="and">AND — every value</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

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
