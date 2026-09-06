/**
 * Static content for Sprint 3 / Idea 2 — the full-pane screener.
 *
 * Nothing here is computed. The numbers are authored to hang together for one
 * worked example: Therapy area is Dermatology or Cardiovascular, Drug geography
 * is Europe, Development stage is Phase II or Phase III — 146 drugs out of
 * 285,529. Where a set of selected values sits under one attribute, their counts
 * sum to the live total, so the panel and the results agree with each other.
 *
 * Labels for the areas, attributes and therapy areas are imported read-only
 * from Idea 1 so the two prototypes speak the same vocabulary.
 */

import { drugAttributes, filterAreas, therapyAreas } from "@/flows/sprint-3/idea-1/data"

/** The unfiltered database, and the set the applied query leaves behind. */
export const baseTotal = 285_529
export const liveTotal = 146

/** One row in a Miller column. */
export interface ColumnItem {
  label: string
  /** Drugs this row would yield, in the context of the other applied filters. */
  count: number
  /** True when the row opens a further column rather than only being selectable. */
  drillable?: boolean
}

/** Level 1 — the filter areas. Counts are whole-entity totals, pre-filter. */
const areaCounts: Record<string, number> = {
  Companies: 12_905,
  Drugs: baseTotal,
  "Licensing Opportunities": 4_318,
  "Regulatory Milestones": 61_204,
  "Sales and Forecast": 9_772,
  "Drugs by Manufacturer": 148_610,
  NPV: 3_061,
  "Advanced Company Watchlist": 96,
}

export const areaItems: ColumnItem[] = filterAreas.map((label) => ({
  label,
  count: areaCounts[label] ?? 0,
  drillable: label === "Drugs",
}))

/**
 * Attributes with no value list — free text in the real product. Their column
 * is a search field rather than a list of options.
 */
export const searchAttributes = new Set(["Drug Name", "CAS Number"])

/** Therapy areas keep Idea 1's counts; the two selected ones sum to 146. */
const therapyAreaItems: ColumnItem[] = therapyAreas.map(({ label, count }) => ({
  label,
  count,
  drillable: true,
}))

/**
 * Level 3 — values, by attribute. Counts answer "how many drugs would I have
 * if I picked this", which is why the unselected rows still carry one.
 */
export const valuesByAttribute: Record<string, ColumnItem[]> = {
  "Therapy Area / Indication": therapyAreaItems,
  "Development Stage": [
    { label: "Discovery", count: 41 },
    { label: "Preclinical", count: 55 },
    { label: "Phase 0", count: 6 },
    { label: "Phase I", count: 33 },
    { label: "Phase II", count: 94 },
    { label: "Phase III", count: 52 },
    { label: "Phase IV", count: 12 },
    { label: "Pre-registration", count: 9 },
    { label: "Approved", count: 18 },
    { label: "Marketed", count: 61 },
    { label: "Suspended", count: 4 },
    { label: "Discontinued", count: 22 },
    { label: "Withdrawn", count: 7 },
  ],
  "Drug Geography": [
    { label: "Europe", count: 146, drillable: true },
    { label: "North America", count: 402, drillable: true },
    { label: "Asia-Pacific", count: 388, drillable: true },
    { label: "Latin America", count: 96, drillable: true },
    { label: "Middle East & Africa", count: 41, drillable: true },
    { label: "Global", count: 512 },
  ],
  "Route of Administration": [
    { label: "Oral", count: 68 },
    { label: "Subcutaneous", count: 34 },
    { label: "Topical", count: 29 },
    { label: "Intravenous", count: 21 },
    { label: "Intramuscular", count: 6 },
    { label: "Inhaled", count: 5 },
    { label: "Ophthalmic", count: 4 },
    { label: "Transdermal", count: 3 },
  ],
  "Molecule Type": [
    { label: "Small Molecule", count: 79 },
    { label: "Monoclonal Antibody", count: 31 },
    { label: "Peptide", count: 12 },
    { label: "Recombinant Protein", count: 8 },
    { label: "Oligonucleotide", count: 7 },
    { label: "Cell Therapy", count: 5 },
    { label: "Gene Therapy", count: 4 },
  ],
  Target: [
    { label: "Interleukin 23", count: 14 },
    { label: "Interleukin 17A", count: 11 },
    { label: "Janus Kinase 1", count: 10 },
    { label: "Tumour Necrosis Factor", count: 9 },
    { label: "Phosphodiesterase 4", count: 8 },
    { label: "Endothelin Receptor A", count: 5 },
    { label: "Angiotensin II Receptor", count: 4 },
    { label: "Sodium Glucose Cotransporter 2", count: 3 },
  ],
  "Mechanism of Action": [
    { label: "Interleukin 23 Inhibitor", count: 14 },
    { label: "Janus Kinase Inhibitor", count: 12 },
    { label: "Tumour Necrosis Factor Alpha Inhibitor", count: 9 },
    { label: "Phosphodiesterase 4 Inhibitor", count: 8 },
    { label: "Endothelin Receptor Antagonist", count: 5 },
    { label: "Beta Adrenoceptor Antagonist", count: 4 },
    { label: "SGLT2 Inhibitor", count: 3 },
  ],
  "ATC Classification": [
    { label: "D — Dermatologicals", count: 71 },
    { label: "L — Antineoplastic & Immunomodulating", count: 33 },
    { label: "C — Cardiovascular System", count: 20 },
    { label: "M — Musculoskeletal System", count: 9 },
    { label: "A — Alimentary Tract & Metabolism", count: 6 },
  ],
  "Drug Type": [
    { label: "New Molecular Entity", count: 88 },
    { label: "Generic", count: 24 },
    { label: "Biosimilar", count: 14 },
    { label: "Repurposed", count: 12 },
    { label: "Fixed Dose Combination", count: 8 },
  ],
  "Mono/Combination Drug": [
    { label: "Mono", count: 118 },
    { label: "Combination", count: 28 },
  ],
  "Drug Descriptor": [
    { label: "Antiinflammatory Therapy", count: 52 },
    { label: "Immunosuppressant", count: 31 },
    { label: "Antihypertensive", count: 14 },
    { label: "Lipid Regulator", count: 9 },
    { label: "Antithrombotic", count: 7 },
  ],
  "Gene Therapy Vector": [
    { label: "Adeno Associated Virus (AAV)", count: 5 },
    { label: "Lentivirus", count: 3 },
    { label: "Adenovirus", count: 2 },
    { label: "Lipid Nanoparticle (non-viral)", count: 1 },
  ],
  "Application Type": [
    { label: "IND", count: 47 },
    { label: "NDA", count: 34 },
    { label: "MAA", count: 29 },
    { label: "BLA", count: 21 },
    { label: "ANDA", count: 15 },
  ],
}

/**
 * Level 2 — attributes of Drugs. The number is how many distinct values the
 * attribute still has inside the current set — the same rows the next column
 * will show — so it says how far an attribute can actually split the 146
 * before a click is spent on it. A drug-count here would read 146 against
 * nearly every attribute and discriminate nothing.
 *
 * Free-text attributes have no value list, so they carry no number.
 */
export const attributeItems: ColumnItem[] = drugAttributes.map((label) => ({
  label,
  count: valuesByAttribute[label]?.length ?? 0,
  drillable: true,
}))

/**
 * Level 4 — what sits under a value. Only the values that carry `drillable`
 * have children; the fourth column is what pushes the first one into the
 * breadcrumb, which is the case this direction exists to prove.
 */
export const childrenByValue: Record<string, ColumnItem[]> = {
  Dermatology: [
    { label: "Plaque Psoriasis", count: 38 },
    { label: "Atopic Dermatitis", count: 31 },
    { label: "Acne Vulgaris", count: 17 },
    { label: "Hidradenitis Suppurativa", count: 12 },
    { label: "Vitiligo", count: 9 },
    { label: "Alopecia Areata", count: 8 },
    { label: "Chronic Urticaria", count: 7 },
    { label: "Rosacea", count: 6 },
    { label: "Pemphigus Vulgaris", count: 4 },
    { label: "Cutaneous Lupus Erythematosus", count: 3 },
    { label: "Epidermolysis Bullosa", count: 3 },
  ],
  Cardiovascular: [
    { label: "Chronic Heart Failure", count: 6 },
    { label: "Pulmonary Arterial Hypertension", count: 4 },
    { label: "Resistant Hypertension", count: 3 },
    { label: "Dyslipidaemia", count: 3 },
    { label: "Atrial Fibrillation", count: 2 },
    { label: "Venous Thrombosis", count: 2 },
    { label: "Cardiomyopathy", count: 1 },
  ],
  "Central Nervous System": [
    { label: "Alzheimer's Disease", count: 2 },
    { label: "Parkinson's Disease", count: 1 },
    { label: "Epilepsy", count: 1 },
  ],
  "Ear Nose Throat Disorders": [
    { label: "Chronic Rhinosinusitis", count: 12 },
    { label: "Allergic Rhinitis", count: 9 },
    { label: "Otitis Media", count: 6 },
    { label: "Sensorineural Hearing Loss", count: 4 },
    { label: "Tinnitus", count: 3 },
  ],
  Gastrointestinal: [
    { label: "Ulcerative Colitis", count: 9 },
    { label: "Crohn's Disease", count: 8 },
    { label: "Irritable Bowel Syndrome", count: 4 },
    { label: "Coeliac Disease", count: 3 },
    { label: "Eosinophilic Oesophagitis", count: 2 },
  ],
  "Genetic Disorders": [
    { label: "Cystic Fibrosis", count: 6 },
    { label: "Duchenne Muscular Dystrophy", count: 4 },
    { label: "Sickle Cell Disease", count: 3 },
    { label: "Spinal Muscular Atrophy", count: 2 },
    { label: "Huntington's Disease", count: 2 },
  ],
  "Genito Urinary System": [
    { label: "Overactive Bladder", count: 18 },
    { label: "Chronic Kidney Disease", count: 14 },
    { label: "Benign Prostatic Hyperplasia", count: 9 },
    { label: "Endometriosis", count: 8 },
    { label: "Interstitial Cystitis", count: 5 },
  ],
  "Hermatological Disorders": [
    { label: "Anaemia", count: 7 },
    { label: "Haemophilia A", count: 5 },
    { label: "Immune Thrombocytopenia", count: 4 },
    { label: "Beta Thalassaemia", count: 3 },
  ],
  "Hormonal Disorders": [
    { label: "Hypothyroidism", count: 6 },
    { label: "Cushing's Syndrome", count: 4 },
    { label: "Acromegaly", count: 3 },
    { label: "Hypogonadism", count: 2 },
    { label: "Primary Adrenal Insufficiency", count: 2 },
  ],
  Immunology: [
    { label: "Rheumatoid Arthritis", count: 4 },
    { label: "Systemic Lupus Erythematosus", count: 3 },
    { label: "Sjögren's Syndrome", count: 2 },
  ],
  "Infectious Disease": [
    { label: "Influenza", count: 28 },
    { label: "COVID-19", count: 24 },
    { label: "Hepatitis B", count: 16 },
    { label: "HIV Infection", count: 14 },
    { label: "Tuberculosis", count: 11 },
    { label: "Respiratory Syncytial Virus", count: 9 },
  ],
  "Metabolic Disorders": [
    { label: "Obesity", count: 21 },
    { label: "Type 2 Diabetes", count: 18 },
    { label: "Non-alcoholic Steatohepatitis", count: 9 },
    { label: "Gout", count: 6 },
    { label: "Phenylketonuria", count: 5 },
  ],
  "Musculoskeletal Disorders": [
    { label: "Osteoarthritis", count: 98 },
    { label: "Rheumatoid Arthritis", count: 71 },
    { label: "Osteoporosis", count: 44 },
    { label: "Ankylosing Spondylitis", count: 33 },
    { label: "Psoriatic Arthritis", count: 21 },
    { label: "Fibromyalgia", count: 9 },
  ],
  Europe: [
    { label: "Germany", count: 41 },
    { label: "France", count: 33 },
    { label: "United Kingdom", count: 24 },
    { label: "Spain", count: 18 },
    { label: "Italy", count: 16 },
    { label: "Switzerland", count: 9 },
    { label: "Denmark", count: 7 },
    { label: "Belgium", count: 6 },
    { label: "Netherlands", count: 5 },
    { label: "Finland", count: 5 },
    { label: "Sweden", count: 4 },
    { label: "Austria", count: 3 },
    { label: "Ireland", count: 3 },
  ],
  "North America": [
    { label: "United States", count: 351 },
    { label: "Canada", count: 44 },
    { label: "Mexico", count: 7 },
  ],
  "Asia-Pacific": [
    { label: "Japan", count: 148 },
    { label: "China", count: 121 },
    { label: "South Korea", count: 47 },
    { label: "Australia", count: 39 },
    { label: "India", count: 33 },
  ],
  "Latin America": [
    { label: "Brazil", count: 51 },
    { label: "Argentina", count: 24 },
    { label: "Chile", count: 12 },
    { label: "Colombia", count: 9 },
  ],
  "Middle East & Africa": [
    { label: "Israel", count: 18 },
    { label: "South Africa", count: 12 },
    { label: "United Arab Emirates", count: 7 },
    { label: "Saudi Arabia", count: 4 },
  ],
}

/**
 * The applied query, keyed by attribute. Drives the ticks in the columns, the
 * badges on the attribute rows, and the pills above the results — one source,
 * so the panel can never disagree with the bar.
 */
export const selectedValues: Record<string, string[]> = {
  "Therapy Area / Indication": ["Dermatology", "Cardiovascular"],
  "Drug Geography": ["Europe"],
  "Development Stage": ["Phase II", "Phase III"],
}

/** How the pills read above the results, in application order. */
export interface PillRun {
  /** Plain-language subject, e.g. `Therapy area`. */
  subject: string
  /** The attribute key this run maps back to in the panel. */
  attribute: string
  values: string[]
  /** Word set between values inside the run. */
  join: "or" | "and"
}

export const appliedRuns: PillRun[] = [
  {
    subject: "Therapy area",
    attribute: "Therapy Area / Indication",
    values: ["Dermatology", "Cardiovascular"],
    join: "or",
  },
  {
    subject: "Drug geography",
    attribute: "Drug Geography",
    values: ["Europe"],
    join: "or",
  },
  {
    subject: "Development stage",
    attribute: "Development Stage",
    values: ["Phase II", "Phase III"],
    join: "or",
  },
]

/** The default open path when the screen loads: area → attribute → value. */
export const defaultPath = ["Drugs", "Therapy Area / Indication", "Dermatology"]

export interface ResultRow {
  name: string
  generic: string
  company: string
  therapyArea: string
  indication: string
  stage: "Phase II" | "Phase III"
  geography: string
}

/** Fifteen of the 146. Every row satisfies all three applied filters. */
export const resultRows: ResultRow[] = [
  { name: "Vetraluma", generic: "vetralimab", company: "Novartis", therapyArea: "Dermatology", indication: "Plaque Psoriasis", stage: "Phase III", geography: "Germany" },
  { name: "LEO-4471", generic: "bimeprodine", company: "LEO Pharma", therapyArea: "Dermatology", indication: "Atopic Dermatitis", stage: "Phase II", geography: "Denmark" },
  { name: "Sorilex", generic: "sorilimab", company: "UCB", therapyArea: "Dermatology", indication: "Plaque Psoriasis", stage: "Phase III", geography: "Belgium" },
  { name: "Kardevia", generic: "netarsentan", company: "Bayer", therapyArea: "Cardiovascular", indication: "Pulmonary Arterial Hypertension", stage: "Phase III", geography: "Germany" },
  { name: "ALM-2209", generic: "dupratinib", company: "Almirall", therapyArea: "Dermatology", indication: "Hidradenitis Suppurativa", stage: "Phase II", geography: "Spain" },
  { name: "Dermovance", generic: "lebrikast", company: "Sanofi", therapyArea: "Dermatology", indication: "Atopic Dermatitis", stage: "Phase III", geography: "France" },
  { name: "IPS-3380", generic: "ipsertide", company: "Ipsen", therapyArea: "Cardiovascular", indication: "Chronic Heart Failure", stage: "Phase II", geography: "France" },
  { name: "Psorenta", generic: "risankast", company: "Boehringer Ingelheim", therapyArea: "Dermatology", indication: "Plaque Psoriasis", stage: "Phase III", geography: "Germany" },
  { name: "GRN-1150", generic: "granlicept", company: "Grünenthal", therapyArea: "Dermatology", indication: "Chronic Urticaria", stage: "Phase II", geography: "Germany" },
  { name: "Cardiflex", generic: "omecantiv sodium", company: "Servier", therapyArea: "Cardiovascular", indication: "Chronic Heart Failure", stage: "Phase III", geography: "France" },
  { name: "ORI-7702", generic: "orivastat", company: "Orion", therapyArea: "Cardiovascular", indication: "Dyslipidaemia", stage: "Phase II", geography: "Finland" },
  { name: "Vitalume", generic: "melacantib", company: "Pierre Fabre", therapyArea: "Dermatology", indication: "Vitiligo", stage: "Phase III", geography: "France" },
  { name: "AZ-6640", generic: "alopecitinib", company: "AstraZeneca", therapyArea: "Dermatology", indication: "Alopecia Areata", stage: "Phase II", geography: "United Kingdom" },
  { name: "Rosaclear", generic: "rosacimod", company: "Galderma", therapyArea: "Dermatology", indication: "Rosacea", stage: "Phase III", geography: "Switzerland" },
  { name: "Angioval", generic: "valsenpril", company: "Recordati", therapyArea: "Cardiovascular", indication: "Resistant Hypertension", stage: "Phase III", geography: "Italy" },
]
