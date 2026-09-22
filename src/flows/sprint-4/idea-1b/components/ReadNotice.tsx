import type { Resolution } from "@/flows/sprint-4/idea-1b/resolve"
import { cn } from "@/lib/utils"

/**
 * One quiet line under the query field: the words a read could not place, and
 * anything it asked for that this search does not carry. Worded as Idea 2b's
 * screener words it, so the two directions answer a miss the same way.
 */
export function ReadNotice({
  resolution,
  className,
}: {
  resolution: Resolution
  className?: string
}) {
  const { unplaced, notes } = resolution
  const nothing = !resolution.ok && unplaced.length === 0 && notes.length === 0

  return (
    <p role="status" className={cn("text-muted-foreground", className)}>
      {unplaced.length > 0 ? (
        <>
          <span className="text-foreground">{unplaced.join(", ")}</span> not found.
        </>
      ) : null}
      {notes.map((note) => (
        <span key={note.text}> {note.text}</span>
      ))}
      {nothing ? "Nothing in that to filter on." : null}
    </p>
  )
}
