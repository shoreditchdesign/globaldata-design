import type { Condition } from "@/flows/sprint-4/idea-2/data"

/**
 * How the query reads as English.
 *
 * Both renderings of the sentence go through here — the pills on screen and the
 * plain prose `Edit` hands back — so the words a reviewer reads and the words
 * they get to retype are made by the same rules, and every phrase in here is
 * one the resolver can read again.
 *
 * Pills carry the canonical label, not a softened term. Idea 3 could print
 * `orally` because the sentence was the only place the value appeared; here the
 * same value is a tick in a value picker and a chip on the logic gate as well, and it
 * has to be recognisably the same word in all three.
 */

/** The operator words an attribute is introduced with, keeping and dropping. */
export const operatorWords: Record<string, { is: string; "is not": string }> = {
  "Therapy Area / Indication": { is: "for", "is not": "not for" },
  "Development Stage": { is: "in", "is not": "not in" },
  "Drug Geography": { is: "available in", "is not": "not available in" },
  "Molecule Type": { is: "made as", "is not": "not made as" },
  "Route of Administration": { is: "given via", "is not": "not given via" },
  "Drug Descriptor": { is: "described as", "is not": "not described as" },
  "Mechanism of Action": { is: "acting as", "is not": "not acting as" },
  Target: { is: "targeting", "is not": "not targeting" },
  "ATC Classification": { is: "classed under", "is not": "not classed under" },
  "Drug Type": { is: "typed as", "is not": "not typed as" },
  "Mono/Combination Drug": { is: "given as", "is not": "not given as" },
  "Application Type": { is: "filed as", "is not": "not filed as" },
  "Gene Therapy Vector": { is: "delivered by", "is not": "not delivered by" },
}

export function operatorWord(condition: Pick<Condition, "attribute" | "mode">) {
  return operatorWords[condition.attribute]?.[condition.mode] ?? condition.mode
}

/** The query written back out as a line of English the resolver reads again. */
export function conditionsToProse(conditions: Condition[]) {
  if (conditions.length === 0) return ""
  const body = conditions
    .map((condition, i) => {
      const words = `${operatorWord(condition)} ${condition.values.join(` ${condition.join} `)}`
      return i === 0 ? words : `${condition.link} ${words}`
    })
    .join(", ")
  return `Drugs ${body}`
}
