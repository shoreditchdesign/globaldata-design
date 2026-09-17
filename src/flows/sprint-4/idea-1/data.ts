import {
  productAreas,
  type ProductArea,
} from "@/components/prototype/ProductChrome"

/** Stable product context shared by every state in this direction. */
export const activeProductArea: ProductArea = "Drugs"

/** The incumbent's highest-level search areas, kept in the established order. */
export const searchCategories = productAreas

type ValueCounts = readonly (readonly [label: string, count: number])[]

interface AttributeSpec {
  /** The pill label, as the incumbent's search tree prints it. */
  label: string
  /** The clause label, in the sentence case the filter box uses. */
  filterLabel: string
  values: ValueCounts
}

const drugNames = [
  "Rebalzid", "NVR-2210", "Aclovent", "LRX-118", "Nimesta", "Etodex", "Tolfamex", "Dermavia",
  "KLS-77", "Hepvara", "BRT-9080", "Cardiflow", "AXP-114", "Immunex-R", "Gastroril", "MRD-330",
]

const casNumbers = [
  "42924-53-8", "59804-37-4", "89796-99-6", "70374-39-9", "51803-78-2", "41340-25-4",
  "13710-19-5", "112965-21-6", "1229022-83-6", "1190307-88-0", "738606-46-7", "148849-67-6",
  "864070-44-0", "477600-75-2", "161796-78-7", "1922968-73-7",
]

const attribute = (label: string, filterLabel: string, values: ValueCounts): AttributeSpec => ({
  label,
  filterLabel,
  values,
})

/**
 * Every search area's attributes and their values, copied from Sprint 3 Idea
 * 1's authored hierarchy so Idea 1 remains self-contained. The counts are that
 * prototype's authored per-value counts; like there, they are illustrative.
 */
const searchAttributes: Record<ProductArea, AttributeSpec[]> = {
  Companies: [
    attribute("Company Name", "Company name", [["Pfizer", 1], ["Novartis", 1], ["Sandoz", 1], ["Teva Pharmaceutical", 1]]),
    attribute("Headquarters Country", "Headquarters country", [["United States", 4_812], ["Switzerland", 1_204], ["India", 2_930], ["Germany", 1_866]]),
    attribute("Company Type", "Company type", [["Pharmaceutical", 6_140], ["Biotechnology", 4_318], ["Generic Manufacturer", 2_209], ["Contract Research", 1_105]]),
  ],
  Drugs: [
    attribute("Drug Name", "Drug name", drugNames.map((name) => [name, 1] as const)),
    attribute("Therapy Area / Indication", "Therapy area / indication", [
      ["Cardiovascular", 20], ["Central Nervous System", 3], ["Dermatology", 126],
      ["Ear Nose Throat Disorders", 32], ["Gastrointestinal", 25], ["Genetic Disorders", 17],
      ["Genito Urinary System", 54], ["Hermatological Disorders", 19], ["Hormonal Disorders", 17],
      ["Immunology", 9], ["Infectious Disease", 102], ["Metabolic Disorders", 59],
      ["Musculoskeletal Disorders", 276],
    ]),
    attribute("Development Stage", "Developmental stage", [
      ["Marketed", 3], ["Pipeline", 12], ["Phase I", 14_210], ["Phase II", 11_707],
      ["Phase III", 9_137], ["Pre-registration", 1_104], ["Withdrawn (Marketed)", 857],
      ["Archived (Marketed)", 571],
    ]),
    attribute("Drug Geography", "Drug geography", [
      ["Austria", 25_698], ["Italy", 14_276], ["Germany", 59_961], ["France", 51_395],
      ["Spain", 31_408], ["United Kingdom", 42_829], ["United States", 125_633],
      ["Canada", 34_263], ["Japan", 45_684], ["India", 37_119], ["Brazil", 22_842],
      ["Mexico", 17_132], ["Poland", 14_276], ["Sweden", 11_421], ["Denmark", 8_566],
      ["South Africa", 8_566],
    ]),
    attribute("Route of Administration", "Route of administration", [
      ["Oral", 174_173], ["Intravenous", 51_395], ["Subcutaneous", 25_698],
      ["Topical", 19_987], ["Inhaled", 14_276],
    ]),
    attribute("Molecule Type", "Molecule type", [
      ["Small Molecule", 211_291], ["Monoclonal Antibody", 34_263], ["Peptide", 19_987],
      ["Recombinant Protein", 11_421], ["Gene Therapy", 8_566],
    ]),
    attribute("Target", "Target", [
      ["Actin Gamma Enteric Smooth Muscle", 8_066], ["Cyclooxygenase 2", 3_431],
      ["Cyclooxygenase 1", 2_220], ["Interleukin 17A", 1_614], ["Janus Kinase 3", 807],
      ["Vitamin D Receptor", 504], ["ATP Citrate Lyase", 431], ["HCN Channel", 388],
      ["Sodium Glucose Cotransporter 2", 1_042], ["NS5B Polymerase", 733],
      ["Hydrogen Potassium ATPase", 1_318], ["Survival Motor Neuron 1", 96],
    ]),
    attribute("Mechanism of Action", "Mechanism of action", [
      ["Cyclooxygenase Inhibitor", 22_842], ["Interleukin 17A Antagonist", 4_283],
      ["Janus Kinase Inhibitor", 3_426], ["Proton Pump Inhibitor", 5_711],
      ["SGLT2 Inhibitor", 2_855], ["Polymerase Inhibitor", 4_568],
      ["Vitamin D Receptor Agonist", 1_713], ["ATP Citrate Lyase Inhibitor", 856],
      ["If Current Inhibitor", 571], ["Gene Replacement", 285],
    ]),
    attribute("ATC Classification", "ATC classification", [
      ["M01A — Antiinflammatory and Antirheumatic, Non-Steroids", 25_698],
      ["N02B — Other Analgesics and Antipyretics", 14_276],
      ["L04A — Immunosuppressants", 17_132],
      ["A02B — Drugs for Peptic Ulcer and GORD", 11_421],
      ["A10B — Blood Glucose Lowering Drugs", 14_276],
      ["C01E — Other Cardiac Preparations", 5_711],
      ["C10A — Lipid Modifying Agents", 12_849],
      ["D05A — Antipsoriatics for Topical Use", 4_283],
      ["J05A — Direct Acting Antivirals", 8_566],
      ["M09A — Other Musculoskeletal Drugs", 2_855],
    ]),
    attribute("Drug Type", "Drug type", [
      ["Generic", 88_514], ["Branded", 148_475], ["Biosimilar", 11_421], ["Orphan", 19_987],
    ]),
    attribute("Mono/Combination Drug", "Mono/combination drug", [["Mono", 259_831], ["Combination", 25_698]]),
    attribute("Drug Descriptor", "Drug descriptor", [
      ["Antiinflammatory Therapy", 32_550], ["Immunosuppressant Therapy", 12_849],
      ["Antiviral Therapy", 17_132], ["Antidiabetic Therapy", 14_276],
      ["Antihyperlipidaemic Therapy", 11_421], ["Antipsoriatic Therapy", 5_711],
      ["Antiulcer Therapy", 8_566], ["Antianginal Therapy", 4_283], ["Gene Therapy", 2_855],
    ]),
    attribute("Gene Therapy Vector", "Gene therapy vector", [
      ["Adeno Associated Virus (AAV)", 2_855], ["Lentivirus", 1_713], ["Adenovirus", 1_142],
      ["None", 279_819],
    ]),
    attribute("Application Type", "Application type", [
      ["Abbreviated New Drug Application", 88_514], ["New Drug Application", 74_237],
      ["Biologics License Application", 25_698],
    ]),
    attribute("CAS Number", "CAS number", casNumbers.map((cas) => [cas, 1] as const)),
    attribute("Expiry Date", "Expiry date", [
      ["Before 2025", 41_212], ["9 Mar 2025 and 10 Apr 2025", 1_284], ["Rest of 2025", 9_637],
      ["2026", 12_408], ["2027 or later", 88_207],
    ]),
    attribute("Marketing Status", "Marketing status", [
      ["Marketed", 98_410], ["Not Marketed", 171_318], ["Filed", 6_852], ["Withdrawn", 5_139],
      ["Discontinued", 3_810],
    ]),
  ],
  "Licensing Opportunities": [
    attribute("Deal Type", "Deal type", [["Licensing", 3_412], ["Co-development", 1_890], ["Distribution", 1_204], ["Option to License", 655]]),
    attribute("Deal Status", "Deal status", [["Available", 2_118], ["Under Negotiation", 946], ["Completed", 3_884], ["Terminated", 412]]),
    attribute("Deal Value", "Deal value", [["Under $10M", 1_902], ["$10M–$50M", 2_441], ["$50M–$250M", 1_338], ["Over $250M", 487]]),
  ],
  "Regulatory Milestones": [
    attribute("Regulatory Body", "Regulatory body", [["FDA", 12_804], ["EMA", 9_331], ["PMDA", 4_106], ["MHRA", 3_218]]),
    attribute("Milestone Type", "Milestone type", [["Filing Accepted", 8_112], ["Approval", 6_940], ["Complete Response Letter", 1_204], ["Withdrawal", 688]]),
    attribute("Milestone Year", "Milestone year", [["2023", 5_120], ["2024", 5_866], ["2025", 6_204], ["2026", 2_118]]),
  ],
  "Sales and Forecast": [
    attribute("Sales Region", "Sales region", [["North America", 18_440], ["Europe", 15_202], ["Asia Pacific", 12_118], ["Rest of World", 6_330]]),
    attribute("Forecast Year", "Forecast year", [["2025", 9_880], ["2026", 9_880], ["2027", 9_880], ["2028", 9_880]]),
    attribute("Revenue Band", "Revenue band", [["Under $50M", 14_220], ["$50M–$500M", 9_118], ["$500M–$1Bn", 3_404], ["Over $1Bn", 1_866]]),
  ],
  "Drugs by Manufacturer": [
    attribute("Manufacturer", "Manufacturer", [["Pfizer", 2_204], ["Teva Pharmaceutical", 3_118], ["Sun Pharmaceutical", 2_440], ["Sandoz", 1_890]]),
    attribute("Manufacturing Site Country", "Manufacturing site country", [["United States", 8_112], ["India", 11_204], ["Ireland", 2_118], ["China", 6_440]]),
    attribute("Production Stage", "Production stage", [["API", 9_118], ["Formulation", 12_204], ["Packaging", 7_330], ["Distribution", 5_112]]),
  ],
  NPV: [
    attribute("NPV Band", "NPV band", [["Under $25M", 6_204], ["$25M–$55M", 4_118], ["$55M–$250M", 2_890], ["Over $250M", 1_204]]),
    attribute("Discount Rate", "Discount rate", [["8%", 3_118], ["10%", 6_440], ["12%", 3_204], ["15%", 1_654]]),
    attribute("Peak Sales Year", "Peak sales year", [["2027", 3_440], ["2028", 4_118], ["2029", 3_890], ["2030", 2_968]]),
  ],
  "Advanced Company Watchlist": [
    attribute("Watchlist", "Watchlist", [["My Watchlist", 42], ["Oncology Leaders", 118], ["Generics Majors", 64], ["Emerging Biotech", 96]]),
    attribute("Alert Type", "Alert type", [["Price Change", 204], ["Pipeline Update", 418], ["Regulatory Event", 266], ["M&A Activity", 88]]),
    attribute("Added", "Added", [["Last 7 days", 24], ["Last 30 days", 88], ["Last quarter", 190], ["Last year", 412]]),
  ],
}

/** The second layer: an area's attributes, in the established order. */
export function searchAttributeLabels(area: ProductArea) {
  return searchAttributes[area].map((spec) => spec.label)
}

/** The third layer: the values under one area's attribute. */
export function searchAttributeValues(area: ProductArea, label: string) {
  return attributeSpec(area, label).values.map(([value]) => value)
}

function attributeSpec(area: ProductArea, label: string) {
  return searchAttributes[area].find((spec) => spec.label === label) as AttributeSpec
}

export const workedQuery =
  "Find generic anti-inflammatory therapies targeting Actin Gamma Enteric Smooth Muscle, but exclude drugs available in Austria or Italy, as well as marketed drugs that are withdrawn or archived."

type AuthoredFilterId = "target" | "drug-type" | "descriptor" | "stage" | "geography"
/** An authored id, or `area/attribute` for a filter built from the pill path. */
export type FilterId = AuthoredFilterId | `${ProductArea}/${string}`
export type FilterJoin = "or" | "and"
export type FilterLink = "and" | "or"

export interface ResolvedFilter {
  id: FilterId
  label: string
  values: string[]
  excluded: boolean
  join: FilterJoin
  /** How this category combines with the category before it. */
  link: FilterLink
}

export interface FilterDefinition extends ResolvedFilter {
  options: string[]
  /** Share of the corpus matched by the authored values before `is not`. */
  matchShare: number
  /** Per-value counts, for definitions without authored values. */
  counts?: Record<string, number>
}

const optionsOf = (label: string) => searchAttributeValues("Drugs", label)

/** Float-style categories: values combine within a category; categories combine by AND. */
export const filterDefinitions: FilterDefinition[] = [
  {
    id: "target",
    label: "Target",
    values: ["Actin Gamma Enteric Smooth Muscle"],
    options: optionsOf("Target"),
    excluded: false,
    join: "or",
    link: "and",
    matchShare: 0.04122984446680776,
  },
  {
    id: "drug-type",
    label: "Drug type",
    values: ["Generic"],
    options: optionsOf("Drug Type"),
    excluded: false,
    join: "or",
    link: "and",
    matchShare: 0.31,
  },
  {
    id: "descriptor",
    label: "Drug descriptor",
    values: ["Antiinflammatory Therapy"],
    options: optionsOf("Drug Descriptor"),
    excluded: false,
    join: "or",
    link: "and",
    matchShare: 0.114,
  },
  {
    id: "stage",
    label: "Developmental stage",
    values: ["Withdrawn (Marketed)", "Archived (Marketed)"],
    options: optionsOf("Development Stage"),
    excluded: true,
    join: "or",
    link: "and",
    matchShare: 0.005,
  },
  {
    id: "geography",
    label: "Drug geography",
    values: ["Austria", "Italy"],
    options: optionsOf("Drug Geography"),
    excluded: true,
    join: "or",
    link: "and",
    matchShare: 0.14,
  },
]

export function initialResolvedFilters(): ResolvedFilter[] {
  return filterDefinitions.map(({ id, label, values, excluded, join, link }) => ({
    id,
    label,
    values: [...values],
    excluded,
    join,
    link,
  }))
}

/** Where each authored definition sits in the pill path, so a path reuses it. */
const authoredPaths: Partial<Record<FilterId, AuthoredFilterId>> = {
  "Drugs/Target": "target",
  "Drugs/Drug Type": "drug-type",
  "Drugs/Drug Descriptor": "descriptor",
  "Drugs/Development Stage": "stage",
  "Drugs/Drug Geography": "geography",
}

/** One definition for every attribute the pill path reaches without an authored one. */
const pathDefinitions: FilterDefinition[] = searchCategories.flatMap((area) =>
  searchAttributes[area]
    .filter((spec) => !authoredPaths[`${area}/${spec.label}`])
    .map((spec) => ({
      id: `${area}/${spec.label}` as const,
      label: spec.filterLabel,
      values: [],
      options: spec.values.map(([value]) => value),
      excluded: false,
      join: "or" as const,
      link: "and" as const,
      matchShare: 0,
      counts: Object.fromEntries(spec.values),
    })),
)

export function definitionFor(id: FilterId) {
  return [...filterDefinitions, ...pathDefinitions].find(
    (definition) => definition.id === id,
  ) as FilterDefinition
}

/** The single filter a pill path describes: area, then attribute, then value. */
export function pathFilter(area: ProductArea, attribute: string, value: string): ResolvedFilter {
  const pathId: FilterId = `${area}/${attribute}`
  const { id, label } = definitionFor(authoredPaths[pathId] ?? pathId)
  return { id, label, values: [value], excluded: false, join: "or", link: "and" }
}

function valueShare(definition: FilterDefinition, value: string) {
  if (definition.counts) return (definition.counts[value] ?? 0) / baseDrugCount
  return definition.matchShare / definition.values.length
}

export const baseDrugCount = 285_529

/** A deterministic prototype count that responds to every pill edit. */
export function resultCountFor(filters: ResolvedFilter[]) {
  if (filters.length === 0) return baseDrugCount

  const combinedShare = filters.reduce((total, filter, index) => {
    const definition = definitionFor(filter.id)
    const shares = filter.values.map((value) => valueShare(definition, value))
    const combined =
      filter.join === "and" && shares.length > 1
        ? shares.reduce((product, share) => product * share, 1)
        : shares.reduce((sum, share) => sum + share, 0)
    const selectedShare = Math.min(0.98, combined)
    const factor = filter.excluded ? 1 - selectedShare : selectedShare
    if (index === 0) return factor
    return filter.link === "or" ? total + factor - total * factor : total * factor
  }, 0)

  // Never fewer than the sample rows the results grid can show for the same filters.
  return Math.max(matchingRows(filters).length, 1, Math.round(baseDrugCount * combinedShare))
}

/* -------------------------------------------------------------------------- */
/* Results sample                                                              */
/* -------------------------------------------------------------------------- */

export interface DrugRow {
  id: string
  name: string
  generic: string
  company: string
  therapyArea: string
  indication: string
  /** Stage as the grid prints it, e.g. `Phase II`. */
  stage: string
  /** Every stage value the row answers to, including the coarse buckets. */
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
 * Sprint 3 Idea 1's sixteen-row sample, copied so Idea 1 stays self-contained.
 * Seven rows satisfy the worked query, so searching visibly cuts the grid.
 */
export const drugRows: DrugRow[] = [
  {
    id: "rebalzid", name: "Rebalzid", generic: "Nabumetone Sodium", company: "Zydus Lifesciences",
    therapyArea: "Musculoskeletal Disorders", indication: "Osteoarthritis",
    stage: "Phase III", stageValues: ["Pipeline", "Phase III"],
    geographies: ["United States", "Canada"], route: "Oral", molecule: "Small Molecule",
    target: ACTG2, mechanism: COX, atc: M01A, drugType: "Generic", mono: "Mono",
    descriptor: ANTIINFLAMMATORY, vector: "None", application: ANDA, cas: "42924-53-8",
  },
  {
    id: "nvr-2210", name: "NVR-2210", generic: "Tenoxicam Besilate", company: "Sandoz",
    therapyArea: "Musculoskeletal Disorders", indication: "Rheumatoid Arthritis",
    stage: "Phase II", stageValues: ["Pipeline", "Phase II"],
    geographies: ["Germany", "France"], route: "Oral", molecule: "Small Molecule",
    target: ACTG2, mechanism: COX, atc: M01A, drugType: "Generic", mono: "Mono",
    descriptor: ANTIINFLAMMATORY, vector: "None", application: ANDA, cas: "59804-37-4",
  },
  {
    id: "aclovent", name: "Aclovent", generic: "Aceclofenac", company: "Glenmark Pharmaceuticals",
    therapyArea: "Musculoskeletal Disorders", indication: "Ankylosing Spondylitis",
    stage: "Marketed", stageValues: ["Marketed"],
    geographies: ["India", "United Kingdom"], route: "Oral", molecule: "Small Molecule",
    target: ACTG2, mechanism: COX, atc: M01A, drugType: "Generic", mono: "Combination",
    descriptor: ANTIINFLAMMATORY, vector: "None", application: ANDA, cas: "89796-99-6",
  },
  {
    id: "lrx-118", name: "LRX-118", generic: "Lornoxicam Trometamol", company: "Hikma Pharmaceuticals",
    therapyArea: "Musculoskeletal Disorders", indication: "Acute Pain",
    stage: "Phase II", stageValues: ["Pipeline", "Phase II"],
    geographies: ["United States"], route: "Intravenous", molecule: "Small Molecule",
    target: ACTG2, mechanism: COX, atc: M01A, drugType: "Generic", mono: "Mono",
    descriptor: ANTIINFLAMMATORY, vector: "None", application: NDA, cas: "70374-39-9",
  },
  {
    id: "nimesta", name: "Nimesta", generic: "Nimesulide", company: "Alkem Laboratories",
    therapyArea: "Musculoskeletal Disorders", indication: "Osteoarthritis",
    stage: "Phase II", stageValues: ["Pipeline", "Phase II"],
    geographies: ["Brazil", "Mexico"], route: "Oral", molecule: "Small Molecule",
    target: ACTG2, mechanism: COX, atc: N02B, drugType: "Generic", mono: "Mono",
    descriptor: ANTIINFLAMMATORY, vector: "None", application: ANDA, cas: "51803-78-2",
  },
  {
    id: "etodex", name: "Etodex", generic: "Etodolac", company: "Teva Pharmaceutical",
    therapyArea: "Musculoskeletal Disorders", indication: "Rheumatoid Arthritis",
    stage: "Phase III", stageValues: ["Pipeline", "Phase III"],
    geographies: ["United States", "Japan"], route: "Oral", molecule: "Small Molecule",
    target: ACTG2, mechanism: COX, atc: M01A, drugType: "Generic", mono: "Mono",
    descriptor: ANTIINFLAMMATORY, vector: "None", application: ANDA, cas: "41340-25-4",
  },
  {
    id: "tolfamex", name: "Tolfamex", generic: "Tolfenamic Acid", company: "Krka",
    therapyArea: "Musculoskeletal Disorders", indication: "Migraine",
    stage: "Phase III", stageValues: ["Pipeline", "Phase III"],
    geographies: ["Poland", "Sweden"], route: "Oral", molecule: "Small Molecule",
    target: ACTG2, mechanism: COX, atc: M01A, drugType: "Generic", mono: "Mono",
    descriptor: ANTIINFLAMMATORY, vector: "None", application: ANDA, cas: "13710-19-5",
  },
  {
    id: "dermavia", name: "Dermavia", generic: "Calcipotriol", company: "LEO Pharma",
    therapyArea: "Dermatology", indication: "Plaque Psoriasis",
    stage: "Marketed", stageValues: ["Marketed"],
    geographies: ["Denmark", "United States"], route: "Topical", molecule: "Small Molecule",
    target: "Vitamin D Receptor", mechanism: "Vitamin D Receptor Agonist",
    atc: "D05A — Antipsoriatics for Topical Use", drugType: "Branded", mono: "Mono",
    descriptor: "Antipsoriatic Therapy", vector: "None", application: NDA, cas: "112965-21-6",
  },
  {
    id: "kls-77", name: "KLS-77", generic: "Secukinumab Biosimilar", company: "Sandoz",
    therapyArea: "Dermatology", indication: "Plaque Psoriasis",
    stage: "Phase III", stageValues: ["Pipeline", "Phase III"],
    geographies: ["Austria", "Germany"], route: "Subcutaneous", molecule: "Monoclonal Antibody",
    target: "Interleukin 17A", mechanism: "Interleukin 17A Antagonist", atc: L04A,
    drugType: "Biosimilar", mono: "Mono", descriptor: "Immunosuppressant Therapy",
    vector: "None", application: BLA, cas: "1229022-83-6",
  },
  {
    id: "hepvara", name: "Hepvara", generic: "Sofosbuvir", company: "Cipla",
    therapyArea: "Infectious Disease", indication: "Chronic Hepatitis C",
    stage: "Marketed", stageValues: ["Marketed"],
    geographies: ["India", "South Africa"], route: "Oral", molecule: "Small Molecule",
    target: "NS5B Polymerase", mechanism: "Polymerase Inhibitor",
    atc: "J05A — Direct Acting Antivirals", drugType: "Generic", mono: "Combination",
    descriptor: "Antiviral Therapy", vector: "None", application: ANDA, cas: "1190307-88-0",
  },
  {
    id: "brt-9080", name: "BRT-9080", generic: "Bempedoic Acid", company: "Esperion Therapeutics",
    therapyArea: "Cardiovascular", indication: "Hypercholesterolaemia",
    stage: "Phase III", stageValues: ["Pipeline", "Phase III"],
    geographies: ["United States", "Germany"], route: "Oral", molecule: "Small Molecule",
    target: "ATP Citrate Lyase", mechanism: "ATP Citrate Lyase Inhibitor",
    atc: "C10A — Lipid Modifying Agents", drugType: "Branded", mono: "Mono",
    descriptor: "Antihyperlipidaemic Therapy", vector: "None", application: NDA, cas: "738606-46-7",
  },
  {
    id: "cardiflow", name: "Cardiflow", generic: "Ivabradine", company: "Servier",
    therapyArea: "Cardiovascular", indication: "Chronic Heart Failure",
    stage: "Pre-registration", stageValues: ["Pipeline", "Pre-registration"],
    geographies: ["France", "Italy"], route: "Oral", molecule: "Small Molecule",
    target: "HCN Channel", mechanism: "If Current Inhibitor",
    atc: "C01E — Other Cardiac Preparations", drugType: "Generic", mono: "Mono",
    descriptor: "Antianginal Therapy", vector: "None", application: ANDA, cas: "148849-67-6",
  },
  {
    id: "axp-114", name: "AXP-114", generic: "Empagliflozin", company: "Sun Pharmaceutical",
    therapyArea: "Metabolic Disorders", indication: "Type 2 Diabetes",
    stage: "Phase II", stageValues: ["Pipeline", "Phase II"],
    geographies: ["United States", "Japan"], route: "Oral", molecule: "Small Molecule",
    target: "Sodium Glucose Cotransporter 2", mechanism: "SGLT2 Inhibitor",
    atc: "A10B — Blood Glucose Lowering Drugs", drugType: "Generic", mono: "Mono",
    descriptor: "Antidiabetic Therapy", vector: "None", application: ANDA, cas: "864070-44-0",
  },
  {
    id: "immunex-r", name: "Immunex-R", generic: "Tofacitinib", company: "Pfizer",
    therapyArea: "Immunology", indication: "Rheumatoid Arthritis",
    stage: "Withdrawn", stageValues: ["Withdrawn (Marketed)"],
    geographies: ["United States", "Canada"], route: "Oral", molecule: "Small Molecule",
    target: "Janus Kinase 3", mechanism: "Janus Kinase Inhibitor", atc: L04A,
    drugType: "Branded", mono: "Mono", descriptor: "Immunosuppressant Therapy",
    vector: "None", application: NDA, cas: "477600-75-2",
  },
  {
    id: "gastroril", name: "Gastroril", generic: "Esomeprazole Magnesium", company: "Dr. Reddy's Laboratories",
    therapyArea: "Gastrointestinal", indication: "Gastroesophageal Reflux",
    stage: "Archived", stageValues: ["Archived (Marketed)"],
    geographies: ["United States", "Spain"], route: "Oral", molecule: "Small Molecule",
    target: "Hydrogen Potassium ATPase", mechanism: "Proton Pump Inhibitor",
    atc: "A02B — Drugs for Peptic Ulcer and GORD", drugType: "Generic", mono: "Mono",
    descriptor: "Antiulcer Therapy", vector: "None", application: ANDA, cas: "161796-78-7",
  },
  {
    id: "mrd-330", name: "MRD-330", generic: "Onasemnogene Abeparvovec", company: "Novartis",
    therapyArea: "Genetic Disorders", indication: "Spinal Muscular Atrophy",
    stage: "Phase I", stageValues: ["Pipeline", "Phase I"],
    geographies: ["United States", "United Kingdom"], route: "Intravenous",
    molecule: "Gene Therapy", target: "Survival Motor Neuron 1",
    mechanism: "Gene Replacement", atc: "M09A — Other Musculoskeletal Drugs",
    drugType: "Orphan", mono: "Mono", descriptor: "Gene Therapy",
    vector: "Adeno Associated Virus (AAV)", application: BLA, cas: "1922968-73-7",
  },
]

/** Marketing status is read off the stage the row already carries. */
function marketingStatusFor(row: DrugRow) {
  if (row.stageValues.includes("Marketed")) return "Marketed"
  if (row.stageValues.includes("Withdrawn (Marketed)")) return "Withdrawn"
  if (row.stageValues.includes("Archived (Marketed)")) return "Discontinued"
  if (row.stageValues.includes("Pre-registration")) return "Filed"
  return "Not Marketed"
}

/**
 * The row values each filter tests. A filter missing here — Expiry date, and
 * the areas the drug sample does not cover — is drawn but not evaluated.
 */
const filterReaders: Partial<Record<FilterId, (row: DrugRow) => string[]>> = {
  target: (row) => [row.target],
  "drug-type": (row) => [row.drugType],
  descriptor: (row) => [row.descriptor],
  stage: (row) => row.stageValues,
  geography: (row) => row.geographies,
  "Drugs/Drug Name": (row) => [row.name],
  "Drugs/Therapy Area / Indication": (row) => [row.therapyArea, row.indication],
  "Drugs/Route of Administration": (row) => [row.route],
  "Drugs/Molecule Type": (row) => [row.molecule],
  "Drugs/Mechanism of Action": (row) => [row.mechanism],
  "Drugs/ATC Classification": (row) => [row.atc],
  "Drugs/Mono/Combination Drug": (row) => [row.mono],
  "Drugs/Gene Therapy Vector": (row) => [row.vector],
  "Drugs/Application Type": (row) => [row.application],
  "Drugs/CAS Number": (row) => [row.cas],
  "Drugs/Marketing Status": (row) => [marketingStatusFor(row)],
  "Drugs by Manufacturer/Manufacturer": (row) => [row.company],
}

/** The sample rows the filter box keeps, read left to right as the box draws it. */
export function matchingRows(filters: ResolvedFilter[]) {
  const evaluated = filters.filter((filter) => filterReaders[filter.id] && filter.values.length)
  if (evaluated.length === 0) return drugRows

  return drugRows.filter((row) =>
    evaluated.reduce<boolean | null>((kept, filter) => {
      const values = filterReaders[filter.id]!(row)
      const hits = filter.values.map((value) => values.includes(value))
      const matched = filter.join === "and" ? hits.every(Boolean) : hits.some(Boolean)
      const hit = filter.excluded ? !matched : matched
      if (kept === null) return hit
      return filter.link === "or" ? kept || hit : kept && hit
    }, null),
  )
}
