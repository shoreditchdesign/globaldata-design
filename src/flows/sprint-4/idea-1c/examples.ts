/**
 * The queries `$$` types for you.
 *
 * A demo shortcut, nothing the product would ship, copied from Idea 2b's
 * rather than shared with it: typing `$$` in either search field swaps itself
 * for the next of these, so whoever is walking someone through the prototype
 * can reach each state of the results without composing a sentence on the
 * spot. Every one was run through this idea's `resolveQuery` and `resultsFor`
 * before it was written down, so each lands the state it was chosen for.
 */
export const examples = [
  /* Four conditions, every one placed, and a short table: 20 drugs. */
  "phase 3 small molecules for musculoskeletal disorders in germany",

  /* A region rather than a country, read as every country in it: 14 drugs. */
  "marketed topical drugs for dermatology in europe",

  /* Four conditions that each read, and together rule out the whole sample,
     so the table shows its no-matches state with the last criterion to step
     back through. */
  "phase 1 gene therapies for dermatology in brazil",

  /* Everything reads except `oncology`, which this taxonomy does not hold, so
     the read lands its filters and says what it could not place: 9 drugs. */
  "subcutaneous biosimilars for oncology in japan",
]

/** The demo shortcut. Typed anywhere in a field, it becomes the next example. */
const trigger = "$$"

/**
 * Where the cycle has got to. Module scope rather than component state, so it
 * carries on across screens — a second `$$` gives the second example, not the
 * first one again.
 */
let cursor = 0

/**
 * The typed text with `$$` swapped for the next example, or the text as it was
 * when there is no `$$` in it. Called from an event handler, never inside a
 * state updater, so a strict-mode double render cannot skip an example.
 */
export function expandShorthand(typed: string) {
  const at = typed.indexOf(trigger)
  if (at === -1) return typed
  const example = examples[cursor % examples.length]
  cursor += 1
  return typed.slice(0, at) + example + typed.slice(at + trigger.length)
}
