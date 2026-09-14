/**
 * The grid's state and the one function that changes it.
 *
 * Every change to the grid — a checkbox in a column header, a column added in
 * the manager, a sort, a group, or anything the agent proposes — is expressed
 * as a `GridAction` and goes through `applyAction`. That is what makes the
 * agent's side of the direction honest: the panel does not have a private route
 * into the grid, it queues the same actions a person's clicks produce, which is
 * also why one snapshot of this object is enough to undo any of them.
 */
import {
  aggregateLabels,
  columnByKey,
  columnDefs,
  defaultAggregates,
  defaultColumnOrder,
  initialFilters,
  initialSort,
  type AggregateKey,
  type FilterState,
  type SortState,
} from "@/flows/sprint-3/idea-4/data"

export interface GridState {
  filters: FilterState
  /** Visible columns, in the order the manager holds them. Always starts `select`. */
  order: string[]
  /** Pinned columns, drawn first regardless of `order`. */
  pinned: string[]
  sort: SortState | null
  group: string | null
  aggregates: AggregateKey[]
}

export const initialGridState: GridState = {
  filters: initialFilters,
  order: defaultColumnOrder,
  pinned: ["drugName"],
  sort: initialSort,
  group: null,
  aggregates: defaultAggregates,
}

export type GridAction =
  | { kind: "setFilter"; columnKey: string; values: string[] }
  | { kind: "toggleValue"; columnKey: string; value: string }
  | { kind: "clearColumnFilter"; columnKey: string }
  | { kind: "clearFilters" }
  | { kind: "addColumn"; columnKey: string }
  | { kind: "removeColumn"; columnKey: string }
  | { kind: "moveColumn"; columnKey: string; by: -1 | 1 }
  | { kind: "togglePin"; columnKey: string }
  | { kind: "setSort"; sort: SortState | null }
  | { kind: "setGroup"; columnKey: string | null }
  | { kind: "setAggregates"; keys: AggregateKey[] }
  | { kind: "resetColumns" }

function withoutColumn(state: GridState, columnKey: string): GridState {
  return {
    ...state,
    order: state.order.filter((key) => key !== columnKey),
    pinned: state.pinned.filter((key) => key !== columnKey),
    // A hidden column cannot keep sorting or grouping the grid it is no longer
    // in; dropping it silently would leave the toolbar naming a lane nobody
    // can see.
    sort: state.sort?.columnKey === columnKey ? null : state.sort,
    group: state.group === columnKey ? null : state.group,
  }
}

export function applyAction(state: GridState, action: GridAction): GridState {
  switch (action.kind) {
    case "setFilter": {
      const filters = { ...state.filters }
      if (action.values.length === 0) delete filters[action.columnKey]
      else filters[action.columnKey] = action.values
      return { ...state, filters }
    }
    case "toggleValue": {
      const current = state.filters[action.columnKey] ?? []
      const next = current.includes(action.value)
        ? current.filter((value) => value !== action.value)
        : [...current, action.value]
      return applyAction(state, {
        kind: "setFilter",
        columnKey: action.columnKey,
        values: next,
      })
    }
    case "clearColumnFilter":
      return applyAction(state, { kind: "setFilter", columnKey: action.columnKey, values: [] })
    case "clearFilters":
      return { ...state, filters: {} }
    case "addColumn": {
      if (state.order.includes(action.columnKey)) return state
      if (!columnByKey[action.columnKey]) return state
      return { ...state, order: [...state.order, action.columnKey] }
    }
    case "removeColumn": {
      if (action.columnKey === "select" || action.columnKey === "drugName") return state
      return withoutColumn(state, action.columnKey)
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
    case "togglePin": {
      const pinned = state.pinned.includes(action.columnKey)
        ? state.pinned.filter((key) => key !== action.columnKey)
        : [...state.pinned, action.columnKey]
      return { ...state, pinned }
    }
    case "setSort":
      return { ...state, sort: action.sort }
    case "setGroup":
      return { ...state, group: action.columnKey }
    case "setAggregates":
      return { ...state, aggregates: action.keys }
    case "resetColumns":
      return {
        ...state,
        order: defaultColumnOrder,
        pinned: ["drugName"],
        sort: state.sort && defaultColumnOrder.includes(state.sort.columnKey) ? state.sort : null,
        group: state.group && defaultColumnOrder.includes(state.group) ? state.group : null,
      }
  }
}

export function applyActions(state: GridState, actions: GridAction[]): GridState {
  return actions.reduce(applyAction, state)
}

/**
 * Draw order: the select lane, then anything pinned, then the rest as the
 * manager holds them.
 */
export function visibleColumnKeys(state: GridState) {
  const pinned = state.order.filter((key) => key !== "select" && state.pinned.includes(key))
  const rest = state.order.filter((key) => key !== "select" && !state.pinned.includes(key))
  return ["select", ...pinned, ...rest]
}

/**
 * Every column not currently drawn — including a default lane the analyst has
 * hidden, which otherwise leaves the grid with no way back to it short of
 * Reset.
 */
export function hiddenColumnKeys(state: GridState) {
  return columnDefs
    .map((column) => column.key)
    .filter((key) => key !== "select" && !state.order.includes(key))
}

/* -------------------------------------------------------------------------- */
/* Plain language                                                              */
/* -------------------------------------------------------------------------- */

function label(columnKey: string) {
  return columnByKey[columnKey]?.label ?? columnKey
}

/** `Development Stage is Phase II or Phase III` — the phrase the pills use. */
export function filterPhrase(columnKey: string, values: string[]) {
  if (values.length === 0) return `${label(columnKey)} filter cleared`
  if (values.length <= 3) return `${label(columnKey)} is ${values.join(" or ")}`
  return `${label(columnKey)} is ${values.slice(0, 2).join(" or ")} or ${values.length - 2} more`
}

/** One line per action, in the past tense. The thread's steps use `describeStep`. */
export function describeAction(action: GridAction): string {
  switch (action.kind) {
    case "setFilter":
      return filterPhrase(action.columnKey, action.values)
    case "toggleValue":
      return `${label(action.columnKey)} — ${action.value} toggled`
    case "clearColumnFilter":
      return `${label(action.columnKey)} filter cleared`
    case "clearFilters":
      return "All filters cleared"
    case "addColumn":
      return `${label(action.columnKey)} column added`
    case "removeColumn":
      return `${label(action.columnKey)} column removed`
    case "moveColumn":
      return `${label(action.columnKey)} moved ${action.by < 0 ? "left" : "right"}`
    case "togglePin":
      return `${label(action.columnKey)} pin toggled`
    case "setSort":
      return action.sort
        ? `Sorted by ${label(action.sort.columnKey)}, ${action.sort.direction === "asc" ? "ascending" : "descending"}`
        : "Sort cleared"
    case "setGroup":
      return action.columnKey ? `Grouped by ${label(action.columnKey)}` : "Grouping removed"
    case "setAggregates":
      return action.keys.length
        ? `Summary row shows ${action.keys.map((key) => aggregateLabels[key]).join(", ")}`
        : "Summary row hidden"
    case "resetColumns":
      return "Columns reset to the default nine"
  }
}
