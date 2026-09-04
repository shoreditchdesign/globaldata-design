import { PrototypeShell } from "@/components/prototype/PrototypeShell"
import { getFlow } from "@/flows/registry"

export function generateStaticParams() {
  return getFlow("sprint-2", "idea-3")?.screens.map(({ slug }) => ({ screen: slug })) ?? []
}

export default async function Page({
  params,
  searchParams,
}: PageProps<"/sprint-2/idea-3/[screen]">) {
  const { screen } = await params
  const { chrome } = await searchParams

  return (
    <PrototypeShell
      sprintId="sprint-2"
      ideaId="idea-3"
      screenSlug={screen}
      chrome={chrome !== "off"}
    />
  )
}
