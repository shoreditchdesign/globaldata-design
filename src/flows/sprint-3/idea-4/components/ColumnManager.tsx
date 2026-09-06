"use client"

import { GripVerticalIcon, PinIcon, PlusIcon, SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import {
  availableColumnTotal,
  availableColumns,
  shownColumns,
} from "@/flows/sprint-3/idea-4/data"

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-muted-foreground px-3 pt-2.5 pb-1 text-[10px] font-medium tracking-[0.08em] uppercase">
      {children}
    </p>
  )
}

/**
 * Column management, which the live product does not have: eight locked
 * columns and twenty-eight more you cannot reach. Here every column can be
 * hidden, reordered by its handle, or pinned left, and the twenty-eight
 * unused attributes are one click from the grid.
 */
export function ColumnManager() {
  return (
    <div className="flex flex-col">
      <div className="p-1.5">
        <div className="border-input focus-within:border-ring flex h-7 items-center gap-2 rounded-md border px-2">
          <SearchIcon className="text-muted-foreground size-3.5 shrink-0" />
          <input
            className="placeholder:text-muted-foreground w-full bg-transparent text-[12.5px] outline-none"
            placeholder="Find a column"
            readOnly
          />
        </div>
      </div>

      <Separator />

      <div className="max-h-[380px] overflow-y-auto pb-1.5">
        <SectionLabel>In the grid — {shownColumns.length}</SectionLabel>
        <div className="px-1.5">
          {shownColumns.map((column) => (
            <div
              key={column.label}
              className="hover:bg-muted group/row flex h-7 items-center gap-2 rounded-md pr-1.5 pl-1 text-[12.5px] transition-colors"
            >
              <GripVerticalIcon className="text-muted-foreground/60 size-3.5 shrink-0 cursor-grab" />
              <Checkbox checked className="size-3.5" />
              <span className="min-w-0 flex-1 truncate">{column.label}</span>
              <PinIcon
                className={cn(
                  "size-3.5 shrink-0",
                  column.pinned
                    ? "fill-foreground text-foreground"
                    : "text-muted-foreground/50 opacity-0 group-hover/row:opacity-100"
                )}
              />
            </div>
          ))}
        </div>

        <SectionLabel>Available — {availableColumnTotal}</SectionLabel>
        <div className="px-1.5">
          {availableColumns.map((label) => (
            <div
              key={label}
              className="hover:bg-muted group/row text-muted-foreground flex h-7 items-center gap-2 rounded-md pr-1.5 pl-1 text-[12.5px] transition-colors"
            >
              <span className="size-3.5 shrink-0" />
              <Checkbox className="size-3.5" />
              <span className="min-w-0 flex-1 truncate">{label}</span>
              <PlusIcon className="size-3.5 shrink-0 opacity-0 group-hover/row:opacity-100" />
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <p className="text-muted-foreground text-[11px] tabular-nums">
          {shownColumns.length} of {shownColumns.length + availableColumnTotal} columns shown
        </p>
        <Button variant="ghost" size="xs">
          Reset
        </Button>
      </div>
    </div>
  )
}
