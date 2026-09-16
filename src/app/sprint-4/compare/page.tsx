import { notFound } from "next/navigation"

import { CompareView } from "@/components/prototype/CompareView"
import { getSprint } from "@/flows/registry"

export default function Page() {
  const sprint = getSprint("sprint-4")
  if (!sprint) notFound()

  return (
    <CompareView
      sprintId={sprint.id}
      sprintName={sprint.name}
      ideas={sprint.ideas.map((idea) => ({
        id: idea.id,
        name: idea.name,
        premise: idea.premise,
        screens: idea.screens.map(({ slug, title }) => ({ slug, title })),
      }))}
    />
  )
}
