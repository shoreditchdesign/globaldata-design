# GlobalData — client context for Sprint 2

Reconstructed from Shoreditch's Granola meeting records (calls captured by Austin Joseph,
Aug 3 – Sep 3, 2026). Where something is inferred rather than said outright, it's marked as such.

## What you need to know

- Client is **GlobalData Plc** (FTSE 250, ~£320M revenue), specifically its **healthcare division**
  (~£120M ARR, carved out ~2 years ago with PE money, its own AWS instance). Product: a pharma/drug
  market-intelligence database — filter huge datasets, view detail pages, export to Excel.
- Two parallel workstreams run with GlobalData: **design** (Shoreditch) and **dev** (Shoreditch +
  a subcontractor, Midnight), on separate two-week sprint cycles that don't always line up.
- **Neil Dodgson** is the person whose opinion decides things. **Sprint 1 (Design)**, Aug 13, landed
  fine — four search/filter concepts, constructive critique, no blow-up.
- **Sprint 2 (Design)** is where it went wrong. The team built a filter-builder modal (AI tab +
  manual tab) and didn't get it in front of Neil until Sep 2 — by which point he'd seen an internal
  AI demo in Hyderabad and came in hot: not primarily about the modal (though he disliked that too),
  but about process — one polished option after four weeks, no visible evidence of alternatives
  considered or criteria used to choose. **He explicitly asked for a wide funnel of rapid options,
  compared against stated criteria, with the discarded options and reasoning shown — not a single
  refined answer.**
- That request is very likely the origin of this repo's "always ship independent ideas, not polish
  passes" convention. Treat it as a real client mandate, not house style.
- Renewal cycle (~60% of renewals fall mid-Sept–Dec) is the business clock behind all of this;
  usability is cited as a churn driver.
- Tech direction (React/Next.js vs. GlobalData dev team's Stencil preference) is a live, unresolved
  tension running alongside the design track — worth knowing about even if it's not your lane.

---

## 1. Who's who

**GlobalData side**

- **Neil Dodgson** (`neil.dodgson@globaldata.com`) — the primary stakeholder and the one whose sign-off
  matters. Directs both the design and dev workstreams; sits in on tech decisions (React vs. Stencil)
  as well as design reviews; meets with GlobalData's CTO and travels to the India dev team. Internally,
  Shoreditch briefed themselves before the first call that he's "the prickly stakeholder... Oxford
  grad, technically sharp" and that the client "has been burnt by an agency before, skeptical,
  high-pressure" (*GlobalData: Kick-off discussion*, Aug 3, internal). His exact title is never stated
  in any transcript — inferred to be a senior product/digital leadership role, not the CTO himself.
- **Harriet Osmond** — the other primary stakeholder alongside Neil. Handles admin/logistics (Teams
  access, OneDrive, scheduling), described internally as "likely PM-side, less technical" (Aug 3
  internal note). Her sign-off on Sprint 2 was still pending as of the Sep 1 wrap call.
- **Richard Barnett** (`richard.barnett.ctr@globaldata.com` — note the `.ctr`, i.e. contractor) —
  fractional CPO / strategy consultant, brought in ~4 weeks before Aug 11 by the PE investor on the
  healthcare side. Based in Hoxton, near Shoreditch's office. Highly opinionated, sets a lot of the
  vision-level direction (see Brief and Vocabulary below), but is not the final decision-maker and
  said his own contract runs out around **Sep 18, 2026**. Not present for the Sep 2 blow-up call.
- **Bina Patel** — project manager on the GlobalData side, based partly around a Bangalore
  colleague's hours ("I'm basically the project manager on this project").
- **Prabal Saha** — GlobalData's product manager, based in Bangalore.
- **Harry** — GlobalData's CTO / head of development (introduced live on the Sep 2 call), the
  primary React frontend developer on their side. Described by Richard as "fierce" — the team is
  "cautious"/"afraid" of him.
- **Sudheer Akuthota, Harinatha Reddy Gorla, Shiva Pusuluri, Srinivas Aleti** — GlobalData/India-based
  dev team members, built an independent Stencil-based component POC ("GD Elements") before
  Shoreditch's dev engagement was even scoped — a real coordination gap (see Constraints).
- **Sideep/Sadeep and Ravi** — GlobalData's AI team (Hyderabad), already doing "AI-native" search
  thinking; looped into design calls at Richard's suggestion.
- **Becky** — internal UX/design person at GlobalData, working within the existing nav structure on
  a parallel "mid-September interim release" (hygiene fixes ahead of the renewal cycle).
- **The CEO** (unnamed in transcripts) — final commercial decision-maker, described by Richard as
  "hands-on," "controlling"; the team including Neil is "a bit fearful" of him.
- **Jonathan ("Johnny")** — Head of Strategy, attends some calls; disliked being called "Jolly."
- **Luke** — holds device/browser usage stats; mentioned once, never directly on a call reviewed.

**Shoreditch side** (for reference): Austin Joseph (tech lead, note-taker for nearly all these
calls), Jack Tollman (design lead), Alex Gibson and Jakob O'Connor (designers), Mathew Dane (dev
support / "design engineer"), Emma James (ops). **Midnight** (Alice Larsson, Shaun Weaver) is the
dev subcontractor agency — deliberately kept off early client calls and positioned as "long-term
contractors" if asked, per the internal Aug 3 kickoff notes.

## 2. The actual brief

Read verbatim from the Sprint 1 Review deck (Aug 13): **"analyze the current database search
functionality and develop the recommendations for improving the user experience, usability, and
overall effectiveness."**

Business context, mostly from the *Shoreditch / GlobalData Dev Intro* (Aug 3) and *Shoreditch x
Midnight: GlobalData brief* (Aug 5):

- GlobalData Plc: FTSE 250, ~£320M revenue, ~80% subscription/ARR. The healthcare division (~£120M
  ARR) was carved out ~2 years ago with minority PE investment, runs its own governance and its own
  AWS instance. Sells by vertical (pharma, consumer goods, construction, professional services...).
- ~60% of renewals fall between mid-September and Dec 31. **Renewal rate is the primary KPI**, and
  churn analysis points to usability as a recurring complaint (NPS detractor comments, churn
  feedback).
- The platform today: a ~12-year-old .NET MVC build (Elasticsearch/vector search, MS SQL) with
  Angular, maintained partly by ~200 offshore developers in India. No design system, no Storybook —
  offshore handoffs "consistently break UI fidelity," which is itself "a cited reason for client
  churn at renewal."
- Core user journey: filter a large dataset, view detail pages, export to Excel. Customers "often
  bypass the UI entirely," downloading to Excel or increasingly using MCP/AI agents instead.
- Full replatform underway in parallel: legacy .NET MVC/Angular → React + Next.js. AWS architecture
  work is happening as a separate consulting stream. Target for the full redesigned platform:
  **"early Q1 next year."**
- Richard's framing (*GlobalData: In-Office Catch-up*, Aug 11): the platform "behaves more like a
  legacy website than a modern SaaS product" — mega menus, rolldown nav, additive feature growth
  with no system thinking, no responsive design at all.

## 3. Sprint 1 — what we showed and how it landed

**Sprint 1 Review (Design), Aug 13, 2026** — attendees: Neil, Bina, Harriet, Richard (client);
Jack, Alex, Austin (Shoreditch).

Shoreditch presented a product audit of GlobalData's current search/filter screen plus competitor
benchmarking (Sightline, BioMed Tracker, Hugging Face, Google Dataset Search, Linear), then four
directional approaches:

1. **Side navigation with accordion tree** — filters left, live results right, active filters as
   chips at top.
2. **Simple search-first with an advanced modal** for power users.
3. **Combined search + filters** ("search priority") — no separate screening step.
4. **Linear-style inline tags** — filters added via a "+" as editable tags rather than a permanent
   sidebar.

This landed reasonably well — it was **not** the meeting where the relationship soured. Neil engaged
constructively:

- Favoured Approach 1 conceptually: *"I think approach one worked quite nicely for me... it's
  almost like a stepper approach."*
- But flagged a real risk with hierarchy depth: *"if that's what you think, I think you have to
  stress test it... if it goes many more [levels] than that, suddenly it becomes really, really
  nasty to manage... you're getting sections upon sections upon sections."*
- Flagged the results grid as a UI problem independent of the filter question: it "falls off the
  side of the screen," and suggested exploring a non-linear, pill-style multi-row grid instead of a
  flat Excel-like list.
- Bina's point, worth carrying forward: the target personas are **"Excel-habituated,"** so sorting,
  filtering, and aggregate functions (mean, median) should sit at the top level, not be buried in a
  sidebar.
- AI-native search came up again — Neil's recurring view (echoed in nearly every call) is that any
  typed search should ultimately be natural-language/AI-driven, not just structured filtering.

## 4. Sprint 2 — what we showed and how it landed

This is the sprint that actually went badly, and it's the one this repo's Sprint 2 work is a direct
response to.

**What was built:** a filter-builder **modal** with two tabs — an "AI filter" (natural-language
input, parsed into an editable structured filter) and a "Manual filter" (progressive-disclosure
tree: areas → attributes → values). This matches the Paper source page this repo ports (see
`sprints/sprint-2/FLOW-NOTES.md`).

**Sprint 2 Wrap / Sprint 3 KO (Design), Sep 1** — Neil and Harriet, the two primary stakeholders,
were both absent (Neil busy, Harriet on leave). Only Richard attended from the client side, said he
liked the direction, and the real review was deferred.

**Shoreditch Design Sync: Design and Tech, Sep 2** — Neil finally saw it, and it landed badly. Two
distinct problems came up, and the second one mattered far more than the first:

- **The modal itself.** *"It's a definite step up from where we were last time you showed me,"* but
  *"I'm a bit concerned that it's a bit fiddly... versus kind of having the full pane to work
  with."* He lost context navigating up/down the filter tree and couldn't have multiple nodes open
  at once; asked the team to explore a full-screen takeover instead of a modal overlay.
- **Process and velocity — the bigger issue.** Neil had just seen an internal AI-assisted demo in
  Hyderabad: *"I've sat here in India today and seen a demo from someone who's had Claude for 2
  days. They've built me 10 pages of interface with 3 different options about the way to build
  dashboards. There's a velocity that I'm just not seeing."* Against that, four weeks of Shoreditch
  design work had produced one refined path: *"I'm just feeling like we've done a few pages in
  Figma over the course of 2 weeks... I'm looking at one after 4 weeks. I'm looking at one
  click-through journey."* His summary line: **"It's a conclusion without — you've almost presented
  the conclusion without the working... without us giving you feedback on the work."**
- He was explicit that this wasn't about visual polish: *"We're not asking you at the moment for
  like visual treatments, color schemes... We're asking for functional options that show we've
  understood the problem."* What he wanted instead: *"here's a range of things that we have
  considered, and we've considered them based on the following criteria — number of clicks, [to]
  build up cognitive load... here's a range of options, and we like this one over this one for the
  following reasons."*
- Shoreditch's response, on the call: they had in fact done more exploratory design work in the
  background than was shown, but hadn't communicated it — *"what we might have not done properly is
  communicate that work in the background... we can be a bit more transparent about the work that's
  gone on."* Shoreditch's stated rationale had been to converge on a considered approach rather than
  over-diverge within a short sprint; Neil's pushback reframed that as the wrong call for this
  client.
- Outcome: the design review was paused mid-call, to reconvene Friday with a redefined Sprint 3
  approach (see §6).

**A gap in the record:** the internal *GlobalData: Debrief and Next Steps* (Aug 24) refers to an
apparently well-received client review the same week — *"way better than last week"* — where the
client was shown a "chatbot-only" vs. "half-and-half" concept and preferred chatbot-only. No
client-facing transcript for that specific review turned up in the meetings searched; it may not
have been captured in Granola, or was captured by someone other than Austin. Worth asking the team
about directly.

## 5. Constraints

- **Users.** No formal personas exist inside GlobalData. Richard, Aug 11: *"there's no clear user
  personas exist internally; customer success team knows what clients ask for but not why."*
  Typical filter usage is 3–4 parameters, often screening for a list rather than one specific drug
  profile (*GD Catchup*, Aug 10). There's an unresolved internal disagreement about how deliberate
  users are: that same meeting notes "Neil confirmed users often don't know exactly what they're
  searching for upfront," while elsewhere Neil's own working model is the opposite — a **"screener"**
  workflow where users set criteria up front, then retrieve results (explicitly debated with Richard
  on Aug 11, who disagrees and thinks Neil is "accommodating existing mindset" rather than pushing
  users toward AI-native search).
- **Tech.** Legacy .NET MVC + Angular, moving to React + Next.js, TypeScript, CSS Modules (explicitly
  **not** styled-components or Tailwind), Base UI as the primitive layer (chosen partly to avoid
  Tailwind coupling — this differs from this repo's own shadcn/Tailwind stack, worth flagging since
  it's a different codebase). Storybook + Turborepo monorepo + Playwright visual regression,
  currently on GitHub/Vercel, migrating to Bitbucket/AWS. GlobalData's own dev team had been building
  an independent Stencil-based design system ("GD Elements") without telling Neil or Shoreditch — a
  live coordination risk flagged explicitly on Aug 12. As of Sep 3, GlobalData's dev team still had
  a week to "review and challenge" the React recommendation if they disagreed — not fully settled.
- **Timeline.** ~60% of renewals fall mid-September through Dec 31; that's the business clock behind
  the urgency. A separate, lower-key "interim release" (Becky + internal UX) targets hygiene fixes
  before that renewal window. The full redesign target is "early Q1 next year." Richard's own
  consulting engagement ends around Sep 18.
- **Internal politics.** The CEO is hands-on and controlling; the team (Neil included) is described
  as "a bit fearful" of him on big calls. Harry (dev/CTO) is "fierce," and his team is cautious
  around him. Design and dev workstreams have, at least once, run in parallel without proper
  cross-visibility (the Stencil POC). Shoreditch's own resourcing had been under-scoped for the
  actual workload, which fed directly into Neil's Sep 2 frustration about lack of visibility.
- **Off the table for now.** Full AI-native rebuild is the acknowledged direction of travel but was
  explicitly deferred early on ("that's not going to be ready yet"). A native desktop app via
  PWA/Electron was raised by Richard as feasible but agreed to be "too far ahead to raise with
  GlobalData now."

## 6. Vocabulary

- **"Screener"** — Neil/Richard's term for a search flow where the user sets filter criteria
  up front, then retrieves results, rather than iterating live. ("I rebranded it a screener.
  That's basically what I'm doing. I'm screening.")
- **"Ava"** — GlobalData's existing AI agent/tool. Richard's repeated point: any new AI search
  feature should route through Ava, not become a separate bot.
- **"Filter Builder"** — the shared object both the AI tab and the manual tab write into; the
  actual interface, more than the results table (per this repo's own `FLOW-NOTES.md`, and the
  Sep 2 meeting's internal title "Filter Builder Feedback").
- **"North Star vision"** — Richard's term for the aspirational, task/persona-oriented redesign
  he's pitching, distinct from the incremental UX fixes in scope right now.
- **"Orchestration"** — Richard's framing of what the platform should start doing for users instead
  of leaving them to assemble the answer themselves: *"clients currently do all the orchestration...
  GlobalData should do it for them."*
- **"Horror show"** — Richard's recurring description of the platform's existing analytic
  tools/grids (*"14,000 different versions of the grid that have different functionalities and
  there's no consistency between them"*).
- **"GD Elements"** — GlobalData dev team's own private Stencil component packages (core, React
  wrapper, icons, typography tokens), built independently of this engagement.
- **"Non-healthcare"** — internal GlobalData shorthand for the rest of the business outside the
  healthcare division.
- **MCP** — Model Context Protocol access to GlobalData's data; described as "the hottest item in
  the sales pipeline" but also raised as a competitive risk to the UI itself ("what's stopping
  people from just using the MCP instead of this?").
- **Filter attribute vocabulary actually used in the product** (per this repo's flow notes, reading
  the Paper source): Therapy Area / Indication, Development Stage, Drug Geography, Route of
  Administration, Molecule Type, Target, Mechanism of Action, ATC Classification, Drug Type,
  Mono/Combination Drug, Drug Descriptor, Gene Therapy Vector, Application Type, CAS Number.
  Top-level data areas: Companies, Drugs, Licensing Opportunities, Regulatory Milestones, Sales and
  Forecast, Drugs by Manufacturer, NPV, Advanced Company Watchlist.
- **AlphaSense** — the one direct competitor with CEO-level attention ("that's the one where our
  CEO ears would prick up"), specifically on market-share grounds, not UI. Caution flagged against
  over-indexing on it.

## 7. What they asked for next

Directly from Neil, on the Sep 2 call, after the Sprint 2 pushback — **this came from the client,
not from Shoreditch**:

- A **wide funnel** of rapid options rather than one refined, converged path: *"if you'd come to me
  and say we looked at 3 ways of doing the tree view, Neil, right? Pros of a classic tree view...
  downside is..."* — he wants the comparison shown, not just the winner.
- **Explicit, stated evaluation criteria** for comparing options: number of clicks, cognitive load,
  AI-editability, modal vs. non-modal.
- A **transparent record of options considered and discarded**, with the reasoning for each,
  presented alongside the recommendation.
- **Much more frequent check-ins** — every 2–3 days, not end-of-sprint reveals.
- Shoreditch's original approach — converge on one considered direction within a limited sprint —
  was their own choice, explicitly reframed as insufficient once Neil reacted.

This repo's convention of building **independent ideas that each test something different**, rather
than one refined answer, and this sprint's brief line — *"so the client can choose a direction
rather than approve a single design"* — reads as a direct, fairly literal implementation of that
Sep 2 demand. Worth keeping in mind when deciding how many ideas to build and how explicitly to
narrate the trade-offs between them.

## 8. Open questions

- What exactly happened in the "chatbot-only vs. half-and-half" review referenced in the Aug 24
  internal debrief as having gone well — no client-facing transcript for it was found. Ask the team.
- React vs. Stencil: as of Sep 3, still formally open — GlobalData's dev team had a week to review
  and "challenge" the React recommendation. Not confirmed resolved anywhere in the record checked.
- Bitbucket/AWS migration access and timeline — repeatedly promised (Harriet to arrange), repeatedly
  slipping through early September.
- Chromatic vs. Playwright for visual regression — cost breakdown was handed to GlobalData to decide;
  no decision captured.
- Formal user personas / usage data (device, browser, click paths) — requested multiple times
  (from "Luke" specifically for device/browser stats), not confirmed delivered. Richard's "pick one
  or two personas" north-star exercise had not been run as of the last meeting reviewed.
- Whether Richard's engagement extends past ~Sep 18 — he has an end date, extension was mentioned as
  wanted by "Johnny," but not confirmed.
- Precise reporting lines between Neil, Harriet, Richard, Bina, Prabal and the CEO are inferred from
  context across calls, never stated as an org chart anywhere.

---

### Meetings read for this report

- *GlobalData: Kick-off discussion* — Aug 3, 2026 (internal prep)
- *Shoreditch / GlobalData Dev Intro* — Aug 3, 2026 (client-facing)
- *Shoreditch x Midnight: GlobalData brief* — Aug 5, 2026 (internal, dev subcontractor)
- *GD Catchup* — Aug 10, 2026 (internal)
- *GlobalData: In-Office Catch-up* — Aug 11, 2026 (client-facing, full transcript read)
- *GlobalData ↔ Shoreditch: Tech Architecture & Sprint Alignment* — Aug 12, 2026 (client-facing)
- *GlobalData ↔ Shoreditch: Sprint 1 Review (Design)* — Aug 13, 2026 (client-facing, full
  transcript read)
- *GlobalData ↔ Shoreditch: Sprint 2 KO (Development)* — Aug 24, 2026 (client-facing)
- *GlobalData: Debrief and Next Steps* — Aug 24, 2026 (internal)
- *GlobalData ↔ Shoreditch: Sprint 2 Wrap / Sprint 3 KO (Design)* — Sep 1, 2026 (client-facing)
- *Shoreditch Design Sync: Design and Tech* — Sep 2, 2026 (client-facing, full transcript read)
- *Design Sprint Walkthrough* — Sep 3, 2026 (client-facing)

Searched but not found: any meeting specifically titled around the "chatbot-only vs. half-and-half"
design review referenced in the Aug 24 debrief; any design kickoff call from Aug 4 (referenced in
the Aug 3 Dev Intro as happening "tomorrow" but not present in the meetings searched — likely
captured under a different note-taker, if at all).
