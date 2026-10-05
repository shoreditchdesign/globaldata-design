/**
 * The sample behind the results grid, and every count drawn from it.
 *
 * The counts used to be an authored estimate — a product of per-value shares —
 * and the rows were generated afterwards to fit whatever number that produced.
 * Two pieces of machinery answering the same question disagree sooner or later,
 * and with four or five filters the estimate collapsed to one. So there is one
 * answer now: a fixed sample of 2,400 drug records, built once at module load
 * from weighted tables and a seeded generator, and every number on screen — the
 * headline count, the count beside a value in a Miller column, the rows in the
 * grid — is that sample counted against the filters as they stand.
 *
 * The sample is shaped, not sampled: the weights are set so that the searches
 * this sprint is tested with land on a set worth reading rather than on three
 * rows or on nine hundred. Sixteen of the records are the authored ones below,
 * kept because they carry recognisable drug names, and they lead every result
 * they match.
 */
import type { ProductArea } from "@/components/prototype/ProductChrome"
import {
  filterIdFor,
  geographyChildren,
  geographyRegionNames,
  regionOf,
  searchAttributeValueCounts,
  type FilterId,
  type ResolvedFilter,
} from "@/flows/sprint-4/idea-1c/data"

/** The most rows the grid draws at once: it pages through the rest. */
export const RESULT_PAGE_SIZE = 100

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
const IMMUNOSUPPRESSANT = "Immunosuppressant Therapy"
const JAK_INHIBITOR = "Janus Kinase Inhibitor"

/**
 * Sprint 3 Idea 1's sixteen authored rows, copied so Idea 1 stays
 * self-contained. They lead every result they satisfy — seven of them lead the
 * worked query — and they sit at the head of the sample the rest is built into.
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
    drugType: "Biosimilar", mono: "Mono", descriptor: IMMUNOSUPPRESSANT,
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
    target: "Janus Kinase 3", mechanism: JAK_INHIBITOR, atc: L04A,
    drugType: "Branded", mono: "Mono", descriptor: IMMUNOSUPPRESSANT,
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
 * Geography answers at both levels: a drug sold in Austria is a drug sold in
 * Europe, so the row satisfies its countries and the regions above them.
 */
function geographyValuesOf(row: DrugRow) {
  const regions: string[] = []
  for (const country of row.geographies) {
    const region = regionOf(country)
    if (region && !regions.includes(region)) regions.push(region)
  }
  return [...row.geographies, ...regions]
}

/**
 * The row values each filter tests. A filter missing here — Expiry date, and
 * the areas the drug sample does not cover — is drawn but not evaluated.
 *
 * Company name is the one attribute outside Drugs that is here, because every
 * row in the sample carries the company that owns it. Its four authored values
 * are four of the sample's own companies, so filtering by one is a real
 * narrowing rather than a lookup into an area the sample does not hold.
 */
const filterReaders: Partial<Record<FilterId, (row: DrugRow) => string[]>> = {
  target: (row) => [row.target],
  "drug-type": (row) => [row.drugType],
  descriptor: (row) => [row.descriptor],
  stage: (row) => row.stageValues,
  geography: geographyValuesOf,
  "geography-excluded": geographyValuesOf,
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
  "Companies/Company Name": (row) => [row.company],
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
/* The sample                                                                  */
/* -------------------------------------------------------------------------- */

/** A label and its share of the draw. Weights are relative, not percentages. */
type Weighted = readonly [label: string, weight: number]

function weightedPick(table: readonly Weighted[], roll: number) {
  const total = table.reduce((sum, [, weight]) => sum + weight, 0)
  let remaining = roll * total
  for (const [label, weight] of table) {
    remaining -= weight
    if (remaining < 0) return label
  }
  return table[table.length - 1][0]
}

/** A small seeded generator, so the sample is the same on every load. */
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

/**
 * A drug family: one target and everything that follows from it. Keeping the
 * biology together is what makes a row read as a drug rather than as a set of
 * independent draws — a JAK programme is an immunology programme, filed under
 * L04A, described as an immunosuppressant, whatever else the row rolls.
 */
interface Family {
  /** Share of the sample. Set to the density these searches want to find. */
  weight: number
  therapyArea: string
  indications: readonly Weighted[]
  target: string
  mechanism: string
  atc: string
  descriptor: string
  molecules: readonly Weighted[]
  /** Where the family's route is not the one its molecule would suggest. */
  routes?: readonly Weighted[]
  /** Generic-name stems: small molecules from the first, biologics the second. */
  stems: readonly string[]
  biologicStems?: readonly string[]
}

const KINASE_BIOLOGICS = ["Jakizumab", "Kinolimab", "Ruxolimab", "Tyrokinept"]

/**
 * The families, and their weights.
 *
 * The three Janus Kinase targets carry about a sixth of the sample between
 * them. That is dense for one protein family, and deliberately so: the sprint's
 * tasks all walk through JAK, and a realistic share left every one of them
 * returning single figures once a stage and a geography were on top of it.
 * Across eighteen targets it is still under a uniform share each.
 */
const families: readonly Family[] = [
  {
    weight: 8,
    therapyArea: "Musculoskeletal Disorders",
    indications: [["Osteoarthritis", 34], ["Rheumatoid Arthritis", 28], ["Ankylosing Spondylitis", 20], ["Acute Pain", 18]],
    target: ACTG2, mechanism: COX, atc: M01A, descriptor: ANTIINFLAMMATORY,
    molecules: [["Small Molecule", 100]],
    stems: ["Nabumetone", "Tenoxicam", "Aceclofenac", "Lornoxicam", "Etodolac", "Tolfenamic Acid", "Nimesulide", "Piroxicam"],
  },
  {
    weight: 6,
    therapyArea: "Musculoskeletal Disorders",
    indications: [["Osteoarthritis", 40], ["Rheumatoid Arthritis", 32], ["Psoriatic Arthritis", 28]],
    target: "Cyclooxygenase 2", mechanism: COX, atc: M01A, descriptor: ANTIINFLAMMATORY,
    molecules: [["Small Molecule", 100]],
    stems: ["Celecoxib", "Etoricoxib", "Parecoxib", "Valdecoxib", "Lumiracoxib", "Polmacoxib"],
  },
  {
    weight: 5,
    therapyArea: "Central Nervous System",
    indications: [["Migraine", 46], ["Neuropathic Pain", 30], ["Acute Pain", 24]],
    target: "Cyclooxygenase 1", mechanism: COX, atc: N02B, descriptor: ANTIINFLAMMATORY,
    molecules: [["Small Molecule", 100]],
    stems: ["Flurbiprofen", "Ketoprofen", "Ibuprofen", "Naproxen", "Indometacin", "Diclofenac"],
  },
  {
    weight: 6,
    therapyArea: "Immunology",
    indications: [["Rheumatoid Arthritis", 38], ["Atopic Dermatitis", 32], ["Ulcerative Colitis", 30]],
    target: "Janus Kinase 1", mechanism: JAK_INHIBITOR, atc: L04A, descriptor: IMMUNOSUPPRESSANT,
    molecules: [["Small Molecule", 62], ["Monoclonal Antibody", 17], ["Peptide", 13], ["Recombinant Protein", 8]],
    stems: ["Upadacitinib", "Abrocitinib", "Filgotinib", "Itacitinib", "Ivarmacitinib"],
    biologicStems: KINASE_BIOLOGICS,
  },
  {
    weight: 5,
    therapyArea: "Immunology",
    indications: [["Myelofibrosis", 40], ["Polycythaemia Vera", 32], ["Alopecia Areata", 28]],
    target: "Janus Kinase 2", mechanism: JAK_INHIBITOR, atc: L04A, descriptor: IMMUNOSUPPRESSANT,
    molecules: [["Small Molecule", 62], ["Monoclonal Antibody", 17], ["Peptide", 13], ["Recombinant Protein", 8]],
    stems: ["Ruxolitinib", "Fedratinib", "Pacritinib", "Momelotinib", "Baricitinib"],
    biologicStems: KINASE_BIOLOGICS,
  },
  {
    weight: 6,
    therapyArea: "Immunology",
    indications: [["Rheumatoid Arthritis", 40], ["Psoriatic Arthritis", 32], ["Plaque Psoriasis", 28]],
    target: "Janus Kinase 3", mechanism: JAK_INHIBITOR, atc: L04A, descriptor: IMMUNOSUPPRESSANT,
    molecules: [["Small Molecule", 62], ["Monoclonal Antibody", 17], ["Peptide", 13], ["Recombinant Protein", 8]],
    stems: ["Tofacitinib", "Peficitinib", "Delgocitinib", "Decernotinib", "Ritlecitinib"],
    biologicStems: KINASE_BIOLOGICS,
  },
  {
    weight: 6,
    therapyArea: "Dermatology",
    indications: [["Plaque Psoriasis", 48], ["Psoriatic Arthritis", 28], ["Hidradenitis Suppurativa", 24]],
    target: "Interleukin 17A", mechanism: "Interleukin 17A Antagonist", atc: L04A,
    descriptor: IMMUNOSUPPRESSANT,
    molecules: [["Monoclonal Antibody", 70], ["Recombinant Protein", 16], ["Peptide", 14]],
    stems: ["Vunakizumab", "Sonelokimab"],
    biologicStems: ["Secukinumab", "Ixekizumab", "Brodalumab", "Bimekizumab", "Netakimab"],
  },
  {
    weight: 5,
    therapyArea: "Dermatology",
    indications: [["Plaque Psoriasis", 56], ["Scalp Psoriasis", 24], ["Ichthyosis", 20]],
    target: "Vitamin D Receptor", mechanism: "Vitamin D Receptor Agonist",
    atc: "D05A — Antipsoriatics for Topical Use", descriptor: "Antipsoriatic Therapy",
    molecules: [["Small Molecule", 100]],
    routes: [["Topical", 78], ["Oral", 22]],
    stems: ["Calcipotriol", "Tacalcitol", "Calcitriol", "Maxacalcitol"],
  },
  {
    weight: 6,
    therapyArea: "Infectious Disease",
    indications: [["Chronic Hepatitis C", 52], ["Chronic Hepatitis B", 26], ["Respiratory Syncytial Virus", 22]],
    target: "NS5B Polymerase", mechanism: "Polymerase Inhibitor",
    atc: "J05A — Direct Acting Antivirals", descriptor: "Antiviral Therapy",
    molecules: [["Small Molecule", 100]],
    stems: ["Sofosbuvir", "Dasabuvir", "Beclabuvir", "Mericitabine"],
  },
  {
    weight: 4,
    therapyArea: "Cardiovascular",
    indications: [["Hypercholesterolaemia", 58], ["Mixed Dyslipidaemia", 42]],
    target: "ATP Citrate Lyase", mechanism: "ATP Citrate Lyase Inhibitor",
    atc: "C10A — Lipid Modifying Agents", descriptor: "Antihyperlipidaemic Therapy",
    molecules: [["Small Molecule", 100]],
    stems: ["Bempedoic Acid", "Hydroxycitrate", "Cucurbitacin"],
  },
  {
    weight: 4,
    therapyArea: "Cardiovascular",
    indications: [["Chronic Heart Failure", 54], ["Stable Angina", 46]],
    target: "HCN Channel", mechanism: "If Current Inhibitor",
    atc: "C01E — Other Cardiac Preparations", descriptor: "Antianginal Therapy",
    molecules: [["Small Molecule", 100]],
    stems: ["Ivabradine", "Zatebradine", "Cilobradine"],
  },
  {
    weight: 6,
    therapyArea: "Metabolic Disorders",
    indications: [["Type 2 Diabetes", 58], ["Chronic Kidney Disease", 24], ["Obesity", 18]],
    target: "Sodium Glucose Cotransporter 2", mechanism: "SGLT2 Inhibitor",
    atc: "A10B — Blood Glucose Lowering Drugs", descriptor: "Antidiabetic Therapy",
    molecules: [["Small Molecule", 100]],
    stems: ["Empagliflozin", "Dapagliflozin", "Canagliflozin", "Ertugliflozin", "Ipragliflozin"],
  },
  {
    weight: 6,
    therapyArea: "Gastrointestinal",
    indications: [["Gastroesophageal Reflux", 52], ["Peptic Ulcer", 28], ["Zollinger-Ellison Syndrome", 20]],
    target: "Hydrogen Potassium ATPase", mechanism: "Proton Pump Inhibitor",
    atc: "A02B — Drugs for Peptic Ulcer and GORD", descriptor: "Antiulcer Therapy",
    molecules: [["Small Molecule", 100]],
    stems: ["Esomeprazole", "Pantoprazole", "Rabeprazole", "Lansoprazole", "Vonoprazan"],
  },
  {
    weight: 3,
    therapyArea: "Genetic Disorders",
    // Three indications, like every other therapy area, so ticking Genetic
    // Disorders gives a spread of rows to read rather than two.
    indications: [
      ["Spinal Muscular Atrophy", 50],
      ["Duchenne Muscular Dystrophy", 30],
      ["Inherited Retinal Dystrophy", 20],
    ],
    target: "Survival Motor Neuron 1", mechanism: "Gene Replacement",
    atc: "M09A — Other Musculoskeletal Drugs", descriptor: "Gene Therapy",
    molecules: [["Gene Therapy", 100]],
    stems: ["Onasemnogene Abeparvovec"],
    biologicStems: ["Onasemnogene Abeparvovec", "Delandistrogene Moxeparvovec", "Risdiplarsen"],
  },
  {
    weight: 5,
    therapyArea: "Ear Nose Throat Disorders",
    indications: [["Allergic Rhinitis", 54], ["Chronic Rhinosinusitis", 26], ["Nasal Polyps", 20]],
    target: "Glucocorticoid Receptor", mechanism: "Glucocorticoid Receptor Agonist",
    atc: "R01A — Decongestants and Other Nasal Preparations", descriptor: ANTIINFLAMMATORY,
    molecules: [["Small Molecule", 100]],
    routes: [["Inhaled", 68], ["Topical", 20], ["Oral", 12]],
    stems: ["Mometasone Furoate", "Fluticasone Propionate", "Budesonide", "Ciclesonide"],
  },
  {
    weight: 3,
    therapyArea: "Genito Urinary System",
    indications: [["Overactive Bladder", 58], ["Neurogenic Bladder", 24], ["Urinary Incontinence", 18]],
    target: "Beta 3 Adrenergic Receptor", mechanism: "Beta 3 Adrenergic Agonist",
    atc: "G04B — Urologicals", descriptor: "Antispasmodic Therapy",
    molecules: [["Small Molecule", 100]],
    stems: ["Mirabegron", "Vibegron", "Solabegron", "Ritobegron"],
  },
  {
    weight: 4,
    therapyArea: "Hermatological Disorders",
    indications: [["Immune Thrombocytopenia", 56], ["Aplastic Anaemia", 26], ["Chemotherapy-Induced Thrombocytopenia", 18]],
    target: "Thrombopoietin Receptor", mechanism: "Thrombopoietin Receptor Agonist",
    atc: "B02B — Vitamin K and Other Haemostatics", descriptor: "Haemostatic Therapy",
    molecules: [["Small Molecule", 60], ["Peptide", 25], ["Recombinant Protein", 15]],
    stems: ["Eltrombopag", "Avatrombopag", "Lusutrombopag", "Hetrombopag"],
    biologicStems: ["Romiplostim", "Megakaryopoietin"],
  },
  {
    weight: 3,
    therapyArea: "Hormonal Disorders",
    indications: [["Hypothyroidism", 58], ["Goitre", 22], ["Thyroid Cancer", 20]],
    target: "Thyroid Hormone Receptor", mechanism: "Thyroid Hormone Receptor Agonist",
    atc: "H03A — Thyroid Preparations", descriptor: "Hormone Replacement Therapy",
    molecules: [["Small Molecule", 100]],
    stems: ["Levothyroxine", "Liothyronine", "Resmetirom", "Sobetirome"],
  },
]

const familyTable: readonly Weighted[] = families.map((family, index) => [
  String(index),
  family.weight,
])

/** Development stages, weighted towards the phases a pipeline search reaches for. */
const stages = [
  { stage: "Phase I", values: ["Pipeline", "Phase I"], weight: 14 },
  { stage: "Phase II", values: ["Pipeline", "Phase II"], weight: 18 },
  { stage: "Phase III", values: ["Pipeline", "Phase III"], weight: 20 },
  { stage: "Pre-registration", values: ["Pipeline", "Pre-registration"], weight: 6 },
  { stage: "Marketed", values: ["Marketed"], weight: 22 },
  { stage: "Withdrawn", values: ["Withdrawn (Marketed)"], weight: 5 },
  { stage: "Archived", values: ["Archived (Marketed)"], weight: 5 },
]

const stageTable: readonly Weighted[] = stages.map((entry) => [entry.stage, entry.weight])

/** Route follows the molecule: nothing takes a gene therapy by mouth. */
const routesByMolecule: Record<string, readonly Weighted[]> = {
  "Small Molecule": [["Oral", 55], ["Intravenous", 22], ["Topical", 13], ["Inhaled", 10]],
  "Monoclonal Antibody": [["Intravenous", 55], ["Subcutaneous", 45]],
  Peptide: [["Subcutaneous", 62], ["Intravenous", 38]],
  "Recombinant Protein": [["Intravenous", 58], ["Subcutaneous", 42]],
  "Gene Therapy": [["Intravenous", 100]],
}

/** Drug type follows it too: nobody files a generic antibody. */
function drugTypesFor(molecule: string): readonly Weighted[] {
  if (molecule === "Gene Therapy") return [["Orphan", 68], ["Branded", 32]]
  if (molecule === "Small Molecule") return [["Branded", 48], ["Generic", 38], ["Orphan", 14]]
  return [["Branded", 54], ["Biosimilar", 30], ["Orphan", 16]]
}

const biologics = new Set(["Monoclonal Antibody", "Recombinant Protein", "Peptide", "Gene Therapy"])

const vectorTable: readonly Weighted[] = [
  ["Adeno Associated Virus (AAV)", 52],
  ["Lentivirus", 29],
  ["Adenovirus", 19],
]

/**
 * How often a drug is on sale in each region, drawn independently so a record
 * can be a single-market generic or a multi-region brand. Europe leads because
 * three of the five tasks are asked of Europe.
 */
const regionPresence: readonly (readonly [region: string, chance: number])[] = [
  ["Europe", 0.62],
  ["North America", 0.4],
  ["Asia-Pacific", 0.26],
  ["Latin America", 0.15],
  ["Middle East & Africa", 0.1],
]

const countriesByRegion: Record<string, readonly Weighted[]> = {
  Europe: [
    ["Germany", 20], ["Austria", 19], ["France", 14], ["Italy", 12], ["United Kingdom", 12],
    ["Spain", 9], ["Poland", 6], ["Sweden", 5], ["Denmark", 3],
  ],
  "North America": [["United States", 78], ["Canada", 22]],
  "Asia-Pacific": [["Japan", 55], ["India", 45]],
  "Latin America": [["Brazil", 62], ["Mexico", 38]],
  "Middle East & Africa": [["South Africa", 100]],
}

function geographiesFor(next: Random) {
  const chosen: string[] = []
  for (const [region, chance] of regionPresence) {
    if (next() >= chance) continue
    const table = countriesByRegion[region]
    // A European licence is usually more than one market; elsewhere it is one,
    // sometimes two.
    const picks = region === "Europe" ? 2 + Math.floor(next() * 2) : next() < 0.35 ? 2 : 1
    for (let pick = 0; pick < picks; pick += 1) {
      const country = weightedPick(table, next())
      if (!chosen.includes(country)) chosen.push(country)
    }
  }
  if (chosen.length === 0) chosen.push(weightedPick(countriesByRegion.Europe, next()))
  return chosen
}

const companies: readonly { name: string; code: string }[] = [
  { name: "Pfizer", code: "PF" },
  { name: "Novartis", code: "NVR" },
  { name: "Sandoz", code: "SDZ" },
  { name: "Teva Pharmaceutical", code: "TEV" },
  { name: "Sun Pharmaceutical", code: "SUN" },
  { name: "Cipla", code: "CPL" },
  { name: "Dr. Reddy's Laboratories", code: "DRL" },
  { name: "Zydus Lifesciences", code: "ZYD" },
  { name: "Glenmark Pharmaceuticals", code: "GLN" },
  { name: "Hikma Pharmaceuticals", code: "HKM" },
  { name: "Alkem Laboratories", code: "ALK" },
  { name: "Krka", code: "KRK" },
  { name: "LEO Pharma", code: "LEO" },
  { name: "Servier", code: "SVR" },
  { name: "Lupin", code: "LPN" },
  { name: "Aurobindo Pharma", code: "ARB" },
  { name: "Viatris", code: "VTR" },
  { name: "Bayer", code: "BAY" },
  { name: "AstraZeneca", code: "AZN" },
  { name: "Sanofi", code: "SAN" },
  { name: "Esperion Therapeutics", code: "ESP" },
]

/** 30 × 8 × 12 coined brand names, more than the sample can use up. */
const namePrefixes = [
  "Ar", "Bel", "Cor", "Dex", "El", "Fen", "Gal", "Hal", "Iv", "Kor", "Lum", "Mar", "Nex", "Or",
  "Pra", "Rel", "Sal", "Tor", "Ven", "Zel", "Cal", "Dyn", "Ery", "Flo", "Gly", "Lav", "Mel",
  "Nov", "Rev", "Syn",
]
const nameInfixes = ["", "a", "e", "i", "o", "ra", "li", "va"]
const nameSuffixes = [
  "ora", "ivex", "amid", "enta", "ira", "olan", "exa", "avio", "ustin", "ido", "yra", "ovan",
]
const NAME_COMBINATIONS = namePrefixes.length * nameInfixes.length * nameSuffixes.length

/** The salt or ester a generic name is filed under, so one stem gives many drugs. */
const salts = [
  "", "", "Sodium", "Hydrochloride", "Maleate", "Besilate", "Mesilate", "Succinate", "Calcium",
  "Potassium", "Tartrate", "Fumarate", "Citrate", "Trometamol",
]

const SAMPLE_ROWS = 2_400

function buildSample(): DrugRow[] {
  const next = random(20_260_923)
  const rows: DrugRow[] = [...authoredRows]

  for (let index = 0; index < SAMPLE_ROWS - authoredRows.length; index += 1) {
    const family = families[Number(weightedPick(familyTable, next()))]
    const molecule = weightedPick(family.molecules, next())
    const route = weightedPick(family.routes ?? routesByMolecule[molecule], next())
    const stageLabel = weightedPick(stageTable, next())
    const stage = stages.find((entry) => entry.stage === stageLabel)!
    const drugType = weightedPick(drugTypesFor(molecule), next())
    const indication = weightedPick(family.indications, next())
    const company = companies[Math.floor(next() * companies.length)]

    const stems =
      molecule === "Small Molecule" ? family.stems : family.biologicStems ?? family.stems
    const salt = salts[Math.floor(next() * salts.length)]
    const stem = stems[Math.floor(next() * stems.length)]

    // Half the sample carries a coined brand name and half a development code,
    // which is what a pipeline database looks like. The coined half walks the
    // combinations on a coprime stride, so no two of them collide.
    const coined = index % 2 === 0
    const combination = ((index / 2) * 1_103) % NAME_COMBINATIONS
    const name = coined
      ? namePrefixes[combination % namePrefixes.length] +
        nameInfixes[Math.floor(combination / namePrefixes.length) % nameInfixes.length] +
        nameSuffixes[Math.floor(combination / (namePrefixes.length * nameInfixes.length))]
      : `${company.code}-${1_000 + index}`

    const digits = (length: number) =>
      Array.from({ length }, () => Math.floor(next() * 10)).join("")

    rows.push({
      id: `sample-${index}`,
      name,
      generic: salt ? `${stem} ${salt}` : stem,
      company: company.name,
      therapyArea: family.therapyArea,
      indication,
      stage: stage.stage,
      stageValues: [...stage.values],
      geographies: geographiesFor(next),
      route,
      molecule,
      target: family.target,
      mechanism: family.mechanism,
      atc: family.atc,
      drugType,
      mono: next() < 0.85 ? "Mono" : "Combination",
      descriptor: family.descriptor,
      vector: molecule === "Gene Therapy" ? weightedPick(vectorTable, next()) : "None",
      application:
        biologics.has(molecule) || drugType === "Biosimilar"
          ? BLA
          : drugType === "Generic"
            ? ANDA
            : NDA,
      cas: `${Math.floor(next() * 9) + 1}${digits(4)}-${digits(2)}-${digits(1)}`,
    })
  }

  return rows
}

/** The sample. Built once, never mutated, never refetched. */
export const sample: DrugRow[] = buildSample()

/* -------------------------------------------------------------------------- */
/* Counting                                                                    */
/* -------------------------------------------------------------------------- */

const valueCountCache = new Map<string, { value: string; count: number }[]>()

/**
 * The count beside a value in a Miller column: the rows of the sample that
 * carry it. Attributes the sample cannot answer — Expiry date, and the areas
 * outside Drugs — keep their authored counts, so a column never prints a zero
 * that only means "not modelled here".
 */
export function valueCountsFor(area: ProductArea, attribute: string) {
  const key = `${area}/${attribute}`
  const cached = valueCountCache.get(key)
  if (cached) return cached

  const authored = searchAttributeValueCounts(area, attribute)
  const reader = filterReaders[filterIdFor(area, attribute)]
  if (!reader) {
    valueCountCache.set(key, authored)
    return authored
  }

  const tally = new Map<string, number>()
  for (const row of sample) {
    for (const value of new Set(reader(row))) tally.set(value, (tally.get(value) ?? 0) + 1)
  }
  const counted = authored.map(({ value }) => ({ value, count: tally.get(value) ?? 0 }))
  valueCountCache.set(key, counted)
  return counted
}

/* -------------------------------------------------------------------------- */
/* The value trees                                                             */
/* -------------------------------------------------------------------------- */

const tallyCache = new Map<string, Map<string, number>>()

/**
 * Every value the sample carries for one attribute, at every level of its
 * tree, and the rows that carry it. An indication is counted here as well as
 * its therapy area, because the clause tests both.
 */
function tallyFor(area: ProductArea, attribute: string) {
  const key = `${area}/${attribute}`
  const cached = tallyCache.get(key)
  if (cached) return cached
  const tally = new Map<string, number>()
  const reader = filterReaders[filterIdFor(area, attribute)]
  if (reader) {
    for (const row of sample) {
      for (const value of new Set(reader(row))) tally.set(value, (tally.get(value) ?? 0) + 1)
    }
  } else {
    for (const { value, count } of searchAttributeValueCounts(area, attribute)) tally.set(value, count)
  }
  tallyCache.set(key, tally)
  return tally
}

/**
 * The count beside any value of an attribute, a child in its tree included:
 * the rows of the sample that ticking it would keep.
 */
export function valueCountOf(area: ProductArea, attribute: string, value: string) {
  return tallyFor(area, attribute).get(value) ?? 0
}

/** The indications the sample files under each therapy area, most common first. */
const indicationsByArea = (() => {
  const byArea = new Map<string, Map<string, number>>()
  for (const row of sample) {
    const counts = byArea.get(row.therapyArea) ?? new Map<string, number>()
    counts.set(row.indication, (counts.get(row.indication) ?? 0) + 1)
    byArea.set(row.therapyArea, counts)
  }
  return new Map(
    [...byArea].map(([therapyArea, counts]) => [
      therapyArea,
      [...counts].sort((a, b) => b[1] - a[1]).map(([indication]) => indication),
    ]),
  )
})()

const THERAPY = "Therapy Area / Indication"
const GEOGRAPHY = "Drug Geography"

/**
 * The two trees in the sample. Therapy area holds its indications, built from
 * the rows themselves, and a region holds its countries. Every other value is
 * a leaf. Deeper levels wait on the client's own trees.
 */
export function childValuesOf(area: ProductArea, attribute: string, value: string): string[] {
  if (area !== "Drugs") return []
  if (attribute === THERAPY) return indicationsByArea.get(value) ?? []
  if (attribute === GEOGRAPHY) return [...geographyChildren(value)]
  return []
}

/**
 * The top level of an attribute's values. Geography lists its regions here and
 * its countries a level down; every flat attribute lists everything.
 */
export function rootValuesOf(area: ProductArea, attribute: string) {
  const all = valueCountsFor(area, attribute)
  if (area === "Drugs" && attribute === GEOGRAPHY) {
    return all.filter(({ value }) => geographyRegionNames.includes(value))
  }
  return all
}

/** The value a child sits under, or nothing for a value at the top. */
export function parentValueOf(area: ProductArea, attribute: string, value: string) {
  if (area !== "Drugs") return undefined
  if (attribute === GEOGRAPHY) return regionOf(value)
  if (attribute === THERAPY) {
    if (indicationsByArea.has(value)) return undefined
    for (const [therapyArea, indications] of indicationsByArea) {
      if (indications.includes(value)) return therapyArea
    }
  }
  return undefined
}

/**
 * One value ticked or unticked in a clause, with the tree taken into account.
 * Ticking a parent selects everything under it: the clause holds the parent
 * (the chip reads "Europe", the rows are every European country's), and its
 * children read as ticked. Unticking one child of a ticked parent swaps the
 * parent for the siblings left; ticking the last missing child folds the set
 * back into the parent.
 */
export function toggleTreeValue(
  area: ProductArea,
  attribute: string,
  values: string[],
  value: string,
): string[] {
  const parent = parentValueOf(area, attribute, value)
  if (values.includes(value)) return values.filter((item) => item !== value)
  if (parent && values.includes(parent)) {
    const siblings = childValuesOf(area, attribute, parent).filter((child) => child !== value)
    return [...values.filter((item) => item !== parent), ...siblings]
  }
  const children = childValuesOf(area, attribute, value)
  const next = [...values.filter((item) => !children.includes(item)), value]
  if (parent) {
    const siblings = childValuesOf(area, attribute, parent)
    if (siblings.every((child) => next.includes(child))) {
      return [...next.filter((item) => !siblings.includes(item)), parent]
    }
  }
  return next
}

/** Whether a value reads as ticked: in the clause, or under a parent that is. */
export function isTicked(area: ProductArea, attribute: string, values: string[], value: string) {
  if (values.includes(value)) return true
  const parent = parentValueOf(area, attribute, value)
  return Boolean(parent && values.includes(parent))
}

/**
 * Where the Miller columns should stand to show a clause: its area and
 * attribute, and the parent of its first value when that value sits a level
 * down, so the value is on screen with its tick.
 */
export function trailFor(area: ProductArea, attribute: string, values: string[]) {
  const parent = values[0] ? parentValueOf(area, attribute, values[0]) : undefined
  return parent ? [area, attribute, parent] : [area, attribute]
}

export interface Results {
  /** Every row the filters match, in sample order. The grid sorts and pages them. */
  rows: DrugRow[]
  /** Every row the filters match — the rows counted, not an estimate of them. */
  count: number
  /** The distinct drugs among those rows, by name. */
  drugCount: number
}

const cache = new Map<string, Results>()

/**
 * The rows and count for one set of filters. The count is the length of the
 * match and the rows are all of it, so the two cannot disagree.
 */
export function resultsFor(filters: ResolvedFilter[]): Results {
  const key = JSON.stringify(filters)
  const cached = cache.get(key)
  if (cached) return cached

  const matched = sample.filter((row) => rowMatches(filters, row))
  const results: Results = {
    rows: matched,
    count: matched.length,
    drugCount: new Set(matched.map((row) => row.name)).size,
  }
  if (cache.size > 200) cache.clear()
  cache.set(key, results)
  return results
}
