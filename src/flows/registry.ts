import type { Flow, Sprint } from "@/flows/types"
import { sprint3Idea1 } from "@/flows/sprint-3/idea-1/flow"
import { sprint3Idea2 } from "@/flows/sprint-3/idea-2/flow"
import { sprint3Idea3 } from "@/flows/sprint-3/idea-3/flow"

export const sprints: Sprint[] = [
  {
    id: "sprint-3",
    name: "Sprint 3",
    goal: "Natural-language search over the GlobalData filter model — the reviewed design as a baseline, against two new directions.",
    ideas: [sprint3Idea1, sprint3Idea2, sprint3Idea3],
  },
]

export function getSprint(sprintId: string) {
  return sprints.find((s) => s.id === sprintId)
}

export function getFlow(sprintId: string, ideaId: string) {
  return getSprint(sprintId)?.ideas.find((i) => i.id === ideaId)
}

export function getScreen(sprintId: string, ideaId: string, slug: string) {
  return getFlow(sprintId, ideaId)?.screens.find((sc) => sc.slug === slug)
}

/**
 * Serialisable view of the registry. Screen components cannot cross the
 * server/client boundary, so the Explorer gets titles and slugs only.
 */
export interface NavScreen {
  slug: string
  title: string
}

export interface NavIdea {
  id: string
  name: string
  status: Flow["status"]
  screens: NavScreen[]
}

export interface NavSprint {
  id: string
  name: string
  ideas: NavIdea[]
}

export function getNavTree(): NavSprint[] {
  return sprints.map((sprint) => ({
    id: sprint.id,
    name: sprint.name,
    ideas: sprint.ideas.map((idea) => ({
      id: idea.id,
      name: idea.name,
      status: idea.status,
      screens: idea.screens.map(({ slug, title }) => ({ slug, title })),
    })),
  }))
}
