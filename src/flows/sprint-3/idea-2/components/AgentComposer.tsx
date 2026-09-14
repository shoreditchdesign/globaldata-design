"use client"

import { useState } from "react"
import { XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { agentRequest, suggestedRequests } from "@/flows/sprint-3/idea-2/data"
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
 * is the one thing a panel claiming to show its work cannot do. The suggestions
 * fill the field rather than firing, for the same reason — and the one that
 * runs is marked, so picking another is not a promise the prototype breaks.
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
      {/* Click to fill, not to run. The wired one leads and says so; the rest
          are there to show the shape of what you could ask. */}
      <div className="mb-2 flex flex-wrap gap-1.5">
        {suggestedRequests.map((suggestion) => (
          <button
            key={suggestion.text}
            type="button"
            onClick={() => setRequest(suggestion.text)}
            className="border-border text-muted-foreground hover:bg-accent hover:text-foreground flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors"
          >
            <span className="truncate">{suggestion.label}</span>
            {suggestion.text === agentRequest ? (
              <span className="text-brand-ink shrink-0">wired</span>
            ) : null}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        {/* The field keeps the well every other input in this prototype sits in;
            it is on the panel's chrome plate, so the white is what separates the
            thing you type into from the plate it sits on. */}
        <InputGroup className="bg-surface-panel flex-1">
          <InputGroupInput
            value={request}
            onChange={(event) => setRequest(event.target.value)}
            aria-label="Ask the agent for a set of drugs"
            className="md:text-[13px]"
          />
          {/* Clearing the line should not mean holding backspace, so the clear
              lives in the field and appears only when there is something in it. */}
          {request.length > 0 ? (
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => setRequest("")}
                aria-label="Clear the request"
              >
                <XIcon />
              </InputGroupButton>
            </InputGroupAddon>
          ) : null}
        </InputGroup>

        <Button type="submit" size="sm" disabled={!wired} className="shrink-0">
          Send
        </Button>
      </div>

      {/* Stays, under the copy rules: it is the disclosure that separates what
          is prototyped from what is real, and it is what the disarmed send
          means. */}
      <p className="text-muted-foreground mt-1.5 text-xs">
        One request is wired in this prototype.
      </p>
    </form>
  )
}
