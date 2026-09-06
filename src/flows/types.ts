import type { ComponentType } from "react"

export type ScreenId = string

export interface Screen {
  /** URL segment, kebab-case. */
  slug: ScreenId
  /** Human label shown in the prototype chrome. */
  title: string
  /** Short note on what this step is doing in the flow. */
  note?: string
  /** Viewport the screen is designed against. */
  viewport?: "desktop" | "tablet" | "mobile"
  component: ComponentType
}

export interface Flow {
  /** URL segment, e.g. `idea-1`. */
  id: string
  /** Human label, e.g. `Idea 1 — Progressive disclosure`. */
  name: string
  /** One-line design premise: what this version is testing. */
  premise: string
  /** Longer rationale, rendered on the idea landing page. */
  rationale?: string[]
  /** Source of truth this version was derived from. */
  source?: string
  /** ISO date (YYYY-MM-DD) this idea was last worked on. */
  lastUpdated: string
  /** Short labels for the modality this idea tests, shown on the index. */
  tags?: string[]
  status: "placeholder" | "in-progress" | "review" | "final"
  screens: Screen[]
}

export interface Sprint {
  /** URL segment, e.g. `sprint-2`. */
  id: string
  name: string
  goal: string
  ideas: Flow[]
}
