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
  /* Four conditions: a mechanism, two indications joined by `or`, a stage
     compound typed as `phase 2/3`, and a route excluded. */
  "jak inhibitors for rheumatoid arthritis or crohn's disease, phase 2/3, not oral",

  /* Resolves as far as it can and says so: `late stage` opens out into three
     phases, and `anti coagulants` is offered as Antithrombotic Therapy rather
     than assumed to be it. */
  "late stage anti coagulants for cardiology in germany or france",

  /* Stage, molecule and two indications, with a geography excluded. */
  "marketed monoclonal antibodies for plaque psoriasis or atopic dermatitis, not in the united states",

  /* Everything reads except the company, which is its own product area. */
  "phase 1 or 2 gene therapies for hiv from novartis",

  /* A route, a mechanism, an indication and two countries. */
  "subcutaneous glp-1 agonists for type 2 diabetes in japan or china",

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
