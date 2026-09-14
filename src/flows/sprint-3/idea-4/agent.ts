/**
 * The agent, such as it is: a keyword map over a fixed set of grid actions.
 *
 * There is no parser and no model here, and the prototype should not pretend
 * otherwise. What it does is match a lowercased request against an ordered list
 * of rules and return a `Proposal` — a named set of `GridAction`s that the
 * analyst has to accept before anything moves. Anything that matches nothing
 * comes back as a miss with suggestions, rather than a shrug or a guess.
 *
 * Every rule that fires leaves a line in `trace`, which is what the thread's
 * "Thought for …" row lists. It is the real match, not decoration.
 *
 * The actions are the same ones the column menus and the column manager
 * produce. That is the point of this direction: the agent works the grid, not a
 * query object of its own.
 */
import {
  ArrowDownUpIcon,
  Columns3Icon,
  LayersIcon,
  ListFilterIcon,
  SigmaIcon,
  XIcon,
  type LucideIcon,
} from "lucide-react"

import {
  aggregateLabels,
  columnByKey,
  europeanGeographies,
  rows,
  type AggregateKey,
} from "@/flows/sprint-3/idea-4/data"
import {
  applyActions,
  filterPhrase,
  type GridAction,
  type GridState,
} from "@/flows/sprint-3/idea-4/grid-state"

export interface Proposal {
  id: string
  /** What the agent says it is about to do, in one line. */
  headline: string
  actions: GridAction[]
}

/**
 * Where one agent turn is. `stale` is not stored: a `proposed` turn whose
 * `stateVersion` is behind the grid's is stale, derived at render.
 */
export type AgentPhase =
  | "thinking"
  | "proposed"
  | "missed"
  | "applying"
  | "applied"
  | "dismissed"
  | "undone"

export interface AnalystMessage {
  id: string
  role: "analyst"
  text: string
}

/** One agent turn in the thread: thinking, then a plan, then a receipt. */
export interface AgentMessage {
  id: string
  role: "agent"
  /** The request this turn answers, kept so a stale proposal can run again. */
  prompt: string
  phase: AgentPhase
  message: string
  proposal?: Proposal
  suggestions?: string[]
  /** One line per rule that matched. */
  trace: string[]
  thoughtMs: number
  /** Measured across the staged apply — a real number over a simulated wait. */
  appliedMs: number
  /** Steps applied so far, while `applying`. */
  stepsDone: number
  countBefore: number
  countAfter: number
  /** The whole grid as it stood before the accept, which is what undo restores. */
  before: GridState | null
  /** The grid version the proposal was computed against. */
  stateVersion: number
}

export type ThreadMessage = AnalystMessage | AgentMessage

export type AgentReply =
  | { kind: "proposal"; message: string; proposal: Proposal; trace: string[] }
  | { kind: "miss"; message: string; suggestions: string[]; trace: string[] }

let proposalCounter = 0
function proposal(headline: string, actions: GridAction[]): Proposal {
  proposalCounter += 1
  return { id: `proposal-${proposalCounter}`, headline, actions }
}

function normalise(text: string) {
  // `/` survives so `phase 2/3` still reads as two values; everything else
  // collapses to single spaces, which is what the word-boundary tests expect.
  return ` ${text.toLowerCase().replace(/[^a-z0-9+&/]+/g, " ").trim()} `
}

function has(text: string, ...words: string[]) {
  return words.some((word) => text.includes(` ${word} `))
}

/** The words a rule actually matched, for the trace. */
function phrase(test: RegExp, text: string) {
  return text.match(test)?.[0].trim() ?? ""
}

function listValues(values: string[]) {
  if (values.length <= 3) return values.join(", ")
  return `${values.slice(0, 2).join(", ")} and ${values.length - 2} more`
}

/* -------------------------------------------------------------------------- */
/* Column names                                                                */
/* -------------------------------------------------------------------------- */

const columnPhrases: { key: string; test: RegExp }[] = [
  { key: "npv", test: /\bnpv\b|net present value|valuation/ },
  { key: "mechanism", test: /mechanism|\bmoa\b/ },
  { key: "target", test: /\btargets?\b/ },
  { key: "marketingStatus", test: /marketing status|marketing/ },
  { key: "drugType", test: /drug type/ },
  { key: "moleculeType", test: /molecule|modality/ },
  { key: "therapyArea", test: /therapy area|therapeutic area|therapy/ },
  { key: "indication", test: /indication|disease/ },
  { key: "stage", test: /development stage|\bstage\b|\bphase\b/ },
  { key: "route", test: /route|administration/ },
  { key: "geography", test: /geograph|countr|market|region/ },
  { key: "company", test: /\bcompan|sponsor|\bfirm\b/ },
  { key: "brand", test: /\bbrand\b/ },
  { key: "drugName", test: /drug name|\bname\b/ },
]

function resolveColumn(text: string) {
  const hit = columnPhrases.find((entry) => entry.test.test(text))
  return hit ? { key: hit.key, phrase: phrase(hit.test, text) } : null
}

/* -------------------------------------------------------------------------- */
/* Value vocabularies                                                          */
/* -------------------------------------------------------------------------- */

const therapyWords: { test: RegExp; value: string }[] = [
  { test: /oncolog|cancer|tumour|tumor/, value: "Oncology" },
  { test: /immunolog|autoimmune/, value: "Immunology" },
  { test: /neurolog|alzheimer|cns|multiple sclerosis/, value: "Neurology" },
  { test: /cardio|heart|cholesterol|lipid/, value: "Cardiovascular" },
  { test: /metabolic|obesity|diabet|weight loss/, value: "Metabolic Disorders" },
  { test: /respiratory|asthma|copd|lung disease/, value: "Respiratory" },
  { test: /ophthalm|retina|eye/, value: "Ophthalmology" },
  { test: /dermatolog|skin|eczema/, value: "Dermatology" },
  { test: /infectious|antibiotic|covid|antiviral/, value: "Infectious Disease" },
  { test: /haematolog|hematolog|blood|sickle|haemophilia/, value: "Haematological Disorders" },
  { test: /musculoskeletal|arthritis/, value: "Musculoskeletal Disorders" },
]

const moleculeWords: { test: RegExp; value: string }[] = [
  { test: /monoclonal|\bmab\b/, value: "Monoclonal Antibody" },
  { test: /bispecific|t cell engager/, value: "Bispecific Antibody" },
  { test: /\badcs?\b|antibody drug conjugate/, value: "Antibody-Drug Conjugate" },
  { test: /small molecule/, value: "Small Molecule" },
  { test: /sirna|rna interference/, value: "siRNA" },
  { test: /peptide|incretin/, value: "Peptide" },
  { test: /fusion protein/, value: "Fusion Protein" },
  { test: /cell therapy|crispr/, value: "Cell Therapy" },
  { test: /vaccine/, value: "Vaccine" },
  { test: /antibody fragment/, value: "Antibody Fragment" },
]

const routeWords: { test: RegExp; value: string }[] = [
  { test: /\boral|by mouth|tablet|pill/, value: "Oral" },
  { test: /intravenous|\biv\b|infus/, value: "Intravenous" },
  { test: /subcutaneous|\bsc\b|\bsubq\b|inject/, value: "Subcutaneous" },
  { test: /intravitreal/, value: "Intravitreal" },
  { test: /intramuscular/, value: "Intramuscular" },
]

const drugTypeWords: { test: RegExp; value: string }[] = [
  { test: /\bgeneric/, value: "Generic" },
  { test: /biosimilar/, value: "Biosimilar" },
  { test: /\borphan|rare disease/, value: "Orphan" },
  { test: /\bbranded\b/, value: "Branded" },
]

const geographyWords: { test: RegExp; values: string[] }[] = [
  { test: /europe|european|\beu\b|emea/, values: europeanGeographies },
  { test: /\bus\b|\busa\b|united states|america|stateside/, values: ["United States"] },
  { test: /\buk\b|united kingdom|britain|british/, values: ["United Kingdom"] },
  { test: /japan|japanese/, values: ["Japan"] },
  { test: /china|chinese/, values: ["China"] },
  { test: /asia|apac/, values: ["Japan", "China", "South Korea", "India", "Thailand"] },
  { test: /germany|german/, values: ["Germany"] },
]

const stageWords: { test: RegExp; values: string[] }[] = [
  { test: /late stage|latestage/, values: ["Phase III", "Pre-Registration"] },
  { test: /early stage|earlystage/, values: ["Discovery", "Preclinical", "Phase I"] },
  { test: /pre registration|filed|under review/, values: ["Pre-Registration"] },
  { test: /\bmarketed\b|on the market|launched|commercial/, values: ["Marketed"] },
  { test: /\bapproved\b/, values: ["Approved", "Marketed"] },
  { test: /discontinued|dead|failed|withdrawn/, values: ["Discontinued", "Withdrawn"] },
]

/**
 * `phase ii`, `phase 2 or 3`, `phase II/III` — the run after one `phase` is
 * read as a list, because nobody writing their own words repeats the word.
 * `runs` collects the matched text for the trace.
 */
function phasesIn(text: string, runs: string[]) {
  const map: Record<string, string> = {
    i: "Phase I",
    ii: "Phase II",
    iii: "Phase III",
    iv: "Phase IV",
    "0": "Phase 0",
    "1": "Phase I",
    "2": "Phase II",
    "3": "Phase III",
    "4": "Phase IV",
  }
  // Arabic runs may be separated by nothing but a space (`phase 2 3`); roman
  // runs need a real joining word, or a stray "i" in the sentence would read as
  // Phase I.
  const run =
    /phase\s+([0-4](?:\s*(?:or|and|to|,|\/|\+)?\s*[0-4])*|(?:iv|iii|ii|i)(?:\s*(?:or|and|to|,|\/|\+)\s*(?:iv|iii|ii|i))*)/g
  const found: string[] = []
  let hit = run.exec(text)
  while (hit) {
    runs.push(hit[0].trim())
    for (const token of hit[1].split(/\s*(?:or|and|to|,|\/|\+)\s*|\s+/)) {
      const value = map[token.trim()]
      if (value && !found.includes(value)) found.push(value)
    }
    hit = run.exec(text)
  }
  return found
}

const companyNames = [...new Set(rows.map((row) => row.company))]
const companyAliases: { test: RegExp; value: string }[] = [
  { test: /astrazeneca|\baz\b/, value: "AstraZeneca" },
  { test: /lilly/, value: "Eli Lilly" },
  { test: /\bmerck\b|\bmsd\b/, value: "Merck & Co" },
  { test: /\bgsk\b|glaxo/, value: "GSK" },
  { test: /sanofi/, value: "Sanofi" },
  { test: /novartis/, value: "Novartis" },
  { test: /amgen/, value: "Amgen" },
  { test: /roche/, value: "Roche" },
  { test: /johnson|\bj&j\b/, value: "Johnson & Johnson" },
  { test: /novo nordisk|\bnovo\b/, value: "Novo Nordisk" },
  { test: /vertex/, value: "Vertex Pharmaceuticals" },
  { test: /biontech/, value: "BioNTech" },
  { test: /moderna/, value: "Moderna" },
  { test: /bristol|\bbms\b/, value: "Bristol Myers Squibb" },
]

function companiesIn(text: string, phrases: string[]) {
  const found = new Set<string>()
  for (const alias of companyAliases) {
    if (alias.test.test(text)) {
      found.add(alias.value)
      phrases.push(phrase(alias.test, text))
    }
  }
  for (const name of companyNames) {
    if (text.includes(name.toLowerCase()) && !found.has(name)) {
      found.add(name)
      phrases.push(name.toLowerCase())
    }
  }
  return [...found]
}

/* -------------------------------------------------------------------------- */
/* Rules                                                                       */
/* -------------------------------------------------------------------------- */

const aggregateWords: { test: RegExp; key: AggregateKey }[] = [
  { test: /average npv|mean npv|average value|typical npv/, key: "meanNpv" },
  { test: /total npv|sum of npv|combined npv|portfolio value/, key: "totalNpv" },
]

function trace(said: string, meaning: string) {
  return `"${said}" → ${meaning}`
}

function structuralReply(text: string, state: GridState): AgentReply | null {
  /* Clear everything ---------------------------------------------------- */
  const clearAll =
    /start over|start again|clear (all|everything|the filters)|reset the filters|remove all filters/
  if (clearAll.test(text)) {
    return {
      kind: "proposal",
      message: "",
      proposal: proposal("Clear all filters", [{ kind: "clearFilters" }]),
      trace: [trace(phrase(clearAll, text), "Clear all filters")],
    }
  }

  /* Summary row --------------------------------------------------------- */
  const aggregate = aggregateWords.find((word) => word.test.test(text))
  if (aggregate) {
    if (state.aggregates.includes(aggregate.key)) return null
    return {
      kind: "proposal",
      message: "",
      proposal: proposal(`Show ${aggregateLabels[aggregate.key]} in the summary row`, [
        ...(state.order.includes("npv")
          ? []
          : ([{ kind: "addColumn", columnKey: "npv" }] as GridAction[])),
        { kind: "setAggregates", keys: [...state.aggregates, aggregate.key] },
      ]),
      trace: [trace(phrase(aggregate.test, text), `Summary row: ${aggregateLabels[aggregate.key]}`)],
    }
  }

  /* Group --------------------------------------------------------------- */
  const groupWord = /\bgroup\b|\bgrouped\b|\bgrouping\b|break (it )?down by|split by/
  if (groupWord.test(text)) {
    const ungroup = /no group|ungroup|remove group|flat/
    if (ungroup.test(text)) {
      return {
        kind: "proposal",
        message: "",
        proposal: proposal("Remove grouping", [{ kind: "setGroup", columnKey: null }]),
        trace: [trace(phrase(ungroup, text), "Remove grouping")],
      }
    }
    const hit = resolveColumn(text)
    const column = hit ? columnByKey[hit.key] : null
    if (hit && column && column.groupable) {
      return {
        kind: "proposal",
        message: "",
        proposal: proposal(`Group rows by ${column.label}`, [
          ...(state.order.includes(column.key)
            ? []
            : ([{ kind: "addColumn", columnKey: column.key }] as GridAction[])),
          { kind: "setGroup", columnKey: column.key },
        ]),
        trace: [trace(phrase(groupWord, text), "Group rows"), trace(hit.phrase, column.label)],
      }
    }
    if (hit && column) {
      return {
        kind: "miss",
        message: `${column.label} holds more than one value per drug, so a drug would land in several groups. Group by Company, Development Stage, Molecule Type, Drug Type or Marketing Status instead.`,
        suggestions: ["Group by company", "Group by development stage"],
        trace: [
          trace(phrase(groupWord, text), "Group rows"),
          trace(hit.phrase, `${column.label} — multi-valued, cannot group`),
        ],
      }
    }
  }

  /* Sort ---------------------------------------------------------------- */
  const sortWord =
    /\bsort\b|order by|rank|highest|lowest|biggest|largest|smallest|most valuable|alphabetical/
  if (sortWord.test(text)) {
    const hit =
      resolveColumn(text) ??
      (/valuable|worth/.test(text) ? { key: "npv", phrase: phrase(/valuable|worth/, text) } : null)
    const column = hit ? columnByKey[hit.key] : null
    if (hit && column) {
      const descending = /highest|biggest|largest|most valuable|descending|desc|worth most|top/.test(text)
      const direction = descending ? "desc" : "asc"
      return {
        kind: "proposal",
        message: "",
        proposal: proposal(`Sort by ${column.label}`, [
          ...(state.order.includes(column.key)
            ? []
            : ([{ kind: "addColumn", columnKey: column.key }] as GridAction[])),
          { kind: "setSort", sort: { columnKey: column.key, direction } },
        ]),
        trace: [
          trace(phrase(sortWord, text), descending ? "Sort, descending" : "Sort, ascending"),
          trace(hit.phrase, column.label),
        ],
      }
    }
  }

  /* Remove a filter ----------------------------------------------------- */
  const removeFilter = /(remove|drop|clear|get rid of|take off).*(filter|restriction)/
  if (removeFilter.test(text)) {
    const hit = resolveColumn(text)
    if (hit && (state.filters[hit.key]?.length ?? 0) > 0) {
      return {
        kind: "proposal",
        message: "",
        proposal: proposal(`Clear the ${columnByKey[hit.key].label} filter`, [
          { kind: "clearColumnFilter", columnKey: hit.key },
        ]),
        trace: [trace(hit.phrase, `${columnByKey[hit.key].label} filter`)],
      }
    }
  }

  /* Remove a column ----------------------------------------------------- */
  const removeWord = /\b(remove|hide|drop|get rid of|take out|lose|without)\b/
  if (removeWord.test(text)) {
    const hit = resolveColumn(text)
    if (hit && state.order.includes(hit.key) && hit.key !== "drugName") {
      return {
        kind: "proposal",
        message: "",
        proposal: proposal(`Remove the ${columnByKey[hit.key].label} column`, [
          { kind: "removeColumn", columnKey: hit.key },
        ]),
        trace: [
          trace(phrase(removeWord, text), "Remove a column"),
          trace(hit.phrase, columnByKey[hit.key].label),
        ],
      }
    }
  }

  /* Add a column -------------------------------------------------------- */
  const addWord = /\badd\b|\binclude\b|bring in|\bcolumn\b|\bshow me the\b/
  if (addWord.test(text)) {
    const hit = resolveColumn(text)
    if (hit && !state.order.includes(hit.key)) {
      return {
        kind: "proposal",
        message: "",
        proposal: proposal(`Add the ${columnByKey[hit.key].label} column`, [
          { kind: "addColumn", columnKey: hit.key },
        ]),
        trace: [
          trace(phrase(addWord, text), "Add a column"),
          trace(hit.phrase, columnByKey[hit.key].label),
        ],
      }
    }
  }

  return null
}

/**
 * Filters are collected across every dimension the request mentions, so
 * "phase III oncology drugs in Europe" comes back as one proposal with three
 * changes rather than three rounds of conversation.
 */
function filterReply(text: string, state: GridState): AgentReply | null {
  const additive = /\balso\b|as well|on top of|keep the|in addition/.test(text)
  const actions: GridAction[] = []
  const lines: string[] = []

  const push = (columnKey: string, values: string[], said: string[]) => {
    lines.push(trace(said.join(", "), `${columnByKey[columnKey].label}: ${listValues(values)}`))
    const existing = additive ? (state.filters[columnKey] ?? []) : []
    const merged = [...new Set([...existing, ...values])]
    const current = state.filters[columnKey] ?? []
    const unchanged =
      merged.length === current.length && merged.every((value) => current.includes(value))
    if (!unchanged) actions.push({ kind: "setFilter", columnKey, values: merged })
  }

  const pick = <T extends { test: RegExp }>(words: T[]) => words.filter((word) => word.test.test(text))
  const said = (words: { test: RegExp }[]) => words.map((word) => phrase(word.test, text))

  const therapies = pick(therapyWords)
  if (therapies.length) push("therapyArea", therapies.map((word) => word.value), said(therapies))

  const runs: string[] = []
  const phases = phasesIn(text, runs)
  const stages = pick(stageWords)
  const allStages = [...new Set([...phases, ...stages.flatMap((word) => word.values)])]
  if (allStages.length) push("stage", allStages, [...runs, ...said(stages)])

  const geographyHit = geographyWords.find((word) => word.test.test(text))
  if (geographyHit) push("geography", geographyHit.values, said([geographyHit]))

  const molecules = pick(moleculeWords)
  if (molecules.length) push("moleculeType", molecules.map((word) => word.value), said(molecules))

  const routes = pick(routeWords)
  if (routes.length) push("route", routes.map((word) => word.value), said(routes))

  const drugTypes = pick(drugTypeWords)
  if (drugTypes.length) push("drugType", drugTypes.map((word) => word.value), said(drugTypes))

  const companyPhrases: string[] = []
  const companies = companiesIn(text, companyPhrases)
  if (companies.length) push("company", companies, companyPhrases)

  if (actions.length === 0) return null

  const subjects = actions.map((action) =>
    action.kind === "setFilter" ? columnByKey[action.columnKey].label : "",
  )
  return {
    kind: "proposal",
    message: actions.length === 1 ? "" : `${actions.length} filters, joined with "and".`,
    proposal: proposal(
      actions.length === 1 ? `Filter ${subjects[0]}` : `Apply ${actions.length} filters`,
      actions,
    ),
    trace: lines,
  }
}

export const missSuggestions = [
  "Show me only the ones in Europe",
  "Add the NPV column",
  "Group by company",
  "Only phase III",
  "Sort by highest NPV",
  "Remove the brand column",
]

/** The prompts offered above the composer. Each one is a rule that exists. */
export const examplePrompts = [
  "Show me only the ones in Europe",
  "Add the NPV column",
  "Group by company",
  "Sort by highest NPV",
  "Only phase III",
  "Show the average NPV",
]

/** The request behind the grid's opening filters, shown as the thread's first turn. */
export const seedPrompt = "Oncology or immunology, phase 2 or 3, given IV or subcutaneously"

const tried = "Tried filters, columns, sorting, grouping and the summary row"

export function respond(text: string, state: GridState): AgentReply {
  const normalised = normalise(text)
  if (!normalised.trim()) {
    return {
      kind: "miss",
      message: "Type what you want the grid to do.",
      suggestions: missSuggestions.slice(0, 3),
      trace: [],
    }
  }

  const structural = structuralReply(normalised, state)
  if (structural) return structural

  const filters = filterReply(normalised, state)
  if (filters) return filters

  if (has(normalised, "hello", "hi", "hey", "thanks")) {
    return {
      kind: "miss",
      message: "I only change this grid — filters, columns, sorting, grouping and the summary row.",
      suggestions: missSuggestions.slice(0, 3),
      trace: [tried],
    }
  }

  return {
    kind: "miss",
    message: "I could not map that to anything on this grid.",
    suggestions: missSuggestions.slice(0, 3),
    trace: [tried],
  }
}

/** Rows a proposal would leave on screen, for the count on the plan card. */
export function previewCount(state: GridState, actions: GridAction[]) {
  const next = applyActions(state, actions)
  const entries = Object.entries(next.filters).filter(([, values]) => values.length > 0)
  if (entries.length === 0) return rows.length
  return rows.filter((row) =>
    entries.every(([key, values]) => {
      const column = columnByKey[key]
      if (!column) return true
      const rowValues = column.values(row)
      return values.some((value) => rowValues.includes(value))
    }),
  ).length
}

/* -------------------------------------------------------------------------- */
/* Steps                                                                       */
/* -------------------------------------------------------------------------- */

/** A step not yet run, running, or run — the label changes tense with it. */
export type StepTense = "todo" | "doing" | "done"

const verbs = {
  add: ["Add", "Adding", "Added"],
  clear: ["Clear", "Clearing", "Cleared"],
  remove: ["Remove", "Removing", "Removed"],
  sort: ["Sort", "Sorting", "Sorted"],
  group: ["Group", "Grouping", "Grouped"],
  move: ["Move", "Moving", "Moved"],
  pin: ["Toggle pin", "Toggling pin", "Toggled pin"],
  show: ["Show", "Showing", "Showed"],
  reset: ["Reset", "Resetting", "Reset"],
  toggle: ["Toggle", "Toggling", "Toggled"],
} as const

const tenseIndex: Record<StepTense, 0 | 1 | 2> = { todo: 0, doing: 1, done: 2 }

function label(columnKey: string) {
  return columnByKey[columnKey]?.label ?? columnKey
}

/** `Adding filter: Development Stage is Phase III`, `Added column: NPV (US$m)`. */
export function describeStep(action: GridAction, tense: StepTense): string {
  const v = (verb: keyof typeof verbs) => verbs[verb][tenseIndex[tense]]
  switch (action.kind) {
    case "setFilter":
      return action.values.length
        ? `${v("add")} filter: ${filterPhrase(action.columnKey, action.values)}`
        : `${v("clear")} filter: ${label(action.columnKey)}`
    case "toggleValue":
      return `${v("toggle")} ${label(action.columnKey)}: ${action.value}`
    case "clearColumnFilter":
      return `${v("clear")} filter: ${label(action.columnKey)}`
    case "clearFilters":
      return `${v("clear")} all filters`
    case "addColumn":
      return `${v("add")} column: ${label(action.columnKey)}`
    case "removeColumn":
      return `${v("remove")} column: ${label(action.columnKey)}`
    case "moveColumn":
      return `${v("move")} column ${action.by < 0 ? "left" : "right"}: ${label(action.columnKey)}`
    case "togglePin":
      return `${v("pin")}: ${label(action.columnKey)}`
    case "setSort":
      return action.sort
        ? `${v("sort")} by ${label(action.sort.columnKey)}, ${action.sort.direction === "asc" ? "ascending" : "descending"}`
        : `${v("clear")} sort`
    case "setGroup":
      return action.columnKey
        ? `${v("group")} by ${label(action.columnKey)}`
        : `${v("remove")} grouping`
    case "setAggregates":
      return action.keys.length
        ? `${v("show")} summary: ${action.keys.map((key) => aggregateLabels[key]).join(", ")}`
        : `${v("clear")} summary row`
    case "resetColumns":
      return `${v("reset")} columns`
  }
}

export function stepIcon(action: GridAction): LucideIcon {
  switch (action.kind) {
    case "setFilter":
      return action.values.length ? ListFilterIcon : XIcon
    case "toggleValue":
      return ListFilterIcon
    case "clearColumnFilter":
    case "clearFilters":
      return XIcon
    case "setSort":
      return ArrowDownUpIcon
    case "setGroup":
      return LayersIcon
    case "setAggregates":
      return SigmaIcon
    case "addColumn":
    case "removeColumn":
    case "moveColumn":
    case "togglePin":
    case "resetColumns":
      return Columns3Icon
  }
}
