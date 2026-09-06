# Idea 2 — Full-pane screener (Miller columns)

## Why we are exploring this

Neil's own fix for Sprint 2 was to take the filter builder out of a modal and give it the full pane
— that's a direct, quoted instruction, not a designer's interpretation. But the live product is
already full-pane and already fails in exactly the way he complained about: one attribute visible at
a time, no way to hold two branches open, context wiped on every switch. Going full-screen answers
the shape he asked for and nothing else unless the depth problem is actually solved. This direction
tests whether turning depth horizontal — Miller columns instead of a single replacing pane — is that
solve, and whether it survives the taxonomy at its real size rather than a clean two-level demo.

## The evidence

Ordered strongest first. Timestamp not available in transcript for every entry below — neither
transcript read for this evidence (13 Aug, 2 Sep) carries per-utterance timing in the Granola
payload, only continuous "Me"/"Them"-labelled text.

1. **"Is there... do we maybe make this a full-screen takeover? So rather than... having this pop up
   from the screen below it, this can just be like a full screen element."** — Neil Dodgson,
   *Shoreditch Design Sync: Design and Tech*, 2 Sep 2026. Timestamp not available in transcript.
   *Implication: this is the client asking for exactly the shape this direction takes — full pane,
   not modal — in his own words, unprompted.*

2. **"I feel like on the trees I lose the context. I can't have multiple things open at the same
   time, so I lose functionality."** — Neil Dodgson, same meeting. Timestamp not available in
   transcript.
   *Implication: names the specific mechanism this direction has to fix. Miller columns exist
   specifically to let more than one branch stay open and visible at once — this is the test of
   whether they actually do.*

3. **"I think approach one worked quite nicely for me... it's almost like a stepper approach."** —
   Neil Dodgson, *GlobalData ↔ Shoreditch: Sprint 1 Review (Design)*, 13 Aug 2026. Timestamp not
   available in transcript.
   *Implication: he liked the underlying drill-down navigation conceptually before he ever saw the
   modal. This direction is that same approach, matured rather than replaced.*

4. **"If that's what you think, I think you have to stress test it... if it goes many more [levels]
   than that, suddenly it becomes really, really nasty to manage... you're getting sections upon
   sections upon sections, and then you have to go up and close them all to go anywhere... the
   overwhelming amount of stuff that we've got... might overwhelm that UI."** — Neil Dodgson, same
   meeting (13 Aug). Timestamp not available in transcript.
   *Implication: he flagged, on the same call where he liked the concept, the exact risk this
   direction is built to answer — depth needs to be tested against GlobalData's real taxonomy
   (~27 attributes under Drugs alone, per `PLATFORM-WALKTHROUGH.md`), not a demo case.*

5. **The live product is already full-pane and already fails this way.** Not a quote — measured
   directly on the production screener (`docs/sprint-3/research/PLATFORM-WALKTHROUGH.md`): switching
   attribute in the left pane wipes the middle pane entirely, selected values carry no selected
   state, and there are no counts anywhere before the six-second commit to Search.
   *Implication: this is the trap named in the brief — going full-screen fixes nothing on its own.
   Idea 2 only earns its case if counts, selected state, and multi-branch persistence are all
   actually present, since the live product already has the full pane without any of them.*

## What this direction is betting

That horizontal depth — a fixed cap of three columns with breadcrumb collapse — reads as genuinely
different from vertical nesting, rather than as the same "sections upon sections" problem turned
sideways. If Neil's stress-test concern was really about total information volume rather than the
axis it's laid out on, three columns of dense taxonomy will feel just as overwhelming as the tree did,
regardless of orientation.

## What we would need from the client to validate it

Walk him through the real taxonomy at depth — Therapy Area/Indication down through its actual
sub-levels — in the three-column layout, and ask directly whether holding two branches open
side-by-side resolves the "I lose the context" complaint, or whether the volume itself is still the
problem no matter how it's arranged.
