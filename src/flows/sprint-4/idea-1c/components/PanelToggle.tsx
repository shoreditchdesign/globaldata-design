import { SearchIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

/**
 * The search panel's open and close control. Open, it is a quiet text button
 * at the panel's head — Close search, with an X — and closed, the rail the
 * panel folds down to holds a search icon that brings it back. Both are
 * ghost buttons on the grey chrome: no fill or edge at rest, a grey wash on
 * hover.
 *
 * Naming, agreed 6 Oct: the panel is the search, so its toggle says "Close
 * search" / "Open search", as the Quick search / Advanced search tabs do.
 * Everything inside it that narrows the results is a filter (Add filter,
 * Search filters, the filter bar). "Filters" was tried on this toggle and
 * reversed the same day.
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
  if (open) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        // No aria-expanded: the ghost variant fills an expanded button grey,
        // and this one should rest bare. Its label says what it does.
        aria-controls={controls}
        onClick={onToggle}
        className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-md text-[13px]"
      >
        Close search
        <XIcon data-icon="inline-end" />
      </Button>
    )
  }
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Open search"
          aria-expanded={false}
          aria-controls={controls}
          onClick={onToggle}
          className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-md"
        >
          <SearchIcon />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right">Open search</TooltipContent>
    </Tooltip>
  )
}
