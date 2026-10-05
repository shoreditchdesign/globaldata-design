"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type PointerEvent as ReactPointerEvent,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeftIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FolderIcon,
  XIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { NavSprint } from "@/flows/registry";

const STORAGE_KEY = "gd-explorer-open";

/**
 * Open/closed lives in `sessionStorage` so it survives screen navigations, and
 * is read through `useSyncExternalStore` so the server snapshot is always
 * closed — no hydration mismatch. `memoryOpen` covers browsers that throw on
 * storage access (private mode, blocked site data): the widget still works, it
 * just forgets between full page loads.
 */
let memoryOpen = false;
let listeners: (() => void)[] = [];

function subscribe(onChange: () => void) {
  listeners = [...listeners, onChange];
  return () => {
    listeners = listeners.filter((l) => l !== onChange);
  };
}

function getSnapshot(): boolean {
  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    if (stored !== null) return stored === "true";
  } catch {
    // fall through to the in-memory value
  }
  return memoryOpen;
}

function getServerSnapshot(): boolean {
  return false;
}

function setStoredOpen(value: boolean) {
  memoryOpen = value;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, String(value));
  } catch {
    // no storage available — `memoryOpen` is the fallback
  }
  for (const listener of listeners) listener();
}

/** True only once the client has taken over; the server always says false. */
function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

const POSITION_KEY = "gd-explorer-trigger-position-left";
/** The trigger is `size-10`. */
const TRIGGER_SIZE = 40;
/** Kept clear of the viewport edge — the `left-3 bottom-3` default. */
const EDGE = 12;
/** Movement under this many pixels is still a click, not a drag. */
const DRAG_THRESHOLD = 4;

type Point = { x: number; y: number };

function clampToViewport(point: Point): Point {
  const maxX = Math.max(EDGE, window.innerWidth - TRIGGER_SIZE - EDGE);
  const maxY = Math.max(EDGE, window.innerHeight - TRIGGER_SIZE - EDGE);
  return {
    x: Math.min(Math.max(point.x, EDGE), maxX),
    y: Math.min(Math.max(point.y, EDGE), maxY),
  };
}

function readStoredPosition(): Point | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(POSITION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Point>;
    if (typeof parsed.x !== "number" || typeof parsed.y !== "number")
      return null;
    return clampToViewport({ x: parsed.x, y: parsed.y });
  } catch {
    return null;
  }
}

function writeStoredPosition(point: Point) {
  try {
    window.localStorage.setItem(POSITION_KEY, JSON.stringify(point));
  } catch {
    // no storage available — the position just resets on reload
  }
}

/**
 * The square trigger. Draggable anywhere on screen; a press that moves less
 * than `DRAG_THRESHOLD` is a click and opens the Explorer, anything further is
 * a drag and does not. Position persists in `localStorage`; `null` means the
 * bottom-left default.
 */
function ExplorerTrigger({
  shortcut,
  onOpen,
}: {
  shortcut: string;
  onOpen: () => void;
}) {
  const [position, setPosition] = useState<Point | null>(readStoredPosition);
  const drag = useRef<{
    pointerId: number;
    start: Point;
    origin: Point;
    moved: boolean;
  } | null>(null);
  const suppressClick = useRef(false);

  useEffect(() => {
    function onResize() {
      setPosition((current) => (current ? clampToViewport(current) : current));
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  function onPointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
    if (event.button !== 0) return;
    const rect = event.currentTarget.getBoundingClientRect();
    drag.current = {
      pointerId: event.pointerId,
      start: { x: event.clientX, y: event.clientY },
      origin: { x: rect.left, y: rect.top },
      moved: false,
    };
    suppressClick.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    const dx = event.clientX - current.start.x;
    const dy = event.clientY - current.start.y;
    if (!current.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
    current.moved = true;
    setPosition(
      clampToViewport({ x: current.origin.x + dx, y: current.origin.y + dy }),
    );
  }

  function onPointerEnd(event: ReactPointerEvent<HTMLButtonElement>) {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (current.moved) {
      suppressClick.current = true;
      const rect = event.currentTarget.getBoundingClientRect();
      writeStoredPosition({ x: rect.left, y: rect.top });
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={() => {
            if (suppressClick.current) {
              suppressClick.current = false;
              return;
            }
            onOpen();
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerEnd}
          onPointerCancel={onPointerEnd}
          aria-label={`Open Explorer (${shortcut.replace(/ /g, "")})`}
          style={position ? { left: position.x, top: position.y } : undefined}
          className={cn(
            "bg-foreground text-background focus-visible:ring-ring/50 fixed z-50 flex size-10 cursor-grab touch-none items-center justify-center rounded-lg shadow-raised outline-none select-none focus-visible:ring-3 focus-visible:ring-offset-2 active:cursor-grabbing",
            !position && "left-3 bottom-3",
          )}
        >
          <FolderIcon className="size-4.5" aria-hidden />
        </button>
      </TooltipTrigger>
      <TooltipContent side="left" sideOffset={6}>
        Explorer · {shortcut}
      </TooltipContent>
    </Tooltip>
  );
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
  nav: NavSprint[];
  sprintId: string;
  ideaId: string;
  screenSlug: string;
}) {
  // A screen may move its own URL on to another step with `history.replaceState`
  // (Idea 1 does, as its one live state is clicked through). The route does not
  // re-render for that, but `usePathname` follows it, so the stepper reads the
  // step from the address rather than from the prop the route was rendered with.
  const pathname = usePathname();
  const [, pathSprint, pathIdea, pathScreen] = pathname.split("/");
  const screenSlug =
    pathSprint === sprintId && pathIdea === ideaId && pathScreen
      ? pathScreen
      : routeSlug;

  const hydrated = useHydrated();
  const open = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Every idea's steps are reachable from here, not only the one being viewed,
  // so a reviewer can cross from Idea 1's cascade straight to Idea 3's sentence.
  // The idea in view opens on arrival; the rest are one click away, because all
  // four expanded at once is forty-six rows and buries where you are.
  const currentKey = `${sprintId}/${ideaId}`;
  const [expanded, setExpanded] = useState<string[]>([currentKey]);
  const toggleIdea = useCallback((key: string) => {
    setExpanded((current) =>
      current.includes(key)
        ? current.filter((k) => k !== key)
        : [...current, key],
    );
  }, []);

  const toggle = useCallback(() => {
    setStoredOpen(!getSnapshot());
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (
        event.shiftKey &&
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "e"
      ) {
        event.preventDefault();
        toggle();
        return;
      }
      if (event.key === "Escape" && getSnapshot()) {
        setStoredOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggle]);

  const sprint = nav.find((s) => s.id === sprintId);
  const idea = sprint?.ideas.find((i) => i.id === ideaId);
  const screens = idea?.screens ?? [];
  const index = screens.findIndex((s) => s.slug === screenSlug);
  const prev = index > 0 ? screens[index - 1] : undefined;
  const next = index >= 0 ? screens[index + 1] : undefined;
  const screen = index >= 0 ? screens[index] : undefined;

  // Client-side only: storage, iframe detection and the platform hint all read
  // from the browser, and none of them may differ across a hydration.
  if (!hydrated) return null;
  // Hidden inside the compare view's iframes.
  if (window.self !== window.top) return null;

  const isMac = /mac/i.test(navigator.platform || navigator.userAgent);
  const shortcut = isMac ? "⌘ ⇧ E" : "Ctrl ⇧ E";

  // The scrim stays mounted so it can fade out as well as in; closed, it is
  // transparent and lets every pointer through.
  const scrim = (
    <div
      aria-hidden
      onClick={() => setStoredOpen(false)}
      className={cn(
        "bg-foreground/15 fixed inset-0 z-50 transition-opacity duration-300 ease-settle motion-reduce:transition-none",
        open ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    />
  );

  if (!open) {
    return (
      <>
        {scrim}
        <ExplorerTrigger shortcut={shortcut} onOpen={toggle} />
      </>
    );
  }

  return (
    <>
      {scrim}
      <aside
        aria-label="Prototype explorer"
        className="bg-surface-raised border-edge fixed left-4 bottom-4 z-50 flex max-h-[70svh] w-[320px] flex-col overflow-hidden rounded-xl border shadow-2xl"
      >
        <div className="flex items-start gap-2 px-3 py-2.5">
          <div className="min-w-0 flex-1">
            <p className="text-muted-foreground truncate text-[11px]">
              {sprint?.name ?? sprintId} <span className="px-1">/</span>{" "}
              {idea?.name ?? ideaId}
            </p>
            <p className="truncate text-sm font-medium">
              {screen?.title ?? screenSlug}
            </p>
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
                const key = `${s.id}/${i.id}`;
                const isCurrentIdea = key === currentKey;
                const isExpanded = expanded.includes(key);
                const first = i.screens[0];
                const listId = `explorer-steps-${s.id}-${i.id}`;
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
                          className={cn(
                            "size-3.5 transition-transform",
                            !isExpanded && "-rotate-90",
                          )}
                        />
                      </button>
                      <Link
                        href={
                          first
                            ? `/${s.id}/${i.id}/${first.slug}`
                            : `/${s.id}/${i.id}`
                        }
                        className={cn(
                          "hover:bg-accent min-w-0 flex-1 rounded-md px-1.5 py-1.5 text-sm transition-colors",
                          isCurrentIdea && "font-medium",
                        )}
                      >
                        <span className="block truncate">
                          {i.name}
                          {i.status === "superseded" ? (
                            <span className="text-muted-foreground font-semibold">
                              {" "}
                              (Superseded)
                            </span>
                          ) : null}
                        </span>
                      </Link>
                      <span className="text-muted-foreground/70 shrink-0 pr-1 text-[11px] tabular-nums">
                        {i.screens.length}
                      </span>
                    </div>

                    {isExpanded && i.screens.length > 0 ? (
                      <ol
                        id={listId}
                        className="border-border/70 mt-0.5 mb-1 ml-5 border-l pl-1"
                      >
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
                );
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
    </>
  );
}
