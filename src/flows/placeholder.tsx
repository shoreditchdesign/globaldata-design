import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

/**
 * Stand-in screen used until a real design is ported from the Paper file.
 * Delete the import once a flow has real screens.
 */
export function PlaceholderScreen({ title, note }: { title: string; note?: string }) {
  return (
    <div className="flex min-h-[480px] items-center justify-center p-10">
      <Card className="w-full max-w-md border-dashed">
        <CardHeader>
          <Badge variant="secondary" className="mb-2 w-fit">
            Not yet designed
          </Badge>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{note ?? "Awaiting the Paper source flow."}</CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          Replace this screen in <code className="font-mono">src/flows/</code> with the ported design.
        </CardContent>
      </Card>
    </div>
  )
}

export function makePlaceholder(title: string, note?: string) {
  const Component = () => <PlaceholderScreen title={title} note={note} />
  Component.displayName = `Placeholder(${title})`
  return Component
}
