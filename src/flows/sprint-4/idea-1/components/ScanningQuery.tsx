"use client"

import * as React from "react"

import {
  resolveMarks,
  staggerDelay,
  useStagedSequence,
} from "@/components/prototype/motion"
import type { Resolution } from "@/flows/sprint-4/idea-1/resolve"
import { cn } from "@/lib/utils"

interface Segment {
  text: string
  matched: boolean
  rank: number
}

/**
 * Sprint 3 Idea 3's reading gesture, kept inside S4I1's search field: phrases
 * the resolver recognised flash in order, then return to ordinary input text.
 */
export function ScanningQuery({
  resolution,
  onDone,
  multiline = false,
}: {
  resolution: Resolution
  onDone: () => void
  /** Wrap over a textarea rather than sit on one line over an input. */
  multiline?: boolean
}) {
  const stage = useStagedSequence({
    marks: [resolveMarks.highlight, resolveMarks.structure],
    done: resolveMarks.done,
    onDone,
  })
  const segments = React.useMemo(() => split(resolution), [resolution])

  return (
    <p
      role="status"
      aria-label="Reading your request"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        multiline
          ? "text-[13px] leading-5 wrap-break-word"
          : "flex h-16 items-center text-base whitespace-nowrap",
      )}
    >
      {/* One inline run: as separate flex items, each segment's edge spaces collapsed. */}
      <span className={multiline ? "whitespace-pre-wrap" : "whitespace-pre"}>
        {segments.map((segment, index) => (
          <span
            key={`${segment.text}:${index}`}
            style={segment.matched ? staggerDelay(segment.rank) : undefined}
            className={cn(
              "ease-settle transition-colors duration-300 motion-reduce:transition-none",
              segment.matched && stage === 1 && "bg-brand-tint text-brand-ink -mx-0.5 rounded px-0.5",
            )}
          >
            {segment.text}
          </span>
        ))}
      </span>
    </p>
  )
}

function split(resolution: Resolution): Segment[] {
  const segments: Segment[] = []
  let cursor = 0
  let rank = 0

  for (const span of resolution.spans) {
    if (span.start > cursor) {
      segments.push({
        text: resolution.raw.slice(cursor, span.start),
        matched: false,
        rank: 0,
      })
    }
    segments.push({ text: span.text, matched: true, rank })
    cursor = span.end
    rank += 1
  }

  if (cursor < resolution.raw.length) {
    segments.push({ text: resolution.raw.slice(cursor), matched: false, rank: 0 })
  }

  return segments
}
