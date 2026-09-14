"use client"

import {
  ArrowDownUpIcon,
  CheckIcon,
  ChevronDownIcon,
  Columns3Icon,
  DownloadIcon,
  LayersIcon,
  SigmaIcon,
  XIcon,
  type LucideIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { FilterPill, OperatorWord } from "@/components/prototype/FilterPill"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { ColumnManager } from "@/flows/sprint-3/idea-4/components/ColumnManager"
import {
  aggregateColumn,
  aggregateLabels,
  columnByKey,
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

/**
 * An outline trigger. A value that is set reads in the foreground after the
 * label; the trigger itself never fills — the picked option inside the
 * popover is what takes the washed brand.
 */
function ToolButton({
  icon: Icon,
  label,
  current,
  ...props
}: Omit<React.ComponentProps<typeof Button>, "value"> & {
  icon: LucideIcon
  label: string
  /** The value that is set, if any. */
  current?: React.ReactNode
}) {
  return (
    <Button variant="outline" size="sm" className="h-8 gap-1.5 px-2.5 text-sm" {...props}>
      <Icon className="text-muted-foreground" />
      <span className={current ? "text-muted-foreground" : undefined}>
        {label}
        {current ? ":" : null}
      </span>
      {current ? <span className="max-w-[160px] truncate font-medium">{current}</span> : null}
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
        "flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-sm transition-colors",
        active
          ? "bg-brand-tint ring-brand-border text-foreground font-medium ring-1 ring-inset"
          : "hover:bg-accent",
      )}
    >
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {trailing}
      {active ? <CheckIcon className="text-foreground size-4 shrink-0" /> : null}
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
 * Row one of the table's header. The title on the left; on the right, in the
 * order an analyst reaches for them, Aggregate, Group, Sort, Columns and the
 * one primary action, Export. Each is a real control over the same
 * `GridAction`s the column menus and the agent use.
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
  const totalAttributes =
    shown.length + hiddenColumnKeys(state).length + unpopulatedAttributes.length

  return (
    <div className="bg-surface-chrome border-edge flex h-12 shrink-0 items-center gap-2 border-b px-4">
      <h1 className="text-base font-semibold tracking-tight">Drugs</h1>

      <div className="ml-auto flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <ToolButton
              icon={SigmaIcon}
              label="Aggregate"
              current={state.aggregates.length ? String(state.aggregates.length) : undefined}
            />
          </PopoverTrigger>
          <PopoverContent align="end" className="w-[248px] gap-0 p-1.5">
            <p className="text-muted-foreground px-2 pt-1 pb-1.5 text-sm font-medium">Summary row</p>
            {(Object.keys(aggregateLabels) as AggregateKey[]).map((key) => {
              const on = state.aggregates.includes(key)
              return (
                <label
                  key={key}
                  className="hover:bg-accent flex h-8 cursor-default items-center gap-2 rounded-md px-2 text-sm transition-colors"
                >
                  <Checkbox
                    checked={on}
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
                  <span className="text-muted-foreground shrink-0 truncate text-sm">
                    {columnByKey[aggregateColumn[key]].label}
                  </span>
                </label>
              )
            })}
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <ToolButton
              icon={LayersIcon}
              label="Group"
              current={state.group ? columnByKey[state.group].label : undefined}
            />
          </PopoverTrigger>
          <PopoverContent align="end" className="w-[248px] gap-0 p-1.5">
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
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <ToolButton
              icon={ArrowDownUpIcon}
              label="Sort"
              current={state.sort ? columnByKey[state.sort.columnKey]?.label : undefined}
            />
          </PopoverTrigger>
          <PopoverContent align="end" className="w-[264px] gap-0 p-1.5">
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
                      <span className="text-sm opacity-70">{current === "asc" ? "A–Z" : "Z–A"}</span>
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
              icon={Columns3Icon}
              label="Columns"
              current={
                <span className="tabular-nums">
                  {shown.length}
                  <span className="text-muted-foreground font-normal">/{totalAttributes}</span>
                </span>
              }
            />
          </PopoverTrigger>
          <PopoverContent align="end" className="w-[320px] gap-0 p-0">
            <ColumnManager state={state} onAction={onAction} />
          </PopoverContent>
        </Popover>

        <Button size="sm" className="h-8 px-2.5 text-sm" onClick={() => exportCsv(state, visibleRows)}>
          <DownloadIcon />
          Export
        </Button>
      </div>
    </div>
  )
}

/**
 * Row two of the table's header: applied filters as pills, written
 * subject–operator–value so the query reads as a sentence, each one removable
 * on its own.
 */
export function AppliedFilterBar({
  state,
  onAction,
}: {
  state: GridState
  onAction: (action: GridAction) => void
}) {
  const applied = Object.entries(state.filters).filter(([, values]) => values.length > 0)

  return (
    <div className="bg-surface-panel border-edge flex min-h-11 shrink-0 items-center gap-3 border-b px-4 py-2">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
        {applied.length === 0 ? (
          <span className="text-muted-foreground text-sm">No filters.</span>
        ) : null}
        {applied.map(([key, values]) => (
          <FilterPill key={key} removable={false} className="h-7 text-sm">
            <OperatorWord className="text-sm">{columnByKey[key].label}</OperatorWord>
            <OperatorWord className="text-sm">is</OperatorWord>
            {values.map((value, index) => (
              <span key={value} className="flex items-center gap-1">
                {index > 0 ? <OperatorWord className="text-sm">or</OperatorWord> : null}
                <span className="font-medium">{value}</span>
              </span>
            ))}
            <button
              type="button"
              aria-label={`Remove ${columnByKey[key].label} filter`}
              onClick={() => onAction({ kind: "clearColumnFilter", columnKey: key })}
              className="text-brand-ink/60 hover:bg-brand-border hover:text-brand-ink ml-0.5 flex size-5 shrink-0 items-center justify-center rounded-full transition-colors"
            >
              <XIcon className="size-3.5" />
            </button>
          </FilterPill>
        ))}
      </div>

      {applied.length ? (
        <Button
          variant="ghost"
          size="xs"
          className="shrink-0 text-sm"
          onClick={() => onAction({ kind: "clearFilters" })}
        >
          Clear all
        </Button>
      ) : null}
    </div>
  )
}
