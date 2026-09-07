# Idea 3 — Query as a sentence

## Why we are exploring this

Neil has asked the same unanswered question in nearly every design call: if search is going to be
natural language and AI-driven, how does that coexist with a user who also wants to structure and
verify their query? This direction is a direct attempt at that answer — one input, natural language
in, and what comes back is the query itself rendered as an editable sentence rather than a chat
transcript or a separate builder panel. It's also the direction that takes his AI-velocity complaint
most literally: he benchmarked us against a demo built by someone who'd "had Claude for 2 days," so
this is the one direction that puts AI in the interaction itself rather than just in how fast we
prototype it.

## The evidence

Ordered strongest first. Timestamp not available in transcript for every entry — the Granola payload
for both source meetings is continuous speaker-labelled text with no per-utterance timing.

1. **"If you're going to start talk about search and typing things in, then it should be natural
   language AI. Bot type interface... How do you combine being able to use natural language and
   then saying, well, actually I want to structure my search? I call this a structured search or
   screen."** — Neil Dodgson, *Sprint 1 Review (Design)*, 13 Aug 2026. Timestamp not available in
   transcript.
   *Implication: this is the open question this direction exists to answer, in his own words, asked
   outright and never resolved in any transcript reviewed since.*

2. **"Number of clicks to execute a query, ability to bridge natural language, whatever, whatever
   your criteria are."** — Neil Dodgson, *Shoreditch Design Sync: Design and Tech*, 2 Sep 2026.
   Timestamp not available in transcript.
   *Implication: natural-language bridging is one of his four named evaluation criteria — this
   direction is scored directly against something he asked us to score against.*

3. **"Can I edit the right side immediately?"** ... **"So the reality is this is a natural language
   filter builder, as you're saying"** ... **"It's an AI-like natural language filter builder."** —
   Neil Dodgson, same meeting (2 Sep), reacting to the Sprint 2 modal's AI tab specifically.
   Timestamp not available in transcript.
   *Implication: the one part of Sprint 2 he engaged with and did not criticise was the AI-assisted
   filter tab — worth protecting that idea rather than assuming everything about Sprint 2 was
   rejected.*

4. **"I've sat here in India today and seen a demo from someone who's had Claude for 2 days.
   They've built me 10 pages of interface with 3 different options about the way to build
   dashboards. There's a velocity that I'm just not seeing."** — Neil Dodgson, same meeting.
   Timestamp not available in transcript.
   *Implication: general context rather than a direct design instruction, but it sets the bar this
   direction is implicitly measured against — an interface that itself demonstrates AI doing real
   work, not just AI used to build faster.*

5. **Supporting, not from Neil:** *"I don't know who they have this tool called Ava. Really should be
   [reflected] in here."* — Richard Barnett, *GlobalData: In-Office Catch-up*, 11 Aug 2026 (Richard
   only on the client side this call — confirmed via meeting metadata; this is not Neil's position).
   Timestamp not available in transcript.
   *Implication: any AI-driven filtering should visibly connect to GlobalData's existing agent Ava
   rather than introduce a second, unbranded bot — a real constraint even though it's Richard's word,
   not Neil's, and Neil has never personally endorsed or rejected it.*

6. **Not a quote — measured on the live platform:** the production platform already has a fast,
   well-organised, cross-entity natural-language search in the global header
   (`docs/sprint-3/research/PLATFORM-WALKTHROUGH.md`), and nothing found there can be carried into
   the screener; it's also missing from the Pharma homepage and Escape doesn't close it.
   *Implication: this direction is best argued as "you already built the good search and orphaned
   it" — the capability exists, disconnected from the filtering task, which is a stronger opening
   than claiming to invent natural-language search from nothing.*

## What this direction is betting

That an editable natural-language sentence is trustworthy enough, for a screening workflow, to sit in
front of the structured filters rather than beside them. Neil's own complaint about the Sprint 2
modal was partly about precision — *"asking for trouble, like for the precision of the user"* — and
this direction runs a bigger version of that risk: if the AI misreads a term and the user doesn't
check the "show as filters" view, they get a confidently wrong result set. This is explicitly the
direction the brief flags as fewest clicks, highest trust risk, and that's a fair characterisation.

## What we would need from the client to validate it

Put a genuinely ambiguous query in front of him — something the parser could plausibly get wrong —
and ask the question he himself posed on 13 August but never got an answer to: when natural language
and structure disagree, which one does he actually want to trust by default, and does the "show as
filters" toggle resolve that, or does he want the structured view surfaced by default with language
as the shortcut, not the other way round?
