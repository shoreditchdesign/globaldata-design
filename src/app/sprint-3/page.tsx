import { redirect } from "next/navigation"

/** The landing table replaced the sprint overview — send anyone here back to it. */
export default function Page() {
  redirect("/")
}
