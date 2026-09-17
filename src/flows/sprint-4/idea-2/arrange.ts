/**
 * Rearranging the query by hand: reordering conditions, pulling a value out of
 * a group into a condition of its own, and merging it back.
 *
 * Everything here is a pure function of the condition list, so a drag, a menu
 * item and the seeded `pulled-apart` frame all make the same edit, and the
 * count a drag previews is the count the drop produces.
 *
 * The query reads strictly left to right (see `rowMatches` in `data.ts`), so
 * order carries meaning once an `or` is in play. That is why a drop previews
 * its count before it lands.
 */

import { matchingRows, type Condition } from "@/flows/sprint-4/idea-2/data"

/**
 * The first condition meets nothing, so its link is always `and` — otherwise
 * removing or moving the head of an `A, or B` query would leave B reading `or`
 * against the whole sample, which keeps everything.
 */
export function normaliseConditions(conditions: Condition[]) {
  if (conditions.length === 0 || conditions[0].link === "and") return conditions
  return [{ ...conditions[0], link: "and" as const }, ...conditions.slice(1)]
}

/**
 * What is being moved. A pill in a single-value condition, or the condition's
 * operator word, carries the whole condition; a pill in a multi-value
 * condition carries just its value.
 */
export type DragPayload =
  | { kind: "condition"; id: string }
  | { kind: "value"; id: string; value: string }

/**
 * Where it lands. `gap` is an insertion point: `index` 0 is before the first
 * condition, `conditions.length` after the last. `merge` drops into a group of
 * the same attribute.
 */
export type DropTarget = { kind: "gap"; index: number } | { kind: "merge"; id: string }

/** What a drop made, so the screen can light the word that was just created. */
export interface Arranged {
  conditions: Condition[]
  /** The condition the eye should go to. */
  id: string
  /** Which part of it to light: the join to the conditions before, the word between its values, or the whole clause. */
  part: "link" | "join" | "clause"
}

/** An id no condition in the list has yet: the attribute itself if it is free. */
export function newConditionId(conditions: Condition[], attribute: string) {
  const taken = new Set(conditions.map((condition) => condition.id))
  if (!taken.has(attribute)) return attribute
  let n = 2
  while (taken.has(`${attribute}~${n}`)) n += 1
  return `${attribute}~${n}`
}

export const targetKey = (target: DropTarget | null) =>
  target ? (target.kind === "gap" ? `gap:${target.index}` : `merge:${target.id}`) : "none"

/**
 * Whether a payload can merge into a condition. Only a group of the same
 * attribute, and never into itself — a value dropped back on its own group is
 * where it already is.
 */
export function canMerge(conditions: Condition[], payload: DragPayload, targetId: string) {
  if (payload.id === targetId) return false
  const source = conditions.find((condition) => condition.id === payload.id)
  const target = conditions.find((condition) => condition.id === targetId)
  return Boolean(source && target && source.attribute === target.attribute)
}

/**
 * The query after a drop, or null when the drop would change nothing or is not
 * allowed — the two cases where the drag springs back and no indicator shows.
 */
export function applyDrop(
  conditions: Condition[],
  payload: DragPayload,
  target: DropTarget,
): Arranged | null {
  const from = conditions.findIndex((condition) => condition.id === payload.id)
  if (from === -1) return null
  const source = conditions[from]

  if (target.kind === "merge") {
    if (!canMerge(conditions, payload, target.id)) return null
    const moving = payload.kind === "value" ? [payload.value] : source.values
    const next = conditions
      .map((condition) => {
        if (condition.id === target.id) {
          return { ...condition, values: [...condition.values, ...moving.filter((v) => !condition.values.includes(v))] }
        }
        if (condition.id === source.id) {
          return { ...condition, values: condition.values.filter((v) => !moving.includes(v)) }
        }
        return condition
      })
      .filter((condition) => condition.values.length > 0)
    return { conditions: normaliseConditions(next), id: target.id, part: "join" }
  }

  const index = Math.max(0, Math.min(target.index, conditions.length))

  if (payload.kind === "condition" || source.values.length < 2) {
    // A whole condition, reordered. Either side of where it already sits is a no-op.
    if (index === from || index === from + 1) return null
    const without = conditions.filter((_, i) => i !== from)
    const at = index > from ? index - 1 : index
    const next = [...without.slice(0, at), source, ...without.slice(at)]
    return { conditions: normaliseConditions(next), id: source.id, part: at === 0 ? "clause" : "link" }
  }

  // A value pulled out of its group. It joins with OR — OR NOT if the group
  // excluded — at Austin's call, knowing that widens the set; the preview is
  // how that shows before the drop.
  const pulled: Condition = {
    id: newConditionId(conditions, source.attribute),
    attribute: source.attribute,
    values: [payload.value],
    join: "or",
    mode: source.mode,
    link: "or",
  }
  const shrunk = conditions.map((condition) =>
    condition.id === source.id
      ? { ...condition, values: condition.values.filter((v) => v !== payload.value) }
      : condition,
  )
  const next = [...shrunk.slice(0, index), pulled, ...shrunk.slice(index)]
  return { conditions: normaliseConditions(next), id: pulled.id, part: index === 0 ? "clause" : "link" }
}

/** The count a drop would leave, for the preview while it is still in the air. */
export function previewCount(conditions: Condition[], payload: DragPayload, target: DropTarget) {
  const arranged = applyDrop(conditions, payload, target)
  return arranged ? matchingRows(arranged.conditions).length : null
}
