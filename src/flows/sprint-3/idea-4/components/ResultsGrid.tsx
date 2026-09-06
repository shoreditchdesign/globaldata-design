"use client"

import { ArrowDownIcon, ChevronDownIcon, ChevronRightIcon, FunnelIcon, PinIcon } from "lucide-react"

import { StageBadge } from "@/components/prototype/StageBadge"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { ColumnHeaderMenu } from "@/flows/sprint-3/idea-4/components/ColumnHeaderMenu"
import { ValuePills } from "@/flows/sprint-3/idea-4/components/ValuePills"
import {
  aggregates,
  columns,
  gridTemplate,
  rows,
  stageValues,
  totals,
  type DrugRecord,
  type GridColumn,
} from "@/flows/sprint-3/idea-4/data"

/** Collapsed cap per lane. Wide lanes carry more before they fold. */
const pillLimits: Record<string, number> = {
  therapyArea: 1,
  indication: 2,
  route: 1,
  geography: 3,
}

/** Only Development Stage carries a real value list in this frame. */
const menuValues: Record<string, typeof stageValues> = {
  stage: stageValues,
}

function HeaderCell({
  column,
  open,
  onOpenChange,
}: {
  column: GridColumn
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const values = menuValues[column.key]

  // The state icons float inside the label rather than sitting beside it, so a
  // long column name wraps around them and still gets the full second line.
  const trigger = (
    <button
      type="button"
      className={cn(
        "hover:bg-muted group flex h-full w-full items-center px-2.5 py-2 text-left transition-colors",
        open && "bg-muted"
      )}
    >
      <span className="text-muted-foreground block w-full text-[10px] leading-[1.3] font-medium tracking-[0.07em] uppercase">
        <span className="float-right ml-1 flex items-center gap-1 pt-px">
          {column.pinned ? (
            <PinIcon className="fill-muted-foreground text-muted-foreground size-3" />
          ) : null}
          {column.sorted ? <ArrowDownIcon className="text-foreground size-3" /> : null}
          {column.filtered ? <FunnelIcon className="fill-foreground text-foreground size-2.5" /> : null}
          <ChevronDownIcon
            className={cn(
              "size-3 transition-opacity",
              open ? "opacity-100" : "opacity-30 group-hover:opacity-100"
            )}
          />
        </span>
        {column.label}
      </span>
    </button>
  )

  const lane = cn("border-border/60 border-r last:border-r-0", column.pinned && "border-border")

  if (!values) {
    return <div className={lane}>{trigger}</div>
  }

  return (
    <div className={lane}>
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>
        <PopoverContent align="start" sideOffset={1} className="w-[272px] gap-0 p-0">
          <ColumnHeaderMenu label={column.label} values={values} sorted={column.sorted} />
        </PopoverContent>
      </Popover>
    </div>
  )
}

function Cell({
  column,
  row,
  expanded,
  onExpand,
}: {
  column: GridColumn
  row: DrugRecord
  expanded: boolean
  onExpand: () => void
}) {
  const base = cn(
    "min-w-0 px-2.5 py-2",
    column.pinned && "border-r border-border/60"
  )

  switch (column.key) {
    case "select":
      return (
        <div className={cn(base, "flex items-start gap-1 px-2")}>
          <Checkbox className="mt-0.5 size-3.5" />
          <button
            type="button"
            onClick={onExpand}
            aria-label={expanded ? "Collapse record" : "Expand record"}
            className="text-muted-foreground hover:text-foreground -mt-0.5 flex size-4 items-center justify-center transition-colors"
          >
            {expanded ? (
              <ChevronDownIcon className="size-3.5" />
            ) : (
              <ChevronRightIcon className="size-3.5" />
            )}
          </button>
        </div>
      )
    case "drugName":
      return (
        <div className={base}>
          <span className="block text-[12.5px] leading-[16px] font-medium">{row.name}</span>
        </div>
      )
    case "brand":
      return (
        <div className={base}>
          <span className="block text-[12.5px] leading-[16px]">
            {row.brand ?? <span className="text-muted-foreground">—</span>}
          </span>
        </div>
      )
    case "company":
      return (
        <div className={base}>
          <span className="text-muted-foreground block text-[12.5px] leading-[16px]">
            {row.company}
          </span>
        </div>
      )
    case "moleculeType":
      return (
        <div className={base}>
          <span className="text-muted-foreground block text-[12.5px] leading-[16px]">
            {row.moleculeType}
          </span>
        </div>
      )
    case "stage":
      return (
        <div className={base}>
          <StageBadge stage={row.stage} className="h-[18px] px-1.5" />
        </div>
      )
    case "therapyArea":
    case "indication":
    case "route":
    case "geography": {
      const values =
        column.key === "therapyArea"
          ? row.therapyAreas
          : column.key === "indication"
            ? row.indications
            : column.key === "route"
              ? row.routes
              : row.geographies
      return (
        <div className={base}>
          <ValuePills
            values={values}
            limit={pillLimits[column.key]}
            expanded={expanded}
            onExpand={onExpand}
            muted={column.key === "geography" || column.key === "route"}
          />
        </div>
      )
    }
    default:
      return <div className={base} />
  }
}

/**
 * The expanded record. Rather than growing a 210px lane to nine lines, the
 * detail opens as a band across the full width of the row — the CPO's
 * non-linear, pill-style multi-row card, and the reason one drug never takes
 * more than a few lines however many values it carries.
 */
function ExpandedDetail({ row }: { row: DrugRecord }) {
  const groups: { label: string; values: string[] }[] = [
    { label: "Therapy Area", values: row.therapyAreas },
    { label: "Indication", values: row.indications },
    { label: "Route of Administration", values: row.routes },
    { label: "Drug Geography", values: row.geographies },
  ].filter((group) => group.values.length > 1)

  return (
    <div className="border-border/60 border-t py-2.5 pr-2.5 pl-12">
      <div className="flex flex-col gap-2">
        {groups.map((group) => (
          <div key={group.label} className="flex gap-3">
            <span className="text-muted-foreground w-[142px] shrink-0 pt-1 text-[10px] leading-[1.25] font-medium tracking-[0.07em] uppercase">
              {group.label}{" "}
              <span className="tabular-nums">{group.values.length}</span>
            </span>
            <div className="flex min-w-0 flex-wrap items-center gap-1">
              {group.values.map((value) => (
                <span
                  key={value}
                  className="bg-background border-border/70 rounded-md border px-1.5 py-0.5 text-[11px] leading-[16px]"
                >
                  {value}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * One reusable grid, not a bespoke table. Fixed lanes so every row lines up,
 * multi-valued lanes taking the slack, and no horizontal scroll at any width —
 * the live product's results view scrolls sideways at 1600px with eight locked
 * columns, and this is the answer to that.
 */
export function ResultsGrid({
  openColumn,
  onOpenColumnChange,
  expandedRows,
  onToggleRow,
}: {
  openColumn: string | null
  onOpenColumnChange: (key: string | null) => void
  expandedRows: string[]
  onToggleRow: (id: string) => void
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div
          className="bg-background sticky top-0 z-10 grid border-b"
          style={{ gridTemplateColumns: gridTemplate }}
        >
          <div className="border-border/60 border-r px-2 py-2">
            <Checkbox className="size-3.5" />
          </div>
          {columns.slice(1).map((column) => (
            <HeaderCell
              key={column.key}
              column={column}
              open={openColumn === column.key}
              onOpenChange={(open) => onOpenColumnChange(open ? column.key : null)}
            />
          ))}
        </div>

        {rows.map((row) => {
          const expanded = expandedRows.includes(row.id)
          return (
            <div
              key={row.id}
              className={cn("border-border/60 border-b", expanded && "bg-muted/30")}
            >
              <div
                className="hover:bg-muted/40 grid transition-colors"
                style={{ gridTemplateColumns: gridTemplate }}
              >
                {columns.map((column) => (
                  <Cell
                    key={column.key}
                    column={column}
                    row={row}
                    expanded={expanded}
                    onExpand={() => onToggleRow(row.id)}
                  />
                ))}
              </div>
              {expanded ? <ExpandedDetail row={row} /> : null}
            </div>
          )
        })}
      </div>

      <div className="flex h-9 shrink-0 items-center gap-4 border-t px-4">
        <span className="text-muted-foreground text-[11px] tabular-nums">
          {totals.range} drugs
        </span>
        <Separator orientation="vertical" className="h-3.5" />
        {aggregates.map((aggregate) => (
          <span key={aggregate.label} className="text-[11px]">
            <span className="text-muted-foreground">{aggregate.label} </span>
            <span className="font-medium tabular-nums">{aggregate.value}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
