import type { Flow } from "@/flows/types"
import { Screener } from "@/flows/sprint-3/idea-2/screens/Screener"

/**
 * Sprint 1's Approach 1 — the one Neil called "almost like a stepper
 * approach" — with its one fatal flaw fixed. Drilling into the filter tree no
 * longer replaces the level you were on; each level opens as a column beside
 * the last, so the path stays visible and more than one branch stays open.
 */
export const sprint3Idea2: Flow = {
  id: "idea-2",
  name: "Idea 2 — Miller Columns",
  premise:
    "The filter tree drills sideways, not down. Each level opens as a new column beside the previous one, so the path you took stays on screen and two branches can be open at once.",
  rationale: [
    "Approach 1 grown up. The client liked the stepper shape and worried about depth — \"sections upon sections upon sections\". Miller columns turn that depth horizontal, cap it at three, and fold the rest into a live breadcrumb.",
    "It fixes the flaw that is in the live product too: switching attribute wipes the pane you were working in. Here nothing is wiped, so nothing has to be remembered.",
    "Counts sit on every attribute row and every value row, so the user knows what a click will cost before spending it. The live product shows none, then commits blind for six seconds.",
    "Every chosen value carries a tick, and every attribute holding a selection carries its name in medium weight — the applied query is legible from the panel alone, not only from the pill bar.",
    "The columns are the work and the results are the evidence, so the window is split down the middle. The panel keeps the room two columns of long taxonomy labels need; the table gets enough width to be read rather than glanced at, and the whole record still opens on demand.",
    "The filter columns are never replaced — drilling in adds a column rather than wiping the one you were on. One thing arrives over them, summoned and dismissable: Open on a drug name slides the record in behind a scrim. The agent covers nothing at all — it is asked for in the foot of the panel and works the columns in place.",
    "Three columns up front — name, stage, company — and every other field a drawer away rather than a column away, which is the two or three the client asked for. The table and the filter columns beside it both read at Idea 3's sizes — 13px rows, 12px counts, 10px captions — so the directions are one product rather than two prototypes.",
    "Selection is live. A fixed sample of 1,440 drug rows is filtered in memory, so the headline count, the per-value counts, the pills and the table are all read off the same set and cannot disagree. Where a combination matches nothing, the screen says so rather than padding.",
    "The agent is a line you can read before you send it: the composer in the foot of the panel arrives with the wired request already in it. The steps then appear directly above it and drive the columns in view — values tick, pills appear, the count falls — each one individually undoable. Touch a column and it stops and hands back.",
    "The filter surface is independent of the display: the screen arrives already filtered on molecule type, which the table shows in no column at all. Anything in the taxonomy can be filtered on whether or not it is on screen.",
    "At the sprint's 1440px review viewport the panel holds two columns; a third needs 1,880px, down from 2,280px now that the columns read at 13px rather than 16px. The column count yields to the labels rather than the other way round, which is this direction's own premise — cap the depth on screen and let the breadcrumb carry the rest.",
  ],
  source: "Sprint 1 — Approach 1 (Side Navigation), rebuilt on Miller columns",
  lastUpdated: "2026-09-14",
  tags: [
    "Full pane",
    "Miller columns",
    "Counts everywhere",
    "Columns never replaced",
    "Agent drives the UI",
  ],
  status: "in-progress",
  /**
   * One screen, twelve states of it. The slug seeds the screener and the state
   * leads from there, so each of these is a working surface rather than a
   * frame — and a link can open the review on the state it is about.
   */
  screens: [
    {
      slug: "cold-start",
      title: "Cold start",
      note: "Nothing filtered, the attribute inventory open, all 1,440 sampled drugs. The data model browsable before you know what you want.",
      viewport: "desktop",
      component: Screener,
    },
    {
      slug: "values",
      title: "Values, counted",
      note: "One attribute open. Every value carries what picking it would leave, before you spend the click.",
      viewport: "desktop",
      component: Screener,
    },
    {
      slug: "screener",
      title: "Screener",
      note: "Four filters applied, the drill-down two levels deep, 40 of 1,440 sampled drugs left. Selection and pills are live. One agent request is wired, and its plan is authored rather than parsed; what the steps do to the filters, the counts and the table is real.",
      viewport: "desktop",
      component: Screener,
    },
    {
      slug: "excluded",
      title: "Excluded",
      note: "Drug geography flipped to is not. An excluded pill does not look like an included one, and the count moves for it.",
      viewport: "desktop",
      component: Screener,
    },
    {
      slug: "intersected",
      title: "Joined with AND",
      note: "One attribute's values intersected rather than unioned — a therapy area and one of its own indications — and the count collapsing from 25 to 11 for it.",
      viewport: "desktop",
      component: Screener,
    },
    {
      slug: "agent-running",
      title: "Agent working",
      note: "Mid-run, one step in: the columns travel, values tick, the count falls one value at a time. Touch a column and it stops and hands back.",
      viewport: "desktop",
      component: Screener,
    },
    {
      slug: "agent-done",
      title: "Four steps applied",
      note: "Cold start to 137 drugs in one request, with each of the four steps still undoable on its own.",
      viewport: "desktop",
      component: Screener,
    },
    {
      slug: "agent-undone",
      title: "One step reversed",
      note: "The geography exclude taken back on its own. The three steps around it are untouched and the count climbs to 146.",
      viewport: "desktop",
      component: Screener,
    },
    {
      slug: "record",
      title: "Record open",
      note: "The whole drug, summoned rather than docked, over a query it cannot outlive — untick what it matched on and the drawer goes with it.",
      viewport: "desktop",
      component: Screener,
    },
    {
      slug: "empty",
      title: "No matches",
      note: "A cell therapy taken by mouth: 52 drugs one side, 418 the other, none in both. The table says so rather than showing the last set that worked.",
      viewport: "desktop",
      component: Screener,
    },
    {
      slug: "agent-unwired",
      title: "Send disarmed",
      note: "A request with no plan behind it. One request is wired in this prototype and the button will not pretend otherwise.",
      viewport: "desktop",
      component: Screener,
    },
    {
      slug: "breadcrumb",
      title: "Folded columns",
      note: "Four levels deep at 1440px: two columns on screen, the two to their left folded into the breadcrumb and a click from coming back.",
      viewport: "desktop",
      component: Screener,
    },
  ],
}
