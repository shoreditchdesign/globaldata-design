# Sprint 3 — scratchpad

Loose working notes. Nothing here is a deliverable.

## 2026-09-14 — Calmer brand, button states off it, Idea 3 onto the wireframe rule

Three pieces of design logic from today, so they don't get lost in the token diff:

- **The brand got quieter, not different.** Same hue, 264, but pulled in from `#0034ec`'s exact
  value — which sits on the sRGB gamut wall — to `oklch(0.49 0.205 264)` (`#2052d2`). The client
  asked for less saturation; pulling chroma in rather than lightness keeps the family recognisable
  as the same blue while giving the ramp headroom it didn't have before. See `CLAUDE.md` and
  `DECISIONS.md` for the full token table.
- **Button states are now steps off `brand`, not opacity or grey.** Hover and pressed are each one
  small, consistent step further in (lightness down, chroma down), so a button reads as *responding*
  rather than turning into a different colour. Disabled follows the same logic pushed further: a pale
  brand fill with a brand-derived label, not the flat neutral grey shipped on 2026-09-13. That grey
  read as "too greyed out," and separately its white label had gone invisible — which turned out to
  be a missing space in a class string in `button.tsx`, not a colour problem at all. Worth remembering
  before reaching for a design fix next time a label disappears.
- **Idea 3 moves onto the repo-wide wireframe colour rule** that's landing alongside this (see
  `CLAUDE.md`): the active tab and other selected/active states go to the black-fill `bg-selected`
  treatment instead of blue, hovers go grey, and brand is left doing only two jobs on this screen —
  the value chips and the `Edit` link. This supersedes the 2026-09-13 note below where the active tab
  was black text on white and chip hover was `brand-wash`.

Toned-down brand hasn't been reviewed in a browser yet — next session should look at it live before
calling it final.

Later the same day, the client reversed the black selected fill the wireframe rule above had just
introduced: it made the calmer blue feel overwhelming again, whereas the washed secondary blue reads
fine next to it. The design logic that settles it — **two blues, no black**:

- **Solid brand** is for the thing you press or tick — a button, a checkbox, a radio, a switch.
- **Washed brand** (`brand-tint` fill, `brand-border` edge) is for the thing that is *selected but not
  a press* — a tab, a toggle, an option in a list.
- **Grey** carries hover, everywhere.
- **No black**, anywhere, as a fill. Black next to blue reads as busy rather than deliberate — two
  strong, unrelated signals competing for the same attention blue is already spending.

The same logic settled Idea 3's rail: the plan had it a step darker than the card, but the page
ground and that grey were close enough to be indistinguishable, so there was no real in-between
surface to reach for. Where there's no grey to spare, a surface separates by a border instead — the
rail went back to white with a darker `border-edge` dividing it from the card, rather than inventing a
grey that wasn't there.

## 2026-09-14 — Idea 4 refinement: the thread, the grid, and the colour law settling

Another brain-dump session, dictated straight into the brief for Idea 4's refinement. Reading the
mangled bits against what was actually meant, the same way the Idea 3 session below did:

| Dictated | Read as |
|---|---|
| "white" | blue — the dictation kept dropping the accent's name and landing on its opposite |
| "z-agent" | Zed, the reference for the docked panel's shape: a sidebar with the context living in the thread rather than in chrome around it |
| "midfield led to wireframe" | mid-fidelity wireframe — the direction brief: one colour, neutral greys carrying structure, hover and focus |
| "text ROMs" | bottom-anchored thread rows — the turn list growing upward from the composer, Claude/ChatGPT-style, rather than a log that scrolls off the top |

**Mobbin research, used and not.** Pulled screens from Framer's agent panel (quiet grey process
rows, durations right-aligned), Cursor's collapsible "Thinking" → "Thought for N seconds", Clay
Sculptor's receipt rows and empty-state composer, Cofounder's past-tense step labels once a run
finishes, Twenty's suggestions pinned directly above the composer, and Databricks Assistant's
bordered "Added Untitled +36" receipt. Neither Zed nor Copilot Chat has screens on Mobbin, despite
Zed being the actual reference named in `NEXT-SESSION.md` — those stood in for it. Copy.ai's
"Transform completed" with nothing else showing was the counter-example, the flat receipt this
build was trying not to end up as.

**The colour reversal, mid-session.** The plan this session started from called for black selected
fills across the board — checkboxes, tabs, toggles, the works — as part of a mid-fidelity wireframe
read: blue only on primary buttons, chips and links, black everywhere else something was "on."
Partway through, the user's own words reversed that: *"remove black from being used as the
background for any secondary buttons or checkboxes altogether, because it looks very busy alongside
the blue."* What shipped instead, and what `CLAUDE.md` now documents as the standing rule: solid
brand for the thing you press or tick, washed brand (`bg-brand-tint` / `brand-border` /
`text-foreground`) for the thing that's merely selected, grey for hover, neutral for focus, no black
fill anywhere. `--selected` ended up aliasing the brand rather than black — one line in the tokens,
no call-site changes needed for checkboxes, radios, switches or the progress bar.

**Defaults chosen without a real answer available**, logged in case anyone disagrees later:
`StageBadge`'s blue ramp stays as data encoding rather than going grey; aggregates became an
opt-in summary row rather than an always-on strip; the multi-value `+N` opens a popover rather than
growing the row; the 46-drug sample's opening turn narrates a seeded prompt rather than starting on
an empty thread; the panel holds at 380px; and the propose-then-accept gate stays rather than
letting the agent apply changes straight away.

## 2026-09-13 — Idea 3 refinement, from dictated feedback

Feedback on the Idea 3 sentence screen came in as loose, sometimes-mangled dictation. Reading it
against the code before acting on it:

| Dictated | Read as |
|---|---|
| "harvest date" | `ValuePill` hover (`hover:bg-brand-border`) |
| "corners after filter fields" | the comma sitting hard against a chip (`QuerySentence.tsx`) |
| "editor's text" | the `edit as text` link and its pen icon |
| "sentence and filter" | the `Sentence` / `Filters` toggle, disabled pre-resolve |
| "fatalities" | functionalities |

The design logic underneath the individual fixes, so it does not get lost in the class-name diff:

- **Colour only for a link or a button, in Idea 3.** The client's read was line-by-line: a colour on
  screen should mean "you can act on this," not "the model got this right." That is narrower than
  CLAUDE.md's general accent rule (also active/selected states, chips), so it is scoped to this one
  direction rather than rewritten globally — see the open questions logged in `NEXT-SESSION.md`.
- **Layering still comes from the surface ladder, not the accent.** The results table's header
  reads as a separate plane by going back to opaque white on a darker chrome body, not by tinting it
  blue. Same instinct as the surface-ladder decision itself.
- **One measured number for alignment.** 45px — section padding (24) plus the card border (1) plus
  its inner padding (20) — now aligns the input text, the Export button and the table's outer cells
  on the same line, instead of three numbers that happened to look close.

See `DECISIONS.md` (2026-09-13 rows) for what actually shipped, and `flow.ts` for the current screen
notes.
