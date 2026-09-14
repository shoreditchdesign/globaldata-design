"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronDownIcon } from "lucide-react"

import { Collapsible, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { statusLabel } from "@/flows/status"
import { cn } from "@/lib/utils"
import type { Flow } from "@/flows/types"

export interface SprintTableIdea {
  id: string
  name: string
  premise: string
  status: Flow["status"]
  /** ISO date, `YYYY-MM-DD`. */
  lastUpdated: string
  /** Omitted for ideas that have no real screens yet. */
  screenCount?: number
  tags: string[]
  href: string
}

export interface SprintTableSprint {
  id: string
  name: string
  goal: string
  ideas: SprintTableIdea[]
}

/** How far along an idea is, as one dot. Deepens as it advances. */
const statusDot: Record<Flow["status"], string> = {
  placeholder: "bg-muted-foreground/30",
  "in-progress": "bg-chart-3",
  review: "bg-chart-2",
  final: "bg-brand",
}

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

/** Formatted from the string, not a `Date` — no locale or timezone drift. */
function formatDate(iso: string) {
  const [year, month, day] = iso.split("-")
  const name = months[Number(month) - 1]
  if (!name || !day || !year) return iso
  return `${Number(day)} ${name} ${year}`
}

/** Most recent `lastUpdated` in a sprint, for the parent row. */
function latest(ideas: SprintTableIdea[]) {
  return ideas.reduce((max, idea) => (idea.lastUpdated > max ? idea.lastUpdated : max), "")
}

const MAX_TAGS = 2

/**
 * The index: a dense data table, one collapsible parent row per sprint and one
 * child row per idea. Fixed-width leading slots keep the chevron and status dot
 * in the same lane on every row, parents included.
 */
export function SprintTable({
  sprints,
  defaultOpen,
}: {
  sprints: SprintTableSprint[]
  /** Sprint ids expanded on first render. */
  defaultOpen: string[]
}) {
  const [open, setOpen] = useState<string[]>(defaultOpen)

  return (
    <Table className="table-fixed">
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <Th className="w-9" />
          <Th className="w-7" />
          <Th className="w-[288px]">Idea</Th>
          <Th className="w-[92px]">Screens</Th>
          <Th className="w-[124px]">Updated</Th>
          <Th>Premise</Th>
          <Th className="w-[230px]">Tests</Th>
          <Th className="w-[104px]">Status</Th>
        </TableRow>
      </TableHeader>

      {sprints.map((sprint) => {
        const isOpen = open.includes(sprint.id)
        const toggle = () =>
          setOpen((current) =>
            current.includes(sprint.id)
              ? current.filter((id) => id !== sprint.id)
              : [...current, sprint.id],
          )

        return (
          <Collapsible key={sprint.id} open={isOpen} onOpenChange={toggle} asChild>
            <TableBody className="[&_tr:last-child]:border-b">
              <TableRow className="cursor-pointer" onClick={toggle}>
                <Td className="pl-1">
                  <CollapsibleTrigger asChild>
                    <button
                      type="button"
                      onClick={(event) => event.stopPropagation()}
                      aria-label={`${isOpen ? "Collapse" : "Expand"} ${sprint.name}`}
                      className="text-muted-foreground hover:text-foreground flex size-6 items-center justify-center rounded-md"
                    >
                      <ChevronDownIcon
                        className={cn("size-3.5 transition-transform", !isOpen && "-rotate-90")}
                      />
                    </button>
                  </CollapsibleTrigger>
                </Td>
                <Td>
                  <Dot className={sprint.ideas.some((i) => i.status !== "placeholder")
                    ? "bg-foreground"
                    : "bg-muted-foreground/30"} />
                </Td>
                <Td className="font-medium">{sprint.name}</Td>
                <Td className="text-muted-foreground tabular-nums">
                  {sprint.ideas.length} ideas
                </Td>
                <Td className="text-muted-foreground tabular-nums">
                  {formatDate(latest(sprint.ideas))}
                </Td>
                <Td className="text-muted-foreground truncate italic">{sprint.goal}</Td>
                <Td />
                <Td />
              </TableRow>

              {isOpen
                ? sprint.ideas.map((idea) => <IdeaRow key={idea.id} idea={idea} />)
                : null}
            </TableBody>
          </Collapsible>
        )
      })}
    </Table>
  )
}

function IdeaRow({ idea }: { idea: SprintTableIdea }) {
  const router = useRouter()
  const shown = idea.tags.slice(0, MAX_TAGS)
  const overflow = idea.tags.length - shown.length

  return (
    <TableRow className="cursor-pointer" onClick={() => router.push(idea.href)}>
      <Td />
      <Td>
        <Dot className={statusDot[idea.status]} />
      </Td>
      <Td className="truncate">
        {/* Real link so the row is keyboard reachable and opens in a new tab. */}
        <Link
          href={idea.href}
          onClick={(event) => event.stopPropagation()}
          className="hover:text-brand-ink underline-offset-2 hover:underline"
        >
          {idea.name}
        </Link>
      </Td>
      <Td className="text-muted-foreground tabular-nums">{idea.screenCount ?? "—"}</Td>
      <Td className="text-muted-foreground tabular-nums">{formatDate(idea.lastUpdated)}</Td>
      <Td className="text-muted-foreground truncate italic">{idea.premise}</Td>
      <Td>
        <span className="flex items-center gap-1">
          {shown.map((tag) => (
            <span
              key={tag}
              className="bg-muted text-muted-foreground max-w-[96px] truncate rounded-full px-2 py-0.5 text-[10px]"
            >
              {tag}
            </span>
          ))}
          {overflow > 0 ? (
            <span className="text-muted-foreground rounded-full border px-1.5 py-0.5 text-[10px] tabular-nums">
              +{overflow}
            </span>
          ) : null}
        </span>
      </Td>
      <Td className="text-muted-foreground">{statusLabel[idea.status]}</Td>
    </TableRow>
  )
}

/** Fixed-width slot so the dot sits in the same lane on every row. */
function Dot({ className }: { className: string }) {
  return (
    <span className="flex size-6 items-center justify-center">
      <span className={cn("size-1.5 rounded-full", className)} />
    </span>
  )
}

function Th({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <TableHead
      className={cn(
        "text-muted-foreground h-8 px-3 text-[10px] font-medium tracking-[0.12em] uppercase",
        className,
      )}
    >
      {children}
    </TableHead>
  )
}

function Td({ className, children }: { className?: string; children?: React.ReactNode }) {
  return <TableCell className={cn("px-3 py-2.5 text-sm", className)}>{children}</TableCell>
}
