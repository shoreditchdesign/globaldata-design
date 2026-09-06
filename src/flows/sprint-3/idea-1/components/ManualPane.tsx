import { CheckIcon, ChevronLeftIcon, ChevronRightIcon, SearchIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { PaneHeading } from "@/flows/sprint-3/idea-1/components/FilterModal"
import { productAreas } from "@/components/prototype/product-areas"

/**
 * Left pane of the manual tab: a column of area pills, with the cascading
 * popover anchored beside whichever area is open.
 *
 * The popover is rendered inside the open pill's row and pushed out to its
 * right, so it lands where the source draws it for `Drugs` and lands correctly
 * for the seven areas the source never drew open. It still overlaps the pills
 * below it, which is the point — a menu on top of a menu is the thing being
 * argued about.
 */
export function ManualPane({
  openArea,
  areaCounts = {},
  breadcrumbPill,
  onSelectArea,
  popover,
}: {
  openArea?: string | null
  areaCounts?: Record<string, number>
  /** Second pill rendered beside the open area, e.g. `Therapy Area / Indication`. */
  breadcrumbPill?: string
  onSelectArea: (area: string | null) => void
  popover?: React.ReactNode
}) {
  const dimOthers = Boolean(openArea)

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PaneHeading title="Manual filter" />

      <div className="relative min-h-0 flex-1 px-6 pt-6">
        <div className="flex w-fit flex-col items-start gap-2">
          {productAreas.map((area) => {
            const isOpen = area === openArea
            return (
              <div key={area} className={cn("flex items-center gap-2", isOpen && "relative z-10")}>
                <button
                  type="button"
                  onClick={() => onSelectArea(isOpen ? null : area)}
                  className={cn(
                    "bg-muted hover:bg-accent inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-opacity",
                    dimOthers && !isOpen && "opacity-20",
                  )}
                >
                  {area}
                  {areaCounts[area] ? (
                    <Badge className="size-4 rounded-full p-0 text-[10px] tabular-nums">
                      {areaCounts[area]}
                    </Badge>
                  ) : null}
                </button>
                {isOpen && breadcrumbPill ? (
                  <span className="bg-muted inline-flex items-center rounded-full px-4 py-2 text-sm">
                    {breadcrumbPill}
                  </span>
                ) : null}
                {isOpen ? popover : null}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/**
 * The cascading panel.
 *
 * A flex column, so the height cap is absorbed by the list scrolling rather
 * than by the panel overflowing its container — the modal is `overflow-hidden`,
 * and on a short window the panel would otherwise be cut off.
 */
export function CascadePanel({
  title,
  breadcrumb,
  searchPlaceholder = "Search",
  className,
  children,
  selectedCount = 0,
  search = "",
  onSearch,
  onBack,
  onDone,
}: {
  title?: string
  breadcrumb?: [string, string]
  searchPlaceholder?: string
  className?: string
  children: React.ReactNode
  selectedCount?: number
  search?: string
  onSearch?: (value: string) => void
  onBack?: () => void
  onDone?: () => void
}) {
  return (
    <div
      className={cn(
        "bg-surface-raised border-border shadow-raised absolute flex w-[280px] flex-col overflow-hidden rounded-lg border",
        className,
      )}
    >
      <div className="bg-surface-sunken border-hairline text-muted-foreground flex shrink-0 items-center gap-1.5 border-b px-3 py-2.5 text-[10px] font-medium tracking-[0.08em] uppercase">
        {breadcrumb ? (
          <button
            type="button"
            onClick={onBack}
            aria-label={`Back to ${breadcrumb[0]}`}
            className="hover:text-foreground flex items-center gap-1.5 transition-colors"
          >
            <ChevronLeftIcon className="size-3" />
            <span>{breadcrumb[0]}</span>
            <ChevronRightIcon className="size-3" />
            <span className="text-foreground">{breadcrumb[1]}</span>
          </button>
        ) : (
          title
        )}
      </div>

      <label className="text-muted-foreground flex shrink-0 items-center gap-2 border-b px-3 py-2.5 text-sm">
        <SearchIcon className="size-3.5 shrink-0" />
        <input
          value={search}
          onChange={(event) => onSearch?.(event.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          className="text-foreground placeholder:text-muted-foreground w-full bg-transparent outline-none"
        />
      </label>

      <div className="min-h-0 flex-auto overflow-y-auto py-1">{children}</div>

      <div className="text-muted-foreground flex shrink-0 items-stretch border-t text-[10px] font-medium tracking-[0.08em] uppercase">
        <span className="bg-surface-sunken flex-1 px-3 py-2.5 tabular-nums">{selectedCount} selected</span>
        <button
          type="button"
          onClick={onDone}
          className="hover:text-foreground flex items-center gap-1.5 border-l px-3 py-2.5 transition-colors"
        >
          Done <CheckIcon className="size-3" />
        </button>
      </div>
    </div>
  )
}

/** A drill-down row: label plus a chevron into the next level. */
export function CascadeRow({
  label,
  muted = false,
  onClick,
}: {
  label: string
  muted?: boolean
  onClick?: () => void
}) {
  if (muted) {
    return <p className="text-muted-foreground/70 px-3 pt-3 pb-1 text-sm">{label}</p>
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className="hover:bg-muted flex w-full items-center justify-between px-3 py-1.5 text-left text-sm"
    >
      {label}
      <ChevronRightIcon className="text-muted-foreground size-3.5 shrink-0" />
    </button>
  )
}

/** A selectable value row: checkbox, label, result count, chevron. */
export function CascadeValueRow({
  label,
  count,
  checked = false,
  onClick,
}: {
  label: string
  count: number
  checked?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={checked}
      className="hover:bg-muted flex w-full items-center gap-2.5 px-3 py-1.5 text-left text-sm"
    >
      <span
        className={cn(
          "flex size-4 shrink-0 items-center justify-center rounded-[4px] border",
          checked && "bg-brand border-brand text-brand-foreground",
        )}
      >
        {checked ? <CheckIcon className="size-3" /> : null}
      </span>
      <span className="flex-1 truncate">{label}</span>
      <span className="text-muted-foreground text-xs tabular-nums">
        {count.toLocaleString("en-GB")}
      </span>
      <ChevronRightIcon className="text-muted-foreground size-3.5 shrink-0" />
    </button>
  )
}
