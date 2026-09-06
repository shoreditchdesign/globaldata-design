/**
 * The agent, such as it is: a keyword map over a fixed set of grid actions.
 *
 * There is no parser and no model here, and the prototype should not pretend
 * otherwise. What it does is match a lowercased request against an ordered list
 * of rules and return a `Proposal` — a named set of `GridAction`s that the
 * analyst has to accept before anything moves. Anything that matches nothing
 * comes back as a miss with suggestions, rather than a shrug or a guess.
 *
 * The actions are the same ones the column menus and the column manager
 * produce. That is the point of this direction: the agent works the grid, not a
 * query object of its own.
 */
import {
  columnByKey,
  europeanGeographies,
  rows,
  type AggregateKey,
} from "@/flows/sprint-3/idea-4/data"
import {
  applyActions,
  describeAction,
  type GridAction,
  type GridState,
} from "@/flows/sprint-3/idea-4/grid-state"

export interface Proposal {
  id: string
  /** What the agent says it is about to do, in one line. */
  headline: string
  actions: GridAction[]
  /** One line per action, for the proposal card. */
  changes: string[]
}

/** One turn in the panel. A proposal is resolved once, then frozen. */
export interface AgentMessage {
  id: string
  role: "analyst" | "agent"
  text: string
  proposal?: Proposal
  suggestions?: string[]
  outcome?: "accepted" | "rejected"
}

/**
 * The receipt. Every agent action leaves one of these, whether it was applied,
 * rejected or undone — that is this direction's answer to AI-editability: the
 * panel proposes, the grid changes, and the bar along the bottom is the record.
 *
 * `before` is the whole grid state as it stood a moment before the change, which
 * is what makes undo one click rather than an inverse operation per action kind.
 */
export interface AgentLogEntry {
  id: string
  status: "applied" | "rejected" | "undone"
  headline: string
  changes: string[]
  /** Rows on screen after the change. */
  resultCount: number
  /** Measured across the staged apply — a real number over a simulated wait. */
  durationMs: number
  /** Wall-clock time, formatted on the client so nothing renders on the server. */
  at: string
  before: GridState | null
}

export type AgentReply =
  | { kind: "proposal"; message: string; proposal: Proposal }
  | { kind: "miss"; message: string; suggestions: string[] }

let proposalCounter = 0
function proposal(headline: string, actions: GridAction[]): Proposal {
  proposalCounter += 1
  return {
    id: `proposal-${proposalCounter}`,
    headline,
    actions,
    changes: actions.map(describeAction),
  }
}

function normalise(text: string) {
  // `/` survives so `phase 2/3` still reads as two values; everything else
  // collapses to single spaces, which is what the word-boundary tests expect.
  return ` ${text.toLowerCase().replace(/[^a-z0-9+&/]+/g, " ").trim()} `
}

function has(text: string, ...words: string[]) {
  return words.some((word) => text.includes(` ${word} `))
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
  return columnPhrases.find((phrase) => phrase.test.test(text))?.key ?? null
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
 */
function phasesIn(text: string) {
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

function companiesIn(text: string) {
  const found = new Set<string>()
  for (const alias of companyAliases) if (alias.test.test(text)) found.add(alias.value)
  for (const name of companyNames) if (text.includes(name.toLowerCase())) found.add(name)
  return [...found]
}

/* -------------------------------------------------------------------------- */
/* Rules                                                                       */
/* -------------------------------------------------------------------------- */

const aggregateWords: { test: RegExp; key: AggregateKey }[] = [
  { test: /average npv|mean npv|average value|typical npv/, key: "meanNpv" },
  { test: /total npv|sum of npv|combined npv|portfolio value/, key: "totalNpv" },
]

function structuralReply(text: string, state: GridState): AgentReply | null {
  /* Clear everything ---------------------------------------------------- */
  if (/start over|start again|clear (all|everything|the filters)|reset the filters|remove all filters/.test(text)) {
    return {
      kind: "proposal",
      message: "",
      proposal: proposal("Clear all filters", [{ kind: "clearFilters" }]),
    }
  }

  /* Aggregates ---------------------------------------------------------- */
  const aggregate = aggregateWords.find((word) => word.test.test(text))
  if (aggregate) {
    if (state.aggregates.includes(aggregate.key)) return null
    return {
      kind: "proposal",
      message: "",
      proposal: proposal("Add an aggregate to the footer", [
        { kind: "setAggregates", keys: [...state.aggregates, aggregate.key] },
        ...(state.order.includes("npv")
          ? []
          : ([{ kind: "addColumn", columnKey: "npv" }] as GridAction[])),
      ]),
    }
  }

  /* Group --------------------------------------------------------------- */
  if (/\bgroup\b|\bgrouped\b|\bgrouping\b|break (it )?down by|split by/.test(text)) {
    if (/no group|ungroup|remove group|flat/.test(text)) {
      return {
        kind: "proposal",
        message: "I'll flatten the grid back to one list.",
        proposal: proposal("Remove grouping", [{ kind: "setGroup", columnKey: null }]),
      }
    }
    const key = resolveColumn(text)
    const column = key ? columnByKey[key] : null
    if (column && column.groupable) {
      return {
        kind: "proposal",
        message: "",
        proposal: proposal(`Group rows by ${column.label}`, [
          { kind: "setGroup", columnKey: column.key },
          ...(state.order.includes(column.key)
            ? []
            : ([{ kind: "addColumn", columnKey: column.key }] as GridAction[])),
        ]),
      }
    }
    if (column) {
      return {
        kind: "miss",
        message: `${column.label} holds more than one value per drug, so grouping on it would put the same drug in several groups. Group by Company, Development Stage, Molecule Type, Drug Type or Marketing Status instead.`,
        suggestions: ["Group by company", "Group by development stage"],
      }
    }
  }

  /* Sort ---------------------------------------------------------------- */
  if (/\bsort\b|order by|rank|highest|lowest|biggest|largest|smallest|most valuable|alphabetical/.test(text)) {
    const key = resolveColumn(text) ?? (/valuable|worth/.test(text) ? "npv" : null)
    const column = key ? columnByKey[key] : null
    if (column) {
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
      }
    }
  }

  /* Remove a filter ----------------------------------------------------- */
  if (/(remove|drop|clear|get rid of|take off).*(filter|restriction)/.test(text)) {
    const key = resolveColumn(text)
    if (key && (state.filters[key]?.length ?? 0) > 0) {
      return {
        kind: "proposal",
        message: "",
        proposal: proposal(`Clear the ${columnByKey[key].label} filter`, [
          { kind: "clearColumnFilter", columnKey: key },
        ]),
      }
    }
  }

  /* Remove a column ----------------------------------------------------- */
  if (/\b(remove|hide|drop|get rid of|take out|lose|without)\b/.test(text)) {
    const key = resolveColumn(text)
    if (key && state.order.includes(key) && key !== "drugName") {
      return {
        kind: "proposal",
        message: "The data stays in the record; only the lane goes.",
        proposal: proposal(`Remove the ${columnByKey[key].label} column`, [
          { kind: "removeColumn", columnKey: key },
        ]),
      }
    }
  }

  /* Add a column -------------------------------------------------------- */
  if (/\badd\b|\binclude\b|bring in|\bcolumn\b|\bshow me the\b/.test(text)) {
    const key = resolveColumn(text)
    if (key && !state.order.includes(key)) {
      return {
        kind: "proposal",
        message: `${columnByKey[key].label} goes on the right of the grid.`,
        proposal: proposal(`Add the ${columnByKey[key].label} column`, [
          { kind: "addColumn", columnKey: key },
        ]),
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

  const push = (columnKey: string, values: string[]) => {
    const existing = additive ? (state.filters[columnKey] ?? []) : []
    const merged = [...new Set([...existing, ...values])]
    const current = state.filters[columnKey] ?? []
    const unchanged =
      merged.length === current.length && merged.every((value) => current.includes(value))
    if (!unchanged) actions.push({ kind: "setFilter", columnKey, values: merged })
  }

  const therapies = therapyWords.filter((word) => word.test.test(text)).map((word) => word.value)
  if (therapies.length) push("therapyArea", therapies)

  const phases = phasesIn(text)
  const stages = stageWords.filter((word) => word.test.test(text)).flatMap((word) => word.values)
  const allStages = [...new Set([...phases, ...stages])]
  if (allStages.length) push("stage", allStages)

  const geographyHit = geographyWords.find((word) => word.test.test(text))
  if (geographyHit) push("geography", geographyHit.values)

  const molecules = moleculeWords.filter((word) => word.test.test(text)).map((word) => word.value)
  if (molecules.length) push("moleculeType", molecules)

  const routes = routeWords.filter((word) => word.test.test(text)).map((word) => word.value)
  if (routes.length) push("route", routes)

  const drugTypes = drugTypeWords.filter((word) => word.test.test(text)).map((word) => word.value)
  if (drugTypes.length) push("drugType", drugTypes)

  const companies = companiesIn(text)
  if (companies.length) push("company", companies)

  if (actions.length === 0) return null

  const subjects = actions.map((action) =>
    action.kind === "setFilter" ? columnByKey[action.columnKey].label : "",
  )
  return {
    kind: "proposal",
    message:
      actions.length === 1
        ? ""
        : `That is ${actions.length} filters — ${subjects.join(", ")} — joined with "and".`,
    proposal: proposal(
      actions.length === 1 ? `Filter ${subjects[0]}` : `Apply ${actions.length} filters`,
      actions,
    ),
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

/** The prompts offered in the empty panel. Each one is a rule that exists. */
export const examplePrompts = [
  "Show me only the ones in Europe",
  "Add the NPV column",
  "Group by company",
  "Sort by highest NPV",
]

export function respond(text: string, state: GridState): AgentReply {
  const normalised = normalise(text)
  if (!normalised.trim()) {
    return {
      kind: "miss",
      message: "Type what you want the grid to do.",
      suggestions: missSuggestions.slice(0, 3),
    }
  }

  const structural = structuralReply(normalised, state)
  if (structural) return structural

  const filters = filterReply(normalised, state)
  if (filters) return filters

  if (has(normalised, "hello", "hi", "hey", "thanks")) {
    return {
      kind: "miss",
      message:
        "I only change this grid — filters, columns, sorting, grouping and the footer aggregates.",
      suggestions: missSuggestions.slice(0, 3),
    }
  }

  return {
    kind: "miss",
    message:
      "I could not map that to anything on this grid. I can filter a column, add or remove a column, sort, group, or add an aggregate to the footer — nothing else.",
    suggestions: missSuggestions,
  }
}

/** Rows a proposal would leave on screen, for the count on the proposal card. */
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
