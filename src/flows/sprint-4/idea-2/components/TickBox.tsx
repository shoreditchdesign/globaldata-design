"use client"

import * as React from "react"
import { CheckIcon, MinusIcon } from "lucide-react"
import { Checkbox as CheckboxPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

/**
 * The shadcn checkbox with its mark able to change: a tick for a value the
 * query keeps, a minus for one it drops.
 *
 * The three ways into the query have to agree, and a value under `is not` is
 * not unticked — it is chosen, and then excluded. Drawn as a plain tick, the
 * tree and the filter bar would both claim the opposite of what the sentence
 * says. The registry's own checkbox hard-codes its tick, so the mark is swapped
 * here rather than by editing a generated component.
 */
export function TickBox({
  checked,
  excluded,
  onCheckedChange,
  className,
  ...props
}: Omit<React.ComponentProps<typeof CheckboxPrimitive.Root>, "checked"> & {
  checked: boolean
  /** The condition this value belongs to drops its rows rather than keeping them. */
  excluded?: boolean
}) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      checked={checked}
      onCheckedChange={onCheckedChange}
      className={cn(
        "border-muted-foreground/50 bg-background focus-visible:border-ring focus-visible:ring-ring/50 peer relative flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-[4px] border transition-colors outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50",
        checked &&
          (excluded
            ? "bg-negative-ink border-negative-ink text-background"
            : "bg-selected border-selected text-selected-foreground"),
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="grid place-content-center text-current">
        {excluded ? <MinusIcon className="size-3.5" /> : <CheckIcon className="size-3.5" />}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}
