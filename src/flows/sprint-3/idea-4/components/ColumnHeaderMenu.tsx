"use client"

import {
  ArrowDownAZIcon,
  ArrowUpAZIcon,
  LayersIcon,
  PinIcon,
  SearchIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { totals, type ColumnValue } from "@/flows/sprint-3/idea-4/data"

function MenuAction({
  icon: Icon,
  label,
  active,
}: {
  icon: typeof PinIcon
  label: string
  active?: boolean
}) {
  return (
    <button
      type="button"
      className={cn(
        "hover:bg-muted flex h-7 w-full items-center gap-2 rounded-md px-2 text-left text-[12.5px] transition-colors",
        active && "bg-muted font-medium"
      )}
    >
      <Icon className="text-muted-foreground size-3.5" />
      {label}
    </button>
  )
}

/**
 * The filter surface, such as it is: one menu per column header, opened from
 * the grid. Sort and group sit at the top because the users are
 * Excel-habituated and expect them there. Every value carries its own count,
 * and the footer says what the grid will hold — so nothing is committed blind.
 */
export function ColumnHeaderMenu({
  label,
  values,
  sorted,
}: {
  label: string
  values: ColumnValue[]
  sorted?: "asc" | "desc"
}) {
  const selected = values.filter((v) => v.checked)

  return (
    <div className="flex flex-col">
      <div className="flex items-baseline justify-between px-3 pt-2.5 pb-2">
        <span className="text-[12.5px] font-medium">{label}</span>
        <span className="text-muted-foreground text-[11px] tabular-nums">
          {values.length} values
        </span>
      </div>

      <div className="px-1.5 pb-1.5">
        <MenuAction icon={ArrowDownAZIcon} label="Sort ascending" active={sorted === "asc"} />
        <MenuAction icon={ArrowUpAZIcon} label="Sort descending" active={sorted === "desc"} />
        <MenuAction icon={LayersIcon} label="Group rows by this column" />
        <MenuAction icon={PinIcon} label="Pin column left" />
      </div>

      <Separator />

      <div className="p-1.5">
        <div className="border-input focus-within:border-ring flex h-7 items-center gap-2 rounded-md border px-2">
          <SearchIcon className="text-muted-foreground size-3.5 shrink-0" />
          <input
            className="placeholder:text-muted-foreground w-full bg-transparent text-[12.5px] outline-none"
            placeholder={`Search ${values.length} values`}
            readOnly
          />
        </div>
      </div>

      <div className="flex items-center justify-between px-3 pb-1.5">
        <span className="text-muted-foreground text-[11px]">
          {selected.length} of {values.length} selected
        </span>
        <button type="button" className="text-muted-foreground hover:text-foreground text-[11px] underline-offset-2 hover:underline">
          Clear
        </button>
      </div>

      <div className="max-h-[264px] overflow-y-auto px-1.5 pb-1.5">
        {values.map((value) => (
          <label
            key={value.label}
            className={cn(
              "hover:bg-muted flex h-7 cursor-default items-center gap-2 rounded-md px-2 text-[12.5px] transition-colors",
              value.checked && "bg-muted/60"
            )}
          >
            <Checkbox checked={value.checked} className="size-3.5" />
            <span className={cn("min-w-0 flex-1 truncate", value.checked && "font-medium")}>
              {value.label}
            </span>
            <span className="text-muted-foreground text-[11px] tabular-nums">
              {value.count.toLocaleString()}
            </span>
          </label>
        ))}
      </div>

      <Separator />

      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <p className="text-muted-foreground text-[11px] tabular-nums">
          <span className="text-foreground font-medium">{totals.matching}</span> of {totals.scope} match
        </p>
        <Button variant="ghost" size="xs">
          Reset column
        </Button>
      </div>
    </div>
  )
}
