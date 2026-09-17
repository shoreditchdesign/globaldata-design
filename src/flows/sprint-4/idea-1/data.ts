import {
  productAreas,
  type ProductArea,
} from "@/components/prototype/ProductChrome"

/** Stable product context shared by every state in this direction. */
export const activeProductArea: ProductArea = "Drugs"

/** The incumbent's highest-level search areas, kept in the established order. */
export const searchCategories = productAreas

export const workedQuery =
  "Find generic anti-inflammatory therapies targeting Actin Gamma Enteric Smooth Muscle, but exclude drugs available in Austria or Italy, as well as marketed drugs that are withdrawn or archived."

export type FilterId = "target" | "drug-type" | "descriptor" | "stage" | "geography"
export type FilterJoin = "or" | "and"

export interface ResolvedFilter {
  id: FilterId
  label: string
  values: string[]
  excluded: boolean
  join: FilterJoin
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
    matchShare: 0.04122984446680776,
  },
  {
    id: "drug-type",
    label: "Drug type",
    values: ["Generic"],
    options: ["Generic", "Branded", "Biosimilar", "Orphan"],
    excluded: false,
    join: "or",
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
    matchShare: 0.114,
  },
  {
    id: "stage",
    label: "Developmental stage",
    values: ["Withdrawn (Marketed)", "Archived (Marketed)"],
    options: ["Marketed", "Pipeline", "Withdrawn (Marketed)", "Archived (Marketed)"],
    excluded: true,
    join: "or",
    matchShare: 0.005,
  },
  {
    id: "geography",
    label: "Drug geography",
    values: ["Austria", "Italy"],
    options: ["Austria", "Italy", "Germany", "France", "United Kingdom", "United States"],
    excluded: true,
    join: "or",
    matchShare: 0.14,
  },
]

export function initialResolvedFilters(): ResolvedFilter[] {
  return filterDefinitions.map(({ id, label, values, excluded, join }) => ({
    id,
    label,
    values: [...values],
    excluded,
    join,
  }))
}

export function definitionFor(id: FilterId) {
  return filterDefinitions.find((definition) => definition.id === id) as FilterDefinition
}

export const baseDrugCount = 285_529

/** A deterministic prototype count that responds to every pill edit. */
export function resultCountFor(filters: ResolvedFilter[]) {
  if (filters.length === 0) return baseDrugCount

  const count = filters.reduce((total, filter) => {
    const definition = definitionFor(filter.id)
    const perValueShare = definition.matchShare / definition.values.length
    const combinedShare =
      filter.join === "and" && filter.values.length > 1
        ? perValueShare ** filter.values.length
        : perValueShare * filter.values.length
    const selectedShare = Math.min(0.98, combinedShare)
    const factor = filter.excluded ? 1 - selectedShare : selectedShare
    return total * factor
  }, baseDrugCount)

  return Math.max(1, Math.round(count))
}
