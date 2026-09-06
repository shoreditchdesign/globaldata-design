import { clauseTemplates, operatorWord, type Clause } from "@/flows/sprint-3/idea-3/data"

/**
 * Turning typed English into the sentence.
 *
 * **This is keyword matching, not a parser, and it does not pretend to be one.**
 * Every phrase it understands is written down below. What is being prototyped
 * is what happens once a query is understood — whether an editable sentence is
 * a trustworthy place to keep a query — so the reading step only has to be good
 * enough that a reviewer can type their own words instead of clicking a
 * suggestion, and honest about the words it could not place.
 *
 * Three things follow from that, and they are the whole design of this file:
 *
 * 1. Anything it cannot place is reported, never dropped in silence. Producing
 *    a confidently wrong query is the specific failure this direction cannot
 *    afford, so a term we do not know comes back as a term we do not know.
 * 2. Terms that name something real in the product but unbuilt here — an
 *    indication, a company, a date — get their own message, because "we do not
 *    do that yet" and "we did not understand you" are different answers.
 * 3. Every canonical value and every word the sentence itself uses is a
 *    pattern, so the prose `edit as text` hands back always reads again.
 */

/* -------------------------------------------------------------------------- */
/* Normalising                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Lowercase, punctuation to spaces, runs of spaces collapsed — with a map back
 * to the original string, so a match found in the normalised text can be shown
 * highlighted in the words the reviewer actually typed.
 *
 * `/` survives, because `phase 2/3` is one of the phrasings people type.
 */
function normalise(input: string) {
  const chars: string[] = []
  const map: number[] = []
  let space = true

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i].toLowerCase()
    if (/[a-z0-9/]/.test(char)) {
      chars.push(char)
      map.push(i)
      space = false
    } else if (!space) {
      chars.push(" ")
      map.push(i)
      space = true
    }
  }
  while (chars.length > 0 && chars[chars.length - 1] === " ") {
    chars.pop()
    map.pop()
  }

  return { text: chars.join(""), map }
}

/** The same normalisation, for the fixed side of a comparison. */
function plain(input: string) {
  return normalise(input).text
}

/* -------------------------------------------------------------------------- */
/* The map                                                                     */
/* -------------------------------------------------------------------------- */

interface Matcher {
  clauseId: string
  /** Canonical values this phrase selects. More than one for `phase 2/3`. */
  values: string[]
  patterns: string[]
  /** Guard against a phrase that means something else in context. */
  notAfter?: string
}

/**
 * Everything a value can be called beyond its canonical name and the word the
 * sentence prints for it. Informal, abbreviated and plural forms, because that
 * is what gets typed.
 */
const synonyms: Record<string, string[]> = {
  "drug-type:Generic": ["generics", "generic drugs"],
  "drug-type:Branded": ["brand", "brands", "branded drugs", "originator", "innovator"],
  "drug-type:Biosimilar": ["biosimilars"],
  "drug-type:Orphan": ["orphan drug", "orphan drugs", "orphans"],
  "drug-type:Over the Counter": ["otc", "over counter", "non prescription"],

  "descriptor:Antiinflammatory Therapy": [
    "anti inflammatory",
    "anti inflammatories",
    "antiinflammatories",
    "anti inflammatory drugs",
    "nsaid",
    "nsaids",
    "inflammation",
  ],
  "descriptor:Analgesic Therapy": ["analgesics", "painkiller", "painkillers", "pain relief"],
  "descriptor:Antipyretic Therapy": ["antipyretics", "fever"],
  "descriptor:Immunosuppressant Therapy": [
    "immunosuppressants",
    "immunosuppressive",
    "immuno suppressant",
  ],
  "descriptor:Antineoplastic Therapy": [
    "antineoplastics",
    "oncology",
    "oncology drugs",
    "cancer",
    "anti cancer",
    "anticancer",
    "tumour drugs",
  ],

  "target:Actin Gamma Enteric Smooth Muscle": ["actg2", "actin gamma", "actin gamma 2"],
  "target:Cyclooxygenase 2": ["cox 2", "cox2", "ptgs2"],
  "target:Cyclooxygenase 1": ["cox 1", "cox1", "ptgs1"],
  "target:Tumor Necrosis Factor": ["tnf", "tnf alpha", "tumour necrosis factor"],
  "target:Interleukin 6 Receptor": ["il 6", "il6", "interleukin 6", "il 6 receptor"],
  "target:Prostaglandin E Synthase": ["pges", "mpges 1", "prostaglandin e"],

  "geography:Austria": ["austrian"],
  "geography:Italy": ["italian"],
  "geography:Germany": ["german"],
  "geography:France": ["french"],
  "geography:Spain": ["spanish"],
  "geography:United States": ["usa", "u s", "united states", "america", "american"],
  "geography:Japan": ["japanese"],

  "stage:Phase I": ["phase 1", "phase one", "ph 1"],
  "stage:Phase II": ["phase 2", "phase two", "ph 2"],
  "stage:Phase III": ["phase 3", "phase three", "ph 3"],
  "stage:Preclinical": ["pre clinical"],
  "stage:Pre-registration": ["pre registration", "preregistration", "pre reg"],
  "stage:Marketed": ["on the market", "on market", "launched", "approved"],
  "stage:Withdrawn": ["pulled", "discontinued"],

  "route:Oral": ["oral", "by mouth", "tablets"],
  "route:Intravenous": ["iv", "infusion", "infused"],
  "route:Subcutaneous": ["sub cutaneous", "subcut", "sub q"],
  "route:Topical": ["topical", "cream", "gel"],
  "route:Inhaled": ["inhalation", "inhaler", "inhaled"],

  "molecule:Small Molecule": ["small molecule", "small molecules", "smallmolecule"],
  "molecule:Monoclonal Antibody": ["mab", "mabs", "monoclonals", "antibody", "antibodies"],
  "molecule:Peptide": ["peptides"],
  "molecule:Recombinant Protein": ["recombinant", "recombinant proteins"],
  "molecule:Oligonucleotide": ["oligonucleotides", "oligos", "antisense"],

  "mono:Mono": ["monotherapy", "mono therapy", "single agent"],
  "mono:Combination": ["combo", "combination therapy", "combinations"],

  "atc:M01A — Antiinflammatory and Antirheumatic, Non-Steroids": ["m01a"],
  "atc:M02A — Topical Products for Joint and Muscular Pain": ["m02a"],
  "atc:N02B — Other Analgesics and Antipyretics": ["n02b"],
  "atc:L04A — Immunosuppressants": ["l04a"],

  "application:Abbreviated New Drug Application": ["anda", "andas"],
  "application:New Drug Application": ["nda", "ndas"],
  "application:Biologics License Application": ["bla", "blas", "biologics licence application"],
  "application:Investigational New Drug": ["ind", "inds"],
}

/** Phrases that name more than one value at once. */
const compounds: Matcher[] = [
  {
    clauseId: "stage",
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
      "phase 2 3 trials",
      "late stage",
      "late phase",
    ],
  },
  {
    clauseId: "stage",
    values: ["Phase I", "Phase II"],
    patterns: [
      "phase 1/2",
      "phase i/ii",
      "phase 1 2",
      "phase 1 or 2",
      "phase i or ii",
      "phase 1 or phase 2",
    ],
  },
  {
    clauseId: "stage",
    values: ["Discovery", "Preclinical"],
    patterns: ["early stage", "discovery and preclinical", "preclinical and discovery"],
  },
]

/**
 * Words that mean something real in the product and nothing here. Reported
 * with a reason rather than as gibberish, because a reviewer who types a
 * company name deserves to be told Company is its own area, not that we did
 * not understand English.
 */
const unbuilt: { patterns: string[]; note: string }[] = [
  {
    patterns: [
      "rheumatoid arthritis",
      "osteoarthritis",
      "ankylosing spondylitis",
      "psoriasis",
      "psoriatic arthritis",
      "asthma",
      "copd",
      "diabetes",
      "migraine",
      "gout",
      "crohns",
      "crohn",
      "ulcerative colitis",
      "lupus",
      "indication",
      "indications",
      "therapy area",
      "therapeutic area",
    ],
    note: "Therapy Area and Indication are real attributes in the product — they are not wired into this prototype.",
  },
  {
    patterns: [
      "pfizer",
      "novartis",
      "roche",
      "boehringer",
      "boehringer ingelheim",
      "astrazeneca",
      "gsk",
      "glaxosmithkline",
      "merck",
      "sanofi",
      "novo nordisk",
      "abbvie",
      "eli lilly",
      "lilly",
      "bayer",
      "takeda",
      "amgen",
      "company",
      "companies",
      "manufacturer",
      "manufacturers",
    ],
    note: "Company is its own product area. It is not a condition in the Drugs screener.",
  },
  {
    patterns: [
      "last two years",
      "last 2 years",
      "last year",
      "last five years",
      "last 5 years",
      "this year",
      "since 2020",
      "since 2024",
      "2024",
      "2025",
      "2026",
      "recently",
    ],
    note: "There is no date condition in this prototype.",
  },
  {
    patterns: ["npv", "net present value", "forecast", "forecasts", "sales", "revenue"],
    note: "NPV and Sales and Forecast are separate product areas, not conditions on a drug.",
  },
  {
    patterns: ["licensing", "licensing opportunity", "licensing opportunities", "deals"],
    note: "Licensing Opportunities is a separate product area.",
  },
  {
    patterns: ["cas number", "cas", "gene therapy vector", "vector", "mechanism of action", "moa"],
    note: "That attribute exists in the product but has no values loaded in this prototype.",
  },
]

/** Grammar and filler — present in the words, absent from the query. */
const stopwords = new Set(
  (
    "a an the and or of in on at for with to from by that which who whom whose are is was were be " +
    "been being it its this these those there here as any all some show showing me my we our you " +
    "your i find get give list want need looking look please just only also plus with within " +
    "available drug drugs compound compounds product products " +
    "not no non excluding exclude except without other than outside minus never apart besides " +
    "targeting target targets taken take takes using used limited given filed classified under " +
    "administered delivered marketed sold across between over about into their they them one " +
    "results rows records set sets query search screen screener please thanks ok okay"
  ).split(" "),
)

/** Words that may sit between a negation cue and the value it negates. */
const bridge = new Set(
  (
    "available marketed sold in the a an of for from to and or drugs drug that are is be been " +
    "targeting target taken given filed classified under as limited only stage phase at on with " +
    "by any it them anything currently"
  ).split(" "),
)

const negationCues = [
  "not",
  "no",
  "non",
  "excluding",
  "exclude",
  "except",
  "without",
  "other than",
  "outside",
  "minus",
  "never",
  "apart from",
]

/** Every phrase the resolver knows, longest first so `phase 2/3` beats `phase 2`. */
const matchers: Matcher[] = buildMatchers()

function buildMatchers() {
  const built: Matcher[] = []

  for (const clause of clauseTemplates) {
    for (const option of clause.options) {
      const patterns = new Set<string>([plain(option.value), plain(option.term)])
      for (const synonym of synonyms[`${clause.id}:${option.value}`] ?? []) {
        patterns.add(plain(synonym))
      }
      // `an ANDA` is how the sentence prints it; `anda` is how it gets typed.
      for (const pattern of [...patterns]) {
        const stripped = pattern.replace(/^(?:an|a|the) /, "")
        if (stripped !== pattern) patterns.add(stripped)
      }
      built.push({
        clauseId: clause.id,
        values: [option.value],
        patterns: [...patterns].filter(Boolean),
        // `IV` is a route; `phase IV` is a stage that this prototype does not
        // carry, and reading it as intravenous would be a silent lie.
        notAfter: option.value === "Intravenous" ? "phase" : undefined,
      })
    }
  }

  return [...built, ...compounds]
}

/* -------------------------------------------------------------------------- */
/* Matching                                                                    */
/* -------------------------------------------------------------------------- */

function escape(pattern: string) {
  return pattern.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")
}

interface RawSpan {
  start: number
  end: number
  clauseId?: string
  values: string[]
  note?: string
}

function findAll(text: string, pattern: string) {
  const found: { start: number; end: number }[] = []
  const regex = new RegExp(`\\b${escape(pattern)}\\b`, "g")
  let hit = regex.exec(text)
  while (hit) {
    found.push({ start: hit.index, end: hit.index + hit[0].length })
    hit = regex.exec(text)
  }
  return found
}

/** Longest match wins, and nothing overlaps — so every word is read once. */
function pickSpans(text: string) {
  const candidates: RawSpan[] = []

  for (const matcher of matchers) {
    for (const pattern of matcher.patterns) {
      for (const { start, end } of findAll(text, pattern)) {
        if (matcher.notAfter) {
          const before = text.slice(0, start).trimEnd()
          if (before.endsWith(matcher.notAfter)) continue
        }
        candidates.push({ start, end, clauseId: matcher.clauseId, values: matcher.values })
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

  candidates.sort((a, b) => a.start - b.start || b.end - b.start - (a.end - a.start))

  const taken: RawSpan[] = []
  for (const candidate of candidates) {
    const clash = taken.some((span) => candidate.start < span.end && span.start < candidate.end)
    if (!clash) taken.push(candidate)
  }
  return taken.sort((a, b) => a.start - b.start)
}

/* -------------------------------------------------------------------------- */
/* Reading the result                                                          */
/* -------------------------------------------------------------------------- */

/** One phrase the resolver read, in the coordinates of the typed text. */
export interface ReadSpan {
  /** Index into the raw input. */
  start: number
  end: number
  /** The words as typed. */
  text: string
  clauseId: string
  attribute: string
  values: string[]
  negated: boolean
}

export interface Suggestion {
  /** The words we could not place. */
  phrase: string
  clauseId: string
  attribute: string
  value: string
}

export interface Resolution {
  /** The text this came from, as typed. */
  raw: string
  /** False when nothing at all could be placed — no query is produced. */
  ok: boolean
  clauses: Clause[]
  /** Everything read, in the order it was typed. Drives the resolve animation. */
  spans: ReadSpan[]
  /** Phrases that matched nothing, grouped as they were typed. */
  unplaced: string[]
  /** Nearest known value for something unplaced, offered rather than assumed. */
  suggestions: Suggestion[]
  /** Honest messages: attributes that are real in the product but not here. */
  notes: string[]
}

function levenshtein(a: string, b: string) {
  const previous = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i += 1) {
    let diagonal = previous[0]
    previous[0] = i
    for (let j = 1; j <= b.length; j += 1) {
      const carry = previous[j]
      previous[j] = Math.min(
        previous[j] + 1,
        previous[j - 1] + 1,
        diagonal + (a[i - 1] === b[j - 1] ? 0 : 1),
      )
      diagonal = carry
    }
  }
  return previous[b.length]
}

/**
 * The nearest thing we do know to something we do not. Deliberately offered as
 * a question rather than applied — a near miss silently corrected is exactly
 * the confidently-wrong query this direction has to avoid.
 */
function nearest(phrase: string): Suggestion | undefined {
  let best: { score: number; matcher: Matcher; value: string } | undefined

  for (const matcher of matchers) {
    for (const pattern of matcher.patterns) {
      if (pattern.length < 4 || phrase.length < 4) continue
      const distance = levenshtein(phrase, pattern)
      const score = 1 - distance / Math.max(phrase.length, pattern.length)
      const contained = pattern.includes(phrase) || phrase.includes(pattern)
      const weighted = contained ? Math.max(score, 0.8) : score
      if (weighted >= 0.68 && (!best || weighted > best.score)) {
        best = { score: weighted, matcher, value: matcher.values[0] }
      }
    }
  }

  if (!best) return undefined
  const found = best
  const clause = clauseTemplates.find((c) => c.id === found.matcher.clauseId)
  if (!clause) return undefined
  return { phrase, clauseId: clause.id, attribute: clause.attribute, value: found.value }
}

/* -------------------------------------------------------------------------- */
/* Resolve                                                                     */
/* -------------------------------------------------------------------------- */

export function resolveQuery(raw: string): Resolution {
  const { text, map } = normalise(raw)
  const empty: Resolution = {
    raw,
    ok: false,
    clauses: [],
    spans: [],
    unplaced: [],
    suggestions: [],
    notes: [],
  }
  if (text.length === 0) return empty

  const spans = pickSpans(text)

  /* Negation. A cue applies to the nearest phrase after it, and then to the
     phrases that follow while they belong to the same condition — so `not
     austria or italy oral` excludes two countries and leaves the route alone. */
  const negated = new Set<number>()
  for (const cue of negationCues) {
    for (const { start, end } of findAll(text, cue)) {
      const inside = spans.some((span) => start < span.end && span.start < end)
      if (inside) continue

      const index = spans.findIndex((span) => span.start >= end && span.clauseId)
      if (index === -1) continue

      const between = text.slice(end, spans[index].start).trim().split(" ").filter(Boolean)
      if (!between.every((word) => bridge.has(word))) continue

      negated.add(index)
      for (let i = index + 1; i < spans.length; i += 1) {
        if (spans[i].clauseId !== spans[index].clauseId) break
        const gap = text.slice(spans[i - 1].end, spans[i].start).trim().split(" ").filter(Boolean)
        if (!gap.every((word) => word === "or" || word === "and")) break
        negated.add(i)
      }
    }
  }

  /* Clauses, in the order the sentence reads them rather than the order they
     were typed — the sentence has a grammar and the input does not. */
  const chosen = new Map<string, { values: string[]; exclude: boolean }>()
  const notes: string[] = []
  const read: ReadSpan[] = []

  spans.forEach((span, index) => {
    if (span.note) {
      const phrase = raw.slice(map[span.start], map[span.end - 1] + 1)
      const message = `“${phrase}” — ${span.note}`
      if (!notes.includes(message)) notes.push(message)
      return
    }
    if (!span.clauseId) return

    const template = clauseTemplates.find((clause) => clause.id === span.clauseId)
    if (!template) return

    const isNegated = negated.has(index)
    if (isNegated && !template.operator) {
      const phrase = raw.slice(map[span.start], map[span.end - 1] + 1)
      notes.push(
        `“${phrase}” was read as a condition, but ${template.attribute} has no exclude in this prototype — it was kept as an include.`,
      )
    }

    const current = chosen.get(span.clauseId) ?? { values: [], exclude: false }
    for (const value of span.values) {
      if (!current.values.includes(value)) current.values.push(value)
    }
    current.exclude = current.exclude || (isNegated && Boolean(template.operator))
    chosen.set(span.clauseId, current)

    read.push({
      start: map[span.start],
      end: map[span.end - 1] + 1,
      text: raw.slice(map[span.start], map[span.end - 1] + 1),
      clauseId: span.clauseId,
      attribute: template.attribute,
      values: span.values,
      negated: isNegated,
    })
  })

  const clauses: Clause[] = clauseTemplates
    .filter((template) => chosen.has(template.id))
    .map((template) => {
      const picked = chosen.get(template.id)!
      const mode = picked.exclude ? "exclude" : "include"
      const word = operatorWord(template, mode)
      return {
        ...template,
        // Clause order, not typing order — the sentence stays readable however
        // the request was phrased.
        selected: template.options
          .filter((option) => picked.values.includes(option.value))
          .map((option) => option.value),
        operator:
          template.operator && word
            ? { ...template.operator, selected: word }
            : template.operator,
      }
    })

  /* Everything left over. Contiguous leftovers are grouped, so `boehringer
     ingelheim` is reported as one phrase rather than two mysteries. */
  const covered = (index: number) => spans.some((span) => index >= span.start && index < span.end)
  const words: { word: string; start: number }[] = []
  const wordRegex = /[a-z0-9/]+/g
  let hit = wordRegex.exec(text)
  while (hit) {
    words.push({ word: hit[0], start: hit.index })
    hit = wordRegex.exec(text)
  }

  const unplaced: string[] = []
  let run: string[] = []
  words.forEach((entry, i) => {
    const skip = covered(entry.start) || stopwords.has(entry.word)
    if (skip) {
      if (run.length > 0) unplaced.push(run.join(" "))
      run = []
      return
    }
    run.push(entry.word)
    if (i === words.length - 1 && run.length > 0) unplaced.push(run.join(" "))
  })

  const phrases = unplaced.filter((phrase) => phrase.length > 1)
  const suggestions: Suggestion[] = []
  for (const phrase of phrases) {
    const suggestion = nearest(phrase)
    if (suggestion && !suggestions.some((s) => s.value === suggestion.value)) {
      suggestions.push(suggestion)
    }
  }

  return {
    raw,
    ok: clauses.length > 0,
    clauses,
    spans: read,
    unplaced: phrases,
    suggestions,
    notes,
  }
}

/** The attributes a reviewer can actually ask for, for the failure state. */
export const knownAttributes = clauseTemplates.map((clause) => clause.attribute)
