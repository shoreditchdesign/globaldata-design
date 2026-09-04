import { PrototypeShell } from "@/components/prototype/PrototypeShell"
import { getFlow } from "@/flows/registry"

export function generateStaticParams() {
  return getFlow("sprint-1", "idea-1")?.screens.map(({ slug }) => ({ screen: slug })) ?? []
}

export default async function Page({
  params,
  searchParams,
}: PageProps<"/sprint-1/idea-1/[screen]">) {
  const { screen } = await params
  const { chrome } = await searchParams

  return (
    <PrototypeShell
      sprintId="sprint-1"
      ideaId="idea-1"
      screenSlug={screen}
      chrome={chrome !== "off"}
    />
  )
}
