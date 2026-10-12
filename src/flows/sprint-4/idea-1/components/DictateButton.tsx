"use client"

import * as React from "react"
import { MicIcon } from "lucide-react"

import { motion } from "@/components/prototype/motion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * Speaking the query instead of typing it.
 *
 * The browser's own recogniser, which Chrome and Safari have and Firefox does
 * not, so the control says it is unavailable there rather than sitting dead.
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
    recogniser while the button is still on. Only a refusal of the microphone
    ends it for good; everything else is a pause.
  */
  const listen = React.useCallback(() => {
    const Recogniser = speechRecognition()
    if (!Recogniser || !wanted.current) return
    const recogniser: SpeechRecognitionLike = new Recogniser()
    recogniser.lang = "en-GB"
    recogniser.interimResults = false
    recogniser.continuous = true

    recogniser.onresult = (event) => {
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
      if (event?.error === "not-allowed" || event?.error === "service-not-allowed") {
        wanted.current = false
        engine.current = null
        setListening(false)
      }
    }

    recogniser.onend = () => {
      engine.current = null
      if (!wanted.current) {
        setListening(false)
        return
      }
      window.setTimeout(() => listenRef.current(), 150)
    }

    engine.current = recogniser
    recogniser.start()
  }, [])

  React.useEffect(() => {
    listenRef.current = listen
  }, [listen])

  const start = () => {
    if (!speechRecognition()) return
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
      disabled={disabled || !supported}
      aria-pressed={listening}
      aria-label={listening ? "Stop dictating" : "Dictate this search"}
      title={supported ? undefined : "This browser has no dictation"}
      className={cn(
        "rounded-full",
        listening ? "text-brand hover:text-brand-strong" : "text-muted-foreground",
      )}
    >
      {listening ? <Level /> : <MicIcon />}
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
  interimResults: boolean
  continuous: boolean
  onresult: ((event: { resultIndex: number; results: ArrayLike<SpeechResultLike> }) => void) | null
  onend: (() => void) | null
  onerror: ((event: { error?: string }) => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}

function speechRecognition(): (new () => SpeechRecognitionLike) | undefined {
  if (typeof window === "undefined") return undefined
  const scope = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike
    webkitSpeechRecognition?: new () => SpeechRecognitionLike
  }
  return scope.SpeechRecognition ?? scope.webkitSpeechRecognition
}
