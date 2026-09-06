/**
 * Static content for Sprint 3 / Idea 4 — results-first.
 *
 * Nothing here is computed. Counts are authored so the screen reads as one
 * coherent moment: 1,091 drugs are in scope after the Therapy Area and Route
 * filters, the Development Stage filter takes that to 248, and every number in
 * the column menu adds up to 1,091.
 *
 * `src/flows/sprint-3/idea-1/data.ts` is imported read-only for the attribute
 * list behind the column manager, so the two ideas stay on the same domain
 * nouns. The header's area tabs come from the shared chrome.
 */
import { drugAttributes } from "@/flows/sprint-3/idea-1/data"

export { drugAttributes }

/* -------------------------------------------------------------------------- */
/* Columns                                                                     */
/* -------------------------------------------------------------------------- */

export type ColumnKind = "select" | "primary" | "text" | "badge" | "pills"

export interface GridColumn {
  key: string
  label: string
  /** Lane width, used verbatim in the grid template. Single-valued lanes are
   *  capped so every row lines up; the two multi-valued lanes take the slack.
   *  Each lane can also give ground, so the grid compresses down to roughly
   *  820px rather than running off the side of the screen. */
  width: string
  kind: ColumnKind
  /** Frozen to the left of the grid. */
  pinned?: boolean
  /** Number of values filtered on this column, shown as a header badge. */
  filtered?: number
  sorted?: "asc" | "desc"
  /** Right-aligned aggregate summary, shown in the footer strip. */
  aggregate?: string
}

export const columns: GridColumn[] = [
  { key: "select", label: "", width: "48px", kind: "select" },
  { key: "drugName", label: "Drug Name", width: "minmax(140px,184px)", kind: "primary", pinned: true },
  { key: "brand", label: "Brand", width: "minmax(84px,108px)", kind: "text" },
  { key: "company", label: "Company", width: "minmax(112px,148px)", kind: "text" },
  { key: "therapyArea", label: "Therapy Area", width: "minmax(96px,124px)", kind: "pills", filtered: 2 },
  { key: "indication", label: "Indication", width: "minmax(210px,1.6fr)", kind: "pills" },
  { key: "stage", label: "Development Stage", width: "minmax(116px,140px)", kind: "badge", filtered: 2, sorted: "asc" },
  { key: "moleculeType", label: "Molecule Type", width: "minmax(112px,150px)", kind: "text" },
  { key: "route", label: "Route of Administration", width: "minmax(104px,132px)", kind: "pills", filtered: 2 },
  { key: "geography", label: "Drug Geography", width: "minmax(170px,1.3fr)", kind: "pills" },
]

export const gridTemplate = columns.map((c) => c.width).join(" ")

/* -------------------------------------------------------------------------- */
/* Rows                                                                        */
/* -------------------------------------------------------------------------- */

export interface DrugRecord {
  id: string
  name: string
  /** Pipeline assets have no brand yet — rendered as an em dash. */
  brand?: string
  company: string
  therapyAreas: string[]
  indications: string[]
  stage: string
  moleculeType: string
  routes: string[]
  geographies: string[]
}

export const rows: DrugRecord[] = [
  {
    id: "dato-dxd",
    name: "Datopotamab Deruxtecan",
    brand: "Datroway",
    company: "Daiichi Sankyo",
    therapyAreas: ["Oncology"],
    indications: [
      "Non-Small Cell Lung Cancer",
      "Breast Cancer (HR+/HER2−)",
      "Triple-Negative Breast Cancer",
    ],
    stage: "Phase II",
    moleculeType: "Antibody-Drug Conjugate",
    routes: ["Intravenous"],
    geographies: ["United States", "Japan", "United Kingdom", "Germany", "France", "Spain"],
  },
  {
    id: "tarlatamab",
    name: "Tarlatamab",
    brand: "Imdelltra",
    company: "Amgen",
    therapyAreas: ["Oncology"],
    indications: ["Small Cell Lung Cancer", "Neuroendocrine Prostate Cancer"],
    stage: "Phase II",
    moleculeType: "Bispecific Antibody",
    routes: ["Intravenous"],
    geographies: ["United States", "Japan", "United Kingdom"],
  },
  {
    // The wide record. On the live platform this drug alone fills a viewport,
    // because each indication and each geography renders as its own merged row.
    id: "zanidatamab",
    name: "Zanidatamab",
    company: "Jazz Pharmaceuticals",
    therapyAreas: ["Oncology"],
    indications: [
      "Biliary Tract Cancer",
      "Gastro-Oesophageal Adenocarcinoma",
      "Breast Cancer (HER2+)",
      "Gastric Cancer",
      "Colorectal Cancer",
      "Non-Small Cell Lung Cancer",
      "Pancreatic Cancer",
      "Ovarian Cancer",
      "Endometrial Cancer",
    ],
    stage: "Phase III",
    moleculeType: "Bispecific Antibody",
    routes: ["Intravenous", "Subcutaneous"],
    geographies: [
      "United States",
      "Canada",
      "United Kingdom",
      "Germany",
      "France",
      "Italy",
      "Spain",
      "Japan",
      "China",
      "South Korea",
      "Australia",
      "Brazil",
    ],
  },
  {
    id: "obexelimab",
    name: "Obexelimab",
    company: "Zenas BioPharma",
    therapyAreas: ["Immunology"],
    indications: [
      "IgG4-Related Disease",
      "Warm Autoimmune Haemolytic Anaemia",
      "Systemic Lupus Erythematosus",
      "Multiple Sclerosis",
    ],
    stage: "Phase II",
    moleculeType: "Monoclonal Antibody",
    routes: ["Subcutaneous"],
    geographies: ["United States", "Canada", "United Kingdom", "Germany"],
  },
  {
    id: "patritumab",
    name: "Patritumab Deruxtecan",
    company: "Merck & Co",
    therapyAreas: ["Oncology"],
    indications: [
      "Non-Small Cell Lung Cancer (EGFR-Mutated)",
      "Breast Cancer",
      "Colorectal Cancer",
    ],
    stage: "Phase II",
    moleculeType: "Antibody-Drug Conjugate",
    routes: ["Intravenous"],
    geographies: ["United States", "Japan", "Germany", "Spain", "Netherlands"],
  },
  {
    id: "efgartigimod",
    name: "Efgartigimod Alfa",
    brand: "Vyvgart Hytrulo",
    company: "argenx",
    therapyAreas: ["Immunology", "Neurology"],
    indications: [
      "Generalised Myasthenia Gravis",
      "Chronic Inflammatory Demyelinating Polyneuropathy",
      "Idiopathic Inflammatory Myopathy",
      "Bullous Pemphigoid",
      "Sjogren's Disease",
    ],
    stage: "Phase III",
    moleculeType: "Antibody Fragment",
    routes: ["Subcutaneous", "Intravenous"],
    geographies: [
      "United States",
      "Japan",
      "Germany",
      "United Kingdom",
      "France",
      "Canada",
      "China",
    ],
  },
  {
    id: "sac-tmt",
    name: "MK-2870",
    company: "Merck & Co",
    therapyAreas: ["Oncology"],
    indications: [
      "Endometrial Cancer",
      "Non-Small Cell Lung Cancer",
      "Breast Cancer",
      "Gastric Cancer",
    ],
    stage: "Phase III",
    moleculeType: "Antibody-Drug Conjugate",
    routes: ["Intravenous"],
    geographies: ["United States", "China", "Japan", "Germany"],
  },
  {
    id: "ianalumab",
    name: "Ianalumab",
    company: "Novartis",
    therapyAreas: ["Immunology", "Haematological Disorders"],
    indications: [
      "Sjogren's Disease",
      "Systemic Lupus Erythematosus",
      "Immune Thrombocytopenia",
      "Warm Autoimmune Haemolytic Anaemia",
      "Lupus Nephritis",
      "Rheumatoid Arthritis",
    ],
    stage: "Phase III",
    moleculeType: "Monoclonal Antibody",
    routes: ["Subcutaneous", "Intravenous"],
    geographies: [
      "United States",
      "Switzerland",
      "Germany",
      "United Kingdom",
      "France",
      "Italy",
      "Spain",
      "Japan",
      "Canada",
      "Australia",
    ],
  },
  {
    id: "bnt327",
    name: "BNT327",
    company: "BioNTech",
    therapyAreas: ["Oncology"],
    indications: [
      "Small Cell Lung Cancer",
      "Non-Small Cell Lung Cancer",
      "Triple-Negative Breast Cancer",
    ],
    stage: "Phase II",
    moleculeType: "Bispecific Antibody",
    routes: ["Intravenous"],
    geographies: ["United States", "China", "Germany"],
  },
  {
    id: "nipocalimab",
    name: "Nipocalimab",
    company: "Johnson & Johnson",
    therapyAreas: ["Immunology"],
    indications: [
      "Generalised Myasthenia Gravis",
      "Foetal & Neonatal Alloimmune Thrombocytopenia",
      "Sjogren's Disease",
      "Rheumatoid Arthritis",
    ],
    stage: "Phase III",
    moleculeType: "Monoclonal Antibody",
    routes: ["Intravenous"],
    geographies: [
      "United States",
      "United Kingdom",
      "Germany",
      "France",
      "Japan",
      "Netherlands",
    ],
  },
  {
    // The record expanded in the default frame. It sits this far down the set
    // on purpose: the open column menu drops roughly ten rows deep, so a record
    // expanded above this line opens its detail band underneath the popover,
    // and the two things this direction argues for hide each other. Its values
    // are also short enough that the band stays clear of the menu sideways.
    id: "rocatinlimab",
    name: "Rocatinlimab",
    company: "Amgen",
    therapyAreas: ["Immunology"],
    indications: ["Atopic Dermatitis", "Prurigo Nodularis", "Asthma"],
    stage: "Phase III",
    moleculeType: "Monoclonal Antibody",
    routes: ["Subcutaneous"],
    geographies: [
      "United States",
      "Japan",
      "Germany",
      "United Kingdom",
      "France",
      "Italy",
      "Canada",
      "Australia",
    ],
  },
  {
    id: "petosemtamab",
    name: "Petosemtamab",
    company: "Merus",
    therapyAreas: ["Oncology"],
    indications: ["Head & Neck Squamous Cell Carcinoma", "Colorectal Cancer"],
    stage: "Phase III",
    moleculeType: "Bispecific Antibody",
    routes: ["Intravenous"],
    geographies: ["United States", "Netherlands", "Germany", "Spain"],
  },
  {
    id: "telitacicept",
    name: "Telitacicept",
    brand: "Tai'ai",
    company: "RemeGen",
    therapyAreas: ["Immunology"],
    indications: [
      "Systemic Lupus Erythematosus",
      "Generalised Myasthenia Gravis",
      "IgA Nephropathy",
      "Rheumatoid Arthritis",
      "Sjogren's Disease",
    ],
    stage: "Phase III",
    moleculeType: "Fusion Protein",
    routes: ["Subcutaneous"],
    geographies: ["China", "United States", "Germany", "France", "Japan"],
  },
  {
    id: "volrustomig",
    name: "Volrustomig",
    company: "AstraZeneca",
    therapyAreas: ["Oncology"],
    indications: [
      "Non-Small Cell Lung Cancer",
      "Cervical Cancer",
      "Head & Neck Squamous Cell Carcinoma",
      "Mesothelioma",
    ],
    stage: "Phase III",
    moleculeType: "Bispecific Antibody",
    routes: ["Intravenous"],
    geographies: [
      "United States",
      "United Kingdom",
      "Japan",
      "Germany",
      "France",
      "Spain",
      "Italy",
    ],
  },
  {
    // The simple case, for contrast: one indication, one geography, one row.
    id: "anselamimab",
    name: "Anselamimab",
    company: "Bristol Myers Squibb",
    therapyAreas: ["Immunology"],
    indications: ["AL Amyloidosis"],
    stage: "Phase III",
    moleculeType: "Monoclonal Antibody",
    routes: ["Intravenous"],
    geographies: ["United States"],
  },
]

/* -------------------------------------------------------------------------- */
/* Applied filters                                                             */
/* -------------------------------------------------------------------------- */

export interface AppliedFilter {
  columnKey: string
  /** Column name, read as the subject of the sentence. */
  subject: string
  /** Plain-language operator: `is`, `is not`, `is any of`. */
  operator: string
  values: string[]
  /** Word between values — `or` for a union, `and` for an intersection. */
  joiner: "or" | "and"
}

export const appliedFilters: AppliedFilter[] = [
  {
    columnKey: "therapyArea",
    subject: "Therapy Area",
    operator: "is",
    values: ["Oncology", "Immunology"],
    joiner: "or",
  },
  {
    columnKey: "route",
    subject: "Route of Administration",
    operator: "is",
    values: ["Intravenous", "Subcutaneous"],
    joiner: "or",
  },
  {
    columnKey: "stage",
    subject: "Development Stage",
    operator: "is",
    values: ["Phase II", "Phase III"],
    joiner: "or",
  },
]

/* -------------------------------------------------------------------------- */
/* The open column menu                                                        */
/* -------------------------------------------------------------------------- */

export interface ColumnValue {
  label: string
  count: number
  checked?: boolean
}

/**
 * Development Stage values, counted inside the current filter scope but
 * excluding this column's own filter — so the numbers say what would happen if
 * you ticked one more box, rather than what already happened. They total 1,091.
 */
export const stageValues: ColumnValue[] = [
  { label: "Discovery", count: 118 },
  { label: "Preclinical", count: 96 },
  { label: "Phase 0", count: 14 },
  { label: "Phase I", count: 137 },
  { label: "Phase II", count: 148, checked: true },
  { label: "Phase III", count: 100, checked: true },
  { label: "Phase IV", count: 61 },
  { label: "Pre-Registration", count: 44 },
  { label: "Tentative Approval", count: 9 },
  { label: "Approved", count: 52 },
  { label: "Marketed", count: 231 },
  { label: "Suspended", count: 18 },
  { label: "Discontinued", count: 47 },
  { label: "Withdrawn", count: 16 },
]

/* -------------------------------------------------------------------------- */
/* Column manager                                                              */
/* -------------------------------------------------------------------------- */

export interface ManagedColumn {
  label: string
  pinned?: boolean
}

export const shownColumns: ManagedColumn[] = [
  { label: "Drug Name", pinned: true },
  { label: "Brand" },
  { label: "Company" },
  { label: "Therapy Area" },
  { label: "Indication" },
  { label: "Development Stage" },
  { label: "Molecule Type" },
  { label: "Route of Administration" },
  { label: "Drug Geography" },
]

/** The 28 attributes the live product offers but will not let you swap in. */
export const availableColumns: string[] = [
  "Target",
  "Mechanism of Action",
  "ATC Classification",
  "Drug Type",
  "Mono/Combination Drug",
  "Drug Descriptor",
  "Gene Therapy Vector",
  "Application Type",
  "CAS Number",
  "Marketing Status",
  "Originator",
  "Licensee",
  "Expiry Date",
  "NPV",
]

export const availableColumnTotal = 28

/* -------------------------------------------------------------------------- */
/* Counts and aggregates                                                       */
/* -------------------------------------------------------------------------- */

export const totals = {
  /** Rows after every applied filter. */
  matching: "248",
  /** Rows in scope before the Development Stage filter. */
  scope: "1,091",
  /** The whole Drugs database. */
  database: "285,529",
  range: "1–15 of 248",
}

export const aggregates: { label: string; value: string }[] = [
  { label: "Companies", value: "61" },
  { label: "Indications", value: "84" },
  { label: "Geographies", value: "42" },
  { label: "Median stage", value: "Phase II" },
]
