"use client"

import * as React from "react"
import { createPortal } from "react-dom"

import { cn } from "@/lib/utils"
import { motion, usePrefersReducedMotion } from "@/components/prototype/motion"
import {
  applyDrop,
  targetKey,
  type Arranged,
  type DragPayload,
  type DropTarget,
} from "@/flows/sprint-4/idea-2/arrange"
import { matchingRows, type Condition } from "@/flows/sprint-4/idea-2/data"

/**
 * Direct manipulation of the query: drag a pill or a condition's operator word
 * to reorder, pull a value out of its group, or merge it back.
 *
 * A small pointer-events implementation rather than a drag library. The
 * sentence is inline text that wraps, and its drop targets are thin carets in
 * the gaps between clauses rather than boxes that reflow the line, so the
 * geometry is the part that needs writing either way. What is here is the
 * gesture: a 4px threshold so a click still opens a pill's menu, a ghost under
 * the pointer, a target resolved by whichever surface the pointer is over, a
 * count preview, and a spring back when nothing takes the drop.
 *
 * Both the sentence and the logic canvas register as surfaces, so a drag
 * started in one can land in the other; both describe targets by condition
 * index and id, never by their own layout.
 */

/** Where the drop indicator is drawn, in viewport coordinates. */
export type Indicator =
  | { kind: "caret"; orientation: "vertical" | "horizontal"; x: number; y: number; length: number }
  /** A merge lights the group itself; this is only where the count tag sits. */
  | { kind: "merge"; x: number; y: number }

export interface Resolved {
  target: DropTarget
  indicator: Indicator
}

export type SurfaceResolver = (x: number, y: number, payload: DragPayload) => Resolved | null

interface Surface {
  element: React.RefObject<HTMLElement | null>
  resolve: React.RefObject<SurfaceResolver>
}

interface ActiveDrag {
  payload: DragPayload
  target: DropTarget | null
  indicator: Indicator | null
  /** What the count would become if dropped now. */
  preview: number | null
}

export interface Landed {
  id: string
  part: Arranged["part"]
  /** Changes on every arrangement, so a reflow can tell one from the next. */
  token: number
}

interface ArrangeContextValue {
  drag: ActiveDrag | null
  landed: Landed | null
  beginDrag: (event: React.PointerEvent<HTMLElement>, payload: DragPayload, label: string) => void
  arrange: (payload: DragPayload, target: DropTarget) => void
  registerSurface: (key: string, surface: Surface) => () => void
}

const ArrangeContext = React.createContext<ArrangeContextValue | null>(null)

export function useArrange() {
  return React.useContext(ArrangeContext)
}

/** Past this many pixels a press becomes a drag; short of it, it is a click. */
const THRESHOLD = 4

const GHOST_OFFSET = { x: 12, y: 16 }

interface Gesture {
  pointerId: number
  payload: DragPayload
  label: string
  startX: number
  startY: number
  /** Where the ghost sits relative to the pointer. */
  offsetX: number
  offsetY: number
  origin: DOMRect
  active: boolean
}

export function ArrangeProvider({
  conditions,
  onCommit,
  children,
}: {
  conditions: Condition[]
  onCommit: (next: Condition[]) => void
  children: React.ReactNode
}) {
  const [drag, setDrag] = React.useState<ActiveDrag | null>(null)
  const [landed, setLanded] = React.useState<Landed | null>(null)
  const [ghost, setGhost] = React.useState<{ label: string; returning: boolean } | null>(null)
  const reduced = usePrefersReducedMotion()

  const surfaces = React.useRef(new Map<string, Surface>())
  const gesture = React.useRef<Gesture | null>(null)
  const ghostRef = React.useRef<HTMLDivElement>(null)
  const ghostAt = React.useRef({ x: 0, y: 0 })
  const current = React.useRef({ conditions, onCommit, reduced })
  React.useEffect(() => {
    current.current = { conditions, onCommit, reduced }
  })

  const token = React.useRef(0)
  const arrange = React.useCallback((payload: DragPayload, target: DropTarget) => {
    const arranged = applyDrop(current.current.conditions, payload, target)
    if (!arranged) return
    current.current.onCommit(arranged.conditions)
    token.current += 1
    setLanded({ id: arranged.id, part: arranged.part, token: token.current })
  }, [])

  // The word a drop made stays lit for a beat, then becomes ordinary content.
  React.useEffect(() => {
    if (!landed) return
    const timer = window.setTimeout(() => setLanded(null), motion.hold)
    return () => window.clearTimeout(timer)
  }, [landed])

  const registerSurface = React.useCallback((key: string, surface: Surface) => {
    surfaces.current.set(key, surface)
    return () => {
      if (surfaces.current.get(key) === surface) surfaces.current.delete(key)
    }
  }, [])

  const beginDrag = React.useCallback(
    (event: React.PointerEvent<HTMLElement>, payload: DragPayload, label: string) => {
      if (event.button !== 0 || gesture.current) return

      // Written straight to the element on every move, and re-applied after any
      // render, so the ghost follows the pointer without a render per frame.
      const placeGhost = (x: number, y: number) => {
        ghostAt.current = { x, y }
        const node = ghostRef.current
        if (node) node.style.transform = `translate(${x}px, ${y}px)`
      }

      const resolveAt = (x: number, y: number, payload: DragPayload): Resolved | null => {
        for (const surface of surfaces.current.values()) {
          const element = surface.element.current
          if (!element || element.closest("[inert]")) continue
          const rect = element.getBoundingClientRect()
          const slack = 16
          if (x < rect.left - slack || x > rect.right + slack || y < rect.top - slack || y > rect.bottom + slack) {
            continue
          }
          return surface.resolve.current(x, y, payload)
        }
        return null
      }

      const source = event.currentTarget
      const origin = source.getBoundingClientRect()
      gesture.current = {
        pointerId: event.pointerId,
        payload,
        label,
        startX: event.clientX,
        startY: event.clientY,
        // Below and to the right of the pointer, clear of the caret it is
        // aiming at, rather than on top of it.
        offsetX: -GHOST_OFFSET.x,
        offsetY: -GHOST_OFFSET.y,
        origin,
        active: false,
      }
      let lastKey = "none"

      const end = () => {
        window.removeEventListener("pointermove", onMove)
        window.removeEventListener("pointerup", onUp)
        window.removeEventListener("pointercancel", onCancel)
        window.removeEventListener("keydown", onKey)
        document.body.style.removeProperty("user-select")
        document.body.style.removeProperty("cursor")
        gesture.current = null
      }

      const springBack = (g: Gesture) => {
        setDrag(null)
        if (current.current.reduced) {
          setGhost(null)
          return
        }
        // Applied by the layer after it renders with the return duration, so
        // the ghost travels home rather than jumping there.
        ghostAt.current = { x: g.origin.left, y: g.origin.top }
        setGhost({ label: g.label, returning: true })
        window.setTimeout(() => setGhost(null), motion.settle)
      }

      function onMove(move: PointerEvent) {
        const g = gesture.current
        if (!g || move.pointerId !== g.pointerId) return
        if (!g.active) {
          if (Math.hypot(move.clientX - g.startX, move.clientY - g.startY) < THRESHOLD) return
          g.active = true
          ghostAt.current = { x: move.clientX - g.offsetX, y: move.clientY - g.offsetY }
          window.getSelection()?.removeAllRanges()
          document.body.style.setProperty("user-select", "none")
          document.body.style.setProperty("cursor", "grabbing")
          setGhost({ label: g.label, returning: false })
          setDrag({ payload: g.payload, target: null, indicator: null, preview: null })
        }
        placeGhost(move.clientX - g.offsetX, move.clientY - g.offsetY)

        const resolved = resolveAt(move.clientX, move.clientY, g.payload)
        const key = targetKey(resolved?.target ?? null)
        if (key === lastKey) return
        lastKey = key
        const arranged = resolved ? applyDrop(current.current.conditions, g.payload, resolved.target) : null
        setDrag({
          payload: g.payload,
          target: arranged && resolved ? resolved.target : null,
          indicator: arranged && resolved ? resolved.indicator : null,
          preview: arranged ? matchingRows(arranged.conditions).length : null,
        })
      }

      function onUp(up: PointerEvent) {
        const g = gesture.current
        if (!g || up.pointerId !== g.pointerId) return
        end()
        if (!g.active) return
        // The press was a drag, so the click that follows is not a click.
        const swallow = (click: MouseEvent) => {
          click.preventDefault()
          click.stopPropagation()
        }
        window.addEventListener("click", swallow, { capture: true, once: true })
        window.setTimeout(() => window.removeEventListener("click", swallow, { capture: true }), 0)

        const resolved = resolveAt(up.clientX, up.clientY, g.payload)
        const arranged = resolved ? applyDrop(current.current.conditions, g.payload, resolved.target) : null
        if (resolved && arranged) {
          setDrag(null)
          setGhost(null)
          arrange(g.payload, resolved.target)
        } else {
          springBack(g)
        }
      }

      function onCancel() {
        const g = gesture.current
        end()
        if (g?.active) springBack(g)
      }

      function onKey(key: KeyboardEvent) {
        if (key.key === "Escape") onCancel()
      }

      window.addEventListener("pointermove", onMove)
      window.addEventListener("pointerup", onUp)
      window.addEventListener("pointercancel", onCancel)
      window.addEventListener("keydown", onKey)
    },
    [arrange],
  )

  const value = React.useMemo(
    () => ({ drag, landed, beginDrag, arrange, registerSurface }),
    [drag, landed, beginDrag, arrange, registerSurface],
  )

  return (
    <ArrangeContext.Provider value={value}>
      {children}
      {ghost
        ? createPortal(
            <DragLayer
              ghostRef={ghostRef}
              ghostAt={ghostAt}
              label={ghost.label}
              returning={ghost.returning}
              drag={drag}
              count={matchingRows(conditions).length}
            />,
            document.body,
          )
        : null}
    </ArrangeContext.Provider>
  )
}

/**
 * What floats while dragging: the ghost under the pointer, the caret in the
 * gap it would land in, and the count it would leave. All fixed-position and
 * out of the flow, so nothing in the sentence moves until the drop.
 */
function DragLayer({
  ghostRef,
  ghostAt,
  label,
  returning,
  drag,
  count,
}: {
  ghostRef: React.RefObject<HTMLDivElement | null>
  ghostAt: React.RefObject<{ x: number; y: number }>
  label: string
  returning: boolean
  drag: ActiveDrag | null
  count: number
}) {
  const indicator = drag?.indicator ?? null
  const preview = drag?.preview ?? null

  React.useLayoutEffect(() => {
    const node = ghostRef.current
    if (node) node.style.transform = `translate(${ghostAt.current.x}px, ${ghostAt.current.y}px)`
  })

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[60]">
      <div
        ref={ghostRef}
        style={{ transitionDuration: returning ? `${motion.settle}ms` : "0ms" }}
        className={cn(
          "bg-brand-tint border-brand-border text-foreground shadow-raised ease-settle absolute top-0 left-0 rounded-md border px-2 py-0.5 text-sm font-medium whitespace-nowrap transition-[transform,opacity] motion-reduce:transition-none",
          returning ? "opacity-0" : "opacity-95",
        )}
      >
        {label}
      </div>

      {indicator?.kind === "caret" ? (
        <span
          className="bg-brand absolute rounded-full"
          style={
            indicator.orientation === "vertical"
              ? { left: indicator.x - 1, top: indicator.y, width: 2, height: indicator.length }
              : { left: indicator.x, top: indicator.y - 1, width: indicator.length, height: 2 }
          }
        />
      ) : null}

      {indicator && preview !== null ? (
        <span
          className="bg-surface-raised border-border shadow-raised text-muted-foreground absolute flex -translate-x-1/2 -translate-y-full items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs whitespace-nowrap tabular-nums"
          style={
            indicator.kind === "caret" && indicator.orientation === "horizontal"
              ? { left: indicator.x + indicator.length / 2, top: indicator.y - 6 }
              : { left: indicator.x, top: indicator.y - 6 }
          }
        >
          {count.toLocaleString("en-GB")}
          <span>→</span>
          <span className={cn("font-medium", preview === count ? "text-muted-foreground" : "text-foreground")}>
            {preview.toLocaleString("en-GB")}
          </span>
        </span>
      ) : null}
    </div>
  )
}

/**
 * Registers an element as somewhere a drag can land. The resolver is read at
 * drag time, so it always sees the conditions of the latest render.
 */
export function useDropSurface(
  key: string,
  element: React.RefObject<HTMLElement | null>,
  resolve: SurfaceResolver,
  enabled = true,
) {
  const context = useArrange()
  const resolver = React.useRef(resolve)
  React.useEffect(() => {
    resolver.current = resolve
  })
  const register = context?.registerSurface
  React.useEffect(() => {
    if (!register || !enabled) return
    return register(key, { element, resolve: resolver })
  }, [register, key, element, enabled])
}

/**
 * The settle after an arrangement. Every tracked element's position is kept
 * from the last render; when `signal` changes, anything that moved is played
 * from where it was to where it is (FLIP) over the `reflow` beat, and anything
 * new fades up over `settle`. Reduced motion gets the end state at once.
 */
export function useReflow(signal: number | undefined) {
  const elements = React.useRef(new Map<string, HTMLElement>())
  const container = React.useRef<HTMLElement | null>(null)
  const positions = React.useRef(new Map<string, { x: number; y: number }>())
  const seen = React.useRef(signal)
  const reduced = usePrefersReducedMotion()

  React.useLayoutEffect(() => {
    const base = container.current?.getBoundingClientRect()
    if (!base) return
    const next = new Map<string, { x: number; y: number }>()
    elements.current.forEach((element, id) => {
      const rect = element.getBoundingClientRect()
      next.set(id, { x: rect.left - base.left, y: rect.top - base.top })
    })

    if (signal !== seen.current && !reduced) {
      const easing = getComputedStyle(document.documentElement).getPropertyValue("--ease-settle-curve").trim() || "ease-out"
      next.forEach((position, id) => {
        const element = elements.current.get(id)
        if (!element) return
        const before = positions.current.get(id)
        if (!before) {
          element.animate([{ opacity: 0 }, { opacity: 1 }], { duration: motion.settle, easing })
          return
        }
        const dx = before.x - position.x
        const dy = before.y - position.y
        if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return
        element.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }], {
          duration: motion.reflow,
          easing,
        })
      })
    }
    seen.current = signal
    positions.current = next
  })

  const track = React.useCallback(
    (id: string) => (element: HTMLElement | null) => {
      if (element) elements.current.set(id, element)
      else elements.current.delete(id)
    },
    [],
  )

  return { container, track }
}
