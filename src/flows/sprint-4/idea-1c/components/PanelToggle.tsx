import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

/**
 * The search panel's open and close control: a bare chevron, pointing left to
 * fold the panel away and right to bring it back, with a tooltip naming what
 * it does. Rounded like the query box's dictation and send buttons. It sits at the panel's head while the panel is
 * open, and over the table's checkbox lane once it is closed.
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
          // Hide (panel open) sits on the grey panel, so it gets a white fill and
          // the table's edge to read as a control; Show stays a plain ghost.
          className="text-muted-foreground aria-expanded:text-muted-foreground aria-expanded:hover:text-foreground aria-expanded:bg-surface-panel aria-expanded:border-edge aria-expanded:hover:bg-muted rounded-md border border-transparent"
        >
          {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
