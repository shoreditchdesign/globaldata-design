# Sprint 3 options review deck — handover

This picks up the Sprint 3 options review deck for the Wednesday 16 September review with
GlobalData. It was built in the "s3e1 - modals" session by mistake, so everything below is what the
next session needs to carry on without rereading that conversation.

## Where things live

The deck is `slides/sprint-3/Sprint 3 options review/index.html`, with `deck.js` and `logo.svg`
beside it, and it follows the template in `slides/template/` exactly: read `DESIGN-NOTES.md` there
before touching anything, since it sets the palette, the type scale, the components and the
content register. `deck.js` is a byte-for-byte copy of the template's and should stay that way.

To look at it, serve the folder rather than opening the file, since `file://` blocks parts of the
player: `python3 -m http.server 8765` from inside the folder, then
`http://127.0.0.1:8765/index.html`. `?slide=N` jumps to a slide.

The client's usage data is in the same folder as `Advanced_Search_Behaviour_Summary.docx`. Every
figure on the goals and measures slides comes from it, so if a number is questioned, that is the
source.

## What it looks like now

Eleven slides, and the structure has been agreed with Austin, so the next job is trimming copy,
not reshaping.

1. Cover, dark.
2. The four directions, one line each.
3. Three user goals, as three cards with a large coral G1, G2 and G3 and the client's own figures
   under each.
4. Four measures: clicks, speed of access, three terms, and power beneath, as four cards.
5. to 8. One slide per option with For and Against columns, a verdict bottom left with the word
   *Verdict* in coral, and the prototype link bottom right.
9. Clicks to a usable list: the G1 counts as big numbers. A G3 strip beneath was removed at
   Austin's request; the G3 counts below stay here as reference only.
10. Feedback requested, dark: feedback on each direction, a preferred direction, goal priority, and
    combining directions for Sprint 4.
11. Every state, one link each: 46 links in four columns, one per row, with a coral G1, G2 or G3
    tag on the state where each goal is met in that flow.

Three small additions to the template CSS were needed and are commented in the file: `.accent` for
coral words, a `.metrics--cards` and `.metrics--3` variant for the goal and measure cards, a
`.slide-foot` row for the verdict and link, and a `.link-list` for the one-link-per-row list.

## Feedback already applied

Austin's notes on the first ten-slide pass, all done: split goals from measures, drop the
references to the 14 September call, write in a formal presentation register rather than a
conversational one, put the verdict and prototype link in a footer row on each option slide, check
where the click counts came from, rephrase the decision slide as four feedback asks, and tag the
goal-meeting state on every flow inline in coral with each link on its own row.

## Where the click counts come from

These were checked against the research docs, and Austin asked specifically, so keep this to hand.

- Idea 1, 12 by hand and 4 through the AI tab: `docs/sprint-3/decks/research/IDEA-1-PROS-CONS.md`,
  "Against the metrics". Still true after the Idea 1 rewire on 14 September, since the path is
  Apply filter, Manual tab, area, then attribute and value per field, then Apply.
- Idea 2, 6 by hand and 2 through the agent in about 4.7 seconds: `IDEA-2-PROS-CONS.md`. Only one
  agent request is wired, and the slide says so.
- Idea 3, zero clicks: `IDEA-3-PROS-CONS.md`, one typed sentence and Enter.
- Idea 4, 6 clicks and a dismissal, or 2 steps through the assistant: `IDEA-4-PROS-CONS.md`.
- The G3 strip, 24, 12, not expressible, and 9 clicks for four of six clauses, comes from the same
  four files.
- The live platform's 13 to 16 is an extrapolation rather than a count. The walkthrough in
  `docs/sprint-3/research/PLATFORM-WALKTHROUGH.md` measured 12 interactions for two attributes and
  four values, and 13 to 16 is that rate carried to three or four filters.

Two honest gaps. Each option was counted on its own representative query, so the numbers compare
the shape of the work rather than one identical search, and the footnote says that. And G2 was
never counted consistently across the four, so there is no G2 row; if Austin wants one, it needs
a counting pass against each prototype first.

The goal tags on the links slide are one pick per goal per flow from the goal map in
`STEP-LINKS-PLAN.md`: Idea 1 applied, filter-bar-dropdown and manual-selected; Idea 2 agent-done,
screener and excluded; Idea 3 sentence, pill-open and filters; Idea 4 proposed, undone and
column-menu. Where a direction fails a goal, the tag marks its best evidence rather than a pass.

## Research cut from the original 19-slide draft

Austin asked to see this so he can decide whether any of it comes back. None of it is in the deck.

- The verbatim quotes from the 14 September call, including the "fusion" quote.
- The fusion slide, and the finding that none of the four expresses a nested, cross-attribute
  Boolean query, which the live platform can.
- Idea 3's misreads table, three queries run through the real resolver that came back fluent and
  wrong, and the PubMed-style per-clause provenance fix.
- Idea 3's three-rung ladder of Sentence, Filters and a nested group Builder, with Linear as the
  precedent.
- Idea 2's four moves to fix the cold start: the ask as the empty state, the sentence landing in
  the columns, a hand-off line, and follow-ups against the standing query.
- Supporting precedents and studies: HubSpot's AI filters over nested groups, Baymard on
  per-value counts, the Kiger menu-depth study, trust in NL query tools at 6.1 against 4.0 out of
  7, Tableau and Power BI retiring their assistants, Notion, Databricks and Clay for agents that
  drive real controls.
- Idea 2 renders three columns only above 1880px, and Idea 4's panel takes 380px of a grid whose
  problem is width.
- Speed of access figures, which exist but are not on a slide: Idea 2's agent run at about 4.7
  seconds, Idea 3's 1.4-second resolve animation, and the live platform's six-second blind commit.

## Things to sort out

- The folder's `index.html` was replaced. Before that it held a parallel rewrite with different
  headings ("Four routes to natural language search"), made by another session or by hand. It is
  backed up at the session scratchpad as `index-parallel-version-backup.html`, but the scratchpad
  is temporary, so if anything in it is wanted, lift it soon.
- There is still a loose `slides/sprint-3/Sprint 3 options review.html` and `slides/sprint-3/deck.js`
  from the first pass. The folder is the real deck now, so those two can go once Austin confirms.
- `slides/sprint-3/Documents/` is a 19 GB untracked copy of a whole `Documents/Github` tree,
  `node_modules` included, dropped in by accident. It must not be committed. Austin has not yet
  confirmed deleting it.
- The logo is the template's `logo.svg`, which is the Shoreditch mark, not GlobalData's.
- None of the deck work is committed. On `main`, four Idea 1 commits are waiting for Austin to push,
  and he pushes `main` himself because of the Vercel plan.
- The client's data reframes G2 more than the first draft did: only 12% of follow-up searches add a
  filter, and 80% swap a value in the same fields. That supports a "save and re-run a query shape"
  idea, which none of the four directions has yet and which may be worth raising in the review.
