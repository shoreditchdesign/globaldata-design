import {
  productAreas,
  type ProductArea,
} from "@/components/prototype/ProductChrome"

/** Stable product context shared by every state in this direction. */
export const activeProductArea: ProductArea = "Drugs"

/** The incumbent's highest-level search areas, kept in the established order. */
export const searchCategories = productAreas
