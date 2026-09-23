import {
  attributeDefs,
  childrenByValue,
  drugAttributeOrder,
  valuesByAttribute,
  type Condition,
} from "@/flows/sprint-4/idea-2b/data"
import { attributeHeadings } from "@/flows/sprint-4/idea-2b/grammar"

/**
 * Turning typed English into the query.
 *
 * Copied from the Sprint 4 hybrid screener (commit ae56cf1), which lifted it
 * from Sprint 3 Idea 3 and pointed it at Sprint 3 Idea 2's taxonomy, so a typed phrase lands on the same labels a value
 * picker ticks.
 *
 * **This is keyword matching, not a parser, and it does not pretend to be one.**
 * Every phrase it understands is written down below or is a label in the
 * taxonomy. Three rules carry over unchanged:
 *
 * 1. Anything it cannot place is reported, never dropped in silence.
 * 2. Terms that name something real in the product but unbuilt here — a
 *    company, a date, NPV — get their own message, because "we do not do that
 *    yet" and "we did not understand you" are different answers.
 * 3. Every label and every operator word the sentence prints is readable, so
 *    the prose `Edit` hands back resolves to the same query.
 */

/* -------------------------------------------------------------------------- */
/* Normalising                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Lowercase, punctuation to spaces, runs of spaces collapsed — with a map back
 * to the original string, so a match can be highlighted in the words as typed.
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

function plain(input: string) {
  return normalise(input).text
}

/* -------------------------------------------------------------------------- */
/* The map                                                                     */
/* -------------------------------------------------------------------------- */

interface Matcher {
  attribute: string
  values: string[]
  patterns: string[]
  /** Words that, immediately before this phrase, mean it is not this value. */
  notAfter?: string[]
}

/** Informal, abbreviated and plural forms, keyed `attribute:label`. */
const synonyms: Record<string, string[]> = {
  "Therapy Area / Indication:Dermatology": ["dermatological", "skin", "skin disease"],
  "Therapy Area / Indication:Musculoskeletal Disorders": ["musculoskeletal"],
  "Therapy Area / Indication:Infectious Disease": ["infectious diseases", "infection", "infections"],
  "Therapy Area / Indication:Cardiovascular": ["cardiology", "cardiac", "heart"],
  "Therapy Area / Indication:Metabolic Disorders": ["metabolic"],
  "Therapy Area / Indication:Central Nervous System": ["cns", "neurology"],
  "Therapy Area / Indication:Immunology": ["immune", "autoimmune"],
  "Therapy Area / Indication:Gastrointestinal": ["gi", "gastro"],
  "Therapy Area / Indication:Plaque Psoriasis": ["psoriasis"],
  "Therapy Area / Indication:Atopic Dermatitis": ["eczema", "dermatitis"],
  "Therapy Area / Indication:Type 2 Diabetes": ["diabetes", "t2d", "type ii diabetes"],
  "Therapy Area / Indication:HIV Infection": ["hiv"],
  "Therapy Area / Indication:Crohn's Disease": ["crohns", "crohn"],
  "Therapy Area / Indication:Alzheimer's Disease": ["alzheimers", "alzheimer"],
  "Therapy Area / Indication:Parkinson's Disease": ["parkinsons", "parkinson"],
  "Therapy Area / Indication:COVID-19": ["covid"],

  "Development Stage:Phase I": ["phase 1", "phase one", "ph 1"],
  "Development Stage:Phase II": ["phase 2", "phase two", "ph 2"],
  "Development Stage:Phase III": ["phase 3", "phase three", "ph 3"],
  "Development Stage:Phase IV": ["phase 4", "phase four"],
  "Development Stage:Preclinical": ["pre clinical"],
  "Development Stage:Pre-registration": ["preregistration", "pre reg"],
  "Development Stage:Marketed": ["on the market", "on market", "launched"],
  "Development Stage:Withdrawn": ["pulled"],

  "Drug Geography:Europe": ["european", "eu"],
  "Drug Geography:North America": ["north american"],
  "Drug Geography:Asia-Pacific": ["asia", "apac", "asia pacific"],
  "Drug Geography:Latin America": ["latam", "south america"],
  "Drug Geography:Austria": ["austrian"],
  "Drug Geography:Italy": ["italian"],
  "Drug Geography:Germany": ["german"],
  "Drug Geography:France": ["french"],
  "Drug Geography:Spain": ["spanish"],
  "Drug Geography:United Kingdom": ["uk", "britain", "british"],
  "Drug Geography:United States": ["us", "usa", "america", "american"],
  "Drug Geography:Japan": ["japanese"],
  "Drug Geography:China": ["chinese"],

  "Route of Administration:Oral": ["orally", "by mouth", "tablet", "tablets"],
  "Route of Administration:Intravenous": ["iv", "intravenously", "infusion", "infused"],
  "Route of Administration:Subcutaneous": ["subcutaneously", "subcut", "sub q"],
  "Route of Administration:Topical": ["topically", "cream", "gel"],
  "Route of Administration:Inhaled": ["inhalation", "inhaler"],

  "Molecule Type:Small Molecule": ["small molecules"],
  "Molecule Type:Monoclonal Antibody": ["mab", "mabs", "monoclonal antibodies", "monoclonals", "antibody", "antibodies"],
  "Molecule Type:Peptide": ["peptides"],
  "Molecule Type:Recombinant Protein": ["recombinant", "recombinant proteins"],
  "Molecule Type:Oligonucleotide": ["oligonucleotides", "antisense"],
  "Molecule Type:Cell Therapy": ["cell therapies"],
  "Molecule Type:Gene Therapy": ["gene therapies"],

  "Drug Descriptor:Antiinflammatory Therapy": [
    "anti inflammatory",
    "anti inflammatories",
    "antiinflammatory",
    "antiinflammatories",
    "nsaid",
    "nsaids",
  ],
  "Drug Descriptor:Immunosuppressant Therapy": ["immunosuppressant", "immunosuppressants", "immunosuppressive"],
  "Drug Descriptor:Analgesic Therapy": ["analgesic", "analgesics", "painkiller", "painkillers"],
  "Drug Descriptor:Antiinfective Therapy": ["antiinfective", "antiinfectives", "anti infective", "anti infectives", "antibiotic", "antibiotics"],
  "Drug Descriptor:Antineoplastic Therapy": ["antineoplastic", "antineoplastics", "oncology", "cancer", "anticancer"],
  "Drug Descriptor:Antihypertensive Therapy": ["antihypertensive", "antihypertensives"],
  "Drug Descriptor:Antidiabetic Therapy": ["antidiabetic", "antidiabetics"],
  "Drug Descriptor:Lipid Regulator Therapy": ["lipid regulator", "lipid regulators", "statin", "statins"],
  "Drug Descriptor:Antithrombotic Therapy": ["antithrombotic", "antithrombotics", "anticoagulant", "anticoagulants"],
  "Drug Descriptor:Neuromodulator Therapy": ["neuromodulator", "neuromodulators"],

  "Target:Tumour Necrosis Factor": ["tnf", "tnf alpha", "tumor necrosis factor"],
  "Target:Interleukin 23": ["il 23", "il23"],
  "Target:Interleukin 17A": ["il 17", "il17", "il 17a"],
  "Target:Janus Kinase 1": ["jak1", "jak 1"],
  "Target:Cyclooxygenase 2": ["cox 2", "cox2"],
  "Target:Interleukin 6 Receptor": ["il 6", "il6"],
  "Target:Phosphodiesterase 4": ["pde4", "pde 4"],
  "Target:Glucagon Like Peptide 1 Receptor": ["glp 1", "glp1"],
  "Target:Sodium Glucose Cotransporter 2": ["sglt2", "sglt 2"],

  "Mechanism of Action:Janus Kinase Inhibitor": ["jak inhibitor", "jak inhibitors"],
  "Mechanism of Action:GLP-1 Receptor Agonist": ["glp 1 agonist", "glp 1 agonists"],
  "Mechanism of Action:SGLT2 Inhibitor": ["sglt2 inhibitors"],
  "Mechanism of Action:Cyclooxygenase 2 Inhibitor": ["cox 2 inhibitor", "cox2 inhibitor"],
  "Mechanism of Action:Phosphodiesterase 4 Inhibitor": ["pde4 inhibitor", "pde 4 inhibitor"],
  "Mechanism of Action:Interleukin 23 Inhibitor": ["il 23 inhibitor", "il23 inhibitor"],
  "Mechanism of Action:Interleukin 17A Inhibitor": ["il 17a inhibitor"],
  "Mechanism of Action:Tumour Necrosis Factor Alpha Inhibitor": [
    "tnf inhibitor",
    "tnf alpha inhibitor",
    "anti tnf",
  ],

  "Drug Type:New Molecular Entity": ["nme", "nmes", "new molecular entities"],
  "Drug Type:Generic": ["generics"],
  "Drug Type:Biosimilar": ["biosimilars"],

  "Mono/Combination Drug:Mono": ["monotherapy", "single agent"],
  "Mono/Combination Drug:Combination": ["combination therapy", "combo"],

  "Application Type:NDA": ["new drug application"],
  "Application Type:BLA": ["biologics license application"],
  "Application Type:ANDA": ["abbreviated new drug application"],
  "Application Type:IND": ["investigational new drug"],
}

/**
 * Families: a phrase that names a group of values rather than one of them.
 *
 * The taxonomy carries the numbered variants, and people type the bare
 * protein. `Janus Kinase 1` is a value; `Janus Kinase` is what a reviewer
 * writes, and the family is what they mean — every JAK in the list, which is
 * also every drug carrying the Janus Kinase Inhibitor mechanism, since a
 * target implies its mechanism in the sample. `a receptor-based mechanism`
 * works the same way one level up, over the mechanisms rather than the
 * targets. The numbered form still wins where it is typed, because the longer
 * match is taken first.
 */
const families: Matcher[] = [
  {
    attribute: "Target",
    values: ["Janus Kinase 1", "Janus Kinase 2", "Janus Kinase 3"],
    patterns: ["janus kinase", "jak", "jak family"],
  },
  { attribute: "Target", values: ["Interleukin 17A"], patterns: ["interleukin 17"] },
  { attribute: "Target", values: ["Interleukin 6 Receptor"], patterns: ["interleukin 6"] },
  { attribute: "Target", values: ["Interleukin 4 Receptor"], patterns: ["interleukin 4"] },
  { attribute: "Target", values: ["Cyclooxygenase 2"], patterns: ["cyclooxygenase", "cox"] },
  { attribute: "Target", values: ["Phosphodiesterase 4"], patterns: ["phosphodiesterase", "pde"] },
  { attribute: "Target", values: ["Endothelin Receptor A"], patterns: ["endothelin"] },
  { attribute: "Target", values: ["Angiotensin II Receptor"], patterns: ["angiotensin"] },
  { attribute: "Target", values: ["Dipeptidyl Peptidase 4"], patterns: ["dipeptidyl peptidase"] },
  { attribute: "Target", values: ["Sodium Glucose Cotransporter 2"], patterns: ["sglt"] },
  /* The same families said as a mechanism rather than as a target. Longer than
     the bare protein, so `phosphodiesterase inhibitors` lands here and
     `phosphodiesterase` on its own lands above. */
  {
    attribute: "Mechanism of Action",
    values: ["Phosphodiesterase 4 Inhibitor"],
    patterns: ["phosphodiesterase inhibitor", "pde inhibitor"],
  },
  {
    attribute: "Mechanism of Action",
    values: ["Cyclooxygenase 2 Inhibitor"],
    patterns: ["cyclooxygenase inhibitor", "cox inhibitor"],
  },
  {
    attribute: "Mechanism of Action",
    values: ["Interleukin 17A Inhibitor"],
    patterns: ["interleukin 17 inhibitor", "il 17 inhibitor"],
  },
  {
    attribute: "Mechanism of Action",
    values: receptorMechanisms(),
    patterns: [
      "receptor based mechanism",
      "receptor based",
      "receptor mechanism",
      "receptor agonist",
      "receptor antagonist",
      "receptor modulator",
      "receptor blocker",
    ],
  },
]

/**
 * Every mechanism in the taxonomy that acts at a receptor, read off the
 * taxonomy rather than listed here, so a mechanism added later joins the
 * family without anyone remembering to add it twice. `Adrenoceptor` is one
 * too — the word just does not carry the prefix.
 *
 * The bare word `receptor` is deliberately not a pattern of its own: it sits
 * inside `Interleukin 6 Receptor` and a dozen other labels, and a phrase that
 * has already been read as a target must not be read again as a mechanism.
 */
function receptorMechanisms() {
  return (valuesByAttribute["Mechanism of Action"] ?? [])
    .map((item) => item.label)
    .filter((label) => /receptor|adrenoceptor/i.test(label))
}

/** Phrases that name more than one value at once. */
const compounds: Matcher[] = [
  {
    attribute: "Development Stage",
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
    attribute: "Development Stage",
    values: ["Phase II", "Phase III", "Phase IV"],
    patterns: ["phase ii or later", "phase 2 or later", "phase ii plus", "phase 2 plus", "late stage"],
  },
  {
    attribute: "Development Stage",
    values: ["Phase I", "Phase II"],
    patterns: ["phase 1/2", "phase i/ii", "phase 1 2", "phase 1 or 2", "phase i or ii"],
  },
  {
    attribute: "Development Stage",
    values: ["Discovery", "Preclinical"],
    patterns: ["early stage"],
  },
]

/**
 * Words that mean something real in the product and nothing here. Reported
 * with a reason rather than as gibberish.
 */
const unbuilt: { patterns: string[]; note: string }[] = [
  {
    patterns: [
      "pfizer", "novartis", "roche", "boehringer", "boehringer ingelheim", "astrazeneca",
      "sanofi", "bayer", "gsk", "merck", "abbvie", "lilly", "takeda", "amgen",
      "company", "companies", "manufacturer", "manufacturers",
    ],
    note: "Company is its own product area. It is not a condition in the Drugs screener.",
  },
  {
    patterns: [
      "last two years", "last 2 years", "last year", "this year", "since 2020", "since 2024",
      "2024", "2025", "2026", "recently",
    ],
    note: "There is no date condition in this prototype.",
  },
  {
    patterns: ["npv", "net present value", "forecast", "forecasts", "sales", "revenue"],
    note: "NPV and Sales and Forecast are separate product areas, not conditions on a drug.",
  },
  {
    patterns: ["cas number", "cas", "drug name"],
    note: "That attribute is free text in the product, with no value list to match against.",
  },
]

/** Grammar, filler and the sentence's own operator words. */
const stopwords = new Set(
  (
    "a an the and or of in on at for with to from by that which who are is was were be been being " +
    "it its this these those there here as any all some show showing me my we our you your i find " +
    "get give list want need looking look please just only also plus within available drug drugs " +
    "compound compounds product products not no non excluding exclude except without other than " +
    "outside minus never apart besides targeting target targets taken take using used given filed " +
    "classed classified under via administered delivered marketed sold made acting described typed " +
    "work works working act acts against hit hits block blocks blocking mechanism mechanisms " +
    "developed develops develop receptor receptors " +
    "whose type route molecule stage phase geography therapy area indication attribute " +
    "results query search screen screener thanks ok but"
  ).split(" "),
)

/** Words that may sit between a negation cue and the value it negates. */
const bridge = new Set(
  (
    "available marketed sold in the a an of for from to drugs drug that are is be been targeting " +
    "target taken given filed classified classed under as made acting described typed delivered via " +
    "by any currently with"
  ).split(" "),
)

const negationCues = [
  "not", "no", "non", "excluding", "exclude", "except", "without", "other than", "outside", "minus",
]

/**
 * Phrases that are only this value in the right company. `IV` is a route, but
 * `phase IV` is a stage; `us` is a country, but `show us` is a pronoun.
 */
const guards: Record<string, string[]> = {
  "Route of Administration:Intravenous": ["phase"],
  "Drug Geography:United States": ["give", "show", "tell", "let", "get", "send"],
}

const matchers: Matcher[] = buildMatchers()

function buildMatchers() {
  const built: Matcher[] = []
  // First claim wins. `Genito Urinary System` is a therapy area and, behind a
  // letter, an ATC class; the attribute order decides which one the bare phrase
  // means, and the longer ATC form still reads as ATC.
  const claimed = new Set<string>()

  for (const attribute of drugAttributeOrder) {
    if (!attributeDefs[attribute]) continue
    const labels = new Set<string>()
    for (const item of valuesByAttribute[attribute] ?? []) {
      labels.add(item.label)
      for (const child of childrenByValue[item.label] ?? []) labels.add(child.label)
    }

    for (const label of labels) {
      const patterns = new Set<string>([plain(label)])
      // `D — Dermatologicals` is typed as `dermatologicals`.
      const dashed = label.split(" — ")[1]
      if (dashed) patterns.add(plain(dashed))
      for (const synonym of synonyms[`${attribute}:${label}`] ?? []) patterns.add(plain(synonym))

      const own = [...patterns].filter((pattern) => pattern && !claimed.has(pattern))
      own.forEach((pattern) => claimed.add(pattern))
      if (own.length === 0) continue

      const existing = built.find(
        (matcher) => matcher.attribute === attribute && matcher.values[0] === label,
      )
      if (existing) existing.patterns.push(...own)
      else
        built.push({
          attribute,
          values: [label],
          patterns: own,
          notAfter: guards[`${attribute}:${label}`],
        })
    }
  }

  const all = [...built, ...families, ...compounds].map((matcher) => ({
    ...matcher,
    patterns: [...matcher.patterns],
  }))
  return withPlurals(all)
}

/**
 * People type `jak inhibitors` and `gene therapies`, not the singular label.
 * Every pattern brings its own `s` along, unless that plural is already some
 * other matcher's word — first claim wins there too, as it does above.
 */
function withPlurals(built: Matcher[]) {
  const known = new Set(built.flatMap((matcher) => matcher.patterns))
  for (const matcher of built) {
    for (const pattern of [...matcher.patterns]) {
      const plural = `${pattern}s`
      if (pattern.endsWith("s") || known.has(plural)) continue
      known.add(plural)
      matcher.patterns.push(plural)
    }
  }
  return built
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
  attribute?: string
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
          if (matcher.notAfter.some((word) => before.endsWith(word))) continue
        }
        candidates.push({ start, end, attribute: matcher.attribute, values: matcher.values })
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

  /* The attribute names the sentence prints. Read as grammar, the way `is` and
     `not` are: a heading carries no attribute and no note, so it is neither a
     condition nor something the resolver failed to place. Longest match wins
     below, which is what keeps `Gene Therapy Vector` off Molecule Type and
     `Mono/Combination Drug` off both of its own values. */
  for (const heading of attributeHeadings) {
    for (const { start, end } of findAll(text, plain(heading))) {
      candidates.push({ start, end, values: [] })
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
  start: number
  end: number
  text: string
  attribute: string
  values: string[]
  negated: boolean
}

export interface Suggestion {
  /** The words it could not place. */
  phrase: string
  attribute: string
  value: string
}

export interface Resolution {
  raw: string
  /** False when nothing at all could be placed — no query is produced. */
  ok: boolean
  conditions: Condition[]
  /** Everything read, in typing order. Drives the resolve animation. */
  spans: ReadSpan[]
  /** Phrases that matched nothing, grouped as they were typed. */
  unplaced: string[]
  /** Nearest known value for something unplaced, offered rather than assumed. */
  suggestions: Suggestion[]
  /** Attributes that are real in the product but not here, with the words that asked for them. */
  notes: Note[]
}

/** Something the reviewer typed that names a real attribute this screener does not carry. */
export interface Note {
  phrase: string
  text: string
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

/** The nearest thing it does know to something it does not — offered, never applied. */
function nearest(phrase: string): Suggestion | undefined {
  let best: { score: number; matcher: Matcher } | undefined

  for (const matcher of matchers) {
    for (const pattern of matcher.patterns) {
      if (pattern.length < 4 || phrase.length < 4) continue
      const distance = levenshtein(phrase, pattern)
      const score = 1 - distance / Math.max(phrase.length, pattern.length)
      const contained = pattern.includes(phrase) || phrase.includes(pattern)
      const weighted = contained ? Math.max(score, 0.8) : score
      if (weighted >= 0.68 && (!best || weighted > best.score)) {
        best = { score: weighted, matcher }
      }
    }
  }

  if (!best) return undefined
  return { phrase, attribute: best.matcher.attribute, value: best.matcher.values[0] }
}

const words = (text: string) => text.trim().split(" ").filter(Boolean)

/* -------------------------------------------------------------------------- */
/* Resolve                                                                     */
/* -------------------------------------------------------------------------- */

export function resolveQuery(raw: string): Resolution {
  const { text, map } = normalise(raw)
  const empty: Resolution = {
    raw,
    ok: false,
    conditions: [],
    spans: [],
    unplaced: [],
    suggestions: [],
    notes: [],
  }
  if (text.length === 0) return empty

  const spans = pickSpans(text)

  /* Negation. A cue applies to the nearest phrase after it, and to the phrases
     that follow while they belong to the same attribute — so `not austria or
     italy oral` excludes two countries and leaves the route alone. */
  const negated = new Set<number>()
  for (const cue of negationCues) {
    for (const { start, end } of findAll(text, cue)) {
      if (spans.some((span) => start < span.end && span.start < end)) continue

      const index = spans.findIndex((span) => span.start >= end && span.attribute)
      if (index === -1) continue
      if (!words(text.slice(end, spans[index].start)).every((word) => bridge.has(word))) continue

      negated.add(index)
      for (let i = index + 1; i < spans.length; i += 1) {
        if (spans[i].attribute !== spans[index].attribute) break
        const gap = words(text.slice(spans[i - 1].end, spans[i].start))
        if (!gap.every((word) => word === "or" || word === "and")) break
        negated.add(i)
      }
    }
  }

  // Keyed by attribute *and* polarity: `small molecules but not peptides` is one
  // attribute kept and dropped in the same breath, which is two conditions.
  const chosen = new Map<string, { attribute: string; values: string[]; exclude: boolean; link: "and" | "or" }>()
  const notes: Note[] = []
  const read: ReadSpan[] = []
  let previousAttribute: string | undefined
  let previousEnd = 0

  spans.forEach((span, index) => {
    const phrase = raw.slice(map[span.start], map[span.end - 1] + 1)
    if (span.note) {
      const note = span.note
      if (!notes.some((known) => known.phrase === phrase && known.text === note)) notes.push({ phrase, text: note })
      return
    }
    if (!span.attribute) return

    const isNegated = negated.has(index)
    const key = `${span.attribute}|${isNegated ? "not" : "is"}`
    let current = chosen.get(key)
    if (!current) {
      // A lone `or` between two different attributes is the one join the
      // typed words can set; everything else meets the query with `and`.
      const gap = words(text.slice(previousEnd, span.start))
      const link = previousAttribute && gap.includes("or") && !gap.includes("and") ? "or" : "and"
      current = { attribute: span.attribute, values: [], exclude: isNegated, link }
      chosen.set(key, current)
    }
    for (const value of span.values) {
      if (!current.values.includes(value)) current.values.push(value)
    }
    previousAttribute = span.attribute
    previousEnd = span.end

    read.push({
      start: map[span.start],
      end: map[span.end - 1] + 1,
      text: phrase,
      attribute: span.attribute,
      values: span.values,
      negated: isNegated,
    })
  })

  /* Conditions in the order they were typed, which is the order the logic gate
     evaluates them — reordering would change what an `or` means. */
  const conditions: Condition[] = [...chosen.values()].map((picked) => ({
    id: picked.exclude ? `${picked.attribute}~not` : picked.attribute,
    attribute: picked.attribute,
    values: picked.values,
    join: "or",
    mode: picked.exclude ? "is not" : "is",
    link: picked.link,
  }))

  /* Everything left over. Contiguous leftovers are grouped, so `boehringer
     ingelheim` is reported as one phrase rather than two mysteries. */
  const covered = (i: number) => spans.some((span) => i >= span.start && i < span.end)
  const tokens: { word: string; start: number }[] = []
  const wordRegex = /[a-z0-9/]+/g
  let hit = wordRegex.exec(text)
  while (hit) {
    tokens.push({ word: hit[0], start: hit.index })
    hit = wordRegex.exec(text)
  }

  const unplaced: string[] = []
  let run: string[] = []
  tokens.forEach((entry, i) => {
    if (covered(entry.start) || stopwords.has(entry.word)) {
      if (run.length > 0) unplaced.push(run.join(" "))
      run = []
      return
    }
    run.push(entry.word)
    if (i === tokens.length - 1) unplaced.push(run.join(" "))
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
    ok: conditions.length > 0,
    conditions,
    spans: read,
    unplaced: phrases,
    suggestions,
    notes,
  }
}

/** The attributes a reviewer can ask for, for the failure state. */
export const knownAttributes = drugAttributeOrder.filter((attribute) => attributeDefs[attribute])
