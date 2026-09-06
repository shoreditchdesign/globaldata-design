/**
 * Static content for the Sprint 3 / Idea 1 port. Nothing here is computed —
 * every screen is a fixed state lifted from the Paper file.
 */

export interface DrugRow {
  name: string
  generic: string
  company: string
  therapyArea: string
  indication: string
  stage: string
  geography: string
}

export const drugRows: DrugRow[] = [
  { name: "Advil", generic: "Ibuprofen", company: "Haleon", therapyArea: "Inflammation", indication: "Pain & Inflammation", stage: "Marketed", geography: "United States" },
  { name: "Voltaren", generic: "Diclofenac", company: "Haleon", therapyArea: "Inflammation", indication: "Inflammation", stage: "Marketed", geography: "Germany" },
  { name: "Naprosyn", generic: "Naproxen", company: "Atnahs Pharma", therapyArea: "Inflammation", indication: "Arthritis", stage: "Marketed", geography: "United Kingdom" },
  { name: "Celebrex", generic: "Celecoxib", company: "Pfizer", therapyArea: "Inflammation", indication: "Osteoarthritis", stage: "Marketed", geography: "United States" },
  { name: "Mobic", generic: "Meloxicam", company: "Boehringer Ingelheim", therapyArea: "Inflammation", indication: "Rheumatoid Arthritis", stage: "Marketed", geography: "Germany" },
  { name: "Indocin", generic: "Indomethacin", company: "Iroko Pharmaceuticals", therapyArea: "Inflammation", indication: "Acute Inflammation", stage: "Marketed", geography: "Canada" },
  { name: "Oruvail", generic: "Ketoprofen", company: "Sanofi", therapyArea: "Inflammation", indication: "Rheumatoid Arthritis", stage: "Marketed", geography: "France" },
  { name: "Feldene", generic: "Piroxicam", company: "Pfizer", therapyArea: "Inflammation", indication: "Osteoarthritis", stage: "Marketed", geography: "Spain" },
  { name: "Arcoxia", generic: "Etoricoxib", company: "MSD", therapyArea: "Inflammation", indication: "Osteoarthritis", stage: "Marketed", geography: "United Kingdom" },
  { name: "Deltacortril", generic: "Prednisolone", company: "Pfizer", therapyArea: "Immunology", indication: "Inflammatory Disorders", stage: "Marketed", geography: "Ireland" },
  { name: "Decadron", generic: "Dexamethasone", company: "Aspen Pharmacare", therapyArea: "Immunology", indication: "Severe Inflammation", stage: "Marketed", geography: "United States" },
  { name: "Cortef", generic: "Hydrocortisone", company: "Pfizer", therapyArea: "Immunology", indication: "Inflammatory Disorders", stage: "Marketed", geography: "Canada" },
  { name: "Medrol", generic: "Methylprednisolone", company: "Pfizer", therapyArea: "Gastroenterology", indication: "Rheumatic Disorders", stage: "Marketed", geography: "France" },
  { name: "Decadron", generic: "Dexamethasone", company: "Aspen Pharmacare", therapyArea: "Immunology", indication: "Severe Inflammation", stage: "Marketed", geography: "United States" },
  { name: "Feldene", generic: "Piroxicam", company: "Pfizer", therapyArea: "Inflammation", indication: "Osteoarthritis", stage: "Marketed", geography: "Spain" },
]

/** The unfiltered table behind the modal shows drug codes rather than brands. */
export const unfilteredNames = [
  "NVR-2210", "BRT-9080", "Livaxen", "AXP-114", "BRT-9080", "Livaxen", "Hepvara",
  "CTN-1902", "Hepvara", "Hepvara", "MRD-330", "BRT-9080", "KLS-77", "MRD-330", "NVR-2210",
]

export const unfilteredGeographies = [
  "United States", "United States, Germany", "United States, Canada", "United States",
  "United States, Germany", "United States, Canada", "United States, Japan",
  "United States, United Kingdom", "United States, Japan", "United States, Japan",
  "United States", "United States, Germany", "United States", "United States", "United States",
]

export type Operator = "AND" | "OR" | "NOT"

export interface FilterChip {
  label: string
  /** Result count shown inside the chip, where the source shows one. */
  count?: number
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
}

/** The parsed result of the worked example query, as it appears in the file. */
export const parsedGroups: FilterGroup[] = [
  {
    label: "Developmental stage",
    chips: [{ label: "Withdrawn (Marketed)", next: "AND" }, { label: "Archived (Marketed)" }],
    next: "NOT",
  },
  {
    label: "Drug geography",
    chips: [{ label: "Austria", next: "OR" }, { label: "Italy" }],
    next: "AND",
  },
  { label: "Target", chips: [{ label: "Actin Gamma Enteric Smooth Muscle" }] },
  { label: "Drug type", chips: [{ label: "Generic" }], next: "AND" },
  { label: "Drug descriptor", chips: [{ label: "Antiinflammatory Therapy" }] },
]

/** Two extra groups that push the applied bar past ten filters. */
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

export const drugAttributes = [
  "Drug Name",
  "Therapy Area / Indication",
  "Development Stage",
  "Drug Geography",
  "Route of Administration",
  "Molecule Type",
  "Target",
  "Mechanism of Action",
  "ATC Classification",
  "Drug Type",
  "Mono/Combination Drug",
  "Drug Descriptor",
  "Gene Therapy Vector",
  "Application Type",
  "CAS Number",
]

export const therapyAreas: { label: string; count: number }[] = [
  { label: "Cardiovascular", count: 20 },
  { label: "Central Nervous System", count: 3 },
  { label: "Dermatology", count: 126 },
  { label: "Ear Nose Throat Disorders", count: 32 },
  { label: "Gastrointestinal", count: 25 },
  { label: "Genetic Disorders", count: 17 },
  { label: "Genito Urinary System", count: 54 },
  { label: "Hermatological Disorders", count: 19 },
  { label: "Hormonal Disorders", count: 17 },
  { label: "Immunology", count: 9 },
  { label: "Infectious Disease", count: 102 },
  { label: "Metabolic Disorders", count: 59 },
  { label: "Musculoskeletal Disorders", count: 276 },
]

export const developmentalStages: { label: string; count: number }[] = [
  { label: "Marketed", count: 3 },
  { label: "Pipeline", count: 12 },
]

export const groupByRows: { label: string; count: string }[] = [
  { label: "Discovery", count: "40 drugs" },
  { label: "Preclinical", count: "12 drugs" },
  { label: "Phase 0", count: "3 drugs" },
  { label: "Phase I", count: "9 drugs" },
  { label: "Phase II", count: "27 drugs" },
  { label: "Phase III", count: "11 drugs" },
  { label: "Phase IV", count: "7 drugs" },
  { label: "Pre-registration", count: "14 drugs" },
  { label: "Tentative Approval", count: "5 drugs" },
  { label: "Approved", count: "21 drugs" },
  { label: "Marketed", count: "78 drugs" },
  { label: "Suspended", count: "6 drugs" },
  { label: "Discontinued", count: "12 drugs" },
  { label: "Withdrawn", count: "5 drugs" },
]
