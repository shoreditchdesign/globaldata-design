# Neil Dodgson — position ledger

Every stated preference on the interface, pulled from Granola transcripts and organised by
subject rather than by date, so a designer can look up a topic and see everything said about it in
one place. Grounded in the meetings listed at the bottom. Quotes are verbatim (lightly trimmed with
"…") and attributed by speaker, meeting and date. Where I'm inferring rather than quoting, it's
marked **[inference]**.

A note on attribution: Granola's transcript only labels turns "Me" (Austin, the note-taker) and
"Them" (everyone else on the client side, undifferentiated). Where a meeting had one client
attendee this is unambiguous. Where several were on the call, speaker identity is worked out from
content (self-references, who the other speakers address by name, and cross-checks against
`CLIENT-CONTEXT.md`). **The 13 Aug and 2 Sep calls are the ones that matter and are the most
reliable** — Neil is confirmed on both. The 11 Aug In-Office Catch-up had **only Richard** on the
client side (confirmed from meeting metadata) — none of the opinions from that call are Neil's,
even where Richard is clearly relaying or role-playing Neil's stated position. I've flagged this
explicitly under Search model, since it's the one place a Richard quote could be misread as Neil's.

---

## 1. Results grid / table

**Firm position, repeated.** This is one of his clearest, most concrete complaints.

- Neil, *Sprint 1 Review (Design)*, 13 Aug: on the results table — *"the grid falls off the side of
  the screen."*
- Neil, same meeting, immediately after: *"instead of having it for each entry... a linear kind of
  list of things like it's an excel spreadsheet, you could create a multi row entry for that... a
  bit more, almost like pill like."* He offered to send concrete examples separately ("I'll send
  you something offline... I've done things in the past").
- **Corrected attribution.** The line *"14,000 different versions of the grid that have different
  functionalities and there's no consistency between them"* was originally logged here as Neil's,
  at the 2 Sep Design Sync. Re-checked against the transcripts: it is **Richard Barnett's**, from
  the separate *In-Office Catch-up*, 11 Aug (a Richard-only call). What Neil said on 2 Sep was
  *"15,000 variations of tables"*, in a different context — while mandating **AG Grid as the single
  grid component** for the rebuild. Dev-facing, but it is a consistency mandate that bears directly
  on how the design system should spec any results table. Use the corrected version in
  `sprints/sprint-3/ideas/IDEA-4-EVIDENCE.md`.

**Design implication:** build the results view as a non-linear, multi-row "card/pill" grid rather
than a flat spreadsheet-style table with columns running off-screen; whatever grid pattern is
chosen, spec it once and reuse it everywhere rather than proposing a bespoke grid per screen.

---

## 2. Hierarchy depth / nesting

**Firm concern, stated once but pointed and specific — this is the load-bearing quote of Sprint 1.**

- Neil, *Sprint 1 Review*, 13 Aug, reacting to the side-nav/accordion-tree approach: *"if that's what
  you think, I think you have to stress test it... if it goes many more [levels] than that, suddenly
  it becomes really, really nasty to manage... you're getting sections upon sections upon sections,
  and then you have to go up and close them all to go anywhere."* He tied this directly to data
  volume: *"the overwhelming amount of stuff that we've got... might overwhelm that UI. That's why
  it concerns me."*
- Neil, *Design Sync*, 2 Sep, on the manual filter tree in the Sprint 2 modal: *"I feel like on the
  trees I lose the context. I can't have multiple things open at the same time, so I lose
  functionality. So I'm not a fan of the trees, I suppose."*

**Design implication:** any tree/accordion filter navigation must be stress-tested against the
actual number of levels and volume of items in GlobalData's real taxonomy before being proposed —
not shown as a clean two-level demo — and must let the user see/keep open more than one branch at a
time; a strictly linear "go down, go back up" tree pattern is something he's now rejected twice.

**Not from Neil, but relevant colour [attribution note]:** in the *In-Office Catch-up*, 11 Aug —
Richard only, no Neil — Richard reacted to a filter mock-up with *"How do we do three levels?"* and
pushed for a menu → breadcrumb → next-menu pattern (*"you actually turn it into a menu... it's home,
drugs. And then I've chosen Target, it's home, drugs, Target"*). This is Richard's own view, not a
quote from or report of Neil, and shouldn't be treated as Neil's position — but it agrees directly
with Neil's hierarchy concern above, so it's useful supporting evidence for the same design
direction.

---

## 3. Navigation / top nav

**Not from Neil directly — flagged for completeness, don't over-weight it.**

- Richard (not Neil — see attribution note above), *In-Office Catch-up*, 11 Aug: *"I really don't
  like the top navigation... it goes off the end, and that's a problem in the navigation on the
  platform right now, which is just for the fact they've allowed that is just disgraceful."* He
  proposed collapsing it into a simple top-level menu (Companies / Drugs / Licensing Opportunities /
  Regulatory Milestones / etc.) with breadcrumbs, rather than mega-menu rolldown.
- Neil has **not** directly commented on top navigation in any transcript reviewed. His nav-adjacent
  comments are all really about filter hierarchy (§2) and the results grid (§1), not the global nav
  bar.

**Design implication [inference]:** treat top-nav restructuring as Richard's opinion, worth
carrying forward as background, but not something to present to Neil as "the thing he asked for" —
he hasn't asked for it.

---

## 4. The Sprint 2 filter-builder modal

**Firm, and this is where Sprint 2 went wrong on substance (separate from the process complaint in
§8).**

- Neil, *Design Sync*, 2 Sep, first reaction: *"modals that you like, you click off it, it
  disappears. It's good. The devil's in how it actually operates."*
- Neil, same meeting, on the decision to make it modal rather than a side tray: he asked directly
  *"one is to place it modal... versus kind of like tray out from the left... I'm just wondering the
  thinking behind that"* — i.e. he questioned this decision rather than endorsing it.
- Neil, same meeting, on the manual filter tree specifically: *"I'm not sure how much we've solved
  for in the advanced [tab]... Feels like we're delivering a similar number of clicks to the way we
  have it today."*
- Neil, same meeting, naming the loss precisely: *"I feel like on the trees I lose the context. I
  can't have multiple things open at the same time, so I lose functionality."*
- Neil, same meeting, naming the problem word directly: *"I'm just a bit concerned that it's a bit
  fiddly when you... hit the modal environment versus kind of having the full pane to work with."*
- Neil, same meeting, proposing the fix: *"Is there... do we maybe make this a full-screen
  takeover? So rather than... having this pop up from the screen below it, this can just be like a
  full screen element."*
- Also worth keeping: he did **not** reject the modal outright — *"But it's a definite step up from
  where we were last time you showed me"* — the fiddliness/context-loss complaint is about the
  interaction inside it, not the concept.

**Design implication:** don't default to a modal for a multi-step filter build; if a contained
overlay is used at all, it needs to support multiple expanded branches simultaneously without
losing place, or move to a full-screen takeover as he explicitly suggested. Treat "full pane, not a
modal" as a direct, repeated request, not a nice-to-have.

---

## 5. AI / natural-language search

**Firm, recurring, and — per the team's own internal read — the single most consistent theme across
every design call.** Jack himself noted this live: *"I know every single meeting we've had so far
we brought up AI"* (*Sprint 1 Review*, 13 Aug).

- Neil, *Sprint 1 Review*, 13 Aug, on the "search bar refines the left-hand filters" concept: *"if
  you're going to start talk about search and typing things in, then it should be natural language
  AI. Bot type interface."* He then posed the follow-up that the team still hasn't resolved: *"how
  do you combine being able to use natural language and then saying, well, actually I want to
  structure my search?"*
- Richard (not Neil), *In-Office Catch-up*, 11 Aug, arguing the same direction more forcefully: *"I
  don't know who they have this tool called Ava. Really should be [reflected] in here"* — i.e. any
  new AI search should route through GlobalData's existing agent Ava, not become a separate bot.
  This is a Richard position, but one Neil never contradicted and one that surfaced again on 2 Sep
  as an evaluation criterion (below).
- Neil, *Design Sync*, 2 Sep — his AI benchmark is external and specific, and it's the source of the
  whole velocity complaint: *"I've sat here in India today and seen a demo from someone who's had
  Claude for 2 days. They've built me 10 pages of interface with 3 different options..."*
- Neil, same meeting, listing it as one of his four named evaluation criteria (see §7): *"ability to
  bridge natural language"* / *"allow for quick AI editing [of] filters."*
- Neil, same meeting, on the AI filter tab specifically (the one part of Sprint 2 he engaged with
  positively): asked *"can I edit the right side immediately?"* and confirmed he understood it as
  *"a natural language filter builder... an AI-like natural language filter builder"* — he did not
  criticise the AI tab's mechanics the way he criticised the manual tree.

**Design implication:** any advanced-search concept must show how typed natural language and
structured filtering coexist (this is an open question he asked outright and no transcript shows it
being answered), and any AI-driven filtering should visibly connect to or reuse "Ava" rather than
introduce a second bot brand. The AI tab of the Sprint 2 modal is the one piece of that work he
reacted to without complaint — worth protecting, not rebuilding, in Sprint 3.

---

## 6. Search model: does the user know what they're looking for? — **UNRESOLVED, CONFLICTING**

This is the one place positions genuinely conflict, as flagged in the brief. Put side by side:

> **Neil's own stated model — the "screener":** *"Why do I need to see everything at the point that
> I go in? I'm not interested in every drug out there. I want to set the criteria that then when I
> hit the return key... it gives it to me... I rebranded it a screener. That's basically what I'm
> doing. I'm screening."*
> — reported/quoted within Richard's account, *In-Office Catch-up*, 11 Aug (Richard is voicing
> Neil's own words back to Austin/Jack while explaining his view — this is Neil's stated model,
> relayed by Richard, not a live Neil quote from this call).

> **Richard's direct disagreement, same breath, same meeting:** *"I actually disagree with Neil. I
> think what Neil's doing is accommodating existing mindset."* Richard's counter-model: *"we are AI
> natural language native and you just type in whatever you want to see."*
> — Richard, *In-Office Catch-up*, 11 Aug.

> **The internal team's own read, cutting the other way:** per `CLIENT-CONTEXT.md` (§5,
> Constraints), the internal *GD Catchup* notes from 10 Aug record: *"Neil confirmed users often
> don't know exactly what they're searching for upfront"* — the opposite of the screener model. I
> could not re-derive this exact line from the raw transcript of *GD Catchup* (10 Aug) in the portion
> reviewed — it's carried over from the earlier report and flagged here as unverified in the primary
> source, not independently re-confirmed.

**This is unresolved.** Neil's own default working model (stated firmly, in his own words, as
recently as 11 Aug) is that users set criteria up front, then retrieve results — the "screener." His
consultant explicitly thinks this is Neil "accommodating existing mindset" rather than pushing users
toward AI-native search, and there's a secondhand note suggesting Neil himself has, elsewhere,
described users as not always knowing what they want upfront. **Do not design against a single
resolved persona here.** Either surface both search models as explicit options with the "screener"
one built out fully (since it's Neil's own stated preference and the safer bet), or ask directly
which one he wants tested — this is exactly the kind of named, resolvable ambiguity his 2 Sep
criteria ask for.

**Design implication:** default Sprint 3 exploration to the "screener" flow (set criteria → hit
search → get results, refine after) since that's Neil's own repeated first-person description of
how he personally uses the product, but present an AI-native "type first" alternative alongside it
rather than silently picking one — the ambiguity is real and unresolved in the record.

---

## 7. Users / personas

- Bina, *Sprint 1 Review*, 13 Aug, agreeing with Richard's grid complaint: *"given the type of
  persona probably we are dealing here with they are more habituated towards using Excel... sorting,
  searching etc. even the average, mean, median if it is required... something on top level or like
  in a row would be much easier to read and work on"* rather than buried in a sidebar. **Confidence:
  firm, stated once, directly on-topic — treat as a real constraint, not throwaway.**
- Reported (not directly quoted live by Neil in any transcript read, relayed via internal notes and
  Jack's channel message): per `GD Catchup`, 10 Aug — Jack asked the client team how often users know
  exactly what they're searching for; the answer relayed back was *"Neil then said screening for a
  list more often than not, sometimes for a specific drug profile on average three to four
  parameters applied also potentially seeking different outputs of the same search."* This is the
  source of the "3–4 filter parameters" usage pattern and ties directly into the screener-model
  question in §6.
- Richard, *In-Office Catch-up*, 11 Aug, on personas generally: *"there's no clear user personas
  exist internally; customer success team knows what clients ask for but not why."* Not Neil's
  words, but nobody has contradicted this — no formal personas exist as of the last meeting
  reviewed.
- Neil has not personally commented on device/browser mix; he deferred that to "Luke" and never
  followed up with data in any transcript reviewed.

**Design implication:** put sort, filter, and aggregate functions (mean/median) at the top level of
the results view, not nested in a sidebar — this is a directly stated, unopposed constraint from
Bina and matches Neil's grid complaint (§1). Design for a "screening for a list" majority use case
of 3–4 parameters, not deep single-record lookups, as the primary path.

---

## 8. Process, evaluation criteria, and velocity — the actual blow-up

This is the dominant subject of the 2 Sep call and, per the existing `CLIENT-CONTEXT.md`, the real
cause of the relationship strain — more so than any one design decision.

- Neil, *Design Sync*, 2 Sep, the core complaint: *"I've sat here in India today and seen a demo from
  someone who's had Claude for 2 days. They've built me 10 pages of interface with 3 different
  options... There's a velocity that I'm just not seeing."*
- Neil, same call: *"I'm looking at one after 4 weeks. I'm looking at one click-through journey."*
- Neil, same call, explicit that this is not about visual polish: *"We're not asking you at the
  moment for like visual treatments, color schemes... We're asking for functional options that show
  we've understood the problem."*
- Neil, same call, the sharpest single line: *"It's a conclusion without— you've almost presented the
  conclusion without the working... without us giving you feedback on the work."*
- Neil, same call, what he wants instead, close to verbatim: *"here's a range of things that we have
  considered, and we've considered them based on the following criteria... here's a range of
  options, and we like this one over this one for the following reasons."*
- Neil, same call, the worked example he gave unprompted: *"if you'd come to me and say we looked at
  3 ways of doing the tree view, Neil, right? Pros of a classic tree view with expand collapse... but
  hey I can multi-select really quickly... the negative is people don't know if you select the
  parent or the child... So we decided not to do a tree... I'd be going, okay, I may weigh things
  differently, but I can see the thought process."*

**Design implication:** every future review must show the discarded options and the stated reasons
for discarding them, not just the winner — this came from the client, stated explicitly, and should
be treated as a standing process mandate for Sprint 3 and beyond, not a one-off note.

---

## 9. The four evaluation criteria, quoted exactly

Neil, *Design Sync*, 2 Sep. He names these twice in slightly different words in the same call; both
versions are given since they're each short and the wording differs slightly:

- *"the outcome is reduce clicks. It's... reduce cognitive load. It's allow for quick AI editing and
  filters and so on."*
- *"Number of clicks to execute a query, ability to bridge natural language, whatever, whatever your
  criteria are. And say, and then there's a question of, like, we've asked, is it going to be modal,
  non-modal?"*

Read together, the four criteria are: **(1) number of clicks, (2) cognitive load, (3) natural
language / AI-editability, (4) modal vs. non-modal.** **Confidence: as firm as it gets** — stated
twice, unprompted, in direct response to being asked what "good" looks like.

**Design implication:** score every Sprint 3 option against these four named criteria explicitly,
in the deliverable itself, using his own vocabulary — not a designer's paraphrase of them.

---

## 10. How he wants work presented — separate from the design itself

- Neil, *Design Sync*, 2 Sep, on the React/Stencil tech deck specifically, but the principle is
  general: *"you were hedging your bets. You were not fully committed... It read like a discussion
  document with a conclusion, and I really just... want to sit with the CTO... and go, we've
  reviewed it with Shoreditch, their agreement... This is where we're at in the process. This is some
  links which show what we've delivered and built, screenshots and walk you through it."* He wants a
  **stated recommendation up front**, not a balanced options memo with the recommendation buried at
  the end, and he wants **links/screenshots he can walk a third party through** rather than a
  narrated deck alone.
- Neil, same call, on cadence: *"more regular check-ins... every 2 days or every 3 days"* rather than
  end-of-sprint reveals — repeated more than once in the same call.
- Neil, same call, on tone: he explicitly invited bluntness and said he'd rather hear the unfiltered
  version — *"Can I be very direct here though"* / (Austin's response) *"Please be."* — worth noting
  as a working-style signal: he responds better to direct pushback than to hedged agreement.

**Design implication:** lead every deliverable with a stated recommendation and the criteria used
to reach it, hold the discarded-options detail as backup rather than the headline, and default to a
2–3 day check-in cadence rather than a sprint-end reveal.

---

## Conflicts summary

Only one clear, direct conflict surfaced in the record — the search model in §6 (screener vs.
"users don't know what they're searching for"). Everything else Neil has said is either consistent
across calls (AI/natural-language, hierarchy depth, results grid, process/velocity) or was said only
once without being repeated or contradicted (Excel-habituated persona point, evaluation criteria).

---

## Things he has never commented on

Absence of opinion, across two sprints of client-facing design review:

- **Visual design, colour, typography.** Explicitly out of scope by his own words: *"We're not
  asking you at the moment for like visual treatments, color schemes."* (2 Sep). This is a
  deliberate exclusion, not an oversight — but it also means there's no signal at all on visual
  direction, and probably real room to move there.
- **The detail/record page** for an individual drug or company. The brief's own core journey is
  filter → view detail page → export, but no transcript shows Neil reacting to a detail page design
  at all — only to the filtering/search step.
- **Export to Excel.** Referenced constantly as *why* users bypass the UI (per `CLIENT-CONTEXT.md`
  §2), but Neil has not commented on what an in-product export flow should look like.
- **Empty states.** Internally debated by the design team (*GD Catchup*, 10 Aug — Jakob's "we
  shouldn't really ever have empty states before search category" point) but never put in front of
  Neil or reacted to by him in any transcript reviewed.
- **Approaches 2 and 3 from Sprint 1** (search-first with an advanced modal; combined search +
  filter). He reacted specifically and by name to Approach 1 (the stepper/side-nav) and to the
  results grid; Approaches 2, 3 and 4 (Linear-style inline tags) were shown but not individually
  discussed with him on the call before time ran out. **Not covered** — worth deliberately
  resurfacing rather than assuming he's ruled them out.
- **Mobile / tablet / responsive behaviour.** Raised by Richard (11 Aug — "how often do people use
  this on tablets") and flagged as an open question in `CLIENT-CONTEXT.md`, but Neil himself has not
  weighed in.
- **Accessibility and keyboard/screen-reader behaviour.** Discussed at length between Austin and the
  dev/design-system side (atomic design, escape-key behaviour on modals) but never raised with or by
  Neil.
- **Save-search / saved-view functionality.** Proposed by Richard (11 Aug: *"of course you can save
  a search"*) as a way to soften the screener model, but not something Neil has personally endorsed
  or rejected.

---

## Meetings used

- *GlobalData ↔ Shoreditch: Sprint 1 Review (Design)* — 13 Aug 2026 (full transcript read; Neil,
  Bina, Harriet, Richard present)
- *Shoreditch Design Sync: Design and Tech* — 2 Sep 2026 (full transcript read; Neil present and the
  dominant client voice throughout)
- *GlobalData: In-Office Catch-up* — 11 Aug 2026 (full transcript read; **Richard only** on the
  client side — no Neil, confirmed via meeting metadata)
- *GD Catchup* — 10 Aug 2026 (full transcript read; internal, no client attendees — contains a
  relayed Neil quote via Jack)
- *GlobalData: Debrief and Next Steps* — 24 Aug 2026 (full transcript read; internal, no client
  attendees — contains the "chatbot vs. half-and-half" reference, no new Neil quotes)
- *GlobalData ↔ Shoreditch: Sprint 2 Wrap / Sprint 3 KO (Design)* — 1 Sep 2026 (full transcript read;
  Neil and Harriet both absent — scheduling only, no design content)
- *GlobalData ↔ Shoreditch: Tech Architecture & Sprint Alignment* — 12 Aug 2026 (full transcript
  read; dev/tech only, no design-preference content, no Neil)
- *GlobalData ↔ Shoreditch: Sprint 2 KO (Development)* — 24 Aug 2026 (full transcript read; Neil
  present but content is entirely React/Stencil/tooling — no interface-design content)
- *Design Sprint Walkthrough* — 3 Sep 2026 (partially read; design-system/Storybook/dev content, no
  new interface-preference material found on the sections reviewed)

Not re-read for this ledger (already covered adequately by `CLIENT-CONTEXT.md` and not flagged by
the brief as priority): *GlobalData: Kick-off discussion* (3 Aug, internal), *Shoreditch / GlobalData
Dev Intro* (3 Aug), *Shoreditch x Midnight: GlobalData brief* (5 Aug).
