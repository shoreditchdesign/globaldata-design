import { PrototypeScreen } from "@/components/prototype/PrototypeScreen"
import { getFlow } from "@/flows/registry"

export function generateStaticParams() {
  return getFlow("sprint-2", "idea-3")?.screens.map(({ slug }) => ({ screen: slug })) ?? []
}

export default async function Page({ params }: PageProps<"/sprint-2/idea-3/[screen]">) {
  const { screen } = await params

  return <PrototypeScreen sprintId="sprint-2" ideaId="idea-3" screenSlug={screen} />
}
