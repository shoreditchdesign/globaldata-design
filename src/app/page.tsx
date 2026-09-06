import { SprintTable, type SprintTableSprint } from "@/components/prototype/SprintTable"
import { sprints } from "@/flows/registry"

const rows: SprintTableSprint[] = sprints.map((sprint) => ({
  id: sprint.id,
  name: sprint.name,
  goal: sprint.goal,
  ideas: sprint.ideas.map((idea) => ({
    id: idea.id,
    name: idea.name,
    premise: idea.premise,
    status: idea.status,
    lastUpdated: idea.lastUpdated,
    // Placeholder ideas carry a stub screen each — not a count worth showing.
    screenCount: idea.status === "placeholder" ? undefined : idea.screens.length,
    tags: idea.tags ?? [],
    href: `/${sprint.id}/${idea.id}/${idea.screens[0]?.slug ?? ""}`,
  })),
}))

export default function Home() {
  return (
    <div className="min-h-svh px-8 py-10">
      <h1 className="mb-6 text-sm font-medium tracking-tight">GlobalData — design sprints</h1>
      <SprintTable sprints={rows} defaultOpen={["sprint-3"]} />
    </div>
  )
}
