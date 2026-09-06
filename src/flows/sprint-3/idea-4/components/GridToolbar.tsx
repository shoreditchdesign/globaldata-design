"use client"

import {
  ArrowDownIcon,
  ArrowUpIcon,
  CheckIcon,
  ChevronDownIcon,
  Columns3Icon,
  DownloadIcon,
  LayersIcon,
  SigmaIcon,
  XIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { FilterPill, OperatorWord } from "@/components/prototype/FilterPill"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { ColumnManager } from "@/flows/sprint-3/idea-4/components/ColumnManager"
import {
  DATABASE_RECORDS,
  aggregateLabels,
  columnByKey,
  rows,
  unpopulatedAttributes,
  type AggregateKey,
  type DrugRecord,
} from "@/flows/sprint-3/idea-4/data"
import {
  hiddenColumnKeys,
  visibleColumnKeys,
  type GridAction,
  type GridState,
} from "@/flows/sprint-3/idea-4/grid-state"

function ToolButton({
  icon: Icon,
  label,
  value,
  active,
  ...props
}: React.ComponentProps<typeof Button> & {
  icon: typeof SigmaIcon
  label: string
  value: string
  active?: boolean
}) {
  return (
    <Button variant={active ? "secondary" : "ghost"} size="sm" {...props}>
      <Icon className="text-muted-foreground" />
      <span className="text-muted-foreground font-normal">{label}</span>
      <span className="max-w-[124px] truncate font-medium">{value}</span>
      <ChevronDownIcon className="text-muted-foreground" />
    </Button>
  )
}

function MenuRow({
  label,
  active,
  onClick,
  trailing,
}: {
  label: string
  active?: boolean
  onClick: () => void
  trailing?: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "hover:bg-muted flex h-7 w-full items-center gap-2 rounded-md px-2 text-left text-[12.5px] transition-colors",
        active && "bg-muted font-medium",
      )}
    >
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {trailing}
      {active ? <CheckIcon className="size-3.5 shrink-0" /> : null}
    </button>
  )
}

/** Static data, so an export is a real file rather than a button that lies. */
function exportCsv(state: GridState, visibleRows: DrugRecord[]) {
  const keys = visibleColumnKeys(state).filter((key) => key !== "select")
  const cell = (value: string) => `"${value.replace(/"/g, '""')}"`
  const header = keys.map((key) => cell(columnByKey[key].label)).join(",")
  const body = visibleRows.map((row) => {
    return keys
      .map((key) => {
        const column = columnByKey[key]
        if (key === "drugName") return cell(row.name)
        if (key === "brand") return cell(row.brand ?? "")
        if (key === "npv") return String(row.npv)
        const values = column.values(row)
        return cell(values.join("; "))
      })
      .join(",")
  })
  const blob = new Blob([[header, ...body].join("\n")], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = "globaldata-drugs.csv"
  link.click()
  URL.revokeObjectURL(url)
}

/**
 * Sort, group, aggregate and column management sit at the top level, where an
 * Excel-habituated user looks for them, rather than behind a settings menu.
 * Each one is a real control over the same `GridAction`s the column menus and
 * the agent use.
 */
export function GridToolbar({
  state,
  visibleRows,
  onAction,
}: {
  state: GridState
  visibleRows: DrugRecord[]
  onAction: (action: GridAction) => void
}) {
  const shown = visibleColumnKeys(state).filter((key) => key !== "select")
  const sortable = shown.map((key) => columnByKey[key])
  const groupable = shown.map((key) => columnByKey[key]).filter((column) => column.groupable)

  const sortLabel = state.sort ? (columnByKey[state.sort.columnKey]?.label ?? "None") : "None"
  const totalAttributes =
    shown.length + hiddenColumnKeys(state).length + unpopulatedAttributes.length

  return (
    <div className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
      <div className="flex items-baseline gap-2">
        <h1 className="text-[14px] font-semibold tracking-tight">Drugs</h1>
        <span className="text-muted-foreground text-[11px] tabular-nums">
          {DATABASE_RECORDS} records
        </span>
      </div>

      <Separator orientation="vertical" className="mx-1 h-4" />

      <Popover>
        <PopoverTrigger asChild>
          <ToolButton
            icon={state.sort?.direction === "desc" ? ArrowUpIcon : ArrowDownIcon}
            label="Sort"
            value={sortLabel}
            active={Boolean(state.sort)}
          />
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[236px] p-1.5">
          <MenuRow
            label="No sort"
            active={!state.sort}
            onClick={() => onAction({ kind: "setSort", sort: null })}
          />
          <Separator className="my-1" />
          {sortable.map((column) => {
            const current = state.sort?.columnKey === column.key ? state.sort.direction : null
            return (
              <MenuRow
                key={column.key}
                label={column.label}
                active={Boolean(current)}
                trailing={
                  current ? (
                    <span className="text-muted-foreground text-[10px] uppercase">
                      {current === "asc" ? "A–Z" : "Z–A"}
                    </span>
                  ) : null
                }
                onClick={() =>
                  onAction({
                    kind: "setSort",
                    sort: {
                      columnKey: column.key,
                      direction: current === "asc" ? "desc" : "asc",
                    },
                  })
                }
              />
            )
          })}
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <ToolButton
            icon={LayersIcon}
            label="Group"
            value={state.group ? columnByKey[state.group].label : "None"}
            active={Boolean(state.group)}
          />
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[236px] p-1.5">
          <MenuRow
            label="No grouping"
            active={!state.group}
            onClick={() => onAction({ kind: "setGroup", columnKey: null })}
          />
          <Separator className="my-1" />
          {groupable.map((column) => (
            <MenuRow
              key={column.key}
              label={column.label}
              active={state.group === column.key}
              onClick={() => onAction({ kind: "setGroup", columnKey: column.key })}
            />
          ))}
          <p className="text-muted-foreground/70 px-2 pt-1.5 text-[11px] leading-[1.4]">
            Indication, Geography, Therapy Area and Route hold several values per drug, so they
            cannot group a row into one bucket.
          </p>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <ToolButton
            icon={SigmaIcon}
            label="Aggregate"
            value={`${state.aggregates.length} fields`}
            active={state.aggregates.length > 0}
          />
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[220px] p-1.5">
          {(Object.keys(aggregateLabels) as AggregateKey[]).map((key) => {
            const on = state.aggregates.includes(key)
            return (
              <label
                key={key}
                className="hover:bg-muted flex h-7 cursor-default items-center gap-2 rounded-md px-2 text-[12.5px]"
              >
                <Checkbox
                  checked={on}
                  className="size-3.5"
                  onCheckedChange={() =>
                    onAction({
                      kind: "setAggregates",
                      keys: on
                        ? state.aggregates.filter((entry) => entry !== key)
                        : [...state.aggregates, key],
                    })
                  }
                />
                <span className="min-w-0 flex-1 truncate">{aggregateLabels[key]}</span>
              </label>
            )
          })}
        </PopoverContent>
      </Popover>

      <div className="ml-auto flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <Columns3Icon className="text-muted-foreground" />
              Columns
              <span className="text-muted-foreground tabular-nums">
                {shown.length}/{totalAttributes}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-[300px] gap-0 p-0">
            <ColumnManager state={state} onAction={onAction} />
          </PopoverContent>
        </Popover>

        <Button size="sm" onClick={() => exportCsv(state, visibleRows)}>
          <DownloadIcon />
          Export
        </Button>
      </div>
    </div>
  )
}

/**
 * Applied filters as pills, written subject–operator–value so the query reads
 * as a sentence, each one removable on its own, with the live total beside
 * them rather than a page away.
 */
export function AppliedFilterBar({
  state,
  matchCount,
  onAction,
}: {
  state: GridState
  matchCount: number
  onAction: (action: GridAction) => void
}) {
  const applied = Object.entries(state.filters).filter(([, values]) => values.length > 0)

  return (
    <div className="bg-muted/30 flex shrink-0 items-center gap-3 border-b px-4 py-2">
      <p className="flex shrink-0 items-baseline gap-1.5">
        <span className="text-[17px] font-semibold tracking-tight tabular-nums">{matchCount}</span>
        <span className="text-muted-foreground text-[12px]">
          {matchCount === 1 ? "drug matches" : "drugs match"}
        </span>
        <span className="text-muted-foreground/70 text-[11px] tabular-nums">
          of {rows.length} in sample
        </span>
      </p>

      <Separator orientation="vertical" className="h-4" />

      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
        {applied.length === 0 ? (
          <span className="text-muted-foreground text-[12px]">
            No filters. Open any column header to narrow the set.
          </span>
        ) : null}
        {applied.map(([key, values]) => (
          <FilterPill key={key} removable={false}>
            <OperatorWord>{columnByKey[key].label}</OperatorWord>
            <OperatorWord>is</OperatorWord>
            {values.map((value, index) => (
              <span key={value} className="flex items-center gap-1">
                {index > 0 ? <OperatorWord>or</OperatorWord> : null}
                <span className="font-medium">{value}</span>
              </span>
            ))}
            <button
              type="button"
              aria-label={`Remove ${columnByKey[key].label} filter`}
              onClick={() => onAction({ kind: "clearColumnFilter", columnKey: key })}
              className="text-muted-foreground hover:bg-accent hover:text-foreground ml-0.5 flex size-4 shrink-0 items-center justify-center rounded-full transition-colors"
            >
              <XIcon className="size-3" />
            </button>
          </FilterPill>
        ))}
      </div>

      <Button
        variant="ghost"
        size="xs"
        className="shrink-0"
        disabled={applied.length === 0}
        onClick={() => onAction({ kind: "clearFilters" })}
      >
        Clear all
      </Button>
    </div>
  )
}
