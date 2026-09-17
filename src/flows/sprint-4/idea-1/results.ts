/**
 * The rows behind the results grid.
 *
 * The count is an authored estimate (`estimatedCountFor`), so no fixed sample
 * can back every filter someone builds: a sixteen-row sample left the grid
 * empty under a count of 25. Instead the rows are generated for the filters in
 * hand — deterministic drug records built from coherent profiles, nudged until
 * they satisfy every filter, then checked against the same reading the filter
 * box describes. The grid shows up to 100 of them, and the count never claims
 * rows the grid cannot show.
 */
import {
  definitionFor,
  estimatedCountFor,
  searchAttributeValues,
  type FilterId,
  type ResolvedFilter,
} from "@/flows/sprint-4/idea-1/data"

/** The most rows the grid draws for one set of filters. */
export const RESULT_ROW_LIMIT = 100

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
 * Sprint 3 Idea 1's sixteen authored rows, copied so Idea 1 stays
 * self-contained. They lead every result they satisfy — seven of them lead the
 * worked query — and they seed the profiles the rest are generated from.
 */
const authoredRows: DrugRow[] = [
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

/* -------------------------------------------------------------------------- */
/* Evaluation                                                                  */
/* -------------------------------------------------------------------------- */

function evaluable(filter: ResolvedFilter) {
  return Boolean(filterReaders[filter.id]) && filter.values.length > 0
}

/** Whether one filter holds for one row, after `is not`. */
function filterHolds(filter: ResolvedFilter, row: DrugRow) {
  const values = filterReaders[filter.id]!(row)
  const hits = filter.values.map((value) => values.includes(value))
  const matched = filter.join === "and" ? hits.every(Boolean) : hits.some(Boolean)
  return filter.excluded ? !matched : matched
}

/**
 * The filters read left to right, as the box draws them. A filter the sample
 * cannot evaluate — Expiry date, and areas outside Drugs — is left out rather
 * than treated as matching or failing.
 */
function rowMatches(filters: ResolvedFilter[], row: DrugRow) {
  return filters.filter(evaluable).reduce<boolean | null>((kept, filter) => {
    const hit = filterHolds(filter, row)
    if (kept === null) return hit
    return filter.link === "or" ? kept || hit : kept && hit
  }, null) ?? true
}

/* -------------------------------------------------------------------------- */
/* Generation                                                                  */
/* -------------------------------------------------------------------------- */

/** The fields that have to agree with each other for a record to read as one drug. */
type Profile = Pick<
  DrugRow,
  | "generic"
  | "therapyArea"
  | "indication"
  | "target"
  | "mechanism"
  | "atc"
  | "descriptor"
  | "molecule"
  | "route"
  | "vector"
>

const profileOf = ({
  generic,
  therapyArea,
  indication,
  target,
  mechanism,
  atc,
  descriptor,
  molecule,
  route,
  vector,
}: DrugRow): Profile => ({
  generic,
  therapyArea,
  indication,
  target,
  mechanism,
  atc,
  descriptor,
  molecule,
  route,
  vector,
})

const smallMolecule = { molecule: "Small Molecule", route: "Oral", vector: "None" }

/** Profiles for the therapy areas and targets the authored rows leave uncovered. */
const profiles: Profile[] = [
  ...authoredRows.map(profileOf),
  {
    ...smallMolecule,
    generic: "Celecoxib", therapyArea: "Musculoskeletal Disorders", indication: "Osteoarthritis",
    target: "Cyclooxygenase 2", mechanism: COX, atc: M01A, descriptor: ANTIINFLAMMATORY,
  },
  {
    ...smallMolecule,
    generic: "Flurbiprofen", therapyArea: "Central Nervous System", indication: "Migraine",
    target: "Cyclooxygenase 1", mechanism: COX, atc: N02B, descriptor: ANTIINFLAMMATORY,
  },
  {
    ...smallMolecule,
    generic: "Mometasone Furoate", therapyArea: "Ear Nose Throat Disorders",
    indication: "Allergic Rhinitis", target: "Glucocorticoid Receptor",
    mechanism: "Glucocorticoid Receptor Agonist",
    atc: "R01A — Decongestants and Other Nasal Preparations", descriptor: ANTIINFLAMMATORY,
    route: "Inhaled",
  },
  {
    ...smallMolecule,
    generic: "Mirabegron", therapyArea: "Genito Urinary System", indication: "Overactive Bladder",
    target: "Beta 3 Adrenergic Receptor", mechanism: "Beta 3 Adrenergic Agonist",
    atc: "G04B — Urologicals", descriptor: "Antispasmodic Therapy",
  },
  {
    ...smallMolecule,
    generic: "Eltrombopag", therapyArea: "Hermatological Disorders",
    indication: "Immune Thrombocytopenia", target: "Thrombopoietin Receptor",
    mechanism: "Thrombopoietin Receptor Agonist", atc: "B02B — Vitamin K and Other Haemostatics",
    descriptor: "Haemostatic Therapy",
  },
  {
    ...smallMolecule,
    generic: "Levothyroxine Sodium", therapyArea: "Hormonal Disorders", indication: "Hypothyroidism",
    target: "Thyroid Hormone Receptor", mechanism: "Thyroid Hormone Receptor Agonist",
    atc: "H03A — Thyroid Preparations", descriptor: "Hormone Replacement Therapy",
  },
]

const companies = [
  "Pfizer", "Novartis", "Sandoz", "Teva Pharmaceutical", "Sun Pharmaceutical", "Cipla",
  "Dr. Reddy's Laboratories", "Zydus Lifesciences", "Glenmark Pharmaceuticals",
  "Hikma Pharmaceuticals", "Alkem Laboratories", "Krka", "LEO Pharma", "Servier", "Lupin",
  "Aurobindo Pharma", "Viatris", "Bayer", "AstraZeneca", "Sanofi",
]

const namePrefixes = [
  "Ar", "Bel", "Cor", "Dex", "El", "Fen", "Gal", "Hal", "Iv", "Kor", "Lum", "Mar", "Nex",
  "Or", "Pra", "Rel", "Sal", "Tor", "Ven", "Zel",
]
const nameSuffixes = ["ora", "ivex", "amid", "enta", "ira", "olan", "exa", "avio", "ustin", "ido"]
const codeLetters = "ABCDEFGHKLMNPRSTVXZ"

const stages = [
  { stage: "Phase I", values: ["Pipeline", "Phase I"], weight: 3 },
  { stage: "Phase II", values: ["Pipeline", "Phase II"], weight: 4 },
  { stage: "Phase III", values: ["Pipeline", "Phase III"], weight: 3 },
  { stage: "Pre-registration", values: ["Pipeline", "Pre-registration"], weight: 1 },
  { stage: "Marketed", values: ["Marketed"], weight: 4 },
  { stage: "Withdrawn", values: ["Withdrawn (Marketed)"], weight: 1 },
  { stage: "Archived", values: ["Archived (Marketed)"], weight: 1 },
]

/** A small seeded generator, so the same filters always produce the same rows. */
function random(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296
  }
}

type Random = () => number

const pick = <T,>(next: Random, list: readonly T[]) => list[Math.floor(next() * list.length)]

function shuffled<T>(next: Random, list: readonly T[]) {
  const copy = [...list]
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(next() * (index + 1))
    ;[copy[index], copy[swap]] = [copy[swap], copy[index]]
  }
  return copy
}

function drugName(next: Random) {
  if (next() < 0.35) {
    const letters = Array.from({ length: 3 }, () => pick(next, [...codeLetters])).join("")
    return `${letters}-${Math.floor(next() * 900) + 100}`
  }
  return `${pick(next, namePrefixes)}${pick(next, nameSuffixes)}`
}

function casNumber(next: Random) {
  const digits = (length: number) =>
    Array.from({ length }, () => Math.floor(next() * 10)).join("")
  return `${Math.floor(next() * 9) + 1}${digits(4)}-${digits(2)}-${digits(1)}`
}

function generatedRow(index: number, profile: Profile): DrugRow {
  const next = random(index * 2_654_435_761 + 97)
  const total = stages.reduce((sum, stage) => sum + stage.weight, 0)
  let roll = next() * total
  const stage = stages.find((entry) => (roll -= entry.weight) < 0) ?? stages[0]
  const drugType = pick(next, ["Generic", "Generic", "Branded", "Branded", "Biosimilar", "Orphan"])
  const biologic = profile.molecule !== "Small Molecule"
  const geographyOptions = searchAttributeValues("Drugs", "Drug Geography")

  return {
    ...profile,
    id: `generated-${index}`,
    name: drugName(next),
    company: pick(next, companies),
    stage: stage.stage,
    stageValues: [...stage.values],
    geographies: shuffled(next, geographyOptions).slice(0, 1 + Math.floor(next() * 3)),
    drugType,
    mono: next() < 0.85 ? "Mono" : "Combination",
    application: biologic ? BLA : drugType === "Generic" ? ANDA : NDA,
    cas: casNumber(next),
  }
}

/** Writes one filter value into a row, keeping dependent fields in step. */
const filterWriters: Partial<Record<FilterId, (row: DrugRow, value: string) => DrugRow>> = {
  target: (row, value) => ({ ...row, target: value }),
  "drug-type": (row, value) => ({ ...row, drugType: value }),
  descriptor: (row, value) => ({ ...row, descriptor: value }),
  stage: (row, value) => {
    if (value === "Pipeline") return { ...row, stage: "Phase II", stageValues: ["Pipeline", "Phase II"] }
    const entry = stages.find((item) => item.values.includes(value))
    return entry ? { ...row, stage: entry.stage, stageValues: [...entry.values] } : row
  },
  geography: (row, value) =>
    row.geographies.includes(value) ? row : { ...row, geographies: [...row.geographies, value] },
  "Drugs/Drug Name": (row, value) => ({ ...row, name: value }),
  "Drugs/Therapy Area / Indication": (row, value) => {
    const profile = profiles.find((item) => item.therapyArea === value)
    return profile ? { ...row, ...profile } : { ...row, therapyArea: value }
  },
  "Drugs/Route of Administration": (row, value) => ({ ...row, route: value }),
  "Drugs/Molecule Type": (row, value) => ({ ...row, molecule: value }),
  "Drugs/Mechanism of Action": (row, value) => ({ ...row, mechanism: value }),
  "Drugs/ATC Classification": (row, value) => ({ ...row, atc: value }),
  "Drugs/Mono/Combination Drug": (row, value) => ({ ...row, mono: value }),
  "Drugs/Gene Therapy Vector": (row, value) => ({ ...row, vector: value }),
  "Drugs/Application Type": (row, value) => ({ ...row, application: value }),
  "Drugs/CAS Number": (row, value) => ({ ...row, cas: value }),
  "Drugs/Marketing Status": (row, value) => {
    const stageFor: Record<string, string> = {
      Marketed: "Marketed",
      Withdrawn: "Withdrawn (Marketed)",
      Discontinued: "Archived (Marketed)",
      Filed: "Pre-registration",
      "Not Marketed": "Phase II",
    }
    return filterWriters.stage!(row, stageFor[value] ?? value)
  },
  "Drugs by Manufacturer/Manufacturer": (row, value) => ({ ...row, company: value }),
}

/** Removes excluded values from a multi-valued field, or swaps a single one out. */
function withoutValues(filter: ResolvedFilter, row: DrugRow, next: Random) {
  if (filter.id === "geography") {
    const kept = row.geographies.filter((value) => !filter.values.includes(value))
    const spare = definitionFor("geography").options.filter((value) => !filter.values.includes(value))
    return { ...row, geographies: kept.length > 0 ? kept : [pick(next, spare)] }
  }
  const write = filterWriters[filter.id]!
  for (const value of shuffled(next, definitionFor(filter.id).options)) {
    if (filter.values.includes(value)) continue
    const candidate = write(row, value)
    if (filterHolds(filter, candidate)) return candidate
  }
  return row
}

/** Nudges a row until each filter it fails holds, where a single write can do it. */
function conform(filters: ResolvedFilter[], row: DrugRow, next: Random) {
  let current = row
  for (const filter of filters.filter(evaluable)) {
    if (filterHolds(filter, current) || !filterWriters[filter.id]) continue
    if (filter.excluded) {
      current = withoutValues(filter, current, next)
    } else if (filter.join === "and") {
      current = filter.values.reduce((written, value) => filterWriters[filter.id]!(written, value), current)
    } else {
      current = filterWriters[filter.id]!(current, pick(next, filter.values))
    }
  }
  return current
}

/** Filters answered by a profile's fixed fields rather than the per-row ones. */
const profileFilterIds = new Set<FilterId>([
  "target",
  "descriptor",
  "Drugs/Therapy Area / Indication",
  "Drugs/Route of Administration",
  "Drugs/Molecule Type",
  "Drugs/Mechanism of Action",
  "Drugs/ATC Classification",
  "Drugs/Gene Therapy Vector",
])

export interface Results {
  rows: DrugRow[]
  /** The drugs the filters match: zero whenever no row can satisfy them. */
  count: number
}

const cache = new Map<string, Results>()

/**
 * The rows and count for one set of filters: authored rows that already
 * satisfy them first, then generated ones, each verified against the filters.
 */
export function resultsFor(filters: ResolvedFilter[]): Results {
  const key = JSON.stringify(filters)
  const cached = cache.get(key)
  if (cached) return cached

  const estimate = estimatedCountFor(filters)
  // An estimate that rounds to nothing still gets one attempt; a contradiction
  // then finds no row and reports zero.
  const limit = Math.min(RESULT_ROW_LIMIT, Math.max(1, estimate))
  const rows = authoredRows.filter((row) => rowMatches(filters, row)).slice(0, limit)

  // Profiles whose own fields already satisfy the filters that test them make
  // the most believable rows; the rest are only drawn on when none do.
  const profileFilters = filters.filter((filter) => evaluable(filter) && profileFilterIds.has(filter.id))
  const fitting = profiles.filter((profile) =>
    profileFilters.every((filter) => filterHolds(filter, generatedRow(0, profile))),
  )
  const pool = fitting.length > 0 ? fitting : profiles

  const names = new Set(rows.map((row) => row.name))
  for (let index = 0; rows.length < limit && index < limit * 20; index += 1) {
    const next = random(index + 7)
    let row = conform(filters, generatedRow(index, pick(next, pool)), next)
    if (!rowMatches(filters, row)) continue
    // Two drugs of the same name read as a duplicate row. Re-roll the name,
    // unless a Drug Name filter is what set it.
    for (let attempt = 0; names.has(row.name) && attempt < 8; attempt += 1) {
      const renamed = { ...row, name: drugName(random(index * 131 + attempt + 11)) }
      if (rowMatches(filters, renamed)) row = renamed
    }
    names.add(row.name)
    rows.push(row)
  }

  const results = {
    rows,
    // A count below the row limit is exactly the rows found, so it never
    // promises a drug the grid does not list.
    count: rows.length < limit ? rows.length : Math.max(estimate, rows.length),
  }
  if (cache.size > 200) cache.clear()
  cache.set(key, results)
  return results
}
