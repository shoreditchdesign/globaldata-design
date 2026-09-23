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
  values: readonly string[]
  /**
   * Authored counts, for the attributes the drug sample cannot count: the
   * areas outside Drugs, and Expiry Date, which is drawn but never evaluated.
   * Everything else is counted off the sample itself, in `results.ts`.
   */
  counts?: Readonly<Record<string, number>>
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

const attribute = (
  label: string,
  filterLabel: string,
  values: readonly string[],
): AttributeSpec => ({ label, filterLabel, values })

/** An attribute the sample cannot count, so its values carry authored counts. */
const counted = (label: string, filterLabel: string, values: ValueCounts): AttributeSpec => ({
  label,
  filterLabel,
  values: values.map(([value]) => value),
  counts: Object.fromEntries(values),
})

/* -------------------------------------------------------------------------- */
/* Geography                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Geography is two levels, not one. The incumbent's flat country list made
 * "available in Europe" unaskable, so the regions sit above the countries and
 * every country belongs to one: a drug sold in Austria is thereby sold in
 * Europe, and a search can name either. Region names follow Idea 2b's, so the
 * two directions answer the same words. Mexico sits under Latin America here,
 * which is how the country list reads once Brazil is its only other member.
 */
export const geographyRegions: readonly { region: string; countries: readonly string[] }[] = [
  {
    region: "Europe",
    countries: [
      "Austria", "Italy", "Germany", "France", "Spain", "United Kingdom", "Poland", "Sweden",
      "Denmark",
    ],
  },
  { region: "North America", countries: ["United States", "Canada"] },
  { region: "Asia-Pacific", countries: ["Japan", "India"] },
  { region: "Latin America", countries: ["Brazil", "Mexico"] },
  { region: "Middle East & Africa", countries: ["South Africa"] },
]

export const geographyRegionNames = geographyRegions.map(({ region }) => region)

/** The countries, in the order the incumbent's list has always printed them. */
export const geographyCountries = [
  "Austria", "Italy", "Germany", "France", "Spain", "United Kingdom", "United States", "Canada",
  "Japan", "India", "Brazil", "Mexico", "Poland", "Sweden", "Denmark", "South Africa",
]

const regionByCountry = new Map<string, string>(
  geographyRegions.flatMap(({ region, countries }) =>
    countries.map((country) => [country, region] as const),
  ),
)

/** The region a country sits in, or nothing when the value is already a region. */
export function regionOf(country: string) {
  return regionByCountry.get(country)
}

/** The countries under a region. A country has none: the tree is two deep. */
export function geographyChildren(value: string): readonly string[] {
  return geographyRegions.find(({ region }) => region === value)?.countries ?? []
}

/* -------------------------------------------------------------------------- */
/* The taxonomy                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Every search area's attributes and their values. Drugs carries the taxonomy
 * the sample is built from, so every value listed here is a value some row can
 * hold and every count beside one is the rows that hold it.
 */
const searchAttributes: Record<ProductArea, AttributeSpec[]> = {
  Companies: [
    counted("Company Name", "Company name", [["Pfizer", 1], ["Novartis", 1], ["Sandoz", 1], ["Teva Pharmaceutical", 1]]),
    counted("Headquarters Country", "Headquarters country", [["United States", 4_812], ["Switzerland", 1_204], ["India", 2_930], ["Germany", 1_866]]),
    counted("Company Type", "Company type", [["Pharmaceutical", 6_140], ["Biotechnology", 4_318], ["Generic Manufacturer", 2_209], ["Contract Research", 1_105]]),
  ],
  Drugs: [
    attribute("Drug Name", "Drug name", drugNames),
    attribute("Therapy Area / Indication", "Therapy area / indication", [
      "Cardiovascular", "Central Nervous System", "Dermatology", "Ear Nose Throat Disorders",
      "Gastrointestinal", "Genetic Disorders", "Genito Urinary System",
      "Hermatological Disorders", "Hormonal Disorders", "Immunology", "Infectious Disease",
      "Metabolic Disorders", "Musculoskeletal Disorders",
    ]),
    attribute("Development Stage", "Developmental stage", [
      "Marketed", "Pipeline", "Phase I", "Phase II", "Phase III", "Pre-registration",
      "Withdrawn (Marketed)", "Archived (Marketed)",
    ]),
    attribute("Drug Geography", "Drug geography", [
      ...geographyRegionNames,
      ...geographyCountries,
    ]),
    attribute("Route of Administration", "Route of administration", [
      "Oral", "Intravenous", "Subcutaneous", "Topical", "Inhaled",
    ]),
    attribute("Molecule Type", "Molecule type", [
      "Small Molecule", "Monoclonal Antibody", "Peptide", "Recombinant Protein", "Gene Therapy",
    ]),
    attribute("Target", "Target", [
      "Actin Gamma Enteric Smooth Muscle", "Cyclooxygenase 2", "Cyclooxygenase 1",
      "Interleukin 17A", "Janus Kinase 1", "Janus Kinase 2", "Janus Kinase 3",
      "Vitamin D Receptor", "ATP Citrate Lyase", "HCN Channel",
      "Sodium Glucose Cotransporter 2", "NS5B Polymerase", "Hydrogen Potassium ATPase",
      "Survival Motor Neuron 1", "Glucocorticoid Receptor", "Beta 3 Adrenergic Receptor",
      "Thrombopoietin Receptor", "Thyroid Hormone Receptor",
    ]),
    attribute("Mechanism of Action", "Mechanism of action", [
      "Cyclooxygenase Inhibitor", "Interleukin 17A Antagonist", "Janus Kinase Inhibitor",
      "Proton Pump Inhibitor", "SGLT2 Inhibitor", "Polymerase Inhibitor",
      "Vitamin D Receptor Agonist", "ATP Citrate Lyase Inhibitor", "If Current Inhibitor",
      "Gene Replacement", "Glucocorticoid Receptor Agonist", "Beta 3 Adrenergic Agonist",
      "Thrombopoietin Receptor Agonist", "Thyroid Hormone Receptor Agonist",
    ]),
    attribute("ATC Classification", "ATC classification", [
      "M01A — Antiinflammatory and Antirheumatic, Non-Steroids",
      "N02B — Other Analgesics and Antipyretics",
      "L04A — Immunosuppressants",
      "A02B — Drugs for Peptic Ulcer and GORD",
      "A10B — Blood Glucose Lowering Drugs",
      "C01E — Other Cardiac Preparations",
      "C10A — Lipid Modifying Agents",
      "D05A — Antipsoriatics for Topical Use",
      "J05A — Direct Acting Antivirals",
      "M09A — Other Musculoskeletal Drugs",
      "R01A — Decongestants and Other Nasal Preparations",
      "G04B — Urologicals",
      "B02B — Vitamin K and Other Haemostatics",
      "H03A — Thyroid Preparations",
    ]),
    attribute("Drug Type", "Drug type", ["Generic", "Branded", "Biosimilar", "Orphan"]),
    attribute("Mono/Combination Drug", "Mono/combination drug", ["Mono", "Combination"]),
    attribute("Drug Descriptor", "Drug descriptor", [
      "Antiinflammatory Therapy", "Immunosuppressant Therapy", "Antiviral Therapy",
      "Antidiabetic Therapy", "Antihyperlipidaemic Therapy", "Antipsoriatic Therapy",
      "Antiulcer Therapy", "Antianginal Therapy", "Gene Therapy", "Antispasmodic Therapy",
      "Haemostatic Therapy", "Hormone Replacement Therapy",
    ]),
    attribute("Gene Therapy Vector", "Gene therapy vector", [
      "Adeno Associated Virus (AAV)", "Lentivirus", "Adenovirus", "None",
    ]),
    attribute("Application Type", "Application type", [
      "Abbreviated New Drug Application", "New Drug Application", "Biologics License Application",
    ]),
    attribute("CAS Number", "CAS number", casNumbers),
    counted("Expiry Date", "Expiry date", [
      ["Before 2025", 41_212], ["9 Mar 2025 and 10 Apr 2025", 1_284], ["Rest of 2025", 9_637],
      ["2026", 12_408], ["2027 or later", 88_207],
    ]),
    attribute("Marketing Status", "Marketing status", [
      "Marketed", "Not Marketed", "Filed", "Withdrawn", "Discontinued",
    ]),
  ],
  "Licensing Opportunities": [
    counted("Deal Type", "Deal type", [["Licensing", 3_412], ["Co-development", 1_890], ["Distribution", 1_204], ["Option to License", 655]]),
    counted("Deal Status", "Deal status", [["Available", 2_118], ["Under Negotiation", 946], ["Completed", 3_884], ["Terminated", 412]]),
    counted("Deal Value", "Deal value", [["Under $10M", 1_902], ["$10M–$50M", 2_441], ["$50M–$250M", 1_338], ["Over $250M", 487]]),
  ],
  "Regulatory Milestones": [
    counted("Regulatory Body", "Regulatory body", [["FDA", 12_804], ["EMA", 9_331], ["PMDA", 4_106], ["MHRA", 3_218]]),
    counted("Milestone Type", "Milestone type", [["Filing Accepted", 8_112], ["Approval", 6_940], ["Complete Response Letter", 1_204], ["Withdrawal", 688]]),
    counted("Milestone Year", "Milestone year", [["2023", 5_120], ["2024", 5_866], ["2025", 6_204], ["2026", 2_118]]),
  ],
  "Sales and Forecast": [
    counted("Sales Region", "Sales region", [["North America", 18_440], ["Europe", 15_202], ["Asia Pacific", 12_118], ["Rest of World", 6_330]]),
    counted("Forecast Year", "Forecast year", [["2025", 9_880], ["2026", 9_880], ["2027", 9_880], ["2028", 9_880]]),
    counted("Revenue Band", "Revenue band", [["Under $50M", 14_220], ["$50M–$500M", 9_118], ["$500M–$1Bn", 3_404], ["Over $1Bn", 1_866]]),
  ],
  "Drugs by Manufacturer": [
    // The companies the sample actually names, so a manufacturer in the grid
    // can also be filtered on rather than being reported as outside the sample.
    attribute("Manufacturer", "Manufacturer", [
      "Pfizer", "Novartis", "Sandoz", "Teva Pharmaceutical", "Sun Pharmaceutical", "Cipla",
      "Dr. Reddy's Laboratories", "Zydus Lifesciences", "Glenmark Pharmaceuticals",
      "Hikma Pharmaceuticals", "Alkem Laboratories", "Krka", "LEO Pharma", "Servier", "Lupin",
      "Aurobindo Pharma", "Viatris", "Bayer", "AstraZeneca", "Sanofi", "Esperion Therapeutics",
    ]),
    counted("Manufacturing Site Country", "Manufacturing site country", [["United States", 8_112], ["India", 11_204], ["Ireland", 2_118], ["China", 6_440]]),
    counted("Production Stage", "Production stage", [["API", 9_118], ["Formulation", 12_204], ["Packaging", 7_330], ["Distribution", 5_112]]),
  ],
  NPV: [
    counted("NPV Band", "NPV band", [["Under $25M", 6_204], ["$25M–$55M", 4_118], ["$55M–$250M", 2_890], ["Over $250M", 1_204]]),
    counted("Discount Rate", "Discount rate", [["8%", 3_118], ["10%", 6_440], ["12%", 3_204], ["15%", 1_654]]),
    counted("Peak Sales Year", "Peak sales year", [["2027", 3_440], ["2028", 4_118], ["2029", 3_890], ["2030", 2_968]]),
  ],
  "Advanced Company Watchlist": [
    counted("Watchlist", "Watchlist", [["My Watchlist", 42], ["Oncology Leaders", 118], ["Generics Majors", 64], ["Emerging Biotech", 96]]),
    counted("Alert Type", "Alert type", [["Price Change", 204], ["Pipeline Update", 418], ["Regulatory Event", 266], ["M&A Activity", 88]]),
    counted("Added", "Added", [["Last 7 days", 24], ["Last 30 days", 88], ["Last quarter", 190], ["Last year", 412]]),
  ],
}

/** The second layer: an area's attributes, in the established order. */
export function searchAttributeLabels(area: ProductArea) {
  return searchAttributes[area].map((spec) => spec.label)
}

/**
 * The second layer flattened: the ten attributes a search most often reaches
 * for, drawn from across the search areas rather than from one of them.
 *
 * In the product this would be ranked by what people actually filter on. Here
 * it is authored — plausible for a drug database, which is why eight of the ten
 * are Drugs attributes — and the order is the ranking it stands in for.
 */
export const commonAttributes: readonly { area: ProductArea; attribute: string }[] = [
  { area: "Drugs", attribute: "Therapy Area / Indication" },
  { area: "Drugs", attribute: "Development Stage" },
  { area: "Drugs", attribute: "Drug Geography" },
  { area: "Drugs", attribute: "Drug Type" },
  { area: "Drugs", attribute: "Molecule Type" },
  { area: "Drugs", attribute: "Route of Administration" },
  { area: "Companies", attribute: "Company Name" },
  { area: "Drugs", attribute: "Mechanism of Action" },
  { area: "Regulatory Milestones", attribute: "Regulatory Body" },
  { area: "Drugs", attribute: "Marketing Status" },
]

/** The third layer: the values under one area's attribute. */
export function searchAttributeValues(area: ProductArea, label: string) {
  return [...attributeSpec(area, label).values]
}

/**
 * The authored count beside each value, for the attributes the sample cannot
 * count. `valueCountsFor` in `results.ts` is what a screen asks: it counts the
 * sample wherever it can and falls back to this.
 */
export function searchAttributeValueCounts(area: ProductArea, label: string) {
  const spec = attributeSpec(area, label)
  return spec.values.map((value) => ({ value, count: spec.counts?.[value] ?? 0 }))
}

function attributeSpec(area: ProductArea, label: string) {
  return searchAttributes[area].find((spec) => spec.label === label) as AttributeSpec
}

export const workedQuery =
  "Find generic anti-inflammatory therapies targeting Actin Gamma Enteric Smooth Muscle, but exclude drugs available in Austria or Italy, as well as marketed drugs that are withdrawn or archived."

type AuthoredFilterId =
  | "target"
  | "drug-type"
  | "descriptor"
  | "stage"
  | "geography"
  | "geography-excluded"
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
  },
  {
    id: "drug-type",
    label: "Drug type",
    values: ["Generic"],
    options: optionsOf("Drug Type"),
    excluded: false,
    join: "or",
    link: "and",
  },
  {
    id: "descriptor",
    label: "Drug descriptor",
    values: ["Antiinflammatory Therapy"],
    options: optionsOf("Drug Descriptor"),
    excluded: false,
    join: "or",
    link: "and",
  },
  {
    id: "stage",
    label: "Developmental stage",
    values: ["Withdrawn (Marketed)", "Archived (Marketed)"],
    options: optionsOf("Development Stage"),
    excluded: true,
    join: "or",
    link: "and",
  },
  {
    id: "geography",
    label: "Drug geography",
    values: ["Austria", "Italy"],
    options: optionsOf("Drug Geography"),
    excluded: true,
    join: "or",
    link: "and",
  },
]

/**
 * Geography again, negatively. Now that a region sits above the countries,
 * "in Europe but not Austria" is a real narrowing rather than a redundancy, and
 * the box draws one clause per category — so the exclusion needs a clause of
 * its own. Only the resolver builds it, from words like "excluding Austria"
 * said of a region already chosen, which is why it is not in the list above
 * that Add filter offers.
 */
const excludedGeography: FilterDefinition = {
  id: "geography-excluded",
  label: "Drug geography",
  values: [],
  options: optionsOf("Drug Geography"),
  excluded: true,
  join: "or",
  link: "and",
}

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

/** Where an authored clause sits in the tree, including the negative one. */
const authoredLocations: Record<AuthoredFilterId, { area: ProductArea; attribute: string }> = {
  target: { area: "Drugs", attribute: "Target" },
  "drug-type": { area: "Drugs", attribute: "Drug Type" },
  descriptor: { area: "Drugs", attribute: "Drug Descriptor" },
  stage: { area: "Drugs", attribute: "Development Stage" },
  geography: { area: "Drugs", attribute: "Drug Geography" },
  "geography-excluded": { area: "Drugs", attribute: "Drug Geography" },
}

/** Where a filter sits in the pill path, whether a query or a pill built it. */
export function pathOf(id: FilterId): { area: ProductArea; attribute: string } {
  const authored = authoredLocations[id as AuthoredFilterId]
  if (authored) return authored
  const area = searchCategories.find((item) => id.startsWith(`${item}/`)) as ProductArea
  return { area, attribute: id.slice(area.length + 1) }
}

/** One definition for every attribute the pill path reaches without an authored one. */
const pathDefinitions: FilterDefinition[] = searchCategories.flatMap((area) =>
  searchAttributes[area]
    .filter((spec) => !authoredPaths[`${area}/${spec.label}`])
    .map((spec) => ({
      id: `${area}/${spec.label}` as const,
      label: spec.filterLabel,
      values: [],
      options: [...spec.values],
      excluded: false,
      join: "or" as const,
      link: "and" as const,
    })),
)

export function definitionFor(id: FilterId) {
  return [excludedGeography, ...filterDefinitions, ...pathDefinitions].find(
    (definition) => definition.id === id,
  ) as FilterDefinition
}

/** The clause an area and attribute belong to, whether a query or a pill built it. */
export function filterIdFor(area: ProductArea, attribute: string): FilterId {
  const pathId: FilterId = `${area}/${attribute}`
  return authoredPaths[pathId] ?? pathId
}

/** The single filter a pill path describes: area, then attribute, then value. */
export function pathFilter(area: ProductArea, attribute: string, value: string): ResolvedFilter {
  const { id, label } = definitionFor(filterIdFor(area, attribute))
  return { id, label, values: [value], excluded: false, join: "or", link: "and" }
}

/**
 * The clause a pill starts: the attribute, with no value chosen yet. The value
 * is picked in the filter box, from the clause's own selector, rather than from
 * a further layer of pills.
 */
export function emptyPathFilter(area: ProductArea, attribute: string): ResolvedFilter {
  const { id, label } = definitionFor(filterIdFor(area, attribute))
  return { id, label, values: [], excluded: false, join: "or", link: "and" }
}
