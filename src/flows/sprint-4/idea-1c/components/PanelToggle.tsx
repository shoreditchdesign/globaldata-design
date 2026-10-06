import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

/**
 * The search panel's open and close control: a bare chevron, pointing left to
 * fold the panel away and right to bring it back, with a tooltip naming what
 * it does. Rounded like the query box's dictation and send buttons. It sits at
 * the panel's head while the panel is open, and at the top of the rail the
 * panel folds down to once it is closed.
 */
export function PanelToggle({
  open,
  onToggle,
  controls,
}: {
  open: boolean
  onToggle: () => void
  /** The id of the panel it opens and closes, where it is known. */
  controls?: string
}) {
  const label = open ? "Hide filters" : "Show filters"
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={label}
          aria-expanded={open}
          aria-controls={controls}
          onClick={onToggle}
          // Both states sit on the grey chrome — the panel's head or the rail —
          // so both get a white fill and the table's edge to read as a control.
          className="text-muted-foreground hover:text-foreground bg-surface-panel border-edge hover:bg-muted rounded-md border"
        >
          {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
