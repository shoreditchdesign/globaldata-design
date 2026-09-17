import { PrototypeScreen } from "@/components/prototype/PrototypeScreen"
import { getFlow } from "@/flows/registry"

export function generateStaticParams() {
  return getFlow("sprint-4", "idea-2")?.screens.map(({ slug }) => ({ screen: slug })) ?? []
}

export default async function Page({ params }: PageProps<"/sprint-4/idea-2/[screen]">) {
  const { screen } = await params

  return <PrototypeScreen sprintId="sprint-4" ideaId="idea-2" screenSlug={screen} />
}
