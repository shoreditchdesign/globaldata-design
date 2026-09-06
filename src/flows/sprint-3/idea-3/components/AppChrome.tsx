import { BellIcon, ChevronDownIcon, SearchIcon } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Product header. The global search sitting top-right is the point of the
 * pitch: the platform already ships a fast cross-entity natural-language
 * search here, and nothing found in it can be carried into a screener. The
 * sentence below is that same search, wired to the data.
 */
export function AppChrome({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("bg-background flex h-full flex-col overflow-hidden", className)}>
      <header className="flex h-[60px] shrink-0 items-center gap-8 border-b px-6">
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 20 20" className="size-5" aria-hidden>
            <circle cx="10" cy="10" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
            <path d="M10 4.5 A5.5 5.5 0 0 0 10 15.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
          </svg>
          <span className="text-[15px] font-semibold tracking-tight">GlobalData</span>
        </div>

        <nav className="text-muted-foreground flex items-center gap-5 text-[13px]">
          <span className="text-foreground font-medium">Drugs</span>
          <span>Companies</span>
          <span>Deals</span>
          <span className="flex items-center gap-1">
            Analysis <ChevronDownIcon className="size-3" />
          </span>
        </nav>

        <div className="ml-auto flex items-center gap-4">
          <div className="text-muted-foreground bg-muted/60 flex h-8 w-[260px] items-center gap-2 rounded-lg border px-3 text-[13px]">
            <SearchIcon className="size-3.5" />
            <span>Search across GlobalData</span>
          </div>
          <BellIcon className="text-muted-foreground size-4" />
          <span className="bg-muted text-muted-foreground flex size-7 items-center justify-center rounded-full text-[11px] font-medium">
            ND
          </span>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  )
}
