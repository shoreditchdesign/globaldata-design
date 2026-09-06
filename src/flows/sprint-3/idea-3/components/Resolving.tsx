"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import {
  motion,
  resolveMarks,
  staggerDelay,
  useStagedSequence,
} from "@/components/prototype/motion"
import { QuerySentence } from "@/flows/sprint-3/idea-3/components/QuerySentence"
import type { Resolution } from "@/flows/sprint-3/idea-3/resolve"

const noop = () => {}
const inert = {
  onToggleValue: noop,
  onSetOperator: noop,
  onSetJoin: noop,
  onRemoveClause: noop,
  onAddClause: noop,
}

/**
 * The moment between what was typed and what it means.
 *
 * This is the pitch, so it is deliberately not a spinner: the reviewer's own
 * words stay on screen, the phrases the system recognised light up one after
 * another, those phrases harden into pills, and the words that carried no
 * conditions fade back. Then the line reflows into the sentence's own grammar.
 *
 * Nothing is being computed during it — the query resolved synchronously
 * before this component mounted. The time is spent showing structure being
 * imposed on a sentence, which is the thing a reviewer cannot see if the query
 * simply appears.
 *
 * The timings are no longer local. They live in
 * `src/components/prototype/motion.ts`, because Idea 2 spends them when its
 * agent ticks a value and Idea 4 spends them when a proposal lands, and four
 * directions moving at three speeds read as three products.
 */
export function Resolving({
  resolution,
  onDone,
}: {
  resolution: Resolution
  onDone: () => void
}) {
  const stage = useStagedSequence({
    marks: [resolveMarks.highlight, resolveMarks.structure],
    done: resolveMarks.done,
    onDone,
  })

  const segments = React.useMemo(() => split(resolution), [resolution])

  return (
    <div>
      <div className="grid">
        {/* What was typed, hardening. */}
        <p
          aria-live="polite"
          className={cn(
            "ease-settle col-start-1 row-start-1 max-w-[74ch] text-[22px] leading-[2.05] tracking-[-0.01em] transition-opacity duration-200 motion-reduce:transition-none",
            stage >= 2 ? "opacity-0" : "opacity-100",
          )}
        >
          {segments.map((segment, index) =>
            segment.matched ? (
              <span
                key={index}
                style={staggerDelay(segment.rank)}
                className={cn(
                  "ease-settle -mx-0.5 inline-block px-0.5 align-baseline transition-all duration-300 motion-reduce:transition-none",
                  stage === 0 && "rounded-md",
                  // Recognised: the accent lights the phrase.
                  stage >= 1 && "bg-brand-wash rounded-md px-1.5",
                  // Structured: it hardens into the same chip the sentence uses.
                  stage >= 2 && "bg-brand-tint border-brand-border border font-medium",
                )}
              >
                {segment.text}
              </span>
            ) : (
              <span
                key={index}
                className={cn(
                  "ease-settle transition-opacity duration-300 motion-reduce:transition-none",
                  stage >= 2 ? "text-muted-foreground/40" : "text-foreground",
                )}
              >
                {segment.text}
              </span>
            ),
          )}
        </p>

        {/* The same query in the sentence's own order, fading up underneath. */}
        <div
          aria-hidden
          style={{ transitionDelay: `${motion.handover}ms` }}
          className={cn(
            // Delayed, so the typed line has left before the sentence arrives:
            // two lines of prose at half opacity on top of each other read as a
            // rendering fault rather than a dissolve.
            "ease-settle col-start-1 row-start-1 transition-all duration-300 motion-reduce:transition-none",
            stage >= 2 ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-1 opacity-0",
          )}
        >
          <div className="pointer-events-none">
            <QuerySentence clauses={resolution.clauses} handlers={inert} />
          </div>
        </div>
      </div>

      <p className="text-muted-foreground mt-3.5 flex items-center gap-2 text-xs">
        <span className="bg-brand size-1.5 animate-pulse rounded-full motion-reduce:animate-none" />
        {stage >= 2 ? "Writing it as a sentence" : "Reading your request"}
      </p>
    </div>
  )
}

interface Segment {
  text: string
  matched: boolean
  /** Order among the matched phrases, so they light up left to right. */
  rank: number
}

/** The typed text cut into what was understood and what was passed over. */
function split(resolution: Resolution): Segment[] {
  const segments: Segment[] = []
  let cursor = 0
  let rank = 0

  for (const span of resolution.spans) {
    if (span.start > cursor) {
      segments.push({ text: resolution.raw.slice(cursor, span.start), matched: false, rank: 0 })
    }
    segments.push({ text: span.text, matched: true, rank })
    rank += 1
    cursor = span.end
  }
  if (cursor < resolution.raw.length) {
    segments.push({ text: resolution.raw.slice(cursor), matched: false, rank: 0 })
  }
  return segments
}
