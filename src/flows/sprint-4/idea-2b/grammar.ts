import { attributeDefs, drugAttributeOrder, type Condition } from "@/flows/sprint-4/idea-2b/data"

/**
 * How the query reads as English.
 *
 * Both renderings of the sentence go through here — the pills on screen and the
 * plain prose `Edit` hands back — so the words a reviewer reads and the words
 * they get to retype are made by the same rules, and every phrase in here is
 * one the resolver can read again.
 *
 * **Booleans only.** A clause is the attribute, `is` or `is not`, and its
 * values joined by `or` or `and`; clauses meet each other on `and` or `or`. The
 * earlier vocabulary gave every attribute a phrase of its own — `available in`,
 * `given via`, `described as` — which read as product language nobody had
 * agreed to. `Drug Geography is not Austria or Italy` is the sentence a filter
 * builder would write, and the reviewer already knows what every word in it
 * does.
 *
 * Pills carry the canonical label, not a softened term, and so does the
 * attribute in front of them: the same words name the column in the results
 * grid, the branch in the explorer and the picker the values are ticked in.
 */

/** The word between an attribute and its values. Negation is the whole difference. */
export const operatorWords: Record<Condition["mode"], string> = {
  is: "is",
  "is not": "is not",
}

export function operatorWord(condition: Pick<Condition, "mode">) {
  return operatorWords[condition.mode]
}

/**
 * The attribute as the sentence prints it. Verbatim, so a clause and the
 * picker it opens are unmistakably the same attribute.
 */
export function attributeWord(condition: Pick<Condition, "attribute">) {
  return condition.attribute
}

/** One whole clause as a line of words — the drag ghost, and the prose below. */
export function clauseWords(condition: Condition) {
  return `${attributeWord(condition)} ${operatorWord(condition)} ${condition.values.join(` ${condition.join} `)}`
}

/**
 * Whether a clause carries on from the one before it: the same attribute, kept
 * and then dropped. `Molecule Type is Small Molecule but is not Peptide` says
 * in one breath what naming the attribute twice says in two.
 */
export function continues(condition: Condition, previous?: Condition) {
  return Boolean(previous && previous.attribute === condition.attribute && previous.mode !== condition.mode)
}

/** The query written back out as a line of English the resolver reads again. */
export function conditionsToProse(conditions: Condition[]) {
  if (conditions.length === 0) return ""
  return conditions
    .map((condition, i) => {
      if (i === 0) return clauseWords(condition)
      if (continues(condition, conditions[i - 1])) {
        return `but ${operatorWord(condition)} ${condition.values.join(` ${condition.join} `)}`
      }
      return `, ${condition.link} ${clauseWords(condition)}`
    })
    .join(" ")
    .replace(/\s+,/g, ",")
}

/**
 * The attribute names the sentence prints, for the resolver to swallow as
 * grammar rather than read as values — `Mono/Combination Drug is Mono` names
 * one value, not two, and `Gene Therapy Vector` is not a molecule type.
 */
export const attributeHeadings = drugAttributeOrder.filter((attribute) => attributeDefs[attribute])
