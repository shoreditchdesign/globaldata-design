import { PanelLeftIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

/**
 * The search panel's open and close control: a bare PanelLeft icon with a
 * tooltip naming what it does. It sits at the panel's head while the panel is
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
          className="text-muted-foreground"
        >
          <PanelLeftIcon />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
