/**
 * The results grid's column model and the one function that changes it,
 * adapted from Sprint 3 Idea 4's grid. Filtering is not here: the filter box
 * above the grid owns it, so the grid only sorts, arranges and selects.
 */
import type { ProductArea } from "@/components/prototype/ProductChrome"
import type { DrugRow } from "@/flows/sprint-4/idea-1c/results"

export type ColumnKind = "select" | "primary" | "text" | "badge" | "tags"

export interface ColumnDef {
  key: string
  label: string
  /**
   * The narrowest this lane may get: wide enough for its 10px uppercase header,
   * the sort arrow (shown at rest), a filter count and the menu button on one
   * line, measured from the real labels. Past the sum of these the
   * grid scrolls sideways rather than wrapping.
   */
  minPx: number
  /** Share of spare width. `0` holds the lane at its width. */
  grow: number
  kind: ColumnKind
  values: (row: DrugRow) => string[]
  sortValue: (row: DrugRow) => string | number
  /** Secondary lanes sit back a step so the primary ones read first. */
  muted?: boolean
}

/** Pipeline order for stage sorting, rather than the alphabet. */
const stageOrder = [
  "Phase I",
  "Phase II",
  "Phase III",
  "Pre-registration",
  "Marketed",
  "Withdrawn",
  "Archived",
]

const text = (
  key: string,
  label: string,
  minPx: number,
  read: (row: DrugRow) => string,
  options: Partial<ColumnDef> = {},
): ColumnDef => ({
  key,
  label,
  minPx,
  grow: 1,
  kind: "text",
  values: (row) => [read(row)],
  sortValue: read,
  ...options,
})

export const columnDefs: ColumnDef[] = [
  {
    key: "select",
    label: "",
    minPx: 44,
    grow: 0,
    kind: "select",
    values: () => [],
    sortValue: () => "",
  },
  text("name", "Drug Name", 160, (row) => row.name, { kind: "primary", grow: 0.6 }),
  text("generic", "Generic Name", 190, (row) => row.generic),
  text("company", "Company", 200, (row) => row.company),
  text("therapyArea", "Therapy Area", 210, (row) => row.therapyArea),
  text("indication", "Indication", 200, (row) => row.indication),
  {
    key: "stage",
    label: "Development Stage",
    minPx: 210,
    grow: 0,
    kind: "badge",
    values: (row) => [row.stage],
    sortValue: (row) => stageOrder.indexOf(row.stage),
  },
  {
    key: "geography",
    label: "Drug Geography",
    minPx: 220,
    grow: 1,
    kind: "tags",
    values: (row) => row.geographies,
    sortValue: (row) => row.geographies[0] ?? "",
    muted: true,
  },
  text("route", "Route of Administration", 245, (row) => row.route, { grow: 0, muted: true }),
  text("molecule", "Molecule Type", 180, (row) => row.molecule, { muted: true }),
  text("target", "Target", 240, (row) => row.target),
  text("drugType", "Drug Type", 155, (row) => row.drugType, { grow: 0 }),
  /* --- available, not in the grid by default --------------------------- */
  text("mechanism", "Mechanism of Action", 230, (row) => row.mechanism, { muted: true }),
  text("descriptor", "Drug Descriptor", 210, (row) => row.descriptor),
  text("atc", "ATC Classification", 300, (row) => row.atc, { muted: true }),
  text("mono", "Mono/Combination Drug", 245, (row) => row.mono, { grow: 0 }),
  text("vector", "Gene Therapy Vector", 230, (row) => row.vector, { muted: true }),
  text("application", "Application Type", 250, (row) => row.application, { muted: true }),
  text("cas", "CAS Number", 165, (row) => row.cas, { grow: 0, muted: true }),
]

/**
 * The attribute a column filters by, where the taxonomy has one.
 *
 * The grid still does no filtering: a column's menu opens the same value list
 * the filter box opens, and that writes to the filters as it always did. This
 * is only the join between the two — a column lane and a branch of the tree
 * that happen to be the same thing to a reader.
 *
 * Generic Name and Indication are not here. The taxonomy files indications
 * under Therapy Area / Indication and has no generic-name branch at all, so
 * those two columns would have to borrow a filter that is not theirs, and the
 * menu offers them none rather than filtering a column by its neighbour.
 */
export const columnFilterPath: Record<string, { area: ProductArea; attribute: string }> = {
  name: { area: "Drugs", attribute: "Drug Name" },
  company: { area: "Companies", attribute: "Company Name" },
  therapyArea: { area: "Drugs", attribute: "Therapy Area / Indication" },
  stage: { area: "Drugs", attribute: "Development Stage" },
  geography: { area: "Drugs", attribute: "Drug Geography" },
  route: { area: "Drugs", attribute: "Route of Administration" },
  molecule: { area: "Drugs", attribute: "Molecule Type" },
  target: { area: "Drugs", attribute: "Target" },
  drugType: { area: "Drugs", attribute: "Drug Type" },
  mechanism: { area: "Drugs", attribute: "Mechanism of Action" },
  descriptor: { area: "Drugs", attribute: "Drug Descriptor" },
  atc: { area: "Drugs", attribute: "ATC Classification" },
  mono: { area: "Drugs", attribute: "Mono/Combination Drug" },
  vector: { area: "Drugs", attribute: "Gene Therapy Vector" },
  application: { area: "Drugs", attribute: "Application Type" },
  cas: { area: "Drugs", attribute: "CAS Number" },
}

export const columnByKey: Record<string, ColumnDef> = Object.fromEntries(
  columnDefs.map((column) => [column.key, column]),
)

export const defaultColumnOrder = [
  "select",
  "name",
  "generic",
  "company",
  "therapyArea",
  "indication",
  "stage",
  "geography",
  "route",
  "molecule",
  "target",
  "drugType",
]

export interface SortState {
  columnKey: string
  direction: "asc" | "desc"
}

export interface GridState {
  /** Visible columns, in order. Always starts `select`. */
  order: string[]
  /** Pinned columns, drawn first regardless of `order`. */
  pinned: string[]
  sort: SortState | null
  /** Widths set by dragging a header edge, in px. */
  widths: Record<string, number>
  selected: string[]
}

export const initialGridState: GridState = {
  order: defaultColumnOrder,
  pinned: ["name"],
  sort: null,
  widths: {},
  selected: [],
}

export type GridAction =
  | { kind: "setSort"; sort: SortState | null }
  | { kind: "cycleSort"; columnKey: string }
  | { kind: "togglePin"; columnKey: string }
  | { kind: "addColumn"; columnKey: string }
  | { kind: "removeColumn"; columnKey: string }
  | { kind: "moveColumn"; columnKey: string; by: -1 | 1 }
  /** A shown column dragged from one place in the order to another. */
  | { kind: "reorderColumn"; columnKey: string; overKey: string }
  | { kind: "resize"; columnKey: string; width: number }
  | { kind: "autosize"; columnKey: string }
  | { kind: "resetColumns" }
  | { kind: "toggleRow"; id: string }
  | { kind: "setSelection"; ids: string[] }

export function applyAction(state: GridState, action: GridAction): GridState {
  switch (action.kind) {
    case "setSort":
      return { ...state, sort: action.sort }
    case "cycleSort": {
      // Header clicks cycle as AG Grid's do: ascending, descending, unsorted.
      const current = state.sort?.columnKey === action.columnKey ? state.sort.direction : null
      const sort: SortState | null =
        current === null
          ? { columnKey: action.columnKey, direction: "asc" }
          : current === "asc"
            ? { columnKey: action.columnKey, direction: "desc" }
            : null
      return { ...state, sort }
    }
    case "togglePin": {
      const pinned = state.pinned.includes(action.columnKey)
        ? state.pinned.filter((key) => key !== action.columnKey)
        : [...state.pinned, action.columnKey]
      return { ...state, pinned }
    }
    case "addColumn":
      if (state.order.includes(action.columnKey) || !columnByKey[action.columnKey]) return state
      return { ...state, order: [...state.order, action.columnKey] }
    case "removeColumn":
      if (action.columnKey === "select" || action.columnKey === "name") return state
      return {
        ...state,
        order: state.order.filter((key) => key !== action.columnKey),
        pinned: state.pinned.filter((key) => key !== action.columnKey),
        sort: state.sort?.columnKey === action.columnKey ? null : state.sort,
      }
    case "moveColumn": {
      const index = state.order.indexOf(action.columnKey)
      const target = index + action.by
      // `select` is fixed at 0, so nothing may move above index 1.
      if (index < 1 || target < 1 || target >= state.order.length) return state
      const order = [...state.order]
      ;[order[index], order[target]] = [order[target], order[index]]
      return { ...state, order }
    }
    case "reorderColumn": {
      const from = state.order.indexOf(action.columnKey)
      const to = state.order.indexOf(action.overKey)
      // `select` is fixed at 0, so nothing may land above index 1.
      if (from < 1 || to < 1 || from === to) return state
      const order = [...state.order]
      order.splice(from, 1)
      order.splice(to, 0, action.columnKey)
      return { ...state, order }
    }
    case "resize":
      return {
        ...state,
        widths: {
          ...state.widths,
          [action.columnKey]: Math.max(columnByKey[action.columnKey].minPx, Math.round(action.width)),
        },
      }
    case "autosize": {
      const widths = { ...state.widths }
      delete widths[action.columnKey]
      return { ...state, widths }
    }
    case "resetColumns":
      return {
        ...state,
        order: defaultColumnOrder,
        pinned: ["name"],
        widths: {},
        sort: state.sort && defaultColumnOrder.includes(state.sort.columnKey) ? state.sort : null,
      }
    case "toggleRow":
      return {
        ...state,
        selected: state.selected.includes(action.id)
          ? state.selected.filter((id) => id !== action.id)
          : [...state.selected, action.id],
      }
    case "setSelection":
      return { ...state, selected: action.ids }
  }
}

/** Draw order: the select lane, then anything pinned, then the rest in order. */
export function visibleColumnKeys(state: GridState) {
  const pinned = state.order.filter((key) => key !== "select" && state.pinned.includes(key))
  const rest = state.order.filter((key) => key !== "select" && !state.pinned.includes(key))
  return ["select", ...pinned, ...rest]
}

export function hiddenColumnKeys(state: GridState) {
  return columnDefs
    .map((column) => column.key)
    .filter((key) => key !== "select" && !state.order.includes(key))
}

/** The px a lane occupies when frozen, where it cannot flex. */
export function laneWidth(state: GridState, key: string) {
  return state.widths[key] ?? columnByKey[key].minPx
}

/** Grid template track for one lane. A dragged or pinned lane holds its width. */
export function columnTrack(state: GridState, key: string) {
  const column = columnByKey[key]
  if (state.widths[key] !== undefined) return `${state.widths[key]}px`
  return column.grow > 0 && !state.pinned.includes(key)
    ? `minmax(${column.minPx}px, ${column.grow}fr)`
    : `${column.minPx}px`
}

export function sortRows(rows: DrugRow[], sort: SortState | null) {
  if (!sort) return rows
  const column = columnByKey[sort.columnKey]
  if (!column) return rows
  const factor = sort.direction === "asc" ? 1 : -1
  return [...rows].sort((a, b) => {
    const left = column.sortValue(a)
    const right = column.sortValue(b)
    if (typeof left === "number" && typeof right === "number") return (left - right) * factor
    return String(left).localeCompare(String(right)) * factor
  })
}
