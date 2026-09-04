import { PrototypeShell } from "@/components/prototype/PrototypeShell"
import { getFlow } from "@/flows/registry"

export function generateStaticParams() {
  return getFlow("sprint-2", "idea-2")?.screens.map(({ slug }) => ({ screen: slug })) ?? []
}

export default async function Page({
  params,
  searchParams,
}: PageProps<"/sprint-2/idea-2/[screen]">) {
  const { screen } = await params
  const { chrome } = await searchParams

  return (
    <PrototypeShell
      sprintId="sprint-2"
      ideaId="idea-2"
      screenSlug={screen}
      chrome={chrome !== "off"}
    />
  )
}
