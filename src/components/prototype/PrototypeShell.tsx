import Link from "next/link"
import { notFound } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { getFlow, getSprint } from "@/flows/registry"
import { ScreenFrame } from "@/components/prototype/ScreenFrame"

const statusVariant = {
  placeholder: "outline",
  "in-progress": "secondary",
  review: "secondary",
  final: "default",
} as const

/**
 * Chrome around a single prototype screen: breadcrumb, idea switcher,
 * screen stepper. Deliberately monochrome so it never competes with the
 * design under review.
 */
export function PrototypeShell({
  sprintId,
  ideaId,
  screenSlug,
  chrome = true,
}: {
  sprintId: string
  ideaId: string
  screenSlug?: string
  /** Set false to render the screen bare — used by the compare view's iframes. */
  chrome?: boolean
}) {
  const sprint = getSprint(sprintId)
  const flow = getFlow(sprintId, ideaId)
  if (!sprint || !flow) notFound()

  const screens = flow.screens
  const index = screenSlug ? screens.findIndex((s) => s.slug === screenSlug) : 0
  if (index === -1) notFound()

  const screen = screens[index]
  const prev = screens[index - 1]
  const next = screens[index + 1]
  const Screen = screen.component
  const href = (slug: string) => `/${sprintId}/${ideaId}/${slug}`

  if (!chrome) {
    return (
      <div className="bg-background min-h-svh">
        <Screen />
      </div>
    )
  }

  return (
    <div className="flex min-h-svh flex-col bg-muted/30">
      <header className="bg-background sticky top-0 z-10 border-b">
        <div className="mx-auto flex w-full max-w-[1400px] flex-wrap items-center gap-4 px-6 py-3">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">Sprints</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={`/${sprintId}`}>{sprint.name}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{flow.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <Badge variant={statusVariant[flow.status]} className="capitalize">
            {flow.status.replace("-", " ")}
          </Badge>

          <div className="ml-auto flex items-center gap-2">
            {sprint.ideas.map((idea) => (
              <Button
                key={idea.id}
                asChild
                size="sm"
                variant={idea.id === ideaId ? "secondary" : "ghost"}
              >
                <Link href={`/${sprintId}/${idea.id}/${idea.screens[0]?.slug ?? ""}`}>
                  {idea.name}
                </Link>
              </Button>
            ))}
            <Separator orientation="vertical" className="mx-1 h-6" />
            <Button asChild size="sm" variant="outline">
              <Link href={`/${sprintId}/compare`}>Compare</Link>
            </Button>
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-[1400px] items-center gap-2 overflow-x-auto px-6 pb-3">
          {screens.map((s, i) => (
            <Button
              key={s.slug}
              asChild
              size="sm"
              variant={s.slug === screen.slug ? "default" : "ghost"}
              className="shrink-0"
            >
              <Link href={href(s.slug)}>
                <span className="text-muted-foreground mr-1.5 tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {s.title}
              </Link>
            </Button>
          ))}
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1400px] flex-1 px-6 py-8">
        <ScreenFrame viewport={screen.viewport}>
          <Screen />
        </ScreenFrame>
      </main>

      <footer className="bg-background border-t">
        <div className="mx-auto flex w-full max-w-[1400px] items-center gap-4 px-6 py-3">
          <p className="text-muted-foreground text-sm">
            <span className="text-foreground font-medium">{screen.title}</span>
            {screen.note ? ` — ${screen.note}` : null}
          </p>
          <div className="ml-auto flex gap-2">
            <Button asChild={!!prev} size="sm" variant="outline" disabled={!prev}>
              {prev ? <Link href={href(prev.slug)}>Previous</Link> : <span>Previous</span>}
            </Button>
            <Button asChild={!!next} size="sm" disabled={!next}>
              {next ? <Link href={href(next.slug)}>Next</Link> : <span>Next</span>}
            </Button>
          </div>
        </div>
      </footer>
    </div>
  )
}
