import type { Flow, Sprint } from "@/flows/types"
import { sprint2Idea1 } from "@/flows/sprint-2/idea-1/flow"
import { sprint2Idea2 } from "@/flows/sprint-2/idea-2/flow"
import { sprint2Idea3 } from "@/flows/sprint-2/idea-3/flow"

export const sprints: Sprint[] = [
  {
    id: "sprint-2",
    name: "Sprint 2",
    goal: "Natural-language search over the GlobalData filter model — three input modalities compared.",
    ideas: [sprint2Idea1, sprint2Idea2, sprint2Idea3],
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
