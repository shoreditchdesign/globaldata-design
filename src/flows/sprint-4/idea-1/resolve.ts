import {
  filterDefinitions,
  type FilterId,
  type ResolvedFilter,
} from "@/flows/sprint-4/idea-1/data"

interface Matcher {
  id: FilterId
  value: string
  patterns: string[]
}

export interface ReadSpan {
  start: number
  end: number
  text: string
  id: FilterId
  value: string
}

export interface Resolution {
  raw: string
  ok: boolean
  filters: ResolvedFilter[]
  spans: ReadSpan[]
}

const synonyms: Partial<Record<`${FilterId}:${string}`, string[]>> = {
  "target:Actin Gamma Enteric Smooth Muscle": ["actg2", "actin gamma", "actin gamma 2"],
  "target:Cyclooxygenase 2": ["cox 2", "cox2", "ptgs2"],
  "target:Cyclooxygenase 1": ["cox 1", "cox1", "ptgs1"],
  "target:Interleukin 17A": ["il 17", "il17", "interleukin 17"],
  "drug-type:Generic": ["generics", "generic drug", "generic drugs"],
  "drug-type:Branded": ["brand", "brands", "branded drug", "branded drugs"],
  "drug-type:Biosimilar": ["biosimilars"],
  "drug-type:Orphan": ["orphan drug", "orphan drugs"],
  "descriptor:Antiinflammatory Therapy": [
    "anti inflammatory",
    "anti inflammatories",
    "antiinflammatories",
    "anti inflammatory drugs",
    "nsaid",
    "nsaids",
  ],
  "descriptor:Immunosuppressant Therapy": ["immunosuppressants", "immunosuppressive"],
  "descriptor:Antiviral Therapy": ["antiviral", "antivirals"],
  "descriptor:Antidiabetic Therapy": ["antidiabetic", "antidiabetics", "diabetes"],
  "stage:Marketed": ["on the market", "launched", "approved"],
  "stage:Pipeline": ["in development"],
  "stage:Withdrawn (Marketed)": ["withdrawn", "pulled"],
  "stage:Archived (Marketed)": ["archived", "discontinued"],
  "geography:Austria": ["austrian"],
  "geography:Italy": ["italian"],
  "geography:Germany": ["german"],
  "geography:France": ["french"],
  "geography:United Kingdom": ["uk", "u k", "britain", "british"],
  "geography:United States": ["us", "u s", "usa", "america", "american"],
}

function normalise(input: string) {
  const chars: string[] = []
  const map: number[] = []
  let space = true

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index].toLowerCase()
    if (/[a-z0-9]/.test(character)) {
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

function escape(pattern: string) {
  return pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
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

const matchers: Matcher[] = filterDefinitions.flatMap((definition) =>
  definition.options.map((value) => ({
    id: definition.id,
    value,
    patterns: [plain(value), ...(synonyms[`${definition.id}:${value}`] ?? []).map(plain)],
  })),
)

const negationCues = ["exclude", "excluding", "not", "without", "except", "outside"]

/**
 * A local, deliberately bounded version of Sprint 3 Idea 3's resolver. It
 * matches the S4I1 vocabulary, keeps original character positions for the
 * scan animation, and never creates a filter for language it did not read.
 */
export function resolveQuery(raw: string): Resolution {
  const { text, map } = normalise(raw)
  if (!text) return { raw, ok: false, filters: [], spans: [] }

  const candidates = matchers.flatMap((matcher) =>
    matcher.patterns.flatMap((pattern) =>
      findAll(text, pattern).map(({ start, end }) => ({ ...matcher, start, end })),
    ),
  )

  candidates.sort((a, b) => a.start - b.start || b.end - b.start - (a.end - a.start))

  const picked: typeof candidates = []
  for (const candidate of candidates) {
    const overlaps = picked.some(
      (span) => candidate.start < span.end && span.start < candidate.end,
    )
    if (overlaps) continue

    // In "marketed drugs that are withdrawn or archived", marketed qualifies
    // the two terminal states; it is not a third selected stage.
    if (
      candidate.id === "stage" &&
      candidate.value === "Marketed" &&
      /\b(withdrawn|archived|discontinued)\b/.test(text.slice(candidate.end, candidate.end + 48))
    ) {
      continue
    }

    picked.push(candidate)
  }

  const cueEnds = negationCues.flatMap((cue) => findAll(text, cue).map((span) => span.end))
  const firstNegatedPhrase = picked.findIndex((span) => cueEnds.some((end) => end < span.start))
  const chosen = new Map<FilterId, { values: string[]; excluded: boolean; join: "or" | "and" }>()

  picked.forEach((span, index) => {
    const current = chosen.get(span.id) ?? { values: [], excluded: false, join: "or" as const }
    if (!current.values.includes(span.value)) current.values.push(span.value)

    // A negation starts at the first recognised phrase after its cue and
    // carries through the remainder of that request. This reads the supplied
    // "exclude Austria or Italy, as well as ... withdrawn or archived" as two
    // excluded categories instead of silently dropping the second one.
    current.excluded = current.excluded || (firstNegatedPhrase >= 0 && index >= firstNegatedPhrase)

    const previous = [...picked].slice(0, index).reverse().find((item) => item.id === span.id)
    if (previous) {
      const bridge = text.slice(previous.end, span.start)
      if (/\band\b/.test(bridge) && !/\bor\b/.test(bridge)) current.join = "and"
    }
    chosen.set(span.id, current)
  })

  const filters = filterDefinitions
    .filter((definition) => chosen.has(definition.id))
    .map((definition) => {
      const selection = chosen.get(definition.id)!
      return {
        id: definition.id,
        label: definition.label,
        values: definition.options.filter((value) => selection.values.includes(value)),
        excluded: selection.excluded,
        join: selection.join,
        link: "and" as const,
      }
    })

  const spans: ReadSpan[] = picked.map((span) => ({
    start: map[span.start],
    end: map[span.end - 1] + 1,
    text: raw.slice(map[span.start], map[span.end - 1] + 1),
    id: span.id,
    value: span.value,
  }))

  return { raw, ok: filters.length > 0, filters, spans }
}
