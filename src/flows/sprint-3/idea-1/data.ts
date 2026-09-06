/**
 * Content and query model for the Sprint 3 / Idea 1 port.
 *
 * The screens are a faithful port of the reviewed filter-builder modal, but the
 * results behind them are no longer a fixed picture: sixteen hardcoded rows are
 * filtered in memory against whatever filters are active, the way Idea 3 does
 * it. Nothing is fetched and there is no filter engine — the count is a
 * deterministic stand-in built from authored shares, and the rows are page one
 * of the set it describes. What matters is that no edit can move one without
 * moving the other.
 *
 * Every number a screen shows is still authored: 285,529 unfiltered, the
 * per-value counts in the picker, and the shares that land the worked example
 * on 245.
 */

import { productAreas } from "@/components/prototype/product-areas"

/** Unfiltered drug count on the live platform. */
export const BASE_COUNT = 285_529

/* -------------------------------------------------------------------------- */
/* Rows                                                                        */
/* -------------------------------------------------------------------------- */

/** Attributes a filter can be evaluated against. */
export type RowField =
  | "name"
  | "generic"
  | "company"
  | "therapyArea"
  | "indication"
  | "stage"
  | "geography"
  | "route"
  | "molecule"
  | "target"
  | "mechanism"
  | "atc"
  | "drugType"
  | "mono"
  | "descriptor"
  | "vector"
  | "application"
  | "cas"

export interface DrugRow {
  name: string
  generic: string
  company: string
  therapyArea: string
  indication: string
  /** Stage as the table prints it, e.g. `Phase II`. */
  stage: string
  /**
   * Every stage value the row answers to. A pipeline drug answers to both its
   * phase and the coarse `Pipeline` bucket, because the incumbent's picker
   * offers the buckets and its AI writes the phases.
   */
  stageValues: string[]
  geographies: string[]
  route: string
  molecule: string
  target: string
  mechanism: string
  atc: string
  drugType: string
  mono: string
  descriptor: string
  vector: string
  application: string
  cas: string
}

const ACTG2 = "Actin Gamma Enteric Smooth Muscle"
const COX = "Cyclooxygenase Inhibitor"
const M01A = "M01A — Antiinflammatory and Antirheumatic, Non-Steroids"
const N02B = "N02B — Other Analgesics and Antipyretics"
const L04A = "L04A — Immunosuppressants"
const ANDA = "Abbreviated New Drug Application"
const NDA = "New Drug Application"
const BLA = "Biologics License Application"
const ANTIINFLAMMATORY = "Antiinflammatory Therapy"

/**
 * The sample. Sixteen rows, deliberately varied: seven satisfy the worked
 * example and nine do not, so applying the query visibly cuts the table rather
 * than leaving it looking untouched.
 *
 * Two constraints hold the sample to the authored picker counts — no more than
 * three `Marketed` rows and no more than twelve `Pipeline` rows, because the
 * incumbent's Developmental stage picker promises 3 and 12.
 */
export const drugRows: DrugRow[] = [
  {
    name: "Rebalzid", generic: "Nabumetone Sodium", company: "Zydus Lifesciences",
    therapyArea: "Musculoskeletal Disorders", indication: "Osteoarthritis",
    stage: "Phase III", stageValues: ["Pipeline", "Phase III"],
    geographies: ["United States", "Canada"], route: "Oral", molecule: "Small Molecule",
    target: ACTG2, mechanism: COX, atc: M01A, drugType: "Generic", mono: "Mono",
    descriptor: ANTIINFLAMMATORY, vector: "None", application: ANDA, cas: "42924-53-8",
  },
  {
    name: "NVR-2210", generic: "Tenoxicam Besilate", company: "Sandoz",
    therapyArea: "Musculoskeletal Disorders", indication: "Rheumatoid Arthritis",
    stage: "Phase II", stageValues: ["Pipeline", "Phase II"],
    geographies: ["Germany", "France"], route: "Oral", molecule: "Small Molecule",
    target: ACTG2, mechanism: COX, atc: M01A, drugType: "Generic", mono: "Mono",
    descriptor: ANTIINFLAMMATORY, vector: "None", application: ANDA, cas: "59804-37-4",
  },
  {
    name: "Aclovent", generic: "Aceclofenac", company: "Glenmark Pharmaceuticals",
    therapyArea: "Musculoskeletal Disorders", indication: "Ankylosing Spondylitis",
    stage: "Marketed", stageValues: ["Marketed"],
    geographies: ["India", "United Kingdom"], route: "Oral", molecule: "Small Molecule",
    target: ACTG2, mechanism: COX, atc: M01A, drugType: "Generic", mono: "Combination",
    descriptor: ANTIINFLAMMATORY, vector: "None", application: ANDA, cas: "89796-99-6",
  },
  {
    name: "LRX-118", generic: "Lornoxicam Trometamol", company: "Hikma Pharmaceuticals",
    therapyArea: "Musculoskeletal Disorders", indication: "Acute Pain",
    stage: "Phase II", stageValues: ["Pipeline", "Phase II"],
    geographies: ["United States"], route: "Intravenous", molecule: "Small Molecule",
    target: ACTG2, mechanism: COX, atc: M01A, drugType: "Generic", mono: "Mono",
    descriptor: ANTIINFLAMMATORY, vector: "None", application: NDA, cas: "70374-39-9",
  },
  {
    name: "Nimesta", generic: "Nimesulide", company: "Alkem Laboratories",
    therapyArea: "Musculoskeletal Disorders", indication: "Osteoarthritis",
    stage: "Phase II", stageValues: ["Pipeline", "Phase II"],
    geographies: ["Brazil", "Mexico"], route: "Oral", molecule: "Small Molecule",
    target: ACTG2, mechanism: COX, atc: N02B, drugType: "Generic", mono: "Mono",
    descriptor: ANTIINFLAMMATORY, vector: "None", application: ANDA, cas: "51803-78-2",
  },
  {
    name: "Etodex", generic: "Etodolac", company: "Teva Pharmaceutical",
    therapyArea: "Musculoskeletal Disorders", indication: "Rheumatoid Arthritis",
    stage: "Phase III", stageValues: ["Pipeline", "Phase III"],
    geographies: ["United States", "Japan"], route: "Oral", molecule: "Small Molecule",
    target: ACTG2, mechanism: COX, atc: M01A, drugType: "Generic", mono: "Mono",
    descriptor: ANTIINFLAMMATORY, vector: "None", application: ANDA, cas: "41340-25-4",
  },
  {
    name: "Tolfamex", generic: "Tolfenamic Acid", company: "Krka",
    therapyArea: "Musculoskeletal Disorders", indication: "Migraine",
    stage: "Phase III", stageValues: ["Pipeline", "Phase III"],
    geographies: ["Poland", "Sweden"], route: "Oral", molecule: "Small Molecule",
    target: ACTG2, mechanism: COX, atc: M01A, drugType: "Generic", mono: "Mono",
    descriptor: ANTIINFLAMMATORY, vector: "None", application: ANDA, cas: "13710-19-5",
  },
  {
    name: "Dermavia", generic: "Calcipotriol", company: "LEO Pharma",
    therapyArea: "Dermatology", indication: "Plaque Psoriasis",
    stage: "Marketed", stageValues: ["Marketed"],
    geographies: ["Denmark", "United States"], route: "Topical", molecule: "Small Molecule",
    target: "Vitamin D Receptor", mechanism: "Vitamin D Receptor Agonist",
    atc: "D05A — Antipsoriatics for Topical Use", drugType: "Branded", mono: "Mono",
    descriptor: "Antipsoriatic Therapy", vector: "None", application: NDA, cas: "112965-21-6",
  },
  {
    name: "KLS-77", generic: "Secukinumab Biosimilar", company: "Sandoz",
    therapyArea: "Dermatology", indication: "Plaque Psoriasis",
    stage: "Phase III", stageValues: ["Pipeline", "Phase III"],
    geographies: ["Austria", "Germany"], route: "Subcutaneous", molecule: "Monoclonal Antibody",
    target: "Interleukin 17A", mechanism: "Interleukin 17A Antagonist", atc: L04A,
    drugType: "Biosimilar", mono: "Mono", descriptor: "Immunosuppressant Therapy",
    vector: "None", application: BLA, cas: "1229022-83-6",
  },
  {
    name: "Hepvara", generic: "Sofosbuvir", company: "Cipla",
    therapyArea: "Infectious Disease", indication: "Chronic Hepatitis C",
    stage: "Marketed", stageValues: ["Marketed"],
    geographies: ["India", "South Africa"], route: "Oral", molecule: "Small Molecule",
    target: "NS5B Polymerase", mechanism: "Polymerase Inhibitor",
    atc: "J05A — Direct Acting Antivirals", drugType: "Generic", mono: "Combination",
    descriptor: "Antiviral Therapy", vector: "None", application: ANDA, cas: "1190307-88-0",
  },
  {
    name: "BRT-9080", generic: "Bempedoic Acid", company: "Esperion Therapeutics",
    therapyArea: "Cardiovascular", indication: "Hypercholesterolaemia",
    stage: "Phase III", stageValues: ["Pipeline", "Phase III"],
    geographies: ["United States", "Germany"], route: "Oral", molecule: "Small Molecule",
    target: "ATP Citrate Lyase", mechanism: "ATP Citrate Lyase Inhibitor",
    atc: "C10A — Lipid Modifying Agents", drugType: "Branded", mono: "Mono",
    descriptor: "Antihyperlipidaemic Therapy", vector: "None", application: NDA, cas: "738606-46-7",
  },
  {
    name: "Cardiflow", generic: "Ivabradine", company: "Servier",
    therapyArea: "Cardiovascular", indication: "Chronic Heart Failure",
    stage: "Pre-registration", stageValues: ["Pipeline", "Pre-registration"],
    geographies: ["France", "Italy"], route: "Oral", molecule: "Small Molecule",
    target: "HCN Channel", mechanism: "If Current Inhibitor",
    atc: "C01E — Other Cardiac Preparations", drugType: "Generic", mono: "Mono",
    descriptor: "Antianginal Therapy", vector: "None", application: ANDA, cas: "148849-67-6",
  },
  {
    name: "AXP-114", generic: "Empagliflozin", company: "Sun Pharmaceutical",
    therapyArea: "Metabolic Disorders", indication: "Type 2 Diabetes",
    stage: "Phase II", stageValues: ["Pipeline", "Phase II"],
    geographies: ["United States", "Japan"], route: "Oral", molecule: "Small Molecule",
    target: "Sodium Glucose Cotransporter 2", mechanism: "SGLT2 Inhibitor",
    atc: "A10B — Blood Glucose Lowering Drugs", drugType: "Generic", mono: "Mono",
    descriptor: "Antidiabetic Therapy", vector: "None", application: ANDA, cas: "864070-44-0",
  },
  {
    name: "Immunex-R", generic: "Tofacitinib", company: "Pfizer",
    therapyArea: "Immunology", indication: "Rheumatoid Arthritis",
    stage: "Withdrawn", stageValues: ["Withdrawn (Marketed)"],
    geographies: ["United States", "Canada"], route: "Oral", molecule: "Small Molecule",
    target: "Janus Kinase 3", mechanism: "Janus Kinase Inhibitor", atc: L04A,
    drugType: "Branded", mono: "Mono", descriptor: "Immunosuppressant Therapy",
    vector: "None", application: NDA, cas: "477600-75-2",
  },
  {
    name: "Gastroril", generic: "Esomeprazole Magnesium", company: "Dr. Reddy's Laboratories",
    therapyArea: "Gastrointestinal", indication: "Gastroesophageal Reflux",
    stage: "Archived", stageValues: ["Archived (Marketed)"],
    geographies: ["United States", "Spain"], route: "Oral", molecule: "Small Molecule",
    target: "Hydrogen Potassium ATPase", mechanism: "Proton Pump Inhibitor",
    atc: "A02B — Drugs for Peptic Ulcer and GORD", drugType: "Generic", mono: "Mono",
    descriptor: "Antiulcer Therapy", vector: "None", application: ANDA, cas: "161796-78-7",
  },
  {
    name: "MRD-330", generic: "Onasemnogene Abeparvovec", company: "Novartis",
    therapyArea: "Genetic Disorders", indication: "Spinal Muscular Atrophy",
    stage: "Phase I", stageValues: ["Pipeline", "Phase I"],
    geographies: ["United States", "United Kingdom"], route: "Intravenous",
    molecule: "Gene Therapy", target: "Survival Motor Neuron 1",
    mechanism: "Gene Replacement", atc: "M09A — Other Musculoskeletal Drugs",
    drugType: "Orphan", mono: "Mono", descriptor: "Gene Therapy",
    vector: "Adeno Associated Virus (AAV)", application: BLA, cas: "1922968-73-7",
  },
]

const fieldReaders: Record<RowField, (row: DrugRow) => string[]> = {
  name: (row) => [row.name],
  generic: (row) => [row.generic],
  company: (row) => [row.company],
  therapyArea: (row) => [row.therapyArea],
  indication: (row) => [row.indication],
  stage: (row) => row.stageValues,
  geography: (row) => row.geographies,
  route: (row) => [row.route],
  molecule: (row) => [row.molecule],
  target: (row) => [row.target],
  mechanism: (row) => [row.mechanism],
  atc: (row) => [row.atc],
  drugType: (row) => [row.drugType],
  mono: (row) => [row.mono],
  descriptor: (row) => [row.descriptor],
  vector: (row) => [row.vector],
  application: (row) => [row.application],
  cas: (row) => [row.cas],
}

/* -------------------------------------------------------------------------- */
/* The query model                                                             */
/* -------------------------------------------------------------------------- */

export type Operator = "AND" | "OR" | "NOT"

export const operators: Operator[] = ["AND", "OR", "NOT"]

export interface FilterChip {
  label: string
  /** Result count shown inside the chip, where the source shows one. */
  count?: number
  /** Fraction of the corpus this value covers. Authored, never measured. */
  share?: number
  /** Operator rendered after this chip, inside the same group. */
  next?: Operator
  /** Rendered before the chip as a static prefix, e.g. `between` on a date range. */
  prefix?: string
}

export interface FilterGroup {
  label: string
  chips: FilterChip[]
  /** Operator rendered between this group and the one after it. */
  next?: Operator
  /** Row attribute this group tests. Absent means drawn but not evaluated. */
  field?: RowField
  /** Attribute the group was built from, so the bar can reopen its picker. */
  attribute?: string
  /** Area the attribute sits under, for the same reason. */
  area?: string
}

/**
 * Whether a group is negated.
 *
 * The source draws one NOT between the Developmental stage and Drug geography
 * groups, and its own transcript says both are exclusions — so a NOT negates
 * the group on either side of it. That ambiguity is the incumbent's; it is
 * reproduced rather than resolved.
 */
export function groupNegated(groups: FilterGroup[], index: number) {
  return groups[index]?.next === "NOT" || groups[index - 1]?.next === "NOT"
}

function evaluable(group: FilterGroup) {
  return Boolean(group.field && group.chips.length)
}

/** Does one row satisfy the chips in one group, before negation? */
function groupMatches(group: FilterGroup, row: DrugRow) {
  const read = fieldReaders[group.field as RowField]
  const values = read(row)
  let hit = values.includes(group.chips[0].label)
  for (let i = 1; i < group.chips.length; i++) {
    const operator = group.chips[i - 1].next ?? "AND"
    const next = values.includes(group.chips[i].label)
    if (operator === "OR") hit = hit || next
    else if (operator === "AND") hit = hit && next
    else hit = hit && !next
  }
  return hit
}

/**
 * The sample, filtered in memory. A group with no `field` — the three overflow
 * filters, which have no counterpart in the sample — is left unevaluated and
 * its rows are kept, rather than silently dropped as though it had applied.
 */
export function matchingRows(groups: FilterGroup[]) {
  return drugRows.filter((row) =>
    groups.every((group, i) => {
      if (!evaluable(group)) return true
      const hit = groupMatches(group, row)
      return groupNegated(groups, i) ? !hit : hit
    }),
  )
}

/** The share of the corpus one group keeps. Unknown shares are left neutral. */
function groupFactor(groups: FilterGroup[], index: number) {
  const group = groups[index]
  if (!evaluable(group)) return 1

  const known = group.chips.filter((chip) => chip.share !== undefined)
  if (known.length === 0) return 1

  let share = known[0].share as number
  for (let i = 1; i < known.length; i++) {
    const operator = known[i - 1].next ?? "AND"
    const next = known[i].share as number
    // `or` unions the shares, `and` intersects them under independence, so
    // flipping the joining word moves the count the same way it moves the rows.
    if (operator === "OR") share = share + next
    else if (operator === "AND") share = share * next
    else share = share * (1 - next)
  }

  const clamped = Math.min(0.98, Math.max(0.000_003_5, share))
  return groupNegated(groups, index) ? 1 - clamped : clamped
}

/**
 * Deterministic stand-in for a server count.
 *
 * Floored at the number of rows actually on screen and zeroed when nothing
 * matches, so the headline can never claim a set the table cannot show.
 */
export function resultCount(groups: FilterGroup[]) {
  const rows = matchingRows(groups)
  if (rows.length === 0) return 0
  if (groups.length === 0) return BASE_COUNT
  const total = groups.reduce((count, _group, i) => count * groupFactor(groups, i), BASE_COUNT)
  return Math.max(rows.length, Math.round(total))
}

export function formatCount(count: number) {
  return count.toLocaleString("en-GB")
}

/* -------------------------------------------------------------------------- */
/* The filter vocabulary                                                       */
/* -------------------------------------------------------------------------- */

export interface ValueOption {
  label: string
  /** Count shown beside the value in the picker. Authored. */
  count: number
  /** Fraction of the corpus, derived from the count the picker promises. */
  share: number
}

function values(entries: [string, number][]): ValueOption[] {
  return entries.map(([label, count]) => ({ label, count, share: count / BASE_COUNT }))
}

export interface AttributeSpec {
  /** Label the cascade shows. */
  label: string
  /** Label the builder and the bar give the group. The two differ in the source. */
  groupLabel: string
  field?: RowField
  values: ValueOption[]
}

/** Therapy areas keep the incumbent's authored counts. */
export const therapyAreas: ValueOption[] = values([
  ["Cardiovascular", 20],
  ["Central Nervous System", 3],
  ["Dermatology", 126],
  ["Ear Nose Throat Disorders", 32],
  ["Gastrointestinal", 25],
  ["Genetic Disorders", 17],
  ["Genito Urinary System", 54],
  ["Hermatological Disorders", 19],
  ["Hormonal Disorders", 17],
  ["Immunology", 9],
  ["Infectious Disease", 102],
  ["Metabolic Disorders", 59],
  ["Musculoskeletal Disorders", 276],
])

/** The two buckets the incumbent's stage picker offers, at its authored counts. */
export const developmentalStages: ValueOption[] = values([
  ["Marketed", 3],
  ["Pipeline", 12],
])

const drugAttributeSpecs: AttributeSpec[] = [
  {
    label: "Drug Name", groupLabel: "Drug name", field: "name",
    values: values(drugRows.map((row) => [row.name, 1])),
  },
  {
    label: "Therapy Area / Indication", groupLabel: "Therapy area / indication",
    field: "therapyArea", values: therapyAreas,
  },
  {
    label: "Development Stage", groupLabel: "Developmental stage", field: "stage",
    values: developmentalStages,
  },
  {
    label: "Drug Geography", groupLabel: "Drug geography", field: "geography",
    values: values([
      ["Austria", 25_698], ["Italy", 14_276], ["Germany", 59_961], ["France", 51_395],
      ["Spain", 31_408], ["United Kingdom", 42_829], ["United States", 125_633],
      ["Canada", 34_263], ["Japan", 45_684], ["India", 37_119], ["Brazil", 22_842],
      ["Mexico", 17_132], ["Poland", 14_276], ["Sweden", 11_421], ["Denmark", 8_566],
      ["South Africa", 8_566],
    ]),
  },
  {
    label: "Route of Administration", groupLabel: "Route of administration", field: "route",
    values: values([
      ["Oral", 174_173], ["Intravenous", 51_395], ["Subcutaneous", 25_698],
      ["Topical", 19_987], ["Inhaled", 14_276],
    ]),
  },
  {
    label: "Molecule Type", groupLabel: "Molecule type", field: "molecule",
    values: values([
      ["Small Molecule", 211_291], ["Monoclonal Antibody", 34_263], ["Peptide", 19_987],
      ["Recombinant Protein", 11_421], ["Gene Therapy", 8_566],
    ]),
  },
  {
    label: "Target", groupLabel: "Target", field: "target",
    values: values([
      [ACTG2, 8_066], ["Cyclooxygenase 2", 3_431], ["Cyclooxygenase 1", 2_220],
      ["Interleukin 17A", 1_614], ["Janus Kinase 3", 807], ["Vitamin D Receptor", 504],
      ["ATP Citrate Lyase", 431], ["HCN Channel", 388],
      ["Sodium Glucose Cotransporter 2", 1_042], ["NS5B Polymerase", 733],
      ["Hydrogen Potassium ATPase", 1_318], ["Survival Motor Neuron 1", 96],
    ]),
  },
  {
    label: "Mechanism of Action", groupLabel: "Mechanism of action", field: "mechanism",
    values: values([
      [COX, 22_842], ["Interleukin 17A Antagonist", 4_283], ["Janus Kinase Inhibitor", 3_426],
      ["Proton Pump Inhibitor", 5_711], ["SGLT2 Inhibitor", 2_855],
      ["Polymerase Inhibitor", 4_568], ["Vitamin D Receptor Agonist", 1_713],
      ["ATP Citrate Lyase Inhibitor", 856], ["If Current Inhibitor", 571],
      ["Gene Replacement", 285],
    ]),
  },
  {
    label: "ATC Classification", groupLabel: "ATC classification", field: "atc",
    values: values([
      [M01A, 25_698], [N02B, 14_276], [L04A, 17_132],
      ["A02B — Drugs for Peptic Ulcer and GORD", 11_421],
      ["A10B — Blood Glucose Lowering Drugs", 14_276],
      ["C01E — Other Cardiac Preparations", 5_711],
      ["C10A — Lipid Modifying Agents", 12_849],
      ["D05A — Antipsoriatics for Topical Use", 4_283],
      ["J05A — Direct Acting Antivirals", 8_566],
      ["M09A — Other Musculoskeletal Drugs", 2_855],
    ]),
  },
  {
    label: "Drug Type", groupLabel: "Drug type", field: "drugType",
    values: values([
      ["Generic", 88_514], ["Branded", 148_475], ["Biosimilar", 11_421], ["Orphan", 19_987],
    ]),
  },
  {
    label: "Mono/Combination Drug", groupLabel: "Mono/combination drug", field: "mono",
    values: values([["Mono", 259_831], ["Combination", 25_698]]),
  },
  {
    label: "Drug Descriptor", groupLabel: "Drug descriptor", field: "descriptor",
    values: values([
      [ANTIINFLAMMATORY, 32_550], ["Immunosuppressant Therapy", 12_849],
      ["Antiviral Therapy", 17_132], ["Antidiabetic Therapy", 14_276],
      ["Antihyperlipidaemic Therapy", 11_421], ["Antipsoriatic Therapy", 5_711],
      ["Antiulcer Therapy", 8_566], ["Antianginal Therapy", 4_283],
      ["Gene Therapy", 2_855],
    ]),
  },
  {
    label: "Gene Therapy Vector", groupLabel: "Gene therapy vector", field: "vector",
    values: values([
      ["Adeno Associated Virus (AAV)", 2_855], ["Lentivirus", 1_713],
      ["Adenovirus", 1_142], ["None", 279_819],
    ]),
  },
  {
    label: "Application Type", groupLabel: "Application type", field: "application",
    values: values([[ANDA, 88_514], [NDA, 74_237], [BLA, 25_698]]),
  },
  {
    label: "CAS Number", groupLabel: "CAS number", field: "cas",
    values: values(drugRows.map((row) => [row.cas, 1])),
  },
]

/**
 * Attribute lists for the other seven areas.
 *
 * The reviewed design only ever drew the Drugs pill open, but it draws all
 * eight pills, so all eight open here. These attributes have no counterpart in
 * the drug sample, so they are drawn and selectable but not evaluated — they
 * move neither the count nor the rows.
 */
const otherAreaSpecs: Record<string, AttributeSpec[]> = {
  Companies: [
    { label: "Company Name", groupLabel: "Company name", values: values([["Pfizer", 1], ["Novartis", 1], ["Sandoz", 1], ["Teva Pharmaceutical", 1]]) },
    { label: "Headquarters Country", groupLabel: "Headquarters country", values: values([["United States", 4_812], ["Switzerland", 1_204], ["India", 2_930], ["Germany", 1_866]]) },
    { label: "Company Type", groupLabel: "Company type", values: values([["Pharmaceutical", 6_140], ["Biotechnology", 4_318], ["Generic Manufacturer", 2_209], ["Contract Research", 1_105]]) },
  ],
  "Licensing Opportunities": [
    { label: "Deal Type", groupLabel: "Deal type", values: values([["Licensing", 3_412], ["Co-development", 1_890], ["Distribution", 1_204], ["Option to License", 655]]) },
    { label: "Deal Status", groupLabel: "Deal status", values: values([["Available", 2_118], ["Under Negotiation", 946], ["Completed", 3_884], ["Terminated", 412]]) },
    { label: "Deal Value", groupLabel: "Deal value", values: values([["Under $10M", 1_902], ["$10M–$50M", 2_441], ["$50M–$250M", 1_338], ["Over $250M", 487]]) },
  ],
  "Regulatory Milestones": [
    { label: "Regulatory Body", groupLabel: "Regulatory body", values: values([["FDA", 12_804], ["EMA", 9_331], ["PMDA", 4_106], ["MHRA", 3_218]]) },
    { label: "Milestone Type", groupLabel: "Milestone type", values: values([["Filing Accepted", 8_112], ["Approval", 6_940], ["Complete Response Letter", 1_204], ["Withdrawal", 688]]) },
    { label: "Milestone Year", groupLabel: "Milestone year", values: values([["2023", 5_120], ["2024", 5_866], ["2025", 6_204], ["2026", 2_118]]) },
  ],
  "Sales and Forecast": [
    { label: "Sales Region", groupLabel: "Sales region", values: values([["North America", 18_440], ["Europe", 15_202], ["Asia Pacific", 12_118], ["Rest of World", 6_330]]) },
    { label: "Forecast Year", groupLabel: "Forecast year", values: values([["2025", 9_880], ["2026", 9_880], ["2027", 9_880], ["2028", 9_880]]) },
    { label: "Revenue Band", groupLabel: "Revenue band", values: values([["Under $50M", 14_220], ["$50M–$500M", 9_118], ["$500M–$1Bn", 3_404], ["Over $1Bn", 1_866]]) },
  ],
  "Drugs by Manufacturer": [
    { label: "Manufacturer", groupLabel: "Manufacturer", values: values([["Pfizer", 2_204], ["Teva Pharmaceutical", 3_118], ["Sun Pharmaceutical", 2_440], ["Sandoz", 1_890]]) },
    { label: "Manufacturing Site Country", groupLabel: "Manufacturing site country", values: values([["United States", 8_112], ["India", 11_204], ["Ireland", 2_118], ["China", 6_440]]) },
    { label: "Production Stage", groupLabel: "Production stage", values: values([["API", 9_118], ["Formulation", 12_204], ["Packaging", 7_330], ["Distribution", 5_112]]) },
  ],
  NPV: [
    { label: "NPV Band", groupLabel: "NPV band", values: values([["Under $25M", 6_204], ["$25M–$55M", 4_118], ["$55M–$250M", 2_890], ["Over $250M", 1_204]]) },
    { label: "Discount Rate", groupLabel: "Discount rate", values: values([["8%", 3_118], ["10%", 6_440], ["12%", 3_204], ["15%", 1_654]]) },
    { label: "Peak Sales Year", groupLabel: "Peak sales year", values: values([["2027", 3_440], ["2028", 4_118], ["2029", 3_890], ["2030", 2_968]]) },
  ],
  "Advanced Company Watchlist": [
    { label: "Watchlist", groupLabel: "Watchlist", values: values([["My Watchlist", 42], ["Oncology Leaders", 118], ["Generics Majors", 64], ["Emerging Biotech", 96]]) },
    { label: "Alert Type", groupLabel: "Alert type", values: values([["Price Change", 204], ["Pipeline Update", 418], ["Regulatory Event", 266], ["M&A Activity", 88]]) },
    { label: "Added", groupLabel: "Added", values: values([["Last 7 days", 24], ["Last 30 days", 88], ["Last quarter", 190], ["Last year", 412]]) },
  ],
}

/** Every area's attribute list, keyed by the area names in the shared chrome. */
export const areaAttributes: Record<string, AttributeSpec[]> = Object.fromEntries(
  productAreas.map((area) => [area, area === "Drugs" ? drugAttributeSpecs : otherAreaSpecs[area] ?? []]),
)

/** The Drugs attribute labels, in order. Imported read-only by Ideas 2 and 4. */
export const drugAttributes: string[] = drugAttributeSpecs.map((spec) => spec.label)

export function findAttribute(area: string, label: string) {
  return areaAttributes[area]?.find((spec) => spec.label === label)
}

/* -------------------------------------------------------------------------- */
/* Authored states                                                             */
/* -------------------------------------------------------------------------- */

/**
 * The parsed result of the worked example query, as it appears in the file.
 * The shares are authored so the query lands on the 245 the reviewed screen
 * shows; the same shares drive the count when the query is edited.
 */
export const parsedGroups: FilterGroup[] = [
  {
    label: "Developmental stage", field: "stage", area: "Drugs", attribute: "Development Stage",
    chips: [
      { label: "Withdrawn (Marketed)", share: 0.03, next: "AND" },
      { label: "Archived (Marketed)", share: 0.02 },
    ],
    next: "NOT",
  },
  {
    label: "Drug geography", field: "geography", area: "Drugs", attribute: "Drug Geography",
    chips: [{ label: "Austria", share: 0.09, next: "OR" }, { label: "Italy", share: 0.05 }],
    next: "AND",
  },
  {
    label: "Target", field: "target", area: "Drugs", attribute: "Target",
    chips: [{ label: ACTG2, share: 8_066 / BASE_COUNT }],
  },
  {
    label: "Drug type", field: "drugType", area: "Drugs", attribute: "Drug Type",
    chips: [{ label: "Generic", share: 88_514 / BASE_COUNT }],
    next: "AND",
  },
  {
    label: "Drug descriptor", field: "descriptor", area: "Drugs", attribute: "Drug Descriptor",
    chips: [{ label: ANTIINFLAMMATORY, share: 32_550 / BASE_COUNT }],
  },
]

/**
 * Three extra groups that push the applied bar past ten filters. They have no
 * counterpart in the sample, so they are drawn but not evaluated — the bar
 * strains without the table lying about it.
 */
export const overflowGroups: FilterGroup[] = [
  { label: "Expiry date", chips: [{ label: "9 Mar 2025 and 10 Apr 2025", prefix: "between" }] },
  { label: "Gene therapy vector", chips: [{ label: "Adeno Associated Virus (AAV)" }] },
  { label: "Marketing status", chips: [{ label: "Tentative Approval" }] },
]

export const aiSuggestions = [
  "Phase II drugs",
  "Phase III drugs",
  "Drugs produced by Northvale Theraputics",
  "Oncology drugs with an NPV over $55M",
]

export const exampleQuery =
  "Find generic anti-inflammatory therapies targeting Actin Gamma Enteric Smooth Muscle, but exclude drugs available in Austria or Italy, as well as marketed drugs that are withdrawn or archived"

export const assistantReply =
  "The filters and groups on the left will show you generic anti-inflammatory therapies targeting Actin Gamma Enteric Smooth Muscle, but exclude drugs available in Austria or Italy, as well as marketed drugs that are withdrawn or archived."

/** Every value a row answers to for one attribute. */
export function readField(row: DrugRow, field: RowField) {
  return fieldReaders[field](row)
}

/** The single bucket a row falls into when the results are grouped by a column. */
export function groupValue(row: DrugRow, field: RowField) {
  if (field === "stage") return row.stage
  if (field === "geography") return row.geographies.join(", ")
  return fieldReaders[field](row)[0]
}

/** The order the incumbent lists developmental stages in, for the grouped view. */
export const stageOrder = [
  "Discovery", "Preclinical", "Phase 0", "Phase I", "Phase II", "Phase III", "Phase IV",
  "Pre-registration", "Tentative Approval", "Approved", "Marketed", "Suspended",
  "Discontinued", "Withdrawn", "Archived",
]

/**
 * Rows collapsed into buckets for one column, in the incumbent's stage order
 * where that is the column and alphabetically otherwise.
 */
export function groupRows(rows: DrugRow[], field: RowField) {
  const buckets = new Map<string, DrugRow[]>()
  for (const row of rows) {
    const key = groupValue(row, field)
    const bucket = buckets.get(key) ?? []
    bucket.push(row)
    buckets.set(key, bucket)
  }

  const rank = (label: string) => {
    if (field !== "stage") return 0
    const i = stageOrder.indexOf(label)
    return i < 0 ? stageOrder.length : i
  }

  return [...buckets.entries()]
    .sort(([a], [b]) => rank(a) - rank(b) || a.localeCompare(b))
    .map(([label, bucket]) => ({ label, rows: bucket }))
}
