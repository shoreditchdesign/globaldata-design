import type { Flow } from "@/flows/types"
import { makePlaceholder } from "@/flows/placeholder"

/**
 * Held for a second direction, being built on its own branch. The hybrid
 * screener that sat here first came off main when that work started; it is in
 * the history at `ae56cf1`.
 */
export const sprint4Idea1: Flow = {
  id: "idea-1",
  name: "Idea 1 — In progress",
  premise: "Held for a second direction, in progress on its own branch.",
  lastUpdated: "2026-09-17",
  status: "placeholder",
  screens: [
    {
      slug: "start",
      title: "Start",
      viewport: "desktop",
      component: makePlaceholder("Sprint 4 — Idea 1", "In progress on its own branch."),
    },
  ],
}
