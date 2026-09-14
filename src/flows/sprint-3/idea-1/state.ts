/**
 * The one state the twelve Idea 1 frames turned out to be.
 *
 * Each of the original slugs is kept as an entry point — the review may want to
 * jump straight to a state — so a slug seeds a starting state, and from there
 * every click moves the same live state. The URL follows it the other way:
 * `slugFor` names the frame the live state is nearest to.
 */

import type { AttributeSpec, FilterGroup, Operator, RowField } from "@/flows/sprint-3/idea-1/data"
import {
  aiParses,
  barVisibleCount,
  findParse,
  manyFilterGroups,
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
  /** A submitted query waiting out the resolving beat, and the parse it matched. */
  resolving: { query: string; parseId: string } | null
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
}

const base: Idea1State = {
  modal: null,
  tab: "ai",
  builder: [],
  applied: [],
  composer: "",
  transcript: null,
  resolving: null,
  openArea: null,
  openAttribute: null,
  barPopover: null,
  grouping: [],
  openGroups: [],
}

const example = aiParses.find((parse) => parse.groups === parsedGroups) ?? aiParses[0]

const transcript: Transcript = {
  user: example.query,
  assistant: example.reply,
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
  "ai-typed": { ...base, modal: "ai", tab: "ai", composer: example.query },
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
    openArea: "Drugs",
    openAttribute: "Development Stage",
  },
  "many-filters": {
    ...base,
    applied: manyFilterGroups,
    builder: manyFilterGroups,
    transcript,
    tab: "ai",
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

/**
 * The frame a live state is nearest to, so the URL can follow the click-through.
 *
 * Every seed maps back to its own slug, so landing on a deep link never
 * rewrites it. Anything between two frames names the one it is on the way to.
 */
export function slugFor(state: Idea1State): string {
  if (state.modal === "ai") {
    if (state.resolving) return "ai-typed"
    if (state.transcript) return "ai-parsed"
    return state.composer.trim() ? "ai-typed" : "ai-empty"
  }

  if (state.modal === "manual") {
    if (state.openArea && state.openAttribute) {
      return state.builder.length > 0 ? "manual-selected" : "manual-values"
    }
    return state.openArea ? "manual-attributes" : "manual-areas"
  }

  if (state.barPopover !== null && state.applied.length > 0) return "filter-bar-dropdown"
  if (state.grouping.length > 0) return "group-by"
  if (state.applied.length === 0) return "results"
  if (barVisibleCount(state.applied) < state.applied.length) return "many-filters"
  return "applied"
}

/* -------------------------------------------------------------------------- */
/* Resolving a query                                                           */
/* -------------------------------------------------------------------------- */

function timestamp() {
  return new Date().toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
}

/**
 * Land a resolved query: the exchange goes into the transcript and the parse
 * becomes the builder.
 *
 * A new question replaces the builder rather than folding into it. Merging a
 * `Phase II` stage group into a query whose stage group carries a `NOT` would
 * silently invert it, and the table would answer a question nobody asked.
 */
export function finishResolving(state: Idea1State): Idea1State {
  if (!state.resolving) return state
  const parse = findParse(state.resolving.parseId)
  return {
    ...state,
    resolving: null,
    transcript: { user: state.resolving.query, assistant: parse.reply, time: timestamp() },
    builder: normalise(parse.groups),
  }
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
  value: { label: string; count: number; share: number; prefix?: string },
): FilterGroup[] {
  const index = groupIndexFor(groups, area, spec)
  const chip = {
    label: value.label,
    count: value.count,
    share: value.share,
    ...(value.prefix ? { prefix: value.prefix } : {}),
  }

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
        chips: [chip],
      },
    ])
  }

  const group = groups[index]
  const chipIndex = group.chips.findIndex((candidate) => candidate.label === value.label)

  const chips =
    chipIndex >= 0
      ? group.chips.filter((_, i) => i !== chipIndex)
      : [
          ...group.chips.map((candidate, i) =>
            i === group.chips.length - 1
              ? { ...candidate, next: candidate.next ?? ("OR" as Operator) }
              : candidate,
          ),
          chip,
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
