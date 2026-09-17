import { ArrowRightIcon, SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { searchCategories } from "@/flows/sprint-4/idea-1/data"
import type { SearchMode } from "@/flows/sprint-4/idea-1/state"

export function LandingPage({
  mode,
  query,
  onModeChange,
  onQueryChange,
}: {
  mode: SearchMode
  query: string
  onModeChange: (mode: SearchMode) => void
  onQueryChange: (query: string) => void
}) {
  const hasQuery = query.trim().length > 0

  return (
    <main className="bg-surface-page min-h-0 flex-1 overflow-y-auto">
      <section className="mx-auto flex w-full max-w-4xl flex-col px-8 pt-[clamp(64px,12vh,128px)] pb-16">
        <Tabs value={mode} onValueChange={(value) => onModeChange(value as SearchMode)}>
          <TabsList aria-label="Search method">
            <TabsTrigger value="quick" className="px-3">
              Quick search
            </TabsTrigger>
            <TabsTrigger value="manual" className="px-3">
              Manual search
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="mt-8">
          <h1 className="text-2xl font-semibold tracking-tight">Drug Database</h1>
          <p className="text-muted-foreground mt-2 max-w-3xl text-sm leading-6">
            Describe any key search metrics such as Therapy Area, Classification, Geography,
            Route of Administration etc.
          </p>
        </div>

        <form
          className="bg-surface-panel border-border focus-within:border-ring mt-7 flex min-h-16 items-center gap-3 rounded-xl border px-4 transition-colors"
          onSubmit={(event) => event.preventDefault()}
        >
          <SearchIcon className="text-muted-foreground size-5 shrink-0" aria-hidden />
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Ask anything"
            aria-label="Describe the drugs you are looking for"
            className="placeholder:text-muted-foreground h-16 min-w-0 flex-1 bg-transparent text-base outline-none"
          />
          <Button
            type="submit"
            size="icon-lg"
            disabled={!hasQuery}
            aria-label="Build filters from this search"
            className="rounded-full"
          >
            <ArrowRightIcon />
          </Button>
        </form>

        <nav aria-label="Search categories" className="mt-5 flex flex-wrap gap-2">
          {searchCategories.map((category) => (
            <button
              key={category}
              type="button"
              className="bg-surface-panel border-border hover:bg-accent inline-flex h-8 items-center rounded-full border px-3.5 text-[13px] transition-colors"
            >
              {category}
            </button>
          ))}
        </nav>
      </section>
    </main>
  )
}
