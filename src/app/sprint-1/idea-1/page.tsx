import { notFound, redirect } from "next/navigation"

import { getFlow } from "@/flows/registry"

export default function Page() {
  const flow = getFlow("sprint-1", "idea-1")
  const first = flow?.screens[0]
  if (!first) notFound()

  redirect(`/sprint-1/idea-1/${first.slug}`)
}
