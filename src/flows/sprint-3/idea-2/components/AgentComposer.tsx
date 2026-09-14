"use client"

import { useState } from "react"
import { ArrowUpIcon } from "lucide-react"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { agentRequest } from "@/flows/sprint-3/idea-2/data"
import type { Screener } from "@/flows/sprint-3/idea-2/use-screener"

/**
 * The way in to the agent: a line you can read before you send it.
 *
 * The spotlight it replaces was a door with nothing written on it — the request
 * only existed once the overlay was open, and the overlay covered the columns
 * the request was about. The field sits at the foot of the panel instead, with
 * the wired request already in it, so what the agent is about to be asked is
 * legible from the screen and the columns it will drive stay in view while it
 * works.
 *
 * One request is wired and the plan behind it is authored, so the send is live
 * only while the line is the one the plan answers. Editing it disarms the
 * button rather than running the same steps under a different sentence, which
 * is the one thing a panel claiming to show its work cannot do.
 */
export function AgentComposer({ screener }: { screener: Screener }) {
  const [request, setRequest] = useState(agentRequest)
  const wired = request.trim() === agentRequest

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        if (wired) screener.submitRequest(agentRequest)
      }}
    >
      {/* The field keeps the well every other input in this prototype sits in;
          it is on the panel's chrome plate, so the white is what separates the
          thing you type into from the plate it sits on. */}
      <InputGroup className="bg-surface-panel">
        <InputGroupInput
          value={request}
          onChange={(event) => setRequest(event.target.value)}
          aria-label="Ask the agent for a set of drugs"
          className="md:text-[13px]"
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            type="submit"
            variant="default"
            size="icon-xs"
            disabled={!wired}
            aria-label="Send the request"
          >
            <ArrowUpIcon />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>

      {/* Stays, under the copy rules: it is the disclosure that separates what
          is prototyped from what is real, and it is what the disarmed send
          means. */}
      <p className="text-muted-foreground mt-1.5 text-xs">
        One request is wired in this prototype.
      </p>
    </form>
  )
}
