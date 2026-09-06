import type { Flow } from "@/flows/types"

/** Human label for a flow status. `placeholder` reads as not-yet-built. */
export const statusLabel: Record<Flow["status"], string> = {
  placeholder: "Not built",
  "in-progress": "In progress",
  review: "In review",
  final: "Final",
}

/** Badge variant per status, kept inside the shadcn token set. */
export const statusVariant: Record<Flow["status"], "outline" | "secondary" | "default"> = {
  placeholder: "outline",
  "in-progress": "secondary",
  review: "secondary",
  final: "default",
}
