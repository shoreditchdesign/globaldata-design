"use client"

import * as React from "react"

import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import type { SearchMode } from "@/flows/sprint-4/idea-1c/state"
import { cn } from "@/lib/utils"

/**
 * Advanced search, as a switch inside the search field.
 *
 * Hidden for now: nothing renders it, and the Search / Advanced filter tabs
 * (SearchTabs) carry the mode instead. Kept so it can come back.
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
        // The stock off track is `input`, the same pale grey as a field's
        // border, and on chrome it all but vanished, so the switch read as a
        // smudge rather than a control. Off takes the ring grey instead and the
        // thumb a small shadow, so it reads as a switch in either state.
        className="data-unchecked:bg-ring [&_[data-slot=switch-thumb]]:shadow-xs"
      />
      <Label htmlFor={id} className="text-muted-foreground text-[13px] font-normal">
        Advanced filter
      </Label>
    </div>
  )
}
