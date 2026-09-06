import { BellIcon, ChevronDownIcon, SearchIcon } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

const entities = ["Drugs", "Companies", "Deals", "Clinical Trials", "Reports"]

/**
 * Product header. Fixed height, and the body below it owns the rest of the
 * viewport — the screener never scrolls as a page, each region scrolls itself.
 */
export function AppChrome({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("bg-background flex h-full flex-col overflow-hidden", className)}>
      <header className="flex h-14 shrink-0 items-center gap-8 border-b px-5">
        <div className="flex shrink-0 items-center gap-2">
          <svg viewBox="0 0 20 20" className="size-5" aria-hidden>
            <circle cx="10" cy="10" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
            <path d="M10 4.5 A5.5 5.5 0 0 0 10 15.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
          </svg>
          <span className="text-[15px] font-semibold tracking-tight">GlobalData</span>
        </div>

        <nav className="flex items-center gap-1 text-[13px]">
          {entities.map((entity) => (
            <span
              key={entity}
              className={cn(
                "rounded-md px-2.5 py-1",
                entity === "Drugs"
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground",
              )}
            >
              {entity}
            </span>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <div className="text-muted-foreground flex h-8 w-64 items-center gap-2 rounded-lg border px-2.5 text-[13px]">
            <SearchIcon className="size-3.5 shrink-0" />
            <span className="truncate">Search all of GlobalData</span>
          </div>
          <BellIcon className="text-muted-foreground size-4" />
          <span className="text-muted-foreground flex items-center gap-1 text-[13px]">
            <Avatar className="size-6">
              <AvatarFallback className="text-[10px]">ND</AvatarFallback>
            </Avatar>
            <ChevronDownIcon className="size-3.5" />
          </span>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">{children}</div>
    </div>
  )
}
