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

export interface ResolvedFilter {
  label: string
  values: string[]
  excluded?: boolean
}

/** The authored resolution of the walkthrough query, using the incumbent vocabulary. */
export const workedFilters: ResolvedFilter[] = [
  { label: "Target", values: ["Actin Gamma Enteric Smooth Muscle"] },
  { label: "Drug type", values: ["Generic"] },
  { label: "Drug descriptor", values: ["Antiinflammatory Therapy"] },
  {
    label: "Developmental stage",
    values: ["Withdrawn (Marketed)", "Archived (Marketed)"],
    excluded: true,
  },
  { label: "Drug geography", values: ["Austria", "Italy"], excluded: true },
]

/** Authored to match the same worked filter set in the earlier prototypes. */
export const workedResultCount = 245
