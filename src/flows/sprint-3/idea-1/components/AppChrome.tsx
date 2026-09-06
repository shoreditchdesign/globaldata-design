import { cn } from "@/lib/utils"

/** Thin product header. The wordmark is drawn rather than imported — static prototype. */
export function AppChrome({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("bg-background flex h-full flex-col overflow-hidden", className)}>
      <header className="flex h-[68px] shrink-0 items-center border-b px-6">
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 20 20" className="size-5" aria-hidden>
            <circle cx="10" cy="10" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
            <path d="M10 4.5 A5.5 5.5 0 0 0 10 15.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
          </svg>
          <span className="text-[17px] font-semibold tracking-tight">GlobalData</span>
        </div>
      </header>
      <div className="relative min-h-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  )
}
