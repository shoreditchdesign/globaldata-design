import type { Sprint } from "@/flows/types"
import { sprint1Idea1 } from "@/flows/sprint-1/idea-1/flow"
import { sprint1Idea2 } from "@/flows/sprint-1/idea-2/flow"
import { sprint2Idea1 } from "@/flows/sprint-2/idea-1/flow"
import { sprint2Idea2 } from "@/flows/sprint-2/idea-2/flow"
import { sprint2Idea3 } from "@/flows/sprint-2/idea-3/flow"

export const sprints: Sprint[] = [
  {
    id: "sprint-1",
    name: "Sprint 1",
    goal: "TBD — see sprints/sprint-1/BRIEF.md",
    ideas: [sprint1Idea1, sprint1Idea2],
  },
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
