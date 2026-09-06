/**
 * The one state the twelve Idea 1 frames turned out to be.
 *
 * Each of the original slugs is kept as an entry point — the review may want to
 * jump straight to a state — so every screen is the same component seeded with
 * a different starting state, and every state is reachable from `results` by
 * clicking.
 */

import type { AttributeSpec, FilterGroup, Operator, RowField } from "@/flows/sprint-3/idea-1/data"
import {
  assistantReply,
  exampleQuery,
  overflowGroups,
  parsedGroups,
} from "@/flows/sprint-3/idea-1/data"

export type Tab = "ai" | "manual"

export interface Transcript {
  user: string
  assistant: string
  time: string
}

export interface Idea1State {
  /** Open tab, or `null` when the modal is closed. */
  modal: Tab | null
  /** Tab the modal reopens on. */
  tab: Tab
  /** Groups in the modal's filter builder. */
  builder: FilterGroup[]
  /** Groups the results are actually filtered by. Empty means unfiltered. */
  applied: FilterGroup[]
  composer: string
  transcript: Transcript | null
  /** Area pill the cascade is anchored to. */
  openArea: string | null
  /** Attribute inside that area whose values are showing. */
  openAttribute: string | null
  /** Index of the applied group whose bar popover is open. */
  barPopover: number | null
  /** Columns the results are collapsed by. Empty means the flat table. */
  grouping: { field: RowField; label: string }[]
  /** Keys of the expanded rows in the grouped view. */
  openGroups: string[]
  /**
   * The authored `+N` on the ten-plus-filters frame. It stands for filters the
   * bar has no room for, so it is dropped as soon as the bar's contents change.
   */
  overflowCount: number
}

const base: Idea1State = {
  modal: null,
  tab: "ai",
  builder: [],
  applied: [],
  composer: "",
  transcript: null,
  openArea: null,
  openAttribute: null,
  barPopover: null,
  grouping: [],
  openGroups: [],
  overflowCount: 0,
}

const transcript: Transcript = {
  user: exampleQuery,
  assistant: assistantReply,
  time: "03:04 PM",
}

/** The value the manual frames are drawn mid-selection on. */
const cardiovascular: FilterGroup = {
  label: "Therapy area / indication",
  field: "therapyArea",
  area: "Drugs",
  attribute: "Therapy Area / Indication",
  chips: [{ label: "Cardiovascular", count: 20, share: 20 / 285_529 }],
}

export const initialStates: Record<string, Idea1State> = {
  results: base,
  "ai-empty": { ...base, modal: "ai", tab: "ai" },
  "ai-typed": { ...base, modal: "ai", tab: "ai", composer: exampleQuery },
  "ai-parsed": { ...base, modal: "ai", tab: "ai", transcript, builder: parsedGroups },
  "manual-areas": { ...base, modal: "manual", tab: "manual" },
  "manual-attributes": { ...base, modal: "manual", tab: "manual", openArea: "Drugs" },
  "manual-values": {
    ...base,
    modal: "manual",
    tab: "manual",
    openArea: "Drugs",
    openAttribute: "Therapy Area / Indication",
  },
  "manual-selected": {
    ...base,
    modal: "manual",
    tab: "manual",
    openArea: "Drugs",
    openAttribute: "Therapy Area / Indication",
    builder: [cardiovascular],
  },
  applied: { ...base, applied: parsedGroups, builder: parsedGroups, transcript, tab: "ai" },
  "filter-bar-dropdown": {
    ...base,
    applied: parsedGroups,
    builder: parsedGroups,
    transcript,
    tab: "ai",
    barPopover: 0,
  },
  "many-filters": {
    ...base,
    applied: [...parsedGroups, ...overflowGroups],
    builder: [...parsedGroups, ...overflowGroups],
    transcript,
    tab: "ai",
    overflowCount: 2,
  },
  "group-by": {
    ...base,
    applied: parsedGroups,
    builder: parsedGroups,
    transcript,
    tab: "ai",
    grouping: [{ field: "stage", label: "Developmental stage" }],
  },
}

export function initialState(slug: string): Idea1State {
  return initialStates[slug] ?? base
}

/* -------------------------------------------------------------------------- */
/* Editing the query                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Trailing operators are meaningless, so they are cleared. Operators that were
 * never set stay unset: the source draws a divider rather than a word between
 * the Target and Drug type groups, and normalising that away would be a
 * redesign.
 */
function normalise(groups: FilterGroup[]): FilterGroup[] {
  return groups
    .filter((group) => group.chips.length > 0)
    .map((group, i, all) => ({
      ...group,
      next: i === all.length - 1 ? undefined : group.next,
      chips: group.chips.map((chip, j, chips) => ({
        ...chip,
        next: j === chips.length - 1 ? undefined : chip.next,
      })),
    }))
}

function groupIndexFor(groups: FilterGroup[], area: string, spec: AttributeSpec) {
  return groups.findIndex((group) =>
    spec.field
      ? group.field === spec.field
      : group.area === area && group.attribute === spec.label,
  )
}

export function isValueSelected(
  groups: FilterGroup[],
  area: string,
  spec: AttributeSpec,
  label: string,
) {
  const index = groupIndexFor(groups, area, spec)
  return index >= 0 && groups[index].chips.some((chip) => chip.label === label)
}

export function selectedCountFor(groups: FilterGroup[], area: string, spec: AttributeSpec) {
  const index = groupIndexFor(groups, area, spec)
  return index >= 0 ? groups[index].chips.length : 0
}

/**
 * Tick or untick one value. Ticking writes into the builder immediately —
 * the popover does not have to be dismissed first, which is the one thing the
 * incumbent's manual path does well.
 */
export function toggleValue(
  groups: FilterGroup[],
  area: string,
  spec: AttributeSpec,
  value: { label: string; count: number; share: number },
): FilterGroup[] {
  const index = groupIndexFor(groups, area, spec)

  if (index < 0) {
    const next = groups.map((group, i) =>
      i === groups.length - 1 ? { ...group, next: group.next ?? ("AND" as Operator) } : group,
    )
    return normalise([
      ...next,
      {
        label: spec.groupLabel,
        field: spec.field,
        area,
        attribute: spec.label,
        chips: [{ label: value.label, count: value.count, share: value.share }],
      },
    ])
  }

  const group = groups[index]
  const chipIndex = group.chips.findIndex((chip) => chip.label === value.label)

  const chips =
    chipIndex >= 0
      ? group.chips.filter((_, i) => i !== chipIndex)
      : [
          ...group.chips.map((chip, i) =>
            i === group.chips.length - 1 ? { ...chip, next: chip.next ?? ("OR" as Operator) } : chip,
          ),
          { label: value.label, count: value.count, share: value.share },
        ]

  return normalise(groups.map((g, i) => (i === index ? { ...g, chips } : g)))
}

export function removeChip(groups: FilterGroup[], groupIndex: number, chipIndex: number) {
  return normalise(
    groups.map((group, i) =>
      i === groupIndex
        ? { ...group, chips: group.chips.filter((_, j) => j !== chipIndex) }
        : group,
    ),
  )
}

export function setChipOperator(
  groups: FilterGroup[],
  groupIndex: number,
  chipIndex: number,
  operator: Operator,
) {
  return groups.map((group, i) =>
    i === groupIndex
      ? {
          ...group,
          chips: group.chips.map((chip, j) => (j === chipIndex ? { ...chip, next: operator } : chip)),
        }
      : group,
  )
}

export function setGroupOperator(groups: FilterGroup[], groupIndex: number, operator: Operator) {
  return groups.map((group, i) => (i === groupIndex ? { ...group, next: operator } : group))
}

/**
 * Fold the groups the AI wrote into whatever the manual pane already built.
 *
 * The two tabs share one builder, and that is the incumbent's one unambiguously
 * good idea — so submitting a prompt replaces the groups it has an opinion
 * about and leaves the rest of the hand-built query standing.
 */
export function mergeGroups(existing: FilterGroup[], incoming: FilterGroup[]): FilterGroup[] {
  // Into an empty builder the AI's groups land exactly as authored, dividers
  // and all — the source draws no operator between Target and Drug type, and
  // filling one in would be a redesign.
  if (existing.length === 0) return normalise(incoming)

  let merged = [...existing]

  for (const group of incoming) {
    const index = merged.findIndex((candidate) =>
      group.field ? candidate.field === group.field : candidate.label === group.label,
    )
    if (index >= 0) {
      merged[index] = { ...group, next: merged[index].next ?? group.next }
    } else {
      merged = [
        ...merged.map((candidate, i) =>
          i === merged.length - 1
            ? { ...candidate, next: candidate.next ?? ("AND" as Operator) }
            : candidate,
        ),
        group,
      ]
    }
  }

  return normalise(merged)
}
