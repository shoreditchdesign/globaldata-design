import type { ProductArea } from "@/components/prototype/ProductChrome"
import {
  definitionFor,
  filterDefinitions,
  filterIdFor,
  searchAttributeLabels,
  searchAttributeValues,
  type FilterId,
  type FilterLink,
  type ResolvedFilter,
} from "@/flows/sprint-4/idea-1b/data"

/**
 * Turning typed English into filters.
 *
 * Ported from Sprint 4 Idea 2b's resolver and pointed at this direction's own
 * taxonomy, so a typed phrase lands on the same clause a pill or a Miller
 * column builds. It is keyword matching, not a parser: every phrase it
 * understands is a label in the Drugs taxonomy or is written down below.
 *
 * 1. Anything it cannot place is reported, never dropped in silence.
 * 2. Terms that name something real in the product but unbuilt here — a date,
 *    NPV, a regulator — get their own note, because "we do not do that yet"
 *    and "we did not understand you" are different answers.
 */

/* -------------------------------------------------------------------------- */
/* Normalising                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Lowercase, punctuation to spaces, runs of spaces collapsed — with a map back
 * to the original string, so a match can be flashed in the words as typed.
 * `/` survives, because `phase 2/3` is one of the phrasings people type.
 */
function normalise(input: string) {
  const chars: string[] = []
  const map: number[] = []
  let space = true

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index].toLowerCase()
    if (/[a-z0-9/]/.test(character)) {
      chars.push(character)
      map.push(index)
      space = false
    } else if (!space) {
      chars.push(" ")
      map.push(index)
      space = true
    }
  }

  while (chars.at(-1) === " ") {
    chars.pop()
    map.pop()
  }

  return { text: chars.join(""), map }
}

function plain(input: string) {
  return normalise(input).text
}

/* -------------------------------------------------------------------------- */
/* The map                                                                     */
/* -------------------------------------------------------------------------- */

interface Matcher {
  id: FilterId
  values: string[]
  patterns: string[]
  /** Words that, immediately before this phrase, mean it is not this value. */
  notAfter?: string[]
}

/**
 * Where the vocabulary comes from: every Drugs attribute the grid evaluates,
 * in the taxonomy's order, and the manufacturer, which the grid also reads.
 * Expiry date is drawn but not evaluated, so a date is a note, not a filter.
 */
const vocabulary: { area: ProductArea; attribute: string }[] = [
  ...searchAttributeLabels("Drugs")
    .filter((attribute) => attribute !== "Expiry Date")
    .map((attribute) => ({ area: "Drugs" as const, attribute })),
  { area: "Drugs by Manufacturer", attribute: "Manufacturer" },
]

/** Values that are words, not things: `None` is no vector, not a search for one. */
const unmatchable = new Set(["Drugs/Gene Therapy Vector:None"])

/** Informal, abbreviated and plural forms, keyed `filter id:label`. */
const synonyms: Record<string, string[]> = {
  "Drugs/Therapy Area / Indication:Cardiovascular": ["cardiology", "cardiac", "heart"],
  "Drugs/Therapy Area / Indication:Central Nervous System": ["cns", "neurology", "neurological"],
  "Drugs/Therapy Area / Indication:Dermatology": ["dermatological", "skin", "skin disease"],
  "Drugs/Therapy Area / Indication:Ear Nose Throat Disorders": ["ent", "ear nose and throat"],
  "Drugs/Therapy Area / Indication:Gastrointestinal": ["gi", "gastro"],
  "Drugs/Therapy Area / Indication:Genetic Disorders": ["genetic", "genetic disease"],
  "Drugs/Therapy Area / Indication:Genito Urinary System": ["genitourinary", "urology", "urological"],
  "Drugs/Therapy Area / Indication:Hermatological Disorders": [
    "haematology",
    "hematology",
    "haematological",
    "hematological",
    "blood disorders",
  ],
  "Drugs/Therapy Area / Indication:Hormonal Disorders": ["hormonal", "endocrine"],
  "Drugs/Therapy Area / Indication:Immunology": ["immune", "autoimmune"],
  "Drugs/Therapy Area / Indication:Infectious Disease": ["infectious diseases", "infection", "infections"],
  "Drugs/Therapy Area / Indication:Metabolic Disorders": ["metabolic"],
  "Drugs/Therapy Area / Indication:Musculoskeletal Disorders": ["musculoskeletal"],

  "stage:Marketed": ["on the market", "on market", "launched", "approved"],
  "stage:Pipeline": ["in development", "in the pipeline"],
  "stage:Phase I": ["phase 1", "phase one", "ph 1"],
  "stage:Phase II": ["phase 2", "phase two", "ph 2"],
  "stage:Phase III": ["phase 3", "phase three", "ph 3"],
  "stage:Pre-registration": ["preregistration", "pre reg"],
  "stage:Withdrawn (Marketed)": ["withdrawn", "pulled"],
  "stage:Archived (Marketed)": ["archived", "discontinued"],

  "geography:Austria": ["austrian"],
  "geography:Italy": ["italian"],
  "geography:Germany": ["german"],
  "geography:France": ["french"],
  "geography:Spain": ["spanish"],
  "geography:United Kingdom": ["uk", "u k", "britain", "british"],
  "geography:United States": ["us", "u s", "usa", "america", "american"],
  "geography:Canada": ["canadian"],
  "geography:Japan": ["japanese"],
  "geography:India": ["indian"],
  "geography:Brazil": ["brazilian"],
  "geography:Mexico": ["mexican"],
  "geography:Poland": ["polish"],
  "geography:Sweden": ["swedish"],
  "geography:Denmark": ["danish"],
  "geography:South Africa": ["south african"],

  "Drugs/Route of Administration:Oral": ["orally", "by mouth", "tablet", "tablets", "capsules"],
  "Drugs/Route of Administration:Intravenous": ["iv", "intravenously", "infusion", "infused"],
  "Drugs/Route of Administration:Subcutaneous": ["subcutaneously", "subcut", "sub q"],
  "Drugs/Route of Administration:Topical": ["topically", "cream", "creams", "gel", "gels", "ointment", "ointments"],
  "Drugs/Route of Administration:Inhaled": ["inhalation", "inhaler", "inhalers"],

  "Drugs/Molecule Type:Small Molecule": ["small molecules"],
  "Drugs/Molecule Type:Monoclonal Antibody": [
    "mab",
    "mabs",
    "monoclonal antibodies",
    "monoclonals",
    "antibody",
    "antibodies",
  ],
  "Drugs/Molecule Type:Peptide": ["peptides"],
  "Drugs/Molecule Type:Recombinant Protein": ["recombinant", "recombinant proteins"],
  "Drugs/Molecule Type:Gene Therapy": ["gene therapies"],

  "target:Actin Gamma Enteric Smooth Muscle": ["actg2", "actin gamma", "actin gamma 2"],
  "target:Cyclooxygenase 2": ["cox 2", "cox2", "ptgs2"],
  "target:Cyclooxygenase 1": ["cox 1", "cox1", "ptgs1"],
  "target:Interleukin 17A": ["il 17", "il17", "il 17a", "interleukin 17"],
  "target:Janus Kinase 3": ["jak3", "jak 3"],
  "target:Vitamin D Receptor": ["vdr"],
  "target:ATP Citrate Lyase": ["acly"],
  "target:Sodium Glucose Cotransporter 2": ["sglt2", "sglt 2"],
  "target:Survival Motor Neuron 1": ["smn1"],

  "Drugs/Mechanism of Action:Cyclooxygenase Inhibitor": ["cox inhibitor", "cox inhibitors"],
  "Drugs/Mechanism of Action:Interleukin 17A Antagonist": ["il 17 antagonist", "il 17 antagonists"],
  "Drugs/Mechanism of Action:Janus Kinase Inhibitor": ["jak inhibitor", "jak inhibitors"],
  "Drugs/Mechanism of Action:Proton Pump Inhibitor": ["ppi", "ppis", "proton pump inhibitors"],
  "Drugs/Mechanism of Action:SGLT2 Inhibitor": ["sglt2 inhibitors", "sglt 2 inhibitor", "sglt 2 inhibitors"],

  "drug-type:Generic": ["generics", "generic drug", "generic drugs"],
  "drug-type:Branded": ["brand", "brands", "branded drug", "branded drugs"],
  "drug-type:Biosimilar": ["biosimilars"],
  "drug-type:Orphan": ["orphan drug", "orphan drugs"],

  "Drugs/Mono/Combination Drug:Mono": ["monotherapy", "monotherapies", "single agent"],
  "Drugs/Mono/Combination Drug:Combination": ["combinations", "combination therapy", "combo", "combos"],

  "descriptor:Antiinflammatory Therapy": [
    "anti inflammatory",
    "anti inflammatories",
    "antiinflammatory",
    "antiinflammatories",
    "anti inflammatory drugs",
    "nsaid",
    "nsaids",
  ],
  "descriptor:Immunosuppressant Therapy": ["immunosuppressant", "immunosuppressants", "immunosuppressive"],
  "descriptor:Antiviral Therapy": ["antiviral", "antivirals"],
  "descriptor:Antidiabetic Therapy": ["antidiabetic", "antidiabetics", "diabetes"],
  "descriptor:Antihyperlipidaemic Therapy": ["antihyperlipidemic", "lipid lowering", "statin", "statins"],
  "descriptor:Antipsoriatic Therapy": ["antipsoriatic", "antipsoriatics", "psoriasis"],
  "descriptor:Antiulcer Therapy": ["antiulcer", "anti ulcer", "ulcer", "ulcers"],
  "descriptor:Antianginal Therapy": ["antianginal", "antianginals", "angina"],

  "Drugs/Gene Therapy Vector:Adeno Associated Virus (AAV)": ["aav", "adeno associated virus"],
  "Drugs/Gene Therapy Vector:Lentivirus": ["lentiviral"],
  "Drugs/Gene Therapy Vector:Adenovirus": ["adenoviral"],

  "Drugs/Application Type:Abbreviated New Drug Application": ["anda", "andas"],
  "Drugs/Application Type:New Drug Application": ["nda", "ndas"],
  "Drugs/Application Type:Biologics License Application": ["bla", "blas"],

  "Drugs/Marketing Status:Not Marketed": ["unmarketed"],

  "Drugs by Manufacturer/Manufacturer:Teva Pharmaceutical": ["teva"],
  "Drugs by Manufacturer/Manufacturer:Sun Pharmaceutical": ["sun pharma", "sun pharmaceuticals"],
}

/** Phrases that name more than one stage at once. */
const compounds: Matcher[] = [
  {
    id: "stage",
    values: ["Phase II", "Phase III"],
    patterns: [
      "phase 2/3",
      "phase ii/iii",
      "phase 2 3",
      "phase ii iii",
      "phase 2 or 3",
      "phase ii or iii",
      "phase 2 and 3",
      "phase ii and iii",
      "phase 2 or phase 3",
      "phase ii or phase iii",
    ],
  },
  {
    id: "stage",
    values: ["Phase I", "Phase II"],
    patterns: [
      "phase 1/2",
      "phase i/ii",
      "phase 1 2",
      "phase i ii",
      "phase 1 or 2",
      "phase i or ii",
      "phase 1 and 2",
      "phase i and ii",
    ],
  },
  {
    id: "stage",
    values: ["Phase II", "Phase III", "Pre-registration"],
    patterns: ["phase 2 or later", "phase ii or later", "phase 2 plus", "phase ii plus"],
  },
  {
    id: "stage",
    values: ["Phase III", "Pre-registration"],
    patterns: ["late stage", "phase 3 or later", "phase iii or later"],
  },
]

/**
 * Words that mean something real in the product and nothing here. Reported
 * with a reason rather than as gibberish.
 */
const unbuilt: { patterns: string[]; note: string }[] = [
  {
    patterns: [
      "last two years", "last 2 years", "last year", "this year", "next year", "recently",
      "since 2020", "since 2024", "2020", "2021", "2022", "2023", "2024", "2025", "2026", "2027",
      "2028", "2029", "2030", "expiry", "expiring", "expires", "patent expiry",
    ],
    note: "There is no date condition in this prototype.",
  },
  {
    patterns: [
      "npv", "net present value", "forecast", "forecasts", "sales", "peak sales", "revenue",
      "revenues",
    ],
    note: "NPV and Sales and Forecast are separate product areas, not conditions on a drug.",
  },
  {
    patterns: [
      "fda", "ema", "pmda", "mhra", "regulator", "regulators", "regulatory", "milestone",
      "milestones",
    ],
    note: "Regulatory Milestones is a separate product area, not a condition on a drug.",
  },
  {
    patterns: ["licensing", "licence", "license", "deal", "deals", "partnering"],
    note: "Licensing Opportunities is a separate product area, not a condition on a drug.",
  },
  {
    patterns: [
      "novartis", "roche", "boehringer", "boehringer ingelheim", "astrazeneca", "sanofi", "bayer",
      "gsk", "merck", "abbvie", "lilly", "takeda", "amgen",
    ],
    note: "Manufacturers in this sample are Pfizer, Teva, Sun Pharmaceutical and Sandoz.",
  },
  {
    patterns: ["phase iv", "phase 4", "phase four"],
    note: "Phase IV is not a stage in this sample.",
  },
]

/**
 * The attribute names people type around a value. Read as grammar, the way
 * `is` and `not` are: they are neither a filter nor something left unplaced.
 */
const headings = [
  ...vocabulary.map(({ attribute }) => attribute),
  "therapy area", "indication", "indications", "stage", "development stage", "geography",
  "route", "molecule", "mechanism", "moa", "atc", "atc class", "descriptor", "vector",
  "application", "status", "company", "companies",
]

/** Grammar, filler and the sentence's own operator words. */
const stopwords = new Set(
  (
    "a an the and or nor of in on at for with to from by that which who are is was were be been " +
    "being it its this these those there here as any all some show showing me my we us our you your " +
    "i find get give list want need looking look please just only also plus within available drug " +
    "drugs compound compounds product products medicine medicines treatment treatments therapy " +
    "therapies not no non excluding exclude except without other than outside minus never apart " +
    "besides targeting target targets taken take using used given filed classed classified under " +
    "via administered delivered marketed sold made acting described typed whose type types route " +
    "molecule molecules stage stages phase geography area indication attribute results query " +
    "search screen thanks ok but well both either neither where what which like such etc into " +
    "across currently have has had do does can could would should any every each"
  ).split(" "),
)

/** Words that may sit between a negation cue and the value it negates. */
const bridge = new Set(
  (
    "available marketed sold in the a an of for from to drugs drug that are is be been targeting " +
    "target taken given filed classified classed under as made acting described typed delivered " +
    "via by any currently with those these ones"
  ).split(" "),
)

const negationCues = [
  "not", "no", "non", "excluding", "exclude", "except", "without", "other than", "outside", "minus",
]

/**
 * Words that carry a negation on to a phrase of a different attribute:
 * `exclude Austria or Italy, as well as … withdrawn` excludes both.
 */
const continuations = ["as well as", "nor", "or any"]

/**
 * Phrases that are only this value in the right company. `IV` is a route, but
 * `phase IV` is a stage; `us` is a country, but `show us` is a pronoun.
 */
const guards: Record<string, string[]> = {
  "Drugs/Route of Administration:Intravenous": ["phase"],
  "geography:United States": ["give", "show", "tell", "let", "get", "send"],
}

/** The typed forms a label is read from, before synonyms. */
function labelPatterns(label: string) {
  const own = plain(label)
  const patterns = [own]
  if (own.endsWith("therapy")) patterns.push(`${own.slice(0, -1)}ies`)
  else if (!own.endsWith("s") && !/\d$/.test(own)) patterns.push(`${own}s`)
  return patterns
}

const matchers: Matcher[] = buildMatchers()

function buildMatchers() {
  const built: Matcher[] = []
  // First claim wins, in taxonomy order: `Marketed` is a development stage
  // before it is a marketing status, and `Gene Therapy` a molecule type before
  // it is a descriptor.
  const claimed = new Set<string>()
  const claim = (id: FilterId, label: string, patterns: string[]) => {
    const own = patterns.filter((pattern) => pattern && !claimed.has(pattern))
    own.forEach((pattern) => claimed.add(pattern))
    if (own.length === 0) return
    const existing = built.find((matcher) => matcher.id === id && matcher.values[0] === label)
    if (existing) existing.patterns.push(...own)
    else built.push({ id, values: [label], patterns: own, notAfter: guards[`${id}:${label}`] })
  }

  const entries = vocabulary.flatMap(({ area, attribute }) => {
    const id = filterIdFor(area, attribute)
    return searchAttributeValues(area, attribute)
      .filter((label) => !unmatchable.has(`${id}:${label}`))
      .map((label) => ({ id, label }))
  })

  for (const { id, label } of entries) {
    claim(id, label, [...labelPatterns(label), ...(synonyms[`${id}:${label}`] ?? []).map(plain)])
  }

  // An ATC class is also typed by its code or by the words after its dash.
  // They claim last, so a descriptor's own synonym — `immunosuppressants` —
  // stays with the descriptor it always meant.
  for (const { id, label } of entries) {
    const [code, words] = label.split(" — ")
    if (words) claim(id, label, [plain(code), plain(words)])
  }

  return [...built, ...compounds]
}

/* -------------------------------------------------------------------------- */
/* Matching                                                                    */
/* -------------------------------------------------------------------------- */

function escape(pattern: string) {
  return pattern.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")
}

function findAll(text: string, pattern: string) {
  const hits: { start: number; end: number }[] = []
  const expression = new RegExp(`\\b${escape(pattern)}\\b`, "g")
  let hit = expression.exec(text)
  while (hit) {
    hits.push({ start: hit.index, end: hit.index + hit[0].length })
    hit = expression.exec(text)
  }
  return hits
}

interface RawSpan {
  start: number
  end: number
  /** Absent for grammar: a heading, or a word read in another phrase's service. */
  id?: FilterId
  values: string[]
  note?: string
}

/** Longest match wins, and nothing overlaps — so every word is read once. */
function pickSpans(text: string) {
  const candidates: RawSpan[] = []

  for (const matcher of matchers) {
    for (const pattern of matcher.patterns) {
      for (const { start, end } of findAll(text, pattern)) {
        if (matcher.notAfter) {
          const before = text.slice(0, start).trimEnd()
          if (matcher.notAfter.some((word) => before.endsWith(word))) continue
        }
        candidates.push({ start, end, id: matcher.id, values: matcher.values })
      }
    }
  }

  for (const entry of unbuilt) {
    for (const pattern of entry.patterns) {
      for (const { start, end } of findAll(text, plain(pattern))) {
        candidates.push({ start, end, values: [], note: entry.note })
      }
    }
  }

  for (const heading of headings) {
    for (const { start, end } of findAll(text, plain(heading))) {
      candidates.push({ start, end, values: [] })
    }
  }

  candidates.sort((a, b) => a.start - b.start || b.end - b.start - (a.end - a.start))

  const taken: RawSpan[] = []
  for (const candidate of candidates) {
    const clash = taken.some((span) => candidate.start < span.end && span.start < candidate.end)
    if (clash) continue

    // In "marketed drugs that are withdrawn or archived", marketed qualifies
    // the two terminal states; it is not a third selected stage. It is read,
    // as grammar, so it is not reported as unplaced either.
    if (
      candidate.id === "stage" &&
      candidate.values[0] === "Marketed" &&
      /\b(withdrawn|archived|discontinued)\b/.test(text.slice(candidate.end, candidate.end + 48))
    ) {
      taken.push({ start: candidate.start, end: candidate.end, values: [] })
      continue
    }

    taken.push(candidate)
  }
  return taken.sort((a, b) => a.start - b.start)
}

/* -------------------------------------------------------------------------- */
/* Reading the result                                                          */
/* -------------------------------------------------------------------------- */

/** One phrase the resolver read, in the coordinates of the typed text. */
export interface ReadSpan {
  start: number
  end: number
  text: string
  id: FilterId
  /** The first value the phrase names; `values` holds all of them. */
  value: string
  values: string[]
  negated: boolean
}

/** Something typed that names a real part of the product this search does not carry. */
export interface Note {
  phrase: string
  text: string
}

export interface Resolution {
  raw: string
  /** False when nothing at all could be placed — no filters are produced. */
  ok: boolean
  filters: ResolvedFilter[]
  /** Everything read, in typing order. Drives the scan animation. */
  spans: ReadSpan[]
  /** Phrases that matched nothing, grouped as they were typed. */
  unplaced: string[]
  /** Parts of the product the words asked for that the drug grid does not carry. */
  notes: Note[]
}

const words = (text: string) => text.trim().split(" ").filter(Boolean)

interface Clause {
  id: FilterId
  kept: string[]
  negated: string[]
  keptJoin: "or" | "and"
  negatedJoin: "or" | "and"
  link: FilterLink
  /** Where the clause was first typed, for ordering. */
  first: number
}

export function resolveQuery(raw: string): Resolution {
  const { text, map } = normalise(raw)
  const empty: Resolution = { raw, ok: false, filters: [], spans: [], unplaced: [], notes: [] }
  if (!text) return empty

  const spans = pickSpans(text)

  // The text with grammar blanked out, so a heading or a qualifying word
  // between two phrases does not break the reading of the gap.
  const bare = [...text]
  for (const span of spans) {
    if (span.id || span.note) continue
    for (let index = span.start; index < span.end; index += 1) bare[index] = " "
  }
  const gap = (from: number, to: number) => words(bare.slice(from, to).join("").replace(/ +/g, " "))

  /* Negation. A cue applies to the nearest phrase after it, and to the
     phrases that follow while they belong to the same filter and are joined by
     `or` or `and` — so `not austria or italy oral` excludes two countries and
     leaves the route alone. A continuation (`as well as`, `nor`) carries it on
     to a different filter. */
  const negated = new Set<number>()
  const carried = new Set<number>()
  for (const cue of negationCues) {
    for (const { start, end } of findAll(text, cue)) {
      if (spans.some((span) => start < span.end && span.start < end)) continue

      const index = spans.findIndex((span) => span.start >= end && span.id)
      if (index === -1) continue
      if (!gap(end, spans[index].start).every((word) => bridge.has(word))) continue

      negated.add(index)
      let previous = index
      for (let next = index + 1; next < spans.length; next += 1) {
        if (!spans[next].id) continue
        const between = gap(spans[previous].end, spans[next].start)
        if (spans[next].id === spans[previous].id) {
          if (!between.every((word) => word === "or" || word === "and" || word === "nor")) break
        } else {
          const joined = between.join(" ")
          const connector = continuations.find(
            (item) => joined === item || joined.startsWith(`${item} `),
          )
          if (!connector) break
          if (!words(joined.slice(connector.length)).every((word) => bridge.has(word))) break
          carried.add(next)
        }
        negated.add(next)
        previous = next
      }
    }
  }

  const clauses = new Map<FilterId, Clause>()
  const notes: Note[] = []
  const read: ReadSpan[] = []
  let previous: { index: number; id: FilterId } | undefined

  spans.forEach((span, index) => {
    const phrase = raw.slice(map[span.start], map[span.end - 1] + 1)
    if (span.note) {
      const note = span.note
      if (!notes.some((known) => known.text === note)) notes.push({ phrase, text: note })
      return
    }
    if (!span.id) return

    const isNegated = negated.has(index)
    let clause = clauses.get(span.id)
    if (!clause) {
      // A lone `or` between two different filters is the one join the typed
      // words can set; everything else meets the query with `and`. A negation
      // carried across (`nor`, `or any`) excludes both, which is `and`.
      const between = previous ? gap(spans[previous.index].end, span.start) : []
      const link: FilterLink =
        previous && !carried.has(index) && between.includes("or") && !between.includes("and")
          ? "or"
          : "and"
      clause = {
        id: span.id,
        kept: [],
        negated: [],
        keptJoin: "or",
        negatedJoin: "or",
        link,
        first: span.start,
      }
      clauses.set(span.id, clause)
    } else if (previous?.id === span.id && span.values.length === 1) {
      // Two values of one filter joined by a bare `and` must both hold.
      const between = gap(spans[previous.index].end, span.start)
      if (between.includes("and") && !between.includes("or")) {
        if (isNegated) clause.negatedJoin = "and"
        else clause.keptJoin = "and"
      }
    }

    const bucket = isNegated ? clause.negated : clause.kept
    for (const value of span.values) if (!bucket.includes(value)) bucket.push(value)
    previous = { index, id: span.id }

    read.push({
      start: map[span.start],
      end: map[span.end - 1] + 1,
      text: phrase,
      id: span.id,
      value: span.values[0],
      values: span.values,
      negated: isNegated,
    })
  })

  // One clause per filter. Read both kept and negated, the kept values stand:
  // `small molecules but not peptides` is small molecules, and the peptides
  // are already outside it.
  let filters: (ResolvedFilter & { first: number })[] = [...clauses.values()].map((clause) => {
    const kept = clause.kept.length > 0
    const chosen = kept ? clause.kept : clause.negated
    const definition = definitionFor(clause.id)
    const ordered = definition.options.filter((option) => chosen.includes(option))
    return {
      id: clause.id,
      label: definition.label,
      values: ordered.length === chosen.length ? ordered : chosen,
      excluded: !kept,
      join: chosen.length > 1 ? (kept ? clause.keptJoin : clause.negatedJoin) : "or",
      link: clause.link,
      first: clause.first,
    }
  })

  // Clauses run in typing order, which is the order an `or` is read in. When
  // every clause is one of the authored five and all of them meet with `and`,
  // order changes nothing, so they keep the authored order the box has always
  // drawn them in.
  filters.sort((a, b) => a.first - b.first)
  const authored = filterDefinitions.map((definition) => definition.id)
  if (filters.every((filter) => authored.includes(filter.id) && filter.link === "and")) {
    filters = [...filters].sort((a, b) => authored.indexOf(a.id) - authored.indexOf(b.id))
  }
  const resolved: ResolvedFilter[] = filters.map((filter, index) => ({
    id: filter.id,
    label: filter.label,
    values: filter.values,
    excluded: filter.excluded,
    join: filter.join,
    // The first clause has nothing before it to join.
    link: index === 0 ? "and" : filter.link,
  }))

  /* Everything left over. Contiguous leftovers are grouped, so `boehringer
     ingelheim` is reported as one phrase rather than two mysteries. */
  const covered = (at: number) => spans.some((span) => at >= span.start && at < span.end)
  const unplaced: string[] = []
  let run: string[] = []
  const wordPattern = /[a-z0-9/]+/g
  let hit = wordPattern.exec(text)
  while (hit) {
    if (covered(hit.index) || stopwords.has(hit[0])) {
      if (run.length > 0) unplaced.push(run.join(" "))
      run = []
    } else {
      run.push(hit[0])
    }
    hit = wordPattern.exec(text)
  }
  if (run.length > 0) unplaced.push(run.join(" "))

  return {
    raw,
    ok: resolved.length > 0,
    filters: resolved,
    spans: read,
    unplaced: unplaced.filter((phrase) => phrase.length > 1),
    notes,
  }
}
