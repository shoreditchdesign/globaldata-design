# Call 05/10 — actions and Idea 1c build list

From the GD / Shoreditch design review on Mon 5 Oct 2026, Emma's annotated screenshot and her 16 notes, checked against the transcript and the current Idea 1c code (`src/flows/sprint-4/idea-1c/`). Prepared for Austin.

Speaker names in quotes come from the transcript analysis. Where it says "(guess)", the speaker label was inferred.

**Rule used:** when Emma's note and the transcript disagree, the transcript wins. Where the transcript is unclear, the item is marked **OPEN** for Austin and left out of the build list.

---

## 1. Next steps from the call

| # | Action | Owner | Due | Source |
|---|---|---|---|---|
| A1 | Build the agreed 1c changes (section 3) | Austin | Before review, Tue 6 Oct 12:00 | Decisions 2–10, 12 below |
| A2 | Send the invite for Tue 6 Oct 12:00–12:30, with Emma invited if she can make it | Shoreditch (Alex or Jack, guess) | Tonight, Mon 5 Oct | "meet again tomorrow 12:00–12:30" |
| A3 | Ideate the filter summary bar and the mixed-depth top dropdown internally, then bring it to review | Shoreditch (Austin leading) | Before Tue 6 Oct 12:00 | Austin: internal ideation, then review |
| A4 | Ask Neil and Harriet for Becky's earlier data toolbar treatment, as context for the placeholder | Austin | Mon 5 Oct (ask today) | Neil: "I'm not asking you to design the toolbar." |
| A5 | Send the therapy area / indication tree (N levels) | Harriet | No date (chase before Tue) | Harriet to get the therapy indication tree |
| A6 | Crawl the live platform for deeper test data (5–6 levels) | Austin / Shoreditch | No date | Austin: "crawl the live platform a bit further ... 5 levels, 6 levels deep" |
| A7 | Present the user testing plan (slide 10) that was skipped today | Alex (guess) | Tue 6 Oct 12:00 | Slide 10 not reached |
| A8 | Finalise the prototype, then send it out for testing with the listener link, to a wider audience | Shoreditch | After sign-off on Tue | "we'll do the same thing by sending you a listener link again"; Neil: "let's get this out for testing" |
| A9 | Break the later production build into steps and estimate it against the agreed estimate | Shoreditch | Offline, no date | "take it offline" |
| A10 | Developer review of the near-final design | Shoreditch + developers | Future session, no date | "make sure these developers are getting eyes on this" |
| A11 | Tell Emma where the call landed differently from her notes (global nav, empty Miller state) | Austin | Before Tue 6 Oct 12:00 | Section 2 |

---

## 2. Emma's checklist

Key: `[x]` 1c already does it · `[~]` partly · `[ ]` not yet. Line refs are in `src/flows/sprint-4/idea-1c/` unless given in full.

**Totals: 0 done · 4 partial · 12 not done.**

- [ ] **1. Column filter dropdown needs a count for results.**
  `components/ValueList.tsx:51-70` lists values with a tick box and no count. The Miller columns already show counts (`components/ManualSearch.tsx:95-98`, from `valueCountsFor` in `results.ts:735`), so the numbers exist.
  Transcript agrees: "in brackets the number of results". Neil flagged that live result counts cost a dynamic compute while child counts are cheap. That's for the developers, so it doesn't block the prototype. → Build TB4.

- [ ] **2. Remove the global navigation bar.**
  `src/components/prototype/ProductChrome.tsx:121` renders all eight areas.
  **Differs from the transcript.** Neil: "Just say company drugs. Take the rest out." **Transcript wins:** keep Companies and Drugs and remove the other six. → Build L1, and tell Emma (A11).

- [ ] **3. "241 drugs": the count belongs over the results.**
  The count sits at the far left of the status bar, which spans the panel and the table (`components/ResultsGrid.tsx:537-541`), so it sits over the panel rather than over the drug names.
  Transcript agrees: "48 drugs should align with the top of drug name ... the proximity is too wide." → Build TB1.

- [~] **4. Up/down arrows next to the column titles for A–Z sorting.**
  Sorting works: a header click cycles the sort (`components/ResultsGrid.tsx:202-213`) and the menu has Sort ascending / descending (`:249-270`). The arrow only appears after a column is sorted, so nothing at rest tells you that you can sort.
  Transcript agrees. Neil warned that real grouping is much harder (merged rows) and isn't for this round. → Build TB2, sorting only.

- [ ] **5. "Columns 11/18" is unclear and needs to be more descriptive.**
  `components/ResultsGrid.tsx:562-569` shows `Columns 11/18`.
  Not discussed on the call. No conflict, so Emma's note stands. → Build TB3.

- [ ] **6. Review the inactive state of the tabs.**
  `components/SearchTabs.tsx:50-52`: an inactive tab is `text-muted-foreground` on the sunken track. That's exactly what `CLAUDE.md` now prescribes for every segmented tab.
  The transcript only touched on this ("it's grey, it's faint", about advanced search being missed). → **OPEN-1**, because any change contradicts the recorded tab style.

- [ ] **7. Move the tabs to the left.**
  `components/SearchPanel.tsx:138` puts them at `justify-end`.
  Transcript agrees: "quick search, advanced search tabs moves to the left." → Build T1.

- [ ] **8. Move Drugs to the top of the list.**
  `data.ts:10` takes the list order from `productAreas`, so Companies comes first. The transcript adds that Drugs should also be **selected by default**, on the results page and on the landing page's advanced search. `state.ts:53` opens nothing. → Build M1 and M2.

- [~] **9. The empty state can default to all three columns open.**
  `components/ManualSearch.tsx:48` and `:186` already lay out three fixed thirds, but only the area column is filled until you click.
  **Differs from the transcript:** "the default state just has to be whatever they've applied ... we're not also having loads of empty states." With Drugs open by default (M2), you get two filled columns. Opening a third would mean choosing a default attribute. → **OPEN-2.**

- [~] **10. If a filter is applied, only open the relevant number of columns.**
  After a query resolves in Advanced, the columns walk to its filters (`components/PrototypeShell.tsx:205-209`, `walk.ts`). Arriving on the results page or switching to Advanced opens nothing (`state.ts:120-123`).
  Transcript agrees. → Build M3.

- [ ] **11. Allow opening the full tree.**
  The columns stop at three levels: area, attribute, value (`components/ManualSearch.tsx:58-103`). Values never drill further, although the data has a region › country tree (`data.ts:65-101`) and every sample row carries a therapy area and an indication (`results.ts:36-37`).
  Transcript agrees ("N columns"). How the columns past three behave is **OPEN-3**. → Build M4.

- [~] **12. Add an icon to close the drawer and see the data full screen.**
  A panel toggle exists, but it sits in the table's footer (`components/ResultsGrid.tsx:738-748`) and nobody found it. Emma said "there's no button to make it clear that that's possible".
  Transcript agrees. → Build L2.

- [ ] **13. Remove the chatbot from the bottom.**
  The composer sits at the foot of the panel in both modes (`components/SearchPanel.tsx:82-131`, `:177`).
  The transcript goes further than Emma's note: Quick search goes **back to last week's version, with the field at the top**, and Advanced search has **no** query field on the results page. → Build L3.

- [ ] **14. Edit filter opens the left tray at that specific area.**
  In the column menu, Edit filters / Add filter (`components/ResultsGrid.tsx:272-281`) opens a value popover on the header (`:329-345`).
  Transcript agrees: "it pulls out the tray to the exact option that you've got." → Build M6, plus logic notes in D1.

- [ ] **15. Remove excludes.**
  Excludes are still everywhere: the IS / IS NOT control (`components/ResolvedFilters.tsx:558-572`), the excluding Miller column (`components/MillerColumn.tsx:145`, `:240-284`, `:362`), and the worked query's two excluded clauses (`data.ts:356`, `:365`, `:379-386`, resolver `resolve.ts:783-806`).
  Transcript agrees: "that compute to customer value is not worth it." → Build F1.

- [ ] **16. Mock up quick apply of the data tree and what the results look like.**
  Not done. The sample is flat, and ticking Cardiovascular doesn't give a realistic spread of indications.
  Transcript agrees in substance: the data isn't rich enough, and Harriet is sending the tree. → Build F2, which depends on A5 and A6.

**Already satisfied, not on Emma's list:** the filter summary bar runs full width over both the panel and the table (`components/ResultsPage.tsx:77-79`), which is what Neil asked for ("when the line goes all the way along the top"). Also kept as agreed: loading states, checkboxes in the popovers, the 3-line truncation of filters, and the "Add filter" label.

---

## 3. Build list — Idea 1c

Build in this order. Each item names the frame to check at `localhost:3000/sprint-4/idea-1c/<slug>`. Run `pnpm typecheck`, `pnpm lint` and `pnpm build` before pushing.

### Layout

**L1. Global nav: Companies and Drugs only** [x] `bc687b1`
- Build: add an optional `areas` prop to `ProductChrome`, defaulting to `productAreas` so every other idea stays the same. 1c passes `["Companies", "Drugs"]`.
- Files: `src/components/prototype/ProductChrome.tsx` (props, `:121`), `components/PrototypeShell.tsx` (both `<ProductChrome>` calls).
- Check:
  - [x] `/start` and `/results` show only Companies and Drugs, with Drugs underlined.
  - [x] `/sprint-4/idea-1b/start` still shows all eight.
- Risk: the component is shared, so the default must not change. This doesn't touch the Miller area list, which keeps every area.

**L2. Drawer open/close you can see, and a full-screen table** [x] `d40293f`
- Build: move `panelOpen` from `ResultsPage` local state into `Sprint4Idea1cState`, because M5 and M6 need to open the drawer. Put a visible open/close icon button at the top of the panel, on the tabs row, and a matching "open panel" button at the table's left edge when it's closed. Remove the footer toggle, or keep it as a second way in.
- Files: `state.ts`, `components/PrototypeShell.tsx`, `components/ResultsPage.tsx:60`, `components/ResultsGrid.tsx:596-608` and `:738-748`, `components/SearchPanel.tsx:138-140`.
- Check:
  - [x] On `/results`, an icon at the panel's head closes it, and the table fills the width (Emma wants all 18 columns visible).
  - [x] An icon at the table's left edge reopens it.
  - [x] `aria-expanded` follows the state.
  - [x] Under reduced motion it snaps with no transition.
- Risk: the DECISIONS entry that calls the panel "a view preference held in ResultsPage" needs updating (D1).

**L3. Quick search back to last week's layout; no chat in Advanced** [x] `30900f3` — reads "last week" as pre-6aab10b; confirm Tue
- Build: in Quick search, put the query field at the top of the panel under the tabs, with the pills under it, as in Idea 1b's results panel. In Advanced search, drop the composer entirely, leaving the columns only.
- Files: `components/SearchPanel.tsx` (move `composer`, `:82-131` and `:177`). Reference: `src/flows/sprint-4/idea-1b/components/SearchPanel.tsx:122-199`.
- Check:
  - [x] On `/results`, Quick shows tabs, then the field, then "Commonly used filters".
  - [x] Advanced shows no text field.
  - [x] Resolving a query in Quick still updates the filters and the table, and the unread notice still shows under the field.
- Risk: this reads "last week's version" as the pre-6aab10b layout, which matched 1b. Confirm it on Tuesday. The Miller walk after a resolve (`PrototypeShell.tsx:205-209`) now only runs from the landing page.

### Tabs

**T1. Tabs on the left** [x] `8b0fc92`
- Build: left-align the tabs row on the results panel, keeping 1b's `SearchTabs` exactly as it is.
- Files: `components/SearchPanel.tsx:138` (`justify-end` to `justify-start`). Shares the row with the L2 icon, which goes at the right end.
- Check:
  - [x] On `/results`, the tabs' left edge lines up with the panel content (`px-3`) in both modes.
  - [x] Nothing moves when you switch modes.
  - [x] The tab styling is unchanged.
- Risk: none. The inactive state is OPEN-1 and isn't touched here.

### Miller / filter tree

**M1. Drugs first in the area list** [x] `2f16e15`
- Build: give 1c its own area order with Drugs first, then the rest in the platform order.
- Files: `data.ts:10` (`searchCategories`). This feeds `ManualSearch.tsx:63` and `AddFilterCascade.tsx:116`.
- Check:
  - [x] Drugs is the first row under "Filter area" on `/manual` and on `/results` (Advanced).
- Risk: `pathOf` (`data.ts:423`) matches with `startsWith(\`${area}/\`)`. The trailing slash keeps "Drugs" and "Drugs by Manufacturer" apart, but confirm it still does after the reorder.

**M2. Drugs open by default** [x] `2f16e15`
- Build: seed `manualCategory: "Drugs"` in every state, landing and results.
- Files: `state.ts:50-62` (startState, which flows into manual and results).
- Check:
  - [x] `/manual` opens with Drugs marked and its attributes in column 2.
  - [x] The Advanced tab on `/results` does the same.
  - [x] Pressing "All areas" still works.
- Risk: none.

**M3. Open only the populated path** [x] `4a0d2a7`
- Build: when Advanced is shown with filters applied, open the path of the most recently applied filter (`lastApplied`, `data.ts:475`). With no filters, only Drugs is open (M2).
- Files: `components/PrototypeShell.tsx` (`setMode`), `state.ts:120-123`.
- Check:
  - [x] On `/results`, switching to Advanced opens Drugs › the last-applied attribute, with its values ticked.
  - [x] `/manual` with nothing applied shows two filled columns.
- Risk: it must not fight the walk after a resolve. A reader's click still wins (`walk.stop()`).

**M4. The full tree, N levels** [x] `e63bda7` — 2 levels of values (sample data); window behaviour per OPEN-3 unchanged
- Build: replace the fixed `manualCategory` / `manualAttribute` with a path array (`manualTrail: string[]`). Values that have children get the chevron. A value row is already "two controls in one line", so the box ticks and the row drills (`MillerColumn.tsx:79-82`). Seed two real trees:
  - Therapy area › indication, built from the sample rows (`results.ts:36-37`).
  - Drug geography region › country (`data.ts:65-101`).
  Keep the current three-column window with the back chevron and the breadcrumb (`ManualSearch.tsx:48`, `:119-157`) until OPEN-3 is settled.
- Files: `state.ts`, `components/PrototypeShell.tsx` (`walkToCategory` / `walkToAttribute`), `components/ManualSearch.tsx`, `walk.ts`, `data.ts`, `results.ts` (`valueCountsFor` per level).
- Check:
  - [x] On `/manual`, Drugs › Therapy area / indication › Cardiovascular shows a chevron, and clicking it opens a column of indications.
  - [x] The window slides so three columns show, the breadcrumb shows the full path, and the back chevron steps back one.
  - [x] Drug geography › Europe › United Kingdom works the same way.
- Risk: the biggest change in the list, and `walk.ts` assumes two levels. Ticking a parent keeps today's meaning (the parent value as the filter) until OPEN-4 is settled. Going deeper than two levels needs A5 / A6 data.

**M5. Add filter opens the Miller tray** [x] `7d5db1d`
- Build: Add filter stops opening the cascade popover. On `/results` it opens the drawer (L2) on the Advanced tab with Drugs open (M2). On the landing card it switches to the Advanced tab. Keep `AddFilterCascade` in the repo but don't render it, as was done with `AdvancedToggle`.
- Files: `components/ResolvedFilters.tsx` (`AddFilterMenu`, `:234-252`, `:299-405`, which becomes an `onAddFilter` callback), `components/PrototypeShell.tsx`.
- Check:
  - [x] On `/results` with the panel closed and Quick on, pressing "+ Add filter" opens the panel on Advanced with Drugs open, and no popover appears.
  - [x] On `/filters`, the same button switches to the Advanced tab.
  - [x] The label still reads "Add filter".
- Risk: depends on L2 (state is lifted) and M2. Neil asked for it to be "really slick", so there's no walk animation: it opens instantly.

**M6. Edit filter opens the tray at that exact option** [x] `7a89eb4`
- Build: in the column header menu, Edit filters and Add filter open the drawer on Advanced with the trail set to Drugs › that column's attribute (`columnFilterPath`), with its values ticked. The header value popover goes. The value dropdown on a filter chip stays a quick list (see OPEN-6).
- Files: `components/ResultsGrid.tsx:155-168` (`openingFilter`), `:272-281`, `:325-346`, `components/PrototypeShell.tsx`, `components/ResultsPage.tsx`.
- Check:
  - [x] On `/results`, the Therapy area column menu › Edit filters opens the panel at Drugs › Therapy area / indication, with Musculoskeletal ticked if it's applied.
  - [x] A column with no filter opens at its attribute, empty.
  - [x] Opening is instant.
- Risk: depends on L2, M3 and M4. If the panel was already open in Quick mode, the mode flips to Advanced, which D1 records.

### Table

**TB1. Result count over the table, aligned with Drug name** [x] `7e422e1`
- Build: the status bar becomes the table's own toolbar. It no longer spans the panel, and the count starts at the Drug name column's text edge.
- Files: `components/ResultsGrid.tsx:534-593` (move the bar inside the table column, `:610` onward).
- Check:
  - [x] On `/results`, "N drugs" sits directly above the DRUG NAME header, its left edge on the column text, with the panel open or closed.
  - [x] The count updates when filters change.
- Risk: the row-selection count and Clear move with it. TB5 shares this row.

**TB2. Sort arrows at rest** [x] `c4fbe32`
- Build: every sortable header shows a muted two-way sort icon at rest. The active direction shows in `text-foreground`. Clicking cycles ascending, descending, then clear.
- Files: `components/ResultsGrid.tsx:202-213`, `grid.ts` (`minPx` per column, so label, arrow and filter badge stay on one line).
- Check:
  - [x] Every header on `/results` shows an arrow at rest.
  - [x] Three clicks run ascending, descending, clear.
  - [x] No header label wraps, and the grid scrolls sideways.
- Risk: column minimums have to be re-measured from the real labels (CLAUDE.md, Data grids). Sorting only; grouping is out (Neil).

**TB3. A descriptive Columns label** [x] `f46d355`
- Build: change `Columns 11/18` to "11 of 18 columns". Austin may prefer other wording; the change is a single string.
- Files: `components/ResultsGrid.tsx:562-569`.
- Check:
  - [x] The button reads "11 of 18 columns" and updates when a column is hidden.
- Risk: none.

**TB4. Value counts in the column filter dropdowns** [x] `c3fbea2` — whole-sample counts
- Build: give `ValueList` an optional count lane, with the same numbers and formatting as the Miller columns (`valueCountsFor`, `formatCount` in `MillerColumn.tsx:16`). Zero values recede.
- Files: `components/ValueList.tsx`, `components/ResolvedFilters.tsx` (`ValueMenu`, `:640-666`).
- Check:
  - [x] On `/filters` and `/results`, the Therapy area chip dropdown shows a count on every value.
  - [x] Cardiovascular shows the same number as in the Miller column.
  - [x] Zero counts are muted.
- Risk: these counts cover the whole sample, not the query in context. For production, see Neil's compute point (A10). Parents in the tree: OPEN-5.

**TB5. Data toolbar placeholder** [x] `2c59aa8`
- Build: in the TB1 toolbar, add a non-working "Group by" and a "View" control (Sales forecast / Manufacturer / Trials) between the count and Columns / Export. Mark them as placeholders honestly.
- Files: `components/ResultsGrid.tsx` (the toolbar from TB1).
- Check:
  - [x] On `/results`, the controls sit in the toolbar, don't move the grid head, and clearly do nothing yet.
- Risk: Becky's earlier treatment (A4) replaces this when it arrives, so keep it plain and easy to swap.

### Filters

**F1. Remove Excludes everywhere** [x] `711fea0`
- Build:
  - Drop the IS / IS NOT dropdown from a filter chip. It reads "IS" as plain text, or nothing.
  - Drop the excluding Miller column (the "Excludes" header, minus counts and negative fills).
  - Drop `setFilterMode`.
  - Rewrite `workedQuery` without its exclude clause and drop the two excluded authored clauses.
  - The resolver reports negating phrases ("exclude", "but not") through the existing not-found notice rather than building a clause.
- Files: `components/ResolvedFilters.tsx:527-572`, `components/MillerColumn.tsx:43-46`, `:136-148`, `:233-284`, `:362`, `components/ManualSearch.tsx:100`, `components/PrototypeShell.tsx:231-237`, `data.ts:278-279`, `:350-386`, `resolve.ts:775-830`, `results.ts:251` and `:280`, `examples.ts` (check the `$$` examples).
- Check:
  - [x] No chip on `/filters` or `/results` offers "is not".
  - [x] No Miller column says "Excludes".
  - [x] Typing "… but not in Austria" shows "Austria … not found" instead of a red clause.
  - [x] The `/filters` and `/results` counts are still sensible.
- Risk: it changes the worked query and the seeded counts, including the 356 in `flow.ts:62`. Re-check the Sprint 5 test scenario against the new numbers.

**F2. Realistic quick-apply results from the tree** [x] `1698eaf` — partial: therapy areas all ≥3 indications; regions/deeper levels wait on A5/A6 (geography left alone to keep test counts)
- Build: grow the sample so each common therapy area spans several indications and each region several countries. Ticking a parent (Cardiovascular, Europe) then returns a believable spread in the Indication and Geography columns, with a count to match.
- Files: `results.ts` (sample rows and `filterReaders`), `data.ts` (tree).
- Check:
  - [x] Ticking Cardiovascular gives rows across at least three indications.
  - [x] Ticking Europe includes United Kingdom, France and Germany rows.
  - [x] The testing scenario's five filters still land 12–15 rows.
- Risk: depends on M4 for structure and A5 / A6 for depth. Build it with the two in-repo trees first.

### Docs

**D1. Logic notes** [x] `e283f86`
- Build: a dated `sprints/sprint-4/DECISIONS.md` entry covering:
  - Add filter → tray at Drugs.
  - Edit filter → tray at area › attribute, values ticked; it opens the drawer if it's closed and switches to Advanced if Quick is on.
  - The chip dropdown stays a quick list.
  - Excludes removed.
  - Global nav cut to two, against Emma's note.
  - The panel state is now lifted.
  Also update `flow.ts` notes, `premise` and `lastUpdated`, and add a frame for Edit filter opening the tray.
- Check:
  - [x] The new frame is reachable from the Explorer.
  - [x] The entry reads as the logic Emma asked for.
- Risk: none.

---

## OPEN — Austin to decide (not in the build list)

- **OPEN-1. Inactive tab state.** Emma wants it reviewed, but CLAUDE.md fixes unselected tabs at `text-muted-foreground` and says to copy 1b, not restyle it. Change both 1b and 1c, or leave both?
- **OPEN-2. Empty Advanced state.** Emma wants three columns open. The transcript says only populated ones, with "no loads of empty states". With Drugs open by default there are two. Auto-open a default attribute (Therapy area?) to make three, or not?
- **OPEN-3. Past three columns.** Keep growing sideways (Emma) or keep three on screen and slide (the current behaviour, and one of Neil's two options)?
- **OPEN-4. Parent vs child selection in trees.** Neil's question: does ticking Cardiovascular select the parent value, or all its children? This sets how chips read and how F2 counts.
- **OPEN-5. Which number on a tree parent.** Result count (dynamic and costly) or child count ("21 values", cheap)? Neil favoured the cheap one, and Emma wants result counts in brackets.
- **OPEN-6. The top filter bar dropdown.** How deep it goes (Austin said 2 levels), type-ahead across every level ("Minnesota"), hover to bulk-select with "open in advanced search", and the phase-vs-1,500-targets mix. This is the internal ideation in A3, reviewed Tuesday.

The global nav conflict isn't open: the transcript settles it, and it goes into L1.

---

## 4. Out of scope or deferred

- **User testing plan.** Slide 10 wasn't presented and moves to Tue 6 Oct 12:00. SUS, NPS and the question set weren't discussed. Neil wants a wider audience, the same number of people end to end, and a listener link again.
- **No developers attended.** There's no feasibility verdict, and a developer review is a future session (A10).
- **The December production build.** The React rebuild and its timeline were taken offline (A9). The React components don't exist yet, and a design-system documentation step comes first.
- **Real grouping of the grid** (merged rows across companies, geographies and phases; unique-drug export). Neil: "I don't presume we solve this in this go-round."
- **Last-used tab as the default and bookmarking Advanced** for power users. Raised but not decided, and the landing page stays as it is.
- **Advanced on the landing page jumping straight to the builder on the results page.** Left as is (Emma: an empty builder there is overload).
- **Dynamic, query-aware counts in production.** That's a developer cost question; the prototype uses sample counts.
- **Working toward one prototype rather than two concurrent views** is a direction, not a build item for Tuesday.
