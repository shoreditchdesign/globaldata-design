"use client"

import * as React from "react"
import { LoaderCircleIcon, MicIcon } from "lucide-react"

import { motion } from "@/components/prototype/motion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * Speaking the query instead of typing it.
 *
 * The browser's own recogniser, which Chrome and Safari have and Firefox does
 * not, so the control says it is unavailable there rather than sitting dead.
 * Where Chrome can transcribe on the device it does, installing the language
 * pack on the first press: its cloud service fails with `network` on some
 * machines that are otherwise online, and on-device needs no network at all.
 * What comes back is appended to whatever is in the field, and the query is
 * still resolved by hand — dictation replaces the keyboard, not the go arrow.
 *
 * Idea 2 carries the same behaviour as a labelled button beside its composer.
 * Here it is icon-only, sitting next to the arrow in the search field, so the
 * ideas stay independent rather than sharing a component.
 */
export function DictateButton({
  onText,
  disabled,
  size = "icon-lg",
}: {
  onText: (text: string) => void
  disabled?: boolean
  /** Matches the go arrow it sits beside: large on the landing, small in the panel. */
  size?: "icon-lg" | "icon-sm"
}) {
  const [listening, setListening] = React.useState(false)
  /** The on-device language pack installing, on the first press. */
  const [preparing, setPreparing] = React.useState(false)
  /** Why it stopped, when it stopped for a reason worth saying. */
  const [problem, setProblem] = React.useState<"blocked" | "offline" | null>(null)
  /** Whether sessions run on the device; decided once per press. */
  const local = React.useRef(false)
  /** Sessions that ended within a second of starting, back to back. */
  const quickEnds = React.useRef(0)
  const engine = React.useRef<SpeechRecognitionLike | null>(null)
  const onTextRef = React.useRef(onText)
  React.useEffect(() => {
    onTextRef.current = onText
  }, [onText])
  /** The restart calls back into this, so it is held rather than recursed. */
  const listenRef = React.useRef<() => void>(() => {})
  /** The recogniser stops itself at every pause; this is whether we meant it to. */
  const wanted = React.useRef(false)
  const supported = React.useSyncExternalStore(
    () => () => {},
    () => Boolean(speechRecognition()),
    () => true,
  )

  const stop = () => {
    wanted.current = false
    const running = engine.current
    engine.current = null
    setListening(false)
    running?.stop()
  }

  /*
    One session per stretch of speech, however many the browser opens.

    Chrome ends a session at every pause and raises `no-speech` with it, and a
    session that has ended cannot be started again, so each end builds a fresh
    recogniser while the button is still on. A refused microphone, an
    unreachable service or a missing microphone ends it for good, and so do
    sessions that keep dying the moment they open — restarting those is what
    made the microphone blink without ever hearing anything.
  */
  const listen = React.useCallback(() => {
    const Recogniser = speechRecognition()
    if (!Recogniser || !wanted.current) return
    const fail = (reason: "blocked" | "offline") => {
      wanted.current = false
      engine.current = null
      setProblem(reason)
      setListening(false)
    }
    const recogniser: SpeechRecognitionLike = new Recogniser()
    recogniser.lang = LANG
    recogniser.interimResults = false
    recogniser.continuous = true
    if (local.current) recogniser.processLocally = true
    const opened = performance.now()
    let heard = false

    recogniser.onresult = (event) => {
      heard = true
      // Only what the recogniser has settled on, from where this batch starts,
      // or a long dictation would repeat everything said so far.
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i]
        if (!result.isFinal) continue
        const said = (result[0]?.transcript ?? "").trim()
        if (said) onTextRef.current(said.toLowerCase())
      }
    }

    recogniser.onerror = (event) => {
      const error = event?.error ?? ""
      if (error === "not-allowed" || error === "service-not-allowed") fail("blocked")
      else if (fatalErrors.has(error)) fail("offline")
    }

    recogniser.onend = () => {
      engine.current = null
      if (!wanted.current) {
        setListening(false)
        return
      }
      quickEnds.current = !heard && performance.now() - opened < 1000 ? quickEnds.current + 1 : 0
      if (quickEnds.current >= 3) {
        fail("offline")
        return
      }
      window.setTimeout(() => listenRef.current(), 150)
    }

    engine.current = recogniser
    try {
      recogniser.start()
    } catch {
      fail("offline")
    }
  }, [])

  React.useEffect(() => {
    listenRef.current = listen
  }, [listen])

  const start = async () => {
    const Recogniser = speechRecognition()
    if (!Recogniser) return
    setProblem(null)
    quickEnds.current = 0
    setPreparing(true)
    const mode = await preferredMode(Recogniser)
    setPreparing(false)
    if (mode === "none") {
      setProblem("offline")
      return
    }
    local.current = mode === "local"
    wanted.current = true
    setListening(true)
    listen()
  }

  React.useEffect(
    () => () => {
      wanted.current = false
      engine.current?.abort()
    },
    [],
  )

  // The field disabling mid-dictation — a resolve starting — closes the session.
  React.useEffect(() => {
    if (disabled && wanted.current) stop()
  })

  return (
    <Button
      type="button"
      variant="ghost"
      size={size}
      onClick={listening ? stop : start}
      disabled={disabled || !supported || preparing}
      aria-pressed={listening}
      aria-label={
        listening ? "Stop dictating" : preparing ? "Preparing dictation" : "Dictate this search"
      }
      title={
        !supported
          ? "This browser has no dictation"
          : preparing
            ? "Preparing dictation"
            : problem === "offline"
              ? "Dictation could not reach a speech service"
              : problem === "blocked"
                ? "The microphone is blocked for this site"
                : undefined
      }
      className={cn(
        "rounded-full",
        listening ? "text-brand hover:text-brand-strong" : "text-muted-foreground",
        problem && !listening && "text-negative-ink",
      )}
    >
      {listening ? (
        <Level />
      ) : preparing ? (
        <LoaderCircleIcon className="animate-spin motion-reduce:animate-none" />
      ) : (
        <MicIcon />
      )}
    </Button>
  )
}

/**
 * Three bars keeping time while the recogniser is open. It is not reading the
 * microphone — nothing here meters sound — it is saying the session is live,
 * which is what a reader needs to know before they speak.
 */
function Level() {
  return (
    <span aria-hidden className="flex h-3.5 items-end gap-[2px]">
      {[0, 120, 240].map((delay) => (
        <span
          key={delay}
          style={{ animationDelay: `${delay}ms`, animationDuration: `${motion.hold}ms` }}
          className="bg-brand h-full w-[2px] origin-bottom animate-[levels_900ms_ease-in-out_infinite] rounded-full motion-reduce:h-1/2 motion-reduce:animate-none"
        />
      ))}
    </span>
  )
}

/** The browser's recogniser, under either of the names it goes by. */
interface SpeechResultLike extends ArrayLike<{ transcript: string }> {
  isFinal: boolean
}

interface SpeechRecognitionLike {
  lang: string
  /** Chrome's on-device recognition, where the language pack is installed. */
  processLocally?: boolean
  interimResults: boolean
  continuous: boolean
  onresult: ((event: { resultIndex: number; results: ArrayLike<SpeechResultLike> }) => void) | null
  onend: (() => void) | null
  onerror: ((event: { error?: string }) => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}

interface AvailabilityOptions {
  langs: string[]
  processLocally: boolean
}

interface RecogniserClass {
  new (): SpeechRecognitionLike
  available?: (options: AvailabilityOptions) => Promise<string>
  install?: (options: AvailabilityOptions) => Promise<boolean>
}

const LANG = "en-GB"

/** Errors that mean no session will work, so restarting would only spin. */
const fatalErrors = new Set(["network", "audio-capture", "language-not-supported"])

/**
 * On the device where Chrome can, installing the pack if it has to; the cloud
 * service where it cannot; nothing where neither is there. Safari has no
 * `available`, and goes straight to its own recogniser.
 */
async function preferredMode(Recogniser: RecogniserClass): Promise<"local" | "cloud" | "none"> {
  if (!Recogniser.available) return "cloud"
  try {
    const onDevice = await Recogniser.available({ langs: [LANG], processLocally: true })
    if (onDevice === "available") return "local"
    if ((onDevice === "downloadable" || onDevice === "downloading") && Recogniser.install) {
      if (await Recogniser.install({ langs: [LANG], processLocally: true })) return "local"
    }
    const cloud = await Recogniser.available({ langs: [LANG], processLocally: false })
    return cloud === "unavailable" ? "none" : "cloud"
  } catch {
    return "cloud"
  }
}

function speechRecognition(): RecogniserClass | undefined {
  if (typeof window === "undefined") return undefined
  const scope = window as unknown as {
    SpeechRecognition?: RecogniserClass
    webkitSpeechRecognition?: RecogniserClass
  }
  return scope.SpeechRecognition ?? scope.webkitSpeechRecognition
}
