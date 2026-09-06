"use client"

import { useState } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface CompareIdea {
  id: string
  name: string
  premise: string
  screens: { slug: string; title: string }[]
}

/**
 * Side-by-side review of two ideas at the same step of the flow.
 * Each pane is an iframe of the real route, so what the client sees in
 * review is exactly what they see when clicking through on their own. The
 * Explorer hides itself inside an iframe, so the panes stay bare.
 *
 * Reachable from the Explorer only — it is not on the index.
 */
export function CompareView({
  sprintId,
  sprintName,
  ideas,
}: {
  sprintId: string
  sprintName: string
  ideas: CompareIdea[]
}) {
  const steps = Math.max(...ideas.map((i) => i.screens.length))
  const [step, setStep] = useState(0)

  return (
    <div className="bg-muted/30 flex min-h-svh flex-col">
      <header className="bg-background border-b">
        <div className="mx-auto flex w-full max-w-[1600px] flex-wrap items-center gap-4 px-6 py-3">
          <Button asChild size="sm" variant="ghost" className="-ml-3">
            <Link href="/">← All sprints</Link>
          </Button>
          <Badge variant="secondary">{sprintName} — compare</Badge>
          <div className="ml-auto flex items-center gap-2">
            {Array.from({ length: steps }, (_, i) => (
              <Button
                key={i}
                size="sm"
                variant={i === step ? "default" : "ghost"}
                onClick={() => setStep(i)}
              >
                <span className="tabular-nums">{String(i + 1).padStart(2, "0")}</span>
              </Button>
            ))}
          </div>
        </div>
      </header>

      <main
        className="mx-auto grid w-full max-w-[1600px] flex-1 gap-6 px-6 py-8"
        style={{ gridTemplateColumns: `repeat(${ideas.length}, minmax(0, 1fr))` }}
      >
        {ideas.map((idea) => {
          const screen = idea.screens[step]
          return (
            <section key={idea.id} className="flex min-w-0 flex-col gap-3">
              <div>
                <h2 className="font-semibold tracking-tight">{idea.name}</h2>
                <p className="text-muted-foreground text-sm">
                  {screen ? screen.title : "No screen at this step"}
                </p>
              </div>
              <div className="bg-background flex-1 overflow-hidden rounded-xl border shadow-sm">
                {screen ? (
                  <iframe
                    key={`${idea.id}-${screen.slug}`}
                    src={`/${sprintId}/${idea.id}/${screen.slug}`}
                    title={`${idea.name} — ${screen.title}`}
                    className="h-[720px] w-full"
                  />
                ) : (
                  <div className="text-muted-foreground flex h-[720px] items-center justify-center text-sm">
                    This idea has no screen {step + 1}.
                  </div>
                )}
              </div>
            </section>
          )
        })}
      </main>
    </div>
  )
}
