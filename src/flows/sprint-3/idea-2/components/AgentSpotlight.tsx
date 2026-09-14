"use client"

import { SparklesIcon } from "lucide-react"

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { agentRequest } from "@/flows/sprint-3/idea-2/data"
import type { Screener } from "@/flows/sprint-3/idea-2/use-screener"

/**
 * The agent, summoned rather than resident.
 *
 * Nothing of it sits on the canvas: no bar, no header, no panel taking a band
 * of the layout. It is a spotlight on ⌘K, it takes one request, and it goes.
 * Everything it then does happens in the filter panel, in full view, which is
 * the direction's argument — the agent works the controls a person works, so
 * it does not need a surface of its own to work them from.
 *
 * `CommandDialog` already lands at a third of the way down with no close
 * button, which is the Spotlight geometry; Escape and the outside click are
 * Radix's.
 */
export function AgentSpotlight({ screener }: { screener: Screener }) {
  return (
    <CommandDialog
      open={screener.spotlightOpen}
      onOpenChange={(open) =>
        open ? screener.openSpotlight() : screener.closeSpotlight()
      }
      title="Ask the agent"
      description="Ask for a set of drugs in plain language."
      className="max-w-[560px] sm:max-w-[560px]"
    >
      <Command>
        <CommandInput placeholder="Ask for a set of drugs" />
        <CommandList>
          <CommandEmpty className="text-muted-foreground">
            One request is wired in this prototype.
          </CommandEmpty>
          <CommandItem
            value={agentRequest}
            onSelect={() => screener.submitRequest(agentRequest)}
          >
            <SparklesIcon className="text-muted-foreground" />
            {agentRequest}
          </CommandItem>
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
