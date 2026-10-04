"use client"

import * as React from "react"

import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import type { SearchMode } from "@/flows/sprint-4/idea-1c/state"
import { cn } from "@/lib/utils"

/**
 * Advanced search, as a switch inside the search field.
 *
 * It replaces the Quick / Advanced tabs, which filled the mode they were on
 * with solid brand: a tab is not a checked control, so it should have taken
 * the wash, and two tabs for one on/off choice were heavier than the choice.
 * A switch is that choice exactly, and a checked switch is one of the few
 * things the accent is for. On the landing page it sits in the search field,
 * which is what it changes: on, the field is joined by the filter builder;
 * off, by the pills. On the results page it heads the chat section, over the
 * pills or the columns it swaps between.
 */
export function AdvancedToggle({
  mode,
  onModeChange,
  disabled,
  className,
}: {
  mode: SearchMode
  onModeChange: (mode: SearchMode) => void
  disabled?: boolean
  className?: string
}) {
  const id = React.useId()
  return (
    <div className={cn("flex shrink-0 items-center gap-2", className)}>
      <Switch
        id={id}
        checked={mode === "manual"}
        disabled={disabled}
        onCheckedChange={(checked) => onModeChange(checked ? "manual" : "quick")}
      />
      <Label htmlFor={id} className="text-muted-foreground text-[13px] font-normal">
        Advanced filter
      </Label>
    </div>
  )
}
