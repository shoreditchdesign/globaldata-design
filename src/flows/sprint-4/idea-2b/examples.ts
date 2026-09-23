/**
 * The queries `$$` types for you.
 *
 * A demo shortcut, nothing the product would ship: typing `$$` in the composer
 * swaps itself for the next of these, so whoever is walking someone through the
 * prototype can show the range of it without composing a sentence on the spot.
 *
 * Between them they cover what the resolver can actually do — several
 * conditions at once, an `or` inside one attribute, an exclusion, a phrase it
 * can only offer a nearest match for, and a couple that name things which are
 * real in GlobalData and unbuilt here. Every one was run through
 * `resolveQuery` before it was written down, so none of them asks the screener
 * for phrasing it cannot read, and the two partial ones land the notes they
 * were chosen for rather than by accident.
 */
export const examples = [
  /* A stage, a region, a protein family typed bare, and a country taken back
     out — four conditions, and the shape most of the sprint's questions take. */
  "phase 3 janus kinase drugs available in europe, not austria",

  /* Five conditions, to show the gate with something on it: a stage, a route,
     a molecule, a country and a whole family of mechanisms read off one
     phrase. */
  "marketed oral small molecules in the united states with a receptor based mechanism",

  /* Two indications joined by `or` inside one condition, and a stage compound
     typed the way a reviewer types it. */
  "oral small molecules for rheumatoid arthritis or psoriatic arthritis, phase 2/3",

  /* Resolves as far as it can and says so: `late stage` opens out into three
     phases, and `anti coagulants` is offered as Antithrombotic Therapy rather
     than assumed to be it. */
  "late stage anti coagulants for cardiology in germany or france",

  /* Everything reads except the company, which is its own product area. */
  "phase 1 or 2 gene therapies in europe from novartis",

  /* Three conditions read, and NPV named as the separate product area it is. */
  "phase 3 antineoplastics in europe by npv",
]

/**
 * Where the cycle has got to. Module scope rather than component state, so it
 * carries on from where it was when the composer is torn down between screens
 * — a second `$$` gives the second example, not the first one again.
 */
let cursor = 0

/** The next example, wrapping round at the end of the list. */
export function nextExample() {
  const example = examples[cursor % examples.length]
  cursor += 1
  return example
}
