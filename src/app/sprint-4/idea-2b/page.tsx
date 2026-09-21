import { notFound, redirect } from "next/navigation"

import { getFlow } from "@/flows/registry"

export default function Page() {
  const flow = getFlow("sprint-4", "idea-2b")
  const first = flow?.screens[0]
  if (!first) notFound()

  redirect(`/sprint-4/idea-2b/${first.slug}`)
}
