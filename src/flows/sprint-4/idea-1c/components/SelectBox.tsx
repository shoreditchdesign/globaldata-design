"use client"

import * as React from "react"

import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

/**
 * The grid's row and select-all boxes: the shadcn Checkbox, with the two
 * things this idea needs of it that the stock one does not do.
 *
 * - **Visible at rest.** The stock edge is `input`, the same grey as a card's
 *   border, and an unticked box all but disappeared against the rows. It takes
 *   `ring` instead — the strongest neutral the system has short of text.
 * - **A part-selection that looks selected.** The stock box draws its tick on
 *   no fill when it is indeterminate, which reads as a third, broken state. It
 *   takes the same brand fill as a full selection, with a bar in place of the
 *   tick, so some and all are one family told apart by the mark.
 */
export function SelectBox({ className, ...props }: React.ComponentProps<typeof Checkbox>) {
  return <Checkbox className={cn(selectBoxClass, className)} {...props} />
}

/** The same treatment, for a stock Checkbox styled elsewhere in this idea. */
export const selectBoxClass = cn(
  "data-unchecked:border-ring",
  "data-[state=indeterminate]:border-selected data-[state=indeterminate]:bg-selected data-[state=indeterminate]:text-selected-foreground",
  // The bar: drawn by the box itself, with the stock tick hidden under it.
  "data-[state=indeterminate]:[&_svg]:hidden data-[state=indeterminate]:before:absolute data-[state=indeterminate]:before:h-0.5 data-[state=indeterminate]:before:w-2 data-[state=indeterminate]:before:rounded-full data-[state=indeterminate]:before:bg-current",
)
