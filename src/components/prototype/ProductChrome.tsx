import { BellIcon, SearchIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { productAreas, type ProductArea } from "@/components/prototype/product-areas"

export { productAreas }
export type { ProductArea }

/**
 * Width of the global-search slot. Exported so a direction that wires the field
 * up can size its own control to the slot instead of guessing.
 */
export const SEARCH_SLOT_WIDTH = "w-[264px]"

/** The wordmark is drawn rather than imported — these are static prototypes. */
function Wordmark() {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <svg viewBox="0 0 20 20" className="size-5" aria-hidden>
        <circle cx="10" cy="10" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <path d="M10 4.5 A5.5 5.5 0 0 0 10 15.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
      </svg>
      <span className="text-[15px] font-semibold tracking-tight">GlobalData</span>
    </div>
  )
}

/**
 * The default global search: a placeholder, not a control. Every direction gets
 * this unless it passes its own node into the `search` slot.
 */
function StaticSearch({ placeholder }: { placeholder: string }) {
  return (
    <div className="border-border text-muted-foreground bg-surface-sunken flex h-8 w-full items-center gap-2 rounded-lg border px-2.5 text-[13px]">
      <SearchIcon className="size-3.5 shrink-0" />
      <span className="truncate">{placeholder}</span>
    </div>
  )
}

const bodyClass = {
  /** Full-height regions stacked vertically, each scrolling itself. */
  column: "flex min-h-0 flex-1 flex-col",
  /** Full-height regions side by side — a filter panel next to results. */
  row: "flex min-h-0 flex-1",
  /** The body scrolls as one page, the way the incumbent product does. */
  scroll: "relative min-h-0 flex-1 overflow-y-auto",
} as const

export interface ProductChromeProps {
  children: React.ReactNode
  /** Which area tab reads as current. */
  activeArea?: ProductArea
  /**
   * The global search field. Omit for the shared placeholder; pass a node to
   * make it real. The slot is `SEARCH_SLOT_WIDTH` wide and expects an `h-8`
   * control — the live platform's cross-entity natural-language search lives
   * here, and a direction arguing about it needs to be able to wire it up.
   */
  search?: React.ReactNode
  /** Text of the placeholder search. Ignored when `search` is given. */
  searchPlaceholder?: string
  /** Extra header controls, sitting before the notification and account cluster. */
  actions?: React.ReactNode
  /** Initials in the account avatar. */
  user?: string
  /** How the region under the chrome lays out. */
  body?: keyof typeof bodyClass
  className?: string
}

/**
 * The product shell every Sprint 3 direction sits inside: wordmark, the eight
 * area tabs, the global search, notifications and account.
 *
 * Two rows on purpose. The area names are long — `Advanced Company Watchlist`
 * is twenty-six characters — and will not sit inline beside a wordmark and a
 * search field without being abbreviated into something the product does not
 * call them. So identity, search and account own the first row; the areas own
 * the second, where all eight fit at full length.
 *
 * Presentational apart from `activeArea`. Nothing here is clickable, because
 * every screen is one fixed state.
 */
export function ProductChrome({
  children,
  activeArea = "Drugs",
  search,
  searchPlaceholder = "Search all of GlobalData",
  actions,
  user = "ND",
  body = "column",
  className,
}: ProductChromeProps) {
  return (
    <div className={cn("bg-surface-page flex h-full flex-col overflow-hidden", className)}>
      <header className="bg-surface-chrome border-edge flex h-14 shrink-0 items-center gap-4 border-b px-4">
        <Wordmark />

        <div className="ml-auto flex items-center gap-3">
          <div className={cn("shrink-0", SEARCH_SLOT_WIDTH)}>
            {search ?? <StaticSearch placeholder={searchPlaceholder} />}
          </div>

          {actions}

          <BellIcon className="text-muted-foreground size-4 shrink-0" aria-hidden />
          <Avatar className="size-7 shrink-0">
            <AvatarFallback className="bg-muted text-foreground text-[11px] font-medium">
              {user}
            </AvatarFallback>
          </Avatar>
        </div>
      </header>

      <nav
        aria-label="Product areas"
        className="bg-surface-chrome border-edge flex h-9 shrink-0 items-center gap-1 overflow-x-auto border-b px-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {productAreas.map((area) => {
          const active = area === activeArea
          return (
            <span
              key={area}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex h-full items-center px-2.5 text-[12.5px] whitespace-nowrap",
                active
                  ? "text-foreground after:bg-brand font-medium after:absolute after:inset-x-2.5 after:-bottom-px after:h-0.5"
                  : "text-muted-foreground",
              )}
            >
              {area}
            </span>
          )
        })}
      </nav>

      <div className={bodyClass[body]}>{children}</div>
    </div>
  )
}
