"use client"

import * as React from "react"

/**
 * The motion vocabulary, in one place.
 *
 * Lifted out of Idea 3's resolve — the transition where the typed request
 * lights up phrase by phrase, hardens into pills and dissolves into the
 * sentence. That was the one piece of motion the client singled out, and the
 * reason it works is not the effect, it is the timing: a short beat before
 * anything moves, a stagger small enough to read as one gesture rather than a
 * queue, and a curve that decelerates hard so things arrive rather than slide.
 *
 * Four directions get reviewed in one session. If Idea 2's agent ticks a value
 * at one speed and Idea 4 accepts a proposal at another, the set reads as four
 * products. So the numbers live here and the directions spend them.
 *
 * Everything is presentational. Nothing in this file decides anything; it says
 * how long a decision already made should take to become visible.
 */
export const motion = {
  /** A value snapping on, a chip lighting up. Below this it reads as a jump. */
  quick: 160,
  /** The default settle — a phrase hardening, a row arriving, a count moving. */
  settle: 300,
  /** A surface changing what it says: a panel reflowing, a grid re-sorting. */
  reflow: 420,
  /**
   * How long a replacement waits before fading up under what it replaces. Two
   * lines of prose at half opacity on top of each other read as a rendering
   * fault, not a dissolve — the outgoing one has to be gone first.
   */
  handover: 150,
  /** Per-item stagger. Small: the phrases are one gesture, not a countdown. */
  stagger: 70,
  /**
   * Cap on the stagger. Past this many items the tail all moves together —
   * otherwise a long list turns the gesture into a wait.
   */
  staggerCap: 8,
  /** How long an applied change stays lit before it becomes ordinary content. */
  hold: 900,
} as const

/**
 * The resolve itself, as marks on a timeline from mount.
 *
 * Idea 3 owns the gesture — raw text, phrases lighting up, phrases hardening,
 * the sentence rising underneath — but the numbers live here because the beat
 * is what the other directions are borrowing. Long enough to watch, short
 * enough to sit through, and nothing is being computed during any of it.
 */
export const resolveMarks = {
  /** The recognised phrases begin to light. */
  highlight: 180,
  /** They harden into pills and the sentence starts to rise. */
  structure: 760,
  /** The whole thing hands over. */
  done: 1400,
} as const

/**
 * Tailwind fragments for the two curves. Both carry
 * `motion-reduce:transition-none`, so a reduced-motion user gets the end state
 * with no interpolation and never a half-drawn one.
 *
 *   settle — the resolve curve. Use it when something is arriving.
 *   lift   — its shorter sibling, for one element changing in place.
 */
export const settleClass =
  "transition-all duration-300 ease-settle motion-reduce:transition-none"
export const liftClass =
  "transition-all duration-150 ease-lift motion-reduce:transition-none"
/** Colour-only version, for a fill or a border changing without a reflow. */
export const tintClass =
  "transition-colors duration-300 ease-settle motion-reduce:transition-none"

/**
 * The delay for item `index` in a staggered group, as an inline style.
 *
 * Inline rather than a class because the count is not known at build time and
 * an arbitrary-value class per index would defeat Tailwind's scanner.
 */
export function staggerDelay(index: number): React.CSSProperties {
  return { transitionDelay: `${Math.min(index, motion.staggerCap) * motion.stagger}ms` }
}

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)"

function subscribeToReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION)
  query.addEventListener("change", onChange)
  return () => query.removeEventListener("change", onChange)
}

/**
 * Whether the reader has asked for less motion.
 *
 * Most of the time the `motion-reduce:` variants above are enough and this is
 * not needed. Reach for it only where the reduction has to change what the
 * component *does* rather than how it transitions — skipping a hold, say.
 *
 * Read through `useSyncExternalStore` so the server snapshot is `false` and
 * the client never has to correct itself in an effect.
 */
export function usePrefersReducedMotion(): boolean {
  return React.useSyncExternalStore(
    subscribeToReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  )
}

/**
 * A sequence of stages on a timeline, which is the shape Idea 3's resolve
 * already had: mark 0 fires at `marks[0]`, mark 1 at `marks[1]`, and `onDone`
 * at `done`. Returns the number of marks passed, so `0` is "not started yet".
 *
 * Marks are absolute offsets from mount, not gaps, because that is how the
 * transition was written and it is easier to reason about when a stagger is
 * running underneath: a phrase that starts at 180ms and is the fifth of its
 * group finishes at 180 + 4 × 70 + 300.
 */
export function useStagedSequence({
  marks,
  done,
  onDone,
}: {
  marks: readonly number[]
  done?: number
  onDone?: () => void
}): number {
  const [stage, setStage] = React.useState(0)

  // Held in a ref so a caller passing an inline arrow does not restart the
  // sequence on every render.
  const onDoneRef = React.useRef(onDone)
  React.useEffect(() => {
    onDoneRef.current = onDone
  })

  // `key` stands in for the marks array, which is usually a literal.
  const key = marks.join(",")

  // A new timeline starts from the top. Adjusted during render rather than in
  // an effect, so nothing paints the tail of the previous sequence first.
  const [runningKey, setRunningKey] = React.useState(key)
  if (runningKey !== key) {
    setRunningKey(key)
    setStage(0)
  }

  React.useEffect(() => {
    const timers = marks.map((at, index) =>
      window.setTimeout(() => setStage(index + 1), at),
    )
    if (done !== undefined) {
      timers.push(window.setTimeout(() => onDoneRef.current?.(), done))
    }
    return () => timers.forEach(window.clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, done])

  return stage
}

/**
 * True for a beat after `signal` changes — the "that just happened" flag.
 *
 * Idea 2 uses it to light the values its agent has ticked, Idea 4 to light the
 * lanes a proposal moved. In both the change itself is instant and already
 * committed; this only says which part of the screen to look at, and for how
 * long. It never gates rendering, so a reduced-motion reader who sees no fade
 * still sees every value and every column.
 *
 * Quiet on first render: arriving on a screen is not a change.
 */
export function useSettle<T>(signal: T, hold: number = motion.hold): boolean {
  const [lit, setLit] = React.useState(false)
  const previous = React.useRef(signal)

  React.useEffect(() => {
    if (Object.is(previous.current, signal)) return
    previous.current = signal
    setLit(true)
    const timer = window.setTimeout(() => setLit(false), hold)
    return () => window.clearTimeout(timer)
  }, [signal, hold])

  return lit
}
