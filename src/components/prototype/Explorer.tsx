"use client"

import { useCallback, useEffect, useState, useSyncExternalStore } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ArrowLeftIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import type { NavSprint } from "@/flows/registry"

const STORAGE_KEY = "gd-explorer-open"

/**
 * Open/closed lives in `sessionStorage` so it survives screen navigations, and
 * is read through `useSyncExternalStore` so the server snapshot is always
 * closed — no hydration mismatch. `memoryOpen` covers browsers that throw on
 * storage access (private mode, blocked site data): the widget still works, it
 * just forgets between full page loads.
 */
let memoryOpen = false
let listeners: (() => void)[] = []

function subscribe(onChange: () => void) {
  listeners = [...listeners, onChange]
  return () => {
    listeners = listeners.filter((l) => l !== onChange)
  }
}

function getSnapshot(): boolean {
  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY)
    if (stored !== null) return stored === "true"
  } catch {
    // fall through to the in-memory value
  }
  return memoryOpen
}

function getServerSnapshot(): boolean {
  return false
}

function setStoredOpen(value: boolean) {
  memoryOpen = value
  try {
    window.sessionStorage.setItem(STORAGE_KEY, String(value))
  } catch {
    // no storage available — `memoryOpen` is the fallback
  }
  for (const listener of listeners) listener()
}

/** True only once the client has taken over; the server always says false. */
function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )
}

/**
 * The only chrome in the app. Floats above the prototype, summoned with
 * Cmd/Ctrl+Shift+E, and never affects the layout underneath.
 *
 * Hidden inside iframes so the compare view stays clean.
 */
export function Explorer({
  nav,
  sprintId,
  ideaId,
  screenSlug: routeSlug,
}: {
  nav: NavSprint[]
  sprintId: string
  ideaId: string
  screenSlug: string
}) {
  // A screen may move its own URL on to another step with `history.replaceState`
  // (Idea 1 does, as its one live state is clicked through). The route does not
  // re-render for that, but `usePathname` follows it, so the stepper reads the
  // step from the address rather than from the prop the route was rendered with.
  const pathname = usePathname()
  const [, pathSprint, pathIdea, pathScreen] = pathname.split("/")
  const screenSlug =
    pathSprint === sprintId && pathIdea === ideaId && pathScreen ? pathScreen : routeSlug

  const hydrated = useHydrated()
  const open = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  // Every idea's steps are reachable from here, not only the one being viewed,
  // so a reviewer can cross from Idea 1's cascade straight to Idea 3's sentence.
  // The idea in view opens on arrival; the rest are one click away, because all
  // four expanded at once is forty-six rows and buries where you are.
  const currentKey = `${sprintId}/${ideaId}`
  const [expanded, setExpanded] = useState<string[]>([currentKey])
  const toggleIdea = useCallback((key: string) => {
    setExpanded((current) =>
      current.includes(key) ? current.filter((k) => k !== key) : [...current, key],
    )
  }, [])

  const toggle = useCallback(() => {
    setStoredOpen(!getSnapshot())
  }, [])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.shiftKey && (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "e") {
        event.preventDefault()
        toggle()
        return
      }
      if (event.key === "Escape" && getSnapshot()) {
        setStoredOpen(false)
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [toggle])

  const sprint = nav.find((s) => s.id === sprintId)
  const idea = sprint?.ideas.find((i) => i.id === ideaId)
  const screens = idea?.screens ?? []
  const index = screens.findIndex((s) => s.slug === screenSlug)
  const prev = index > 0 ? screens[index - 1] : undefined
  const next = index >= 0 ? screens[index + 1] : undefined
  const screen = index >= 0 ? screens[index] : undefined

  // Client-side only: storage, iframe detection and the platform hint all read
  // from the browser, and none of them may differ across a hydration.
  if (!hydrated) return null
  // Hidden inside the compare view's iframes.
  if (window.self !== window.top) return null

  const isMac = /mac/i.test(navigator.platform || navigator.userAgent)
  const shortcut = isMac ? "⌘ ⇧ E" : "Ctrl ⇧ E"

  if (!open) {
    return (
      <button
        type="button"
        onClick={toggle}
        aria-label="Open the prototype explorer"
        className="bg-surface-raised/80 border-border text-muted-foreground hover:text-foreground fixed right-3 bottom-3 z-50 rounded-full border px-2.5 py-1 text-[11px] shadow-sm backdrop-blur-sm transition-opacity"
      >
        <span className="font-medium tracking-wide">{shortcut}</span>
        <span className="text-muted-foreground/70"> · Explorer</span>
      </button>
    )
  }

  return (
    <aside
      aria-label="Prototype explorer"
      className="bg-surface-raised border-edge fixed right-4 bottom-4 z-50 flex max-h-[70svh] w-[320px] flex-col overflow-hidden rounded-xl border shadow-2xl"
    >
      <div className="flex items-start gap-2 px-3 py-2.5">
        <div className="min-w-0 flex-1">
          <p className="text-muted-foreground truncate text-[11px]">
            {sprint?.name ?? sprintId} <span className="px-1">/</span> {idea?.name ?? ideaId}
          </p>
          <p className="truncate text-sm font-medium">{screen?.title ?? screenSlug}</p>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="size-7 shrink-0"
          onClick={toggle}
          aria-label="Close the explorer"
        >
          <XIcon className="size-3.5" />
        </Button>
      </div>

      <Separator />

      <div className="flex items-center gap-1 px-2 py-2">
        {/*
          An explicit route up, not `router.back()` — a screen URL opened cold has
          no history to go back to, and the button would do nothing visible.
        */}
        <Button asChild size="sm" variant="ghost" className="h-7 px-2">
          <Link href="/">
            <ArrowLeftIcon className="size-3.5" />
            All sprints
          </Link>
        </Button>
        <div className="ml-auto flex items-center gap-1">
          <Button
            asChild={!!prev}
            size="icon"
            variant="outline"
            className="size-7"
            disabled={!prev}
            aria-label="Previous screen"
          >
            {prev ? (
              <Link href={`/${sprintId}/${ideaId}/${prev.slug}`}>
                <ChevronLeftIcon className="size-3.5" />
              </Link>
            ) : (
              <span>
                <ChevronLeftIcon className="size-3.5" />
              </span>
            )}
          </Button>
          <span className="text-muted-foreground px-1 text-[11px] tabular-nums">
            {index >= 0 ? index + 1 : "–"}/{screens.length}
          </span>
          <Button
            asChild={!!next}
            size="icon"
            variant="outline"
            className="size-7"
            disabled={!next}
            aria-label="Next screen"
          >
            {next ? (
              <Link href={`/${sprintId}/${ideaId}/${next.slug}`}>
                <ChevronRightIcon className="size-3.5" />
              </Link>
            ) : (
              <span>
                <ChevronRightIcon className="size-3.5" />
              </span>
            )}
          </Button>
        </div>
      </div>

      <Separator />

      <nav className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
        {nav.map((s) => (
          <div key={s.id} className="mb-2 last:mb-0">
            <p className="text-muted-foreground px-2 py-1 text-[10px] font-medium tracking-[0.08em] uppercase">
              {s.name}
            </p>
            {s.ideas.map((i) => {
              const key = `${s.id}/${i.id}`
              const isCurrentIdea = key === currentKey
              const isExpanded = expanded.includes(key)
              const first = i.screens[0]
              const listId = `explorer-steps-${s.id}-${i.id}`
              return (
                <div key={i.id}>
                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => toggleIdea(key)}
                      disabled={i.screens.length === 0}
                      aria-expanded={isExpanded}
                      aria-controls={listId}
                      aria-label={`${isExpanded ? "Collapse" : "Expand"} ${i.name}`}
                      className="text-muted-foreground hover:text-foreground flex size-6 shrink-0 items-center justify-center rounded-md disabled:opacity-0"
                    >
                      <ChevronDownIcon
                        className={cn("size-3.5 transition-transform", !isExpanded && "-rotate-90")}
                      />
                    </button>
                    <Link
                      href={first ? `/${s.id}/${i.id}/${first.slug}` : `/${s.id}/${i.id}`}
                      className={cn(
                        "hover:bg-accent min-w-0 flex-1 rounded-md px-1.5 py-1.5 text-sm transition-colors",
                        isCurrentIdea && "font-medium",
                      )}
                    >
                      <span className="block truncate">{i.name}</span>
                    </Link>
                    <span className="text-muted-foreground/70 shrink-0 pr-1 text-[11px] tabular-nums">
                      {i.screens.length}
                    </span>
                  </div>

                  {isExpanded && i.screens.length > 0 ? (
                    <ol id={listId} className="border-border/70 mt-0.5 mb-1 ml-5 border-l pl-1">
                      {i.screens.map((sc, n) => (
                        <li key={sc.slug}>
                          <Link
                            href={`/${s.id}/${i.id}/${sc.slug}`}
                            className={cn(
                              "flex items-center gap-2 rounded-md px-2 py-1 text-sm transition-colors",
                              isCurrentIdea && sc.slug === screenSlug
                                ? "bg-brand-tint ring-brand-border text-foreground font-medium ring-1 ring-inset"
                                : "hover:bg-accent",
                            )}
                          >
                            <span className="text-muted-foreground w-4 shrink-0 text-[11px] tabular-nums">
                              {String(n + 1).padStart(2, "0")}
                            </span>
                            <span className="truncate">{sc.title}</span>
                          </Link>
                        </li>
                      ))}
                    </ol>
                  ) : null}
                </div>
              )
            })}
          </div>
        ))}
      </nav>

      <Separator />

      <div className="flex items-center gap-2 px-3 py-2">
        <Link
          href={`/${sprintId}/compare`}
          className="text-muted-foreground hover:text-foreground text-xs"
        >
          Compare
        </Link>
        <span className="text-muted-foreground/70 ml-auto text-[11px] tracking-wide">
          {shortcut}
        </span>
      </div>
    </aside>
  )
}
