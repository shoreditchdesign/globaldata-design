/**
 * The canonical product areas, in the order the live GlobalData platform lists
 * them. Drugs is one of eight peers, not a parent — Licensing Opportunities,
 * NPV and the rest sit alongside it rather than under it.
 *
 * Every Sprint 3 direction renders this exact list in `ProductChrome`. Four
 * directions shown in one session have to read as four proposals for one
 * product, which they stop doing the moment one of them invents its own nav.
 *
 * The same list is the set of areas a filter can be built against, so the
 * filter surfaces in Ideas 1 and 2 read from it too.
 */
export const productAreas = [
  "Companies",
  "Drugs",
  "Licensing Opportunities",
  "Regulatory Milestones",
  "Sales and Forecast",
  "Drugs by Manufacturer",
  "NPV",
  "Advanced Company Watchlist",
] as const

export type ProductArea = (typeof productAreas)[number]
