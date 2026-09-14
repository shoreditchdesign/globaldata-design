# The 14 September review — what Neil actually asked for

Source: *GD ↔ Shoreditch Ways of Working Follow Up*, 14 Sep 2026, 3:00pm. Attendees: Neil Dodgson
and Harriet Osmond (GlobalData), Richard Barnett, Austin, Jack, Alex and Mia (Shoreditch). Jack
walked the Sprint 2 research document, Alex demoed Idea 1, Austin demoed Ideas 3, 4 and 2 in that
order. Everything below is from that transcript; quotes are lightly trimmed, and where the Granola
speaker labels are ambiguous the attribution is worked out from content.

## The verdict on the working method

The prototypes themselves landed. *"This is exactly the thought-provoking, kind of early-stage
exploratory work that I was hoping that we would have aligned at… where you can turn around to me
and say, we looked at the following things, we liked them for these reasons, discarded them for
these reasons, but have a play, GlobalData, and tell us what you think."* And, later, *"big tick,
compared to where we were this time last week."*

What was missing was the argument around them. He wants the reasoning made visible rather than
pre-resolved into a recommendation: *"we've given you four options, guys, iterated pretty quickly
with AI. These are some of the pros and cons that we're thinking of… but they're in your hands now,
GlobalData. You've got 48 hours to go review them and come back with feedback."*

The cadence that came out of it: we go away for roughly four days, come back with a range of
options as URLs, GlobalData commits to review them inside a day, and the feedback session is an
hour rather than thirty minutes. Next review is **Wednesday 16 Sep, 4:00–5:00pm**.

## The two deliverables

1. **An intro slide and a one-page pro-and-con per option**, written against what we are trying to
   achieve rather than in the abstract, so the response can be *"I'm going to discard option 4 and
   option 1, have a look at number 2 with some of the benefits we've seen elsewhere."*
2. **URLs that open on a specific state of a flow**, so a reviewer lands in the middle of the
   interaction instead of clicking a prototype through from the start — and each of those states
   mapped to the user goal it is evidence for.

## What good looks like, in his words

He offered the measures himself, and asked to be challenged on them:

- **Number of clicks** and **speed of access**.
- **70% of queries reachable in three or fewer terms.** The underlying data: *"70% of these queries
  are using three fields or less."* His own reading of that is that either a small group of fields
  carries most of the work, or those three fields are expressible in natural language easily — and
  he thinks around 70% of queries could be answered single-shot *"if someone typed it in natural
  language"* against their data.
- **The remaining 30% is where drilling happens**, and *"maybe only 10% of those queries"* need the
  detailed Boolean builder. Those are not marginal users: *"when I looked at the data, some of our
  biggest customers, power users, are needing kind of the detailed Boolean builder,"* and *"the
  highest value users right now are the people that are going to tailor it really precisely,
  because they are coming to us to get that level of granularity."*

So the interface has to serve both ends at once: *"how is the user interface serving both of those
challenges, having a very, very quick on-ramp for people to get to a list and start refining it,
and the power beneath it."*

## The three user goals

The segmentation the pros-and-cons and the deep links are both organised around.

| | Goal | Who | Volume | What they need from the interface |
|---|---|---|---|---|
| **G1** | Quick screen | The majority of searches | ~70% of queries, three fields or fewer | A cold start that reaches a usable list of drugs fast. *"I've got in my head what I want to screen for and go for it."* Minimum clicks, minimum reading, ideally one natural-language shot. |
| **G2** | Refine | Power users with a list that is not quite right | The ~30% that get refined | Cheap, reversible, legible refinement without starting over. *"That's not quite what I wanted, let me tailor that precisely."* |
| **G3** | Deep Boolean | Advanced users at GlobalData's largest accounts | ~10% of refined queries | Full Boolean construction across attribute groups — AND, OR, NOT, cross-attribute logic, granular control. They pay for exactly this granularity. |

The failure mode he is watching for is an interface that serves one of these and abandons the
others, or that serves them as two products bolted together.

## The standing question: the fusion

This is the thread running through every call, and he restated it plainly. He expected us to land
near a hybrid: *"I'd actually thought we were going to end up closer to an iteration of this and
maybe sidebar together… some clever fusion of classic Boolean search building and ability for
natural language searches, so that the 60% of searches that can be triggered just with a natural
language thing get going, and the rest that needed detail refinement, we blended the interface."*

None of the four directions answers that yet, and he named the gap in each one.

## What he said about each direction

**Idea 1 — Modal / Sidebar Takeover** (the reviewed incumbent, demoed by Alex). No direct verdict
in this call; it is the baseline. He did like *"your fusion of natural language and dropdown… and
collapsing them back"*, said while the column direction was on screen but describing the pattern
generally.

**Idea 3 — Text Input Field** (demoed first). The open question is the hand-off: *"the one which
Austin showed at the top, like highlighting up the natural language — I'd want to see how that
flips then into the power user view."* He believes the one-shot on-ramp is right for the 70%; what
he has not seen is where the other 30% goes.

**Idea 4 — Sidebar Agent** (demoed second). His sharpest criticism: *"if you look at the sidebar
example, I don't see how that quite works in that initial query point of view. So you start with
the data and you're manipulating your query off to the right-hand side."* It does not start from a
screen-for-this-first position and narrow; it starts with everything. He recognised the pattern
immediately from BI tooling — *"Assistant, yeah. BI tools, things like that. Looker, yeah."*

**Idea 2 — Miller Columns** (demoed third). The nuance worth putting on a slide. He was drawn to it
most: *"in your three-column one, I can see how I get the power view… I see what I'm trying to
filter for, I use my real estate to help me filter."* And *"we've finally seen the pullout from the
left, the sightline style options, which our clients have given us feedback on."* But the same
sentence carries the objection: *"it's lost the quick onboarding. How do I get that initial query
done?"*

The team's own position was the opposite one, which Jack said out loud in the call: this was *"the
one as a team we felt least confident in"* — the most overwhelming, the least clear about what the
steps are for the user, and the closest to patterns GlobalData already ships. Neil's answer to that
is worth keeping: *"if this was the only interface, I'd go, absolutely don't want this… but we've
not iterated the fusion of this style of interface with AI."* The disagreement is not about whether
the direction is finished. It is about whether it was abandoned too early.

## The trap to avoid on Wednesday

Two things caused the friction being corrected here, both said in the call. The first is that
short meetings pushed us toward presenting a recommendation rather than the reasoning: *"if we're
not showing the workings… we're closing down the challenge and debate at that point to 'here's our
recommendation'."* The second is the mirror image of it — his own availability, which he named as
the flip side. The deck's job is to make a one-hour session enough: the options, the honest
limitations of each, and the specific decision he is being asked to make.
