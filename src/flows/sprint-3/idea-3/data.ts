/**
 * Static content for Sprint 3 / Idea 3 — "Query as a sentence".
 *
 * Nothing here queries anything. The result count is a deterministic stand-in:
 * every value carries a hardcoded `share` of the corpus and the total is the
 * base count multiplied through the selected clauses. It moves when the
 * sentence is edited, which is the whole point of the direction, but it is
 * arithmetic on fixed numbers — there is no filter engine behind it.
 */

/** Unfiltered drug count on the live platform. */
export const BASE_COUNT = 285_529

/* -------------------------------------------------------------------------- */
/* The query model                                                             */
/* -------------------------------------------------------------------------- */

export interface ValueOption {
  /** Canonical product value, e.g. `Phase II`. Shown in the dropdown. */
  value: string
  /** How the value reads inside the sentence, e.g. `orally`. */
  term: string
  /** Fraction of the corpus this value covers. Fixed, not measured. */
  share: number
  /** Count shown beside the value in its dropdown. */
  count: number
}

export interface OperatorOption {
  /** The word as it appears in the sentence, e.g. `excluding`. */
  word: string
  /** Whether the clause keeps or drops the matching rows. */
  mode: "include" | "exclude"
  /** Plain-English gloss shown in the dropdown, so the logic is legible. */
  hint: string
}

export interface Clause {
  id: string
  /** Product attribute this clause filters on. Named in every dropdown. */
  attribute: string
  /** The operator word. Omitted on the leading adjective clauses. */
  operator?: { options: OperatorOption[]; selected: string }
  /** Word between values — itself a dropdown. */
  join: "or" | "and"
  /** Selected values, by canonical value. */
  selected: string[]
  options: ValueOption[]
  /** Comma before this clause when it is not the first. */
  comma?: boolean
}

const drugTypeOptions: ValueOption[] = [
  { value: "Generic", term: "Generic", share: 0.31, count: 88_514 },
  { value: "Branded", term: "Branded", share: 0.52, count: 148_475 },
  { value: "Biosimilar", term: "Biosimilar", share: 0.04, count: 11_421 },
  { value: "Orphan", term: "Orphan", share: 0.07, count: 19_987 },
  { value: "Over the Counter", term: "over-the-counter", share: 0.06, count: 17_132 },
]

const descriptorOptions: ValueOption[] = [
  { value: "Antiinflammatory Therapy", term: "anti-inflammatory", share: 0.114, count: 10_091 },
  { value: "Analgesic Therapy", term: "analgesic", share: 0.09, count: 7_966 },
  { value: "Antipyretic Therapy", term: "antipyretic", share: 0.03, count: 2_655 },
  { value: "Immunosuppressant Therapy", term: "immunosuppressant", share: 0.05, count: 4_425 },
  { value: "Antineoplastic Therapy", term: "antineoplastic", share: 0.21, count: 18_588 },
]

const targetOptions: ValueOption[] = [
  {
    value: "Actin Gamma Enteric Smooth Muscle",
    term: "Actin Gamma Enteric Smooth Muscle",
    share: 0.19,
    count: 1_917,
  },
  { value: "Cyclooxygenase 2", term: "Cyclooxygenase 2", share: 0.34, count: 3_431 },
  { value: "Cyclooxygenase 1", term: "Cyclooxygenase 1", share: 0.22, count: 2_220 },
  { value: "Tumor Necrosis Factor", term: "Tumor Necrosis Factor", share: 0.16, count: 1_614 },
  { value: "Interleukin 6 Receptor", term: "Interleukin 6 Receptor", share: 0.08, count: 807 },
  { value: "Prostaglandin E Synthase", term: "Prostaglandin E Synthase", share: 0.05, count: 504 },
]

const geographyOptions: ValueOption[] = [
  { value: "Austria", term: "Austria", share: 0.09, count: 148 },
  { value: "Italy", term: "Italy", share: 0.05, count: 82 },
  { value: "Germany", term: "Germany", share: 0.21, count: 346 },
  { value: "France", term: "France", share: 0.18, count: 296 },
  { value: "Spain", term: "Spain", share: 0.11, count: 181 },
  { value: "United States", term: "the United States", share: 0.44, count: 725 },
  { value: "Japan", term: "Japan", share: 0.16, count: 263 },
]

/**
 * Pipeline order, not count order. Every other attribute lists its values by
 * size, but a development stage has an inherent sequence and an analyst reads
 * it that way — and because a clause renders its values in its own option
 * order, `phase 1/2` would otherwise resolve to the sentence "in Phase II or
 * Phase I".
 */
const stageOptions: ValueOption[] = [
  { value: "Discovery", term: "Discovery", share: 0.08, count: 131 },
  { value: "Preclinical", term: "Preclinical", share: 0.11, count: 181 },
  { value: "Phase I", term: "Phase I", share: 0.14, count: 230 },
  { value: "Phase II", term: "Phase II", share: 0.29, count: 478 },
  { value: "Phase III", term: "Phase III", share: 0.18, count: 296 },
  { value: "Pre-registration", term: "Pre-registration", share: 0.05, count: 82 },
  { value: "Marketed", term: "Marketed", share: 0.12, count: 197 },
  { value: "Withdrawn", term: "Withdrawn", share: 0.03, count: 49 },
]

const routeOptions: ValueOption[] = [
  { value: "Oral", term: "orally", share: 0.61, count: 472 },
  { value: "Intravenous", term: "intravenously", share: 0.18, count: 139 },
  { value: "Subcutaneous", term: "subcutaneously", share: 0.09, count: 69 },
  { value: "Topical", term: "topically", share: 0.07, count: 54 },
  { value: "Inhaled", term: "by inhalation", share: 0.05, count: 38 },
]

const moleculeOptions: ValueOption[] = [
  { value: "Small Molecule", term: "small molecules", share: 0.74, count: 452 },
  { value: "Monoclonal Antibody", term: "monoclonal antibodies", share: 0.12, count: 73 },
  { value: "Peptide", term: "peptides", share: 0.07, count: 42 },
  { value: "Recombinant Protein", term: "recombinant proteins", share: 0.04, count: 24 },
  { value: "Oligonucleotide", term: "oligonucleotides", share: 0.03, count: 18 },
]

const monoOptions: ValueOption[] = [
  { value: "Mono", term: "single-agent", share: 0.91, count: 412 },
  { value: "Combination", term: "combination", share: 0.09, count: 41 },
]

const atcOptions: ValueOption[] = [
  {
    value: "M01A — Antiinflammatory and Antirheumatic, Non-Steroids",
    term: "M01A",
    share: 0.68,
    count: 308,
  },
  { value: "M02A — Topical Products for Joint and Muscular Pain", term: "M02A", share: 0.12, count: 54 },
  { value: "N02B — Other Analgesics and Antipyretics", term: "N02B", share: 0.14, count: 63 },
  { value: "L04A — Immunosuppressants", term: "L04A", share: 0.06, count: 27 },
]

const applicationOptions: ValueOption[] = [
  { value: "Abbreviated New Drug Application", term: "an ANDA", share: 0.57, count: 258 },
  { value: "New Drug Application", term: "an NDA", share: 0.28, count: 127 },
  { value: "Biologics License Application", term: "a BLA", share: 0.1, count: 45 },
  { value: "Investigational New Drug", term: "an IND", share: 0.05, count: 23 },
]

const includeExclude = (include: string, exclude: string, subject: string): OperatorOption[] => [
  { word: include, mode: "include", hint: `Keep drugs where ${subject} matches` },
  { word: exclude, mode: "exclude", hint: `Drop drugs where ${subject} matches` },
]

/**
 * The worked example. Seven clauses — deliberately past the toy two-clause
 * case, so the wrapping behaviour is visible rather than asserted.
 *
 * Reads as: Generic anti-inflammatory drugs targeting Actin Gamma Enteric
 * Smooth Muscle, excluding Austria or Italy, in Phase II or Phase III, taken
 * orally or intravenously, as small molecules.
 */
export const exampleClauses: Clause[] = [
  {
    id: "drug-type",
    attribute: "Drug Type",
    join: "or",
    selected: ["Generic"],
    options: drugTypeOptions,
  },
  {
    id: "descriptor",
    attribute: "Drug Descriptor",
    join: "or",
    selected: ["Antiinflammatory Therapy"],
    options: descriptorOptions,
  },
  {
    id: "target",
    attribute: "Target",
    operator: {
      options: includeExclude("targeting", "not targeting", "the target"),
      selected: "targeting",
    },
    join: "or",
    selected: ["Actin Gamma Enteric Smooth Muscle"],
    options: targetOptions,
  },
  {
    id: "geography",
    attribute: "Drug Geography",
    comma: true,
    operator: {
      options: [
        { word: "excluding", mode: "exclude", hint: "Drop drugs marketed in these countries" },
        { word: "only in", mode: "include", hint: "Keep only drugs marketed in these countries" },
      ],
      selected: "excluding",
    },
    join: "or",
    selected: ["Austria", "Italy"],
    options: geographyOptions,
  },
  {
    id: "stage",
    attribute: "Development Stage",
    comma: true,
    operator: {
      options: includeExclude("in", "not in", "the development stage"),
      selected: "in",
    },
    join: "or",
    selected: ["Phase II", "Phase III"],
    options: stageOptions,
  },
  {
    id: "route",
    attribute: "Route of Administration",
    comma: true,
    operator: {
      options: includeExclude("taken", "not taken", "the route of administration"),
      selected: "taken",
    },
    join: "or",
    selected: ["Oral", "Intravenous"],
    options: routeOptions,
  },
  {
    id: "molecule",
    attribute: "Molecule Type",
    comma: true,
    operator: {
      options: includeExclude("limited to", "excluding", "the molecule type"),
      selected: "limited to",
    },
    join: "or",
    selected: ["Small Molecule"],
    options: moleculeOptions,
  },
]

/** Clauses the `+ condition` menu can append, to push the sentence longer. */
export const addableClauses: Clause[] = [
  {
    id: "mono",
    attribute: "Mono/Combination Drug",
    comma: true,
    operator: { options: includeExclude("given as", "not given as", "the regimen"), selected: "given as" },
    join: "or",
    selected: ["Mono"],
    options: monoOptions,
  },
  {
    id: "atc",
    attribute: "ATC Classification",
    comma: true,
    operator: {
      options: includeExclude("classified under", "not classified under", "the ATC class"),
      selected: "classified under",
    },
    join: "or",
    selected: ["M01A — Antiinflammatory and Antirheumatic, Non-Steroids"],
    options: atcOptions,
  },
  {
    id: "application",
    attribute: "Application Type",
    comma: true,
    operator: { options: includeExclude("filed as", "not filed as", "the application type"), selected: "filed as" },
    join: "or",
    selected: ["Abbreviated New Drug Application"],
    options: applicationOptions,
  },
]

/**
 * Every clause the sentence can hold, in the order it reads. The resolver
 * clones from here rather than authoring clauses of its own, so a typed query
 * and the worked example are the same objects with different values ticked.
 */
export const clauseTemplates: Clause[] = [...exampleClauses, ...addableClauses]

/** The word a clause uses when it keeps rows, and when it drops them. */
export function operatorWord(clause: Clause, mode: "include" | "exclude") {
  return clause.operator?.options.find((option) => option.mode === mode)?.word
}

/* -------------------------------------------------------------------------- */
/* The count                                                                   */
/* -------------------------------------------------------------------------- */

/** Whether a clause keeps or drops the rows it matches. Include by default. */
function clauseMode(clause: Clause) {
  const operator = clause.operator
  if (!operator) return "include"
  return operator.options.find((o) => o.word === operator.selected)?.mode ?? "include"
}

function clauseFactor(clause: Clause) {
  const shares = clause.options
    .filter((option) => clause.selected.includes(option.value))
    .map((option) => option.share)
  // `or` is a union of the shares, `and` an intersection under independence —
  // so flipping the joining word moves the count the same way it moves the
  // rows, instead of leaving the two disagreeing.
  const share =
    clause.join === "and"
      ? shares.reduce((total, value) => total * value, 1)
      : shares.reduce((total, value) => total + value, 0)
  const clamped = Math.min(0.98, Math.max(0.005, share))
  return clauseMode(clause) === "exclude" ? 1 - clamped : clamped
}

/** Deterministic stand-in for a server count. See the note at the top. */
export function resultCount(clauses: Clause[]) {
  if (clauses.length === 0) return BASE_COUNT
  const total = clauses.reduce((count, clause) => count * clauseFactor(clause), BASE_COUNT)
  return Math.max(1, Math.round(total))
}

/** The sentence in plain prose, for the "interpreted from" line and the deck. */
export const originalPrompt =
  "generic anti-inflammatory drugs that target actin gamma enteric smooth muscle, phase II or III, not available in Austria or Italy, oral or IV small molecules"

/** Cold-start prompts. Modelled on the suggestions in the live global search. */
export const suggestedQueries = [
  "Generic anti-inflammatory drugs targeting Actin Gamma Enteric Smooth Muscle in Phase II or Phase III",
  "Phase III oncology drugs filed as an NDA in the last two years",
  "Marketed drugs by Boehringer Ingelheim, excluding withdrawn and archived",
  "Monoclonal antibodies in Preclinical with an NPV over $55M",
]

/* -------------------------------------------------------------------------- */
/* Results                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * One row of the sample. Beyond the four columns the table draws, every row
 * carries the attribute each clause tests, so the set on screen can be
 * filtered against the sentence rather than only counted against it.
 */
export interface ResultRow {
  name: string
  generic: string
  company: string
  /* Attributes the sentence filters on, one per clause. */
  drugType: string
  descriptor: string
  target: string
  geographies: string[]
  stage: string
  route: string
  moleculeType: string
  regimen: string
  atc: string
  applicationType: string
}

/**
 * Page one of the resolved set. Every row satisfies the worked example —
 * generic, anti-inflammatory, ACTG2, Phase II/III, oral or IV, small molecule,
 * and never Austria or Italy. A filtered table looks repetitive; that is the
 * evidence the sentence did what it says.
 *
 * The three attributes the sentence does not name yet — regimen, ATC class and
 * application type — vary across the sample, so adding one of those conditions
 * visibly cuts the set rather than leaving it untouched.
 */
const M01A = "M01A — Antiinflammatory and Antirheumatic, Non-Steroids"
const N02B = "N02B — Other Analgesics and Antipyretics"
const ANDA = "Abbreviated New Drug Application"
const NDA = "New Drug Application"
const ACTG2 = "Actin Gamma Enteric Smooth Muscle"

/** Fields every row of this sample shares, because the sentence selected them. */
const seeded = {
  drugType: "Generic",
  descriptor: "Antiinflammatory Therapy",
  target: ACTG2,
  moleculeType: "Small Molecule",
} as const

export const resultRows: ResultRow[] = [
  { name: "Rebalzid", generic: "Nabumetone Sodium", company: "Zydus Lifesciences", ...seeded, stage: "Phase III", geographies: ["United States", "Canada"], route: "Oral", regimen: "Mono", atc: M01A, applicationType: ANDA },
  { name: "NVR-2210", generic: "Tenoxicam Besilate", company: "Sandoz", ...seeded, stage: "Phase II", geographies: ["Germany", "France"], route: "Oral", regimen: "Mono", atc: M01A, applicationType: ANDA },
  { name: "Aclovent", generic: "Aceclofenac", company: "Glenmark Pharmaceuticals", ...seeded, stage: "Phase III", geographies: ["India", "United Kingdom"], route: "Oral", regimen: "Combination", atc: M01A, applicationType: ANDA },
  { name: "LRX-118", generic: "Lornoxicam Trometamol", company: "Hikma Pharmaceuticals", ...seeded, stage: "Phase II", geographies: ["United States"], route: "Intravenous", regimen: "Mono", atc: M01A, applicationType: NDA },
  { name: "Nimesta", generic: "Nimesulide", company: "Alkem Laboratories", ...seeded, stage: "Phase II", geographies: ["Brazil", "Mexico"], route: "Oral", regimen: "Mono", atc: N02B, applicationType: ANDA },
  { name: "Etodex", generic: "Etodolac", company: "Teva Pharmaceutical", ...seeded, stage: "Phase III", geographies: ["United States", "Japan"], route: "Oral", regimen: "Mono", atc: M01A, applicationType: ANDA },
  { name: "FBP-940", generic: "Flurbiprofen Axetil", company: "Sun Pharmaceutical", ...seeded, stage: "Phase II", geographies: ["Japan", "South Korea"], route: "Intravenous", regimen: "Mono", atc: M01A, applicationType: NDA },
  { name: "Tolfamex", generic: "Tolfenamic Acid", company: "Krka", ...seeded, stage: "Phase III", geographies: ["Poland", "Sweden"], route: "Oral", regimen: "Mono", atc: M01A, applicationType: ANDA },
  { name: "Dexket-IR", generic: "Dexketoprofen Trometamol", company: "Viatris", ...seeded, stage: "Phase III", geographies: ["Spain", "Netherlands"], route: "Oral", regimen: "Combination", atc: N02B, applicationType: ANDA },
  { name: "ZLT-206", generic: "Zaltoprofen", company: "Dr. Reddy's Laboratories", ...seeded, stage: "Phase II", geographies: ["Japan"], route: "Oral", regimen: "Mono", atc: M01A, applicationType: ANDA },
  { name: "Loxoril", generic: "Loxoprofen Sodium", company: "Aurobindo Pharma", ...seeded, stage: "Phase II", geographies: ["United States", "Canada"], route: "Oral", regimen: "Mono", atc: M01A, applicationType: ANDA },
  { name: "AMG-441", generic: "Amtolmetin Guacil", company: "Amneal Pharmaceuticals", ...seeded, stage: "Phase III", geographies: ["United States"], route: "Oral", regimen: "Mono", atc: M01A, applicationType: NDA },
  { name: "Bromfelex", generic: "Bromfenac Sodium", company: "Cipla", ...seeded, stage: "Phase II", geographies: ["India", "Australia"], route: "Intravenous", regimen: "Mono", atc: M01A, applicationType: ANDA },
  { name: "Oxaproz-XR", generic: "Oxaprozin Potassium", company: "Lupin", ...seeded, stage: "Phase III", geographies: ["United States", "Germany"], route: "Oral", regimen: "Mono", atc: M01A, applicationType: ANDA },
  { name: "FNP-073", generic: "Fenoprofen Calcium", company: "Torrent Pharmaceuticals", ...seeded, stage: "Phase II", geographies: ["United Kingdom", "Switzerland"], route: "Oral", regimen: "Combination", atc: M01A, applicationType: ANDA },
  { name: "Sulindal", generic: "Sulindac Sulfone", company: "Stada Arzneimittel", ...seeded, stage: "Phase III", geographies: ["Germany", "France"], route: "Oral", regimen: "Mono", atc: M01A, applicationType: ANDA },
]

/* -------------------------------------------------------------------------- */
/* Filtering the sample                                                        */
/* -------------------------------------------------------------------------- */

/**
 * The attribute each clause reads off a row, keyed by clause id. Every clause
 * the sentence can hold has an entry, so no edit can move the count without
 * also moving the rows — the failure this direction cannot afford.
 */
const clauseField: Record<string, (row: ResultRow) => string[]> = {
  "drug-type": (row) => [row.drugType],
  descriptor: (row) => [row.descriptor],
  target: (row) => [row.target],
  geography: (row) => row.geographies,
  stage: (row) => [row.stage],
  route: (row) => [row.route],
  molecule: (row) => [row.moleculeType],
  mono: (row) => [row.regimen],
  atc: (row) => [row.atc],
  application: (row) => [row.applicationType],
}

/**
 * The sample, filtered against the sentence in memory. Sixteen fixed rows and
 * a predicate — still no filter engine, still nothing fetched, but what is on
 * screen now agrees with what the sentence says.
 *
 * A clause with no entry in `clauseField` is left unevaluated and its rows are
 * kept, rather than silently dropped as though it had been applied.
 */
export function matchingRows(clauses: Clause[]) {
  return resultRows.filter((row) =>
    clauses.every((clause) => {
      const read = clauseField[clause.id]
      if (!read) return true
      const values = read(row)
      const hit =
        clause.join === "and"
          ? clause.selected.every((value) => values.includes(value))
          : clause.selected.some((value) => values.includes(value))
      return clauseMode(clause) === "exclude" ? !hit : hit
    }),
  )
}
