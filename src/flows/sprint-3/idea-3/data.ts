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

const stageOptions: ValueOption[] = [
  { value: "Phase II", term: "Phase II", share: 0.29, count: 478 },
  { value: "Phase III", term: "Phase III", share: 0.18, count: 296 },
  { value: "Phase I", term: "Phase I", share: 0.14, count: 230 },
  { value: "Preclinical", term: "Preclinical", share: 0.11, count: 181 },
  { value: "Discovery", term: "Discovery", share: 0.08, count: 131 },
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

/* -------------------------------------------------------------------------- */
/* The count                                                                   */
/* -------------------------------------------------------------------------- */

function clauseFactor(clause: Clause) {
  const share = clause.options
    .filter((option) => clause.selected.includes(option.value))
    .reduce((total, option) => total + option.share, 0)
  const clamped = Math.min(0.98, Math.max(0.005, share))
  return clause.operator?.options.find((o) => o.word === clause.operator?.selected)?.mode === "exclude"
    ? 1 - clamped
    : clamped
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

export interface ResultRow {
  name: string
  generic: string
  company: string
  target: string
  stage: string
  geography: string
  route: string
}

/**
 * Page one of the resolved set. Every row satisfies the worked example —
 * generic, anti-inflammatory, ACTG2, Phase II/III, oral or IV, and never
 * Austria or Italy. A filtered table looks repetitive; that is the evidence
 * the sentence did what it says.
 */
export const resultRows: ResultRow[] = [
  { name: "Rebalzid", generic: "Nabumetone Sodium", company: "Zydus Lifesciences", target: "Actin Gamma Enteric Smooth Muscle", stage: "Phase III", geography: "United States, Canada", route: "Oral" },
  { name: "NVR-2210", generic: "Tenoxicam Besilate", company: "Sandoz", target: "Actin Gamma Enteric Smooth Muscle", stage: "Phase II", geography: "Germany, France", route: "Oral" },
  { name: "Aclovent", generic: "Aceclofenac", company: "Glenmark Pharmaceuticals", target: "Actin Gamma Enteric Smooth Muscle", stage: "Phase III", geography: "India, United Kingdom", route: "Oral" },
  { name: "LRX-118", generic: "Lornoxicam Trometamol", company: "Hikma Pharmaceuticals", target: "Actin Gamma Enteric Smooth Muscle", stage: "Phase II", geography: "United States", route: "Intravenous" },
  { name: "Nimesta", generic: "Nimesulide", company: "Alkem Laboratories", target: "Actin Gamma Enteric Smooth Muscle", stage: "Phase II", geography: "Brazil, Mexico", route: "Oral" },
  { name: "Etodex", generic: "Etodolac", company: "Teva Pharmaceutical", target: "Actin Gamma Enteric Smooth Muscle", stage: "Phase III", geography: "United States, Japan", route: "Oral" },
  { name: "FBP-940", generic: "Flurbiprofen Axetil", company: "Sun Pharmaceutical", target: "Actin Gamma Enteric Smooth Muscle", stage: "Phase II", geography: "Japan, South Korea", route: "Intravenous" },
  { name: "Tolfamex", generic: "Tolfenamic Acid", company: "Krka", target: "Actin Gamma Enteric Smooth Muscle", stage: "Phase III", geography: "Poland, Sweden", route: "Oral" },
  { name: "Dexket-IR", generic: "Dexketoprofen Trometamol", company: "Viatris", target: "Actin Gamma Enteric Smooth Muscle", stage: "Phase III", geography: "Spain, Netherlands", route: "Oral" },
  { name: "ZLT-206", generic: "Zaltoprofen", company: "Dr. Reddy's Laboratories", target: "Actin Gamma Enteric Smooth Muscle", stage: "Phase II", geography: "Japan", route: "Oral" },
  { name: "Loxoril", generic: "Loxoprofen Sodium", company: "Aurobindo Pharma", target: "Actin Gamma Enteric Smooth Muscle", stage: "Phase II", geography: "United States, Canada", route: "Oral" },
  { name: "AMG-441", generic: "Amtolmetin Guacil", company: "Amneal Pharmaceuticals", target: "Actin Gamma Enteric Smooth Muscle", stage: "Phase III", geography: "United States", route: "Oral" },
  { name: "Bromfelex", generic: "Bromfenac Sodium", company: "Cipla", target: "Actin Gamma Enteric Smooth Muscle", stage: "Phase II", geography: "India, Australia", route: "Intravenous" },
  { name: "Oxaproz-XR", generic: "Oxaprozin Potassium", company: "Lupin", target: "Actin Gamma Enteric Smooth Muscle", stage: "Phase III", geography: "United States, Germany", route: "Oral" },
  { name: "FNP-073", generic: "Fenoprofen Calcium", company: "Torrent Pharmaceuticals", target: "Actin Gamma Enteric Smooth Muscle", stage: "Phase II", geography: "United Kingdom, Switzerland", route: "Oral" },
  { name: "Sulindal", generic: "Sulindac Sulfone", company: "Stada Arzneimittel", target: "Actin Gamma Enteric Smooth Muscle", stage: "Phase III", geography: "Germany, France", route: "Oral" },
]
