import { Screener } from "@/flows/sprint-3/idea-3/components/Screener"

/**
 * The cold start — the same screen with nothing asked yet.
 *
 * This is where the direction's argument actually begins: the reviewer types
 * something loose in their own words, watches the phrases the system
 * recognises harden into pills, and lands on the sentence. The corpus is
 * already on screen underneath, so the task reads as narrowing rather than
 * guessing.
 */
export function Start() {
  return <Screener start />
}
