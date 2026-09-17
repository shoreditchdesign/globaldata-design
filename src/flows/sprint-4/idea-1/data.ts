import {
  productAreas,
  type ProductArea,
} from "@/components/prototype/ProductChrome"

/** Stable product context shared by every state in this direction. */
export const activeProductArea: ProductArea = "Drugs"

/** The incumbent's highest-level search areas, kept in the established order. */
export const searchCategories = productAreas

/**
 * Immediate children of each incumbent search area. These labels are copied
 * from the established Sprint 3 hierarchy so Idea 1 remains self-contained.
 */
export const searchCategoryChildren: Record<ProductArea, readonly string[]> = {
  Companies: ["Company Name", "Headquarters Country", "Company Type"],
  Drugs: [
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
    "Expiry Date",
    "Marketing Status",
  ],
  "Licensing Opportunities": ["Deal Type", "Deal Status", "Deal Value"],
  "Regulatory Milestones": ["Regulatory Body", "Milestone Type", "Milestone Year"],
  "Sales and Forecast": ["Sales Region", "Forecast Year", "Revenue Band"],
  "Drugs by Manufacturer": [
    "Manufacturer",
    "Manufacturing Site Country",
    "Production Stage",
  ],
  NPV: ["NPV Band", "Discount Rate", "Peak Sales Year"],
  "Advanced Company Watchlist": ["Watchlist", "Alert Type", "Added"],
}

export const workedQuery =
  "Find generic anti-inflammatory therapies targeting Actin Gamma Enteric Smooth Muscle, but exclude drugs available in Austria or Italy, as well as marketed drugs that are withdrawn or archived."

export type FilterId = "target" | "drug-type" | "descriptor" | "stage" | "geography"
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
}

/** Float-style categories: values combine within a category; categories combine by AND. */
export const filterDefinitions: FilterDefinition[] = [
  {
    id: "target",
    label: "Target",
    values: ["Actin Gamma Enteric Smooth Muscle"],
    options: [
      "Actin Gamma Enteric Smooth Muscle",
      "Cyclooxygenase 2",
      "Cyclooxygenase 1",
      "Interleukin 17A",
    ],
    excluded: false,
    join: "or",
    link: "and",
    matchShare: 0.04122984446680776,
  },
  {
    id: "drug-type",
    label: "Drug type",
    values: ["Generic"],
    options: ["Generic", "Branded", "Biosimilar", "Orphan"],
    excluded: false,
    join: "or",
    link: "and",
    matchShare: 0.31,
  },
  {
    id: "descriptor",
    label: "Drug descriptor",
    values: ["Antiinflammatory Therapy"],
    options: [
      "Antiinflammatory Therapy",
      "Immunosuppressant Therapy",
      "Antiviral Therapy",
      "Antidiabetic Therapy",
    ],
    excluded: false,
    join: "or",
    link: "and",
    matchShare: 0.114,
  },
  {
    id: "stage",
    label: "Developmental stage",
    values: ["Withdrawn (Marketed)", "Archived (Marketed)"],
    options: ["Marketed", "Pipeline", "Withdrawn (Marketed)", "Archived (Marketed)"],
    excluded: true,
    join: "or",
    link: "and",
    matchShare: 0.005,
  },
  {
    id: "geography",
    label: "Drug geography",
    values: ["Austria", "Italy"],
    options: ["Austria", "Italy", "Germany", "France", "United Kingdom", "United States"],
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

export function definitionFor(id: FilterId) {
  return filterDefinitions.find((definition) => definition.id === id) as FilterDefinition
}

export const baseDrugCount = 285_529

/** A deterministic prototype count that responds to every pill edit. */
export function resultCountFor(filters: ResolvedFilter[]) {
  if (filters.length === 0) return baseDrugCount

  const combinedShare = filters.reduce((total, filter, index) => {
    const definition = definitionFor(filter.id)
    const perValueShare = definition.matchShare / definition.values.length
    const valueShare =
      filter.join === "and" && filter.values.length > 1
        ? perValueShare ** filter.values.length
        : perValueShare * filter.values.length
    const selectedShare = Math.min(0.98, valueShare)
    const factor = filter.excluded ? 1 - selectedShare : selectedShare
    if (index === 0) return factor
    return filter.link === "or" ? total + factor - total * factor : total * factor
  }, 0)

  return Math.max(1, Math.round(baseDrugCount * combinedShare))
}
