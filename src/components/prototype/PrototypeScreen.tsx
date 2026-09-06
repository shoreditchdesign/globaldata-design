import { notFound } from "next/navigation"

import { Explorer } from "@/components/prototype/Explorer"
import { getFlow, getNavTree } from "@/flows/registry"

/**
 * A prototype screen, full bleed. No border, no header, no stepper — the page
 * is the product. Navigation lives in the floating Explorer, which is fixed
 * and so never reflows the screen underneath.
 */
export function PrototypeScreen({
  sprintId,
  ideaId,
  screenSlug,
}: {
  sprintId: string
  ideaId: string
  screenSlug: string
}) {
  const flow = getFlow(sprintId, ideaId)
  const screen = flow?.screens.find((s) => s.slug === screenSlug)
  if (!flow || !screen) notFound()

  const Screen = screen.component

  return (
    <>
      {/* `relative` so screens that overlay a modal centre on the viewport. */}
      <div className="bg-surface-page relative h-svh overflow-hidden">
        <Screen />
      </div>
      <Explorer
        nav={getNavTree()}
        sprintId={sprintId}
        ideaId={ideaId}
        screenSlug={screenSlug}
      />
    </>
  )
}
