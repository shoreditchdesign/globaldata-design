"use client"

import * as React from "react"

/**
 * The modifier that turns a tick into an exclusion.
 *
 * Option on its own is the browser's own back gesture on a Mac, so an
 * option-click on a checkbox left the screen entirely. Shift and Option
 * together are free in every browser we can test, and Shift and Alt are the
 * same two keys on Windows.
 */
export function excludeModifier(event: { altKey: boolean; shiftKey: boolean }) {
  return event.altKey && event.shiftKey
}

function isMac() {
  return /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)
}

/**
 * How to name those keys to whoever is reading. Read through
 * `useSyncExternalStore` so the server renders the Windows wording and the
 * client corrects it on the first paint rather than in an effect.
 */
export function useExcludeModifierLabel() {
  return React.useSyncExternalStore(
    () => () => {},
    () => (isMac() ? "⇧⌥ click to exclude" : "Shift + Alt click to exclude"),
    () => "Shift + Alt click to exclude",
  )
}
