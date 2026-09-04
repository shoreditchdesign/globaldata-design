import Link from "next/link"

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
import { sprints } from "@/flows/registry"

export default function Home() {
  return (
    <div className="bg-muted/30 min-h-svh">
      <div className="mx-auto w-full max-w-[1100px] px-6 py-16">
        <header className="mb-12">
          <p className="text-muted-foreground text-sm font-medium">GlobalData</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Design sprints</h1>
          <p className="text-muted-foreground mt-3 max-w-2xl text-sm">
            Interactive prototypes for each sprint. Every sprint carries two independent takes on
            the same flow so they can be reviewed side by side. Built with shadcn/ui, light mode
            only.
          </p>
        </header>

        <div className="flex flex-col gap-8">
          {sprints.map((sprint) => (
            <section key={sprint.id}>
              <div className="mb-4 flex items-baseline gap-3">
                <h2 className="text-xl font-semibold tracking-tight">{sprint.name}</h2>
                <p className="text-muted-foreground text-sm">{sprint.goal}</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
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
                    <CardContent className="flex items-center justify-between">
                      <p className="text-muted-foreground text-sm">
                        {idea.screens.length} screen{idea.screens.length === 1 ? "" : "s"}
                      </p>
                      <Button asChild size="sm">
                        <Link href={`/${sprint.id}/${idea.id}`}>Open</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-4">
                <Button asChild size="sm" variant="outline">
                  <Link href={`/${sprint.id}`}>{sprint.name} overview</Link>
                </Button>
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
