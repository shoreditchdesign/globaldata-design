"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

/**
 * The URL machinery behind a one-screen flow whose frames are states rather
 * than pages, lifted out of Idea 1 so the other directions do not each carry
 * their own copy of the reseed guard.
 *
 * The slug in the URL seeds the state on arrival. From then on the state leads
 * and the URL follows it with `replaceState`, which the App Router folds into
 * `usePathname` without re-rendering the route, so the screen keeps its state
 * while the address bar names the frame it is nearest to. A URL change the
 * screen did not write is a jump, and reseeds.
 *
 * This is a hook, not a component — the ideas stay independent designs, and
 * nothing about a screen's look or behaviour travels through here.
 */

/**
 * The path this screen last wrote into the URL itself.
 *
 * A URL change that matches it is the screen's own echo coming back through
 * the router rather than a jump, so it must not reseed. Module scope rather
 * than a ref because it is read during render, and it only ever describes this
 * one window's history. The whole path is recorded rather than the slug alone,
 * so two ideas sharing a slug name cannot be mistaken for each other.
 */
let lastWrittenPath: string | null = null

function splitPath(pathname: string) {
  const cut = pathname.lastIndexOf("/")
  return { base: pathname.slice(0, cut), slug: pathname.slice(cut + 1) }
}

/**
 * @param liveSlug the frame the live state is nearest to, from the flow's own `slugFor`
 * @param onReseed called during render when the URL moved somewhere the state did not
 * @returns the slug currently in the URL
 */
export function useDeepLink(liveSlug: string, onReseed: (slug: string) => void) {
  const pathname = usePathname()
  const { base, slug } = splitPath(pathname)

  // A jump to another frame that React did not remount for — a link to the
  // slug this route was first rendered with — arrives only as a new pathname.
  // Adjusted during render so the old state never paints first.
  const [seenSlug, setSeenSlug] = useState(slug)
  if (seenSlug !== slug) {
    setSeenSlug(slug)
    if (slug !== liveSlug && `${base}/${slug}` !== lastWrittenPath) {
      onReseed(slug)
    }
  }

  // Replace, not push. The state cannot be rebuilt from history, so a pushed
  // entry per click would make Back change the address and nothing else. Back
  // leaves the flow for wherever you were before it.
  useEffect(() => {
    const target = `${base}/${liveSlug}`
    if (window.location.pathname === target) return
    lastWrittenPath = target
    window.history.replaceState(null, "", target)
  }, [base, liveSlug])

  return slug
}
