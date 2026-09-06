import type { Clause } from "@/flows/sprint-3/idea-3/data"

/**
 * How a list of clauses reads as one English sentence.
 *
 * Both renderings of the query go through here — the pills in `QuerySentence`
 * and the plain prose that `edit as text` hands back — so the words a reviewer
 * reads on screen and the words they get to edit are produced by the same
 * rules. If the two drifted, the round trip would silently rewrite the query.
 */

export interface SentencePiece {
  clause: Clause
  /** `and ` before the final condition, once the sentence is long enough. */
  conjunction: boolean
  /** Prose that closes this clause and rides inside its no-wrap unit. */
  punctuation: string
}

export interface SentenceLayout {
  /** `Drugs ` when nothing adjectival leads, so the line still has a subject. */
  prefix: string
  pieces: SentencePiece[]
}

export function sentenceLayout(clauses: Clause[]): SentenceLayout {
  // The leading run of clauses with no operator — `Generic anti-inflammatory`.
  // They are adjectives, and the noun belongs at the end of the run wherever
  // that run now ends, so removing one never orphans `drugs`.
  let adjectives = 0
  while (adjectives < clauses.length && !clauses[adjectives].operator) adjectives += 1

  const pieces = clauses.map((clause, i) => {
    const last = i === clauses.length - 1
    const noun = adjectives > 0 && i === adjectives - 1 ? " drugs" : ""
    // Never a comma where the noun lands: `Generic drugs, targeting …` is wrong.
    const comma = !last && !noun && clauses[i + 1]?.comma ? "," : ""
    return {
      clause,
      conjunction: last && clauses.length > 2 && Boolean(clause.comma),
      punctuation: `${noun}${comma}`,
    }
  })

  return { prefix: adjectives === 0 && clauses.length > 0 ? "Drugs " : "", pieces }
}

/** The values of one clause, in the clause's own order, as they read. */
export function clauseTerms(clause: Clause) {
  return clause.options.filter((option) => clause.selected.includes(option.value))
}

/**
 * The query written back out as the prose it was read from. This is the other
 * half of `edit as text`: the sentence collapses to a line of English, the
 * reviewer edits that line, and it resolves again. Every word it emits is a
 * word the resolver can read, so the trip closes rather than losing a clause.
 */
export function clausesToProse(clauses: Clause[]) {
  const { prefix, pieces } = sentenceLayout(clauses)

  const body = pieces
    .map(({ clause, conjunction, punctuation }) => {
      const values = clauseTerms(clause)
        .map((option) => option.term)
        .join(` ${clause.join} `)
      const words = clause.operator ? `${clause.operator.selected} ${values}` : values
      return `${conjunction ? "and " : ""}${words}${punctuation}`
    })
    .join(" ")

  return `${prefix}${body}`
}
