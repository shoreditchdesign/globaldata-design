import { CheckIcon, ChevronLeftIcon, ChevronRightIcon, SearchIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { PaneHeading } from "@/flows/sprint-3/idea-1/components/FilterModal"
import { productAreas } from "@/components/prototype/product-areas"

/**
 * Left pane of the manual tab: a column of area pills, with the cascading
 * popover anchored beside whichever area is open.
 */
export function ManualPane({
  openArea,
  areaCounts = {},
  breadcrumbPill,
  dimOthers = false,
  popover,
}: {
  openArea?: string
  areaCounts?: Record<string, number>
  /** Second pill rendered beside the open area, e.g. `Therapy Area / Indication`. */
  breadcrumbPill?: string
  dimOthers?: boolean
  popover?: React.ReactNode
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PaneHeading title="Manual filter" subtitle="Select an area to create a filter" />

      <div className="relative min-h-0 flex-1 px-6 pt-6">
        <div className="flex w-fit flex-col items-start gap-2">
          {productAreas.map((area) => {
            const isOpen = area === openArea
            return (
              <div key={area} className="flex items-center gap-2">
                <span
                  className={cn(
                    "bg-muted inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm",
                    dimOthers && !isOpen && "opacity-20",
                  )}
                >
                  {area}
                  {areaCounts[area] ? (
                    <Badge className="size-4 rounded-full p-0 text-[10px] tabular-nums">
                      {areaCounts[area]}
                    </Badge>
                  ) : null}
                </span>
                {isOpen && breadcrumbPill ? (
                  <span className="bg-muted inline-flex items-center rounded-full px-4 py-2 text-sm">
                    {breadcrumbPill}
                  </span>
                ) : null}
              </div>
            )
          })}
        </div>

        {popover}
      </div>
    </div>
  )
}

/**
 * The cascading panel. Positioned absolutely so each screen can place it.
 *
 * A flex column, so a `max-h-*` in `className` is absorbed by the value list
 * scrolling rather than by the panel overflowing its container — the modal is
 * `overflow-hidden`, and on a short window the panel would otherwise be cut off.
 */
export function CascadePanel({
  title,
  breadcrumb,
  searchPlaceholder = "Search",
  className,
  children,
  selectedCount = 0,
}: {
  title?: string
  breadcrumb?: [string, string]
  searchPlaceholder?: string
  className?: string
  children: React.ReactNode
  selectedCount?: number
}) {
  return (
    <div
      className={cn(
        "bg-background absolute flex w-[280px] flex-col overflow-hidden rounded-lg border shadow-lg",
        className,
      )}
    >
      <div className="bg-muted/60 text-muted-foreground flex shrink-0 items-center gap-1.5 border-b px-3 py-2.5 text-[10px] font-medium tracking-[0.08em] uppercase">
        {breadcrumb ? (
          <>
            <ChevronLeftIcon className="size-3" />
            <span>{breadcrumb[0]}</span>
            <ChevronRightIcon className="size-3" />
            <span className="text-foreground">{breadcrumb[1]}</span>
          </>
        ) : (
          title
        )}
      </div>

      <div className="text-muted-foreground flex shrink-0 items-center gap-2 border-b px-3 py-2.5 text-sm">
        <SearchIcon className="size-3.5" />
        {searchPlaceholder}
      </div>

      <div className="max-h-[420px] min-h-0 overflow-y-auto py-1">{children}</div>

      <div className="text-muted-foreground flex shrink-0 items-stretch border-t text-[10px] font-medium tracking-[0.08em] uppercase">
        <span className="bg-muted/60 flex-1 px-3 py-2.5 tabular-nums">
          {selectedCount} selected
        </span>
        <span className="flex items-center gap-1.5 border-l px-3 py-2.5">
          Done <CheckIcon className="size-3" />
        </span>
      </div>
    </div>
  )
}

/** A drill-down row: label plus a chevron into the next level. */
export function CascadeRow({ label, muted = false }: { label: string; muted?: boolean }) {
  if (muted) {
    return <p className="text-muted-foreground/70 px-3 pt-3 pb-1 text-sm">{label}</p>
  }
  return (
    <span className="hover:bg-muted flex items-center justify-between px-3 py-1.5 text-sm">
      {label}
      <ChevronRightIcon className="text-muted-foreground size-3.5" />
    </span>
  )
}

/** A selectable value row: checkbox, label, result count, chevron. */
export function CascadeValueRow({
  label,
  count,
  checked = false,
}: {
  label: string
  count: number
  checked?: boolean
}) {
  return (
    <span className="hover:bg-muted flex items-center gap-2.5 px-3 py-1.5 text-sm">
      <span
        className={cn(
          "flex size-4 shrink-0 items-center justify-center rounded-[4px] border",
          checked && "bg-primary border-primary text-primary-foreground",
        )}
      >
        {checked ? <CheckIcon className="size-3" /> : null}
      </span>
      <span className="flex-1">{label}</span>
      <span className="text-muted-foreground text-xs tabular-nums">{count}</span>
      <ChevronRightIcon className="text-muted-foreground size-3.5" />
    </span>
  )
}
