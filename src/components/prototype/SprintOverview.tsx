import Link from "next/link"
import { notFound } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { getSprint } from "@/flows/registry"

export function SprintOverview({ sprintId }: { sprintId: string }) {
  const sprint = getSprint(sprintId)
  if (!sprint) notFound()

  return (
    <div className="bg-muted/30 min-h-svh">
      <div className="mx-auto w-full max-w-[1100px] px-6 py-16">
        <Button asChild size="sm" variant="ghost" className="-ml-3 mb-6">
          <Link href="/">← All sprints</Link>
        </Button>

        <h1 className="text-3xl font-semibold tracking-tight">{sprint.name}</h1>
        <p className="text-muted-foreground mt-3 max-w-2xl text-sm">{sprint.goal}</p>

        <div className="mt-6 flex gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href={`/${sprint.id}/compare`}>Compare both ideas</Link>
          </Button>
        </div>

        <Separator className="my-10" />

        <div className="grid gap-6 sm:grid-cols-2">
          {sprint.ideas.map((idea) => (
            <Card key={idea.id}>
              <CardHeader>
                <CardTitle>{idea.name}</CardTitle>
                <CardDescription>{idea.premise}</CardDescription>
                <CardAction>
                  <Badge variant="outline" className="capitalize">
                    {idea.status.replace("-", " ")}
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {idea.rationale && idea.rationale.length > 0 ? (
                  <ul className="text-muted-foreground list-disc space-y-1 pl-4 text-sm">
                    {idea.rationale.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                ) : null}

                <ol className="text-sm">
                  {idea.screens.map((screen, i) => (
                    <li key={screen.slug} className="border-b py-2 last:border-0">
                      <Link
                        href={`/${sprint.id}/${idea.id}/${screen.slug}`}
                        className="flex items-center gap-3 hover:underline"
                      >
                        <span className="text-muted-foreground tabular-nums">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        {screen.title}
                      </Link>
                    </li>
                  ))}
                </ol>

                <Button asChild size="sm" className="w-fit">
                  <Link href={`/${sprint.id}/${idea.id}`}>Open flow</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
