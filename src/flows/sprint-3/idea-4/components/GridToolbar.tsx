"use client"

import {
  ArrowDownIcon,
  ChevronDownIcon,
  Columns3Icon,
  DownloadIcon,
  LayersIcon,
  SigmaIcon,
  XIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { ColumnManager } from "@/flows/sprint-3/idea-4/components/ColumnManager"
import {
  appliedFilters,
  availableColumnTotal,
  shownColumns,
  totals,
} from "@/flows/sprint-3/idea-4/data"

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
      <span className="font-medium">{value}</span>
      <ChevronDownIcon className="text-muted-foreground" />
    </Button>
  )
}

/**
 * Sort, group, aggregate and column management sit at the top level, where an
 * Excel-habituated user looks for them, rather than behind a settings menu.
 */
export function GridToolbar({
  columnsOpen,
  onColumnsOpenChange,
}: {
  columnsOpen: boolean
  onColumnsOpenChange: (open: boolean) => void
}) {
  return (
    <div className="flex h-12 shrink-0 items-center gap-3 border-b px-4">
      <div className="flex items-baseline gap-2">
        <h1 className="text-[14px] font-semibold tracking-tight">Drugs</h1>
        <span className="text-muted-foreground text-[11px] tabular-nums">
          {totals.database} records
        </span>
      </div>

      <Separator orientation="vertical" className="mx-1 h-4" />

      <ToolButton icon={ArrowDownIcon} label="Sort" value="Development Stage" active />
      <ToolButton icon={LayersIcon} label="Group" value="None" />
      <ToolButton icon={SigmaIcon} label="Aggregate" value="4 fields" />

      <div className="ml-auto flex items-center gap-2">
        <Popover open={columnsOpen} onOpenChange={onColumnsOpenChange}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <Columns3Icon className="text-muted-foreground" />
              Columns
              <span className="text-muted-foreground tabular-nums">
                {shownColumns.length}/{shownColumns.length + availableColumnTotal}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-[292px] gap-0 p-0">
            <ColumnManager />
          </PopoverContent>
        </Popover>

        <Button size="sm">
          <DownloadIcon />
          Export to Excel
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
export function AppliedFilterBar() {
  return (
    <div className="bg-muted/30 flex shrink-0 items-center gap-3 border-b px-4 py-2">
      <p className="flex shrink-0 items-baseline gap-1.5">
        <span className="text-[17px] font-semibold tracking-tight tabular-nums">
          {totals.matching}
        </span>
        <span className="text-muted-foreground text-[12px]">drugs match</span>
      </p>

      <Separator orientation="vertical" className="h-4" />

      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
        {appliedFilters.map((filter) => (
          <span
            key={filter.columnKey}
            className="bg-background border-border flex h-6 items-center gap-1 rounded-full border pr-1 pl-2.5 text-[12px]"
          >
            <span className="text-muted-foreground">{filter.subject}</span>
            <span className="text-muted-foreground">{filter.operator}</span>
            {filter.values.map((value, i) => (
              <span key={value} className="flex items-center gap-1">
                {i > 0 ? <span className="text-muted-foreground">{filter.joiner}</span> : null}
                <span className="font-medium">{value}</span>
              </span>
            ))}
            <button
              type="button"
              className="text-muted-foreground hover:bg-muted hover:text-foreground ml-0.5 flex size-4 items-center justify-center rounded-full transition-colors"
              aria-label={`Remove ${filter.subject} filter`}
            >
              <XIcon className="size-3" />
            </button>
          </span>
        ))}
      </div>

      <Button variant="ghost" size="xs" className="shrink-0">
        Clear all
      </Button>
    </div>
  )
}
