/**
 * Static content for Sprint 3 / Idea 3 — "Query as a sentence".
 *
 * Nothing here queries anything. The result count is a deterministic stand-in:
 * every value carries a hardcoded `share` of the corpus and the total is the
 * base count multiplied through the selected clauses. It moves when the
 * sentence is edited, which is the whole point of the direction, but it is
 * arithmetic on fixed numbers — there is no filter engine behind it.
 *
 * The rows underneath are a fixed sample filtered in memory against the same
 * clauses, and `screenDrugs` reconciles the two so the headline number can
 * never contradict the table it sits above. See the note there.
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
  { value: "Antiviral Therapy", term: "antiviral", share: 0.06, count: 5_311 },
  { value: "Antidiabetic Therapy", term: "antidiabetic", share: 0.07, count: 6_196 },
  { value: "Antibacterial Therapy", term: "antibacterial", share: 0.055, count: 4_868 },
  { value: "Antihypertensive Therapy", term: "antihypertensive", share: 0.045, count: 3_983 },
  { value: "Antiasthmatic Therapy", term: "antiasthmatic", share: 0.035, count: 3_098 },
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
  { value: "Janus Kinase 1", term: "Janus Kinase 1", share: 0.06, count: 605 },
  { value: "Interleukin 17A", term: "Interleukin 17A", share: 0.04, count: 404 },
  { value: "Interleukin 23", term: "Interleukin 23", share: 0.03, count: 303 },
  {
    value: "Programmed Cell Death Protein 1",
    term: "Programmed Cell Death Protein 1",
    share: 0.03,
    count: 303,
  },
  {
    value: "Human Epidermal Growth Factor Receptor 2",
    term: "Human Epidermal Growth Factor Receptor 2",
    share: 0.025,
    count: 252,
  },
  {
    value: "Epidermal Growth Factor Receptor",
    term: "Epidermal Growth Factor Receptor",
    share: 0.03,
    count: 303,
  },
  { value: "B-Lymphocyte Antigen CD20", term: "B-Lymphocyte Antigen CD20", share: 0.02, count: 202 },
  {
    value: "Vascular Endothelial Growth Factor A",
    term: "Vascular Endothelial Growth Factor A",
    share: 0.022,
    count: 222,
  },
  { value: "Bruton Tyrosine Kinase", term: "Bruton Tyrosine Kinase", share: 0.018, count: 182 },
  {
    value: "Glucagon Like Peptide 1 Receptor",
    term: "Glucagon Like Peptide 1 Receptor",
    share: 0.025,
    count: 252,
  },
  {
    value: "Sodium Glucose Cotransporter 2",
    term: "Sodium Glucose Cotransporter 2",
    share: 0.02,
    count: 202,
  },
  {
    value: "Angiotensin II Receptor Type 1",
    term: "Angiotensin II Receptor Type 1",
    share: 0.028,
    count: 283,
  },
  {
    value: "Beta 2 Adrenergic Receptor",
    term: "Beta 2 Adrenergic Receptor",
    share: 0.024,
    count: 242,
  },
  {
    value: "HIV 1 Reverse Transcriptase",
    term: "HIV 1 Reverse Transcriptase",
    share: 0.016,
    count: 161,
  },
  { value: "DNA Gyrase Subunit A", term: "DNA Gyrase Subunit A", share: 0.021, count: 212 },
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
  // `in Marketed` and `in Withdrawn` read like a form field rather than a
  // sentence. The two values that are statuses rather than steps carry the
  // noun, so every stage reads as English after the same operator word.
  { value: "Marketed", term: "the Marketed stage", share: 0.12, count: 197 },
  { value: "Withdrawn", term: "the Withdrawn stage", share: 0.03, count: 49 },
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
  {
    value: "L01F — Monoclonal Antibodies and Antibody Drug Conjugates",
    term: "L01F",
    share: 0.05,
    count: 23,
  },
  { value: "L01E — Protein Kinase Inhibitors", term: "L01E", share: 0.04, count: 18 },
  { value: "J05A — Direct Acting Antivirals", term: "J05A", share: 0.03, count: 14 },
  {
    value: "A10B — Blood Glucose Lowering Drugs, Excluding Insulins",
    term: "A10B",
    share: 0.035,
    count: 16,
  },
  {
    value: "C09C — Angiotensin II Receptor Blockers, Plain",
    term: "C09C",
    share: 0.025,
    count: 11,
  },
  { value: "R03A — Adrenergics, Inhalants", term: "R03A", share: 0.03, count: 14 },
  { value: "J01M — Quinolone Antibacterials", term: "J01M", share: 0.028, count: 13 },
  {
    value: "J01C — Beta-Lactam Antibacterials, Penicillins",
    term: "J01C",
    share: 0.022,
    count: 10,
  },
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
 * The sample the sentence is filtered against.
 *
 * Seventy-eight drugs spread deliberately across every attribute a clause can
 * test — ten therapy descriptors, twenty-one targets, all five molecule types,
 * the whole pipeline from Discovery to Withdrawn, both marketed and
 * investigational, five routes, and geographies on four continents.
 *
 * The spread is the point. An earlier sixteen-row sample was one neighbourhood
 * — generic anti-inflammatory ACTG2 small molecules — so any query outside it
 * produced a confident count beside an empty table. In the one direction whose
 * whole argument is that the sentence can be trusted, a number the rows cannot
 * corroborate is the worst thing on the screen.
 *
 * Sixteen of these still satisfy the worked example exactly, so the screen the
 * deck opens on is unchanged. The rest are here so that the queries a reviewer
 * actually types — oncology in Phase III, biosimilar antibodies in preclinical,
 * marketed over-the-counter painkillers in Germany — come back with rows that
 * plainly answer them.
 *
 * Values are the canonical ones from the option lists above, without exception:
 * everything visible in the table is also askable in the sentence.
 */
/* Therapy descriptors. */
const INFLAM = "Antiinflammatory Therapy"
const ANALG = "Analgesic Therapy"
const PYRET = "Antipyretic Therapy"
const IMMUNO = "Immunosuppressant Therapy"
const ONCO = "Antineoplastic Therapy"
const VIRAL = "Antiviral Therapy"
const DIAB = "Antidiabetic Therapy"
const BACT = "Antibacterial Therapy"
const HYPER = "Antihypertensive Therapy"
const ASTHMA = "Antiasthmatic Therapy"

/* Targets. */
const ACTG2 = "Actin Gamma Enteric Smooth Muscle"
const COX2 = "Cyclooxygenase 2"
const COX1 = "Cyclooxygenase 1"
const TNF = "Tumor Necrosis Factor"
const IL6R = "Interleukin 6 Receptor"
const PGES = "Prostaglandin E Synthase"
const JAK1 = "Janus Kinase 1"
const IL17A = "Interleukin 17A"
const IL23 = "Interleukin 23"
const PD1 = "Programmed Cell Death Protein 1"
const HER2 = "Human Epidermal Growth Factor Receptor 2"
const EGFR = "Epidermal Growth Factor Receptor"
const CD20 = "B-Lymphocyte Antigen CD20"
const VEGFA = "Vascular Endothelial Growth Factor A"
const BTK = "Bruton Tyrosine Kinase"
const GLP1R = "Glucagon Like Peptide 1 Receptor"
const SGLT2 = "Sodium Glucose Cotransporter 2"
const AT1R = "Angiotensin II Receptor Type 1"
const ADRB2 = "Beta 2 Adrenergic Receptor"
const HIVRT = "HIV 1 Reverse Transcriptase"
const GYRA = "DNA Gyrase Subunit A"

/* Molecule types. */
const SMALL = "Small Molecule"
const MAB = "Monoclonal Antibody"
const PEPTIDE = "Peptide"
const PROTEIN = "Recombinant Protein"
const OLIGO = "Oligonucleotide"

/* ATC classes. */
const M01A = "M01A — Antiinflammatory and Antirheumatic, Non-Steroids"
const M02A = "M02A — Topical Products for Joint and Muscular Pain"
const N02B = "N02B — Other Analgesics and Antipyretics"
const L04A = "L04A — Immunosuppressants"
const L01F = "L01F — Monoclonal Antibodies and Antibody Drug Conjugates"
const L01E = "L01E — Protein Kinase Inhibitors"
const J05A = "J05A — Direct Acting Antivirals"
const A10B = "A10B — Blood Glucose Lowering Drugs, Excluding Insulins"
const C09C = "C09C — Angiotensin II Receptor Blockers, Plain"
const R03A = "R03A — Adrenergics, Inhalants"
const J01M = "J01M — Quinolone Antibacterials"
const J01C = "J01C — Beta-Lactam Antibacterials, Penicillins"

/* Application types. */
const ANDA = "Abbreviated New Drug Application"
const NDA = "New Drug Application"
const BLA = "Biologics License Application"
const IND = "Investigational New Drug"

export const resultRows: ResultRow[] = [
  { name: "Moxiflox-IV", generic: "Moxifloxacin Hydrochloride", company: "Hikma Pharmaceuticals", drugType: "Generic", descriptor: BACT, target: GYRA, geographies: ["United States", "Poland"], stage: "Marketed", route: "Intravenous", moleculeType: SMALL, regimen: "Mono", atc: J01M, applicationType: ANDA },
  { name: "Gefitinal", generic: "Gefitinib Anhydrous", company: "Cipla", drugType: "Generic", descriptor: ONCO, target: EGFR, geographies: ["India", "Brazil"], stage: "Marketed", route: "Oral", moleculeType: SMALL, regimen: "Mono", atc: L01E, applicationType: ANDA },
  { name: "Ketodol-T", generic: "Ketoprofen Lysine", company: "Menarini", drugType: "Over the Counter", descriptor: ANALG, target: COX1, geographies: ["Italy", "Austria"], stage: "Marketed", route: "Topical", moleculeType: SMALL, regimen: "Mono", atc: M02A, applicationType: ANDA },
  { name: "Valdexil", generic: "Valdecoxib Besilate", company: "Wockhardt", drugType: "Generic", descriptor: INFLAM, target: COX2, geographies: ["Mexico", "Brazil"], stage: "Phase III", route: "Oral", moleculeType: SMALL, regimen: "Combination", atc: M01A, applicationType: ANDA },
  { name: "ION-882", generic: "Danvatirsen Sodium", company: "Ionis Pharmaceuticals", drugType: "Orphan", descriptor: ONCO, target: EGFR, geographies: ["United States"], stage: "Preclinical", route: "Subcutaneous", moleculeType: OLIGO, regimen: "Mono", atc: L01E, applicationType: IND },
  { name: "Etodex", generic: "Etodolac", company: "Teva Pharmaceutical", drugType: "Generic", descriptor: INFLAM, target: ACTG2, geographies: ["United States", "Japan"], stage: "Phase III", route: "Oral", moleculeType: SMALL, regimen: "Mono", atc: M01A, applicationType: ANDA },
  { name: "Tocibra", generic: "Tocilizumab-bavi", company: "Biocon", drugType: "Biosimilar", descriptor: IMMUNO, target: IL6R, geographies: ["India", "Australia"], stage: "Pre-registration", route: "Intravenous", moleculeType: MAB, regimen: "Mono", atc: L04A, applicationType: BLA },
  { name: "Diclogel", generic: "Diclofenac Diethylamine", company: "Almirall", drugType: "Over the Counter", descriptor: INFLAM, target: COX2, geographies: ["Spain", "France"], stage: "Marketed", route: "Topical", moleculeType: SMALL, regimen: "Mono", atc: M02A, applicationType: ANDA },
  { name: "Empaglix", generic: "Empagliflozin Anhydrous", company: "Boehringer Ingelheim", drugType: "Branded", descriptor: DIAB, target: SGLT2, geographies: ["Germany", "United States"], stage: "Marketed", route: "Oral", moleculeType: SMALL, regimen: "Combination", atc: A10B, applicationType: NDA },
  { name: "Keydralia", generic: "Pembrolizumab Gamma", company: "Merck KGaA", drugType: "Branded", descriptor: ONCO, target: PD1, geographies: ["United States", "Germany"], stage: "Phase III", route: "Intravenous", moleculeType: MAB, regimen: "Combination", atc: L01F, applicationType: BLA },
  { name: "Islatra-XR", generic: "Islatravir Hydrate", company: "Gilead Sciences", drugType: "Branded", descriptor: VIRAL, target: HIVRT, geographies: ["United States", "Spain"], stage: "Phase III", route: "Oral", moleculeType: SMALL, regimen: "Mono", atc: J05A, applicationType: NDA },
  { name: "FBP-940", generic: "Flurbiprofen Axetil", company: "Sun Pharmaceutical", drugType: "Generic", descriptor: INFLAM, target: ACTG2, geographies: ["Japan", "South Korea"], stage: "Phase II", route: "Intravenous", moleculeType: SMALL, regimen: "Mono", atc: M01A, applicationType: NDA },
  { name: "DS-8201L", generic: "Trastuzumab Deruxtecan", company: "Daiichi Sankyo", drugType: "Orphan", descriptor: ONCO, target: HER2, geographies: ["Japan", "United States"], stage: "Phase III", route: "Intravenous", moleculeType: MAB, regimen: "Mono", atc: L01F, applicationType: BLA },
  { name: "Golimax", generic: "Golimumab-nvhy", company: "Organon", drugType: "Biosimilar", descriptor: INFLAM, target: TNF, geographies: ["Belgium", "France"], stage: "Preclinical", route: "Intravenous", moleculeType: MAB, regimen: "Mono", atc: L04A, applicationType: IND },
  { name: "Salmetrol", generic: "Salmeterol Xinafoate", company: "GSK", drugType: "Branded", descriptor: ASTHMA, target: ADRB2, geographies: ["United Kingdom", "United States"], stage: "Marketed", route: "Inhaled", moleculeType: SMALL, regimen: "Combination", atc: R03A, applicationType: NDA },
  { name: "Ibudex-OD", generic: "Ibuprofen Lysine", company: "Perrigo", drugType: "Over the Counter", descriptor: ANALG, target: COX1, geographies: ["United States", "Germany"], stage: "Marketed", route: "Oral", moleculeType: SMALL, regimen: "Mono", atc: N02B, applicationType: ANDA },
  { name: "Etaneris", generic: "Etanercept-szzs", company: "Samsung Bioepis", drugType: "Biosimilar", descriptor: IMMUNO, target: TNF, geographies: ["South Korea", "Japan"], stage: "Marketed", route: "Subcutaneous", moleculeType: PROTEIN, regimen: "Mono", atc: L04A, applicationType: BLA },
  { name: "ZLT-206", generic: "Zaltoprofen", company: "Dr. Reddy's Laboratories", drugType: "Generic", descriptor: INFLAM, target: ACTG2, geographies: ["Japan"], stage: "Phase II", route: "Oral", moleculeType: SMALL, regimen: "Mono", atc: M01A, applicationType: ANDA },
  { name: "Celvexa", generic: "Celecoxib Sodium", company: "Alembic Pharmaceuticals", drugType: "Generic", descriptor: INFLAM, target: COX2, geographies: ["United States", "Canada"], stage: "Phase III", route: "Oral", moleculeType: SMALL, regimen: "Mono", atc: M01A, applicationType: ANDA },
  { name: "Tolfamex", generic: "Tolfenamic Acid", company: "Krka", drugType: "Generic", descriptor: INFLAM, target: ACTG2, geographies: ["Poland", "Sweden"], stage: "Phase III", route: "Oral", moleculeType: SMALL, regimen: "Mono", atc: M01A, applicationType: ANDA },
  { name: "Osimerix", generic: "Osimertinib Mesylate", company: "AstraZeneca", drugType: "Branded", descriptor: ONCO, target: EGFR, geographies: ["United States", "United Kingdom"], stage: "Phase III", route: "Oral", moleculeType: SMALL, regimen: "Mono", atc: L01E, applicationType: NDA },
  { name: "Obinutex", generic: "Obinutuzumab Alfa", company: "Roche", drugType: "Branded", descriptor: ONCO, target: CD20, geographies: ["Switzerland", "France"], stage: "Phase III", route: "Intravenous", moleculeType: MAB, regimen: "Combination", atc: L01F, applicationType: BLA },
  { name: "Rinvexa", generic: "Upadacitinib Tartrate", company: "UCB", drugType: "Branded", descriptor: IMMUNO, target: JAK1, geographies: ["United States", "Japan"], stage: "Marketed", route: "Oral", moleculeType: SMALL, regimen: "Mono", atc: L04A, applicationType: NDA },
  { name: "Etorix-90", generic: "Etoricoxib Maleate", company: "Emcure Pharmaceuticals", drugType: "Generic", descriptor: INFLAM, target: COX2, geographies: ["India", "Spain"], stage: "Phase II", route: "Oral", moleculeType: SMALL, regimen: "Mono", atc: M01A, applicationType: ANDA },
  { name: "Oxaproz-XR", generic: "Oxaprozin Potassium", company: "Lupin", drugType: "Generic", descriptor: INFLAM, target: ACTG2, geographies: ["United States", "Germany"], stage: "Phase III", route: "Oral", moleculeType: SMALL, regimen: "Mono", atc: M01A, applicationType: ANDA },
  { name: "Dexket-IR", generic: "Dexketoprofen Trometamol", company: "Viatris", drugType: "Generic", descriptor: INFLAM, target: ACTG2, geographies: ["Spain", "Netherlands"], stage: "Phase III", route: "Oral", moleculeType: SMALL, regimen: "Combination", atc: N02B, applicationType: ANDA },
  { name: "Baricinex", generic: "Baricitinib Phosphate", company: "Eli Lilly", drugType: "Branded", descriptor: IMMUNO, target: JAK1, geographies: ["United States", "Germany"], stage: "Marketed", route: "Oral", moleculeType: SMALL, regimen: "Mono", atc: L04A, applicationType: NDA },
  { name: "Daglifon", generic: "Dapagliflozin Propanediol", company: "Sun Pharmaceutical", drugType: "Generic", descriptor: DIAB, target: SGLT2, geographies: ["India", "United Kingdom"], stage: "Marketed", route: "Oral", moleculeType: SMALL, regimen: "Mono", atc: A10B, applicationType: ANDA },
  { name: "SRV-2214", generic: "Rezpegaldesleukin Alfa", company: "Servier", drugType: "Orphan", descriptor: IMMUNO, target: IL23, geographies: ["France", "Germany"], stage: "Phase I", route: "Subcutaneous", moleculeType: PEPTIDE, regimen: "Mono", atc: L04A, applicationType: IND },
  { name: "Rofexid", generic: "Rofecoxib Hydrate", company: "Endo Pharmaceuticals", drugType: "Branded", descriptor: INFLAM, target: COX2, geographies: ["United States"], stage: "Withdrawn", route: "Oral", moleculeType: SMALL, regimen: "Mono", atc: M01A, applicationType: NDA },
  { name: "EXL-1102", generic: "Zanubrutinib Fumarate", company: "Exelixis", drugType: "Branded", descriptor: ONCO, target: BTK, geographies: ["United States", "China"], stage: "Phase II", route: "Oral", moleculeType: SMALL, regimen: "Mono", atc: L01E, applicationType: NDA },
  { name: "Infliximax", generic: "Infliximab-dyyb", company: "Celltrion", drugType: "Biosimilar", descriptor: IMMUNO, target: TNF, geographies: ["Italy", "Netherlands"], stage: "Marketed", route: "Intravenous", moleculeType: MAB, regimen: "Mono", atc: L04A, applicationType: BLA },
  { name: "Valsartex", generic: "Valsartan Sodium", company: "Novartis", drugType: "Generic", descriptor: HYPER, target: AT1R, geographies: ["Switzerland", "Spain"], stage: "Marketed", route: "Oral", moleculeType: SMALL, regimen: "Combination", atc: C09C, applicationType: ANDA },
  { name: "FNP-073", generic: "Fenoprofen Calcium", company: "Torrent Pharmaceuticals", drugType: "Generic", descriptor: INFLAM, target: ACTG2, geographies: ["United Kingdom", "Switzerland"], stage: "Phase II", route: "Oral", moleculeType: SMALL, regimen: "Combination", atc: M01A, applicationType: ANDA },
  { name: "ONO-4538X", generic: "Cemiplimab Delta", company: "Ono Pharmaceutical", drugType: "Branded", descriptor: ONCO, target: PD1, geographies: ["Japan", "South Korea"], stage: "Phase III", route: "Intravenous", moleculeType: MAB, regimen: "Mono", atc: L01F, applicationType: BLA },
  { name: "IPS-3390", generic: "Solnatide Acetate", company: "Ipsen", drugType: "Orphan", descriptor: IMMUNO, target: IL17A, geographies: ["France", "Spain"], stage: "Phase II", route: "Subcutaneous", moleculeType: PEPTIDE, regimen: "Mono", atc: L04A, applicationType: IND },
  { name: "RGN-4471", generic: "Aflibercept Beta", company: "Regeneron", drugType: "Branded", descriptor: ONCO, target: VEGFA, geographies: ["United States"], stage: "Phase III", route: "Intravenous", moleculeType: PROTEIN, regimen: "Mono", atc: L01F, applicationType: BLA },
  { name: "Lumira-SR", generic: "Lumiracoxib Sodium", company: "Piramal Pharma", drugType: "Generic", descriptor: INFLAM, target: COX2, geographies: ["Australia", "United Kingdom"], stage: "Phase III", route: "Oral", moleculeType: SMALL, regimen: "Mono", atc: M01A, applicationType: ANDA },
  { name: "Adalimix", generic: "Adalimumab-adbm", company: "Alvotech", drugType: "Biosimilar", descriptor: INFLAM, target: TNF, geographies: ["Germany", "Spain"], stage: "Marketed", route: "Subcutaneous", moleculeType: MAB, regimen: "Mono", atc: L04A, applicationType: BLA },
  { name: "NVR-2210", generic: "Tenoxicam Besilate", company: "Sandoz", drugType: "Generic", descriptor: INFLAM, target: ACTG2, geographies: ["Germany", "France"], stage: "Phase II", route: "Oral", moleculeType: SMALL, regimen: "Mono", atc: M01A, applicationType: ANDA },
  { name: "Vilantrix", generic: "Vilanterol Trifenatate", company: "Kyowa Kirin", drugType: "Branded", descriptor: ASTHMA, target: ADRB2, geographies: ["Japan", "Australia"], stage: "Phase III", route: "Inhaled", moleculeType: SMALL, regimen: "Mono", atc: R03A, applicationType: NDA },
  { name: "Sulindal", generic: "Sulindac Sulfone", company: "Stada Arzneimittel", drugType: "Generic", descriptor: INFLAM, target: ACTG2, geographies: ["Germany", "France"], stage: "Phase III", route: "Oral", moleculeType: SMALL, regimen: "Mono", atc: M01A, applicationType: ANDA },
  { name: "Formotix", generic: "Formoterol Fumarate", company: "Chiesi Farmaceutici", drugType: "Generic", descriptor: ASTHMA, target: ADRB2, geographies: ["Italy", "Germany"], stage: "Marketed", route: "Inhaled", moleculeType: SMALL, regimen: "Combination", atc: R03A, applicationType: ANDA },
  { name: "ALN-6620", generic: "Zilebesiran Sodium", company: "Alnylam Pharmaceuticals", drugType: "Branded", descriptor: HYPER, target: AT1R, geographies: ["United States", "Germany"], stage: "Phase II", route: "Subcutaneous", moleculeType: OLIGO, regimen: "Mono", atc: C09C, applicationType: IND },
  { name: "LRX-118", generic: "Lornoxicam Trometamol", company: "Hikma Pharmaceuticals", drugType: "Generic", descriptor: INFLAM, target: ACTG2, geographies: ["United States"], stage: "Phase II", route: "Intravenous", moleculeType: SMALL, regimen: "Mono", atc: M01A, applicationType: NDA },
  { name: "Nimesta", generic: "Nimesulide", company: "Alkem Laboratories", drugType: "Generic", descriptor: INFLAM, target: ACTG2, geographies: ["Brazil", "Mexico"], stage: "Phase II", route: "Oral", moleculeType: SMALL, regimen: "Mono", atc: N02B, applicationType: ANDA },
  { name: "CTB-3401", generic: "Ustekinumab-auub", company: "Fresenius Kabi", drugType: "Biosimilar", descriptor: IMMUNO, target: IL23, geographies: ["Germany", "Austria"], stage: "Preclinical", route: "Subcutaneous", moleculeType: MAB, regimen: "Mono", atc: L04A, applicationType: IND },
  { name: "Rebalzid", generic: "Nabumetone Sodium", company: "Zydus Lifesciences", drugType: "Generic", descriptor: INFLAM, target: ACTG2, geographies: ["United States", "Canada"], stage: "Phase III", route: "Oral", moleculeType: SMALL, regimen: "Mono", atc: M01A, applicationType: ANDA },
  { name: "Tirzelda", generic: "Tirzepatide Sodium", company: "Eli Lilly", drugType: "Branded", descriptor: DIAB, target: GLP1R, geographies: ["United States", "Japan"], stage: "Phase III", route: "Subcutaneous", moleculeType: PEPTIDE, regimen: "Mono", atc: A10B, applicationType: NDA },
  { name: "Loxoril", generic: "Loxoprofen Sodium", company: "Aurobindo Pharma", drugType: "Generic", descriptor: INFLAM, target: ACTG2, geographies: ["United States", "Canada"], stage: "Phase II", route: "Oral", moleculeType: SMALL, regimen: "Mono", atc: M01A, applicationType: ANDA },
  { name: "Bevacimab", generic: "Bevacizumab-awwb", company: "Biocon", drugType: "Biosimilar", descriptor: ONCO, target: VEGFA, geographies: ["India", "Germany"], stage: "Marketed", route: "Intravenous", moleculeType: MAB, regimen: "Combination", atc: L01F, applicationType: BLA },
  { name: "GNM-618", generic: "Bimekizumab Beta", company: "Genmab", drugType: "Branded", descriptor: IMMUNO, target: IL17A, geographies: ["Netherlands", "Denmark"], stage: "Phase II", route: "Subcutaneous", moleculeType: MAB, regimen: "Mono", atc: L04A, applicationType: BLA },
  { name: "Trastugen", generic: "Trastuzumab-dkst", company: "Celltrion", drugType: "Biosimilar", descriptor: ONCO, target: HER2, geographies: ["Italy", "Spain"], stage: "Marketed", route: "Intravenous", moleculeType: MAB, regimen: "Mono", atc: L01F, applicationType: BLA },
  { name: "Abatacix", generic: "Abatacept Beta", company: "Eisai", drugType: "Branded", descriptor: IMMUNO, target: TNF, geographies: ["Japan", "United States"], stage: "Phase II", route: "Intravenous", moleculeType: PROTEIN, regimen: "Mono", atc: L04A, applicationType: BLA },
  { name: "Flurbid", generic: "Flurbiprofen Sodium", company: "Recordati", drugType: "Over the Counter", descriptor: PYRET, target: COX2, geographies: ["Italy", "France"], stage: "Marketed", route: "Oral", moleculeType: SMALL, regimen: "Mono", atc: N02B, applicationType: ANDA },
  { name: "Aspirex", generic: "Acetylsalicylic Acid", company: "Bayer", drugType: "Over the Counter", descriptor: PYRET, target: COX1, geographies: ["Germany", "Italy"], stage: "Marketed", route: "Oral", moleculeType: SMALL, regimen: "Mono", atc: N02B, applicationType: ANDA },
  { name: "Tenoflex", generic: "Tenofovir Alafenamide", company: "Aurobindo Pharma", drugType: "Generic", descriptor: VIRAL, target: HIVRT, geographies: ["India", "South Africa"], stage: "Marketed", route: "Oral", moleculeType: SMALL, regimen: "Combination", atc: J05A, applicationType: ANDA },
  { name: "Aclovent", generic: "Aceclofenac", company: "Glenmark Pharmaceuticals", drugType: "Generic", descriptor: INFLAM, target: ACTG2, geographies: ["India", "United Kingdom"], stage: "Phase III", route: "Oral", moleculeType: SMALL, regimen: "Combination", atc: M01A, applicationType: ANDA },
  { name: "RTX-2210", generic: "Rituximab-arrx", company: "Amgen", drugType: "Biosimilar", descriptor: IMMUNO, target: CD20, geographies: ["United States", "Canada"], stage: "Marketed", route: "Intravenous", moleculeType: MAB, regimen: "Mono", atc: L04A, applicationType: BLA },
  { name: "Netrelva", generic: "Nivolumab Beta", company: "Bristol Myers Squibb", drugType: "Branded", descriptor: ONCO, target: PD1, geographies: ["United States", "Japan"], stage: "Marketed", route: "Intravenous", moleculeType: MAB, regimen: "Mono", atc: L01F, applicationType: BLA },
  { name: "TAK-9004", generic: "Ponatinib Besilate", company: "Takeda", drugType: "Orphan", descriptor: ONCO, target: EGFR, geographies: ["Japan", "United States"], stage: "Phase I", route: "Oral", moleculeType: SMALL, regimen: "Mono", atc: L01E, applicationType: IND },
  { name: "Ibrutix", generic: "Ibrutinib Maleate", company: "Incyte", drugType: "Branded", descriptor: ONCO, target: BTK, geographies: ["United States", "Canada"], stage: "Phase III", route: "Oral", moleculeType: SMALL, regimen: "Mono", atc: L01E, applicationType: NDA },
  { name: "COH-2280", generic: "Secukinumab-brtx", company: "Coherus BioSciences", drugType: "Biosimilar", descriptor: IMMUNO, target: IL17A, geographies: ["United States"], stage: "Preclinical", route: "Subcutaneous", moleculeType: MAB, regimen: "Mono", atc: L04A, applicationType: IND },
  { name: "AMG-441", generic: "Amtolmetin Guacil", company: "Amneal Pharmaceuticals", drugType: "Generic", descriptor: INFLAM, target: ACTG2, geographies: ["United States"], stage: "Phase III", route: "Oral", moleculeType: SMALL, regimen: "Mono", atc: M01A, applicationType: NDA },
  { name: "PRX-554", generic: "Parecoxib Sodium", company: "Intas Pharmaceuticals", drugType: "Generic", descriptor: INFLAM, target: COX2, geographies: ["Germany", "Belgium"], stage: "Phase II", route: "Intravenous", moleculeType: SMALL, regimen: "Mono", atc: M01A, applicationType: NDA },
  { name: "Ixebra", generic: "Ixekizumab Alfa", company: "Argenx", drugType: "Branded", descriptor: IMMUNO, target: IL17A, geographies: ["Denmark", "Sweden"], stage: "Phase III", route: "Subcutaneous", moleculeType: MAB, regimen: "Mono", atc: L04A, applicationType: BLA },
  { name: "MOD-2087", generic: "Elasomeran Beta", company: "Moderna", drugType: "Branded", descriptor: VIRAL, target: HIVRT, geographies: ["United States", "Switzerland"], stage: "Discovery", route: "Subcutaneous", moleculeType: OLIGO, regimen: "Mono", atc: J05A, applicationType: IND },
  { name: "Bromfelex", generic: "Bromfenac Sodium", company: "Cipla", drugType: "Generic", descriptor: INFLAM, target: ACTG2, geographies: ["India", "Australia"], stage: "Phase II", route: "Intravenous", moleculeType: SMALL, regimen: "Mono", atc: M01A, applicationType: ANDA },
  { name: "GZR-4410", generic: "Zoliflodacin Sodium", company: "Otsuka Pharmaceutical", drugType: "Orphan", descriptor: BACT, target: GYRA, geographies: ["Japan", "United States"], stage: "Phase II", route: "Oral", moleculeType: SMALL, regimen: "Mono", atc: J01M, applicationType: IND },
  { name: "ZP-1848X", generic: "Glepaglutide Acetate", company: "Zealand Pharma", drugType: "Orphan", descriptor: DIAB, target: GLP1R, geographies: ["Denmark", "Germany"], stage: "Phase II", route: "Subcutaneous", moleculeType: PEPTIDE, regimen: "Mono", atc: A10B, applicationType: IND },
  { name: "BNT-1163", generic: "Zorevunemab Alfa", company: "BioNTech", drugType: "Branded", descriptor: VIRAL, target: HIVRT, geographies: ["Germany", "Belgium"], stage: "Preclinical", route: "Subcutaneous", moleculeType: MAB, regimen: "Mono", atc: J05A, applicationType: IND },
  { name: "Nurofast", generic: "Ibuprofen Sodium", company: "Reckitt", drugType: "Over the Counter", descriptor: ANALG, target: COX1, geographies: ["United Kingdom", "France"], stage: "Marketed", route: "Oral", moleculeType: SMALL, regimen: "Mono", atc: N02B, applicationType: ANDA },
  { name: "Panadine", generic: "Paracetamol Codeine", company: "Haleon", drugType: "Over the Counter", descriptor: ANALG, target: PGES, geographies: ["Germany", "France"], stage: "Marketed", route: "Oral", moleculeType: SMALL, regimen: "Combination", atc: N02B, applicationType: ANDA },
  { name: "Olmesar-HD", generic: "Olmesartan Medoxomil", company: "Daiichi Sankyo", drugType: "Generic", descriptor: HYPER, target: AT1R, geographies: ["Japan", "Italy"], stage: "Marketed", route: "Oral", moleculeType: SMALL, regimen: "Mono", atc: C09C, applicationType: ANDA },
  { name: "Ceftrix-J", generic: "Ceftriaxone Disodium", company: "Sawai Pharmaceutical", drugType: "Generic", descriptor: BACT, target: GYRA, geographies: ["Japan"], stage: "Withdrawn", route: "Intravenous", moleculeType: SMALL, regimen: "Mono", atc: J01C, applicationType: ANDA },
  { name: "Semaglide", generic: "Semaglutide Acetate", company: "Novo Nordisk", drugType: "Branded", descriptor: DIAB, target: GLP1R, geographies: ["Denmark", "United States"], stage: "Marketed", route: "Subcutaneous", moleculeType: PEPTIDE, regimen: "Mono", atc: A10B, applicationType: NDA },
  { name: "Doravix", generic: "Doravirine Sodium", company: "Emcure Pharmaceuticals", drugType: "Generic", descriptor: VIRAL, target: HIVRT, geographies: ["Brazil", "India"], stage: "Pre-registration", route: "Oral", moleculeType: SMALL, regimen: "Mono", atc: J05A, applicationType: ANDA },
  { name: "JZP-770", generic: "Selinexor Citrate", company: "Jazz Pharmaceuticals", drugType: "Orphan", descriptor: ONCO, target: PD1, geographies: ["United States", "Italy"], stage: "Discovery", route: "Oral", moleculeType: SMALL, regimen: "Mono", atc: L01E, applicationType: IND },
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
 * The sample, filtered against the sentence in memory. A fixed array and a
 * predicate — still no filter engine, still nothing fetched, but what is on
 * screen agrees with what the sentence says.
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

/**
 * The one function the screen should call: the rows, and the number above them,
 * reconciled so they cannot contradict each other.
 *
 * The headline stays the share arithmetic — it is the live count the direction
 * is arguing for, and it has to move continuously as the sentence is edited
 * rather than in jumps of one row. But two reconciliations are applied to it,
 * because a count the rows visibly disagree with is worse than a coarse one:
 *
 * - **Nothing matched means none.** If no drug in the sample satisfies the
 *   sentence, the set is empty and the number says zero. A confident four-digit
 *   count over an empty table is exactly the failure this direction cannot
 *   survive, and it is the first thing a sceptical reader would find.
 * - **Never fewer than are on screen.** The count is floored at the number of
 *   rows drawn, so `Showing 1–14 of 9` can never appear.
 */
export function screenDrugs(clauses: Clause[]) {
  const rows = matchingRows(clauses)
  if (clauses.length === 0) return { rows, total: BASE_COUNT }
  if (rows.length === 0) return { rows, total: 0 }
  return { rows, total: Math.max(rows.length, resultCount(clauses)) }
}
