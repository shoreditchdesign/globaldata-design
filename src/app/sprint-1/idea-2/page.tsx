import { notFound, redirect } from "next/navigation"

import { getFlow } from "@/flows/registry"

export default function Page() {
  const flow = getFlow("sprint-1", "idea-2")
  const first = flow?.screens[0]
  if (!first) notFound()

  redirect(`/sprint-1/idea-2/${first.slug}`)
}
