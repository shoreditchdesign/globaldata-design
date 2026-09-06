import { SearchIcon } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { filterAreas } from "@/flows/sprint-3/idea-4/data"

/**
 * Product chrome for the results-first grid. The entity areas sit in the
 * header as a top-level tab bar rather than inside a filter pane — in this
 * direction there is no filter surface to put them in.
 */
export function AppChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background flex h-full flex-col overflow-hidden">
      <header className="flex h-14 shrink-0 items-center gap-6 border-b px-4">
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 20 20" className="size-5" aria-hidden>
            <circle cx="10" cy="10" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
            <path d="M10 4.5 A5.5 5.5 0 0 0 10 15.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
          </svg>
          <span className="text-[15px] font-semibold tracking-tight">GlobalData</span>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="border-input text-muted-foreground flex h-8 w-64 items-center gap-2 rounded-lg border px-2.5 text-[13px]">
            <SearchIcon className="size-3.5" />
            <span>Search all data</span>
          </div>
          <Avatar className="size-7">
            <AvatarFallback className="text-[11px]">BR</AvatarFallback>
          </Avatar>
        </div>
      </header>

      <nav className="flex h-9 shrink-0 items-center gap-1 border-b px-3">
        {filterAreas.map((area) => {
          const active = area === "Drugs"
          return (
            <span
              key={area}
              className={cn(
                "relative flex h-full items-center px-2.5 text-[12.5px] whitespace-nowrap",
                active
                  ? "text-foreground after:bg-foreground font-medium after:absolute after:inset-x-2.5 after:-bottom-px after:h-0.5"
                  : "text-muted-foreground"
              )}
            >
              {area}
            </span>
          )
        })}
      </nav>

      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  )
}
